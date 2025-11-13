const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class DatabaseConnection {
  constructor() {
    this.dbPath = null;
    this.data = {
      books: [],
      members: [],
      transactions: [],
      settings: {}
    };
    this.initialized = false;
  }

  /**
   * Initialize database connection
   */
  async initialize() {
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
        this.dbPath = path.join(dbDir, 'library.json');

        // Load existing data or create initial structure
        if (fs.existsSync(this.dbPath)) {
          try {
            const fileData = fs.readFileSync(this.dbPath, 'utf8');
            this.data = JSON.parse(fileData);
            console.log('Database loaded successfully:', this.dbPath);
          } catch (parseError) {
            console.warn('Database file corrupted, creating new one:', parseError);
            this.data = this.getInitialData();
            this.saveDatabase();
          }
        } else {
          this.data = this.getInitialData();
          this.saveDatabase();
        }

        // Initialize auto-increment counters
        this.initializeCounters();

        this.initialized = true;
        console.log('Database initialized successfully');
        resolve(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        reject(error);
      }
    });
  }

  /**
   * Get initial data structure
   */
  getInitialData() {
    return {
      books: [],
      members: [],
      transactions: [],
      settings: {
        authEnabled: false,
        lendingPeriods: {
          student: 14,
          faculty: 30,
          public: 7
        },
        fineRules: {
          student: { dailyRate: 5, maxFine: 500 },
          faculty: { dailyRate: 3, maxFine: 300 },
          public: { dailyRate: 10, maxFine: 1000 }
        },
        libraryInfo: {
          name: 'Library Management System',
          version: '1.0.0'
        }
      },
      counters: {
        bookId: 1,
        memberId: 1,
        transactionId: 1
      }
    };
  }

  /**
   * Initialize auto-increment counters
   */
  initializeCounters() {
    if (!this.data.counters) {
      this.data.counters = { bookId: 1, memberId: 1, transactionId: 1 };
    }

    // Find the next available IDs
    if (this.data.books.length > 0) {
      const maxBookId = Math.max(...this.data.books.map(b => b.id || 0));
      this.data.counters.bookId = maxBookId + 1;
    }

    if (this.data.members.length > 0) {
      const maxMemberId = Math.max(...this.data.members.map(m => m.id || 0));
      this.data.counters.memberId = maxMemberId + 1;
    }

    if (this.data.transactions.length > 0) {
      const maxTransactionId = Math.max(...this.data.transactions.map(t => t.id || 0));
      this.data.counters.transactionId = maxTransactionId + 1;
    }
  }

  /**
   * Save database to file
   */
  saveDatabase() {
    if (this.dbPath) {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf8');
    }
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.initialized) {
      this.saveDatabase();
      this.initialized = false;
      console.log('Database connection closed');
    }
  }

  /**
   * Get database instance (for compatibility)
   */
  getDb() {
    return {
      run: (sql, params) => this._executeSql(sql, params),
      get: (sql, params) => this._executeGet(sql, params),
      all: (sql, params) => this._executeAll(sql, params),
      exec: (sql) => this._executeExec(sql)
    };
  }

  /**
   * Execute SQL-like operations (converted to JSON operations)
   */
  async _executeSql(sql, params = []) {
    const operation = sql.trim().toLowerCase();

    if (operation.startsWith('insert into')) {
      return this._handleInsert(sql, params);
    } else if (operation.startsWith('update')) {
      return this._handleUpdate(sql, params);
    } else if (operation.startsWith('delete from')) {
      return this._handleDelete(sql, params);
    }

    return { id: 1, changes: 1 };
  }

  async _executeGet(sql, params = []) {
    const operation = sql.trim().toLowerCase();

    if (operation.includes('where') && operation.includes('id')) {
      return this._handleGetById(sql, params);
    } else if (operation.includes('where') && operation.includes('key')) {
      return this._handleGetByKey(sql, params);
    }

    return null;
  }

  async _executeAll(sql, params = []) {
    const operation = sql.trim().toLowerCase();

    if (operation.startsWith('select')) {
      return this._handleSelect(sql, params);
    }

    return [];
  }

  async _executeExec(sql) {
    // Handle DDL operations (no-op for JSON database)
    return;
  }

  /**
   * Handle INSERT operations
   */
  _handleInsert(sql, params) {
    const tableName = this._extractTableName(sql);
    const record = this._extractInsertData(sql, params);

    if (!this.data[tableName]) {
      this.data[tableName] = [];
    }

    // Assign auto-increment ID
    if (!record.id) {
      const counterKey = `${tableName.slice(0, -1)}Id`;
      record.id = this.data.counters[counterKey] || 1;
      this.data.counters[counterKey] = record.id + 1;
    }

    // Add timestamps
    record.created_at = record.created_at || new Date().toISOString();
    record.updated_at = record.updated_at || new Date().toISOString();

    this.data[tableName].push(record);
    this.saveDatabase();

    return { id: record.id, changes: 1 };
  }

  /**
   * Handle UPDATE operations
   */
  _handleUpdate(sql, params) {
    const { tableName, updates, conditions } = this._extractUpdateData(sql, params);

    if (!this.data[tableName]) {
      return { id: 0, changes: 0 };
    }

    let changes = 0;
    this.data[tableName] = this.data[tableName].map(record => {
      if (this._matchesConditions(record, conditions)) {
        Object.assign(record, updates, { updated_at: new Date().toISOString() });
        changes++;
      }
      return record;
    });

    this.saveDatabase();
    return { id: 1, changes };
  }

  /**
   * Handle DELETE operations
   */
  _handleDelete(sql, params) {
    const { tableName, conditions } = this._extractDeleteData(sql, params);

    if (!this.data[tableName]) {
      return { id: 0, changes: 0 };
    }

    const originalLength = this.data[tableName].length;
    this.data[tableName] = this.data[tableName].filter(record =>
      !this._matchesConditions(record, conditions)
    );

    const changes = originalLength - this.data[tableName].length;
    this.saveDatabase();

    return { id: 1, changes };
  }

  /**
   * Handle SELECT operations
   */
  _handleSelect(sql, params) {
    const { tableName, columns, conditions, orderBy, limit } = this._extractSelectData(sql, params);

    let records = this.data[tableName] || [];

    // Apply filters
    if (conditions && Object.keys(conditions).length > 0) {
      records = records.filter(record => this._matchesConditions(record, conditions));
    }

    // Apply sorting
    if (orderBy) {
      records = this._applySorting(records, orderBy);
    }

    // Apply limit
    if (limit) {
      records = records.slice(0, parseInt(limit));
    }

    return records;
  }

  /**
   * Handle GET BY ID operations
   */
  _handleGetById(sql, params) {
    const tableName = this._extractTableName(sql);
    const id = params[0];

    if (!this.data[tableName]) {
      return null;
    }

    return this.data[tableName].find(record => record.id === parseInt(id)) || null;
  }

  /**
   * Handle GET BY KEY operations (for settings)
   */
  _handleGetByKey(sql, params) {
    const key = params[0];
    return this.data.settings[key] || null;
  }

  /**
   * Utility methods for SQL parsing
   */
  _extractTableName(sql) {
    const match = sql.match(/(?:from|into|table)\s+(\w+)/i);
    return match ? match[1].toLowerCase() : null;
  }

  _extractInsertData(sql, params) {
    // Simple extraction - in real implementation would use proper SQL parser
    const table = this._extractTableName(sql);
    const columns = this._extractColumns(sql);
    const values = params;

    const record = {};
    columns.forEach((col, index) => {
      record[col] = values[index];
    });

    return record;
  }

  _extractColumns(sql) {
    const match = sql.match(/\(([^)]+)\)/i);
    if (!match) return [];

    return match[1].split(',').map(col => col.trim().replace(/['"]/g, ''));
  }

  _extractUpdateData(sql, params) {
    // Simplified extraction
    const tableName = this._extractTableName(sql);
    const setMatch = sql.match(/set\s+(.+?)\s+where/i);

    if (!setMatch) return { tableName, updates: {}, conditions: {} };

    const setPart = setMatch[1];
    const updates = {};

    // Parse SET part
    setPart.split(',').forEach(part => {
      const [key, value] = part.trim().split('=');
      updates[key.trim()] = params.shift();
    });

    // Parse WHERE part
    const conditions = {};
    const whereMatch = sql.match(/where\s+(.+)$/i);
    if (whereMatch) {
      const wherePart = whereMatch[1];
      whereMatch[1].split('and').forEach(part => {
        const [key, operator] = part.trim().split(/\s*=\s*/);
        conditions[key.trim()] = params.shift();
      });
    }

    return { tableName, updates, conditions };
  }

  _extractDeleteData(sql, params) {
    const tableName = this._extractTableName(sql);
    const conditions = {};

    const whereMatch = sql.match(/where\s+(.+)$/i);
    if (whereMatch) {
      const wherePart = whereMatch[1];
      wherePart.split('and').forEach(part => {
        const [key, operator] = part.trim().split(/\s*=\s*/);
        conditions[key.trim()] = params.shift();
      });
    }

    return { tableName, conditions };
  }

  _extractSelectData(sql, params) {
    const tableName = this._extractTableName(sql);
    const columns = ['*']; // Simplified
    let conditions = {};
    let orderBy = null;
    let limit = null;

    // Extract WHERE conditions
    const whereMatch = sql.match(/where\s+(.+?)(?:\s+order\s+by|\s+limit|$)/i);
    if (whereMatch) {
      const wherePart = whereMatch[1];
      wherePart.split('and').forEach(part => {
        const [key, operator] = part.trim().split(/\s*=\s*/);
        conditions[key.trim()] = params.shift();
      });
    }

    // Extract ORDER BY
    const orderMatch = sql.match(/order\s+by\s+(.+?)(?:\s+limit|$)/i);
    if (orderMatch) {
      orderBy = orderMatch[1].trim();
    }

    // Extract LIMIT
    const limitMatch = sql.match(/limit\s+(\d+)/i);
    if (limitMatch) {
      limit = limitMatch[1];
    }

    return { tableName, columns, conditions, orderBy, limit };
  }

  _matchesConditions(record, conditions) {
    for (const [key, value] of Object.entries(conditions)) {
      if (record[key] !== value) {
        return false;
      }
    }
    return true;
  }

  _applySorting(records, orderBy) {
    const [field, direction] = orderBy.split(/\s+/);
    const isAsc = direction && direction.toLowerCase() === 'desc' ? -1 : 1;

    return records.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal < bVal) return -1 * isAsc;
      if (aVal > bVal) return 1 * isAsc;
      return 0;
    });
  }

  /**
   * Check if database is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get database path
   */
  getDbPath() {
    return this.dbPath;
  }

  /**
   * Create database backup
   */
  async backup(backupPath) {
    try {
      fs.copyFileSync(this.dbPath, backupPath);
      console.log('Database backup created:', backupPath);
      return backupPath;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  /**
   * Restore database from backup
   */
  async restore(backupPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup file not found');
      }

      const backupData = fs.readFileSync(backupPath, 'utf8');
      this.data = JSON.parse(backupData);
      this.saveDatabase();
      console.log('Database restored from backup:', backupPath);
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }
}

// Singleton instance
let dbInstance = null;

/**
 * Get database instance
 */
function getDatabase() {
  if (!dbInstance) {
    dbInstance = new DatabaseConnection();
  }
  return dbInstance;
}

module.exports = {
  DatabaseConnection,
  getDatabase,
};