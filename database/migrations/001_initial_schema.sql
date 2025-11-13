-- Library Management System - Initial Schema
-- Migration 001: Create initial database tables

-- Books table
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    authors TEXT NOT NULL,           -- JSON array of author names
    isbn TEXT UNIQUE,               -- Optional ISBN-13
    publisher TEXT,
    publication_year INTEGER,
    genres TEXT NOT NULL,           -- JSON array of genres
    language TEXT DEFAULT 'en',
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    location TEXT,                  -- Shelf location code
    tags TEXT,                      -- JSON array of tags
    description TEXT,               -- Short description
    cover_image_path TEXT,          -- Local file path or base64
    status TEXT DEFAULT 'available', -- available, loaned, reserved
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_total_copies CHECK (total_copies > 0),
    CONSTRAINT chk_available_copies CHECK (available_copies >= 0),
    CONSTRAINT chk_available_not_more_than_total CHECK (available_copies <= total_copies),
    CONSTRAINT chk_status CHECK (status IN ('available', 'loaned', 'reserved')),
    CONSTRAINT chk_publication_year CHECK (publication_year >= 1000 AND publication_year <= strftime('%Y', 'now')),
    CONSTRAINT chk_language_length CHECK (length(language) = 2)
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    member_id TEXT UNIQUE NOT NULL, -- Unique member identifier
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    member_type TEXT DEFAULT 'public', -- student, faculty, public
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_name_length CHECK (length(name) >= 2),
    CONSTRAINT chk_member_id_length CHECK (length(member_id) >= 3),
    CONSTRAINT chk_member_type CHECK (member_type IN ('student', 'faculty', 'public'))
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    transaction_type TEXT NOT NULL, -- 'lend' or 'return'
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME,
    return_date DATETIME,
    fine_amount REAL DEFAULT 0,
    fine_paid BOOLEAN DEFAULT FALSE,
    notes TEXT,

    -- Foreign keys
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT chk_transaction_type CHECK (transaction_type IN ('lend', 'return')),
    CONSTRAINT chk_fine_amount CHECK (fine_amount >= 0),
    CONSTRAINT chk_due_date_after_lend CHECK (due_date IS NULL OR due_date >= transaction_date),
    CONSTRAINT chk_return_date_after_lend CHECK (return_date IS NULL OR return_date >= transaction_date)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Migrations table to track applied migrations
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance

-- Books indexes
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_authors ON books(authors);
CREATE INDEX IF NOT EXISTS idx_books_genres ON books(genres);
CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);

-- Members indexes
CREATE INDEX IF NOT EXISTS idx_members_member_id ON members(member_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
CREATE INDEX IF NOT EXISTS idx_members_type ON members(member_type);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_book_id ON transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_transactions_member_id ON transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_return_date ON transactions(return_date);
CREATE INDEX IF NOT EXISTS idx_transactions_active ON transactions(return_date) WHERE return_date IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_overdue ON transactions(due_date)
WHERE return_date IS NULL AND due_date < date('now');

-- Settings indexes
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Triggers for automatic timestamp updates

-- Update books.updated_at on modification
CREATE TRIGGER IF NOT EXISTS update_books_updated_at
    AFTER UPDATE ON books
    FOR EACH ROW
BEGIN
    UPDATE books SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update members.updated_at on modification
CREATE TRIGGER IF NOT EXISTS update_members_updated_at
    AFTER UPDATE ON members
    FOR EACH ROW
BEGIN
    UPDATE members SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update settings.updated_at on modification
CREATE TRIGGER IF NOT EXISTS update_settings_updated_at
    AFTER UPDATE ON settings
    FOR EACH ROW
BEGIN
    UPDATE settings SET updated_at = CURRENT_TIMESTAMP WHERE "key" = NEW.key;
END;

-- Trigger to maintain book availability status
CREATE TRIGGER IF NOT EXISTS update_book_status_on_lend
    AFTER INSERT ON transactions
    WHEN NEW.transaction_type = 'lend'
BEGIN
    UPDATE books
    SET
        available_copies = available_copies - 1,
        status = CASE
            WHEN available_copies - 1 = 0 THEN 'loaned'
            WHEN available_copies - 1 > 0 THEN 'available'
            ELSE 'reserved'
        END
    WHERE id = NEW.book_id;
END;

CREATE TRIGGER IF NOT EXISTS update_book_status_on_return
    AFTER UPDATE ON transactions
    WHEN OLD.return_date IS NULL AND NEW.return_date IS NOT NULL
BEGIN
    UPDATE books
    SET
        available_copies = available_copies + 1,
        status = 'available'
    WHERE id = NEW.book_id;
END;

-- View for active transactions (loans)
CREATE VIEW IF NOT EXISTS active_loans AS
SELECT
    t.id,
    t.book_id,
    t.member_id,
    t.transaction_date,
    t.due_date,
    t.fine_amount,
    t.notes,
    b.title as book_title,
    b.authors as book_authors,
    m.name as member_name,
    m.member_id as member_identifier,
    m.member_type,
    CASE
        WHEN t.due_date < date('now') THEN 'overdue'
        WHEN t.due_date >= date('now') THEN 'on_time'
    END as status,
    (julianday('now') - julianday(t.due_date)) as days_overdue
FROM transactions t
JOIN books b ON t.book_id = b.id
JOIN members m ON t.member_id = m.id
WHERE t.transaction_type = 'lend' AND t.return_date IS NULL;

-- View for overdue books
CREATE VIEW IF NOT EXISTS overdue_loans AS
SELECT
    al.*,
    (julianday('now') - julianday(al.due_date)) as days_overdue
FROM active_loans al
WHERE al.due_date < date('now');

-- View for member statistics
CREATE VIEW IF NOT EXISTS member_statistics AS
SELECT
    m.id,
    m.name,
    m.member_id,
    m.member_type,
    COUNT(t.id) as total_transactions,
    COUNT(CASE WHEN t.transaction_type = 'lend' AND t.return_date IS NULL THEN 1 END) as active_loans,
    COUNT(CASE WHEN t.transaction_type = 'return' THEN 1 END) as returned_books,
    COALESCE(SUM(t.fine_amount), 0) as total_fines,
    COALESCE(SUM(CASE WHEN t.fine_paid = TRUE THEN t.fine_amount ELSE 0 END), 0) as paid_fines
FROM members m
LEFT JOIN transactions t ON m.id = t.member_id
GROUP BY m.id, m.name, m.member_id, m.member_type;

-- View for book statistics
CREATE VIEW IF NOT EXISTS book_statistics AS
SELECT
    b.id,
    b.title,
    b.authors,
    b.isbn,
    b.total_copies,
    b.available_copies,
    COUNT(t.id) as total_loans,
    COUNT(CASE WHEN t.transaction_type = 'lend' AND t.return_date IS NULL THEN 1 END) as current_loans,
    b.status,
    CASE
        WHEN b.total_copies > 0 THEN ROUND((CAST(b.total_copies - b.available_copies AS FLOAT) / b.total_copies) * 100, 2)
        ELSE 0
    END as utilization_percentage
FROM books b
LEFT JOIN transactions t ON b.id = t.book_id AND t.transaction_type = 'lend'
GROUP BY b.id, b.title, b.authors, b.isbn, b.total_copies, b.available_copies, b.status;