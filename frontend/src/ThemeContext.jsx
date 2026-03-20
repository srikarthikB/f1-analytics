// Theme system removed — app is dark mode only.
// This file is kept as a no-op stub so no import paths break during migration.
export function ThemeProvider({ children }) {
  return children;
}

export function useTheme() {
  return { dark: true, toggle: () => {} };
}

export function t(_dark, darkVal) {
  return darkVal;
}