#!/bin/bash

echo "Stopping Minecraft Bedrock Server..."

# Send stop command to screen session
screen -S minecraft -X stuff "stop\n"

# Wait a bit then kill if still running
sleep 5
screen -S minecraft -X quit

echo "Server stopped"