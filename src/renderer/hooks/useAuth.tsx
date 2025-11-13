import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context) {
    return context;
  }

  // Fallback for when context is not available
  return {
    isAuthenticated: false,
    isLoading: false,
    error: null,
    user: { isAuthenticated: false },
    lastActivity: null,
    login: async (pin: string) => {
      console.log('Login attempted with pin:', pin);
    },
    logout: async () => {
      console.log('Logout attempted');
    },
    setup: async (pin: string) => {
      console.log('Setup attempted with pin:', pin);
    },
    changePin: async (oldPin: string, newPin: string) => {
      if (!oldPin || !newPin) {
        throw new Error('Both old and new PINs are required');
      }
      if (newPin.length < 4 || newPin.length > 8) {
        throw new Error('PIN must be between 4 and 8 characters');
      }
      console.log('PIN change attempted');
    },
    clearError: () => {},
    isSetup: async () => true,
  };
};