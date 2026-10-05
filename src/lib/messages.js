import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/** Returns the logged-in admin (or null) – used by the message API routes. */
export async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;
  return user?.role === "admin" ? user : null;
}

/** Returns any logged-in staff member (admin or Mitarbeiter), or null. */
export async function getStaffUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;
  return user?.userId ? user : null;
}

/** Mongo document -> plain JSON for the client. */
export function serializeMessage(doc) {
  if (!doc) return null;
  return {
    _id: String(doc._id),
    name: doc.name,
    email: doc.email,
    phone: doc.phone || "",
    subject: doc.subject,
    message: doc.message,
    vehicle: doc.vehicle || "",
    vehicleId: doc.vehicleId || "",
    status: doc.status,
    read: Boolean(doc.read),
    emailSent: Boolean(doc.emailSent),
    emailError: doc.emailError || "",
    handledBy: doc.handledBy || "",
    handledAt: doc.handledAt ? new Date(doc.handledAt).toISOString() : null,
    note: doc.note || "",
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export const STATUS_LABELS = {
  new: "Neu",
  in_progress: "In Bearbeitung",
  done: "Erledigt",
  archived: "Archiviert",
};
