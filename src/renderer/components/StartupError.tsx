import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Copy, ExternalLink, X, FileText, Terminal } from 'lucide-react';

interface StartupErrorProps {
  error: {
    phase: string;
    error: string;
    stack?: string;
    timestamp: string;
    platform: string;
    nodeVersion: string;
    arch: string;
  };
  onRetry?: () => void;
}

const StartupError: React.FC<StartupErrorProps> = ({ error, onRetry }) => {
  const [copied, setCopied] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState(false);

  const getWindowsFixInstructions = () => {
    if (error.error?.includes('C++20') || error.error?.includes('better-sqlite3')) {
      return [
        'The better-sqlite3 native module failed to compile with your current setup.',
        '',
        '🔧 QUICK FIX OPTIONS:',
        '',
        '1. Switch to Node.js 20 (Recommended):',
        '   • Download Node.js 20 LTS from https://nodejs.org',
        '   • Run: nvm use 20 (if using nvm)',
        '   • Delete node_modules and package-lock.json',
        '   • Run: npm install',
        '',
        '2. Build with Visual Studio 2022:',
        '   • Install Visual Studio 2022 with C++ development tools',
        '   • Open "x64 Native Tools Command Prompt"',
        '   • Run: vcvars64.bat',
        '   • Set: set GYP_MSVS_VERSION=2022',
        '   • Delete node_modules and package-lock.json',
        '   • Run: npm install',
        '',
        '3. Use Node.js 24 with manual build:',
        '   • Install Windows SDK v10.0.19041 or later',
        '   • Install Visual Studio Build Tools 2022',
        '   • Run: set GYP_MSVS_VERSION=2022',
        '   • Delete node_modules and package-lock.json',
        '   • Run: npm install'
      ];
    }
    return [
      'An error occurred during application startup.',
      '',
      '🔧 GENERAL TROUBLESHOOTING:',
      '',
      '1. Restart the application',
      '2. Check that no other instances are running',
      '3. Verify sufficient disk space and permissions',
      '4. Try running as administrator',
      '5. Clear application data and restart'
    ];
  };

  const copyErrorToClipboard = async () => {
    const errorText = JSON.stringify(error, null, 2);
    try {
      await navigator.clipboard.writeText(errorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = errorText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openLogsFolder = () => {
    window.electronAPI.system.getAppPath().then(path => {
      const os = window.nodeEnv.platform;
      let logsPath = '';

      if (os === 'win32') {
        logsPath = path.replace(/AppData\/Roaming[^\\]*/, 'AppData\\Roaming\\Library Management System');
      } else if (os === 'darwin') {
        logsPath = path.replace(/\/[^\/]*$/, '/Library Management System');
      } else {
        logsPath = path.replace(/\/[^\/]*$/, '/library-management-system');
      }

      window.electronAPI.system.showOpenDialog({
        properties: ['openDirectory'],
        defaultPath: logsPath
      });
    });
  };

  const getErrorType = () => {
    if (error.error?.includes('better-sqlite3')) return 'DATABASE_ERROR';
    if (error.error?.includes('C++20')) return 'COMPILATION_ERROR';
    if (error.error?.includes('permission')) return 'PERMISSION_ERROR';
    return 'UNKNOWN_ERROR';
  };

  const errorType = getErrorType();
  const instructions = getWindowsFixInstructions();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Application Startup Failed
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Error occurred during {error.phase}
              </p>
            </div>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          )}
        </div>

        {/* Error Summary */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
              Error Details
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200 font-mono mb-3">
              {error.error}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-red-600 dark:text-red-400">
              <span className="bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
                Platform: {error.platform}
              </span>
              <span className="bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
                Node: {error.nodeVersion}
              </span>
              <span className="bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
                Arch: {error.arch}
              </span>
              <span className="bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
                Time: {new Date(error.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Terminal className="w-5 h-5 mr-2" />
              How to Fix This Issue
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-line">
                {instructions.join('\n')}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <button
              onClick={copyErrorToClipboard}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {copied ? (
                <>
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Error Details</span>
                </>
              )}
            </button>

            <button
              onClick={openLogsFolder}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Open Logs Folder</span>
            </button>
          </div>

          {/* Expandable Error Stack */}
          {error.stack && (
            <div>
              <button
                onClick={() => setExpandedLogs(!expandedLogs)}
                className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-3"
              >
                <Terminal className="w-4 h-4" />
                <span>{expandedLogs ? 'Hide' : 'Show'} Technical Details</span>
              </button>
              {expandedLogs && (
                <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Additional Resources */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Need more help? Check the documentation or report this issue.
              </div>
              <div className="flex space-x-2">
                <a
                  href="https://github.com/your-repo/library-management-system/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Report Issue</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupError;