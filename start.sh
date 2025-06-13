#!/bin/bash

echo "Starting Minecraft Bedrock Server..."

cd minecraft-server

# Check if server exists
if [ ! -f "bedrock_server" ]; then
    echo "Server not found! Please run setup.sh first."
    exit 1
fi

# Start server in screen session
screen -dmS minecraft ./bedrock_server

echo "Server started in screen session 'minecraft'"
echo "Use 'screen -r minecraft' to attach to the server console"