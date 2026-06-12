import { useState } from "react";

const PALETTE = ["#7c3aed","#10b981","#f59e0b","#3b82f6","#ef4444","#06b6d4","#8b5cf6","#ec4899"];

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getBg(name) {
  if (!name) return PALETTE[0];
  const code = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[code % PALETTE.length];
}

export default function Avatar({ src, name, size = 36, borderRadius = "50%", style, onClick }) {
  const [imgError, setImgError] = useState(false);
  const showImg = src && !imgError;
  const bg = getBg(name);

  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius,
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: showImg ? "transparent" : `linear-gradient(135deg,${bg},${bg}bb)`,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {showImg ? (
        <img
          src={src}
          alt={name || "avatar"}
          onError={() => setImgError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span style={{
          fontSize: size * 0.38,
          fontWeight: 700,
          color: "#fff",
          fontFamily: "'DM Sans',sans-serif",
          lineHeight: 1,
          userSelect: "none",
        }}>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}
