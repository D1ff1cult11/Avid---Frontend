import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { EvmClient } from './protocol/evmClient';
import { defaultConfig } from './config/config';
import { getMembership } from './ledger/membershipStore';

let mainWindow: BrowserWindow | null = null;
const client = new EvmClient(defaultConfig);

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Check if we are in dev mode (Vite running)
  if (!app.isPackaged && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../../../../frontend/EVMClient/dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await client.start();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  client.stop();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Setting up safe IPC Handlers
ipcMain.handle('protocol:checkEligibility', async (event, voterId: string) => {
  try {
    const result = await client.checkEligibility(voterId);
    return { success: true, result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('protocol:submitVote', async (event, voterId: string, candidateId: string) => {
  try {
    const result = await client.submitVote(voterId, candidateId);
    return { success: true, result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('protocol:getMembers', async () => {
  return { success: true, result: getMembership() };
});

ipcMain.handle('protocol:getConfig', async () => {
  return { success: true, result: defaultConfig };
});
