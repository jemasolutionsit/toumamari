import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.local" });
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware para procesar JSON (esencial para los webhooks y APIs)
  app.use(express.json());

  // ============================================================================
  // API ROUTES (BACKEND)
  // Aquí mantendremos las llamadas a Supabase Admin y PayPal seguras.
  // ============================================================================
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Toumamari Backend API funcionando" });
  });

  // 1. Endpoint para crear la orden de PayPal desde el lado del servidor
  app.post("/api/payments/create-order", async (req, res) => {
    try {
      // TODO: Usar el SDK de PayPal aquí con PAYPAL_CLIENT_SECRET
      // 1. Recibir los items del carrito desde req.body
      // 2. Comunicarse con la API de PayPal para generar el Order ID
      // 3. Crear el registro en Supabase (Booking y Payment en estado 'pending')
      res.json({ success: true, message: "Placeholder para Create Order" });
    } catch (error) {
      res.status(500).json({ error: "Error creando orden de PayPal" });
    }
  });

  // 3. Booking confirmation email
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
            <h1 style="margin:8px 0 0;font-size:28px;color:#ffffff;letter-spacing:2px;">TOUMAMARI</h1>
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
                <td style="padding:8px 0;color:#888888;font-size:14px;">${isEs ? "Total USD" : "Total USD"}</td>
                <td style="padding:8px 0;color:#0a0a0a;font-size:14px;font-weight:bold;">$${total_usd} USD</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#888888;font-size:14px;">${isEs ? "Total CLP" : "Total CLP"}</td>
                <td style="padding:8px 0;color:#0a0a0a;font-size:14px;">$${total_clp.toLocaleString("es-CL")} CLP</td>
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
            <a href="https://wa.me/56912345678"
               style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:bold;letter-spacing:1px;">
              ${isEs ? "Contactar por WhatsApp" : "Contact via WhatsApp"}
            </a>
          </td>
        </tr>
        <!-- Footer -->
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

  // 2. Webhook seguro de PayPal (Notificaciones asíncronas de pago)
  app.post("/api/payments/webhook", async (req, res) => {
    // TODO: 
    // 1. Validar la firma enviada por PayPal usando PAYPAL_WEBHOOK_ID
    // 2. Extraer el estado (ej. PAYMENT.CAPTURE.COMPLETED)
    // 3. Actualizar la tabla de 'Payments' y 'Bookings' en Supabase a 'confirmed'
    res.status(200).send("Webhook recibido");
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
