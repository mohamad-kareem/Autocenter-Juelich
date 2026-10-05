"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, RotateCcw, SendHorizontal, Sparkles, X } from "lucide-react";
import { SITE } from "@/lib/site";
import { COOKIE_EVENT, COOKIE_STORAGE_KEY } from "./CookieBanner";

const STORAGE_KEY = "ac_chat_history_v1";
const cx = (...c) => c.filter(Boolean).join(" ");

const WELCOME = {
  role: "assistant",
  content:
    "Hallo! 👋 Ich bin der digitale Assistent von **Autocenter Jülich**. Ich helfe Ihnen, das passende Fahrzeug zu finden, und beantworte Fragen zu Finanzierung, Garantie und Öffnungszeiten.",
};

const SUGGESTIONS = [
  "Welche Automatik-Fahrzeuge haben Sie?",
  "Autos unter 10.000 €",
  "Wie funktioniert die Finanzierung?",
  "Öffnungszeiten & Anfahrt",
];

/* ---------- tiny, safe markdown renderer (bold, links, lists) ---------- */

function renderInline(text, keyPrefix) {
  const out = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      const href = m[2];
      const k = `${keyPrefix}-l${i++}`;
      if (href.startsWith("/")) {
        out.push(
          <Link key={k} href={href} className="font-semibold text-brand-600 underline decoration-brand-200 underline-offset-2 hover:decoration-brand-600">
            {m[1]}
          </Link>,
        );
      } else if (/^https:\/\//.test(href)) {
        out.push(
          <a key={k} href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 underline decoration-brand-200 underline-offset-2">
            {m[1]}
          </a>,
        );
      } else {
        out.push(m[1]);
      }
    } else if (m[3]) {
      out.push(
        <strong key={`${keyPrefix}-b${i++}`} className="font-semibold text-ink">
          {m[3]}
        </strong>,
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Markdown({ text }) {
  const lines = String(text || "").split("\n");
  const blocks = [];
  let list = null;

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/);
    if (bullet) {
      if (!list) {
        list = [];
        blocks.push({ type: "list", items: list });
      }
      list.push(bullet[1]);
      return;
    }
    list = null;
    if (line.trim()) blocks.push({ type: "p", text: line.replace(/^#+\s*/, "") });
  });

  return (
    <div className="space-y-2">
      {blocks.map((b, i) =>
        b.type === "list" ? (
          <ul key={i} className="space-y-1.5 pl-1">
            {b.items.map((it, j) => (
              <li key={j} className="flex gap-2">
                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                <span>{renderInline(it, `${i}-${j}`)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>{renderInline(b.text, String(i))}</p>
        ),
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [consentPending, setConsentPending] = useState(false);
  const [teaser, setTeaser] = useState(false);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  // restore history for this browser tab
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
      if (Array.isArray(saved) && saved.length) setMessages(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      /* ignore */
    }
  }, [messages]);

  // Avoid overlapping the cookie banner on small screens
  useEffect(() => {
    const check = () => {
      try {
        setConsentPending(!localStorage.getItem(COOKIE_STORAGE_KEY));
      } catch {
        setConsentPending(false);
      }
    };
    check();
    window.addEventListener(COOKIE_EVENT, check);
    return () => window.removeEventListener(COOKIE_EVENT, check);
  }, []);

  // small teaser bubble once per session
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("ac_chat_teaser") === "1";
    } catch {
      /* ignore */
    }
    if (seen) return;
    const t = setTimeout(() => setTeaser(true), 6000);
    const h = setTimeout(() => setTeaser(false), 16000);
    return () => {
      clearTimeout(t);
      clearTimeout(h);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setTeaser(false);
    try {
      sessionStorage.setItem("ac_chat_teaser", "1");
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  // Close the panel on mobile when a link inside the chat navigates
  useEffect(() => {
    if (window.matchMedia("(max-width: 639px)").matches) setOpen(false);
  }, [pathname]);

  async function send(text) {
    const content = String(text ?? input).trim();
    if (!content || loading) return;

    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== WELCOME).slice(-20) }),
      });
      const data = await res.json().catch(() => ({}));
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply || data.error || "Entschuldigung, das hat nicht geklappt. Bitte versuchen Sie es erneut.",
          error: !data.reply,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `Keine Verbindung. Bitte prüfen Sie Ihre Internetverbindung oder rufen Sie uns an: ${SITE.phoneDisplay}.`,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([WELCOME]);
    setInput("");
  }

  const showSuggestions = messages.length <= 1 && !loading;
  // car detail pages have a sticky action bar on mobile
  const raised = /^\/fahrzeuge\/[^/]+/.test(pathname || "");

  return (
    <>
      {/* Launcher */}
      <div
        className={cx(
          "fixed bottom-4 right-4 z-[65] flex items-end gap-3 sm:bottom-6 sm:right-6",
          raised && "max-lg:bottom-16",
          open && "max-sm:hidden",
          consentPending && "max-sm:hidden",
        )}
      >
        {teaser && !open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="animate-pop-in mb-1 hidden max-w-60 rounded-2xl rounded-br-sm bg-white px-4 py-3 text-left text-sm text-ink shadow-float ring-1 ring-line sm:block"
          >
            <span className="font-semibold">Fragen zu einem Auto?</span>
            <span className="block text-muted">Unser Assistent antwortet sofort.</span>
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Chat schließen" : "Chat öffnen"}
          aria-expanded={open}
          className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-float transition hover:scale-105 hover:bg-brand-700"
        >
          {!open ? (
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-brand-500 opacity-20 [animation-duration:2.5s]" />
          ) : null}
          {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        </button>
      </div>

      {/* Panel */}
      {open ? (
        <section
          role="dialog"
          aria-label="Chat mit Autocenter Jülich"
          className="animate-pop-in fixed inset-0 z-[80] flex flex-col overflow-hidden bg-white sm:inset-auto sm:bottom-20 sm:right-6 sm:h-[min(560px,calc(100vh-7rem))] sm:w-[360px] sm:rounded-lg sm:shadow-float sm:ring-1 sm:ring-line"
        >
          {/* Header */}
          <header className="flex items-center gap-2.5 bg-navy-900 px-3 py-2.5 text-white">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500">
              <Sparkles className="h-4 w-4" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-navy-900 bg-emerald-400" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Autocenter Assistent</p>
              <p className="text-[11px] text-white/60">KI-Assistent · antwortet sofort</p>
            </div>
            <a
              href={SITE.phoneHref}
              aria-label="Anrufen"
              title={`Anrufen: ${SITE.phoneDisplay}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <Phone className="h-[18px] w-[18px]" />
            </a>
            <button
              type="button"
              onClick={reset}
              aria-label="Neues Gespräch"
              title="Neues Gespräch"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Chat schließen"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {/* Messages */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-canvas px-3 py-3" aria-live="polite">
            {messages.map((m, i) => (
              <Fragment key={i}>
                {m.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-brand-600 px-3 py-2 text-[13px] leading-5 text-white">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <span className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <div
                      className={cx(
                        "max-w-[85%] rounded-2xl rounded-bl-sm px-3 py-2 text-[13px] leading-5 shadow-card",
                        m.error ? "bg-rose-50 text-rose-900 ring-1 ring-rose-200" : "bg-white text-body ring-1 ring-line",
                      )}
                    >
                      <Markdown text={m.content} />
                    </div>
                  </div>
                )}
              </Fragment>
            ))}

            {loading ? (
              <div className="flex items-end gap-2">
                <span className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3.5 ring-1 ring-line">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-2 w-2 animate-bounce rounded-full bg-muted/60"
                      style={{ animationDelay: `${d * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {showSuggestions ? (
              <div className="flex flex-wrap gap-2 pl-9">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-brand-200 bg-white px-2.5 py-1 text-xs font-medium text-brand-700 transition hover:border-brand-500 hover:bg-brand-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="border-t border-line bg-white p-2.5"
          >
            <div className="flex items-end gap-2 rounded-md border border-line-strong bg-white p-1 pl-2.5 focus-within:border-brand-500 focus-within:ring-3 focus-within:ring-brand-500/15">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 1000))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Ihre Frage …"
                aria-label="Nachricht"
                className="max-h-28 min-h-8 flex-1 resize-none bg-transparent py-1 text-sm text-ink outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Senden"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-600 text-white transition hover:bg-brand-700 disabled:bg-line-strong"
              >
                <SendHorizontal className="h-[18px] w-[18px]" />
              </button>
            </div>
            <p className="mt-2 px-1 text-[11px] leading-4 text-muted">
              KI-generierte Antworten ohne Gewähr. Bitte keine sensiblen Daten eingeben. Mehr in der{" "}
              <Link href="/Datenschutz#chat" className="underline hover:text-ink">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </form>
        </section>
      ) : null}
    </>
  );
}
