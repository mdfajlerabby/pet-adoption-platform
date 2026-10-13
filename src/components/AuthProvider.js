"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiRequest, asJson } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    apiRequest("/auth/me")
      .then((result) => {
        if (!active) return;
        setUser(result.user);
        setStatus("authenticated");
      })
      .catch((error) => {
        if (!active) return;
        setUser(null);

        if (
          error.status === 401 ||
          error.status === 403 ||
          error.status === 0
        ) {
          setStatus("anonymous");
          if (error.status === 0) {
            console.warn(
              "The adoption service is unavailable; continuing as anonymous.",
            );
          }
          return;
        }

        setStatus("error");
        console.error("Unable to restore the adoption session:", error.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const result = await apiRequest("/auth/login", {
      method: "POST",
      body: asJson({ email, password }),
    });
    setUser(result.user);
    setStatus("authenticated");
    return result.user;
  }, []);

  const register = useCallback(async (details) => {
    const result = await apiRequest("/auth/register", {
      method: "POST",
      body: asJson(details),
    });
    setUser(result.user);
    setStatus("authenticated");
    return result.user;
  }, []);

  const signInWithGoogle = useCallback(async (credential) => {
    const result = await apiRequest("/auth/google", {
      method: "POST",
      body: asJson({ credential }),
    });
    setUser(result.user);
    setStatus("authenticated");
    return result.user;
  }, []);

  const signOut = useCallback(async () => {
    await apiRequest("/auth/logout", { method: "POST" });
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo(
    () => ({ user, status, signIn, register, signInWithGoogle, signOut }),
    [user, status, signIn, register, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
