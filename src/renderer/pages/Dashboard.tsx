import React, { useEffect } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { LayoutDashboard, Book, Users, ArrowRightLeft, AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { dashboardStats, fetchDashboardStats, isLoading, error } = useDatabase();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Error loading dashboard</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const stats = dashboardStats;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Overview of your library management system
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Book className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                    Total Books
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats?.totalBooks || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                    Total Members
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats?.totalMembers || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

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
                    {stats?.activeLoans || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                    Overdue Books
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats?.overdueBooks || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <div className="mt-5">
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                  {stats?.recentTransactions?.slice(0, 5).map((transaction) => (
                    <li key={transaction.id} className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Book className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.transaction_type === 'lend' ? 'Loaned' : 'Returned'}: {transaction.book_title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {transaction.member_name} • {new Date(transaction.transaction_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue books */}
      {stats?.overdueTransactions && stats.overdueTransactions.length > 0 && (
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg dark:bg-gray-800">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Overdue Books
              </h3>
              <div className="mt-5">
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                    {stats.overdueTransactions.slice(0, 5).map((transaction) => (
                      <li key={transaction.id} className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {transaction.book_title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {transaction.member_name} • Due: {new Date(transaction.due_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;