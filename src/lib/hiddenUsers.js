import dbConnect from "@/lib/mongodb";
import User from "@/app/models/User";

/**
 * Test accounts that should never appear in team views (Zeiterfassung,
 * dashboard, visitor log, "bearbeitet von" …). They can still log in and use
 * everything – they are just invisible to everyone else.
 * More addresses can be added with HIDDEN_ACCOUNTS=a@x.de,b@y.de
 */
export const HIDDEN_EMAILS = [
  ...new Set(
    ["test@gmail.com", ...String(process.env.HIDDEN_ACCOUNTS || "").split(",")]
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  ),
];

export const isHiddenEmail = (email) => HIDDEN_EMAILS.includes(String(email || "").trim().toLowerCase());

let cache = { at: 0, ids: [] };

/** Mongo ids of the hidden accounts (cached for 5 minutes). */
export async function getHiddenUserIds() {
  if (Date.now() - cache.at < 5 * 60 * 1000) return cache.ids;
  await dbConnect();
  const docs = await User.find({ email: { $in: HIDDEN_EMAILS } }).select("_id").lean();
  cache = { at: Date.now(), ids: docs.map((d) => d._id) };
  return cache.ids;
}
