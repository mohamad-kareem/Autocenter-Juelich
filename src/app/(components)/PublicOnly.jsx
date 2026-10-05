"use client";

import { usePathname } from "next/navigation";

// Hides the public website chrome (navbar, footer, chat) inside the
// staff area, which has its own header.
export default function PublicOnly({ children }) {
  const pathname = usePathname() || "";
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/login") || pathname.startsWith("/systemlog")) {
    return null;
  }
  return children;
}
