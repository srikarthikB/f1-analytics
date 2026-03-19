import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true);
  const toggle = () => setDark((d) => !d);
  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// ─── Token maps ────────────────────────────────────────────────────────────────
// Each key is a semantic name; value is [darkClass, lightClass]
export function t(dark, darkVal, lightVal) {
  return dark ? darkVal : lightVal;
}