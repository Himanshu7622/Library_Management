export interface Book {
  id: number;
  title: string;
  authors: string[];
  isbn?: string;
  publisher?: string;
  publicationYear?: number;
  genres: string[];
  language: string;
  totalCopies: number;
  availableCopies: number;
  location?: string;
  tags: string[];
  description?: string;
  coverImagePath?: string;
  status: 'available' | 'loaned' | 'reserved';
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: number;
  name: string;
  memberId: string;
  email?: string;
  phone?: string;
  address?: string;
  memberType: 'student' | 'faculty' | 'public';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  bookId: number;
  memberId: number;
  transactionType: 'lend' | 'return';
  transactionDate: string;
  dueDate?: string;
  returnDate?: string;
  fineAmount: number;
  finePaid: boolean;
  notes?: string;
  book?: Book;
  member?: Member;
}

export interface Settings {
  fineRules: {
    student: { dailyRate: number; gracePeriod: number; maxFine: number };
    faculty: { dailyRate: number; gracePeriod: number; maxFine: number };
    public: { dailyRate: number; gracePeriod: number; maxFine: number };
  };
  lendingPeriods: {
    student: number; // days
    faculty: number; // days
    public: number; // days
  };
  authentication: {
    enabled: boolean;
    sessionTimeout: number; // minutes
    maxAttempts: number;
    lockoutDuration: number; // minutes
  };
  database: {
    backupPath?: string;
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    maxBackups: number;
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    dateFormat: string;
    itemsPerPage: number;
  };
}

export interface BookFilters {
  search?: string;
  status?: Book['status'];
  genre?: string;
  language?: string;
  availability?: 'all' | 'available' | 'loaned';
  author?: string;
  publisher?: string;
  yearRange?: [number, number];
}

export interface MemberFilters {
  search?: string;
  memberType?: Member['memberType'];
  hasActiveLoans?: boolean;
}

export interface TransactionFilters {
  search?: string;
  member?: string;
  book?: string;
  status?: 'active' | 'returned' | 'overdue';
  dateRange?: [string, string];
  memberType?: Member['memberType'];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

export interface ImportResult {
  success: boolean;
  processed: number;
  imported: number;
  errors: string[];
  duplicates: string[];
}

export interface ExportOptions {
  format: 'csv' | 'json';
  fields: string[];
  filters?: BookFilters | MemberFilters | TransactionFilters;
}

export interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  activeLoans: number;
  overdueBooks: number;
  totalFines: number;
  paidFines: number;
  recentTransactions: Transaction[];
  overdueTransactions: Transaction[];
  popularBooks: (Book & { loansCount: number })[];
  activeMembers: (Member & { activeLoansCount: number })[];
}

export interface User {
  isAuthenticated: boolean;
  sessionStart?: string;
  lastActivity?: string;
}

export interface MenuAction {
  type: 'import-books' | 'export-books' | 'backup-database';
  payload?: any;
}

// Database schema types
export interface DatabaseSchema {
  books: Book;
  members: Member;
  transactions: Transaction;
  settings: Settings;
}

// Form types
export interface BookFormData {
  title: string;
  authors: string[];
  isbn?: string;
  publisher?: string;
  publicationYear?: number;
  genres: string[];
  language: string;
  totalCopies: number;
  location?: string;
  tags: string[];
  description?: string;
  coverImage?: File | string | null;
}

export interface MemberFormData {
  name: string;
  memberId?: string;
  email?: string;
  phone?: string;
  address?: string;
  memberType: Member['memberType'];
  notes?: string;
}

export interface TransactionFormData {
  bookId: number;
  memberId: number;
  dueDate?: string;
  notes?: string;
}

// Validation schemas
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// File upload types
export interface FileUpload {
  file: File;
  preview?: string;
  progress: number;
  error?: string;
}

export interface CoverImageData {
  path: string;
  filename: string;
  size: number;
  type: string;
}

// Search and filter types
export interface SearchOption {
  id: string;
  label: string;
  value: string | number;
  group?: string;
}

export interface FilterOption {
  id: string;
  label: string;
  field: keyof Book | keyof Member | keyof Transaction;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  options?: SearchOption[];
  defaultValue?: any;
}

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  icon: string; // Lucide icon name
  path: string;
  badge?: number;
  children?: NavItem[];
}

// Theme types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
}