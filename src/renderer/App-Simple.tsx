import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StartupError from './components/StartupError';

// Layout components
import AppLayout from './components/Layout/AppLayout-Simple';

// Page components
import Dashboard from './pages/Dashboard';
import BooksPage from './pages/BooksPage';
import MembersPage from './pages/MembersPage';
import TransactionsPage from './pages/TransactionsPage';
import SettingsPage from './pages/SettingsPage';

const SimpleApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [startupError, setStartupError] = useState(null);
  const [startupTimeout, setStartupTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleLogin = async (pin: string) => {
    setIsLoading(true);
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    if (pin && pin.length >= 4) {
      setIsAuthenticated(true);
      alert('Login successful!');
    } else {
      alert('Invalid PIN');
    }
  };

  const handleSetup = async (pin: string) => {
    setIsLoading(true);
    // Simulate setup delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    if (pin && pin.length >= 4) {
      setIsAuthenticated(true);
      alert('Setup complete! Welcome to Library Management System.');
    } else {
      alert('PIN must be at least 4 characters');
    }
  };

  const LoginPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            📚 Library Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to continue
          </p>
        </div>
        <div className="space-y-6">
          <div>
            <input
              id="pin"
              name="pin"
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Enter your PIN (4+ digits)"
            />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                const pinInput = document.getElementById('pin') as HTMLInputElement;
                if (pinInput?.value) {
                  handleLogin(pinInput.value);
                }
              }}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => {
                const pin = prompt('Set up your PIN (4+ digits):');
                if (pin) {
                  handleSetup(pin);
                }
              }}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              First time? Set up PIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Library Management System...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/books" element={<BooksPage />} />
                  <Route path="/members" element={<MembersPage />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      <Toaster
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
};

export default SimpleApp;