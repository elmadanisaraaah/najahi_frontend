import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  loginRequest,
  registerRequest,
  refreshRequest,
  logoutRequest,
  getCurrentUser,
} from "../services/authApi";

const AuthContext = createContext(null);
const ACCESS_KEY = "najahi_token";
const REFRESH_KEY = "najahi_refresh_token";
const USER_KEY    = "najahi_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [accessToken, setAccessToken]   = useState(() => localStorage.getItem(ACCESS_KEY));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(REFRESH_KEY));
  const [loading, setLoading]           = useState(true);

  const persistSession = (data) => {
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
    setUser(data.user);
    localStorage.setItem(ACCESS_KEY,  data.access_token);
    localStorage.setItem(REFRESH_KEY, data.refresh_token);
    localStorage.setItem(USER_KEY,    JSON.stringify(data.user));
    // save email and phone for ForgotPassword auto-fill
    if (data.user?.email)    localStorage.setItem("najahi_email", data.user.email);
    if (data.user?.telephone) localStorage.setItem("najahi_phone", data.user.telephone);
  };

  const clearSession = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
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
      if (userData.email) localStorage.setItem("najahi_email", userData.email);
    } catch (e) {
      console.error("loginWithTokens error:", e);
    }
  };

  const restoreSession = async () => {
    if (!refreshToken) { setLoading(false); return; }
    try {
      const refreshed = await refreshRequest(refreshToken);
      if (refreshed.access_token && refreshed.refresh_token && refreshed.user) {
        persistSession(refreshed);
        // fetch full profile to get prenom
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
  }), [user, accessToken, refreshToken, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}