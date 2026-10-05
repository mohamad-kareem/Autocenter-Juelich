"use client";

import { useEffect, useState } from "react";
import { getOpeningStatus } from "@/lib/site";

const cx = (...c) => c.filter(Boolean).join(" ");

/** Live "open / closed" badge (Europe/Berlin), rendered client-side so it stays correct. */
export default function OpeningStatus({ className = "" }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const update = () => setStatus(getOpeningStatus());
    const first = setTimeout(update, 0);
    const t = setInterval(update, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  if (!status) return null;

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        status.open ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300",
        className,
      )}
    >
      <span className={cx("h-1.5 w-1.5 rounded-full", status.open ? "bg-emerald-400" : "bg-rose-400")} />
      {status.open ? "Jetzt geöffnet" : "Geschlossen"}
    </span>
  );
}
