const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const keytar = require("keytar");
const fs = require("fs");
const os = require("os");
const { getBackendUrl } = require("./envConfig");

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

// IPC Handlers (Unchanged)
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
