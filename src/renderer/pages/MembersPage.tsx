import React, { useEffect, useState } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { Users, Plus, Search } from 'lucide-react';
import { MemberFilters } from '../../shared/types';

const MembersPage: React.FC = () => {
  const { members, fetchMembers, isLoading, error } = useDatabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MemberFilters>({});

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const newFilters: MemberFilters = { ...filters };
    if (query.trim()) {
      newFilters.search = query.trim();
    } else {
      delete newFilters.search;
    }
    setFilters(newFilters);
    fetchMembers(newFilters);
  };

  const handleFilterChange = (key: keyof MemberFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchMembers(newFilters);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Members
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage library members and their information
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Member
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
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="rounded-md border-0 bg-gray-100 py-1.5 px-3 text-gray-900 focus:ring-2 focus:ring-primary-600 sm:text-sm dark:bg-gray-700 dark:text-white"
                value={filters.memberType || 'all'}
                onChange={(e) => handleFilterChange('memberType', e.target.value === 'all' ? undefined : e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members list */}
        <div className="p-4">
          {isLoading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-medium">Error loading members</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!isLoading && !error && members.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No members</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by adding your first member.
              </p>
            </div>
          )}

          {!isLoading && !error && members.length > 0 && (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Member ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Active Loans
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {member.memberId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.memberType === 'student' ? 'bg-blue-100 text-blue-800' :
                          member.memberType === 'faculty' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {member.memberType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {member.email || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {(member as any).active_loans || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400">
                          Edit
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

export default MembersPage;