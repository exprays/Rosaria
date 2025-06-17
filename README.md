# 🎮 Minecraft Bedrock Server with Discord Bot Manager

A comprehensive Discord bot for managing Minecraft Bedrock Edition servers with playit.gg tunnel support, automated backups, player monitoring, and web interface, everything on Github Codespaces!!!!!!!!!!

![Bot Banner](https://img.shields.io/badge/Minecraft-Bedrock-green) ![Discord.js](https://img.shields.io/badge/discord.js-v14-blue) ![Node.js](https://img.shields.io/badge/node.js-v18+-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue)

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Discord Bot Setup](#-discord-bot-setup)
- [Minecraft Server Setup](#-minecraft-server-setup)
- [Playit.gg Tunnel Setup](#-playitgg-tunnel-setup)
- [GitHub Codespace Setup](#-github-codespace-setup)
- [Railway Deployment](#-railway-deployment)
- [Commands](#-commands)
- [API Endpoints](#-api-endpoints)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🤖 Discord Bot Features

- **Server Management**: Start, stop, restart Minecraft server
- **Player Monitoring**: Real-time player count and status
- **Tunnel Management**: Integrated playit.gg tunnel control
- **Automated Backups**: Scheduled world backups
- **Live Console**: Real-time server logs in Discord
- **Admin Controls**: Permission-based command access
- **Status Dashboard**: Auto-updating server status embed

### 🌐 Tunnel & Networking

- **playit.gg Integration**: Automatic tunnel creation for external access
- **HTTP to UDP Conversion**: Convert GitHub Codespace HTTP ports to UDP
- **Multiple Connection Options**: Direct IP and tunnel support
- **Auto-detection**: Automatic tunnel URL parsing and display

### 🔧 System Features

- **Web API**: REST endpoints for server status
- **Auto-restart**: Scheduled server restarts
- **Error Handling**: Robust error recovery and logging
- **Cross-platform**: Works on Linux, Windows, and macOS

## 📋 Prerequisites

- **Node.js** v18.0.0 or higher
- **NPM** v8.0.0 or higher
- **Discord Bot Token** and Application ID
- **Minecraft Bedrock Server** files
- **playit.gg Account** (for tunnel functionality)

## 🚀 Quick Start

1. **Clone the repository:**

```bash
git clone https://github.com/exprays/minebay.git
cd minebay
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create environment file:**

```bash
cp .env.example .env
```

4. **Configure your `.env` file** (see [Configuration](#-configuration))

5. **Start the bot:**

```bash
npm start
```

## 🌍 Environment Setup

### Local Development

```bash
# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### GitHub Codespaces

The bot is optimized for GitHub Codespaces with automatic port forwarding and tunnel management.

## 📦 Installation

### 1. Clone and Install

```bash
git clone https://github.com/exprays/minebay.git
cd minebay
npm install
```

### 2. Directory Structure

```
minecraft-bedrock-bot/
├── bot.js                 # Main bot file
├── package.json           # Dependencies
├── .env.example          # Environment template
├── .env                  # Your configuration (create this)
├── logs/                 # Bot and server logs
├── backups/              # Automatic backups
├── minecraft-server/     # Minecraft server files
│   ├── bedrock_server    # Server executable
│   ├── server.properties # Server configuration
│   └── worlds/           # World data
└── README.md
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
GUILD_ID=your_discord_server_id_here
CLIENT_ID=your_discord_app_client_id_here

# Discord Channel IDs
STATUS_CHANNEL_ID=channel_id_for_status_updates
CONSOLE_CHANNEL_ID=channel_id_for_console_logs

# Admin Configuration
ADMIN_IDS=user_id_1,user_id_2,user_id_3

# Server Configuration
MAX_PLAYERS=10
WEB_PORT=3000

# Optional: Custom paths
MINECRAFT_SERVER_PATH=./minecraft-server
BACKUP_PATH=./backups
```

### `.env.example` Template

```env
# Discord Bot Settings
DISCORD_TOKEN=your_bot_token_here
GUILD_ID=your_server_id_here
CLIENT_ID=your_app_id_here

# Channel Configuration
STATUS_CHANNEL_ID=your_status_channel_id
CONSOLE_CHANNEL_ID=your_console_channel_id

# Admin Users (comma-separated Discord user IDs)
ADMIN_IDS=123456789012345678,987654321098765432

# Server Settings
MAX_PLAYERS=10
WEB_PORT=3000
```

## 🤖 Discord Bot Setup

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Name your application (e.g., "Minecraft Server Bot")
4. Go to **"Bot"** section
5. Click **"Add Bot"**
6. Copy the **Token** (keep this secret!)

### 2. Configure Bot Permissions

In the **OAuth2** → **URL Generator** section:

**Scopes:**

- ✅ `bot`
- ✅ `applications.commands`

**Bot Permissions:**

- ✅ Send Messages
- ✅ Use Slash Commands
- ✅ Embed Links
- ✅ Read Message History
- ✅ Manage Messages

### 3. Invite Bot to Server

1. Generate invite URL with the permissions above
2. Open the URL and select your Discord server
3. Authorize the bot

### 4. Get Required IDs

#### Server (Guild) ID:

1. Enable **Developer Mode** in Discord Settings
2. Right-click your server → **Copy ID**

#### Channel IDs:

1. Right-click the channel → **Copy ID**
2. You need IDs for:
   - **Status Channel**: Where server status updates appear
   - **Console Channel**: Where server logs appear

#### User IDs (for admins):

1. Right-click a user → **Copy ID**

## 🎮 Minecraft Server Setup

### 1. Download Minecraft Bedrock Server

```bash
# Create server directory
mkdir minecraft-server
cd minecraft-server

# Download latest Bedrock server (Linux)
wget https://minecraft.azureedge.net/bin-linux/bedrock-server-1.20.x.x.zip
# or you can just download it from the official website and paste it on your codespace folder with the above directory structure

# Extract
unzip bedrock-server-*.zip

# Make executable
chmod +x bedrock_server

# Return to main directory
cd ..
```

### 2. Configure Server Properties

Edit `minecraft-server/server.properties`:

```properties
server-name=My Minecraft Server
gamemode=survival
difficulty=easy
allow-cheats=false
max-players=10
online-mode=true
white-list=false
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
```

### 3. Test Server

```bash
# Test server startup
cd minecraft-server
./bedrock_server

# Server should start and show:
# "Server started."
# Press Ctrl+C to stop
```

## 🌐 Playit.gg Tunnel Setup

### 1. Install playit.gg

#### Linux/GitHub Codespaces:

```bash
# Download playit
wget https://playit.gg/downloads/playit-linux_64 -O playit

# Make executable
chmod +x playit

# Move to system path (optional)
sudo mv playit /usr/local/bin/

# Or keep in project directory
# ./playit
```

#### Windows:

```bash
# Download Windows version
curl -O https://playit.gg/downloads/playit-windows_64.exe
```

### 2. First-time Setup

```bash
# Run playit to create account/claim tunnel
playit

# Follow the prompts to:
# 1. Create account or login
# 2. Claim a tunnel
# 3. Configure for Minecraft Bedrock (UDP port 19132)
```

### 3. Configure for Minecraft

1. Run `playit` manually first
2. Visit the claim URL shown in console
3. Configure tunnel:
   - **Protocol**: UDP
   - **Local Port**: 19132
   - **Game**: Minecraft Bedrock

### 4. GitHub Codespace HTTP to UDP Conversion

**Problem**: GitHub Codespaces only forward HTTP ports, but Minecraft needs UDP.

**Solution**: Use playit.gg to convert HTTP to UDP:

```bash
# In your codespace, your server runs on localhost:19132 (UDP)
# But codespace only exposes HTTP ports publicly

# playit.gg creates a tunnel:
# External: your-tunnel.playit.gg:port (UDP) → localhost:19132 (UDP)

# This bypasses the HTTP limitation!
```

#### Setup Process:

1. **Start your Minecraft server** in codespace
2. **Start playit tunnel**: `/tunnel start` in Discord
3. **playit.gg detects** the local UDP server
4. **Creates external UDP endpoint** that players can connect to
5. **Bot automatically detects** and displays the tunnel URL

#### Example Flow:

```
Player → your-tunnel.playit.gg:7255 (UDP) → playit.gg servers → GitHub Codespace → localhost:19132 (UDP) → Minecraft Server
```

## 💻 GitHub Codespace Setup

### 1. Create Codespace

1. **Fork/Clone** this repository to your GitHub
2. **Open in Codespace**: Click **Code** → **Codespaces** → **Create codespace**
3. **Wait for setup** (automatic dependency installation)

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
code .env
```

### 3. Setup Minecraft Server

```bash
# Download and setup Minecraft server
chmod +x setup.sh
./setup.sh
```

### 4. Install playit.gg

```bash
# Install playit for tunnel functionality
wget https://playit.gg/downloads/playit-linux_64 -O playit
chmod +x playit
```

### 5. Start Everything

```bash
# Start the bot (this also starts web server)
npm start

# In Discord, use commands:
# /start - Start Minecraft server
# /tunnel start - Start playit tunnel
# /status - Check everything is working
```

### 6. Port Forwarding

**Automatic**: Codespace automatically forwards port 3000 (web interface)

**Manual**: If needed, forward port 19132:

1. **Ports tab** in codespace
2. **Add port**: 19132
3. **Visibility**: Public

**Note**: Minecraft UDP traffic won't work through Codespace HTTP forwarding - that's why we use playit.gg!

## 🚄 Railway Deployment

Deploy your bot to Railway for 24/7 uptime (500 hours free/month).

### 1. Prepare for Deployment

#### Create Required Files:

**`Procfile`:**

```
web: node bot.js
```

**`railway.json`:**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

**Update `package.json`:**

```json
{
  "name": "minebay",
  "version": "1.0.0",
  "description": "Minecraft Bedrock Server with Discord Bot Manager",
  "main": "bot.js",
  "scripts": {
    "start": "node bot.js",
    "dev": "nodemon bot.js"
  },
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
    "discord.js": "^14.14.1",
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "chalk": "^4.1.2",
    "figlet": "^1.7.0",
    "moment": "^2.29.4",
    "node-cron": "^3.0.3"
  },
  "keywords": ["minecraft", "discord", "bot", "server", "bedrock"],
  "author": "Your Name",
  "license": "MIT"
}
```

### 2. Deploy to Railway

#### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**:

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

2. **Connect to Railway**:

   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your repository

3. **Configure Environment Variables**:
   - Go to **Variables** tab
   - Add all variables from your `.env` file:
   ```
   DISCORD_TOKEN=your_token_here
   GUILD_ID=your_guild_id
   CLIENT_ID=your_client_id
   STATUS_CHANNEL_ID=your_status_channel
   CONSOLE_CHANNEL_ID=your_console_channel
   ADMIN_IDS=user_id_1,user_id_2
   MAX_PLAYERS=10
   ```

#### Method 2: Railway CLI

1. **Install Railway CLI**:

```bash
npm install -g @railway/cli
```

2. **Login and Deploy**:

```bash
# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### 3. Post-Deployment Setup

#### Install playit.gg on Railway:

Add this to your `bot.js` or create a startup script:

```javascript
// Add to bot initialization
async setupPlayit() {
  try {
    console.log("📥 Installing playit.gg...");

    // Download playit
    exec("wget https://playit.gg/downloads/playit-linux_64 -O playit && chmod +x playit", (error) => {
      if (error) {
        console.error("Failed to install playit:", error);
      } else {
        console.log("✅ playit.gg installed successfully");
      }
    });
  } catch (error) {
    console.error("Error setting up playit:", error);
  }
}
```

#### Configure Minecraft Server:

Create `setup-server.sh`:

```bash
#!/bin/bash
echo "🎮 Setting up Minecraft Bedrock Server..."

# Create server directory
mkdir -p minecraft-server
cd minecraft-server

# Download server if not exists
if [ ! -f "bedrock_server" ]; then
    echo "📥 Downloading Minecraft Bedrock Server..."
    wget -q https://minecraft.azureedge.net/bin-linux/bedrock-server-1.20.81.01.zip
    unzip -q bedrock-server-*.zip
    chmod +x bedrock_server
    rm bedrock-server-*.zip
    echo "✅ Server downloaded and configured"
fi

cd ..
echo "🚀 Setup complete!"
```

### 4. Railway Configuration

#### Environment Variables:

```bash
# Required
DISCORD_TOKEN=your_discord_bot_token
GUILD_ID=your_discord_server_id
CLIENT_ID=your_discord_app_client_id
STATUS_CHANNEL_ID=your_status_channel_id
CONSOLE_CHANNEL_ID=your_console_channel_id
ADMIN_IDS=comma_separated_user_ids

# Optional
MAX_PLAYERS=10
WEB_PORT=3000
NODE_ENV=production
```

#### Custom Start Command:

```bash
# If you need custom startup
chmod +x setup-server.sh && ./setup-server.sh && node bot.js
```

### 5. Monitoring Railway Deployment

1. **View Logs**: Railway dashboard → Deployments → View logs
2. **Monitor Resources**: Check CPU/Memory usage
3. **Custom Domain**: Add custom domain in settings (optional)

### 6. Railway + playit.gg Setup

Once deployed on Railway:

1. **Bot starts automatically**
2. **Use Discord commands**:
   ```
   /start        # Start Minecraft server
   /tunnel start # Start playit tunnel
   /status       # Check everything is running
   ```
3. **playit.gg creates tunnel** for external access
4. **Share tunnel URL** with players

## 🎯 Commands

### Admin Commands

| Command         | Description              | Usage                 |
| --------------- | ------------------------ | --------------------- |
| `/start`        | Start Minecraft server   | `/start`              |
| `/stop`         | Stop Minecraft server    | `/stop`               |
| `/restart`      | Restart Minecraft server | `/restart`            |
| `/say`          | Send message to server   | `/say Hello players!` |
| `/backup`       | Create world backup      | `/backup`             |
| `/tunnel start` | Start playit.gg tunnel   | `/tunnel start`       |
| `/tunnel stop`  | Stop tunnel              | `/tunnel stop`        |

### Public Commands

| Command          | Description         | Usage            |
| ---------------- | ------------------- | ---------------- |
| `/status`        | Check server status | `/status`        |
| `/players`       | List online players | `/players`       |
| `/connect`       | Get connection info | `/connect`       |
| `/tunnel status` | Check tunnel status | `/tunnel status` |
| `/tunnel url`    | Get tunnel URL      | `/tunnel url`    |
| `/ping`          | Check bot latency   | `/ping`          |

### Debug Commands

| Command        | Description            | Usage          |
| -------------- | ---------------------- | -------------- |
| `/logs`        | Get recent server logs | `/logs`        |
| `/tunnel logs` | Get tunnel debug logs  | `/tunnel logs` |

## 🌐 API Endpoints

The bot includes a web API for external integrations:

### GET `/`

Get server and tunnel status:

```json
{
  "server": {
    "status": "online",
    "players": 2,
    "maxPlayers": 10,
    "uptime": "2h 34m"
  },
  "tunnel": {
    "status": "online",
    "url": "example.playit.gg:7255",
    "service": "playit.gg"
  }
}
```

### GET `/ping`

Health check endpoint:

```json
{
  "status": "alive",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "server": "online",
  "tunnel": "online"
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Bot Not Responding

```bash
# Check if bot is running
ps aux | grep node

# Check logs
tail -f logs/server.log

# Restart bot
npm start
```

#### 2. Commands Return "Application Not Responding"

- **Cause**: Bot process stopped
- **Solution**: Restart the bot or deploy to always-on service

#### 3. Tunnel URL Not Detected

```bash
# Check playit output
/tunnel logs

# Manual check
./playit

# Common issue: playit not installed
wget https://playit.gg/downloads/playit-linux_64 -O playit
chmod +x playit
```

#### 4. Server Won't Start

```bash
# Check server files
ls -la minecraft-server/

# Check permissions
chmod +x minecraft-server/bedrock_server

# Test manually
cd minecraft-server && ./bedrock_server
```

#### 5. Port Already in Use

```bash
# Find process using port
lsof -i :19132

# Kill process
kill -9 <PID>
```

### Log Locations

```bash
# Bot logs
./logs/server.log

# PM2 logs (if using PM2)
./logs/pm2-*.log

# Railway logs
# View in Railway dashboard

# Discord console
# Check CONSOLE_CHANNEL_ID channel
```

### Debug Mode

Enable verbose logging:

```javascript
// Add to bot.js
const DEBUG = process.env.DEBUG === "true";

if (DEBUG) {
  console.log("Debug mode enabled");
  // Additional debug output
}
```

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create feature branch**:

```bash
git checkout -b feature/amazing-feature
```

3. **Install dependencies**:

```bash
npm install
```

4. **Make your changes**
5. **Test thoroughly**
6. **Commit changes**:

```bash
git commit -m "Add amazing feature"
```

7. **Push to branch**:

```bash
git push origin feature/amazing-feature
```

8. **Open Pull Request**

### Code Style

- Use **ES6+** features
- **Consistent indentation** (2 spaces)
- **Meaningful variable names**
- **Comment complex logic**
- **Error handling** for all async operations

### Testing

```bash
# Test bot locally
npm start

# Test commands in Discord
/ping
/status

# Test server management
/start
/stop

# Test tunnel functionality
/tunnel start
/tunnel status
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Discord.js** - Discord bot framework
- **playit.gg** - Tunnel service for Minecraft
- **Mojang** - Minecraft Bedrock Edition
- **Railway** - Deployment platform
- **GitHub** - Code hosting and Codespaces

## 📞 Support

### Community

- **Discord Server**: [Join our Discord](https://discord.gg/)
- **GitHub Issues**: [Report bugs or request features](https://github.com/exprays/minebay/issues)

### Documentation

- **Discord.js Guide**: [discordjs.guide](https://discordjs.guide)
- **Minecraft Bedrock**: [Official Documentation](https://minecraft.wiki)
- **playit.gg**: [Help Center](https://playit.gg/help)

---

**Made with ❤️ for the Minecraft community by @exprays**

_Happy mining! ⛏️_
