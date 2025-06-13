# Minecraft Bedrock Server with Discord Bot

A complete Minecraft Bedrock server setup with Discord bot management for GitHub Codespaces.

## Features

- 🎮 Full Minecraft Bedrock server
- 🤖 Discord bot with slash commands
- 📊 Real-time status monitoring
- 🔧 Server management (start/stop/restart)
- 💾 Automated backups
- 📋 Log monitoring
- 🌐 Web API endpoint
- ⏰ Scheduled restarts
- 🌍 **Custom world upload system**

## Setup Instructions

1. **Create Discord Bot:**

   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create new application
   - Go to Bot section and create bot
   - Copy token and save for later

2. **Setup Environment:**

   - Copy `.env.example` to `.env`
   - Fill in your Discord bot token and channel IDs
   - Add admin user IDs

3. **Start the Bot:**
   ```bash
   npm install
   npm start
   ```

## Discord Commands

- `/start` - Start the Minecraft server
- `/stop` - Stop the Minecraft server
- `/restart` - Restart the Minecraft server
- `/status` - Check server status
- `/players` - List online players
- `/say <message>` - Send message to server
- `/backup` - Create server backup
- `/logs` - View recent server logs

## World Management

### Interactive World Upload Tool

```bash
npm run world-upload
```

**Features:**

- 📦 Upload from ZIP files
- 📂 Upload from folders
- 🌐 Download from URLs
- 🗂️ List current worlds
- 🗑️ Delete worlds (with backup)
- 💾 Automatic backups before changes

### Command Line World Manager

```bash
# Make executable
chmod +x world-manager.sh

# List worlds
./world-manager.sh list

# Upload from ZIP
./world-manager.sh upload-zip ./my-world.zip custom-world

# Upload from folder
./world-manager.sh upload-folder ./world-folder my-world

# Download from URL
./world-manager.sh download https://example.com/world.zip awesome-world

# Backup world
./world-manager.sh backup my-world

# Delete world (creates backup first)
./world-manager.sh delete old-world
```

### World Upload Examples

**From ZIP file:**

```bash
# Interactive mode
npm run world-upload

# Command line
./world-manager.sh upload-zip ./downloads/amazing-world.zip amazing-world
```

**From URL:**

```bash
# Download popular worlds
./world-manager.sh download "https://example.com/survival-island.zip" survival-island
```

**From folder:**

```bash
# Local world folder
./world-manager.sh upload-folder ./my-local-world custom-name
```

## Web API

Access server status at: `http://localhost:3000`

## File Structure

```
minecraft-bedrock-discord-bot/
├── minecraft-server/
│   ├── worlds/              # All world files
│   └── server.properties    # Server configuration
├── backups/
│   └── worlds/              # World backups
├── logs/
├── upload-world.js          # Interactive world uploader
├── world-manager.sh         # Command line world manager
└── bot.js                   # Main Discord bot
```

## Notes

- Server runs on port 19132 (default Bedrock port)
- Logs are stored in `./logs/server.log`
- Backups are created in `./backups/` directory
- World backups are stored in `./backups/worlds/`
- Auto-restart every 6 hours (configurable)
- **World uploads automatically backup existing worlds**
- **Server must be stopped before uploading new worlds**

## World Upload Tips

1. **Supported Formats:**

   - ZIP files containing world data
   - Folder structures with world files
   - Direct download URLs

2. **Best Practices:**

   - Always backup before uploading new worlds
   - Stop the server before world changes
   - Use descriptive world names
   - Test worlds in single-player first

3. **World Sources:**

   - [MCPEDL](https://mcpedl.com) - Popular Bedrock maps
   - [Planet Minecraft](https://planetminecraft.com) - Community worlds
   - Custom worlds from Minecraft Education

4. **Troubleshooting:**
   - Ensure ZIP files contain proper world structure
   - Check file permissions after upload
   - Verify world name in server.properties
   - Review logs for any errors
