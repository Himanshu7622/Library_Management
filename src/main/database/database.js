const sqlite3 = require('sqlite3').verbose();
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
    return new Promise((resolve, reject) => {
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
        this.db = new sqlite3.Database(this.dbPath, (err) => {
          if (err) {
            console.error('Failed to connect to database:', err);
            reject(err);
            return;
          }

          console.log('Database connected successfully:', this.dbPath);
          this.configureDatabase()
            .then(() => resolve(true))
            .catch(reject);
        });
      } catch (error) {
        console.error('Failed to initialize database:', error);
        reject(error);
      }
    });
  }

  /**
   * Configure database settings
   */
  configureDatabase() {
    return new Promise((resolve, reject) => {
      // Configure database settings
      const settings = [
        'PRAGMA journal_mode = WAL',
        'PRAGMA foreign_keys = ON',
        'PRAGMA synchronous = NORMAL',
        'PRAGMA cache_size = 10000',
        'PRAGMA temp_store = memory'
      ];

      let completed = 0;
      const total = settings.length;

      settings.forEach((setting) => {
        this.db.run(setting, (err) => {
          if (err) {
            console.error('Failed to set database setting:', setting, err);
            reject(err);
            return;
          }

          completed++;
          if (completed === total) {
            resolve();
          }
        });
      });
    });
  }

  /**
   * Close database connection
   */
  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Failed to close database:', err);
            reject(err);
            return;
          }
          this.db = null;
          console.log('Database connection closed');
          resolve();
        });
      } else {
        resolve();
      }
    });
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

      // For sqlite3, we need to use a different approach since backup() is not available
      // We'll copy the database file directly
      fs.copyFileSync(this.dbPath, backupPath);

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
      await this.close();

      // Copy backup file to database location
      fs.copyFileSync(backupPath, this.dbPath);

      // Reconnect to database
      await this.initialize();

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
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      try {
        const stats = fs.statSync(this.dbPath);

        // Get table counts
        this.db.all(`
          SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `, (err, tables) => {
          if (err) {
            reject(err);
            return;
          }

          const tableCounts = {};
          let completed = 0;

          if (tables.length === 0) {
            resolve({
              path: this.dbPath,
              size: stats.size,
              sizeFormatted: this.formatFileSize(stats.size),
              modified: stats.mtime,
              tables: tableCounts,
            });
            return;
          }

          tables.forEach((table) => {
            this.db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, count) => {
              if (err) {
                reject(err);
                return;
              }
              tableCounts[table.name] = count.count;
              completed++;

              if (completed === tables.length) {
                resolve({
                  path: this.dbPath,
                  size: stats.size,
                  sizeFormatted: this.formatFileSize(stats.size),
                  modified: stats.mtime,
                  tables: tableCounts,
                });
              }
            });
          });
        });
      } catch (error) {
        reject(error);
      }
    });
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
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run('VACUUM', (err) => {
        if (err) {
          console.error('Database vacuum failed:', err);
          reject(err);
          return;
        }
        console.log('Database vacuum completed');
        resolve(true);
      });
    });
  }

  /**
   * Perform analyze operation to update query optimizer statistics
   */
  analyze() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run('ANALYZE', (err) => {
        if (err) {
          console.error('Database analyze failed:', err);
          reject(err);
          return;
        }
        console.log('Database analyze completed');
        resolve(true);
      });
    });
  }

  /**
   * Check database integrity
   */
  checkIntegrity() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get('PRAGMA integrity_check', (err, result) => {
        if (err) {
          console.error('Database integrity check failed:', err);
          reject(err);
          return;
        }

        const isOK = result && result.integrity_check === 'ok';
        resolve(isOK);
      });
    });
  }

  /**
   * Execute SQL statement
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Failed to execute SQL:', err);
          console.error('SQL:', sql);
          reject(err);
          return;
        }
        resolve({
          id: this.lastID,
          changes: this.changes
        });
      });
    });
  }

  /**
   * Get single row
   */
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Failed to get row:', err);
          console.error('SQL:', sql);
          reject(err);
          return;
        }
        resolve(row);
      });
    });
  }

  /**
   * Get all rows
   */
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Failed to get all rows:', err);
          console.error('SQL:', sql);
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
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
  return getDatabase().initialize();
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