import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../../shared/types';

// Action types
type AuthAction =
  | { type: 'LOGIN_SUCCESS' }
  | { type: 'LOGIN_FAILURE'; error: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'UPDATE_SESSION' }
  | { type: 'SESSION_EXPIRED' };

// State interface
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User;
  lastActivity: string | null;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  error: null,
  user: {
    isAuthenticated: false,
  },
  lastActivity: null,
};

// Context interface
interface AuthContextType extends AuthState {
  login: (pin: string) => Promise<void>;
  logout: () => Promise<void>;
  setup: (pin: string) => Promise<void>;
  changePin: (oldPin: string, newPin: string) => Promise<void>;
  clearError: () => void;
  isSetup: () => Promise<boolean>;
}

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        user: {
          isAuthenticated: true,
          sessionStart: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        },
        lastActivity: new Date().toISOString(),
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        error: action.error,
        user: { isAuthenticated: false },
        lastActivity: null,
      };

    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        user: { isAuthenticated: false },
        lastActivity: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.loading,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
      };

    case 'UPDATE_SESSION':
      return {
        ...state,
        lastActivity: new Date().toISOString(),
        user: {
          ...state.user,
          lastActivity: new Date().toISOString(),
        },
      };

    case 'SESSION_EXPIRED':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        error: 'Your session has expired. Please log in again.',
        user: { isAuthenticated: false },
        lastActivity: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  let sessionCheckInterval: NodeJS.Timeout;

  // Check if authentication is set up
  const isSetup = async (): Promise<boolean> => {
    try {
      const response = await window.electronAPI.auth.checkAuth();
      return response.success;
    } catch (error) {
      console.error('Failed to check authentication setup:', error);
      return false;
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', loading: true });
        const response = await window.electronAPI.auth.checkAuth();

        if (response.success && response.data.isAuthenticated) {
          dispatch({ type: 'LOGIN_SUCCESS' });
        } else {
          dispatch({ type: 'SET_LOADING', loading: false });
        }
      } catch (error) {
        console.error('Failed to check authentication status:', error);
        dispatch({ type: 'SET_ERROR', error: 'Failed to check authentication status' });
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    };

    checkAuth();

    // Set up session monitoring
    sessionCheckInterval = setInterval(() => {
      if (state.isAuthenticated) {
        checkSession();
      }
    }, 30000); // Check every 30 seconds

    // Cleanup
    return () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
  }, []);

  // Check session validity
  const checkSession = async () => {
    try {
      const response = await window.electronAPI.auth.checkAuth();

      if (!response.success || !response.data.isAuthenticated) {
        dispatch({ type: 'SESSION_EXPIRED' });
      } else {
        dispatch({ type: 'UPDATE_SESSION' });
      }
    } catch (error) {
      console.error('Failed to check session:', error);
      dispatch({ type: 'SESSION_EXPIRED' });
    }
  };

  // Login function
  const login = async (pin: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });
      dispatch({ type: 'SET_ERROR', error: null });

      const response = await window.electronAPI.auth.login(pin);

      if (response.success) {
        dispatch({ type: 'LOGIN_SUCCESS' });
      } else {
        dispatch({ type: 'LOGIN_FAILURE', error: response.error || 'Login failed' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', error: errorMessage });
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await window.electronAPI.auth.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Setup authentication
  const setup = async (pin: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });
      dispatch({ type: 'SET_ERROR', error: null });

      const response = await window.electronAPI.auth.setup(pin);

      if (response.success) {
        dispatch({ type: 'LOGIN_SUCCESS' });
      } else {
        dispatch({ type: 'LOGIN_FAILURE', error: response.error || 'Setup failed' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Setup failed';
      dispatch({ type: 'LOGIN_FAILURE', error: errorMessage });
    }
  };

  // Change PIN
  const changePin = async (oldPin: string, newPin: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });
      dispatch({ type: 'SET_ERROR', error: null });

      const response = await window.electronAPI.auth.changePin(oldPin, newPin);

      if (response.success) {
        dispatch({ type: 'SET_LOADING', loading: false });
      } else {
        dispatch({ type: 'SET_ERROR', error: response.error || 'Failed to change PIN' });
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change PIN';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  };

  // Clear error
  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', error: null });
  };

  // Update session on user activity
  useEffect(() => {
    const handleActivity = () => {
      if (state.isAuthenticated) {
        dispatch({ type: 'UPDATE_SESSION' });
      }
    };

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [state.isAuthenticated]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    setup,
    changePin,
    clearError,
    isSetup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
export default AuthContext;