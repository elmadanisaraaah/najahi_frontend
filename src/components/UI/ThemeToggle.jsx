import { Sun, Moon, Zap } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle({ style = {} }) {
  const { theme, isAuto, setManualTheme, setAutoMode } = useTheme();
  const dark = theme === "dark";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 4,
      background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
      border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
      borderRadius: 99, padding: "4px 6px",
      ...style,
    }}>
      <button type="button" onClick={() => setManualTheme("light")} title="Clair"
        style={{
          width: 30, height: 30, borderRadius: "50%", border: "none",
          background: !isAuto && theme === "light" ? "#f59e0b" : "transparent",
          color: !isAuto && theme === "light" ? "#fff" : dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
          display: "grid", placeItems: "center", cursor: "pointer",
          transition: "all 0.2s",
        }}>
        <Sun size={14} />
      </button>
      <button type="button" onClick={setAutoMode} title="Auto"
        style={{
          width: 30, height: 30, borderRadius: "50%", border: "none",
          background: isAuto ? "#7c3aed" : "transparent",
          color: isAuto ? "#fff" : dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
          display: "grid", placeItems: "center", cursor: "pointer",
          transition: "all 0.2s",
        }}>
        <Zap size={13} />
      </button>
      <button type="button" onClick={() => setManualTheme("dark")} title="Sombre"
        style={{
          width: 30, height: 30, borderRadius: "50%", border: "none",
          background: !isAuto && theme === "dark" ? "#3730a3" : "transparent",
          color: !isAuto && theme === "dark" ? "#fff" : dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
          display: "grid", placeItems: "center", cursor: "pointer",
          transition: "all 0.2s",
        }}>
        <Moon size={14} />
      </button>
    </div>
  );
}