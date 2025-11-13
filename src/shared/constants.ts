import { Book, Member, Settings } from './types';

// Application constants
export const APP_NAME = 'Library Management System';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'A modern desktop library management application';

// Database constants
export const DATABASE_FILE = 'library.db';
export const DATABASE_VERSION = 1;

// File paths
export const ASSETS_DIR = 'assets';
export const COVERS_DIR = 'covers';
export const BACKUP_DIR = 'backups';

// Pagination
export const DEFAULT_ITEMS_PER_PAGE = 20;
export const MAX_ITEMS_PER_PAGE = 100;

// Validation limits
export const MAX_TITLE_LENGTH = 200;
export const MAX_AUTHOR_NAME_LENGTH = 100;
export const MAX_ISBN_LENGTH = 13;
export const MAX_PUBLISHER_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_MEMBER_NAME_LENGTH = 100;
export const MAX_MEMBER_ID_LENGTH = 20;
export const MAX_EMAIL_LENGTH = 255;
export const MAX_PHONE_LENGTH = 20;
export const MAX_LOCATION_LENGTH = 50;
export const MAX_TAG_LENGTH = 30;
export const MAX_NOTES_LENGTH = 500;

// Image upload limits
export const MAX_COVER_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const COVER_IMAGE_MAX_WIDTH = 400;
export const COVER_IMAGE_MAX_HEIGHT = 600;

// Authentication
export const MIN_PIN_LENGTH = 4;
export const MAX_PIN_LENGTH = 8;
export const DEFAULT_SESSION_TIMEOUT = 30; // minutes
export const DEFAULT_MAX_LOGIN_ATTEMPTS = 5;
export const DEFAULT_LOCKOUT_DURATION = 15; // minutes

// Default settings
export const DEFAULT_SETTINGS: Settings = {
  fineRules: {
    student: { dailyRate: 5, gracePeriod: 0, maxFine: 500 },
    faculty: { dailyRate: 3, gracePeriod: 3, maxFine: 300 },
    public: { dailyRate: 10, gracePeriod: 0, maxFine: 1000 },
  },
  lendingPeriods: {
    student: 14, // days
    faculty: 30, // days
    public: 7, // days
  },
  authentication: {
    enabled: true,
    sessionTimeout: DEFAULT_SESSION_TIMEOUT,
    maxAttempts: DEFAULT_MAX_LOGIN_ATTEMPTS,
    lockoutDuration: DEFAULT_LOCKOUT_DURATION,
  },
  database: {
    autoBackup: true,
    backupFrequency: 'weekly',
    maxBackups: 10,
  },
  ui: {
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/dd/yyyy',
    itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
  },
};

// Book statuses
export const BOOK_STATUSES = {
  AVAILABLE: 'available',
  LOANED: 'loaned',
  RESERVED: 'reserved',
} as const;

// Member types
export const MEMBER_TYPES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  PUBLIC: 'public',
} as const;

// Transaction types
export const TRANSACTION_TYPES = {
  LEND: 'lend',
  RETURN: 'return',
} as const;

// Common genres
export const COMMON_GENRES = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Thriller',
  'Romance',
  'Science Fiction',
  'Fantasy',
  'Biography',
  'History',
  'Self-Help',
  'Business',
  'Science',
  'Technology',
  'Programming',
  'Children',
  'Young Adult',
  'Poetry',
  'Drama',
  'Horror',
  'Adventure',
  'Classic',
  'Contemporary',
  'Dystopian',
  'Humor',
  'Travel',
  'Cooking',
  'Art',
  'Philosophy',
  'Religion',
  'Health',
  'Sports',
  'Education',
  'Reference',
  'Textbook',
  'Research',
  'Academic',
];

// Common languages (ISO 639-1 codes)
export const COMMON_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ur', name: 'Urdu' },
];

// Date formats
export const DATE_FORMATS = [
  'MM/dd/yyyy',
  'dd/MM/yyyy',
  'yyyy-MM-dd',
  'MMMM dd, yyyy',
  'dd MMMM yyyy',
];

// Export formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  JSON: 'json',
} as const;

// Filter options
export const BOOK_FILTER_OPTIONS = [
  {
    id: 'search',
    label: 'Search',
    field: 'search' as keyof Book,
    type: 'text' as const,
    defaultValue: '',
  },
  {
    id: 'status',
    label: 'Status',
    field: 'status' as keyof Book,
    type: 'select' as const,
    options: [
      { id: 'all', label: 'All Books', value: 'all' },
      { id: 'available', label: 'Available', value: 'available' },
      { id: 'loaned', label: 'Loaned', value: 'loaned' },
      { id: 'reserved', label: 'Reserved', value: 'reserved' },
    ],
    defaultValue: 'all',
  },
  {
    id: 'genre',
    label: 'Genre',
    field: 'genres' as keyof Book,
    type: 'select' as const,
    options: COMMON_GENRES.map(genre => ({ id: genre, label: genre, value: genre })),
  },
  {
    id: 'language',
    label: 'Language',
    field: 'language' as keyof Book,
    type: 'select' as const,
    options: COMMON_LANGUAGES.map(lang => ({ id: lang.code, label: lang.name, value: lang.code })),
  },
  {
    id: 'availability',
    label: 'Availability',
    field: 'availableCopies' as keyof Book,
    type: 'select' as const,
    options: [
      { id: 'all', label: 'All', value: 'all' },
      { id: 'available', label: 'Available', value: 'available' },
      { id: 'loaned', label: 'Loaned Out', value: 'loaned' },
    ],
    defaultValue: 'all',
  },
];

export const MEMBER_FILTER_OPTIONS = [
  {
    id: 'search',
    label: 'Search',
    field: 'search' as keyof Member,
    type: 'text' as const,
    defaultValue: '',
  },
  {
    id: 'memberType',
    label: 'Member Type',
    field: 'memberType' as keyof Member,
    type: 'select' as const,
    options: [
      { id: 'all', label: 'All Types', value: 'all' },
      { id: 'student', label: 'Student', value: 'student' },
      { id: 'faculty', label: 'Faculty', value: 'faculty' },
      { id: 'public', label: 'Public', value: 'public' },
    ],
    defaultValue: 'all',
  },
  {
    id: 'hasActiveLoans',
    label: 'Active Loans',
    field: 'hasActiveLoans' as keyof Member,
    type: 'select' as const,
    options: [
      { id: 'all', label: 'All Members', value: 'all' },
      { id: 'yes', label: 'Has Active Loans', value: 'yes' },
      { id: 'no', label: 'No Active Loans', value: 'no' },
    ],
    defaultValue: 'all',
  },
];

// Navigation items
export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
  },
  {
    id: 'books',
    label: 'Books',
    icon: 'Book',
    path: '/books',
  },
  {
    id: 'members',
    label: 'Members',
    icon: 'Users',
    path: '/members',
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: 'ArrowRightLeft',
    path: '/transactions',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    path: '/settings',
  },
];

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your connection.',
  DATABASE_ERROR: 'Database error. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested item was not found.',
  DUPLICATE_ENTRY: 'This entry already exists.',
  INVALID_FORMAT: 'Invalid file format.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed size.',
  INVALID_ISBN: 'Please enter a valid ISBN-13 number.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_PIN: 'Invalid PIN. Please try again.',
  ACCOUNT_LOCKED: 'Account temporarily locked due to too many failed attempts.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  BOOK_CREATED: 'Book created successfully.',
  BOOK_UPDATED: 'Book updated successfully.',
  BOOK_DELETED: 'Book deleted successfully.',
  MEMBER_CREATED: 'Member created successfully.',
  MEMBER_UPDATED: 'Member updated successfully.',
  MEMBER_DELETED: 'Member deleted successfully.',
  TRANSACTION_CREATED: 'Transaction created successfully.',
  BOOK_RETURNED: 'Book returned successfully.',
  IMPORT_SUCCESS: 'Data imported successfully.',
  EXPORT_SUCCESS: 'Data exported successfully.',
  BACKUP_SUCCESS: 'Backup created successfully.',
  SETTINGS_UPDATED: 'Settings updated successfully.',
  LOGIN_SUCCESS: 'Login successful.',
  SETUP_SUCCESS: 'PIN setup successful.',
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  NEW_BOOK: { key: 'n', ctrl: true, shift: true, description: 'New Book' },
  NEW_MEMBER: { key: 'm', ctrl: true, shift: true, description: 'New Member' },
  SEARCH: { key: 'f', ctrl: true, description: 'Search' },
  IMPORT: { key: 'i', ctrl: true, description: 'Import CSV' },
  EXPORT: { key: 'e', ctrl: true, description: 'Export CSV' },
  BACKUP: { key: 'b', ctrl: true, description: 'Backup Database' },
  SETTINGS: { key: ',', ctrl: true, description: 'Settings' },
  HELP: { key: 'h', ctrl: true, description: 'Help' },
} as const;