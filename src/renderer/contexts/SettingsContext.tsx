import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Settings } from '../../shared/types';
import { DEFAULT_SETTINGS } from '../../shared/constants';

// Action types
type SettingsAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_SETTINGS'; settings: Settings }
  | { type: 'UPDATE_SETTING'; key: string; value: any }
  | { type: 'RESET_SETTINGS' };

// State interface
interface SettingsState {
  isLoading: boolean;
  error: string | null;
  settings: Settings;
  isInitialized: boolean;
}

// Initial state
const initialState: SettingsState = {
  isLoading: true,
  error: null,
  settings: DEFAULT_SETTINGS,
  isInitialized: false,
};

// Context interface
interface SettingsContextType extends SettingsState {
  // Settings operations
  fetchSettings: () => Promise<void>;
  updateSetting: (key: string, value: any) => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  resetSettings: () => Promise<void>;

  // Specific setting helpers
  updateFineRules: (memberType: string, rules: any) => Promise<void>;
  updateLendingPeriods: (periods: any) => Promise<void>;
  updateAuthSettings: (authSettings: any) => Promise<void>;
  updateUISettings: (uiSettings: any) => Promise<void>;

  // Getters
  getFineRule: (memberType: string) => any;
  getLendingPeriod: (memberType: string) => number;
  getAuthSetting: (key: string) => any;
  getUISetting: (key: string) => any;
}

// Reducer
const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.loading,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        isLoading: false,
      };

    case 'SET_SETTINGS':
      return {
        ...state,
        settings: action.settings,
        isLoading: false,
        error: null,
        isInitialized: true,
      };

    case 'UPDATE_SETTING':
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.key]: action.value,
        },
        error: null,
      };

    case 'RESET_SETTINGS':
      return {
        ...state,
        settings: DEFAULT_SETTINGS,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Error handling wrapper
  const withErrorHandling = async <T,>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T> => {
    try {
      dispatch({ type: 'SET_ERROR', error: null });
      return await operation();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : errorMessage;
      dispatch({ type: 'SET_ERROR', error: errorMsg });
      throw error;
    }
  };

  // Fetch all settings from database
  const fetchSettings = async (): Promise<void> => {
    await withErrorHandling(async () => {
      dispatch({ type: 'SET_LOADING', loading: true });
      const response = await window.electronAPI.settings.getAll();

      if (response.success) {
        const settings = response.data || {};

        // Merge with defaults to ensure all required settings exist
        const mergedSettings: Settings = {
          fineRules: { ...DEFAULT_SETTINGS.fineRules, ...settings.fineRules },
          lendingPeriods: { ...DEFAULT_SETTINGS.lendingPeriods, ...settings.lendingPeriods },
          authentication: { ...DEFAULT_SETTINGS.authentication, ...settings.authentication },
          database: { ...DEFAULT_SETTINGS.database, ...settings.database },
          ui: { ...DEFAULT_SETTINGS.ui, ...settings.ui },
        };

        dispatch({ type: 'SET_SETTINGS', settings: mergedSettings });
      } else {
        throw new Error(response.error || 'Failed to fetch settings');
      }
    }, 'Failed to fetch settings');
  };

  // Update a single setting
  const updateSetting = async (key: string, value: any): Promise<void> => {
    await withErrorHandling(async () => {
      const response = await window.electronAPI.settings.set(key, value);

      if (response.success) {
        dispatch({ type: 'UPDATE_SETTING', key, value });
      } else {
        throw new Error(response.error || 'Failed to update setting');
      }
    }, 'Failed to update setting');
  };

  // Update multiple settings
  const updateSettings = async (newSettings: Partial<Settings>): Promise<void> => {
    await withErrorHandling(async () => {
      // Update each setting individually
      for (const [key, value] of Object.entries(newSettings)) {
        const response = await window.electronAPI.settings.set(key, value);
        if (!response.success) {
          throw new Error(`Failed to update setting ${key}: ${response.error}`);
        }
        dispatch({ type: 'UPDATE_SETTING', key, value });
      }
    }, 'Failed to update settings');
  };

  // Reset settings to defaults
  const resetSettings = async (): Promise<void> => {
    await withErrorHandling(async () => {
      // Reset all settings to defaults
      await updateSettings(DEFAULT_SETTINGS);
    }, 'Failed to reset settings');
  };

  // Specific setting helpers
  const updateFineRules = async (memberType: string, rules: any): Promise<void> => {
    const updatedFineRules = {
      ...state.settings.fineRules,
      [memberType]: rules,
    };
    await updateSetting('fineRules', updatedFineRules);
  };

  const updateLendingPeriods = async (periods: any): Promise<void> => {
    const updatedLendingPeriods = {
      ...state.settings.lendingPeriods,
      ...periods,
    };
    await updateSetting('lendingPeriods', updatedLendingPeriods);
  };

  const updateAuthSettings = async (authSettings: any): Promise<void> => {
    const updatedAuthSettings = {
      ...state.settings.authentication,
      ...authSettings,
    };
    await updateSetting('authentication', updatedAuthSettings);
  };

  const updateUISettings = async (uiSettings: any): Promise<void> => {
    const updatedUISettings = {
      ...state.settings.ui,
      ...uiSettings,
    };
    await updateSetting('ui', updatedUISettings);
  };

  // Getters for specific settings
  const getFineRule = (memberType: string): any => {
    return state.settings.fineRules[memberType as keyof typeof state.settings.fineRules] ||
           DEFAULT_SETTINGS.fineRules[memberType as keyof typeof DEFAULT_SETTINGS.fineRules];
  };

  const getLendingPeriod = (memberType: string): number => {
    return state.settings.lendingPeriods[memberType as keyof typeof state.settings.lendingPeriods] ||
           DEFAULT_SETTINGS.lendingPeriods[memberType as keyof typeof DEFAULT_SETTINGS.lendingPeriods];
  };

  const getAuthSetting = (key: string): any => {
    return state.settings.authentication[key as keyof typeof state.settings.authentication] ||
           DEFAULT_SETTINGS.authentication[key as keyof typeof DEFAULT_SETTINGS.authentication];
  };

  const getUISetting = (key: string): any => {
    return state.settings.ui[key as keyof typeof state.settings.ui] ||
           DEFAULT_SETTINGS.ui[key as keyof typeof DEFAULT_SETTINGS.ui];
  };

  const value: SettingsContextType = {
    ...state,
    // Settings operations
    fetchSettings,
    updateSetting,
    updateSettings,
    resetSettings,
    // Specific setting helpers
    updateFineRules,
    updateLendingPeriods,
    updateAuthSettings,
    updateUISettings,
    // Getters
    getFineRule,
    getLendingPeriod,
    getAuthSetting,
    getUISetting,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

// Hook to use settings context
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;