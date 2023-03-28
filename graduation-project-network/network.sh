function printHelp() {
  echo "Usage: "
  echo "  network.sh <mode>"
  echo "    <mode> - one of 'up', 'down', 'restart', 'generate' or 'upgrade'"
  echo "      - 'up' - bring up the network with docker-compose up"
  echo "      - 'down' - clear the network with docker-compose down"
  echo "      - 'generate' - generate required certificates and genesis block"
  echo "  network.sh -h (print this message)"
}

function networkUp() {
    # generate artifacts if they don't exist
    if [ ! -d "./fixtures/crypto-config" ]; then
        ./fixtures/generate.sh
    fi

    docker-compose -f ./fixtures/docker-compose.yaml up -d 2>&1
    docker ps -a

    if [ $? -ne 0 ]; then
        echo "ERROR !!!! Unable to start network"
        exit 1
    fi
}

function networkDown() {

    docker-compose -f ./fixtures/docker-compose.yaml down
    # Don't remove the generated artifacts -- note, the ledgers are always removed
    if [ "$MODE" != "restart" ]; then
        rm -rf channel-artifacts/*.block channel-artifacts/*.tx crypto-config
    fi
}

MODE=$1
shift

if [ "${MODE}" == "up" ]; then
    networkUp
    elif [ "${MODE}" == "down" ]; then ## Clear the network
    networkDown
    elif [ "${MODE}" == "generate" ]; then ## Generate Artifacts
    ./fixtures/generate.sh
else
    printHelp
    exit 1
fi