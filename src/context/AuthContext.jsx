import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  loginRequest,
  registerRequest,
  refreshRequest,
  logoutRequest,
  getCurrentUser,
} from "../services/authApi";

const AuthContext = createContext(null);
const ACCESS_KEY  = "najahi_token";
const REFRESH_KEY = "najahi_refresh_token";
const USER_KEY    = "najahi_user";

// Returns remaining seconds on a JWT, or 0 if expired / unparseable
function jwtSecondsLeft(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? Math.max(0, payload.exp - Math.floor(Date.now() / 1000)) : 0;
  } catch {
    return 0;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [accessToken, setAccessToken]   = useState(() => localStorage.getItem(ACCESS_KEY));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(REFRESH_KEY));
  const [loading, setLoading]           = useState(true);

  // Keep a ref so authFetch always sees the latest tokens without stale closure issues
  const tokensRef = useRef({ accessToken: localStorage.getItem(ACCESS_KEY), refreshToken: localStorage.getItem(REFRESH_KEY) });

  const persistSession = (data) => {
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
    setUser(data.user);
    localStorage.setItem(ACCESS_KEY,  data.access_token);
    localStorage.setItem(REFRESH_KEY, data.refresh_token);
    localStorage.setItem(USER_KEY,    JSON.stringify(data.user));
    tokensRef.current = { accessToken: data.access_token, refreshToken: data.refresh_token };
    // save email and phone for ForgotPassword auto-fill
    if (data.user?.email)     localStorage.setItem("najahi_email", data.user.email);
    if (data.user?.telephone) localStorage.setItem("najahi_phone", data.user.telephone);
  };

  const clearSession = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    tokensRef.current = { accessToken: null, refreshToken: null };
  };

  const login = async (payload) => {
    const data = await loginRequest(payload);
    if (data.access_token && data.refresh_token && data.user) {
      persistSession(data);
    }
    return data;
  };

  const register = async (payload) => {
    return await registerRequest(payload);
  };

  const logout = async () => {
    try {
      if (refreshToken) await logoutRequest(refreshToken);
    } finally {
      clearSession();
    }
  };

  // Called after Google OAuth callback
  const loginWithTokens = ({ access_token, refresh_token }) => {
    try {
      const payload = JSON.parse(atob(access_token.split(".")[1]));
      const userData = {
        id:     payload.sub,
        email:  payload.email,
        role:   payload.role,
        prenom: payload.prenom || "",
      };
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      setUser(userData);
      localStorage.setItem(ACCESS_KEY,  access_token);
      localStorage.setItem(REFRESH_KEY, refresh_token);
      localStorage.setItem(USER_KEY,    JSON.stringify(userData));
      tokensRef.current = { accessToken: access_token, refreshToken: refresh_token };
      if (userData.email) localStorage.setItem("najahi_email", userData.email);
    } catch (e) {
      console.error("loginWithTokens error:", e);
    }
  };

  const restoreSession = async () => {
    const storedRefresh = localStorage.getItem(REFRESH_KEY);
    if (!storedRefresh) { setLoading(false); return; }

    // If the access token is still valid for at least 60s, skip a round-trip refresh
    const storedAccess = localStorage.getItem(ACCESS_KEY);
    if (storedAccess && jwtSecondsLeft(storedAccess) > 60) {
      tokensRef.current = { accessToken: storedAccess, refreshToken: storedRefresh };
      setLoading(false);
      return;
    }

    // Access token missing or about to expire — use the refresh token
    try {
      const refreshed = await refreshRequest(storedRefresh);
      if (refreshed.access_token && refreshed.refresh_token && refreshed.user) {
        persistSession(refreshed);
        try {
          const me = await getCurrentUser(refreshed.access_token);
          if (me?.user) {
            setUser(me.user);
            localStorage.setItem(USER_KEY, JSON.stringify(me.user));
            if (me.user.email)     localStorage.setItem("najahi_email", me.user.email);
            if (me.user.telephone) localStorage.setItem("najahi_phone", me.user.telephone);
          }
        } catch {}
      } else {
        clearSession();
      }
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  // authFetch — drop-in fetch replacement that auto-refreshes on 401
  // Usage: authFetch(url, options)  →  same API as window.fetch
  const authFetch = async (url, options = {}) => {
    const { accessToken: at, refreshToken: rt } = tokensRef.current;

    const headersWithToken = {
      ...(options.headers || {}),
      ...(at ? { Authorization: `Bearer ${at}` } : {}),
    };

    let res = await fetch(url, { ...options, headers: headersWithToken });

    if (res.status !== 401) return res;

    // 401 — attempt silent refresh
    if (!rt) {
      clearSession();
      window.location.href = "/login";
      return res;
    }

    try {
      const refreshed = await refreshRequest(rt);
      if (refreshed.access_token && refreshed.refresh_token) {
        persistSession(refreshed);
        // Retry the original request with the new access token
        const retryHeaders = {
          ...(options.headers || {}),
          Authorization: `Bearer ${refreshed.access_token}`,
        };
        return fetch(url, { ...options, headers: retryHeaders });
      }
    } catch {}

    // Refresh failed — session is dead
    clearSession();
    window.location.href = "/login";
    return res;
  };

  useEffect(() => { restoreSession(); }, []);

  const value = useMemo(() => ({
    user,
    accessToken,
    refreshToken,
    loading,
    isAuthenticated: !!accessToken && !!user,
    login,
    register,
    logout,
    clearSession,
    loginWithTokens,
    authFetch,
  }), [user, accessToken, refreshToken, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}