#!/bin/bash

# Update system
apt-get update && apt-get upgrade -y

# Install dependencies
apt-get install -y wget unzip curl screen htop

# Install Node.js dependencies
npm install

# Download Minecraft Bedrock Server
mkdir -p minecraft-server
cd minecraft-server
wget https://minecraft.azureedge.net/bin-linux/bedrock-server-1.20.81.01.zip
unzip bedrock-server-1.20.81.01.zip
chmod +x bedrock_server
cd ..

# Make scripts executable
chmod +x start-server.sh
chmod +x stop-server.sh

echo "Setup complete! Run 'npm start' to start the bot."