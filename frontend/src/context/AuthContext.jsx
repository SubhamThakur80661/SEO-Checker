import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

function normalizeUser(raw) {
  if (!raw) return null;
  return {
    id: raw.id || raw._id,
    name: raw.name,
    email: raw.email,
    credits: raw.credits,
    isGuest: raw.isGuest === true,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? normalizeUser(JSON.parse(saved)) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Revalidate the saved session against /api/auth/me on load.
  // Note: /me returns { success, data: user } and the user doc has no
  // isGuest flag, so guest status is persisted separately in localStorage.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/api/auth/me")
      .then((res) => {
        const fresh = normalizeUser(res.data?.data);
        if (fresh) {
          if (localStorage.getItem("isGuest") === "1") fresh.isGuest = true;
          setUser(fresh);
          localStorage.setItem("user", JSON.stringify(fresh));
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isGuest");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const applySession = useCallback((token, rawUser) => {
    const u = normalizeUser(rawUser);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(u));
    if (u.isGuest) localStorage.setItem("isGuest", "1");
    else localStorage.removeItem("isGuest");
    setUser(u);
    return u;
  }, []);

  const login = useCallback(
    async (email, password) => {
      const res = await api.post("/api/auth/login", { email, password });
      return applySession(res.data.token, res.data.user);
    },
    [applySession]
  );

  const register = useCallback(
    async (name, email, password) => {
      const res = await api.post("/api/auth/register", { name, email, password });
      return applySession(res.data.token, res.data.user);
    },
    [applySession]
  );

  const guestLogin = useCallback(async () => {
    const res = await api.post("/api/auth/guest");
    return applySession(res.data.token, res.data.user);
  }, [applySession]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isGuest");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, guestLogin, logout }),
    [user, loading, login, register, guestLogin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
