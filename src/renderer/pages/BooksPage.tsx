import React, { useEffect, useState } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { Book, Plus, Search, Filter } from 'lucide-react';
import { BookFilters } from '../../shared/types';

const BooksPage: React.FC = () => {
  const { books, fetchBooks, isLoading, error } = useDatabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<BookFilters>({});

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const newFilters: BookFilters = { ...filters };
    if (query.trim()) {
      newFilters.search = query.trim();
    } else {
      delete newFilters.search;
    }
    setFilters(newFilters);
    fetchBooks(newFilters);
  };

  const handleFilterChange = (key: keyof BookFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchBooks(newFilters);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Books
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage your book inventory
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mt-6 bg-white shadow rounded-lg dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-md border-0 bg-gray-100 py-1.5 pl-10 pr-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="rounded-md border-0 bg-gray-100 py-1.5 px-3 text-gray-900 focus:ring-2 focus:ring-primary-600 sm:text-sm dark:bg-gray-700 dark:text-white"
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="loaned">Loaned</option>
                <option value="reserved">Reserved</option>
              </select>
              <select
                className="rounded-md border-0 bg-gray-100 py-1.5 px-3 text-gray-900 focus:ring-2 focus:ring-primary-600 sm:text-sm dark:bg-gray-700 dark:text-white"
                value={filters.availability || 'all'}
                onChange={(e) => handleFilterChange('availability', e.target.value === 'all' ? undefined : e.target.value)}
              >
                <option value="all">All Availability</option>
                <option value="available">Available</option>
                <option value="loaned">Loaned Out</option>
              </select>
            </div>
          </div>
        </div>

        {/* Books list */}
        <div className="p-4">
          {isLoading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-medium">Error loading books</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!isLoading && !error && books.length === 0 && (
            <div className="text-center py-12">
              <Book className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No books</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by adding your first book.
              </p>
            </div>
          )}

          {!isLoading && !error && books.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map((book) => (
                <div key={book.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow dark:bg-gray-700 dark:border-gray-600">
                  <div className="p-4">
                    <div className="aspect-w-3 aspect-h-4 mb-4">
                      <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center dark:bg-gray-600">
                        <Book className="h-12 w-12 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 truncate dark:text-white">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 dark:text-gray-400">
                      {Array.isArray(book.authors) ? book.authors.join(', ') : book.authors}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        book.status === 'available' ? 'bg-green-100 text-green-800' :
                        book.status === 'loaned' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {book.status}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {book.availableCopies}/{book.totalCopies}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BooksPage;