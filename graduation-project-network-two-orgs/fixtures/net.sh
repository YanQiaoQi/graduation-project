export IMAGE_TAG=latest
export COMPOSE_PROJECT_NAME=graduation-project-network
export PATH=../bin:$PATH

# cd /src/github.com/hyperledger/fabric/project/graduation-project/graduation-project-network

# 获取 wsl ip
# ip addr | grep eth0
# 172.18.119.135

# 本机 ip
# 172.18.112.1

chmod +u+x ../bin/*

# 系统通道名称
SYS_CHANNEL=syschannel
# 通道名称
CHANNEL_NAME=mychannel

# 区块文件夹名称
ARTIFACTS_DIRECTORY=channel-artifacts
# 证书文件夹名称
CRYPTO_DIRECTORY=crypto-config

ORDERER_ADDRESS=orderer.example.com:7050



function printHelp() {
    echo "Usage: "
    echo "  network.sh <mode>"
    echo "    <mode> - one of 'up', 'down', 'restart', 'generate'"
    echo "      - 'up' - bring up the network with docker-compose up"
    echo "      - 'down' - clear the network with docker-compose down"
    echo "      - 'generate' - generate required certificates and genesis block"
    echo "  network.sh -h (print this message)"
}

# 生成证书
function generateCerts(){
    # remove previous crypto material and config transactions
    rm -rf crypto-config
    # generate crypto material
    set -x
    cryptogen generate --config=./crypto-config.yaml
    res=$?
    set +x
    if [ "$res" -ne 0 ]; then
        echo "Failed to generate crypto material..."
        exit 1
    fi
    
    
}

# 生成初始区块
function generateChannelArtifacts(){
    rm -rf $ARTIFACTS_DIRECTORY/*.block $ARTIFACTS_DIRECTORY/*.tx
    
    # 生成创世区块
    set -x
    configtxgen -profile TwoOrgsOrdererGenesis -outputBlock ./$ARTIFACTS_DIRECTORY/genesis.block -channelID $SYS_CHANNEL
    # configtxgen -profile TwoOrgsOrdererGenesis -outputBlock ./channel-artifacts/genesis.block -channelID syschannel
    res=$?
    set +x
    if [ "$res" -ne 0 ]; then
        echo "失败！！！：创建创世区块失败"
        exit 1
    fi
    
    # 生成通道配置区块
    set -x
    configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./$ARTIFACTS_DIRECTORY/channel.tx -channelID $CHANNEL_NAME
    # configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID mychannel
    res=$?
    set +x
    if [ "$res" -ne 0 ]; then
        echo "失败！！！：创建通道配置区块失败"
        exit 1
    fi
    
    # 生成 org1 锚节点
    set -x
    configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./$ARTIFACTS_DIRECTORY/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP
    # configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID mychannel -asOrg Org1MSP
    res=$?
    set +x
    if [ "$res" -ne 0 ]; then
        echo "失败！！！：创建 org1 锚节点失败"
        exit 1
    fi
    
    # 生成 org2 锚节点
    set -x
    configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./$ARTIFACTS_DIRECTORY/Org2MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org2MSP
    # configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID mychannel -asOrg Org2MSP
    res=$?
    set +x
    if [ "$res" -ne 0 ]; then
        echo "失败！！！：创建 org2 锚节点失败"
        exit 1
    fi
}

# ===================== 通道 =====================

# 加入通道
function joinChannel(){
    PEER=$1
    ORG=$2
    
    set -x
    docker exec cli$1$2 peer channel join -b $CHANNEL_NAME.block >&log.txt
    res=$?
    set +x
    cat log.txt
    if [ $res -ne 0]; then
        echo "peer${PEER}.org${ORG} failed to join the channel, Retry after 1 seconds"
        # sleep 1
        # joinChannel $PEER $ORG
    fi
}

function channel(){
    
    set -x
    docker exec cli01 peer channel create -o $ORDERER_ADDRESS -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx
    # docker exec cli01 peer channel create -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/channel.tx
    res=$?
    set +x
    
    for org in 1 2; do
        for peer in 0 1; do
            joinChannel $peer $org
            echo "===================== peer${peer}.org${org} joined channel '$CHANNEL_NAME' ===================== "
            sleep 1
            echo
        done
    done
}

# ===================== 链码 =====================

function chaincode(){
    CC_RUNTIME_LANGUAGE=golang
    CC_SRC_PATH=github.com/hyperledger/fabric/peer/chaincode
    CC_NAME=myapp
    CC_VERSION=1.0
    
    echo "安装链码"
    docker exec cli peer chaincode install -n $CC_NAME -v $CC_VERSION -p $CC_SRC_PATH -l $CC_RUNTIME_LANGUAGE
    # docker exec cli peer chaincode install -n myapp -v 1.0 -p github.com/hyperledger/fabric/peer/chaincode -l golang
    
    echo "实例化链码"
    docker exec cli peer chaincode instantiate -o $ORDERER_ADDRESS -C $CHANNEL_NAME -n $CC_NAME -l $CC_RUNTIME_LANGUAGE -v $CC_VERSION -c '{"Args":[]}' -P "OR ('Org1MSP.member')"
    # docker exec cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n myapp -l golang -v 1.0 -c '{"Args":[]}' -P "OR ('Org1MSP.member')"
    
    docker ps
    
    sleep 3
    
    # echo "调用链码"
    # docker exec cli peer chaincode invoke -o $ORDERER_ADDRESS -C $CHANNEL_NAME -n $CC_NAME -c '{"function":"storeDataHash","Args":["1","123456"]}'
    # docker exec cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n myapp -c '{"Args":["storeDataHash","1","123456"]}'
    
    # docker exec cli peer chaincode invoke -o $ORDERER_ADDRESS -C $CHANNEL_NAME -n $CC_NAME -c '{"function":"queryDataHash","Args":["1"]}'
    # docker exec cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n myapp -c '{"Args":["queryDataHash","1"]}'
}

# ===================== 网络 =====================

function networkUp(){
    # 证书
    export CA1_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/org1.example.com/ca && ls *_sk)
    export CA2_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/org2.example.com/ca && ls *_sk)
    
    echo "清除环境"
    docker rm $(docker ps -aq) -f
    generateChannelArtifacts
    
    echo "网络启动"
    docker-compose up -d 2>&1
    docker ps -a
    
    if [ $? -ne 0 ]; then
        echo "ERROR !!!! Unable to start network"
        exit 1
    fi
}

function networkDown(){
    echo "网络关闭"
    docker-compose down
}

MODE=$1
shift

if [ "${MODE}" == "up" ]; then
    networkUp
    elif [ "${MODE}" == "down" ]; then
    networkDown
    elif [ "${MODE}" == "generate" ]; then
    generateCerts
    generateChannelArtifacts
else
    printHelp
    exit 1
fi