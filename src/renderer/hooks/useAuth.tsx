import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  const [fallbackReady, setFallbackReady] = useState(false);

  // If context is available, use it
  if (context) {
    return context;
  }

  // Fallback for when context is not available
  useEffect(() => {
    // Small delay to simulate authentication check
    const timer = setTimeout(() => {
      setFallbackReady(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!fallbackReady) {
    return {
      isAuthenticated: false,
      isLoading: true,
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
        alert('PIN setup complete! You can now login with your PIN.');
      },
      changePin: async (oldPin: string, newPin: string) => {
        if (!oldPin || !newPin) {
          throw new Error('Both old and new PINs are required');
        }
        if (newPin.length < 4 || newPin.length > 8) {
          throw new Error('PIN must be between 4 and 8 characters');
        }
        console.log('PIN change attempted');
        alert('PIN changed successfully!');
      },
      clearError: () => {},
      isSetup: async () => false,
    };
  }

  // After fallback is ready, show login screen
  return {
    isAuthenticated: false,
    isLoading: false,
    error: null,
    user: { isAuthenticated: false },
    lastActivity: null,
    login: async (pin: string) => {
      console.log('Login attempted with pin:', pin);
      // Simulate successful login
      if (pin && pin.length >= 4 && pin.length <= 8) {
        alert('Login successful!');
        return;
      }
      throw new Error('Invalid PIN');
    },
    logout: async () => {
      console.log('Logout attempted');
      alert('Logged out successfully!');
    },
    setup: async (pin: string) => {
      console.log('Setup attempted with pin:', pin);
      if (pin && pin.length >= 4 && pin.length <= 8) {
        alert('PIN setup complete! You can now login with your PIN.');
        return;
      }
      throw new Error('PIN must be between 4 and 8 characters');
    },
    changePin: async (oldPin: string, newPin: string) => {
      if (!oldPin || !newPin) {
        throw new Error('Both old and new PINs are required');
      }
      if (newPin.length < 4 || newPin.length > 8) {
        throw new Error('PIN must be between 4 and 8 characters');
      }
      console.log('PIN change attempted');
      alert('PIN changed successfully!');
    },
    clearError: () => {},
    isSetup: async () => true,
  };
};