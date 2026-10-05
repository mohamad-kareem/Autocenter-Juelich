"use client";

import { useEffect, useState } from "react";

const CACHE_KEY = "ac-session";

/**
 * Reads the current login from the lightweight /api/auth/session endpoint.
 * The last answer is cached per browser tab so the menu does not flicker
 * while navigating. Returns null when nobody is logged in.
 */
export default function useSession() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached && alive) setUser(JSON.parse(cached) || null);
      } catch {
        /* ignore unavailable storage */
      }

      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        setUser(data?.user || null);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(data?.user || null));
        } catch {
          /* ignore unavailable storage */
        }
      } catch {
        /* offline – keep whatever we have */
      }
    };

    const t = setTimeout(run, 0);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  return user;
}
