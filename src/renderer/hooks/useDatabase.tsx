import { Book, Member, Transaction, BookFilters, MemberFilters, DashboardStats } from '../../shared/types';
import React from 'react';

export const useDatabase = () => {
  // Temporary implementation to bypass import errors
  const [state, setState] = React.useState({
    isLoading: false,
    error: null as string | null,
    books: [] as Book[],
    members: [] as Member[],
    transactions: [] as Transaction[],
    dashboardStats: null as DashboardStats | null,
    lastUpdated: null as string | null,
  });

  return {
    ...state,
    // Book operations
    fetchBooks: async (filters?: BookFilters) => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        const response = await window.electronAPI.books.getAll(filters);
        if (response.success) {
          setState(prev => ({ ...prev, books: response.data || [], isLoading: false }));
        }
      } catch (error) {
        setState(prev => ({ ...prev, error: 'Failed to fetch books', isLoading: false }));
      }
    },
    createBook: async (bookData: any): Promise<Book> => {
      try {
        const response = await window.electronAPI.books.create(bookData);
        if (response.success) {
          setState(prev => ({ ...prev, books: [...prev.books, response.data] }));
          return response.data;
        }
        throw new Error(response.error || 'Failed to create book');
      } catch (error) {
        setState(prev => ({ ...prev, error: 'Failed to create book' }));
        throw error;
      }
    },
    updateBook: async (id: number, bookData: any): Promise<Book> => {
      try {
        const response = await window.electronAPI.books.update(id, bookData);
        if (response.success) {
          setState(prev => ({
            ...prev,
            books: prev.books.map(book => book.id === id ? response.data : book)
          }));
          return response.data;
        }
        throw new Error(response.error || 'Failed to update book');
      } catch (error) {
        setState(prev => ({ ...prev, error: 'Failed to update book' }));
        throw error;
      }
    },
    deleteBook: async (id: number): Promise<void> => {
      try {
        const response = await window.electronAPI.books.delete(id);
        if (response.success) {
          setState(prev => ({ ...prev, books: prev.books.filter(book => book.id !== id) }));
        } else {
          throw new Error(response.error || 'Failed to delete book');
        }
      } catch (error) {
        setState(prev => ({ ...prev, error: 'Failed to delete book' }));
        throw error;
      }
    },
    getBookById: async (id: number): Promise<Book | null> => {
      try {
        const response = await window.electronAPI.books.getById(id);
        return response.success ? response.data : null;
      } catch (error) {
        console.error('Failed to get book by ID:', error);
        return null;
      }
    },

    // Member operations
    fetchMembers: async (filters?: MemberFilters) => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        const response = await window.electronAPI.members.getAll(filters);
        if (response.success) {
          setState(prev => ({ ...prev, members: response.data || [], isLoading: false }));
        }
      } catch (error) {
        setState(prev => ({ ...prev, error: 'Failed to fetch members', isLoading: false }));
      }
    },
    createMember: async (memberData: any): Promise<Member> => {
      try {
        const response = await window.electronAPI.members.create(memberData);
        if (response.success) {
          setState(prev => ({ ...prev, members: [...prev.members, response.data] }));
          return response.data;
        }
        throw new Error(response.error || 'Failed to create member');
      } catch (error) {
        setState(prev => ({ ...prev, error: 'Failed to create member' }));
        throw error;
      }
    },
    updateMember: async (id: number, memberData: any): Promise<Member> => {
      try {
        const response = await window.electronAPI.members.update(id, memberData);
        if (response.success) {
          setState(prev => ({
            ...prev,
            members: prev.members.map(member => member.id === id ? response.data : member)
          }));
          return response.data;
        }
        throw new Error(response.error || 'Failed to update member');
      } catch (error) {
        setState(prev => ({ ...prev, error: 'Failed to update member' }));
        throw error;
      }
    },
    deleteMember: async (id: number): Promise<void> => {
      try {
        const response = await window.electronAPI.members.delete(id);
        if (response.success) {
          setState(prev => ({ ...prev, members: prev.members.filter(member => member.id !== id) }));
        } else {
          throw new Error(response.error || 'Failed to delete member');
        }
      } catch (error) {
        setState(prev => ({ ...prev, error: 'Failed to delete member' }));
        throw error;
      }
    },
    getMemberById: async (id: number): Promise<Member | null> => {
      try {
        const response = await window.electronAPI.members.getById(id);
        return response.success ? response.data : null;
      } catch (error) {
        console.error('Failed to get member by ID:', error);
        return null;
      }
    },

    // Transaction operations
    fetchTransactions: async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        const response = await window.electronAPI.transactions.getActive();
        if (response.success) {
          setState(prev => ({ ...prev, transactions: response.data || [], isLoading: false }));
        }
      } catch (error) {
        setState(prev => ({ ...prev, error: 'Failed to fetch transactions', isLoading: false }));
      }
    },
    lendBook: async (bookId: number, memberId: number, dueDate?: string): Promise<Transaction> => {
      try {
        const response = await window.electronAPI.transactions.lend(bookId, memberId, dueDate);
        if (response.success) {
          setState(prev => ({ ...prev, transactions: [...prev.transactions, response.data] }));
          return response.data;
        }
        throw new Error(response.error || 'Failed to lend book');
      } catch (error) {
        setState(prev => ({ ...prev, error: 'Failed to lend book' }));
        throw error;
      }
    },
    returnBook: async (transactionId: number): Promise<Transaction> => {
      try {
        const response = await window.electronAPI.transactions.return(transactionId);
        if (response.success) {
          setState(prev => ({
            ...prev,
            transactions: prev.transactions.map(transaction =>
              transaction.id === transactionId ? response.data : transaction
            )
          }));
          return response.data;
        }
        throw new Error(response.error || 'Failed to return book');
      } catch (error) {
        setState(prev => ({ ...prev, error: 'Failed to return book' }));
        throw error;
      }
    },
    getActiveTransactions: async (): Promise<Transaction[]> => {
      try {
        const response = await window.electronAPI.transactions.getActive();
        return response.success ? response.data || [] : [];
      } catch (error) {
        console.error('Failed to get active transactions:', error);
        return [];
      }
    },
    getOverdueTransactions: async (): Promise<Transaction[]> => {
      try {
        const response = await window.electronAPI.transactions.getOverdue();
        return response.success ? response.data || [] : [];
      } catch (error) {
        console.error('Failed to get overdue transactions:', error);
        return [];
      }
    },

    // Dashboard operations
    fetchDashboardStats: async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        const response = await window.electronAPI.books.getAll();
        if (response.success) {
          const stats: DashboardStats = {
            totalBooks: response.data?.length || 0,
            totalMembers: 0,
            activeLoans: 0,
            overdueBooks: 0,
            totalFines: 0,
            paidFines: 0,
            recentTransactions: [],
            overdueTransactions: [],
            popularBooks: [],
            activeMembers: [],
          };
          setState(prev => ({ ...prev, dashboardStats: stats, isLoading: false }));
        }
      } catch (error) {
        setState(prev => ({ ...prev, error: 'Failed to fetch dashboard stats', isLoading: false }));
      }
    },

    // Utility methods
    clearError: () => {
      setState(prev => ({ ...prev, error: null }));
    },
    refreshData: async () => {
      try {
        await Promise.all([
          // Skip actual data refresh for now
        ]);
      } catch (error) {
        console.error('Failed to refresh data:', error);
      }
    },
  };
};