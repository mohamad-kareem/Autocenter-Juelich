import crypto from "node:crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const MONITOR_COOKIE = "mon";
const secret = new TextEncoder().encode(`${process.env.JWT_SECRET || ""}::monitor`);

const digest = (v) => crypto.createHash("sha256").update(String(v)).digest();

/**
 * Credentials: MONITOR_USER / MONITOR_PASS.
 * Locally (npm run dev) it falls back to test / test; in production the page
 * stays locked until both variables are set on the server.
 */
export function monitorCredentials() {
  const isDev = process.env.NODE_ENV !== "production";
  const user = process.env.MONITOR_USER || (isDev ? "test" : "");
  const password = process.env.MONITOR_PASS || (isDev ? "test" : "");
  return user && password ? { user, password } : null;
}

export function checkMonitorLogin(name, pass) {
  const creds = monitorCredentials();
  if (!creds) return false;
  const { user, password } = creds;
  const okUser = crypto.timingSafeEqual(digest(name), digest(user));
  const okPass = crypto.timingSafeEqual(digest(pass), digest(password));
  return okUser && okPass;
}

export async function signMonitorToken() {
  return new SignJWT({ scope: "monitor" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);
}

export async function isMonitorSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MONITOR_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.scope === "monitor";
  } catch {
    return false;
  }
}

export const BOT_RE = /bot|crawl|spider|slurp|preview|lighthouse|headless|monitor|curl|wget|python|facebookexternalhit|whatsapp/i;

export function describeAgent(ua = "") {
  const device = /iPad|Tablet/i.test(ua) ? "Tablet" : /Mobi|Android|iPhone/i.test(ua) ? "Mobil" : "Desktop";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /SamsungBrowser/.test(ua)
        ? "Samsung"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Firefox\//.test(ua)
            ? "Firefox"
            : /Safari\//.test(ua)
              ? "Safari"
              : "Andere";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /iPhone|iPad|iOS/.test(ua)
      ? "iOS"
      : /Mac OS X/.test(ua)
        ? "macOS"
        : /Android/.test(ua)
          ? "Android"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  return { device, browser, os };
}

/** Same person + same day = same short id. No cookie, no stored IP address. */
export function visitorId(ip, ua) {
  const day = new Date().toISOString().slice(0, 10);
  return crypto
    .createHash("sha256")
    .update(`${day}|${ip}|${ua}|${process.env.JWT_SECRET || ""}`)
    .digest("hex")
    .slice(0, 8);
}
