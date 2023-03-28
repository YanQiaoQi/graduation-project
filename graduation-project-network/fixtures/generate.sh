# 生成鉴权证书
function generateCerts() {
    which cryptogen
    if [ "$?" -ne 0 ]; then
        echo "cryptogen tool not found. "
        echo "now, set path of cryptogen tool."
        export PATH=/src/github.com/hyperledger/fabric/fabric-samples/bin:$PATH
    fi
    
    echo "##########################################################"
    echo "##### Generate certificates using cryptogen tool #########"
    echo "##########################################################"
    
    if [ -d "crypto-config" ]; then
        rm -Rf crypto-config
    fi
    
    set -x
    cryptogen generate --config=./crypto-config.yaml
    res=$?
    set +x
    
    if [ $res -ne 0 ]; then
        echo "Failed to generate certificates..."
        exit 1
    fi
    echo "Succeeded to generate certificates"
}

# 生成创世区块与channel配置区块
function generateChannelArtifacts() {
    which configtxgen
    if [ "$?" -ne 0 ]; then
        echo "configtxgen tool not found."
        echo "now, set path of cryptogen tool."
        export PATH=/src/github.com/hyperledger/fabric/fabric-samples/bin:$PATH
    fi
    
    # 生成 创世区块
    echo "##########################################################"
    echo "#########  Generating Orderer Genesis block ##############"
    echo "##########################################################"
    # Note: For some unknown reason (at least for now) the block file can't be
    # named orderer.genesis.block or the orderer will fail to launch!
    echo "CONSENSUS_TYPE=solo"

    set -x
    configtxgen -profile TwoOrgsOrdererGenesis -channelID genesisChannel -outputBlock ./channel-artifacts/genesis.block
    res=$?
    set +x

    if [ $res -ne 0 ]; then
        echo "Failed to generate orderer genesis block..."
        exit 1
    fi
    echo "Succeeded to generate genesis block"

    # 生成 channel 配置文件
    echo
    echo "#################################################################"
    echo "### Generating channel configuration transaction 'channel.tx' ###"
    echo "#################################################################"

    set -x
    configtxgen -profile TwoOrgsChannel -channelID mychannel -outputCreateChannelTx ./channel-artifacts/channel.tx 
    res=$?
    set +x
    
    if [ $res -ne 0 ]; then
        echo "Failed to generate channel configuration transaction..."
        exit 1
    fi
    echo "Succeeded to generate channel"

    # 生成锚节点配置更新文件
    echo
    echo "#################################################################"
    echo "#######    Generating anchor peer update for Org1MSP   ##########"
    echo "#################################################################"

    set -x
    configtxgen -profile TwoOrgsChannel -channelID mychannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -asOrg Org1MSP
    res=$?
    set +x

    if [ $res -ne 0 ]; then
        echo "Failed to generate anchor peer update for Org1MSP..."
        exit 1
    fi
    echo "Succeeded to generate anchor peer"
}

generateCerts
generateChannelArtifacts