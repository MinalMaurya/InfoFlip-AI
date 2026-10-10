import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {}
});

const THEME_STORAGE_KEY = 'infoflip-theme';

function resolveInitialTheme(themePref) {
  if (typeof window === 'undefined') return 'light';
  if (themePref === 'dark') return 'dark';
  if (themePref === 'light') return 'light';
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function applyDomTheme(nextResolved, mode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const isDark = nextResolved === 'dark';

  if (isDark) {
    root.classList.add('dark');
    if (document.body) document.body.classList.add('dark');
  } else {
    root.classList.remove('dark');
    if (document.body) document.body.classList.remove('dark');
  }
  root.setAttribute('data-theme', nextResolved);
  root.setAttribute('data-theme-mode', mode);
  root.style.colorScheme = nextResolved;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {
      // LocalStorage access might fail in restricted environments
    }
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => resolveInitialTheme(theme));

  // Handle theme changes and system preference changes without flash or reload
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let isDark = false;
      if (theme === 'system') {
        isDark = mediaQuery.matches;
      } else {
        isDark = theme === 'dark';
      }

      const nextResolved = isDark ? 'dark' : 'light';
      setResolvedTheme(nextResolved);
      applyDomTheme(nextResolved, theme);
    };

    applyTheme();

    const listener = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = (newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark' && newTheme !== 'system') return;
    const nextResolved = resolveInitialTheme(newTheme);
    applyDomTheme(nextResolved, newTheme);
    setResolvedTheme(nextResolved);
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
