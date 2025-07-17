
"use client";

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';
import { createContext, useContext, ReactNode } from 'react';

interface ThemeContextType {
  theme?: string;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
}

// This context is a lightweight wrapper if we need more custom logic around next-themes
const CustomThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function useTheme(): ThemeContextType {
  const context = useNextTheme();
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  const toggleTheme = () => {
    context.setTheme(context.theme === 'light' ? 'dark' : 'light');
  };

  return { ...context, toggleTheme };
}
