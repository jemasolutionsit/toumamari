import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { traveler_name, traveler_email, tour_title, tour_date, travelers, total_usd, total_clp, language } = req.body as {
    traveler_name: string;
    traveler_email: string;
    tour_title: string;
    tour_date: string;
    travelers: number;
    total_usd: number;
    total_clp: number;
    language?: "es" | "en";
  };

  if (!traveler_name || !traveler_email || !tour_title || !tour_date || !travelers || total_usd === undefined || total_clp === undefined) {
    return res.status(400).json({ error: "Missing required booking fields" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Email service not configured" });
  }

  const resend = new Resend(apiKey);
  const lang = language ?? "es";
  const isEs = lang === "es";

  const subject = isEs
    ? `Confirmación de reserva — ${tour_title}`
    : `Booking confirmation — ${tour_title}`;

  const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:#0a0a0a;padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;letter-spacing:4px;color:#c9a94d;text-transform:uppercase;">
              ${isEs ? "Isla de Pascua · Rapa Nui" : "Easter Island · Rapa Nui"}
            </p>
            <h1 style="margin:8px 0 0;font-size:28px;color:#ffffff;letter-spacing:2px;">TOUMAMARI</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 24px;border-bottom:1px solid #eeeeee;">
            <h2 style="margin:0 0 12px;font-size:20px;color:#0a0a0a;">
              ${isEs ? `¡Hola, ${traveler_name}!` : `Hello, ${traveler_name}!`}
            </h2>
            <p style="margin:0;color:#555555;line-height:1.6;font-size:15px;">
              ${isEs
                ? "Tu reserva ha sido recibida con éxito. Aquí tienes el resumen de tu experiencia en Rapa Nui."
                : "Your booking has been received successfully. Here is a summary of your Rapa Nui experience."}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;border-bottom:1px solid #eeeeee;">
            <h3 style="margin:0 0 20px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#c9a94d;">
              ${isEs ? "Detalle de Reserva" : "Booking Details"}
            </h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;color:#888888;font-size:14px;width:40%;">${isEs ? "Tour" : "Tour"}</td>
                <td style="padding:8px 0;color:#0a0a0a;font-size:14px;font-weight:bold;">${tour_title}</td>
              </tr>
              <tr style="background:#fafafa;">
                <td style="padding:8px 0;color:#888888;font-size:14px;">${isEs ? "Fecha" : "Date"}</td>
                <td style="padding:8px 0;color:#0a0a0a;font-size:14px;">${tour_date}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#888888;font-size:14px;">${isEs ? "Viajeros" : "Travelers"}</td>
                <td style="padding:8px 0;color:#0a0a0a;font-size:14px;">${travelers}</td>
              </tr>
              <tr style="background:#fafafa;">
                <td style="padding:8px 0;color:#888888;font-size:14px;">Total USD</td>
                <td style="padding:8px 0;color:#0a0a0a;font-size:14px;font-weight:bold;">$${total_usd} USD</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#888888;font-size:14px;">Total CLP</td>
                <td style="padding:8px 0;color:#0a0a0a;font-size:14px;">$${total_clp.toLocaleString("es-CL")} CLP</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;border-bottom:1px solid #eeeeee;">
            <h3 style="margin:0 0 12px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#c9a94d;">
              ${isEs ? "¿Qué sigue?" : "What's Next?"}
            </h3>
            <p style="margin:0 0 16px;color:#555555;line-height:1.7;font-size:14px;">
              ${isEs
                ? "Nuestro guía se pondrá en contacto contigo por WhatsApp para confirmar los detalles del punto de encuentro y la hora de inicio."
                : "Our guide will contact you via WhatsApp to confirm the meeting point details and start time."}
            </p>
            <a href="https://wa.me/56912345678"
               style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:bold;letter-spacing:1px;">
              ${isEs ? "Contactar por WhatsApp" : "Contact via WhatsApp"}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 40px;background:#fafafa;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#aaaaaa;">Toumamari SpA</p>
            <p style="margin:0;font-size:12px;color:#aaaaaa;">Hanga Roa, Isla de Pascua (Rapa Nui), Chile</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const { error } = await resend.emails.send({
      from: "Toumamari <noreply@toumamari.com>",
      to: traveler_email,
      subject,
      html,
    });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
