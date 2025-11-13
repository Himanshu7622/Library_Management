import '@testing-library/jest-dom';

// Mock Electron APIs
const mockElectronAPI = {
  // Book operations
  books: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },

  // Member operations
  members: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },

  // Transaction operations
  transactions: {
    lend: jest.fn(),
    return: jest.fn(),
    getActive: jest.fn(),
    getOverdue: jest.fn(),
    getByMemberId: jest.fn(),
    getHistory: jest.fn(),
  },

  // File operations
  files: {
    saveCover: jest.fn(),
    getCoverPath: jest.fn(),
    deleteCover: jest.fn(),
    exportCSV: jest.fn(),
    importCSV: jest.fn(),
    backupDB: jest.fn(),
    restoreDB: jest.fn(),
  },

  // Settings operations
  settings: {
    get: jest.fn(),
    set: jest.fn(),
    getAll: jest.fn(),
  },

  // Authentication operations
  auth: {
    login: jest.fn(),
    logout: jest.fn(),
    setup: jest.fn(),
    changePin: jest.fn(),
    checkAuth: jest.fn(),
  },

  // System operations
  system: {
    getVersion: jest.fn(),
    getAppPath: jest.fn(),
    showSaveDialog: jest.fn(),
    showOpenDialog: jest.fn(),
  },

  // Events
  onMenuAction: jest.fn(),
  removeAllListeners: jest.fn(),
};

// Mock global electronAPI
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

// Mock node environment
Object.defineProperty(window, 'nodeEnv', {
  value: {
    isDev: true,
    platform: 'linux',
  },
  writable: true,
});

// Suppress console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('validateDOMNesting')) {
    return;
  }
  originalWarn(...args);
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Export mock for use in tests
export { mockElectronAPI };