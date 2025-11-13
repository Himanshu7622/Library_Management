// Electron API types for renderer process
import { Book, Member, Transaction, Settings, BookFilters, MemberFilters, TransactionFilters } from '../../shared/types';

export interface ElectronAPI {
  // Book operations
  books: {
    getAll: (filters?: BookFilters) => Promise<{ success: boolean; data?: Book[]; error?: string }>;
    getById: (id: number) => Promise<{ success: boolean; data?: Book; error?: string }>;
    create: (bookData: any) => Promise<{ success: boolean; data?: Book; error?: string }>;
    update: (id: number, bookData: any) => Promise<{ success: boolean; data?: Book; error?: string }>;
    delete: (id: number) => Promise<{ success: boolean; error?: string }>;
  };

  // Member operations
  members: {
    getAll: (filters?: MemberFilters) => Promise<{ success: boolean; data?: Member[]; error?: string }>;
    getById: (id: number) => Promise<{ success: boolean; data?: Member; error?: string }>;
    create: (memberData: any) => Promise<{ success: boolean; data?: Member; error?: string }>;
    update: (id: number, memberData: any) => Promise<{ success: boolean; data?: Member; error?: string }>;
    delete: (id: number) => Promise<{ success: boolean; error?: string }>;
  };

  // Transaction operations
  transactions: {
    lend: (bookId: number, memberId: number, dueDate?: string) => Promise<{ success: boolean; data?: Transaction; error?: string }>;
    return: (transactionId: number) => Promise<{ success: boolean; data?: Transaction; error?: string }>;
    getActive: () => Promise<{ success: boolean; data?: Transaction[]; error?: string }>;
    getOverdue: () => Promise<{ success: boolean; data?: Transaction[]; error?: string }>;
    getByMemberId: (memberId: number) => Promise<{ success: boolean; data?: Transaction[]; error?: string }>;
    getHistory: (limit?: number) => Promise<{ success: boolean; data?: Transaction[]; error?: string }>;
  };

  // File operations
  files: {
    saveCover: (imageData: string, filename: string) => Promise<{ success: boolean; data?: { path: string }; error?: string }>;
    getCoverPath: (bookId: number) => Promise<{ success: boolean; data?: { path: string }; error?: string }>;
    deleteCover: (bookId: number) => Promise<{ success: boolean; error?: string }>;
    exportCSV: (type: string, data: any[]) => Promise<{ success: boolean; data?: { filePath: string }; error?: string }>;
    importCSV: (filePath: string, type: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    backupDB: () => Promise<{ success: boolean; data?: { backupPath: string }; error?: string }>;
    restoreDB: (backupPath: string) => Promise<{ success: boolean; error?: string }>;
  };

  // Settings operations
  settings: {
    get: (key: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    set: (key: string, value: any) => Promise<{ success: boolean; error?: string }>;
    getAll: () => Promise<{ success: boolean; data?: Settings; error?: string }>;
  };

  // Authentication operations
  auth: {
    login: (pin: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    logout: () => Promise<{ success: boolean; error?: string }>;
    setup: (pin: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    changePin: (oldPin: string, newPin: string) => Promise<{ success: boolean; error?: string }>;
    checkAuth: () => Promise<{ success: boolean; data?: { isAuthenticated: boolean }; error?: string }>;
  };

  // System operations
  system: {
    getVersion: () => Promise<{ success: boolean; data?: { version: string }; error?: string }>;
    getAppPath: () => Promise<{ success: boolean; data?: { path: string }; error?: string }>;
  };

  // Dialog operations
  dialog: {
    showSaveDialog: (options: any) => Promise<{ success: boolean; data?: any; error?: string }>;
    showOpenDialog: (options: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}