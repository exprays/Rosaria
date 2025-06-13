const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActivityType,
  SlashCommandBuilder,
  REST,
  Routes,
} = require("discord.js");
const { spawn, exec } = require("child_process");
const express = require("express");
const fs = require("fs");
const chalk = require("chalk");
const figlet = require("figlet");
const moment = require("moment");
const cron = require("node-cron");
require("dotenv").config();

class MinecraftServerManager {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.serverProcess = null;
    this.serverStatus = "offline";
    this.playerCount = 0;
    this.maxPlayers = process.env.MAX_PLAYERS || 10;
    this.startTime = null;

    this.setupBot();
    this.setupWebServer();
    this.setupCommands();
  }

  async setupBot() {
    this.client.once("ready", () => {
      this.displayBanner();
      console.log(chalk.green(`✅ Bot logged in as ${this.client.user.tag}`));
      this.client.user.setActivity("Minecraft Server", {
        type: ActivityType.Watching,
      });
      this.updateStatusMessage();
    });

    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      await this.handleCommand(interaction);
    });

    await this.client.login(process.env.DISCORD_TOKEN);
  }

  displayBanner() {
    console.clear();
    console.log(
      chalk.cyan(
        figlet.textSync("MC Bedrock Bot", {
          font: "Big",
          horizontalLayout: "default",
          verticalLayout: "default",
        })
      )
    );
    console.log(chalk.yellow("=".repeat(60)));
    console.log(chalk.green("🎮 Minecraft Bedrock Server Manager"));
    console.log(
      chalk.blue("📅 Started:", moment().format("YYYY-MM-DD HH:mm:ss"))
    );
    console.log(chalk.yellow("=".repeat(60)));
  }

  async setupCommands() {
    const commands = [
      new SlashCommandBuilder()
        .setName("start")
        .setDescription("Start the Minecraft server"),

      new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stop the Minecraft server"),

      new SlashCommandBuilder()
        .setName("restart")
        .setDescription("Restart the Minecraft server"),

      new SlashCommandBuilder()
        .setName("status")
        .setDescription("Check server status"),

      new SlashCommandBuilder()
        .setName("players")
        .setDescription("List online players"),

      new SlashCommandBuilder()
        .setName("say")
        .setDescription("Send a message to the server")
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("Message to send")
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("backup")
        .setDescription("Create a server backup"),

      new SlashCommandBuilder()
        .setName("logs")
        .setDescription("Get recent server logs"),
    ].map((command) => command.toJSON());

    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
      await rest.put(
        Routes.applicationGuildCommands(
          this.client.user.id,
          process.env.GUILD_ID
        ),
        { body: commands }
      );
      console.log(chalk.green("✅ Successfully registered slash commands"));
    } catch (error) {
      console.error(chalk.red("❌ Error registering commands:"), error);
    }
  }

  async handleCommand(interaction) {
    const { commandName } = interaction;

    if (
      !this.isAdmin(interaction.user.id) &&
      !["status", "players"].includes(commandName)
    ) {
      return interaction.reply({
        content: "❌ You don't have permission to use this command!",
        ephemeral: true,
      });
    }

    switch (commandName) {
      case "start":
        await this.startServer(interaction);
        break;
      case "stop":
        await this.stopServer(interaction);
        break;
      case "restart":
        await this.restartServer(interaction);
        break;
      case "status":
        await this.getStatus(interaction);
        break;
      case "players":
        await this.getPlayers(interaction);
        break;
      case "say":
        await this.sendMessage(interaction);
        break;
      case "backup":
        await this.createBackup(interaction);
        break;
      case "logs":
        await this.getLogs(interaction);
        break;
    }
  }

  async startServer(interaction) {
    if (this.serverStatus === "online") {
      return interaction.reply("⚠️ Server is already running!");
    }

    await interaction.reply("🚀 Starting Minecraft server...");

    try {
      this.serverProcess = spawn("./bedrock_server", [], {
        cwd: "./minecraft-server",
        stdio: ["pipe", "pipe", "pipe"],
      });

      this.serverProcess.stdout.on("data", (data) => {
        this.handleServerOutput(data.toString());
      });

      this.serverProcess.on("close", (code) => {
        this.serverStatus = "offline";
        this.startTime = null;
        this.logMessage(`Server stopped with code ${code}`, "warn");
        this.updateStatusMessage();
      });

      this.serverStatus = "online";
      this.startTime = new Date();
      this.updateStatusMessage();

      setTimeout(() => {
        interaction.editReply("✅ Minecraft server started successfully!");
      }, 3000);
    } catch (error) {
      console.error(chalk.red("Error starting server:"), error);
      interaction.editReply("❌ Failed to start server!");
    }
  }

  async stopServer(interaction) {
    if (this.serverStatus === "offline") {
      return interaction.reply("⚠️ Server is already stopped!");
    }

    await interaction.reply("🛑 Stopping Minecraft server...");

    try {
      if (this.serverProcess) {
        this.serverProcess.stdin.write("stop\n");
        setTimeout(() => {
          if (this.serverProcess) {
            this.serverProcess.kill();
          }
        }, 5000);
      }

      this.serverStatus = "offline";
      this.startTime = null;
      this.updateStatusMessage();
      interaction.editReply("✅ Minecraft server stopped successfully!");
    } catch (error) {
      console.error(chalk.red("Error stopping server:"), error);
      interaction.editReply("❌ Failed to stop server!");
    }
  }

  async restartServer(interaction) {
    await interaction.reply("🔄 Restarting Minecraft server...");

    if (this.serverStatus === "online") {
      await this.stopServer({ reply: () => {}, editReply: () => {} });
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    await this.startServer({ reply: () => {}, editReply: () => {} });
    interaction.editReply("✅ Minecraft server restarted successfully!");
  }

  async getStatus(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🎮 Minecraft Server Status")
      .setColor(this.serverStatus === "online" ? 0x00ff00 : 0xff0000)
      .addFields(
        {
          name: "📊 Status",
          value: this.serverStatus === "online" ? "🟢 Online" : "🔴 Offline",
          inline: true,
        },
        {
          name: "👥 Players",
          value: `${this.playerCount}/${this.maxPlayers}`,
          inline: true,
        },
        { name: "⏰ Uptime", value: this.getUptime(), inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  async getPlayers(interaction) {
    if (this.serverStatus === "offline") {
      return interaction.reply("❌ Server is offline!");
    }

    // Send list command to server and capture output
    // This is a simplified version - you'd need to parse actual server output
    const embed = new EmbedBuilder()
      .setTitle("👥 Online Players")
      .setDescription(`**${this.playerCount}** players online`)
      .setColor(0x00ff00)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  async sendMessage(interaction) {
    if (this.serverStatus === "offline") {
      return interaction.reply("❌ Server is offline!");
    }

    const message = interaction.options.getString("message");

    if (this.serverProcess) {
      this.serverProcess.stdin.write(`say ${message}\n`);
      await interaction.reply(`📢 Message sent: "${message}"`);
    }
  }

  async createBackup(interaction) {
    await interaction.reply("💾 Creating backup...");

    try {
      const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
      const backupName = `backup_${timestamp}.zip`;

      exec(
        `cd minecraft-server && zip -r ../backups/${backupName} worlds/`,
        (error) => {
          if (error) {
            interaction.editReply("❌ Backup failed!");
          } else {
            interaction.editReply(`✅ Backup created: ${backupName}`);
          }
        }
      );
    } catch (error) {
      interaction.editReply("❌ Backup failed!");
    }
  }

  async getLogs(interaction) {
    try {
      const logData = fs.readFileSync("./logs/server.log", "utf8");
      const recentLogs = logData.split("\n").slice(-20).join("\n");

      const embed = new EmbedBuilder()
        .setTitle("📋 Recent Server Logs")
        .setDescription(`\`\`\`\n${recentLogs}\n\`\`\``)
        .setColor(0x0099ff)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply("❌ Could not retrieve logs!");
    }
  }

  handleServerOutput(data) {
    const lines = data.split("\n");

    lines.forEach((line) => {
      if (line.trim()) {
        this.logMessage(line, "info");

        // Parse player join/leave events
        if (line.includes("Player connected:")) {
          this.playerCount++;
        } else if (line.includes("Player disconnected:")) {
          this.playerCount--;
        }
      }
    });

    this.updateStatusMessage();
  }

  async updateStatusMessage() {
    const channel = this.client.channels.cache.get(
      process.env.STATUS_CHANNEL_ID
    );
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle("🎮 Minecraft Bedrock Server")
      .setColor(this.serverStatus === "online" ? 0x00ff00 : 0xff0000)
      .addFields(
        {
          name: "📊 Status",
          value: this.serverStatus === "online" ? "🟢 Online" : "🔴 Offline",
          inline: true,
        },
        {
          name: "👥 Players",
          value: `${this.playerCount}/${this.maxPlayers}`,
          inline: true,
        },
        { name: "⏰ Uptime", value: this.getUptime(), inline: true },
        {
          name: "🌐 Connect",
          value: `${process.env.SERVER_NAME || "Bedrock Server"}`,
          inline: false,
        }
      )
      .setFooter({ text: "Last updated" })
      .setTimestamp();

    // Try to edit existing message or send new one
    try {
      const messages = await channel.messages.fetch({ limit: 10 });
      const botMessage = messages.find(
        (msg) => msg.author.id === this.client.user.id && msg.embeds.length > 0
      );

      if (botMessage) {
        await botMessage.edit({ embeds: [embed] });
      } else {
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Error updating status message:", error);
    }
  }

  setupWebServer() {
    const app = express();

    app.get("/", (req, res) => {
      res.json({
        status: this.serverStatus,
        players: this.playerCount,
        maxPlayers: this.maxPlayers,
        uptime: this.getUptime(),
      });
    });

    app.listen(3000, () => {
      console.log(chalk.blue("🌐 Web server running on port 3000"));
    });
  }

  getUptime() {
    if (!this.startTime) return "Not running";

    const now = new Date();
    const diff = now - this.startTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  isAdmin(userId) {
    const adminIds = process.env.ADMIN_IDS?.split(",") || [];
    return adminIds.includes(userId);
  }

  logMessage(message, level = "info") {
    const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    // Ensure logs directory exists
    if (!fs.existsSync("./logs")) {
      fs.mkdirSync("./logs");
    }

    fs.appendFileSync("./logs/server.log", logEntry);

    // Console output with colors
    const colors = {
      info: chalk.blue,
      warn: chalk.yellow,
      error: chalk.red,
      success: chalk.green,
    };

    console.log(colors[level] || chalk.white)(`[${timestamp}] ${message}`);
  }
}

// Auto-restart schedule (every 6 hours)
cron.schedule("0 */6 * * *", () => {
  console.log(chalk.yellow("🔄 Scheduled restart initiated..."));
  if (manager.serverStatus === "online") {
    manager.restartServer({ reply: () => {}, editReply: () => {} });
  }
});

const manager = new MinecraftServerManager();
