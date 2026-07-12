import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.local" });
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import { sbInsert, notifyOwner, esc, FROM_EMAIL } from "./api/_lib/store";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware para procesar JSON (esencial para los webhooks y APIs)
  app.use(express.json());

  // ============================================================================
  // API ROUTES (BACKEND)
  // Aquí mantenemos las llamadas a Supabase Admin seguras.
  // El cierre de venta se coordina por WhatsApp; no hay pasarela de pago.
  // ============================================================================

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Touamamari Backend API funcionando" });
  });

  // Mensaje de contacto: RLS bloquea los INSERT públicos, escribe el backend
  // (mismo comportamiento que api/contact.ts en Vercel)
  app.post("/api/contact", async (req, res) => {
    const b = req.body as Record<string, unknown>;
    const name = typeof b.name === "string" ? b.name.trim().slice(0, 120) : "";
    const email = typeof b.email === "string" ? b.email.trim().slice(0, 200) : "";
    const subject = typeof b.subject === "string" && b.subject.trim() ? b.subject.trim().slice(0, 200) : null;
    const message = typeof b.message === "string" ? b.message.trim().slice(0, 4000) : "";

    if (!name || !email.includes("@") || !message) {
      res.status(400).json({ error: "Missing or invalid contact fields" });
      return;
    }

    try {
      await sbInsert("contact_messages", { name, email, subject, message });

      await notifyOwner(
        `Nuevo mensaje de contacto — ${esc(name)}`,
        `<h2>Nuevo mensaje desde touamamari.vercel.app</h2>
         <p><b>Nombre:</b> ${esc(name)}<br/>
         <b>Email:</b> ${esc(email)}<br/>
         <b>Asunto:</b> ${esc(subject ?? "(sin asunto)")}</p>
         <p style="white-space:pre-wrap;border-left:3px solid #FFD700;padding-left:12px;">${esc(message)}</p>
         <p>Responde directamente al correo del visitante.</p>`,
      );

      res.json({ success: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: msg });
    }
  });

  // Crear reserva (mismo comportamiento que api/bookings/create.ts en Vercel)
  app.post("/api/bookings/create", async (req, res) => {
    const b = req.body as Record<string, unknown>;
    const guest_name = typeof b.guest_name === "string" ? b.guest_name.trim().slice(0, 120) : "";
    const guest_email = typeof b.guest_email === "string" ? b.guest_email.trim().slice(0, 200) : "";
    const tour_id = typeof b.tour_id === "string" ? b.tour_id : "";
    const travel_date = typeof b.travel_date === "string" ? b.travel_date.slice(0, 10) : "";
    const travelers = Math.min(50, Math.max(1, Number(b.travelers) || 0));
    const notes = typeof b.notes === "string" ? b.notes.slice(0, 300) : null;

    if (!guest_name || !guest_email.includes("@") || !tour_id || !/^\d{4}-\d{2}-\d{2}$/.test(travel_date) || !Number(b.travelers)) {
      res.status(400).json({ error: "Missing or invalid booking fields" });
      return;
    }

    try {
      const created = await sbInsert("bookings", {
        profile_id: null,
        guest_name,
        guest_email,
        tour_id,
        travel_date,
        travelers,
        total_clp: Number(b.total_clp) || 0,
        total_usd: Number(b.total_usd) || 0,
        status: "pending",
        payment_method: null,
        payment_id: null,
        notes,
      });

      await notifyOwner(
        `Nueva reserva web — ${esc(guest_name)} (${travel_date})`,
        `<h2>Nueva reserva desde touamamari.vercel.app</h2>
         <p><b>Nombre:</b> ${esc(guest_name)}<br/>
         <b>Email:</b> ${esc(guest_email)}<br/>
         <b>Tour ID:</b> ${esc(tour_id)}<br/>
         <b>Fecha:</b> ${esc(travel_date)}<br/>
         <b>Viajeros:</b> ${travelers}<br/>
         <b>Notas:</b> ${esc(notes ?? "-")}</p>
         <p>El valor se cotiza por WhatsApp según el número de personas.</p>`,
      );

      res.json(created);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: msg });
    }
  });

  // Booking confirmation email
  app.post("/api/bookings/confirm", async (req, res) => {
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
      res.status(400).json({ error: "Missing required booking fields" });
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Email service not configured" });
      return;
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
        <!-- Header -->
        <tr>
          <td style="background:#0a0a0a;padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;letter-spacing:4px;color:#c9a94d;text-transform:uppercase;">
              ${isEs ? "Isla de Pascua · Rapa Nui" : "Easter Island · Rapa Nui"}
            </p>
            <h1 style="margin:8px 0 0;font-size:28px;color:#ffffff;letter-spacing:2px;">TOUAMAMARI</h1>
          </td>
        </tr>
        <!-- Greeting -->
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
        <!-- Booking Summary -->
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
                <td style="padding:8px 0;color:#888888;font-size:14px;">${isEs ? "Valor" : "Price"}</td>
                <td style="padding:8px 0;color:#0a0a0a;font-size:14px;font-weight:bold;">${isEs ? "Se cotiza por WhatsApp según el número de personas" : "Quoted via WhatsApp based on group size"}</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- What's included -->
        <tr>
          <td style="padding:32px 40px;border-bottom:1px solid #eeeeee;">
            <h3 style="margin:0 0 12px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#c9a94d;">
              ${isEs ? "¿Qué incluye?" : "What's Included?"}
            </h3>
            <p style="margin:0;color:#555555;line-height:1.7;font-size:14px;">
              ${isEs
                ? "Transporte en vehículo privado con aire acondicionado, guía local certificado bilingüe (español/inglés), entrada a los sitios arqueológicos según el itinerario y agua mineral durante el recorrido."
                : "Transportation in a private air-conditioned vehicle, certified bilingual local guide (Spanish/English), admission to archaeological sites on the itinerary, and mineral water throughout the tour."}
            </p>
          </td>
        </tr>
        <!-- What's next -->
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
            <a href="https://wa.me/56957609175"
               style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:bold;letter-spacing:1px;">
              ${isEs ? "Contactar por WhatsApp" : "Contact via WhatsApp"}
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:28px 40px;background:#fafafa;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#aaaaaa;">Touamamari SpA</p>
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
        // Sandbox de Resend: solo puede enviar desde onboarding@resend.dev
        // hasta que touamamari.com esté comprado y verificado
        from: FROM_EMAIL,
        to: traveler_email,
        subject,
        html,
      });

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  });

  // ============================================================================
  // VITE MIDDLEWARE (FRONTEND SERVING)
  // ============================================================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA Fallback para React Router
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
