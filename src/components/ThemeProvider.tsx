import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference or default to 'dark'
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setTheme(savedTheme);
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    try {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const root = document.documentElement;
        
        // Remove both classes first
        root.classList.remove('light', 'dark');
        
        // Add the current theme
        root.classList.add(theme);
        
        // Save to localStorage
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('theme', theme);
        }
      }
    } catch (e) {
      // Ignore DOM errors
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    try {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    } catch (e) {
      // Ignore errors
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
