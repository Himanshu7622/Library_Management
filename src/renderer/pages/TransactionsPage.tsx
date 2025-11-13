import React, { useEffect } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { ArrowRightLeft, Clock, AlertTriangle } from 'lucide-react';

const TransactionsPage: React.FC = () => {
  const { transactions, fetchTransactions, fetchBooks, fetchMembers, isLoading, error } = useDatabase();

  useEffect(() => {
    fetchTransactions();
    fetchBooks();
    fetchMembers();
  }, [fetchTransactions, fetchBooks, fetchMembers]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage book lending and return transactions
          </p>
        </div>
      </div>

      {/* Transaction stats */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowRightLeft className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                    Active Loans
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {transactions.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions list */}
      <div className="mt-6 bg-white shadow rounded-lg dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Active Loans
            </h3>
            <div className="flex gap-2">
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">
                <Clock className="mr-1 h-4 w-4" />
                View History
              </button>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                New Loan
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {isLoading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-medium">Error loading transactions</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!isLoading && !error && transactions.length === 0 && (
            <div className="text-center py-12">
              <ArrowRightLeft className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No active loans</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                There are currently no active loans in the system.
              </p>
            </div>
          )}

          {!isLoading && !error && transactions.length > 0 && (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Book
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Loan Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Status
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {(transaction as any).book_title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {transaction.bookId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {(transaction as any).member_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.memberId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.transactionDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          (transaction as any).status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {(transaction as any).status === 'overdue' ? (
                            <span className="flex items-center">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Overdue
                            </span>
                          ) : (
                            'On Time'
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 mr-3">
                          Details
                        </button>
                        <button className="text-green-600 hover:text-green-900 dark:text-green-400">
                          Return
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;