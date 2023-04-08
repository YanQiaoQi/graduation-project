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

function generateCrypto(){
    # remove previous crypto material and config transactions
    rm -rf crypto-config
    # generate crypto material
    cryptogen generate --config=./crypto-config.yaml
    if [ "$?" -ne 0 ]; then
        echo "Failed to generate crypto material..."
        exit 1
    fi
    
    
}

function generateConfig(){
    rm -rf channel-artifacts
    # generate genesis block for orderer
    mkdir $ARTIFACTS_DIRECTORY
    configtxgen -profile OneOrgOrdererGenesis -outputBlock ./$ARTIFACTS_DIRECTORY/genesis.block
    # configtxgen -profile OneOrgOrdererGenesis -outputBlock ./channel-artifacts/genesis.block
    if [ "$?" -ne 0 ]; then
        echo "Failed to generate orderer genesis block..."
        exit 1
    fi
    
    # generate channel configuration transaction
    configtxgen -profile OneOrgChannel -outputCreateChannelTx ./$ARTIFACTS_DIRECTORY/channel.tx -channelID $CHANNEL_NAME
    # configtxgen -profile OneOrgChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID mychannel
    if [ "$?" -ne 0 ]; then
        echo "Failed to generate channel configuration transaction..."
        exit 1
    fi
    
    # generate anchor peer transaction
    configtxgen -profile OneOrgChannel -outputAnchorPeersUpdate ./$ARTIFACTS_DIRECTORY/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP
    # configtxgen -profile OneOrgChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID mychannel -asOrg Org1MSP
    if [ "$?" -ne 0 ]; then
        echo "Failed to generate anchor peer update for Org1MSP..."
        exit 1
    fi
    
}

function networkUp(){
    # generate fixtures if they don't exist
    echo "清除环境"
    docker rm $(docker ps -aq) -f
    generateConfig
    
    echo "网络启动"
    docker-compose up -d 2>&1
    docker ps -a
    
    if [ $? -ne 0 ]; then
        echo "ERROR !!!! Unable to start network"
        exit 1
    fi
    
    echo "创建通道"
    docker exec cli peer channel create -o $ORDERER_ADDRESS -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx
    # docker exec cli peer channel create -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/channel.tx
    
    echo "加入通道"
    docker exec cli peer channel join -b mychannel.block
}

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

function networkDown(){
    echo "网络关闭"
    docker-compose down
}

MODE=$1
shift

if [ "${MODE}" == "up" ]; then
    networkUp
    chaincode
    elif [ "${MODE}" == "down" ]; then
    networkDown
    elif [ "${MODE}" == "generate" ]; then
    generateCrypto
    generateConfig
else
    printHelp
    exit 1
fi