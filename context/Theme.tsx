import { createContext } from 'react';

export const ThemeSettingsContext = createContext({
  isDarkTheme: false,
  toggleTheme: () => {}
});