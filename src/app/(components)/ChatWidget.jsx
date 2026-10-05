"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronRight, Lock, MessagesSquare, RotateCcw, SendHorizontal, X } from "lucide-react";
import AiMark from "./AiMark";
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
  const [closing, setClosing] = useState(false);
  const [view, setView] = useState("hub"); // "hub" = start screen, "chat" = assistant
  const closeTimer = useRef(null);

  /** play the shrink-into-the-corner animation, then unmount */
  const closeChat = useCallback(() => {
    setClosing(true);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 300);
  }, []);

  function toggleChat() {
    if (open) closeChat();
    else {
      clearTimeout(closeTimer.current);
      setClosing(false);
      setView("hub");
      setOpen(true);
    }
  }
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
    const t = setTimeout(() => {
      if (view === "chat") inputRef.current?.focus();
    }, 350);
    const onKey = (e) => e.key === "Escape" && closeChat();
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, view, closeChat]);

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

  const hasConversation = messages.length > 1;

  return (
    <>
      {/* Launcher */}
      <div
        className={cx(
          "fixed bottom-4 right-4 z-[65] flex items-end gap-3 transition duration-300 sm:bottom-6 sm:right-6",
          raised && "max-lg:bottom-16",
          consentPending && "max-sm:hidden",
          open && !closing && "pointer-events-none scale-75 opacity-0",
        )}
      >
        {teaser && !open ? (
          <button
            type="button"
            onClick={toggleChat}
            className="animate-pop-in mb-1 hidden max-w-60 rounded-2xl rounded-br-sm bg-white px-4 py-3 text-left text-sm text-ink shadow-float ring-1 ring-line sm:block"
          >
            <span className="font-semibold">Fragen zu einem Auto?</span>
            <span className="block text-muted">Unser Assistent antwortet sofort.</span>
          </button>
        ) : null}
        <button
          type="button"
          onClick={toggleChat}
          aria-label="Beratung öffnen"
          aria-expanded={open && !closing}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-navy-800 via-navy-900 to-brand-700 text-white shadow-[0_10px_30px_-8px_rgba(27,86,232,0.55)] ring-1 ring-white/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-8px_rgba(27,86,232,0.7)]"
        >
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-brand-500 opacity-20 [animation-duration:2.8s]" />
          <AiMark className="h-7 w-7" accent="#9be0fa" />
        </button>
      </div>

      {/* Panel – docked to the right edge, revealed out of the corner button */}
      {open ? (
        <>
          <div
            aria-hidden
            onClick={closeChat}
            className={cx("fixed inset-x-0 bottom-0 top-16 z-[69] bg-navy-950/20 max-sm:hidden lg:top-[72px]", closing ? "chat-fade-out" : "chat-fade-in")}
          />
          <section
            role="dialog"
            aria-label="Beratung – Autocenter Jülich"
            className={cx(
              "fixed inset-0 z-[80] flex flex-col overflow-hidden bg-white shadow-[-24px_0_60px_-20px_rgba(6,15,29,0.35)] sm:left-auto sm:top-auto sm:w-[380px] sm:rounded-tl-[24px]",
              // reaches a bit above the middle of the screen (never smaller than 610px)
              "sm:h-[max(75vh,610px)] sm:max-h-[calc(100vh-6rem)]",
              closing ? "chat-panel-out" : "chat-panel-in",
            )}
          >
            {view === "hub" ? (
              <>
                {/* Start screen */}
                <div className="scroll-slim relative flex-1 overflow-y-auto">
                  <div className="relative overflow-hidden px-6 pb-5 pt-5">
                    {/* soft brand glow in the corner */}
                    <span className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
                    <div className="relative flex justify-end">
                      <button
                        type="button"
                        onClick={closeChat}
                        aria-label="Schließen"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-body transition hover:border-ink hover:text-ink"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <h2 className="font-display relative -mt-3 text-[32px] leading-[1.08] text-ink">
                      Was dürfen wir
                      <br />
                      für Sie tun?
                    </h2>
                    <p className="relative mt-2 max-w-xs text-[13px] leading-relaxed text-muted">
                      Lassen Sie sich sofort online beraten oder schreiben Sie unserem Team in Jülich.
                    </p>
                  </div>

                  <div className="space-y-2.5 px-5 pb-5">
                    {/* Online-Beratung */}
                    <button
                      type="button"
                      onClick={() => setView("chat")}
                      className="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-br from-navy-900 via-navy-800 to-brand-700 px-3.5 py-3 text-left text-white shadow-[0_14px_30px_-14px_rgba(11,27,51,0.7)] transition hover:-translate-y-0.5"
                    >
                      <span className="pointer-events-none absolute -bottom-10 -right-6 h-28 w-28 rounded-full bg-accent-400/20 blur-2xl" />
                      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                        <AiMark className="h-6 w-6" accent="#9be0fa" />
                      </span>
                      <span className="relative min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-[14.5px] font-semibold">Online-Beratung</span>
                          <span className="rounded-full bg-accent-400/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-300">
                            KI
                          </span>
                        </span>
                        <span className="block text-[12px] text-white/65">
                          {hasConversation ? "Gespräch fortsetzen" : "Sofort Antworten – rund um die Uhr"}
                        </span>
                      </span>
                      <ChevronRight className="relative h-5 w-5 text-white/60 transition group-hover:translate-x-0.5 group-hover:text-white" />
                    </button>

                    {/* Kontakt */}
                    <Link
                      href="/kontakt"
                      onClick={closeChat}
                      className="group flex w-full items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-3 transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-ink">
                        <MessagesSquare className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14.5px] font-semibold text-ink">Kontakt</span>
                        <span className="block text-[12px] text-muted">Nachricht an unser Team senden</span>
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
                    </Link>
                  </div>
                </div>

                <p className="flex items-center gap-2 border-t border-line bg-canvas/60 px-6 py-3 text-[11px] text-muted">
                  <Lock className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  Ihre Angaben werden vertraulich behandelt.
                </p>
              </>
            ) : (
              <>
                {/* Chat header */}
                <header className="flex items-center gap-2.5 bg-navy-900 px-3 py-3 text-white sm:pl-4">
                  <button
                    type="button"
                    onClick={() => setView("hub")}
                    aria-label="Zurück"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    <ArrowLeft className="h-[18px] w-[18px]" />
                  </button>
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 ring-1 ring-white/15">
                    <AiMark className="h-[19px] w-[19px]" accent="#9be0fa" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-navy-900 bg-emerald-400" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">Online-Beratung</p>
                    <p className="text-[11px] text-white/60">KI-Assistent · antwortet sofort</p>
                  </div>
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
                    onClick={closeChat}
                    aria-label="Schließen"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </header>

            {/* Messages */}
            <div ref={listRef} className="scroll-slim flex-1 space-y-3 overflow-y-auto bg-canvas px-3 py-3" aria-live="polite">
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
                        <AiMark className="h-4 w-4" twinkle={false} accent="#9be0fa" />
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
                    <AiMark className="h-4 w-4" accent="#9be0fa" />
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
              </>
            )}
          </section>
        </>
      ) : null}
    </>
  );
}
