"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ac_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) return;

    let showTimer;

    const openTimer = setTimeout(() => {
      setVisible(true);

      showTimer = setTimeout(() => {
        setShow(true);
      }, 30);
    }, 50);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(showTimer);
    };
  }, []);

  function closeBanner(payload) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...payload,
        date: new Date().toISOString(),
      }),
    );

    setShow(false);

    setTimeout(() => {
      setVisible(false);
    }, 260);
  }

  function handleAccept() {
    closeBanner({ accepted: true });
  }

  function handleNecessaryOnly() {
    closeBanner({ accepted: false });
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999]">
      <div
        className={[
          "w-full border-t border-white/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(180,210,255,0.12))] shadow-[0_-10px_35px_rgba(0,0,0,0.18)] backdrop-blur-2xl",
          "transition-all duration-300 ease-out",
          show ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        ].join(" ")}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-white sm:text-base">
              Cookie-Einstellungen
            </h3>

            <p className="mt-1.5 max-w-3xl text-xs leading-5 text-white/85 sm:text-sm">
              Wir verwenden Cookies, damit unsere Website zuverlässig
              funktioniert und Sie die bestmögliche Erfahrung erhalten.
            </p>

            <p className="mt-1 text-[11px] leading-5 text-white/70 sm:text-xs">
              Mehr dazu in unserer{" "}
              <a
                href="/Datenschutz"
                className="text-[var(--ac-blue-light)] hover:underline"
              >
                Datenschutzerklärung
              </a>
              .
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleNecessaryOnly}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/16 sm:text-sm"
            >
              Nur notwendige
            </button>

            <button
              type="button"
              onClick={handleAccept}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 sm:text-sm"
              style={{ background: "var(--ac-gradient-primary)" }}
            >
              Akzeptieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
