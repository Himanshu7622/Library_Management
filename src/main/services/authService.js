const bcrypt = require('bcryptjs');
const { getDatabaseService } = require('../database/services');
const { app } = require('electron');

class AuthService {
  constructor() {
    this.dbService = getDatabaseService();
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
    this.maxLoginAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
    this.currentSession = null;
    this.loginAttempts = {};
  }

  async setup(pin) {
    try {
      // Validate PIN
      if (!pin || pin.length < 4 || pin.length > 8) {
        throw new Error('PIN must be between 4 and 8 characters');
      }

      // Check if authentication is already set up
      const existingPinHash = await this.dbService.getSetting('authPinHash');
      if (existingPinHash) {
        throw new Error('Authentication is already set up');
      }

      // Hash and store the PIN
      const saltRounds = 12;
      const pinHash = await bcrypt.hash(pin, saltRounds);

      await this.dbService.setSetting('authPinHash', pinHash);
      await this.dbService.setSetting('authEnabled', true);
      await this.dbService.setSetting('authSetupDate', new Date().toISOString());

      console.log('Authentication setup completed');
      return { success: true, message: 'Authentication setup completed' };
    } catch (error) {
      console.error('Failed to setup authentication:', error);
      throw error;
    }
  }

  async login(pin) {
    try {
      // Check if authentication is enabled
      const authEnabled = await this.dbService.getSetting('authEnabled');
      if (authEnabled === false) {
        // If authentication is disabled, allow login without PIN
        this.createSession();
        return { success: true, message: 'Login successful (authentication disabled)' };
      }

      // Check if user is currently locked out
      const clientInfo = this.getClientInfo();
      if (this.isLockedOut(clientInfo)) {
        const lockoutTimeLeft = this.getLockoutTimeLeft(clientInfo);
        throw new Error(`Account locked. Try again in ${Math.ceil(lockoutTimeLeft / 60000)} minutes`);
      }

      // Get stored PIN hash
      const pinHash = await this.dbService.getSetting('authPinHash');
      if (!pinHash) {
        throw new Error('Authentication not set up');
      }

      // Validate PIN
      const isValidPin = await bcrypt.compare(pin, pinHash);

      if (!isValidPin) {
        this.recordFailedAttempt(clientInfo);
        throw new Error('Invalid PIN');
      }

      // Clear failed attempts on successful login
      this.clearFailedAttempts(clientInfo);

      // Create session
      this.createSession();

      console.log('User logged in successfully');
      return { success: true, message: 'Login successful' };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout() {
    try {
      this.currentSession = null;
      console.log('User logged out');
      return { success: true, message: 'Logout successful' };
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async checkAuth() {
    try {
      // Check if authentication is enabled
      const authEnabled = await this.dbService.getSetting('authEnabled');
      if (authEnabled === false) {
        return true;
      }

      // Check if session exists and is not expired
      if (!this.currentSession) {
        return false;
      }

      const now = Date.now();
      if (now - this.currentSession.startTime > this.sessionTimeout) {
        // Session expired
        this.currentSession = null;
        return false;
      }

      // Update last activity time
      this.currentSession.lastActivity = now;
      return true;
    } catch (error) {
      console.error('Failed to check authentication:', error);
      return false;
    }
  }

  async changePin(oldPin, newPin) {
    try {
      // Validate new PIN
      if (!newPin || newPin.length < 4 || newPin.length > 8) {
        throw new Error('New PIN must be between 4 and 8 characters');
      }

      // Get current PIN hash
      const pinHash = await this.dbService.getSetting('authPinHash');
      if (!pinHash) {
        throw new Error('Authentication not set up');
      }

      // Verify old PIN
      const isValidOldPin = await bcrypt.compare(oldPin, pinHash);
      if (!isValidOldPin) {
        throw new Error('Invalid current PIN');
      }

      // Hash and store new PIN
      const saltRounds = 12;
      const newPinHash = await bcrypt.hash(newPin, saltRounds);

      await this.dbService.setSetting('authPinHash', newPinHash);
      await this.dbService.setSetting('authPinChangedDate', new Date().toISOString());

      console.log('PIN changed successfully');
      return { success: true, message: 'PIN changed successfully' };
    } catch (error) {
      console.error('Failed to change PIN:', error);
      throw error;
    }
  }

  async enableAuthentication() {
    try {
      const pinHash = await this.dbService.getSetting('authPinHash');
      if (!pinHash) {
        throw new Error('Authentication must be set up first');
      }

      await this.dbService.setSetting('authEnabled', true);
      console.log('Authentication enabled');
      return { success: true, message: 'Authentication enabled' };
    } catch (error) {
      console.error('Failed to enable authentication:', error);
      throw error;
    }
  }

  async disableAuthentication() {
    try {
      await this.dbService.setSetting('authEnabled', false);
      this.currentSession = null; // Clear current session
      console.log('Authentication disabled');
      return { success: true, message: 'Authentication disabled' };
    } catch (error) {
      console.error('Failed to disable authentication:', error);
      throw error;
    }
  }

  // Helper methods
  createSession() {
    this.currentSession = {
      startTime: Date.now(),
      lastActivity: Date.now()
    };
  }

  getClientInfo() {
    // In a real implementation, you might use IP address or other identifiers
    // For this desktop app, we'll use a simple identifier
    return 'desktop_client';
  }

  isLockedOut(clientInfo) {
    const attempts = this.loginAttempts[clientInfo];
    if (!attempts) return false;

    return attempts.count >= this.maxLoginAttempts &&
           (Date.now() - attempts.lastAttempt) < this.lockoutDuration;
  }

  getLockoutTimeLeft(clientInfo) {
    const attempts = this.loginAttempts[clientInfo];
    if (!attempts) return 0;

    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
    return Math.max(0, this.lockoutDuration - timeSinceLastAttempt);
  }

  recordFailedAttempt(clientInfo) {
    if (!this.loginAttempts[clientInfo]) {
      this.loginAttempts[clientInfo] = {
        count: 0,
        lastAttempt: 0
      };
    }

    this.loginAttempts[clientInfo].count++;
    this.loginAttempts[clientInfo].lastAttempt = Date.now();

    console.log(`Failed login attempt ${this.loginAttempts[clientInfo].count} for ${clientInfo}`);
  }

  clearFailedAttempts(clientInfo) {
    delete this.loginAttempts[clientInfo];
  }

  // Settings management
  async updateAuthSettings(settings) {
    try {
      if (settings.sessionTimeout) {
        this.sessionTimeout = settings.sessionTimeout * 60 * 1000; // Convert minutes to milliseconds
      }

      if (settings.maxAttempts) {
        this.maxLoginAttempts = settings.maxAttempts;
      }

      if (settings.lockoutDuration) {
        this.lockoutDuration = settings.lockoutDuration * 60 * 1000; // Convert minutes to milliseconds
      }

      // Save settings to database
      const currentSettings = await this.dbService.getSetting('authSettings') || {};
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        updatedAt: new Date().toISOString()
      };

      await this.dbService.setSetting('authSettings', updatedSettings);
      await this.dbService.setSetting('authentication', {
        enabled: true,
        sessionTimeout: this.sessionTimeout / 60000, // Convert back to minutes
        maxAttempts: this.maxLoginAttempts,
        lockoutDuration: this.lockoutDuration / 60000 // Convert back to minutes
      });

      console.log('Authentication settings updated');
      return { success: true, message: 'Settings updated successfully' };
    } catch (error) {
      console.error('Failed to update authentication settings:', error);
      throw error;
    }
  }

  async getAuthSettings() {
    try {
      const settings = await this.dbService.getSetting('authSettings') || {};
      const authEnabled = await this.dbService.getSetting('authEnabled');

      return {
        enabled: authEnabled !== false,
        sessionTimeout: (settings.sessionTimeout || 30), // in minutes
        maxAttempts: settings.maxAttempts || this.maxLoginAttempts,
        lockoutDuration: settings.lockoutDuration || 15, // in minutes
        setupDate: await this.dbService.getSetting('authSetupDate'),
        lastPinChange: await this.dbService.getSetting('authPinChangedDate')
      };
    } catch (error) {
      console.error('Failed to get authentication settings:', error);
      throw error;
    }
  }

  // Security methods
  async validatePasswordStrength(password) {
    if (password.length < 4) {
      return { valid: false, message: 'PIN must be at least 4 characters long' };
    }

    if (password.length > 8) {
      return { valid: false, message: 'PIN must not exceed 8 characters' };
    }

    if (!/^\d+$/.test(password)) {
      return { valid: false, message: 'PIN must contain only numbers' };
    }

    // Check for common weak PINs
    const weakPins = ['0000', '1111', '1234', '4321', '5555', '6666', '7777', '8888', '9999'];
    if (weakPins.includes(password)) {
      return { valid: false, message: 'PIN is too common. Please choose a different PIN' };
    }

    // Check for sequential digits
    let isSequential = true;
    for (let i = 1; i < password.length; i++) {
      if (parseInt(password[i]) !== parseInt(password[i-1]) + 1) {
        isSequential = false;
        break;
      }
    }

    if (isSequential && password.length > 2) {
      return { valid: false, message: 'PIN cannot contain sequential numbers' };
    }

    return { valid: true, message: 'PIN is valid' };
  }

  async getSecurityInfo() {
    try {
      const settings = await this.getAuthSettings();
      const clientInfo = this.getClientInfo();

      return {
        ...settings,
        currentSession: this.currentSession ? {
          startTime: this.currentSession.startTime,
          lastActivity: this.currentSession.lastActivity,
          duration: Date.now() - this.currentSession.startTime
        } : null,
        isLockedOut: this.isLockedOut(clientInfo),
        lockoutTimeLeft: this.isLockedOut(clientInfo) ? this.getLockoutTimeLeft(clientInfo) : 0,
        failedAttempts: this.loginAttempts[clientInfo]?.count || 0
      };
    } catch (error) {
      console.error('Failed to get security info:', error);
      throw error;
    }
  }
}

module.exports = AuthService;