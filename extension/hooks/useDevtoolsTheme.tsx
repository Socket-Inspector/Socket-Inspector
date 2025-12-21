import { browser } from '#imports';
import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const ThemeContext = createContext<Theme>('light');

export function DevtoolsThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, _setTheme] = useState<Theme>(
    browser?.devtools?.panels?.themeName === 'dark' ? 'dark' : 'light',
  );
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useDevtoolsTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useDevtoolsTheme must be used within a DevtoolsThemeProvider');
  }
  return theme;
}
