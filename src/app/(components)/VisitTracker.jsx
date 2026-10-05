"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Reports each page view to /api/track (no cookies, fire-and-forget). */
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/systemlog")) return;
    const payload = JSON.stringify({ path: pathname, ref: document.referrer || "" });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/track", { method: "POST", body: payload, keepalive: true, headers: { "Content-Type": "application/json" } });
      }
    } catch {
      /* never break the page for tracking */
    }
  }, [pathname]);

  return null;
}
