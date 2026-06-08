import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const { loginWithTokens } = useAuth();

  useEffect(() => {
    const access_token  = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const error         = params.get("error");

    if (error) return navigate("/login?error=" + error);

    if (!access_token) return navigate("/login?error=missing_token");

    try {
      // Persist tokens to localStorage immediately so protected routes can read them
      localStorage.setItem("najahi_token",         access_token);
      localStorage.setItem("najahi_refresh_token", refresh_token || "");
      loginWithTokens({ access_token, refresh_token });
      navigate("/app/dashboard", { replace: true });
    } catch {
      navigate("/login?error=invalid_token");
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0f0a1e,#160d2e)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontFamily: "'DM Sans',sans-serif", gap: 16,
      flexDirection: "column",
    }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #7c3aed", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Connexion en cours…</p>
    </div>
  );
}