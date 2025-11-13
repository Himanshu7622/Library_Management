const { ipcMain, dialog } = require('electron');
const { getDatabaseService } = require('./database/services');
const { getDatabase } = require('./database/database');
const FileService = require('./services/fileService');
const AuthService = require('./services/authService');
const { format, addDays, differenceInDays } = require('date-fns');

class IPCHandlers {
  constructor() {
    this.dbService = getDatabaseService();
    this.fileService = new FileService();
    this.authService = new AuthService();
    this.setupHandlers();
  }

  setupHandlers() {
    this.setupBookHandlers();
    this.setupMemberHandlers();
    this.setupTransactionHandlers();
    this.setupFileHandlers();
    this.setupSettingsHandlers();
    this.setupAuthHandlers();
    this.setupSystemHandlers();
  }

  // Book IPC handlers
  setupBookHandlers() {
    ipcMain.handle('books:getAll', async (event, filters = {}) => {
      try {
        const books = await this.dbService.getAllBooks(filters);
        return { success: true, data: books };
      } catch (error) {
        console.error('Error in books:getAll:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('books:getById', async (event, id) => {
      try {
        const book = await this.dbService.getBookById(id);
        if (!book) {
          return { success: false, error: 'Book not found' };
        }
        return { success: true, data: book };
      } catch (error) {
        console.error('Error in books:getById:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('books:create', async (event, bookData) => {
      try {
        // Validate input
        if (!bookData.title || !bookData.authors || bookData.authors.length === 0) {
          return { success: false, error: 'Title and at least one author are required' };
        }

        if (bookData.totalCopies && (bookData.totalCopies < 1 || bookData.totalCopies > 1000)) {
          return { success: false, error: 'Total copies must be between 1 and 1000' };
        }

        // Handle cover image if provided
        if (bookData.coverImage && bookData.coverImage.startsWith('data:image')) {
          const coverPath = await this.fileService.saveCoverImage(
            bookData.coverImage,
            `book_${Date.now()}`
          );
          bookData.coverImagePath = coverPath;
          delete bookData.coverImage;
        }

        const book = await this.dbService.createBook(bookData);
        return { success: true, data: book };
      } catch (error) {
        console.error('Error in books:create:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('books:update', async (event, id, bookData) => {
      try {
        // Validate input
        if (!bookData.title || !bookData.authors || bookData.authors.length === 0) {
          return { success: false, error: 'Title and at least one author are required' };
        }

        if (bookData.totalCopies && (bookData.totalCopies < 1 || bookData.totalCopies > 1000)) {
          return { success: false, error: 'Total copies must be between 1 and 1000' };
        }

        // Handle cover image if provided
        if (bookData.coverImage) {
          if (bookData.coverImage.startsWith('data:image')) {
            // New image uploaded
            const coverPath = await this.fileService.saveCoverImage(
              bookData.coverImage,
              `book_${id}_${Date.now()}`
            );
            bookData.coverImagePath = coverPath;
          } else if (bookData.coverImage === null) {
            // Remove existing cover
            await this.fileService.deleteCoverImage(id);
            bookData.coverImagePath = null;
          }
          delete bookData.coverImage;
        }

        const book = await this.dbService.updateBook(id, bookData);
        return { success: true, data: book };
      } catch (error) {
        console.error('Error in books:update:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('books:delete', async (event, id) => {
      try {
        await this.dbService.deleteBook(id);
        return { success: true };
      } catch (error) {
        console.error('Error in books:delete:', error);
        return { success: false, error: error.message };
      }
    });
  }

  // Member IPC handlers
  setupMemberHandlers() {
    ipcMain.handle('members:getAll', async (event, filters = {}) => {
      try {
        const members = await this.dbService.getAllMembers(filters);
        return { success: true, data: members };
      } catch (error) {
        console.error('Error in members:getAll:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('members:getById', async (event, id) => {
      try {
        const member = await this.dbService.getMemberById(id);
        if (!member) {
          return { success: false, error: 'Member not found' };
        }
        return { success: true, data: member };
      } catch (error) {
        console.error('Error in members:getById:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('members:create', async (event, memberData) => {
      try {
        // Validate input
        if (!memberData.name || memberData.name.trim().length < 2) {
          return { success: false, error: 'Name must be at least 2 characters long' };
        }

        if (!memberData.memberId || memberData.memberId.length < 3) {
          return { success: false, error: 'Member ID must be at least 3 characters long' };
        }

        // Validate email format if provided
        if (memberData.email && !this.isValidEmail(memberData.email)) {
          return { success: false, error: 'Invalid email format' };
        }

        const member = await this.dbService.createMember(memberData);
        return { success: true, data: member };
      } catch (error) {
        console.error('Error in members:create:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('members:update', async (event, id, memberData) => {
      try {
        // Validate input
        if (!memberData.name || memberData.name.trim().length < 2) {
          return { success: false, error: 'Name must be at least 2 characters long' };
        }

        if (!memberData.memberId || memberData.memberId.length < 3) {
          return { success: false, error: 'Member ID must be at least 3 characters long' };
        }

        // Validate email format if provided
        if (memberData.email && !this.isValidEmail(memberData.email)) {
          return { success: false, error: 'Invalid email format' };
        }

        const member = await this.dbService.updateMember(id, memberData);
        return { success: true, data: member };
      } catch (error) {
        console.error('Error in members:update:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('members:delete', async (event, id) => {
      try {
        await this.dbService.deleteMember(id);
        return { success: true };
      } catch (error) {
        console.error('Error in members:delete:', error);
        return { success: false, error: error.message };
      }
    });
  }

  // Transaction IPC handlers
  setupTransactionHandlers() {
    ipcMain.handle('transactions:lend', async (event, bookId, memberId, dueDate) => {
      try {
        // Validate input
        if (!bookId || !memberId) {
          return { success: false, error: 'Book ID and Member ID are required' };
        }

        // Check book availability
        const book = await this.dbService.getBookById(bookId);
        if (!book) {
          return { success: false, error: 'Book not found' };
        }

        if (book.availableCopies <= 0) {
          return { success: false, error: 'Book is not available for lending' };
        }

        // Check member exists
        const member = await this.dbService.getMemberById(memberId);
        if (!member) {
          return { success: false, error: 'Member not found' };
        }

        // Calculate due date if not provided
        let calculatedDueDate = dueDate;
        if (!calculatedDueDate) {
          const settings = await this.dbService.getAllSettings();
          const lendingPeriods = settings.lendingPeriods || {
            student: 14,
            faculty: 30,
            public: 7
          };
          const period = lendingPeriods[member.memberType] || 14;
          calculatedDueDate = format(addDays(new Date(), period), 'yyyy-MM-dd');
        }

        const transactionData = {
          bookId,
          memberId,
          dueDate: calculatedDueDate,
          notes: `Book lent to ${member.name} (${member.memberId})`
        };

        const transaction = await this.dbService.createTransaction(transactionData);
        return { success: true, data: transaction };
      } catch (error) {
        console.error('Error in transactions:lend:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('transactions:return', async (event, transactionId) => {
      try {
        if (!transactionId) {
          return { success: false, error: 'Transaction ID is required' };
        }

        // Get transaction details
        const transaction = await this.dbService.getTransactionById(transactionId);
        if (!transaction) {
          return { success: false, error: 'Transaction not found' };
        }

        if (transaction.return_date) {
          return { success: false, error: 'Book has already been returned' };
        }

        // Calculate fine if overdue
        let fineAmount = 0;
        if (new Date(transaction.due_date) < new Date()) {
          const daysOverdue = differenceInDays(new Date(), new Date(transaction.due_date));
          if (daysOverdue > 0) {
            const settings = await this.dbService.getAllSettings();
            const fineRules = settings.fineRules || {
              student: { dailyRate: 5, maxFine: 500 },
              faculty: { dailyRate: 3, maxFine: 300 },
              public: { dailyRate: 10, maxFine: 1000 }
            };

            const memberType = transaction.member_type;
            const dailyRate = fineRules[memberType]?.dailyRate || 5;
            const maxFine = fineRules[memberType]?.maxFine || 500;

            fineAmount = Math.min(daysOverdue * dailyRate, maxFine);
          }
        }

        const updatedTransaction = await this.dbService.returnBook(transactionId, fineAmount);
        return { success: true, data: updatedTransaction };
      } catch (error) {
        console.error('Error in transactions:return:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('transactions:getActive', async (event) => {
      try {
        const transactions = await this.dbService.getActiveTransactions();
        return { success: true, data: transactions };
      } catch (error) {
        console.error('Error in transactions:getActive:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('transactions:getOverdue', async (event) => {
      try {
        const transactions = await this.dbService.getOverdueTransactions();
        return { success: true, data: transactions };
      } catch (error) {
        console.error('Error in transactions:getOverdue:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('transactions:getByMemberId', async (event, memberId) => {
      try {
        const db = getDatabase().getDb();
        const transactions = db.prepare(`
          SELECT t.*, b.title as book_title, b.authors as book_authors
          FROM transactions t
          JOIN books b ON t.book_id = b.id
          WHERE t.member_id = ?
          ORDER BY t.transaction_date DESC
        `).all(memberId);

        // Parse JSON fields
        const parsedTransactions = transactions.map(transaction => ({
          ...transaction,
          book_authors: JSON.parse(transaction.book_authors || '[]'),
        }));

        return { success: true, data: parsedTransactions };
      } catch (error) {
        console.error('Error in transactions:getByMemberId:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('transactions:getHistory', async (event, limit = 50) => {
      try {
        const db = getDatabase().getDb();
        const transactions = db.prepare(`
          SELECT t.*, b.title as book_title, m.name as member_name
          FROM transactions t
          JOIN books b ON t.book_id = b.id
          JOIN members m ON t.member_id = m.id
          ORDER BY t.transaction_date DESC
          LIMIT ?
        `).all(limit);

        return { success: true, data: transactions };
      } catch (error) {
        console.error('Error in transactions:getHistory:', error);
        return { success: false, error: error.message };
      }
    });
  }

  // File IPC handlers
  setupFileHandlers() {
    ipcMain.handle('files:saveCover', async (event, imageData, filename) => {
      try {
        const coverPath = await this.fileService.saveCoverImage(imageData, filename);
        return { success: true, data: { path: coverPath } };
      } catch (error) {
        console.error('Error in files:saveCover:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('files:getCoverPath', async (event, bookId) => {
      try {
        const coverPath = await this.fileService.getCoverPath(bookId);
        return { success: true, data: { path: coverPath } };
      } catch (error) {
        console.error('Error in files:getCoverPath:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('files:deleteCover', async (event, bookId) => {
      try {
        await this.fileService.deleteCoverImage(bookId);
        return { success: true };
      } catch (error) {
        console.error('Error in files:deleteCover:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('files:exportCSV', async (event, type, data) => {
      try {
        const filePath = await this.fileService.exportToCSV(type, data);
        return { success: true, data: { filePath } };
      } catch (error) {
        console.error('Error in files:exportCSV:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('files:importCSV', async (event, filePath, type) => {
      try {
        const result = await this.fileService.importFromCSV(filePath, type);
        return { success: true, data: result };
      } catch (error) {
        console.error('Error in files:importCSV:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('files:backupDB', async (event) => {
      try {
        const db = getDatabase();
        const result = await dialog.showSaveDialog({
          title: 'Backup Database',
          defaultPath: `library_backup_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.db`,
          filters: [
            { name: 'Database Files', extensions: ['db'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });

        if (!result.canceled) {
          const backupPath = await db.backup(result.filePath);
          return { success: true, data: { backupPath } };
        } else {
          return { success: false, error: 'Backup cancelled' };
        }
      } catch (error) {
        console.error('Error in files:backupDB:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('files:restoreDB', async (event, backupPath) => {
      try {
        const db = getDatabase();
        await db.restore(backupPath);
        return { success: true };
      } catch (error) {
        console.error('Error in files:restoreDB:', error);
        return { success: false, error: error.message };
      }
    });
  }

  // Settings IPC handlers
  setupSettingsHandlers() {
    ipcMain.handle('settings:get', async (event, key) => {
      try {
        const value = await this.dbService.getSetting(key);
        return { success: true, data: value };
      } catch (error) {
        console.error('Error in settings:get:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('settings:set', async (event, key, value) => {
      try {
        await this.dbService.setSetting(key, value);
        return { success: true };
      } catch (error) {
        console.error('Error in settings:set:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('settings:getAll', async (event) => {
      try {
        const settings = await this.dbService.getAllSettings();
        return { success: true, data: settings };
      } catch (error) {
        console.error('Error in settings:getAll:', error);
        return { success: false, error: error.message };
      }
    });
  }

  // Authentication IPC handlers
  setupAuthHandlers() {
    ipcMain.handle('auth:login', async (event, pin) => {
      try {
        const result = await this.authService.login(pin);
        return { success: true, data: result };
      } catch (error) {
        console.error('Error in auth:login:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('auth:logout', async (event) => {
      try {
        await this.authService.logout();
        return { success: true };
      } catch (error) {
        console.error('Error in auth:logout:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('auth:setup', async (event, pin) => {
      try {
        const result = await this.authService.setup(pin);
        return { success: true, data: result };
      } catch (error) {
        console.error('Error in auth:setup:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('auth:changePin', async (event, oldPin, newPin) => {
      try {
        await this.authService.changePin(oldPin, newPin);
        return { success: true };
      } catch (error) {
        console.error('Error in auth:changePin:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('auth:checkAuth', async (event) => {
      try {
        const isAuthenticated = await this.authService.checkAuth();
        return { success: true, data: { isAuthenticated } };
      } catch (error) {
        console.error('Error in auth:checkAuth:', error);
        return { success: false, error: error.message };
      }
    });
  }

  // System IPC handlers
  setupSystemHandlers() {
    ipcMain.handle('system:getVersion', async (event) => {
      try {
        const { app } = require('electron');
        return { success: true, data: { version: app.getVersion() } };
      } catch (error) {
        console.error('Error in system:getVersion:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('system:getAppPath', async (event) => {
      try {
        const { app } = require('electron');
        return { success: true, data: { path: app.getPath('userData') } };
      } catch (error) {
        console.error('Error in system:getAppPath:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('dialog:showSaveDialog', async (event, options) => {
      try {
        const result = await dialog.showSaveDialog(options);
        return { success: true, data: result };
      } catch (error) {
        console.error('Error in dialog:showSaveDialog:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('dialog:showOpenDialog', async (event, options) => {
      try {
        const result = await dialog.showOpenDialog(options);
        return { success: true, data: result };
      } catch (error) {
        console.error('Error in dialog:showOpenDialog:', error);
        return { success: false, error: error.message };
      }
    });
  }

  // Helper methods
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * Setup IPC handlers
 */
function setupIpcHandlers() {
  return new IPCHandlers();
}

module.exports = {
  IPCHandlers,
  setupIpcHandlers,
};