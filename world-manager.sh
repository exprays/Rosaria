#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Paths
SERVER_PATH="./minecraft-server"
WORLDS_PATH="$SERVER_PATH/worlds"
BACKUP_PATH="./backups/worlds"
TEMP_PATH="./temp"

echo -e "${CYAN}🌍 Minecraft Bedrock World Manager${NC}"
echo -e "${YELLOW}=====================================${NC}"

# Check if server is running
check_server_running() {
    if pgrep -f "bedrock_server" > /dev/null; then
        echo -e "${RED}❌ Server is currently running!${NC}"
        echo -e "${YELLOW}Please stop the server before managing worlds.${NC}"
        exit 1
    fi
}

# Create necessary directories
setup_directories() {
    mkdir -p "$WORLDS_PATH"
    mkdir -p "$BACKUP_PATH"
    mkdir -p "$TEMP_PATH"
}

# List available worlds
list_worlds() {
    echo -e "${BLUE}📁 Available Worlds:${NC}"
    if [ -d "$WORLDS_PATH" ] && [ "$(ls -A $WORLDS_PATH)" ]; then
        ls -la "$WORLDS_PATH" | grep ^d | awk '{print "  " $9}' | grep -v "^\.$\|^\.\.$"
    else
        echo -e "${YELLOW}  No worlds found${NC}"
    fi
    echo
}

# Backup world
backup_world() {
    local world_name="$1"
    local world_path="$WORLDS_PATH/$world_name"
    
    if [ ! -d "$world_path" ]; then
        echo -e "${RED}❌ World '$world_name' not found${NC}"
        return 1
    fi
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_name="${world_name}_backup_${timestamp}"
    local backup_full_path="$BACKUP_PATH/$backup_name"
    
    echo -e "${YELLOW}💾 Creating backup of '$world_name'...${NC}"
    cp -r "$world_path" "$backup_full_path"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup created: $backup_name${NC}"
        return 0
    else
        echo -e "${RED}❌ Backup failed${NC}"
        return 1
    fi
}

# Upload world from ZIP
upload_zip() {
    local zip_path="$1"
    local world_name="$2"
    
    if [ ! -f "$zip_path" ]; then
        echo -e "${RED}❌ ZIP file not found: $zip_path${NC}"
        return 1
    fi
    
    if [ -z "$world_name" ]; then
        world_name=$(basename "$zip_path" .zip)
    fi
    
    local world_path="$WORLDS_PATH/$world_name"
    
    # Backup existing world if it exists
    if [ -d "$world_path" ]; then
        backup_world "$world_name"
        rm -rf "$world_path"
    fi
    
    echo -e "${YELLOW}📦 Extracting world from ZIP...${NC}"
    
    # Create temporary extraction directory
    local temp_extract="$TEMP_PATH/extract_$$"
    mkdir -p "$temp_extract"
    
    # Extract ZIP
    unzip -q "$zip_path" -d "$temp_extract"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to extract ZIP file${NC}"
        rm -rf "$temp_extract"
        return 1
    fi
    
    # Check if extraction created nested folders
    local extracted_items=($(ls "$temp_extract"))
    if [ ${#extracted_items[@]} -eq 1 ] && [ -d "$temp_extract/${extracted_items[0]}" ]; then
        # Move the nested folder to the correct location
        mv "$temp_extract/${extracted_items[0]}" "$world_path"
    else
        # Move all extracted content to the world folder
        mv "$temp_extract" "$world_path"
    fi
    
    # Clean up
    rm -rf "$temp_extract"
    
    echo -e "${GREEN}✅ World '$world_name' uploaded successfully${NC}"
    update_server_properties "$world_name"
}

# Upload world from folder
upload_folder() {
    local folder_path="$1"
    local world_name="$2"
    
    if [ ! -d "$folder_path" ]; then
        echo -e "${RED}❌ Folder not found: $folder_path${NC}"
        return 1
    fi
    
    if [ -z "$world_name" ]; then
        world_name=$(basename "$folder_path")
    fi
    
    local world_path="$WORLDS_PATH/$world_name"
    
    # Backup existing world if it exists
    if [ -d "$world_path" ]; then
        backup_world "$world_name"
        rm -rf "$world_path"
    fi
    
    echo -e "${YELLOW}📂 Copying world folder...${NC}"
    cp -r "$folder_path" "$world_path"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ World '$world_name' uploaded successfully${NC}"
        update_server_properties "$world_name"
    else
        echo -e "${RED}❌ Failed to copy world folder${NC}"
        return 1
    fi
}

# Download world from URL
download_world() {
    local url="$1"
    local world_name="$2"
    
    if [ -z "$url" ] || [ -z "$world_name" ]; then
        echo -e "${RED}❌ URL and world name are required${NC}"
        return 1
    fi
    
    local temp_file="$TEMP_PATH/download_${world_name}_$$.zip"
    
    echo -e "${YELLOW}🌐 Downloading world from URL...${NC}"
    wget -O "$temp_file" "$url"
    
    if [ $? -eq 0 ]; then
        upload_zip "$temp_file" "$world_name"
        rm -f "$temp_file"
    else
        echo -e "${RED}❌ Download failed${NC}"
        rm -f "$temp_file"
        return 1
    fi
}

# Delete world
delete_world() {
    local world_name="$1"
    local world_path="$WORLDS_PATH/$world_name"
    
    if [ ! -d "$world_path" ]; then
        echo -e "${RED}❌ World '$world_name' not found${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}⚠️  Are you sure you want to delete world '$world_name'? (y/N)${NC}"
    read -r confirmation
    
    if [[ $confirmation =~ ^[Yy]$ ]]; then
        # Create backup before deletion
        backup_world "$world_name"
        
        # Delete world
        rm -rf "$world_path"
        echo -e "${GREEN}✅ World '$world_name' deleted (backup created)${NC}"
    else
        echo -e "${YELLOW}❌ Deletion cancelled${NC}"
    fi
}

# Update server.properties
update_server_properties() {
    local world_name="$1"
    local properties_file="$SERVER_PATH/server.properties"
    
    if [ -f "$properties_file" ]; then
        sed -i "s/level-name=.*/level-name=$world_name/" "$properties_file"
        echo -e "${BLUE}🔧 Updated server.properties with world: $world_name${NC}"
    fi
}

# Show usage
show_usage() {
    echo -e "${CYAN}Usage: $0 <command> [options]${NC}"
    echo
    echo -e "${BLUE}Commands:${NC}"
    echo "  list                     - List all worlds"
    echo "  upload-zip <zip_path> [world_name] - Upload world from ZIP file"
    echo "  upload-folder <folder_path> [world_name] - Upload world from folder"
    echo "  download <url> <world_name> - Download and install world from URL"
    echo "  backup <world_name>      - Create backup of world"
    echo "  delete <world_name>      - Delete world (creates backup first)"
    echo
    echo -e "${BLUE}Examples:${NC}"
    echo "  $0 list"
    echo "  $0 upload-zip ./my-world.zip custom-world"
    echo "  $0 upload-folder ./world-folder my-world"
    echo "  $0 download https://example.com/world.zip awesome-world"
    echo "  $0 backup my-world"
    echo "  $0 delete old-world"
}

# Main script logic
main() {
    check_server_running
    setup_directories
    
    case "$1" in
        "list")
            list_worlds
            ;;
        "upload-zip")
            if [ -z "$2" ]; then
                echo -e "${RED}❌ ZIP file path required${NC}"
                show_usage
                exit 1
            fi
            upload_zip "$2" "$3"
            ;;
        "upload-folder")
            if [ -z "$2" ]; then
                echo -e "${RED}❌ Folder path required${NC}"
                show_usage
                exit 1
            fi
            upload_folder "$2" "$3"
            ;;
        "download")
            if [ -z "$2" ] || [ -z "$3" ]; then
                echo -e "${RED}❌ URL and world name required${NC}"
                show_usage
                exit 1
            fi
            download_world "$2" "$3"
            ;;
        "backup")
            if [ -z "$2" ]; then
                echo -e "${RED}❌ World name required${NC}"
                show_usage
                exit 1
            fi
            backup_world "$2"
            ;;
        "delete")
            if [ -z "$2" ]; then
                echo -e "${RED}❌ World name required${NC}"
                show_usage
                exit 1
            fi
            delete_world "$2"
            ;;
        *)
            show_usage
            ;;
    esac
}

# Run main function with all arguments
main "$@"