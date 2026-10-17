import { useEffect, useState } from "react";
import AuthContext from "./auth-context";
import {
  login as loginRequest,
  logout as logoutRequest,
  refreshSession,
  register as registerRequest,
  requestPasswordReset,
  resetPassword,
} from "../services/authService";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    refreshSession()
      .then((sessionUser) => {
        if (isCurrent) setUser(sessionUser);
      })
      .catch(() => {
        if (isCurrent) setUser(null);
      })
      .finally(() => {
        if (isCurrent) setReady(true);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  async function login(credentials) {
    const sessionUser = await loginRequest(credentials);
    setUser(sessionUser);
    return sessionUser;
  }

  async function register(details) {
    const sessionUser = await registerRequest(details);
    setUser(sessionUser);
    return sessionUser;
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }

  const value = {
    user,
    ready,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
