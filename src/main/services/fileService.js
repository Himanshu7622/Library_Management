const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

class FileService {
  constructor() {
    this.coversDir = path.join(app.getPath('userData'), 'assets', 'covers');
    this.ensureDirectoryExists(this.coversDir);
  }

  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // Cover image operations
  async saveCoverImage(imageData, filename) {
    try {
      // Parse base64 data
      const matches = imageData.match(/^data:(.+?);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid image data format');
      }

      const mimeType = matches[1];
      const base64Data = matches[2];

      // Check if image type is allowed
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(mimeType)) {
        throw new Error('Only JPEG, PNG, and WebP images are allowed');
      }

      // Get file extension
      const extension = mimeType.split('/')[1];
      const finalFilename = `${filename}.${extension}`;
      const filePath = path.join(this.coversDir, finalFilename);

      // Save image file
      fs.writeFileSync(filePath, base64Data, 'base64');

      console.log('Cover image saved:', filePath);
      return filePath;
    } catch (error) {
      console.error('Failed to save cover image:', error);
      throw error;
    }
  }

  async getCoverPath(bookId) {
    try {
      const files = fs.readdirSync(this.coversDir);
      const coverFile = files.find(file => file.startsWith(`book_${bookId}`));

      if (coverFile) {
        return path.join(this.coversDir, coverFile);
      }

      return null;
    } catch (error) {
      console.error('Failed to get cover path:', error);
      throw error;
    }
  }

  async deleteCoverImage(bookId) {
    try {
      const coverPath = await this.getCoverPath(bookId);

      if (coverPath && fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
        console.log('Cover image deleted:', coverPath);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete cover image:', error);
      throw error;
    }
  }

  // CSV Export operations
  async exportToCSV(type, data) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `${type}_export_${timestamp}.csv`;
      const filePath = path.join(app.getPath('downloads'), filename);

      let csvWriter;
      let records;

      if (type === 'books') {
        csvWriter = createCsvWriter({
          path: filePath,
          header: [
            { id: 'title', title: 'Title' },
            { id: 'authors', title: 'Authors' },
            { id: 'isbn', title: 'ISBN' },
            { id: 'publisher', title: 'Publisher' },
            { id: 'publicationYear', title: 'Publication Year' },
            { id: 'genres', title: 'Genres' },
            { id: 'language', title: 'Language' },
            { id: 'totalCopies', title: 'Total Copies' },
            { id: 'availableCopies', title: 'Available Copies' },
            { id: 'location', title: 'Location' },
            { id: 'tags', title: 'Tags' },
            { id: 'description', title: 'Description' },
            { id: 'status', title: 'Status' },
            { id: 'createdAt', title: 'Created At' }
          ]
        });

        records = data.map(book => ({
          ...book,
          authors: Array.isArray(book.authors) ? book.authors.join('; ') : book.authors,
          genres: Array.isArray(book.genres) ? book.genres.join('; ') : book.genres,
          tags: Array.isArray(book.tags) ? book.tags.join('; ') : book.tags,
          publicationYear: book.publicationYear || '',
          publisher: book.publisher || '',
          location: book.location || '',
          tags: book.tags || '',
          description: book.description || ''
        }));
      } else if (type === 'members') {
        csvWriter = createCsvWriter({
          path: filePath,
          header: [
            { id: 'name', title: 'Name' },
            { id: 'memberId', title: 'Member ID' },
            { id: 'email', title: 'Email' },
            { id: 'phone', title: 'Phone' },
            { id: 'address', title: 'Address' },
            { id: 'memberType', title: 'Member Type' },
            { id: 'notes', title: 'Notes' },
            { id: 'createdAt', title: 'Created At' }
          ]
        });

        records = data.map(member => ({
          ...member,
          email: member.email || '',
          phone: member.phone || '',
          address: member.address || '',
          notes: member.notes || ''
        }));
      } else if (type === 'transactions') {
        csvWriter = createCsvWriter({
          path: filePath,
          header: [
            { id: 'id', title: 'Transaction ID' },
            { id: 'book_title', title: 'Book Title' },
            { id: 'member_name', title: 'Member Name' },
            { id: 'member_id', title: 'Member ID' },
            { id: 'transaction_type', title: 'Transaction Type' },
            { id: 'transaction_date', title: 'Transaction Date' },
            { id: 'due_date', title: 'Due Date' },
            { id: 'return_date', title: 'Return Date' },
            { id: 'fine_amount', title: 'Fine Amount' },
            { id: 'fine_paid', title: 'Fine Paid' },
            { id: 'notes', title: 'Notes' }
          ]
        });

        records = data.map(transaction => ({
          ...transaction,
          return_date: transaction.return_date || '',
          fine_amount: transaction.fine_amount || 0,
          notes: transaction.notes || ''
        }));
      } else {
        throw new Error('Invalid export type');
      }

      await csvWriter.writeRecords(records);
      console.log(`${type} exported to CSV:`, filePath);

      return filePath;
    } catch (error) {
      console.error('Failed to export CSV:', error);
      throw error;
    }
  }

  // CSV Import operations
  async importFromCSV(filePath, type) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }

      const results = [];
      const errors = [];
      const duplicates = [];
      let processed = 0;
      let imported = 0;

      return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => {
            processed++;
            try {
              const processedData = this.processCSVRow(data, type);
              if (processedData) {
                results.push(processedData);
              } else {
                errors.push(`Row ${processed}: Invalid data format`);
              }
            } catch (error) {
              errors.push(`Row ${processed}: ${error.message}`);
            }
          })
          .on('end', () => {
            try {
              // Process and validate results
              const { validRecords, validationErrors, duplicateRecords } = this.validateImportData(results, type);

              imported = validRecords.length;
              errors.push(...validationErrors);
              duplicates.push(...duplicateRecords);

              resolve({
                success: true,
                processed,
                imported,
                errors,
                duplicates,
                data: validRecords
              });
            } catch (error) {
              reject(error);
            }
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    } catch (error) {
      console.error('Failed to import CSV:', error);
      throw error;
    }
  }

  processCSVRow(data, type) {
    if (type === 'books') {
      return {
        title: data.Title || data.title,
        authors: (data.Authors || data.authors || '').split(';').map(a => a.trim()).filter(a => a),
        isbn: data.ISBN || data.isbn || '',
        publisher: data.Publisher || data.publisher || '',
        publicationYear: parseInt(data['Publication Year'] || data.publicationYear) || null,
        genres: (data.Genres || data.genres || '').split(';').map(g => g.trim()).filter(g => g),
        language: data.Language || data.language || 'en',
        totalCopies: parseInt(data['Total Copies'] || data.totalCopies) || 1,
        location: data.Location || data.location || '',
        tags: (data.Tags || data.tags || '').split(';').map(t => t.trim()).filter(t => t),
        description: data.Description || data.description || '',
        status: data.Status || data.status || 'available'
      };
    } else if (type === 'members') {
      return {
        name: data.Name || data.name,
        memberId: data['Member ID'] || data.memberId || '',
        email: data.Email || data.email || '',
        phone: data.Phone || data.phone || '',
        address: data.Address || data.address || '',
        memberType: data['Member Type'] || data.memberType || 'public',
        notes: data.Notes || data.notes || ''
      };
    } else {
      throw new Error('Invalid import type');
    }
  }

  validateImportData(data, type) {
    const validRecords = [];
    const validationErrors = [];
    const duplicateRecords = [];

    data.forEach((record, index) => {
      try {
        // Basic validation
        if (type === 'books') {
          if (!record.title || record.title.trim().length === 0) {
            validationErrors.push(`Row ${index + 1}: Title is required`);
            return;
          }

          if (!record.authors || record.authors.length === 0) {
            validationErrors.push(`Row ${index + 1}: At least one author is required`);
            return;
          }

          // Check for duplicates (ISBN)
          if (record.isbn && record.isbn.trim() !== '') {
            // In a real implementation, you'd check against existing database records
            // For now, we'll just check within the import data
            const duplicate = validRecords.find(r => r.isbn === record.isbn);
            if (duplicate) {
              duplicateRecords.push(`Row ${index + 1}: Duplicate ISBN ${record.isbn}`);
              return;
            }
          }

          // Validate publication year
          if (record.publicationYear && (record.publicationYear < 1000 || record.publicationYear > new Date().getFullYear())) {
            validationErrors.push(`Row ${index + 1}: Invalid publication year`);
            return;
          }

          // Validate total copies
          if (record.totalCopies < 1 || record.totalCopies > 1000) {
            validationErrors.push(`Row ${index + 1}: Total copies must be between 1 and 1000`);
            return;
          }

        } else if (type === 'members') {
          if (!record.name || record.name.trim().length < 2) {
            validationErrors.push(`Row ${index + 1}: Name must be at least 2 characters long`);
            return;
          }

          if (!record.memberId || record.memberId.trim().length < 3) {
            validationErrors.push(`Row ${index + 1}: Member ID must be at least 3 characters long`);
            return;
          }

          // Validate email format if provided
          if (record.email && record.email.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(record.email)) {
              validationErrors.push(`Row ${index + 1}: Invalid email format`);
              return;
            }
          }

          // Check for duplicates (Member ID or Email)
          const duplicate = validRecords.find(r =>
            r.memberId === record.memberId ||
            (r.email && record.email && r.email === record.email)
          );
          if (duplicate) {
            duplicateRecords.push(`Row ${index + 1}: Duplicate member ID or email`);
            return;
          }
        }

        validRecords.push(record);
      } catch (error) {
        validationErrors.push(`Row ${index + 1}: ${error.message}`);
      }
    });

    return {
      validRecords,
      validationErrors,
      duplicateRecords
    };
  }

  // File utility methods
  getFileStats(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        sizeFormatted: this.formatFileSize(stats.size),
        modified: stats.mtime,
        created: stats.birthtime
      };
    } catch (error) {
      throw new Error('File not found or inaccessible');
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Clean up old files (maintenance)
  async cleanupOldFiles(daysOld = 30) {
    try {
      const files = fs.readdirSync(this.coversDir);
      const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.coversDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      console.log(`Cleaned up ${deletedCount} old cover files`);
      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup old files:', error);
      throw error;
    }
  }

  // Get directory statistics
  getDirectoryStats() {
    try {
      const files = fs.readdirSync(this.coversDir);
      let totalSize = 0;

      const fileDetails = files.map(file => {
        const filePath = path.join(this.coversDir, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;

        return {
          name: file,
          size: stats.size,
          sizeFormatted: this.formatFileSize(stats.size),
          modified: stats.mtime
        };
      });

      return {
        totalFiles: files.length,
        totalSize,
        totalSizeFormatted: this.formatFileSize(totalSize),
        directory: this.coversDir,
        files: fileDetails.sort((a, b) => b.modified - a.modified)
      };
    } catch (error) {
      console.error('Failed to get directory stats:', error);
      throw error;
    }
  }
}

module.exports = FileService;