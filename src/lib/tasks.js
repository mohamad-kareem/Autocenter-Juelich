import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
export const CATEGORIES = ["allgemein", "fahrzeug", "kunde", "werkstatt", "termin"];
export const readCategory = (v) => (CATEGORIES.includes(v) ? v : "allgemein");

/** Any logged-in staff member may use the task board. */
export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return token ? await verifyToken(token) : null;
}

export function serializeTask(doc) {
  if (!doc) return null;
  return {
    _id: String(doc._id),
    title: doc.title || "",
    day: doc.day || "",
    status: doc.status || "open",
    category: doc.category || "allgemein",
    assignee: doc.assignee || "",
    sort: Number(doc.sort || 0),
    createdBy: doc.createdBy || "",
  };
}
