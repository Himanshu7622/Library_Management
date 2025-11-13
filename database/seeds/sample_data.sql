-- Library Management System - Sample Data
-- This file contains sample data for testing and demonstration

-- Clear existing data (in reverse order of foreign key dependencies)
DELETE FROM transactions;
DELETE FROM books;
DELETE FROM members;
DELETE FROM settings;

-- Insert sample settings
INSERT OR REPLACE INTO settings (key, value) VALUES
('fineRules', '{"student": {"dailyRate": 5, "gracePeriod": 0, "maxFine": 500}, "faculty": {"dailyRate": 3, "gracePeriod": 3, "maxFine": 300}, "public": {"dailyRate": 10, "gracePeriod": 0, "maxFine": 1000}}'),
('lendingPeriods', '{"student": 14, "faculty": 30, "public": 7}'),
('authentication', '{"enabled": true, "sessionTimeout": 30, "maxAttempts": 5, "lockoutDuration": 15}'),
('database', '{"autoBackup": true, "backupFrequency": "weekly", "maxBackups": 10}'),
('ui', '{"theme": "light", "language": "en", "dateFormat": "MM/dd/yyyy", "itemsPerPage": 20}');

-- Insert sample books
INSERT INTO books (title, authors, isbn, publisher, publication_year, genres, language, total_copies, available_copies, location, tags, description, status) VALUES
('The Great Gatsby', '["F. Scott Fitzgerald"]', '9780743273565', 'Scribner', 1925, '["Fiction", "Classic", "Literature"]', 'en', 3, 2, 'A1-F2', '["American Dream", "1920s", "Romance"]', 'A classic American novel set in the Jazz Age.', 'available'),
('To Kill a Mockingbird', '["Harper Lee"]', '9780061120084', 'J.B. Lippincott & Co.', 1960, '["Fiction", "Classic", "Legal", "Drama"]', 'en', 5, 3, 'B2-C1', '["Racism", "Justice", "Southern Gothic"]', 'A gripping tale of racial injustice and childhood innocence.', 'available'),
('1984', '["George Orwell"]', '9780451524935', 'Secker & Warburg', 1949, '["Fiction", "Dystopian", "Science Fiction", "Political"]', 'en', 4, 1, 'C3-D4', '["Totalitarianism", "Surveillance", "Future"]', 'A dystopian social science fiction novel and cautionary tale.', 'loaned'),
('Pride and Prejudice', '["Jane Austen"]', '9780141439518', 'T. Egerton', 1813, '["Fiction", "Classic", "Romance", "Novel"]', 'en', 2, 2, 'E1-F2', '["Love", "Marriage", "Social Class"]', 'A romantic novel of manners written by Jane Austen.', 'available'),
('The Catcher in the Rye', '["J.D. Salinger"]', '9780316769174', 'Little, Brown and Company', 1951, '["Fiction", "Coming-of-age", "Contemporary"]', 'en', 3, 0, 'F5-G6', '["Teenage", "Rebellion", "New York"]', 'The story of teenage rebellion and angst.', 'loaned'),
('Brave New World', '["Aldous Huxley"]', '9780060850524', 'Chatto & Windus', 1932, '["Fiction", "Dystopian", "Science Fiction"]', 'en', 2, 2, 'G7-H8', '["Future Society", "Genetics", "Control"]', 'A dystopian novel set in a futuristic World State.', 'available'),
('The Hobbit', '["J.R.R. Tolkien"]', '9780345339683', 'George Allen & Unwin', 1937, '["Fantasy", "Adventure", "Classic"]', 'en', 6, 4, 'H1-I2', '["Adventure", "Dragons", "Middle-earth"]', 'A fantasy novel about the adventure of Bilbo Baggins.', 'available'),
('Harry Potter and the Sorcerer''s Stone', '["J.K. Rowling"]', '9780590353427', 'Scholastic', 1997, '["Fantasy", "Young Adult", "Magic"]', 'en', 8, 5, 'I3-J4', '["Magic", "Wizards", "Hogwarts"]', 'The first book in the Harry Potter series.', 'available'),
('The Lord of the Rings', '["J.R.R. Tolkien"]', '9780618640157', 'George Allen & Unwin', 1954, '["Fantasy", "Epic", "Adventure"]', 'en', 3, 1, 'J5-K6', '["Equestria", "Adventure", "Good vs Evil"]', 'An epic high-fantasy novel.', 'loaned'),
('Animal Farm', '["George Orwell"]', '9780451526342', 'Secker & Warburg', 1945, '["Fiction", "Political Satire", "Dystopian"]', 'en', 4, 4, 'K7-L8', '["Politics", "Allegory", "Revolution"]', 'An allegorical novella reflecting events leading up to the Russian Revolution.', 'available'),
('The Diary of a Young Girl', '["Anne Frank"]', '9780553296983', 'Contact Publishing', 1947, '["Autobiography", "History", "World War II"]', 'en', 2, 2, 'L1-M2', '["Holocaust", "Jewish", "Hidden"]', 'The diary of a Jewish teenager hiding from the Nazis.', 'available'),
('The Alchemist', '["Paulo Coelho"]', '9780061122415', 'HarperCollins', 1988, '["Fiction", "Philosophy", "Adventure"]', 'en', 5, 3, 'M3-N4', '["Journey", "Dreams", "Philosophy"]', 'A philosophical book about a shepherd boy''s journey.', 'available'),
('Sapiens: A Brief History of Humankind', '["Yuval Noah Harari"]', '9780062316097', 'Harper', 2011, '["Non-fiction", "History", "Anthropology"]', 'en', 3, 2, 'N5-O6', '["Evolution", "Human History", "Civilization"]', 'A brief history of the human race from the Stone Age to the modern age.', 'available'),
('Educated: A Memoir', '["Tara Westover"]', '9780399590504', 'Random House', 2018, '["Memoir", "Autobiography", "Education"]', 'en', 2, 1, 'O7-P8', '["Education", "Family", "Survival"]', 'A memoir about a woman who grows up in a survivalist family.', 'loaned'),
('The Silent Patient', '["Alex Michaelides"]', '9781250301697', 'Celadon Books', 2019, '["Fiction", "Thriller", "Mystery", "Psychological"]', 'en', 4, 3, 'P1-Q2', '["Psychology", "Mystery", "Suspense"]', 'A psychological thriller about a woman who shoots her husband.', 'available'),
('Where the Crawdads Sing', '["Delia Owens"]', '9780735219090', 'G.P. Putnam''s Sons', 2018, '["Fiction", "Mystery", "Romance"]', 'en', 3, 2, 'Q3-R4', '["Nature", "Mystery", "Coming-of-age"]', 'A coming-of-age murder mystery set in the marshes of North Carolina.', 'available'),
('The Midnight Library', '["Matt Haig"]', '9780525559474', 'Viking', 2020, '["Fiction", "Fantasy", "Philosophy"]', 'en', 2, 2, 'R5-S6', '["Parallel Lives", "Regret", "Choice"]', 'A fantasy novel about a library between life and death.', 'available'),
('Atomic Habits', '["James Clear"]', '9780735211292', 'Avery', 2018, '["Self-help", "Psychology", "Productivity"]', 'en', 6, 5, 'S7-T8', '["Habits", "Self-improvement", "Success"]', 'A practical guide to building good habits and breaking bad ones.', 'available'),
('The Psychology of Money', '["Morgan Housel"]', '9780857197689', 'Harriman House', 2020, '["Finance", "Psychology", "Investing"]', 'en', 4, 4, 'T1-U2', '["Money", "Investing", "Behavior"]', 'Timeless lessons on wealth, greed, and happiness.', 'available'),
('Clean Code: A Handbook of Agile Software Craftsmanship', '["Robert C. Martin"]', '9780132350884', 'Prentice Hall', 2008, '["Programming", "Software Engineering", "Technology"]', 'en', 5, 3, 'U3-V4', '["Software Development", "Best Practices", "Agile"]', 'A handbook of agile software craftsmanship.', 'available');

-- Insert sample members
INSERT INTO members (name, member_id, email, phone, address, member_type, notes) VALUES
('John Smith', 'MEM-2024-0001', 'john.smith@email.com', '555-0101', '123 Main St, Springfield, IL 62701', 'student', 'Computer Science major, avid reader.'),
('Emily Johnson', 'MEM-2024-0002', 'emily.johnson@university.edu', '555-0102', '456 Oak Ave, Springfield, IL 62702', 'faculty', 'English Literature professor.'),
('Michael Davis', 'MEM-2024-0003', 'michael.davis@email.com', '555-0103', '789 Pine Rd, Springfield, IL 62703', 'public', 'Retired teacher, visits library weekly.'),
('Sarah Williams', 'MEM-2024-0004', 'sarah.williams@email.com', '555-0104', '321 Elm St, Springfield, IL 62704', 'student', 'History major, prefers non-fiction.'),
('David Brown', 'MEM-2024-0005', 'david.brown@email.com', '555-0105', '654 Maple Dr, Springfield, IL 62705', 'public', 'Local business owner, reads business books.'),
('Lisa Anderson', 'MEM-2024-0006', 'lisa.anderson@university.edu', '555-0106', '987 Cedar Ln, Springfield, IL 62706', 'faculty', 'Mathematics professor, enjoys puzzle books.'),
('James Wilson', 'MEM-2024-0007', 'james.wilson@email.com', '555-0107', '147 Birch Ct, Springfield, IL 62707', 'student', 'Engineering student, likes sci-fi novels.'),
('Maria Garcia', 'MEM-2024-0008', 'maria.garcia@email.com', '555-0108', '258 Spruce Way, Springfield, IL 62708', 'public', 'Spanish teacher, bilingual reader.'),
('Robert Martinez', 'MEM-2024-0009', 'robert.martinez@email.com', '555-0109', '369 Willow St, Springfield, IL 62709', 'student', 'Medical student, prefers medical literature.'),
('Jennifer Taylor', 'MEM-2024-0010', 'jennifer.taylor@email.com', '555-0110', '741 Ash Ave, Springfield, IL 62710', 'public', 'Freelance writer, diverse reading interests.'),
('Christopher Thomas', 'MEM-2024-0011', 'chris.thomas@university.edu', '555-0111', '852 Pinegrove Rd, Springfield, IL 62711', 'faculty', 'Physics professor, interested in popular science.'),
('Amanda White', 'MEM-2024-0012', 'amanda.white@email.com', '555-0112', '963 Oakhill Dr, Springfield, IL 62712', 'student', 'Art student, enjoys art history books.'),
('Daniel Harris', 'MEM-2024-0013', 'daniel.harris@email.com', '555-0113', '147 Riverbend Ln, Springfield, IL 62713', 'public', 'Software developer, tech book enthusiast.'),
('Michelle Clark', 'MEM-2024-0014', 'michelle.clark@email.com', '555-0114', '258 Meadowview Ct, Springfield, IL 62714', 'student', 'Nursing student, interested in healthcare topics.'),
('Kevin Lewis', 'MEM-2024-0015', 'kevin.lewis@email.com', '555-0115', '369 Sunflower Way, Springfield, IL 62715', 'public', 'Accountant, reads finance and economics books.');

-- Insert sample transactions (active loans)
INSERT INTO transactions (book_id, member_id, transaction_type, due_date, notes) VALUES
-- Active loans
(4, 1, 'lend', date('now', '+14 days'), 'Regular student loan period'),
(5, 4, 'lend', date('now', '+14 days'), 'Student requested for class project'),
(9, 6, 'lend', date('now', '+30 days'), 'Faculty loan period'),
(14, 7, 'lend', date('now', '+14 days'), 'Recommended by professor'),
(16, 12, 'lend', date('now', '+14 days'), 'Mystery novel selection');

-- Insert some overdue transactions
INSERT INTO transactions (book_id, member_id, transaction_type, transaction_date, due_date, notes) VALUES
(3, 3, 'lend', date('now', '-20 days'), date('now', '-6 days'), 'Public member loan'),
(15, 10, 'lend', date('now', '-35 days'), date('now', '-7 days'), 'Extended reading period');

-- Insert some returned transactions (history)
INSERT INTO transactions (book_id, member_id, transaction_type, transaction_date, due_date, return_date, fine_amount, fine_paid, notes) VALUES
(1, 2, 'lend', date('now', '-30 days'), date('now', '-16 days'), date('now', '-10 days'), 0, TRUE, 'Classic literature'),
(2, 5, 'lend', date('now', '-25 days'), date('now', '-11 days'), date('now', '-8 days'), 0, TRUE, 'Legal fiction interest'),
(6, 8, 'lend', date('now', '-45 days'), date('now', '-31 days'), date('now', '-20 days'), 15, TRUE, 'Dystopian novel series'),
(7, 11, 'lend', date('now', '-60 days'), date('now', '-30 days'), date('now', '-15 days'), 0, TRUE, 'Fantasy adventure'),
(8, 13, 'lend', date('now', '-90 days'), date('now', '-76 days'), date('now', '-70 days'), 0, TRUE, 'Young adult fantasy'),
(10, 14, 'lend', date('now', '-15 days'), date('now', '-8 days'), date('now', '-5 days'), 0, TRUE, 'Political satire'),
(11, 9, 'lend', date('now', '-120 days'), date('now', '-106 days'), date('now', '-90 days'), 0, TRUE, 'Historical autobiography'),
(12, 15, 'lend', date('now', '-75 days'), date('now', '-61 days'), date('now', '-40 days'), 30, TRUE, 'Philosophical journey'),
(13, 1, 'lend', date('now', '-40 days'), date('now', '-26 days'), date('now', '-12 days'), 0, TRUE, 'History and anthropology'),
(17, 3, 'lend', date('now', '-10 days'), date('now', '+4 days'), date('now', '-2 days'), 0, TRUE, 'Fiction mystery'),
(18, 6, 'lend', date('now', '-30 days'), date('now', '-16 days'), date('now', '-1 days'), 25, FALSE, 'Self-improvement'),
(19, 8, 'lend', date('now', '-20 days'), date('now', '-6 days'), date('now', '-3 days'), 0, TRUE, 'Finance and psychology'),
(20, 11, 'lend', date('now', '-15 days'), date('now', '-1 day'), date('now', '-1 day'), 0, TRUE, 'Software development best practices');

-- Update book available copies based on active loans
UPDATE books SET available_copies = available_copies - 1 WHERE id IN (
    SELECT DISTINCT book_id FROM transactions WHERE transaction_type = 'lend' AND return_date IS NULL
);

-- Update book status based on available copies
UPDATE books SET status = 'loaned' WHERE available_copies = 0 AND total_copies > 0;