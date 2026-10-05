export const runtime = "nodejs";
import nodemailer from "nodemailer";
import dbConnect from "@/lib/mongodb";
import ContactMessage from "@/app/models/ContactMessage";
import { SITE } from "@/lib/site";

const ALLOWED_SUBJECTS = new Set([
  "Allgemeine Anfrage",
  "Probefahrt vereinbaren",
  "Finanzierung anfragen",
  "Inzahlungnahme anfragen",
  "Service-Termin vereinbaren",
]);

// ✅ Receivers
const CONTACT_TO = "info@autocenter-juelich.de";
const CONTACT_CC = ["mohamadkareemeng@gmail.com"];

/** Very light spam guard: honeypot field + minimum message length. */
function looksLikeSpam(body, message) {
  if (String(body?.website || "").trim()) return true; // honeypot
  if (message.length < 10) return true;
  return false;
}

export async function POST(req) {
  let saved = null;

  try {
    const body = await req.json();

    // ---- sanitize inputs
    const name = String(body?.name || "")
      .trim()
      .slice(0, 120);
    const email = String(body?.email || "")
      .trim()
      .slice(0, 160);
    const phone = String(body?.phone || "")
      .trim()
      .slice(0, 60);
    const subjectRaw = String(body?.subject || "").trim();
    const message = String(body?.message || "")
      .trim()
      .slice(0, 5000);
    const vehicle = String(body?.vehicle || "")
      .trim()
      .slice(0, 200);
    const vehicleId = String(body?.vehicleId || "")
      .replace(/[^A-Za-z0-9_-]/g, "")
      .slice(0, 40);
    const vehicleUrl = vehicleId ? `${SITE.url}/fahrzeuge/${vehicleId}` : "";
    const agreement = Boolean(body?.agreement);

    // ---- validation
    if (!agreement) {
      return Response.json(
        { error: "Datenschutz muss bestätigt werden." },
        { status: 400 },
      );
    }

    const subject = ALLOWED_SUBJECTS.has(subjectRaw) ? subjectRaw : "";
    if (!name || !email || !subject || !message) {
      return Response.json(
        { error: "Name, E-Mail, Betreff und Nachricht sind Pflicht." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return Response.json(
        { error: "Bitte eine gültige E-Mail-Adresse angeben." },
        { status: 400 },
      );
    }

    if (looksLikeSpam(body, message)) {
      // Pretend everything is fine – bots should not learn anything.
      return Response.json({ ok: true });
    }

    // ---- 1) store the request so it always shows up in the dashboard
    try {
      await dbConnect();
      saved = await ContactMessage.create({
        name,
        email,
        phone,
        subject,
        message,
        vehicle,
        vehicleId,
      });
    } catch (dbErr) {
      console.error("CONTACT_DB_ERROR:", dbErr?.message || dbErr);
    }

    // ---- 2) send the notification e-mail
    const SMTP_HOST = process.env.SMTP_HOST || "smtps.udag.de";
    const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
    const SMTP_USER = String(process.env.SMTP_USER || "").trim();
    const SMTP_PASS = String(process.env.SMTP_PASS || "").trim();
    const SMTP_FROM = (
      process.env.SMTP_FROM || `AutoCenter Jülich <${SMTP_USER}>`
    ).trim();

    if (!SMTP_USER || !SMTP_PASS) {
      const reason = "SMTP env vars fehlen (SMTP_USER / SMTP_PASS).";
      console.error("CONTACT_SMTP_CONFIG:", reason);
      await markEmail(saved, false, reason);

      // The message is stored, so the customer should not see an error.
      return saved
        ? Response.json({ ok: true, emailSent: false })
        : Response.json(
            {
              error: "Serverfehler beim Senden. Bitte später erneut versuchen.",
            },
            { status: 500 },
          );
    }

    // ✅ 465 = SSL/TLS, 587 = STARTTLS
    const secure = SMTP_PORT === 465;

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure,
      auth: { user: SMTP_USER, pass: SMTP_PASS },

      // ✅ helps with UDAG + Vercel TLS
      ...(secure
        ? {
            tls: {
              rejectUnauthorized: false,
              minVersion: "TLSv1.2",
              servername: SMTP_HOST,
            },
          }
        : {
            requireTLS: true,
            tls: {
              rejectUnauthorized: false,
              minVersion: "TLSv1.2",
              servername: SMTP_HOST,
            },
          }),

      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });

    // ---- build email (safe)
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.55;color:#0b1220">
        <h2 style="margin:0 0 10px 0">Neue Kontaktanfrage</h2>
        <div style="background:#f6f7fb;border:1px solid #e5e7ef;border-radius:12px;padding:14px 16px">
          <p style="margin:6px 0"><b>Name:</b> ${escapeHtml(name)}</p>
          <p style="margin:6px 0"><b>E-Mail:</b> ${escapeHtml(email)}</p>
          ${
            phone
              ? `<p style="margin:6px 0"><b>Telefon:</b> ${escapeHtml(phone)}</p>`
              : ""
          }
          <p style="margin:6px 0"><b>Betreff:</b> ${escapeHtml(subject)}</p>
          ${
            vehicle
              ? `<p style="margin:6px 0"><b>Fahrzeug:</b> ${escapeHtml(vehicle)}${
                  vehicleUrl
                    ? ` – <a href="${escapeHtml(vehicleUrl)}" style="color:#1b56e8">Fahrzeug ansehen</a>`
                    : ""
                }</p>`
              : ""
          }
        </div>
        <div style="margin-top:14px">
          <p style="margin:0 0 8px 0"><b>Nachricht:</b></p>
          <div style="white-space:pre-wrap;background:#ffffff;border:1px solid #e5e7ef;border-radius:12px;padding:14px 16px">
            ${escapeHtml(message)}
          </div>
        </div>
        <p style="margin-top:16px;font-size:12px;color:#64748b">
          Diese Anfrage finden Sie auch im Mitarbeiterbereich unter „Anfragen“.
        </p>
      </div>
    `;

    const text = [
      "Neue Kontaktanfrage",
      `Name: ${name}`,
      `E-Mail: ${email}`,
      phone ? `Telefon: ${phone}` : "",
      `Betreff: ${subject}`,
      vehicle ? `Fahrzeug: ${vehicle}` : "",
      vehicleUrl || "",
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    // ---- send (to 3 emails)
    try {
      await transporter.sendMail({
        from: SMTP_FROM,
        to: CONTACT_TO,
        cc: CONTACT_CC,
        replyTo: email, // so "Reply" goes to the customer
        subject: vehicle ? `${subject} – ${vehicle}` : subject,
        html,
        text,
      });
      await markEmail(saved, true, "");
    } catch (mailErr) {
      console.error("CONTACT_SMTP_ERROR:", mailErr);
      await markEmail(
        saved,
        false,
        String(mailErr?.message || mailErr).slice(0, 300),
      );

      if (!saved) {
        return Response.json(
          { error: "Serverfehler beim Senden. Bitte später erneut versuchen." },
          { status: 500 },
        );
      }
      // Stored in the dashboard – the customer gets a success message.
      return Response.json({ ok: true, emailSent: false });
    }

    return Response.json({ ok: true, emailSent: true });
  } catch (err) {
    console.error("CONTACT_ERROR:", err);
    return Response.json(
      { error: "Serverfehler beim Senden. Bitte später erneut versuchen." },
      { status: 500 },
    );
  }
}

async function markEmail(doc, sent, error) {
  if (!doc) return;
  try {
    doc.emailSent = sent;
    doc.emailError = error;
    await doc.save();
  } catch (err) {
    console.error("CONTACT_DB_UPDATE_ERROR:", err?.message || err);
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
