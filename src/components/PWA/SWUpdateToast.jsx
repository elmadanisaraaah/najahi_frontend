import { useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function SWUpdateToast() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [animOut, setAnimOut] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  const dismiss = () => {
    setAnimOut(true);
    setTimeout(() => setNeedRefresh(false), 380);
  };

  return (
    <>
      <style>{`
        @keyframes slideUpSW {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes slideDownSW {
          from { transform: translateY(0);    opacity: 1; }
          to   { transform: translateY(100%); opacity: 0; }
        }
        .sw-banner { animation: slideUpSW 0.38s cubic-bezier(0.34,1.56,0.64,1) both; }
        .sw-banner.out { animation: slideDownSW 0.32s ease-in both; }
      `}</style>

      <div
        className={`sw-banner${animOut ? " out" : ""}`}
        style={{
          position: "fixed",
          bottom: 88,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9998,
          width: "calc(100vw - 32px)",
          maxWidth: 420,
          background: dark ? "rgba(22,13,46,0.96)" : "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: dark
            ? "1px solid rgba(124,58,237,0.35)"
            : "1px solid rgba(124,58,237,0.2)",
          borderRadius: 18,
          boxShadow: dark
            ? "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.15)"
            : "0 8px 40px rgba(124,58,237,0.18), 0 2px 12px rgba(0,0,0,0.08)",
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          style={{
            width: 46, height: 46, borderRadius: 13, flexShrink: 0,
            background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
          }}
        >
          <RefreshCw size={22} color="#fff" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0, fontSize: 14, fontWeight: 700,
            color: dark ? "#fff" : "#1a1625", lineHeight: 1.3,
          }}>
            Nouvelle version disponible
          </p>
          <p style={{
            margin: "3px 0 0", fontSize: 12,
            color: dark ? "rgba(255,255,255,0.5)" : "rgba(26,22,37,0.5)",
            lineHeight: 1.4,
          }}>
            Mets à jour pour les dernières fonctionnalités
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => updateServiceWorker(true)}
            style={{
              padding: "7px 16px",
              background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
              color: "#fff", border: "none", borderRadius: 9,
              fontSize: 13, fontWeight: 700,
              fontFamily: "'DM Sans',sans-serif",
              cursor: "pointer", whiteSpace: "nowrap",
              boxShadow: "0 3px 10px rgba(124,58,237,0.4)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 5px 16px rgba(124,58,237,0.6)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 3px 10px rgba(124,58,237,0.4)"}
          >
            Mettre à jour
          </button>
          <button
            onClick={dismiss}
            style={{
              padding: "5px 16px",
              background: "none",
              color: dark ? "rgba(255,255,255,0.4)" : "rgba(26,22,37,0.4)",
              border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(26,22,37,0.12)",
              borderRadius: 9,
              fontSize: 12, fontWeight: 500,
              fontFamily: "'DM Sans',sans-serif",
              cursor: "pointer", whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = dark ? "rgba(255,255,255,0.7)" : "rgba(26,22,37,0.7)"}
            onMouseLeave={e => e.currentTarget.style.color = dark ? "rgba(255,255,255,0.4)" : "rgba(26,22,37,0.4)"}
          >
            Plus tard
          </button>
        </div>
      </div>
    </>
  );
}
