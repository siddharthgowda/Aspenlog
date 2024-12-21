const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const keytar = require("keytar");
const fs = require("fs");
const os = require("os");
const { getBackendUrl } = require("./envConfig");

app.commandLine.appendSwitch("disable-http-cache");

// Store the backend URL in keytar on app startup
app.whenReady().then(async () => {
  const backendUrl = getBackendUrl();
  await keytar.setPassword("ASPENLOG2020", "ConnectionAccount", backendUrl);
  createMainWindow();
});

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: "frontend",
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, "./renderer/login.html"));
}

// IPC Handlers
ipcMain.handle("store-token", async (event, token) => {
  await keytar.setPassword("ASPENLOG2020", "TokenAccount", token);
});

ipcMain.handle("get-token", async () => {
  return await keytar.getPassword("ASPENLOG2020", "TokenAccount");
});

ipcMain.handle("store-connection-address", async (event, connectionAddress) => {
  await keytar.setPassword(
    "ASPENLOG2020",
    "ConnectionAccount",
    connectionAddress
  );
});

ipcMain.handle("get-connection-address", async () => {
  return await keytar.getPassword("ASPENLOG2020", "ConnectionAccount");
});

// Function to download files
ipcMain.handle("download", (event, { data, filename }) => {
  // Convert Uint8Array to Buffer
  const buffer = Buffer.from(data);
  // Get user's download directory
  const downloadDir = path.join(os.homedir(), "Downloads");
  // Write file to user's download directory
  fs.writeFile(path.join(downloadDir, filename), buffer, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("File downloaded successfully");
    }
  });
});
