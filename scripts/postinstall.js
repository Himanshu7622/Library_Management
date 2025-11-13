#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const isWindows = os.platform() === 'win32';
const nodeVersion = process.version;

console.log('🔧 Library Management System - Post-Install Check');
console.log('===============================================');

// Check Node.js version
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
console.log(`Node.js version: ${nodeVersion}`);

if (majorVersion >= 24) {
  console.log('⚠️  WARNING: Node.js 24+ detected');
  console.log('');
  console.log('better-sqlite3 may not have prebuilt binaries for Node.js 24 on Windows.');
  console.log('If you encounter build errors, please consider the following options:');
  console.log('');

  if (isWindows) {
    console.log('🪟 Windows Solutions:');
    console.log('');
    console.log('Option 1 - Use Node.js 20 LTS (Recommended):');
    console.log('   • Download Node.js 20 LTS from https://nodejs.org');
    console.log('   • Run: nvm use 20 (if using nvm)');
    console.log('   • Delete node_modules and package-lock.json');
    console.log('   • Run: npm install');
    console.log('');
    console.log('Option 2 - Install Visual Studio 2022:');
    console.log('   • Install Visual Studio 2022 Community with C++ development tools');
    console.log('   • Open "x64 Native Tools Command Prompt for VS 2022"');
    console.log('   • Run: vcvars64.bat');
    console.log('   • Set: set GYP_MSVS_VERSION=2022');
    console.log('   • Delete node_modules and package-lock.json');
    console.log('   • Run: npm install');
    console.log('');
    console.log('Option 3 - Install Visual Studio Build Tools:');
    console.log('   • Install Visual Studio Build Tools 2022');
    console.log('   • Install Windows SDK v10.0.19041 or later');
    console.log('   • Set: set GYP_MSVS_VERSION=2022');
    console.log('   • Delete node_modules and package-lock.json');
    console.log('   • Run: npm install');
    console.log('');
  } else {
    console.log('Option 1 - Use Node.js 20 LTS (Recommended):');
    console.log('   • Install Node.js 20 LTS from your package manager');
    console.log('   • Run: nvm use 20 (if using nvm)');
    console.log('   • Delete node_modules and package-lock.json');
    console.log('   • Run: npm install');
    console.log('');
    console.log('Option 2 - Install build dependencies:');
    console.log('   • Ubuntu/Debian: sudo apt-get install build-essential python3');
    console.log('   • CentOS/RHEL: sudo yum groupinstall "Development Tools"');
    console.log('   • macOS: xcode-select --install');
    console.log('   • Delete node_modules and package-lock.json');
    console.log('   • Run: npm install');
    console.log('');
  }
}

// Check for better-sqlite3 prebuilt binaries
try {
  const betterSQLite3Path = path.join(__dirname, '../node_modules/better-sqlite3');
  if (fs.existsSync(betterSQLite3Path)) {
    const bindingPath = path.join(betterSQLite3Path, 'lib/binding.node');
    if (fs.existsSync(bindingPath)) {
      console.log('✅ better-sqlite3 prebuilt binary found');
    } else {
      console.log('⚠️  better-sqlite3 installed but no prebuilt binary found');
      console.log('   You may need to build from source. See instructions above.');
    }
  }
} catch (error) {
  console.log('ℹ️  Could not verify better-sqlite3 installation');
}

// Check for development environment
const isDev = process.env.NODE_ENV === 'development';
if (isDev) {
  console.log('');
  console.log('🚀 Development Environment Detected');
  console.log('   Make sure to run: npm run dev');
  console.log('   The app will be available at: http://localhost:5173');
} else {
  console.log('');
  console.log('🏗️  Production Environment');
  console.log('   Build with: npm run build');
  console.log('   Package with: npm run dist');
}

console.log('');
console.log('📚 Documentation available in README.md');
console.log('🐛 Report issues at: https://github.com/your-repo/library-management-system/issues');
console.log('');
console.log('✅ Post-install check completed');
console.log('');