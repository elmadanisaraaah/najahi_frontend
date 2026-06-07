import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

function getAutoTheme() {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 19 ? "light" : "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("najahi_theme");
    return saved || getAutoTheme();
  });
  const [isAuto, setIsAuto] = useState(() => !localStorage.getItem("najahi_theme"));

  useEffect(() => {
    if (!isAuto) return;
    const interval = setInterval(() => {
      setTheme(getAutoTheme());
    }, 60000);
    return () => clearInterval(interval);
  }, [isAuto]);

  const setManualTheme = (t) => {
    setIsAuto(false);
    setTheme(t);
    localStorage.setItem("najahi_theme", t);
  };

  const setAutoMode = () => {
    setIsAuto(true);
    localStorage.removeItem("najahi_theme");
    setTheme(getAutoTheme());
  };

  const toggle = () => setManualTheme(theme === "dark" ? "light" : "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isAuto, setManualTheme, setAutoMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);