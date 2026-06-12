import { useState, useEffect, useCallback } from "react";
import { WifiOff, Wifi } from "lucide-react";

const QUEUE_KEY = "najahi_offline_queue";

export function queueOfflineAction(url, method, body, token) {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  queue.push({ url, method, body, token, ts: Date.now() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

async function flushOfflineQueue() {
  const raw = localStorage.getItem(QUEUE_KEY);
  if (!raw) return;
  const queue = JSON.parse(raw);
  if (!queue.length) return;
  const failed = [];
  for (const item of queue) {
    try {
      const res = await fetch(item.url, {
        method: item.method || "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${item.token}`,
        },
        body: item.body ? JSON.stringify(item.body) : undefined,
      });
      if (!res.ok) failed.push(item);
    } catch {
      failed.push(item);
    }
  }
  if (failed.length) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
  } else {
    localStorage.removeItem(QUEUE_KEY);
  }
}

export default function OfflineBanner() {
  const [online,   setOnline]   = useState(navigator.onLine);
  const [showBack, setShowBack] = useState(false);

  const handleOnline = useCallback(() => {
    setOnline(true);
    setShowBack(true);
    flushOfflineQueue();
    setTimeout(() => setShowBack(false), 3000);
  }, []);

  const handleOffline = useCallback(() => {
    setOnline(false);
    setShowBack(false);
  }, []);

  useEffect(() => {
    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  if (online && !showBack) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999,
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 10, padding: "10px 20px",
      background: online
        ? "linear-gradient(90deg,rgba(16,185,129,0.95),rgba(5,150,105,0.95))"
        : "linear-gradient(90deg,rgba(239,68,68,0.95),rgba(185,28,28,0.95))",
      backdropFilter: "blur(8px)",
      boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      animation: "offlineBannerIn 0.3s ease",
      fontFamily: "'DM Sans',sans-serif",
    }}>
      <style>{`
        @keyframes offlineBannerIn {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
      {online
        ? <Wifi size={15} color="#fff" />
        : <WifiOff size={15} color="#fff" />
      }
      <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
        {online
          ? "Connexion rétablie — synchronisation en cours…"
          : "Mode hors-ligne — certaines fonctionnalités sont limitées"
        }
      </span>
    </div>
  );
}
