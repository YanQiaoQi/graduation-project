export IMAGE_TAG=latest
export COMPOSE_PROJECT_NAME=net
export PATH=../bin:$PATH

# 通道名称
CHANNEL_NAME=mychannel
# 区块文件夹名称
ARTIFACTS_DIRECTORY=channel-artifacts
# 证书文件夹名称
CRYPTO_DIRECTORY=crypto-config

ORDERER_ADDRESS=$ORDERER_ADDRESS

function printHelp() {
    echo "Usage: "
    echo "  network.sh <mode>"
    echo "    <mode> - one of 'up', 'down', 'restart', 'generate'"
    echo "      - 'up' - bring up the network with docker-compose up"
    echo "      - 'down' - clear the network with docker-compose down"
    echo "      - 'generate' - generate required certificates and genesis block"
    echo "  network.sh -h (print this message)"
}

function generate(){
    # remove previous crypto material and config transactions
    rm -rf channel-artifacts
    rm -rf crypto-config
    
    # generate crypto material
    cryptogen generate --config=./crypto-config.yaml
    if [ "$?" -ne 0 ]; then
        echo "Failed to generate crypto material..."
        exit 1
    fi
    
    # generate genesis block for orderer
    mkdir $ARTIFACTS_DIRECTORY
    configtxgen -profile OneOrgOrdererGenesis -outputBlock ./$ARTIFACTS_DIRECTORY/genesis.block
    if [ "$?" -ne 0 ]; then
        echo "Failed to generate orderer genesis block..."
        exit 1
    fi
    
    # generate channel configuration transaction
    configtxgen -profile OneOrgChannel -outputCreateChannelTx ./$ARTIFACTS_DIRECTORY/channel.tx -channelID $CHANNEL_NAME
    if [ "$?" -ne 0 ]; then
        echo "Failed to generate channel configuration transaction..."
        exit 1
    fi
    
    # generate anchor peer transaction
    configtxgen -profile OneOrgChannel -outputAnchorPeersUpdate ./$ARTIFACTS_DIRECTORY/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP
    if [ "$?" -ne 0 ]; then
        echo "Failed to generate anchor peer update for Org1MSP..."
        exit 1
    fi
    
}

function netowrkUp(){
    # generate fixtures if they don't exist
    if [ ! -d "./$CRYPTO_DIRECTORY" || ! -d "./$ARTIFACTS_DIRECTORY" ]; then
        generate
    fi
    
    echo "清除环境"
    docker rm $(docker ps -aq) -f
    
    echo "网络启动"
    docker-compose up -d 2>&1
    docker ps -a
    
    if [ $? -ne 0 ]; then
        echo "ERROR !!!! Unable to start network"
        exit 1
    fi
    
    echo "创建通道"
    docker exec cli peer channel create -o $ORDERER_ADDRESS -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx
    
    echo "加入通道"
    docker exec cli peer channel join -b mychannel.block
}

function chaincode(){
    CC_RUNTIME_LANGUAGE=node
    CC_SRC_PATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode
    CC_NAME=myapp
    
    echo "安装链码"
    docker exec cli peer chaincode install -n $CC_NAME -v 1.0 -p "$CC_SRC_PATH" -l "$CC_RUNTIME_LANGUAGE"
    
    echo "实例化链码"
    docker exec cli peer chaincode instantiate -o $ORDERER_ADDRESS -C $CHANNEL_NAME -n $CC_NAME -l "$CC_RUNTIME_LANGUAGE" -v 1.0 -c '{"Args":[]}' -P "OR ('Org1MSP.member')"
    
    sleep 10
    echo "调用链码"
    docker exec cli peer chaincode invoke -o $ORDERER_ADDRESS -C $CHANNEL_NAME -n $CC_NAME -c '{"function":"test","Args":[]}'
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
    generate
else
    printHelp
    exit 1
fi