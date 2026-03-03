import nodemailer from "nodemailer";

const ALLOWED_SUBJECTS = new Set([
  "Allgemeine Anfrage",
  "Probefahrt vereinbaren",
  "Finanzierung anfragen",
  "Inzahlungnahme anfragen",
  "Service-Termin vereinbaren",
]);

// ✅ Where the contact emails should go
const CONTACT_TO = "info@autocenter-juelich.de";
const CONTACT_CC = [
  "j.alawie@autocenter-juelich.de",
  "h.alawie@autocenter-juelich.de",
];

export async function POST(req) {
  try {
    const body = await req.json();

    // ---- sanitize inputs
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const phone = String(body?.phone || "").trim();
    const subjectRaw = String(body?.subject || "").trim();
    const message = String(body?.message || "").trim();
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

    // ---- SMTP env (UDAG / United Domains)
    const SMTP_HOST = process.env.SMTP_HOST || "smtps.udag.de";
    const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
    const SMTP_SECURE_ENV =
      String(process.env.SMTP_SECURE || "false") === "true";
    const SMTP_USER = String(process.env.SMTP_USER || "").trim(); // info@autocenter-juelich.de
    const SMTP_PASS = String(process.env.SMTP_PASS || "").trim(); // mailbox password
    const SMTP_FROM =
      process.env.SMTP_FROM || `AutoCenter Jülich <${SMTP_USER}>`;

    if (!SMTP_USER || !SMTP_PASS) {
      return Response.json(
        { error: "SMTP env vars fehlen (SMTP_USER / SMTP_PASS)." },
        { status: 500 },
      );
    }

    // ✅ Correct secure mode for common ports
    const secure =
      SMTP_PORT === 465 ? true : SMTP_PORT === 587 ? false : SMTP_SECURE_ENV;

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      // helps with many providers using STARTTLS/Certificates
      tls: {
        rejectUnauthorized: false,
      },
    });

    // ---- build email
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.55;color:#0b1220">
        <h2 style="margin:0 0 10px 0">Neue Kontaktanfrage</h2>
        <div style="background:#f6f7fb;border:1px solid #e5e7ef;border-radius:12px;padding:14px 16px">
          <p style="margin:6px 0"><b>Name:</b> ${safeName}</p>
          <p style="margin:6px 0"><b>E-Mail:</b> ${safeEmail}</p>
          ${phone ? `<p style="margin:6px 0"><b>Telefon:</b> ${safePhone}</p>` : ""}
          <p style="margin:6px 0"><b>Betreff:</b> ${safeSubject}</p>
        </div>
        <div style="margin-top:14px">
          <p style="margin:0 0 8px 0"><b>Nachricht:</b></p>
          <div style="white-space:pre-wrap;background:#ffffff;border:1px solid #e5e7ef;border-radius:12px;padding:14px 16px">
            ${safeMessage}
          </div>
        </div>
      </div>
    `;

    const text = [
      "Neue Kontaktanfrage",
      `Name: ${name}`,
      `E-Mail: ${email}`,
      phone ? `Telefon: ${phone}` : "",
      `Betreff: ${subject}`,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    // ---- send (to 3 emails)
    await transporter.sendMail({
      from: SMTP_FROM,
      to: CONTACT_TO,
      cc: CONTACT_CC,
      replyTo: email,
      subject: `Kontaktformular: ${subject}`,
      html,
      text,
    });

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json(
      { error: "Serverfehler beim Senden. Bitte später erneut versuchen." },
      { status: 500 },
    );
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
