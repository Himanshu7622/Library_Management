const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

class DatabaseConnection {
  constructor() {
    this.db = null;
    this.dbPath = null;
  }

  /**
   * Initialize database connection
   */
  initialize() {
    try {
      // Get app data directory
      const userDataPath = app.getPath('userData');
      const dbDir = path.join(userDataPath, 'database');

      // Create database directory if it doesn't exist
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Set database path
      this.dbPath = path.join(dbDir, 'library.db');

      // Connect to database
      this.db = new Database(this.dbPath);

      // Configure database settings
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('cache_size = 10000');
      this.db.pragma('temp_store = memory');

      console.log('Database connected successfully:', this.dbPath);
      return true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('Database connection closed');
    }
  }

  /**
   * Get database instance
   */
  getDb() {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Check if database is initialized
   */
  isInitialized() {
    return this.db !== null;
  }

  /**
   * Get database path
   */
  getDbPath() {
    return this.dbPath;
  }

  /**
   * Backup database to specified path
   */
  async backup(backupPath) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // Create backup directory if it doesn't exist
      const backupDir = path.dirname(backupPath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Perform backup
      const backup = new Database(backupPath);
      this.db.backup(backup);
      backup.close();

      console.log('Database backed up successfully:', backupPath);
      return backupPath;
    } catch (error) {
      console.error('Database backup failed:', error);
      throw error;
    }
  }

  /**
   * Restore database from backup
   */
  async restore(backupPath) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file not found:', backupPath);
    }

    try {
      // Close current connection
      this.close();

      // Copy backup file to database location
      fs.copyFileSync(backupPath, this.dbPath);

      // Reconnect to database
      this.initialize();

      console.log('Database restored successfully from:', backupPath);
      return true;
    } catch (error) {
      console.error('Database restore failed:', error);
      throw error;
    }
  }

  /**
   * Get database size and stats
   */
  getStats() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const stats = fs.statSync(this.dbPath);

      // Get table counts
      const tables = this.db.prepare(`
        SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `).all();

      const tableCounts = {};
      tables.forEach(table => {
        const count = this.db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
        tableCounts[table.name] = count.count;
      });

      return {
        path: this.dbPath,
        size: stats.size,
        sizeFormatted: this.formatFileSize(stats.size),
        modified: stats.mtime,
        tables: tableCounts,
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      throw error;
    }
  }

  /**
   * Format file size to human readable format
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Perform vacuum operation to optimize database
   */
  vacuum() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      this.db.exec('VACUUM');
      console.log('Database vacuum completed');
      return true;
    } catch (error) {
      console.error('Database vacuum failed:', error);
      throw error;
    }
  }

  /**
   * Perform analyze operation to update query optimizer statistics
   */
  analyze() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      this.db.exec('ANALYZE');
      console.log('Database analyze completed');
      return true;
    } catch (error) {
      console.error('Database analyze failed:', error);
      throw error;
    }
  }

  /**
   * Check database integrity
   */
  checkIntegrity() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const result = this.db.prepare('PRAGMA integrity_check').get();
      return result.integrity_check === 'ok';
    } catch (error) {
      console.error('Database integrity check failed:', error);
      return false;
    }
  }

  /**
   * Execute transaction with callback
   */
  transaction(callback) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction(callback);
    return transaction();
  }

  /**
   * Prepare statement with error handling
   */
  prepare(sql) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      return this.db.prepare(sql);
    } catch (error) {
      console.error('Failed to prepare statement:', error);
      console.error('SQL:', sql);
      throw error;
    }
  }

  /**
   * Execute SQL statement
   */
  exec(sql) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      return this.db.exec(sql);
    } catch (error) {
      console.error('Failed to execute SQL:', error);
      console.error('SQL:', sql);
      throw error;
    }
  }
}

// Singleton instance
let dbInstance = null;

/**
 * Get database singleton instance
 */
function getDatabase() {
  if (!dbInstance) {
    dbInstance = new DatabaseConnection();
  }
  return dbInstance;
}

/**
 * Initialize database
 */
function initializeDatabase() {
  const db = getDatabase();
  if (!db.isInitialized()) {
    db.initialize();
  }
  return db;
}

/**
 * Close database connection
 */
function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// Handle app exit
process.on('exit', closeDatabase);
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);

module.exports = {
  DatabaseConnection,
  getDatabase,
  initializeDatabase,
  closeDatabase,
};