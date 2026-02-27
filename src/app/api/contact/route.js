import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();

    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const phone = String(body?.phone || "").trim();
    const subject = String(body?.subject || "").trim() || "Kontaktformular";
    const message = String(body?.message || "").trim();
    const agreement = Boolean(body?.agreement);

    if (!agreement) {
      return Response.json(
        { error: "Datenschutz muss bestätigt werden." },
        { status: 400 },
      );
    }
    if (!name || !email || !message) {
      return Response.json(
        { error: "Name, E-Mail und Nachricht sind Pflicht." },
        { status: 400 },
      );
    }

    // ✅ SMTP transporter (use your email provider SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true", // true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const to = "info@autocenter-juelich.de";
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Neue Kontaktanfrage</h2>
        <p><b>Name:</b> ${escapeHtml(name)}</p>
        <p><b>E-Mail:</b> ${escapeHtml(email)}</p>
        ${phone ? `<p><b>Telefon:</b> ${escapeHtml(phone)}</p>` : ""}
        <p><b>Betreff:</b> ${escapeHtml(subject)}</p>
        <hr />
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      </div>
    `;

    await transporter.sendMail({
      from,
      to,
      replyTo: email, // ✅ reply goes to the customer email
      subject: `Kontaktformular: ${subject}`,
      html,
      text: [
        `Neue Kontaktanfrage`,
        `Name: ${name}`,
        `E-Mail: ${email}`,
        phone ? `Telefon: ${phone}` : "",
        `Betreff: ${subject}`,
        "",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json(
      { error: "Serverfehler beim Senden. Bitte später erneut versuchen." },
      { status: 500 },
    );
  }
}

// tiny helper to prevent html injection
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
