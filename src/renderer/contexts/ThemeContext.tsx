import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
}

interface ThemeContextType {
  theme: ThemeConfig;
  currentTheme: 'light' | 'dark';
  setTheme: (theme: Partial<ThemeConfig>) => void;
  toggleDarkMode: () => void;
  isDarkMode: () => boolean;
  getThemeClass: () => string;
}

const defaultTheme: ThemeConfig = {
  mode: 'light',
  primaryColor: '#2563eb',
  fontSize: 'medium',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeConfig>(defaultTheme);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  // Load theme from localStorage or system preference
  useEffect(() => {
    const loadTheme = () => {
      try {
        // Try to load from localStorage first
        const savedTheme = localStorage.getItem('library-theme');
        if (savedTheme) {
          const parsedTheme = JSON.parse(savedTheme);
          setThemeState({ ...defaultTheme, ...parsedTheme });
        } else {
          // Default to system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setThemeState({ ...defaultTheme, mode: 'system' });
          setCurrentTheme(prefersDark ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
        setThemeState(defaultTheme);
      }
    };

    loadTheme();
  }, []);

  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      const html = document.documentElement;

      // Remove existing theme classes
      html.classList.remove('light', 'dark');

      // Add current theme class
      html.classList.add(currentTheme);

      // Apply font size
      const fontSizeClass = `text-${theme.fontSize}`;
      html.classList.remove('text-small', 'text-medium', 'text-large');
      html.classList.add(fontSizeClass);

      // Apply custom CSS variables
      html.style.setProperty('--primary-color', theme.primaryColor);

      // Save theme to localStorage
      localStorage.setItem('library-theme', JSON.stringify(theme));
    };

    applyTheme();
  }, [theme, currentTheme]);

  // Listen for system theme changes when mode is 'system'
  useEffect(() => {
    if (theme.mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e: MediaQueryListEvent) => {
        setCurrentTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);

      // Set initial value
      setCurrentTheme(mediaQuery.matches ? 'dark' : 'light');

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [theme.mode]);

  // Determine current theme based on mode
  useEffect(() => {
    if (theme.mode === 'dark') {
      setCurrentTheme('dark');
    } else if (theme.mode === 'light') {
      setCurrentTheme('light');
    }
    // 'system' mode is handled by the media query listener above
  }, [theme.mode]);

  const setTheme = (newTheme: Partial<ThemeConfig>) => {
    setThemeState(prevTheme => ({ ...prevTheme, ...newTheme }));
  };

  const toggleDarkMode = () => {
    if (theme.mode === 'light') {
      setThemeState(prevTheme => ({ ...prevTheme, mode: 'dark' }));
    } else if (theme.mode === 'dark') {
      setThemeState(prevTheme => ({ ...prevTheme, mode: 'light' }));
    } else {
      // If system mode, toggle between light and dark
      setThemeState(prevTheme => ({
        ...prevTheme,
        mode: currentTheme === 'light' ? 'dark' : 'light'
      }));
    }
  };

  const isDarkMode = (): boolean => {
    return currentTheme === 'dark';
  };

  const getThemeClass = (): string => {
    return currentTheme;
  };

  const value: ThemeContextType = {
    theme,
    currentTheme,
    setTheme,
    toggleDarkMode,
    isDarkMode,
    getThemeClass,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={`theme-${currentTheme} ${theme.fontSize}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Custom hook for applying theme-specific styles
export const useThemeStyles = () => {
  const { currentTheme, theme } = useTheme();

  const getThemeColors = () => {
    if (currentTheme === 'dark') {
      return {
        background: 'bg-gray-900',
        surface: 'bg-gray-800',
        surfaceHover: 'bg-gray-700',
        text: 'text-gray-100',
        textSecondary: 'text-gray-300',
        border: 'border-gray-700',
        primary: 'bg-blue-600',
        primaryHover: 'bg-blue-700',
      };
    } else {
      return {
        background: 'bg-gray-50',
        surface: 'bg-white',
        surfaceHover: 'bg-gray-100',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600',
        border: 'border-gray-300',
        primary: 'bg-primary-600',
        primaryHover: 'bg-primary-700',
      };
    }
  };

  const getComponentStyles = () => {
    const colors = getThemeColors();

    return {
      card: `${colors.surface} border ${colors.border} rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200`,
      input: `w-full px-3 py-2 border ${colors.border} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${colors.background} ${colors.text}`,
      button: `inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.primary} text-white hover:${colors.primaryHover} focus:ring-primary-500`,
      buttonOutline: `inline-flex items-center justify-center px-4 py-2 border ${colors.border} text-sm font-medium rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.text} ${colors.surface} hover:${colors.surfaceHover} focus:ring-primary-500`,
    };
  };

  return {
    themeColors: getThemeColors(),
    componentStyles: getComponentStyles(),
    isDark: currentTheme === 'dark',
    fontSize: theme.fontSize,
  };
};

export default ThemeContext;