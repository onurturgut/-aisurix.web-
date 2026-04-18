"use client";

import { useEffect, useState } from "react";
import type { AuthSession } from "@/types/auth";

type AuthError = {
  error: string | null;
};

export function useAuth(initialSession?: AuthSession | null) {
  const [session, setSession] = useState<AuthSession | null>(initialSession ?? null);
  const [loading, setLoading] = useState(initialSession === undefined);
  const isAdmin = Boolean(session?.isAdmin);

  useEffect(() => {
    if (initialSession !== undefined) {
      return;
    }

    let cancelled = false;

    async function fetchSession() {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as AuthSession | null;

        if (!cancelled) {
          setSession(data);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchSession();

    return () => {
      cancelled = true;
    };
  }, [initialSession]);

  const signIn = async (email: string, password: string): Promise<AuthError> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = (await response.json()) as AuthSession | AuthError;

    if (!response.ok || "error" in data) {
      return { error: "error" in data ? data.error : "Giriş başarısız." };
    }

    setSession(data);
    return { error: null };
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    setSession(null);
  };

  return { session, loading, isAdmin, signIn, signOut };
}
