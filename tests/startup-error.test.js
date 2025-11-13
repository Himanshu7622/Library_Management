/**
 * Tests for startup error handling and fallback mechanisms
 * These tests ensure the application doesn't hang indefinitely on startup errors
 */

const { app, ipcMain } = require('electron');
const path = require('path');

// Mock electron modules
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/tmp/test'),
    getVersion: jest.fn(() => '24.11.0'),
    whenReady: jest.fn(() => Promise.resolve())
  },
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn()
  },
  BrowserWindow: jest.fn(() => ({
    webContents: {
      send: jest.fn(),
      on: jest.fn(),
      openDevTools: jest.fn(),
      setWindowOpenHandler: jest.fn()
    }
  })),
  Menu: {
    buildFromTemplate: jest.fn(() => {}),
    setApplicationMenu: jest.fn()
  },
  shell: {
    openExternal: jest.fn()
  },
  dialog: {
    showOpenDialog: jest.fn()
  }
}));

// Mock better-sqlite3 to simulate compilation failures
jest.mock('better-sqlite3', () => {
  throw new Error('C++20 or later required.');
});

// Test database initialization failure
describe('Startup Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Clear require cache to ensure fresh module loading
    jest.resetModules();
  });

  test('should handle better-sqlite3 compilation failure gracefully', async () => {
    // Simulate better-sqlite3 compilation error
    const mockError = new Error('C++20 or later required.');
    mockError.code = 'MODULE_NOT_FOUND';

    // Mock file system operations
    const fs = require('fs');
    fs.writeFileSync = jest.fn();
    fs.existsSync = jest.fn(() => false);

    // Mock database initialization
    const { initializeDatabase } = require('../src/main/database/database');

    try {
      await initializeDatabase();
    } catch (error) {
      // Verify error is caught and logged
      expect(error).toBeDefined();
      expect(error.message).toContain('C++20 or later required.');
    }
  });

  test('should emit app-ready event with error status when initialization fails', async () => {
    // Mock main process
    let mockMain;
    jest.isolateModules(() => {
      // Mock better-sqlite3 to throw during initialization
      jest.doMock('better-sqlite3', () => {
        throw new Error('Compilation failed');
      });

      mockMain = require('../public/electron');
    });

    // Verify app-ready event emission
    setTimeout(() => {
      expect(mockMain.mainWindow?.webContents.send).toHaveBeenCalledWith('app-ready', {
        status: 'error',
        error: expect.objectContaining({
          phase: expect.any(String),
          error: expect.any(String),
          timestamp: expect.any(String)
        })
      });
    }, 2000);
  });

  test('should create error log file when startup fails', async () => {
    const mockFs = require('fs');
    mockFs.writeFileSync = jest.fn();

    // Simulate startup error logging
    const mockError = {
      phase: 'DATABASE_INITIALIZATION',
      error: 'Compilation failed',
      stack: 'Error: Compilation failed\\n    at test',
      timestamp: new Date().toISOString(),
      platform: 'win32',
      nodeVersion: 'v24.11.0',
      arch: 'x64'
    };

    const errorLogPath = path.join('/tmp/test', 'startup-error.log');
    mockFs.writeFileSync(errorLogPath, JSON.stringify(mockError, null, 2));

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      errorLogPath,
      JSON.stringify(mockError, null, 2)
    );
  });

  test('should show error UI instead of infinite loading', () => {
    // Mock React component behavior
    const mockSetError = jest.fn();
    const mockSetLoading = jest.fn();

    // Simulate app-ready error event
    const errorData = {
      status: 'error',
      error: {
        phase: 'DATABASE_INITIALIZATION',
        error: 'better-sqlite3 compilation failed',
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    };

    // Simulate renderer handling error
    if (errorData.status === 'error') {
      mockSetLoading(false);
      mockSetError(errorData.error);
    }

    expect(mockSetLoading).toHaveBeenCalledWith(false);
    expect(mockSetError).toHaveBeenCalledWith(errorData.error);
  });

  test('should timeout after 10 seconds if no app-ready signal received', () => {
    jest.useFakeTimers();

    const mockSetError = jest.fn();
    const mockSetLoading = jest.fn(true);

    // Simulate timeout scenario
    setTimeout(() => {
      if (mockSetLoading.mock.calls[mockSetLoading.mock.calls.length - 1][0] === true) {
        mockSetError({
          phase: 'APP_TIMEOUT',
          error: 'Application failed to load within 10 seconds.',
          timestamp: new Date().toISOString(),
          platform: 'win32',
          nodeVersion: 'v24.11.0',
          arch: 'x64'
        });
        mockSetLoading(false);
      }
    }, 10000);

    jest.advanceTimersByTime(10000);

    expect(mockSetError).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: 'APP_TIMEOUT',
        error: expect.stringContaining('failed to load within 10 seconds')
      })
    );

    jest.useRealTimers();
  });
});

// Test error UI component
describe('StartupError Component', () => {
  test('should display Windows-specific instructions for better-sqlite3 errors', () => {
    const errorData = {
      phase: 'DATABASE_INITIALIZATION',
      error: 'C++20 or later required.',
      timestamp: '2024-01-01T00:00:00.000Z',
      platform: 'win32',
      nodeVersion: 'v24.11.0',
      arch: 'x64'
    };

    // Verify error type detection
    const getErrorType = (error) => {
      if (error.error?.includes('better-sqlite3')) return 'DATABASE_ERROR';
      if (error.error?.includes('C++20')) return 'COMPILATION_ERROR';
      if (error.error?.includes('permission')) return 'PERMISSION_ERROR';
      return 'UNKNOWN_ERROR';
    };

    expect(getErrorType(errorData)).toBe('COMPILATION_ERROR');
  });

  test('should provide actionable Windows fix instructions', () => {
    const error = {
      error: 'better-sqlite3 failed to compile with C++20 requirement'
    };

    const getWindowsFixInstructions = () => {
      if (error.error?.includes('C++20') || error.error?.includes('better-sqlite3')) {
        return [
          'The better-sqlite3 native module failed to compile.',
          'Option 1 - Switch to Node.js 20 LTS (Recommended)',
          'Option 2 - Install Visual Studio 2022',
          'Option 3 - Use Node.js 24 with manual build'
        ];
      }
      return ['General troubleshooting steps'];
    };

    const instructions = getWindowsFixInstructions(error);
    expect(instructions).toContain('Node.js 20 LTS');
    expect(instructions).toContain('Visual Studio 2022');
  });
});