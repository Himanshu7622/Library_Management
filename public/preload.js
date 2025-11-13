const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Book operations
  books: {
    getAll: (filters) => ipcRenderer.invoke('books:getAll', filters),
    getById: (id) => ipcRenderer.invoke('books:getById', id),
    create: (bookData) => ipcRenderer.invoke('books:create', bookData),
    update: (id, bookData) => ipcRenderer.invoke('books:update', id, bookData),
    delete: (id) => ipcRenderer.invoke('books:delete', id),
  },

  // Member operations
  members: {
    getAll: () => ipcRenderer.invoke('members:getAll'),
    getById: (id) => ipcRenderer.invoke('members:getById', id),
    create: (memberData) => ipcRenderer.invoke('members:create', memberData),
    update: (id, memberData) => ipcRenderer.invoke('members:update', id, memberData),
    delete: (id) => ipcRenderer.invoke('members:delete', id),
  },

  // Transaction operations
  transactions: {
    lend: (bookId, memberId, dueDate) => ipcRenderer.invoke('transactions:lend', bookId, memberId, dueDate),
    return: (transactionId) => ipcRenderer.invoke('transactions:return', transactionId),
    getActive: () => ipcRenderer.invoke('transactions:getActive'),
    getOverdue: () => ipcRenderer.invoke('transactions:getOverdue'),
    getByMemberId: (memberId) => ipcRenderer.invoke('transactions:getByMemberId', memberId),
    getHistory: (limit = 50) => ipcRenderer.invoke('transactions:getHistory', limit),
  },

  // File operations
  files: {
    saveCover: (imageData, filename) => ipcRenderer.invoke('files:saveCover', imageData, filename),
    getCoverPath: (bookId) => ipcRenderer.invoke('files:getCoverPath', bookId),
    deleteCover: (bookId) => ipcRenderer.invoke('files:deleteCover', bookId),
    exportCSV: (type, data) => ipcRenderer.invoke('files:exportCSV', type, data),
    importCSV: (filePath, type) => ipcRenderer.invoke('files:importCSV', filePath, type),
    backupDB: () => ipcRenderer.invoke('files:backupDB'),
    restoreDB: (backupPath) => ipcRenderer.invoke('files:restoreDB', backupPath),
  },

  // Settings operations
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:getAll'),
  },

  // Authentication operations
  auth: {
    login: (pin) => ipcRenderer.invoke('auth:login', pin),
    logout: () => ipcRenderer.invoke('auth:logout'),
    setup: (pin) => ipcRenderer.invoke('auth:setup', pin),
    changePin: (oldPin, newPin) => ipcRenderer.invoke('auth:changePin', oldPin, newPin),
    checkAuth: () => ipcRenderer.invoke('auth:checkAuth'),
  },

  // System operations
  system: {
    getVersion: () => ipcRenderer.invoke('system:getVersion'),
    getAppPath: () => ipcRenderer.invoke('system:getAppPath'),
    showSaveDialog: (options) => ipcRenderer.invoke('dialog:showSaveDialog', options),
    showOpenDialog: (options) => ipcRenderer.invoke('dialog:showOpenDialog', options),
  },

  // Events from main process
  onMenuAction: (callback) => {
    const menuActions = [
      'menu-import-books',
      'menu-export-books',
      'menu-backup-database',
    ];

    menuActions.forEach(action => {
      ipcRenderer.on(action, callback);
    });
  },

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // App startup events
  onAppReady: (callback) => {
    ipcRenderer.on('app-ready', (event, data) => callback(data));
  },
});

// Expose node environment variables
contextBridge.exposeInMainWorld('nodeEnv', {
  isDev: process.env.NODE_ENV === 'development',
  platform: process.platform,
});