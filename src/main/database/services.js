const { getDatabase } = require('./database');
const { format } = require('date-fns');

class DatabaseService {
  constructor() {
    this.db = getDatabase();
  }

  // Helper methods
  parseJSON(field) {
    try {
      return field ? JSON.parse(field) : [];
    } catch {
      return [];
    }
  }

  stringifyJSON(field) {
    return JSON.stringify(field || []);
  }

  // Books CRUD operations
  async getAllBooks(filters = {}) {
    try {
      let query = `
        SELECT
          b.*,
          COUNT(CASE WHEN t.transaction_type = 'lend' AND t.return_date IS NULL THEN 1 END) as active_loans
        FROM books b
        LEFT JOIN transactions t ON b.id = t.book_id
        WHERE 1=1
      `;
      const params = [];

      // Build WHERE clause based on filters
      if (filters.search) {
        query += ` AND (
          b.title LIKE ? OR
          b.authors LIKE ? OR
          b.isbn LIKE ? OR
          b.description LIKE ? OR
          b.tags LIKE ?
        )`;
        const searchPattern = `%${filters.search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }

      if (filters.status && filters.status !== 'all') {
        query += ` AND b.status = ?`;
        params.push(filters.status);
      }

      if (filters.genre) {
        query += ` AND b.genres LIKE ?`;
        params.push(`%"${filters.genre}"%`);
      }

      if (filters.language && filters.language !== 'all') {
        query += ` AND b.language = ?`;
        params.push(filters.language);
      }

      if (filters.availability) {
        switch (filters.availability) {
          case 'available':
            query += ` AND b.available_copies > 0`;
            break;
          case 'loaned':
            query += ` AND b.available_copies = 0`;
            break;
        }
      }

      if (filters.author) {
        query += ` AND b.authors LIKE ?`;
        params.push(`%"${filters.author}"%`);
      }

      query += ` GROUP BY b.id ORDER BY b.title`;

      const limit = filters.limit || 100;
      const offset = filters.offset || 0;
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const books = this.db.prepare(query).all(...params);

      // Parse JSON fields
      return books.map(book => ({
        ...book,
        authors: this.parseJSON(book.authors),
        genres: this.parseJSON(book.genres),
        tags: this.parseJSON(book.tags),
      }));
    } catch (error) {
      console.error('Failed to get books:', error);
      throw error;
    }
  }

  async getBookById(id) {
    try {
      const query = `
        SELECT
          b.*,
          COUNT(CASE WHEN t.transaction_type = 'lend' AND t.return_date IS NULL THEN 1 END) as active_loans
        FROM books b
        LEFT JOIN transactions t ON b.id = t.book_id
        WHERE b.id = ?
        GROUP BY b.id
      `;
      const book = this.db.prepare(query).get(id);

      if (!book) return null;

      // Parse JSON fields
      return {
        ...book,
        authors: this.parseJSON(book.authors),
        genres: this.parseJSON(book.genres),
        tags: this.parseJSON(book.tags),
      };
    } catch (error) {
      console.error('Failed to get book by ID:', error);
      throw error;
    }
  }

  async createBook(bookData) {
    try {
      const query = `
        INSERT INTO books (
          title, authors, isbn, publisher, publication_year, genres,
          language, total_copies, available_copies, location, tags,
          description, cover_image_path, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        bookData.title,
        this.stringifyJSON(bookData.authors),
        bookData.isbn || null,
        bookData.publisher || null,
        bookData.publicationYear || null,
        this.stringifyJSON(bookData.genres),
        bookData.language || 'en',
        bookData.totalCopies,
        bookData.totalCopies, // Initial available copies equals total
        bookData.location || null,
        this.stringifyJSON(bookData.tags),
        bookData.description || null,
        bookData.coverImagePath || null,
        'available'
      ];

      const result = this.db.prepare(query).run(...params);
      return await this.getBookById(result.lastInsertRowid);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('A book with this ISBN already exists');
      }
      console.error('Failed to create book:', error);
      throw error;
    }
  }

  async updateBook(id, bookData) {
    try {
      const query = `
        UPDATE books SET
          title = ?, authors = ?, isbn = ?, publisher = ?, publication_year = ?,
          genres = ?, language = ?, total_copies = ?, location = ?, tags = ?,
          description = ?, cover_image_path = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const params = [
        bookData.title,
        this.stringifyJSON(bookData.authors),
        bookData.isbn || null,
        bookData.publisher || null,
        bookData.publicationYear || null,
        this.stringifyJSON(bookData.genres),
        bookData.language || 'en',
        bookData.totalCopies,
        bookData.location || null,
        this.stringifyJSON(bookData.tags),
        bookData.description || null,
        bookData.coverImagePath || null,
        id
      ];

      const result = this.db.prepare(query).run(...params);

      if (result.changes === 0) {
        throw new Error('Book not found');
      }

      return await this.getBookById(id);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('A book with this ISBN already exists');
      }
      console.error('Failed to update book:', error);
      throw error;
    }
  }

  async deleteBook(id) {
    try {
      // Check if book has active loans
      const activeLoans = this.db.prepare(`
        SELECT COUNT(*) as count FROM transactions
        WHERE book_id = ? AND transaction_type = 'lend' AND return_date IS NULL
      `).get(id);

      if (activeLoans.count > 0) {
        throw new Error('Cannot delete book with active loans');
      }

      const result = this.db.prepare('DELETE FROM books WHERE id = ?').run(id);

      if (result.changes === 0) {
        throw new Error('Book not found');
      }

      return true;
    } catch (error) {
      console.error('Failed to delete book:', error);
      throw error;
    }
  }

  // Members CRUD operations
  async getAllMembers(filters = {}) {
    try {
      let query = `
        SELECT
          m.*,
          COUNT(CASE WHEN t.transaction_type = 'lend' AND t.return_date IS NULL THEN 1 END) as active_loans
        FROM members m
        LEFT JOIN transactions t ON m.id = t.member_id
        WHERE 1=1
      `;
      const params = [];

      // Build WHERE clause based on filters
      if (filters.search) {
        query += ` AND (
          m.name LIKE ? OR
          m.member_id LIKE ? OR
          m.email LIKE ? OR
          m.phone LIKE ?
        )`;
        const searchPattern = `%${filters.search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      if (filters.memberType && filters.memberType !== 'all') {
        query += ` AND m.member_type = ?`;
        params.push(filters.memberType);
      }

      if (filters.hasActiveLoans === 'yes') {
        query += ` HAVING active_loans > 0`;
      } else if (filters.hasActiveLoans === 'no') {
        query += ` HAVING active_loans = 0`;
      } else {
        query += ` GROUP BY m.id`;
      }

      query += ` ORDER BY m.name`;

      const limit = filters.limit || 100;
      const offset = filters.offset || 0;
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      return this.db.prepare(query).all(...params);
    } catch (error) {
      console.error('Failed to get members:', error);
      throw error;
    }
  }

  async getMemberById(id) {
    try {
      const query = `
        SELECT
          m.*,
          COUNT(CASE WHEN t.transaction_type = 'lend' AND t.return_date IS NULL THEN 1 END) as active_loans
        FROM members m
        LEFT JOIN transactions t ON m.id = t.member_id
        WHERE m.id = ?
        GROUP BY m.id
      `;
      return this.db.prepare(query).get(id);
    } catch (error) {
      console.error('Failed to get member by ID:', error);
      throw error;
    }
  }

  async createMember(memberData) {
    try {
      const query = `
        INSERT INTO members (
          name, member_id, email, phone, address, member_type, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        memberData.name,
        memberData.memberId,
        memberData.email || null,
        memberData.phone || null,
        memberData.address || null,
        memberData.memberType,
        memberData.notes || null
      ];

      const result = this.db.prepare(query).run(...params);
      return await this.getMemberById(result.lastInsertRowid);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        if (error.message.includes('member_id')) {
          throw new Error('A member with this ID already exists');
        }
        if (error.message.includes('email')) {
          throw new Error('A member with this email already exists');
        }
      }
      console.error('Failed to create member:', error);
      throw error;
    }
  }

  async updateMember(id, memberData) {
    try {
      const query = `
        UPDATE members SET
          name = ?, member_id = ?, email = ?, phone = ?, address = ?,
          member_type = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const params = [
        memberData.name,
        memberData.memberId,
        memberData.email || null,
        memberData.phone || null,
        memberData.address || null,
        memberData.memberType,
        memberData.notes || null,
        id
      ];

      const result = this.db.prepare(query).run(...params);

      if (result.changes === 0) {
        throw new Error('Member not found');
      }

      return await this.getMemberById(id);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        if (error.message.includes('member_id')) {
          throw new Error('A member with this ID already exists');
        }
        if (error.message.includes('email')) {
          throw new Error('A member with this email already exists');
        }
      }
      console.error('Failed to update member:', error);
      throw error;
    }
  }

  async deleteMember(id) {
    try {
      // Check if member has active loans
      const activeLoans = this.db.prepare(`
        SELECT COUNT(*) as count FROM transactions
        WHERE member_id = ? AND transaction_type = 'lend' AND return_date IS NULL
      `).get(id);

      if (activeLoans.count > 0) {
        throw new Error('Cannot delete member with active loans');
      }

      const result = this.db.prepare('DELETE FROM members WHERE id = ?').run(id);

      if (result.changes === 0) {
        throw new Error('Member not found');
      }

      return true;
    } catch (error) {
      console.error('Failed to delete member:', error);
      throw error;
    }
  }

  // Transaction operations
  async createTransaction(transactionData) {
    try {
      const query = `
        INSERT INTO transactions (
          book_id, member_id, transaction_type, due_date, notes
        ) VALUES (?, ?, ?, ?, ?)
      `;

      const params = [
        transactionData.bookId,
        transactionData.memberId,
        'lend',
        transactionData.dueDate,
        transactionData.notes || null
      ];

      const result = this.db.prepare(query).run(...params);
      return this.getTransactionById(result.lastInsertRowid);
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  }

  async getTransactionById(id) {
    try {
      const query = `
        SELECT t.*, b.title as book_title, m.name as member_name, m.member_type
        FROM transactions t
        JOIN books b ON t.book_id = b.id
        JOIN members m ON t.member_id = m.id
        WHERE t.id = ?
      `;
      return this.db.prepare(query).get(id);
    } catch (error) {
      console.error('Failed to get transaction by ID:', error);
      throw error;
    }
  }

  async getActiveTransactions() {
    try {
      const query = `
        SELECT t.*,
          b.title as book_title, b.authors as book_authors,
          m.name as member_name, m.member_type as member_type,
          CASE
            WHEN t.due_date < date('now') THEN 'overdue'
            ELSE 'on_time'
          END as status,
          (julianday('now') - julianday(t.due_date)) as days_overdue
        FROM transactions t
        JOIN books b ON t.book_id = b.id
        JOIN members m ON t.member_id = m.id
        WHERE t.transaction_type = 'lend' AND t.return_date IS NULL
        ORDER BY t.due_date ASC
      `;
      const transactions = this.db.prepare(query).all();

      // Parse JSON fields
      return transactions.map(transaction => ({
        ...transaction,
        book_authors: this.parseJSON(transaction.book_authors),
      }));
    } catch (error) {
      console.error('Failed to get active transactions:', error);
      throw error;
    }
  }

  async getOverdueTransactions() {
    try {
      const query = `
        SELECT t.*,
          b.title as book_title, b.authors as book_authors,
          m.name as member_name, m.member_type as member_type,
          (julianday('now') - julianday(t.due_date)) as days_overdue
        FROM transactions t
        JOIN books b ON t.book_id = b.id
        JOIN members m ON t.member_id = m.id
        WHERE t.transaction_type = 'lend'
          AND t.return_date IS NULL
          AND t.due_date < date('now')
        ORDER BY t.due_date ASC
      `;
      const transactions = this.db.prepare(query).all();

      // Parse JSON fields and calculate fines
      return transactions.map(transaction => ({
        ...transaction,
        book_authors: this.parseJSON(transaction.book_authors),
      }));
    } catch (error) {
      console.error('Failed to get overdue transactions:', error);
      throw error;
    }
  }

  async returnBook(transactionId, fineAmount = 0) {
    try {
      const query = `
        UPDATE transactions SET
          return_date = CURRENT_TIMESTAMP,
          fine_amount = ?,
          transaction_type = 'return'
        WHERE id = ?
      `;

      const result = this.db.prepare(query).run(fineAmount, transactionId);

      if (result.changes === 0) {
        throw new Error('Transaction not found');
      }

      return await this.getTransactionById(transactionId);
    } catch (error) {
      console.error('Failed to return book:', error);
      throw error;
    }
  }

  // Settings operations
  async getSetting(key) {
    try {
      const result = this.db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
      return result ? result.value : null;
    } catch (error) {
      console.error('Failed to get setting:', error);
      throw error;
    }
  }

  async setSetting(key, value) {
    try {
      const query = `
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `;
      this.db.prepare(query).run(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Failed to set setting:', error);
      throw error;
    }
  }

  async getAllSettings() {
    try {
      const settings = this.db.prepare('SELECT key, value FROM settings').all();
      const result = {};
      settings.forEach(setting => {
        try {
          result[setting.key] = JSON.parse(setting.value);
        } catch {
          result[setting.key] = setting.value;
        }
      });
      return result;
    } catch (error) {
      console.error('Failed to get all settings:', error);
      throw error;
    }
  }
}

// Singleton instance
let dbService = null;

function getDatabaseService() {
  if (!dbService) {
    dbService = new DatabaseService();
  }
  return dbService;
}

module.exports = {
  DatabaseService,
  getDatabaseService,
};