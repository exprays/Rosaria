#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Banner
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║           🎮 Minecraft Bedrock Server Setup 🎮           ║"
echo "║                  with Discord Bot                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Error handling function
handle_error() {
    echo -e "${RED}❌ Error: $1${NC}"
    echo -e "${YELLOW}💡 Suggestion: $2${NC}"
    exit 1
}

# System Update
echo -e "${YELLOW}📦 Step 1: Updating system packages...${NC}"
if apt-get update && apt-get upgrade -y > /dev/null 2>&1; then
    echo -e "${GREEN}✅ System packages updated successfully${NC}"
else
    echo -e "${YELLOW}⚠️  System update had some issues, continuing...${NC}"
fi

# Install Dependencies
echo -e "${YELLOW}🔧 Step 2: Installing dependencies...${NC}"
echo -e "${BLUE}   Installing: wget, unzip, curl, screen, htop${NC}"
if apt-get install -y wget unzip curl screen htop > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    handle_error "Failed to install dependencies" "Check your internet connection and try again"
fi

# Node.js Dependencies
echo -e "${YELLOW}📦 Step 3: Installing Node.js dependencies...${NC}"
if npm install; then
    echo -e "${GREEN}✅ Node.js dependencies installed${NC}"
else
    handle_error "Failed to install Node.js dependencies" "Run 'npm cache clean --force' and try again"
fi

# Create directory structure
echo -e "${YELLOW}📁 Step 4: Creating directory structure...${NC}"
mkdir -p minecraft-server
mkdir -p logs
mkdir -p backups/worlds
mkdir -p temp
echo -e "${GREEN}✅ Directory structure created${NC}"

# Download Minecraft Bedrock Server
echo -e "${YELLOW}⬇️  Step 5: Downloading Minecraft Bedrock Server...${NC}"
cd minecraft-server

# Check if server already exists
if [ -f "bedrock_server" ]; then
    echo -e "${BLUE}ℹ️  Bedrock server already exists, skipping download${NC}"
else
    echo -e "${CYAN}🌐 Trying multiple download sources...${NC}"
    
    # Array of download URLs to try
    DOWNLOAD_URLS=(
        "https://www.minecraft.net/bedrockdedicatedserver/bin-linux/bedrock-server-1.21.84.1.zip"
    )
    
    DOWNLOAD_SUCCESS=false
    
    for url in "${DOWNLOAD_URLS[@]}"; do
        filename=$(basename "$url")
        echo -e "${BLUE}📊 Trying: ${filename}${NC}"
        
        # Download with progress bar and timeout
        if wget --progress=bar:force:noscroll \
               --show-progress \
               --timeout=30 \
               --tries=3 \
               --continue \
               -O "$filename" \
               "$url" 2>&1; then
            
            echo -e "${GREEN}✅ Download completed: ${filename}${NC}"
            
            # Verify file was downloaded and is not empty
            if [ -s "$filename" ]; then
                echo -e "${YELLOW}📦 Extracting server files...${NC}"
                
                if unzip -q "$filename"; then
                    echo -e "${GREEN}✅ Server files extracted successfully${NC}"
                    
                    # Make server executable
                    if [ -f "bedrock_server" ]; then
                        chmod +x bedrock_server
                        echo -e "${GREEN}✅ Server permissions set${NC}"
                        
                        # Clean up zip file
                        rm "$filename"
                        echo -e "${BLUE}🗑️  Cleaned up installation files${NC}"
                        
                        DOWNLOAD_SUCCESS=true
                        break
                    else
                        echo -e "${RED}❌ bedrock_server not found in archive${NC}"
                        rm "$filename"
                    fi
                else
                    echo -e "${RED}❌ Failed to extract ${filename}${NC}"
                    rm "$filename"
                fi
            else
                echo -e "${RED}❌ Downloaded file is empty or corrupted${NC}"
                rm "$filename"
            fi
        else
            echo -e "${RED}❌ Download failed for ${filename}${NC}"
        fi
    done
    
    if [ "$DOWNLOAD_SUCCESS" = false ]; then
        echo -e "${RED}❌ All download attempts failed${NC}"
        echo -e "${YELLOW}💡 Manual download instructions:${NC}"
        echo -e "${BLUE}1. Go to: https://www.minecraft.net/download/server/bedrock${NC}"
        echo -e "${BLUE}2. Download the Linux server zip file${NC}"
        echo -e "${BLUE}3. Upload it to this directory: $(pwd)${NC}"
        echo -e "${BLUE}4. Extract with: unzip <filename>.zip${NC}"
        echo -e "${BLUE}5. Set permissions: chmod +x bedrock_server${NC}"
        echo
        echo -e "${CYAN}Alternative: Try running this script again later${NC}"
        cd ..
        exit 1
    fi
fi

cd ..

# Make scripts executable
echo -e "${YELLOW}🔧 Step 6: Setting up scripts...${NC}"
scripts=(
    "start-server.sh"
    "stop-server.sh" 
    "world-manager.sh"
)

for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        chmod +x "$script"
        echo -e "${GREEN}  ✅ ${script} - executable${NC}"
    else
        echo -e "${YELLOW}  ⚠️  ${script} - not found (will be created later)${NC}"
    fi
done

# Create default server.properties if it doesn't exist
echo -e "${YELLOW}⚙️  Step 7: Configuring server...${NC}"
if [ ! -f "minecraft-server/server.properties" ]; then
    cat > minecraft-server/server.properties << EOF
server-name=My Bedrock Server
gamemode=survival
force-gamemode=false
difficulty=easy
allow-cheats=false
max-players=10
online-mode=true
allow-list=false
server-port=19132
server-portv6=19133
view-distance=32
tick-distance=4
player-idle-timeout=30
max-threads=8
level-name=Bedrock level
level-seed=
default-player-permission-level=member
texturepack-required=false
content-log-file-enabled=false
compression-threshold=1
server-authoritative-movement=server-auth
player-movement-score-threshold=20
player-movement-distance-threshold=0.3
player-movement-duration-threshold-in-ms=500
correct-player-movement=false
server-authoritative-block-breaking=false
EOF
    echo -e "${GREEN}✅ Default server.properties created${NC}"
else
    echo -e "${BLUE}ℹ️  server.properties already exists${NC}"
fi

# Create additional required files if they don't exist
echo -e "${YELLOW}📝 Step 8: Creating additional configuration files...${NC}"

# Create allowlist.json
if [ ! -f "minecraft-server/allowlist.json" ]; then
    echo "[]" > minecraft-server/allowlist.json
    echo -e "${GREEN}  ✅ allowlist.json created${NC}"
fi

# Create permissions.json
if [ ! -f "minecraft-server/permissions.json" ]; then
    echo "[]" > minecraft-server/permissions.json
    echo -e "${GREEN}  ✅ permissions.json created${NC}"
fi

# Final checks
echo -e "${YELLOW}🔍 Step 9: Performing final checks...${NC}"

# Check if all required files exist
required_files=(
    "minecraft-server/bedrock_server"
    "minecraft-server/server.properties"
)

all_good=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✅ ${file}${NC}"
    else
        echo -e "${RED}  ❌ ${file} - missing${NC}"
        all_good=false
    fi
done

# Check .env file
if [ -f ".env" ]; then
    echo -e "${GREEN}  ✅ .env file exists${NC}"
    if grep -q "your_discord_server_id" .env; then
        echo -e "${YELLOW}  ⚠️  Please update .env with your Discord credentials${NC}"
    fi
else
    echo -e "${YELLOW}  ⚠️  .env file not found - please create from .env.example${NC}"
fi

# Final status
echo
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════╗${NC}"
if [ "$all_good" = true ]; then
    echo -e "${PURPLE}║${GREEN}                    ✅ SETUP COMPLETE! ✅                    ${PURPLE}║${NC}"
else
    echo -e "${PURPLE}║${YELLOW}                  ⚠️  SETUP INCOMPLETE ⚠️                   ${PURPLE}║${NC}"
fi
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════╝${NC}"

echo
echo -e "${CYAN}📋 Next Steps:${NC}"
echo -e "${BLUE}1.${NC} Update your .env file with Discord credentials"
echo -e "${BLUE}2.${NC} Run: ${GREEN}npm start${NC} to start the Discord bot"
echo -e "${BLUE}3.${NC} Use ${GREEN}/start${NC} command in Discord to start the server"
echo
echo -e "${YELLOW}📖 For detailed instructions, check README.md${NC}"

# Show system info
echo -e "${CYAN}💻 System Information:${NC}"
echo -e "${BLUE}  • OS:${NC} $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo -e "${BLUE}  • Architecture:${NC} $(uname -m)"
echo -e "${BLUE}  • Node.js:${NC} $(node --version 2>/dev/null || echo 'Not found')"
echo -e "${BLUE}  • npm:${NC} $(npm --version 2>/dev/null || echo 'Not found')"
echo -e "${BLUE}  • Available space:${NC} $(df -h . | tail -1 | awk '{print $4}')"
echo