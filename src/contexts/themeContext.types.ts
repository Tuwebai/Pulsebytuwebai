export interface ThemeContextType {
  theme: 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'dark') => void;
  loading: boolean;
}
