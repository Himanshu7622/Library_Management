const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';
const { setupIpcHandlers } = require('../src/main/ipc-handlers');
const { initializeDatabase } = require('../src/main/database/database');

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false, // Don't show until ready-to-show
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function setupApplicationMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Import Books (CSV)',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-import-books');
            }
          },
        },
        {
          label: 'Export Books (CSV)',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-export-books');
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Backup Database',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-backup-database');
            }
          },
        },
        { type: 'separator' },
        {
          label: isDev ? 'DevTools' : 'Quit',
          accelerator: isDev ? 'F12' : process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            if (isDev) {
              if (mainWindow) {
                mainWindow.webContents.toggleDevTools();
              }
            } else {
              app.quit();
            }
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo', label: 'Undo' },
        { role: 'redo', label: 'Redo' },
        { type: 'separator' },
        { role: 'cut', label: 'Cut' },
        { role: 'copy', label: 'Copy' },
        { role: 'paste', label: 'Paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', label: 'Reload' },
        { role: 'forceReload', label: 'Force Reload' },
        { role: 'toggleDevTools', label: 'Toggle Developer Tools' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Actual Size' },
        { role: 'zoomIn', label: 'Zoom In' },
        { role: 'zoomOut', label: 'Zoom Out' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Toggle Fullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize', label: 'Minimize' },
        { role: 'close', label: 'Close' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Error handling and diagnostics
let startupError = null;
const logStartupError = (error, phase) => {
  startupError = {
    phase,
    error: error.message || error,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    platform: process.platform,
    nodeVersion: process.version,
    arch: process.arch
  };

  console.error(`[STARTUP ERROR] Phase: ${phase}`);
  console.error(error);

  // Write to error log file
  try {
    const fs = require('fs');
    const userDataPath = app.getPath('userData');
    const errorLogPath = path.join(userDataPath, 'startup-error.log');
    fs.writeFileSync(errorLogPath, JSON.stringify(startupError, null, 2));
  } catch (logError) {
    console.error('Failed to write error log:', logError);
  }
};

const initializeAppWithFallbacks = async () => {
  try {
    // Try to initialize the primary database first
    await initializeDatabase();
    console.log('Primary database initialized successfully');
  } catch (dbError) {
    logStartupError(dbError, 'DATABASE_INITIALIZATION');

    // Try fallback database
    try {
      console.log('Attempting fallback database initialization...');
      const { getDatabase } = require('../src/main/database/database');
      const db = getDatabase();
      await db.initialize();
      console.log('Fallback database initialized successfully');
    } catch (fallbackError) {
      logStartupError(fallbackError, 'FALLBACK_DATABASE_INITIALIZATION');
      throw fallbackError;
    }
  }

  try {
    // Setup IPC handlers
    setupIpcHandlers();
    console.log('IPC handlers setup successfully');
  } catch (ipcError) {
    logStartupError(ipcError, 'IPC_HANDLERS_SETUP');
    throw ipcError;
  }
};

// App event listeners
app.whenReady().then(async () => {
  try {
    // Initialize with error handling
    await initializeAppWithFallbacks();

    // Create main window
    createWindow();

    // Setup application menu
    setupApplicationMenu();

    // Send startup success to renderer after 1 second delay
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('app-ready', {
          status: 'success',
          timestamp: new Date().toISOString()
        });
      }
    }, 1000);

  } catch (error) {
    logStartupError(error, 'APP_INITIALIZATION');

    // Still create window to show error UI
    createWindow();
    setupApplicationMenu();

    // Send error to renderer after 1 second delay
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('app-ready', {
          status: 'error',
          error: startupError
        });
      }
    }, 1000);
  }
}).catch(error => {
  console.error('Critical error during app.whenReady():', error);
  logStartupError(error, 'APP_READY');
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked and no other windows open
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationURL) => {
    navigationEvent.preventDefault();
    shell.openExternal(navigationURL);
  });
});

// Handle protocol for deep links (if needed)
app.setAsDefaultProtocolClient('library-management');

// Handle app before quit
app.on('before-quit', (event) => {
  // Save any unsaved data here if needed
});

// Handle certificates for development (optional)
if (isDev) {
  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    // On development, ignore certificate errors
    event.preventDefault();
    callback(true);
  });
}