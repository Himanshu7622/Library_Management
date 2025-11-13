import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { Settings, Lock, Database, Palette, Save } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, isLoading, error } = useSettings();
  const { changePin } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [pinForm, setPinForm] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [pinMessage, setPinMessage] = useState('');

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'auth', name: 'Authentication', icon: Lock },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ];

  const handlePinChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage('');

    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinMessage('New PINs do not match');
      return;
    }

    if (pinForm.newPin.length < 4 || pinForm.newPin.length > 8) {
      setPinMessage('PIN must be between 4 and 8 characters');
      return;
    }

    try {
      await changePin(pinForm.oldPin, pinForm.newPin);
      setPinMessage('PIN changed successfully');
      setPinForm({ oldPin: '', newPin: '', confirmPin: '' });
    } catch (error) {
      setPinMessage(error instanceof Error ? error.message : 'Failed to change PIN');
    }
  };

  const saveGeneralSettings = async () => {
    try {
      await updateSettings(settings);
      alert('Settings saved successfully');
    } catch (error) {
      alert('Failed to save settings');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Configure your library management system
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white shadow rounded-lg dark:bg-gray-800">
        {/* Tab navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  General Settings
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Configure basic application settings
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Items Per Page
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.ui.itemsPerPage}
                    onChange={(e) => updateSettings({
                      ...settings,
                      ui: { ...settings.ui, itemsPerPage: parseInt(e.target.value) }
                    })}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date Format
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.ui.dateFormat}
                    onChange={(e) => updateSettings({
                      ...settings,
                      ui: { ...settings.ui, dateFormat: e.target.value }
                    })}
                  >
                    <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                    <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                    <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                    <option value="MMMM dd, yyyy">MMMM DD, YYYY</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={saveGeneralSettings}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'auth' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Authentication Settings
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage authentication and security settings
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                <p className="text-sm">
                  Authentication is currently <strong>enabled</strong>. Users must enter a PIN to access the application.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Change PIN
                </h4>
                <form onSubmit={handlePinChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current PIN
                    </label>
                    <input
                      type="password"
                      value={pinForm.oldPin}
                      onChange={(e) => setPinForm({ ...pinForm, oldPin: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      New PIN
                    </label>
                    <input
                      type="password"
                      value={pinForm.newPin}
                      onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm New PIN
                    </label>
                    <input
                      type="password"
                      value={pinForm.confirmPin}
                      onChange={(e) => setPinForm({ ...pinForm, confirmPin: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  {pinMessage && (
                    <div className={`text-sm ${pinMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                      {pinMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Change PIN
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Database Settings
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage database and backup settings
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                <p className="text-sm">
                  Database is stored locally on this device. Regular backups are recommended.
                </p>
              </div>

              <div className="space-y-4">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">
                  Backup Database
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">
                  Restore Database
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                  Export CSV
                </button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Appearance Settings
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Customize the look and feel of the application
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Theme
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.ui.theme}
                    onChange={(e) => updateSettings({
                      ...settings,
                      ui: { ...settings.ui, theme: e.target.value }
                    })}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Font Size
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.ui.fontSize}
                    onChange={(e) => updateSettings({
                      ...settings,
                      ui: { ...settings.ui, fontSize: e.target.value }
                    })}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;