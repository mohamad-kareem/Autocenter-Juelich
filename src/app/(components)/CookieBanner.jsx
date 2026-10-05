"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

export const COOKIE_STORAGE_KEY = "ac_cookie_consent";
export const COOKIE_EVENT = "ac-cookie-consent";

function readConsent() {
  try {
    return localStorage.getItem(COOKIE_STORAGE_KEY);
  } catch {
    return "unavailable";
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (readConsent()) return;
    const t1 = setTimeout(() => setVisible(true), 400);
    const t2 = setTimeout(() => setShow(true), 440);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  function close(accepted) {
    try {
      localStorage.setItem(
        COOKIE_STORAGE_KEY,
        JSON.stringify({ accepted, date: new Date().toISOString() }),
      );
    } catch {
      /* storage blocked – just hide */
    }
    window.dispatchEvent(new Event(COOKIE_EVENT));
    setShow(false);
    setTimeout(() => setVisible(false), 250);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie-Einstellungen"
      className={[
        "fixed inset-x-2 bottom-2 z-[70] sm:inset-x-auto sm:left-4 sm:bottom-4 sm:max-w-sm",
        "transition-all duration-300 ease-out",
        show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      ].join(" ")}
    >
      <div className="card p-4 shadow-float">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Cookie className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">Cookies &amp; Datenschutz</h3>
            <p className="mt-0.5 text-xs leading-5 text-muted">
              Wir verwenden technisch notwendige Cookies, damit unsere Website zuverlässig
              funktioniert. Mehr dazu in der{" "}
              <Link href="/Datenschutz" className="font-medium text-brand-600 hover:underline">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => close(false)} className="btn btn-secondary btn-sm">
            Nur notwendige
          </button>
          <button type="button" onClick={() => close(true)} className="btn btn-primary btn-sm">
            Alle akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
