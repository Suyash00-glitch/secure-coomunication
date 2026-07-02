import { createContext, useContext, useState, useEffect } from "react";
import { getToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getToken);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, [token]);

  function persistAuth(data) {
    localStorage.setItem("token", data.token);
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    }
    setToken(data.token);
  }

  function loginAdmin(data) {
    persistAuth(data);
  }

  function loginExternal(data) {
    persistAuth(data);
  }

  function loginInternal(data) {
    persistAuth(data);
  }

  function login(data) {
    persistAuth(data);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  }

  const isAuthenticated = !!token;
  const role = user?.role || null;

  return (
    <AuthContext.Provider value={{ user, token, role, isAuthenticated, loginAdmin, loginExternal, loginInternal, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
