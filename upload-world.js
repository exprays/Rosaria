const fs = require("fs");
const path = require("path");
const { spawn, exec } = require("child_process");
const readline = require("readline");
const chalk = require("chalk");

class WorldUploader {
  constructor() {
    this.serverPath = "./minecraft-server";
    this.worldsPath = path.join(this.serverPath, "worlds");
    this.backupPath = "./backups/worlds";

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async uploadWorld() {
    console.log(chalk.cyan("🌍 Minecraft Bedrock World Upload Tool"));
    console.log(chalk.yellow("=".repeat(50)));

    try {
      // Check if server is running
      if (await this.isServerRunning()) {
        console.log(chalk.red("❌ Server is currently running!"));
        console.log(
          chalk.yellow("Please stop the server before uploading a new world.")
        );
        return;
      }

      // Show upload options
      await this.showUploadOptions();
    } catch (error) {
      console.error(chalk.red("❌ Error during world upload:"), error.message);
    } finally {
      this.rl.close();
    }
  }

  async showUploadOptions() {
    console.log(chalk.blue("\n📁 World Upload Options:"));
    console.log("1. Upload from ZIP file");
    console.log("2. Upload from folder");
    console.log("3. Download from URL");
    console.log("4. List current worlds");
    console.log("5. Delete existing world");
    console.log("6. Exit");

    const choice = await this.askQuestion("\n🔢 Choose an option (1-6): ");

    switch (choice.trim()) {
      case "1":
        await this.uploadFromZip();
        break;
      case "2":
        await this.uploadFromFolder();
        break;
      case "3":
        await this.downloadFromUrl();
        break;
      case "4":
        await this.listWorlds();
        break;
      case "5":
        await this.deleteWorld();
        break;
      case "6":
        console.log(chalk.green("👋 Goodbye!"));
        return;
      default:
        console.log(chalk.red("❌ Invalid option!"));
        await this.showUploadOptions();
    }
  }

  async uploadFromZip() {
    console.log(chalk.blue("\n📦 Upload from ZIP file"));

    const zipPath = await this.askQuestion("📁 Enter path to ZIP file: ");

    if (!fs.existsSync(zipPath)) {
      console.log(chalk.red("❌ File not found!"));
      return await this.showUploadOptions();
    }

    const worldName = await this.askQuestion(
      "🏷️  Enter world name (or press Enter for auto): "
    );
    const finalWorldName = worldName.trim() || path.basename(zipPath, ".zip");

    // Backup existing world if it exists
    await this.backupExistingWorld(finalWorldName);

    // Extract ZIP
    await this.extractZip(zipPath, finalWorldName);

    console.log(
      chalk.green(`✅ World "${finalWorldName}" uploaded successfully!`)
    );
    await this.updateServerProperties(finalWorldName);
    await this.showUploadOptions();
  }

  async uploadFromFolder() {
    console.log(chalk.blue("\n📂 Upload from folder"));

    const folderPath = await this.askQuestion(
      "📁 Enter path to world folder: "
    );

    if (!fs.existsSync(folderPath)) {
      console.log(chalk.red("❌ Folder not found!"));
      return await this.showUploadOptions();
    }

    const worldName = await this.askQuestion(
      "🏷️  Enter world name (or press Enter for folder name): "
    );
    const finalWorldName = worldName.trim() || path.basename(folderPath);

    // Backup existing world if it exists
    await this.backupExistingWorld(finalWorldName);

    // Copy folder
    await this.copyFolder(
      folderPath,
      path.join(this.worldsPath, finalWorldName)
    );

    console.log(
      chalk.green(`✅ World "${finalWorldName}" uploaded successfully!`)
    );
    await this.updateServerProperties(finalWorldName);
    await this.showUploadOptions();
  }

  async downloadFromUrl() {
    console.log(chalk.blue("\n🌐 Download from URL"));

    const url = await this.askQuestion("🔗 Enter download URL: ");
    const worldName = await this.askQuestion("🏷️  Enter world name: ");

    if (!worldName.trim()) {
      console.log(chalk.red("❌ World name is required!"));
      return await this.showUploadOptions();
    }

    console.log(chalk.yellow("📥 Downloading..."));

    try {
      // Download file
      const downloadPath = `./temp_${Date.now()}.zip`;
      await this.downloadFile(url, downloadPath);

      // Backup existing world if it exists
      await this.backupExistingWorld(worldName);

      // Extract downloaded file
      await this.extractZip(downloadPath, worldName);

      // Clean up
      fs.unlinkSync(downloadPath);

      console.log(
        chalk.green(`✅ World "${worldName}" downloaded and installed!`)
      );
      await this.updateServerProperties(worldName);
    } catch (error) {
      console.log(chalk.red("❌ Download failed:"), error.message);
    }

    await this.showUploadOptions();
  }

  async listWorlds() {
    console.log(chalk.blue("\n🗂️  Current Worlds:"));

    if (!fs.existsSync(this.worldsPath)) {
      console.log(chalk.yellow("📂 No worlds directory found."));
      return await this.showUploadOptions();
    }

    const worlds = fs
      .readdirSync(this.worldsPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    if (worlds.length === 0) {
      console.log(chalk.yellow("📭 No worlds found."));
    } else {
      worlds.forEach((world, index) => {
        const worldPath = path.join(this.worldsPath, world);
        const stats = fs.statSync(worldPath);
        const size = this.formatFileSize(this.getFolderSize(worldPath));
        const modified = stats.mtime.toLocaleDateString();

        console.log(chalk.green(`${index + 1}. ${world}`));
        console.log(
          chalk.gray(`   📊 Size: ${size} | 📅 Modified: ${modified}`)
        );
      });
    }

    await this.askQuestion("\n⏎ Press Enter to continue...");
    await this.showUploadOptions();
  }

  async deleteWorld() {
    console.log(chalk.blue("\n🗑️  Delete World"));

    const worlds = fs
      .readdirSync(this.worldsPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    if (worlds.length === 0) {
      console.log(chalk.yellow("📭 No worlds found to delete."));
      return await this.showUploadOptions();
    }

    console.log(chalk.yellow("Available worlds:"));
    worlds.forEach((world, index) => {
      console.log(`${index + 1}. ${world}`);
    });

    const choice = await this.askQuestion(
      "🔢 Enter world number to delete (or 0 to cancel): "
    );
    const worldIndex = parseInt(choice) - 1;

    if (worldIndex === -1) {
      return await this.showUploadOptions();
    }

    if (worldIndex < 0 || worldIndex >= worlds.length) {
      console.log(chalk.red("❌ Invalid world number!"));
      return await this.showUploadOptions();
    }

    const worldToDelete = worlds[worldIndex];
    const confirm = await this.askQuestion(
      chalk.red(
        `⚠️  Are you sure you want to delete "${worldToDelete}"? (yes/no): `
      )
    );

    if (confirm.toLowerCase() === "yes" || confirm.toLowerCase() === "y") {
      // Backup before deletion
      await this.backupExistingWorld(worldToDelete);

      // Delete world
      const worldPath = path.join(this.worldsPath, worldToDelete);
      fs.rmSync(worldPath, { recursive: true, force: true });

      console.log(
        chalk.green(`✅ World "${worldToDelete}" deleted successfully!`)
      );
      console.log(chalk.blue("💾 Backup created before deletion."));
    } else {
      console.log(chalk.yellow("❌ Deletion cancelled."));
    }

    await this.showUploadOptions();
  }

  async backupExistingWorld(worldName) {
    const worldPath = path.join(this.worldsPath, worldName);

    if (fs.existsSync(worldPath)) {
      console.log(
        chalk.yellow(`💾 Backing up existing world "${worldName}"...`)
      );

      // Ensure backup directory exists
      if (!fs.existsSync(this.backupPath)) {
        fs.mkdirSync(this.backupPath, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupName = `${worldName}_backup_${timestamp}`;
      const backupFullPath = path.join(this.backupPath, backupName);

      await this.copyFolder(worldPath, backupFullPath);
      console.log(chalk.green(`✅ Backup created: ${backupName}`));
    }
  }

  async extractZip(zipPath, worldName) {
    return new Promise((resolve, reject) => {
      const targetPath = path.join(this.worldsPath, worldName);

      // Ensure worlds directory exists
      if (!fs.existsSync(this.worldsPath)) {
        fs.mkdirSync(this.worldsPath, { recursive: true });
      }

      // Remove existing world if it exists
      if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      }

      console.log(chalk.yellow("📦 Extracting ZIP file..."));

      exec(
        `unzip -q "${zipPath}" -d "${targetPath}"`,
        (error, stdout, stderr) => {
          if (error) {
            reject(new Error(`Extraction failed: ${error.message}`));
            return;
          }

          // Check if extraction created a nested folder structure
          const extractedItems = fs.readdirSync(targetPath);
          if (
            extractedItems.length === 1 &&
            fs.statSync(path.join(targetPath, extractedItems[0])).isDirectory()
          ) {
            // Move contents up one level
            const nestedPath = path.join(targetPath, extractedItems[0]);
            const tempPath = targetPath + "_temp";

            fs.renameSync(nestedPath, tempPath);
            fs.rmSync(targetPath, { recursive: true, force: true });
            fs.renameSync(tempPath, targetPath);
          }

          resolve();
        }
      );
    });
  }

  async copyFolder(source, destination) {
    return new Promise((resolve, reject) => {
      console.log(chalk.yellow("📂 Copying folder..."));

      exec(`cp -r "${source}" "${destination}"`, (error) => {
        if (error) {
          reject(new Error(`Copy failed: ${error.message}`));
          return;
        }
        resolve();
      });
    });
  }

  async downloadFile(url, destination) {
    return new Promise((resolve, reject) => {
      exec(`wget -O "${destination}" "${url}"`, (error) => {
        if (error) {
          reject(new Error(`Download failed: ${error.message}`));
          return;
        }
        resolve();
      });
    });
  }

  async updateServerProperties(worldName) {
    const propertiesPath = path.join(this.serverPath, "server.properties");

    if (fs.existsSync(propertiesPath)) {
      let properties = fs.readFileSync(propertiesPath, "utf8");
      properties = properties.replace(
        /level-name=.*/,
        `level-name=${worldName}`
      );
      fs.writeFileSync(propertiesPath, properties);
      console.log(
        chalk.blue(`🔧 Updated server.properties with world name: ${worldName}`)
      );
    }
  }

  async isServerRunning() {
    return new Promise((resolve) => {
      exec("pgrep -f bedrock_server", (error) => {
        resolve(!error);
      });
    });
  }

  getFolderSize(folderPath) {
    let totalSize = 0;

    function calculateSize(currentPath) {
      const stats = fs.statSync(currentPath);

      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        const files = fs.readdirSync(currentPath);
        files.forEach((file) => {
          calculateSize(path.join(currentPath, file));
        });
      }
    }

    try {
      calculateSize(folderPath);
    } catch (error) {
      // Handle permission errors
    }

    return totalSize;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// Run the world uploader
if (require.main === module) {
  const uploader = new WorldUploader();
  uploader.uploadWorld().catch(console.error);
}

module.exports = WorldUploader;
