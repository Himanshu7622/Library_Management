const fs = require('fs');
const path = require('path');
const { getDatabase } = require('./database');

class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../../database/migrations');
  }

  /**
   * Run all pending migrations
   */
  async runMigrations() {
    const db = getDatabase().getDb();

    try {
      // Ensure migrations table exists
      this.createMigrationsTable(db);

      // Get all migration files
      const migrationFiles = this.getMigrationFiles();

      // Get already applied migrations
      const appliedMigrations = this.getAppliedMigrations(db);

      // Filter pending migrations
      const pendingMigrations = migrationFiles.filter(file =>
        !appliedMigrations.includes(file)
      );

      console.log(`Found ${pendingMigrations.length} pending migrations`);

      // Apply pending migrations in order
      for (const migrationFile of pendingMigrations) {
        await this.applyMigration(db, migrationFile);
      }

      console.log('All migrations completed successfully');
      return true;
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Create migrations table if it doesn't exist
   */
  createMigrationsTable(db) {
    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL UNIQUE,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    db.exec(sql);
  }

  /**
   * Get all migration files sorted by filename
   */
  getMigrationFiles() {
    if (!fs.existsSync(this.migrationsPath)) {
      console.warn('Migrations directory not found:', this.migrationsPath);
      return [];
    }

    const files = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files;
  }

  /**
   * Get list of already applied migrations
   */
  getAppliedMigrations(db) {
    try {
      const rows = db.prepare('SELECT filename FROM migrations ORDER BY filename').all();
      return rows.map(row => row.filename);
    } catch (error) {
      // If migrations table doesn't exist, return empty array
      return [];
    }
  }

  /**
   * Apply a single migration
   */
  async applyMigration(db, filename) {
    const migrationPath = path.join(this.migrationsPath, filename);

    console.log(`Applying migration: ${filename}`);

    try {
      // Read migration file
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      // Execute migration within a transaction
      db.transaction(() => {
        // Split migration SQL by statements and execute each
        const statements = migrationSQL
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
          try {
            db.exec(statement);
          } catch (error) {
            console.warn(`Warning in migration ${filename}:`, error.message);
            // Continue with other statements
          }
        }

        // Record migration as applied
        db.prepare('INSERT INTO migrations (filename) VALUES (?)').run(filename);
      })();

      console.log(`Migration applied successfully: ${filename}`);
    } catch (error) {
      console.error(`Failed to apply migration ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Rollback last migration (if rollback file exists)
   */
  async rollbackLastMigration() {
    const db = getDatabase().getDb();

    try {
      // Get last applied migration
      const lastMigration = db.prepare('SELECT filename FROM migrations ORDER BY filename DESC LIMIT 1').get();

      if (!lastMigration) {
        console.log('No migrations to rollback');
        return false;
      }

      const migrationName = path.parse(lastMigration.filename).name;
      const rollbackFile = `${migrationName}_rollback.sql`;
      const rollbackPath = path.join(this.migrationsPath, rollbackFile);

      if (!fs.existsSync(rollbackPath)) {
        throw new Error(`Rollback file not found: ${rollbackFile}`);
      }

      console.log(`Rolling back migration: ${lastMigration.filename}`);

      // Read rollback file
      const rollbackSQL = fs.readFileSync(rollbackPath, 'utf8');

      // Execute rollback within a transaction
      db.transaction(() => {
        // Execute rollback statements
        const statements = rollbackSQL
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
          db.exec(statement);
        }

        // Remove migration from applied list
        db.prepare('DELETE FROM migrations WHERE filename = ?').run(lastMigration.filename);
      })();

      console.log(`Migration rolled back successfully: ${lastMigration.filename}`);
      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  getMigrationStatus() {
    const db = getDatabase().getDb();

    try {
      const allMigrations = this.getMigrationFiles();
      const appliedMigrations = this.getAppliedMigrations(db);

      const status = allMigrations.map(filename => ({
        filename,
        applied: appliedMigrations.includes(filename),
        appliedAt: appliedMigrations.includes(filename)
          ? db.prepare('SELECT applied_at FROM migrations WHERE filename = ?').get(filename).applied_at
          : null
      }));

      return {
        total: allMigrations.length,
        applied: appliedMigrations.length,
        pending: allMigrations.length - appliedMigrations.length,
        migrations: status
      };
    } catch (error) {
      console.error('Failed to get migration status:', error);
      throw error;
    }
  }

  /**
   * Create a new migration file
   */
  createMigration(name, content = '') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${timestamp}_${name.replace(/[^a-zA-Z0-9]/g, '_')}.sql`;
    const filepath = path.join(this.migrationsPath, filename);

    // Create migrations directory if it doesn't exist
    if (!fs.existsSync(this.migrationsPath)) {
      fs.mkdirSync(this.migrationsPath, { recursive: true });
    }

    // Default migration content
    const defaultContent = content || `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- Add your migration SQL here

`;

    fs.writeFileSync(filepath, defaultContent);
    console.log(`Migration created: ${filename}`);
    return filepath;
  }

  /**
   * Validate migration file syntax
   */
  validateMigration(filename) {
    const migrationPath = path.join(this.migrationsPath, filename);

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${filename}`);
    }

    try {
      const content = fs.readFileSync(migrationPath, 'utf8');

      // Basic validation checks
      if (!content.trim()) {
        throw new Error('Migration file is empty');
      }

      // Check for dangerous operations (should be in rollback files)
      const dangerousPatterns = [
        /DROP\s+TABLE/i,
        /DROP\s+DATABASE/i,
        /DELETE\s+FROM\s+\w+\s*;?\s*$/i,
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(content)) {
          console.warn(`Warning: Potentially dangerous operation detected in migration: ${filename}`);
        }
      }

      return true;
    } catch (error) {
      console.error(`Migration validation failed for ${filename}:`, error);
      throw error;
    }
  }
}

// Singleton instance
let migrationRunner = null;

function getMigrationRunner() {
  if (!migrationRunner) {
    migrationRunner = new MigrationRunner();
  }
  return migrationRunner;
}

/**
 * Initialize database with migrations
 */
async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Get migration runner
    const runner = getMigrationRunner();

    // Run pending migrations
    await runner.runMigrations();

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

module.exports = {
  MigrationRunner,
  getMigrationRunner,
  initializeDatabase,
};