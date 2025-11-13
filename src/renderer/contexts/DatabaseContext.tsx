import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Book, Member, Transaction, BookFilters, MemberFilters, DashboardStats } from '../../shared/types';

// Action types
type DatabaseAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_BOOKS'; books: Book[] }
  | { type: 'ADD_BOOK'; book: Book }
  | { type: 'UPDATE_BOOK'; book: Book }
  | { type: 'DELETE_BOOK'; id: number }
  | { type: 'SET_MEMBERS'; members: Member[] }
  | { type: 'ADD_MEMBER'; member: Member }
  | { type: 'UPDATE_MEMBER'; member: Member }
  | { type: 'DELETE_MEMBER'; id: number }
  | { type: 'SET_TRANSACTIONS'; transactions: Transaction[] }
  | { type: 'ADD_TRANSACTION'; transaction: Transaction }
  | { type: 'UPDATE_TRANSACTION'; transaction: Transaction }
  | { type: 'SET_DASHBOARD_STATS'; stats: DashboardStats }
  | { type: 'CLEAR_DATA' };

// State interface
interface DatabaseState {
  isLoading: boolean;
  error: string | null;
  books: Book[];
  members: Member[];
  transactions: Transaction[];
  dashboardStats: DashboardStats | null;
  lastUpdated: string | null;
}

// Initial state
const initialState: DatabaseState = {
  isLoading: false,
  error: null,
  books: [],
  members: [],
  transactions: [],
  dashboardStats: null,
  lastUpdated: null,
};

// Context interface
interface DatabaseContextType extends DatabaseState {
  // Book operations
  fetchBooks: (filters?: BookFilters) => Promise<void>;
  createBook: (bookData: any) => Promise<Book>;
  updateBook: (id: number, bookData: any) => Promise<Book>;
  deleteBook: (id: number) => Promise<void>;
  getBookById: (id: number) => Promise<Book | null>;

  // Member operations
  fetchMembers: (filters?: MemberFilters) => Promise<void>;
  createMember: (memberData: any) => Promise<Member>;
  updateMember: (id: number, memberData: any) => Promise<Member>;
  deleteMember: (id: number) => Promise<void>;
  getMemberById: (id: number) => Promise<Member | null>;

  // Transaction operations
  fetchTransactions: () => Promise<void>;
  lendBook: (bookId: number, memberId: number, dueDate?: string) => Promise<Transaction>;
  returnBook: (transactionId: number) => Promise<Transaction>;
  getActiveTransactions: () => Promise<Transaction[]>;
  getOverdueTransactions: () => Promise<Transaction[]>;

  // Dashboard operations
  fetchDashboardStats: () => Promise<void>;

  // Utility methods
  clearError: () => void;
  refreshData: () => Promise<void>;
}

// Reducer
const databaseReducer = (state: DatabaseState, action: DatabaseAction): DatabaseState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.loading,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        isLoading: false,
      };

    case 'SET_BOOKS':
      return {
        ...state,
        books: action.books,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };

    case 'ADD_BOOK':
      return {
        ...state,
        books: [...state.books, action.book],
        error: null,
      };

    case 'UPDATE_BOOK':
      return {
        ...state,
        books: state.books.map(book =>
          book.id === action.book.id ? action.book : book
        ),
        error: null,
      };

    case 'DELETE_BOOK':
      return {
        ...state,
        books: state.books.filter(book => book.id !== action.id),
        error: null,
      };

    case 'SET_MEMBERS':
      return {
        ...state,
        members: action.members,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };

    case 'ADD_MEMBER':
      return {
        ...state,
        members: [...state.members, action.member],
        error: null,
      };

    case 'UPDATE_MEMBER':
      return {
        ...state,
        members: state.members.map(member =>
          member.id === action.member.id ? action.member : member
        ),
        error: null,
      };

    case 'DELETE_MEMBER':
      return {
        ...state,
        members: state.members.filter(member => member.id !== action.id),
        error: null,
      };

    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.transactions,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };

    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.transaction],
        error: null,
      };

    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.transaction.id ? action.transaction : transaction
        ),
        error: null,
      };

    case 'SET_DASHBOARD_STATS':
      return {
        ...state,
        dashboardStats: action.stats,
        isLoading: false,
        error: null,
      };

    case 'CLEAR_DATA':
      return {
        ...state,
        books: [],
        members: [],
        transactions: [],
        dashboardStats: null,
      };

    default:
      return state;
  }
};

// Create context
const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Provider component
interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(databaseReducer, initialState);

  // Error handling wrapper
  const withErrorHandling = async <T,>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T> => {
    try {
      dispatch({ type: 'SET_ERROR', error: null });
      return await operation();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : errorMessage;
      dispatch({ type: 'SET_ERROR', error: errorMsg });
      throw error;
    }
  };

  // Book operations
  const fetchBooks = async (filters: BookFilters = {}): Promise<void> => {
    await withErrorHandling(async () => {
      dispatch({ type: 'SET_LOADING', loading: true });
      const response = await window.electronAPI.books.getAll(filters);
      if (response.success) {
        dispatch({ type: 'SET_BOOKS', books: response.data || [] });
      } else {
        throw new Error(response.error || 'Failed to fetch books');
      }
    }, 'Failed to fetch books');
  };

  const createBook = async (bookData: any): Promise<Book> => {
    return await withErrorHandling(async () => {
      const response = await window.electronAPI.books.create(bookData);
      if (response.success) {
        const newBook = response.data;
        dispatch({ type: 'ADD_BOOK', book: newBook });
        return newBook;
      } else {
        throw new Error(response.error || 'Failed to create book');
      }
    }, 'Failed to create book');
  };

  const updateBook = async (id: number, bookData: any): Promise<Book> => {
    return await withErrorHandling(async () => {
      const response = await window.electronAPI.books.update(id, bookData);
      if (response.success) {
        const updatedBook = response.data;
        dispatch({ type: 'UPDATE_BOOK', book: updatedBook });
        return updatedBook;
      } else {
        throw new Error(response.error || 'Failed to update book');
      }
    }, 'Failed to update book');
  };

  const deleteBook = async (id: number): Promise<void> => {
    await withErrorHandling(async () => {
      const response = await window.electronAPI.books.delete(id);
      if (response.success) {
        dispatch({ type: 'DELETE_BOOK', id });
      } else {
        throw new Error(response.error || 'Failed to delete book');
      }
    }, 'Failed to delete book');
  };

  const getBookById = async (id: number): Promise<Book | null> => {
    try {
      const response = await window.electronAPI.books.getById(id);
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to get book by ID:', error);
      return null;
    }
  };

  // Member operations
  const fetchMembers = async (filters: MemberFilters = {}): Promise<void> => {
    await withErrorHandling(async () => {
      dispatch({ type: 'SET_LOADING', loading: true });
      const response = await window.electronAPI.members.getAll(filters);
      if (response.success) {
        dispatch({ type: 'SET_MEMBERS', members: response.data || [] });
      } else {
        throw new Error(response.error || 'Failed to fetch members');
      }
    }, 'Failed to fetch members');
  };

  const createMember = async (memberData: any): Promise<Member> => {
    return await withErrorHandling(async () => {
      const response = await window.electronAPI.members.create(memberData);
      if (response.success) {
        const newMember = response.data;
        dispatch({ type: 'ADD_MEMBER', member: newMember });
        return newMember;
      } else {
        throw new Error(response.error || 'Failed to create member');
      }
    }, 'Failed to create member');
  };

  const updateMember = async (id: number, memberData: any): Promise<Member> => {
    return await withErrorHandling(async () => {
      const response = await window.electronAPI.members.update(id, memberData);
      if (response.success) {
        const updatedMember = response.data;
        dispatch({ type: 'UPDATE_MEMBER', member: updatedMember });
        return updatedMember;
      } else {
        throw new Error(response.error || 'Failed to update member');
      }
    }, 'Failed to update member');
  };

  const deleteMember = async (id: number): Promise<void> => {
    await withErrorHandling(async () => {
      const response = await window.electronAPI.members.delete(id);
      if (response.success) {
        dispatch({ type: 'DELETE_MEMBER', id });
      } else {
        throw new Error(response.error || 'Failed to delete member');
      }
    }, 'Failed to delete member');
  };

  const getMemberById = async (id: number): Promise<Member | null> => {
    try {
      const response = await window.electronAPI.members.getById(id);
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to get member by ID:', error);
      return null;
    }
  };

  // Transaction operations
  const fetchTransactions = async (): Promise<void> => {
    await withErrorHandling(async () => {
      dispatch({ type: 'SET_LOADING', loading: true });
      const response = await window.electronAPI.transactions.getActive();
      if (response.success) {
        dispatch({ type: 'SET_TRANSACTIONS', transactions: response.data || [] });
      } else {
        throw new Error(response.error || 'Failed to fetch transactions');
      }
    }, 'Failed to fetch transactions');
  };

  const lendBook = async (bookId: number, memberId: number, dueDate?: string): Promise<Transaction> => {
    return await withErrorHandling(async () => {
      const response = await window.electronAPI.transactions.lend(bookId, memberId, dueDate);
      if (response.success) {
        const newTransaction = response.data;
        dispatch({ type: 'ADD_TRANSACTION', transaction: newTransaction });
        return newTransaction;
      } else {
        throw new Error(response.error || 'Failed to lend book');
      }
    }, 'Failed to lend book');
  };

  const returnBook = async (transactionId: number): Promise<Transaction> => {
    return await withErrorHandling(async () => {
      const response = await window.electronAPI.transactions.return(transactionId);
      if (response.success) {
        const updatedTransaction = response.data;
        dispatch({ type: 'UPDATE_TRANSACTION', transaction: updatedTransaction });
        return updatedTransaction;
      } else {
        throw new Error(response.error || 'Failed to return book');
      }
    }, 'Failed to return book');
  };

  const getActiveTransactions = async (): Promise<Transaction[]> => {
    try {
      const response = await window.electronAPI.transactions.getActive();
      if (response.success) {
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to get active transactions:', error);
      return [];
    }
  };

  const getOverdueTransactions = async (): Promise<Transaction[]> => {
    try {
      const response = await window.electronAPI.transactions.getOverdue();
      if (response.success) {
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to get overdue transactions:', error);
      return [];
    }
  };

  // Dashboard operations
  const fetchDashboardStats = async (): Promise<void> => {
    await withErrorHandling(async () => {
      dispatch({ type: 'SET_LOADING', loading: true });

      // Get all data needed for dashboard
      const [booksResponse, membersResponse, transactionsResponse] = await Promise.all([
        window.electronAPI.books.getAll(),
        window.electronAPI.members.getAll(),
        window.electronAPI.transactions.getActive()
      ]);

      if (booksResponse.success && membersResponse.success && transactionsResponse.success) {
        const books = booksResponse.data || [];
        const members = membersResponse.data || [];
        const activeTransactions = transactionsResponse.data || [];

        // Calculate stats
        const totalBooks = books.length;
        const totalMembers = members.length;
        const activeLoans = activeTransactions.length;

        // Get overdue transactions
        const overdueResponse = await window.electronAPI.transactions.getOverdue();
        const overdueTransactions = overdueResponse.success ? overdueResponse.data || [] : [];
        const overdueBooks = overdueTransactions.length;

        const stats: DashboardStats = {
          totalBooks,
          totalMembers,
          activeLoans,
          overdueBooks,
          totalFines: overdueTransactions.reduce((sum, t) => sum + (t.fineAmount || 0), 0),
          paidFines: 0, // This would need additional calculation from returned transactions
          recentTransactions: activeTransactions.slice(0, 10),
          overdueTransactions,
          popularBooks: [], // This would need additional analysis
          activeMembers: members.filter(m => (m as any).active_loans > 0) as any,
        };

        dispatch({ type: 'SET_DASHBOARD_STATS', stats });
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    }, 'Failed to fetch dashboard stats');
  };

  // Utility methods
  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', error: null });
  };

  const refreshData = async (): Promise<void> => {
    try {
      await Promise.all([
        fetchBooks(),
        fetchMembers(),
        fetchTransactions(),
        fetchDashboardStats(),
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const value: DatabaseContextType = {
    ...state,
    // Book operations
    fetchBooks,
    createBook,
    updateBook,
    deleteBook,
    getBookById,
    // Member operations
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,
    getMemberById,
    // Transaction operations
    fetchTransactions,
    lendBook,
    returnBook,
    getActiveTransactions,
    getOverdueTransactions,
    // Dashboard operations
    fetchDashboardStats,
    // Utility methods
    clearError,
    refreshData,
  };

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
};

// Hook to use database context
export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export default DatabaseContext;