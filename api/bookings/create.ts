import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sbInsert, notifyOwner, esc } from "../_lib/store";

// Crea la reserva desde el backend: RLS bloquea los INSERT con la clave
// pública, así que el navegador ya no escribe directo en Supabase.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const b = req.body as Record<string, unknown>;
  const guest_name = typeof b.guest_name === "string" ? b.guest_name.trim().slice(0, 120) : "";
  const guest_email = typeof b.guest_email === "string" ? b.guest_email.trim().slice(0, 200) : "";
  const tour_id = typeof b.tour_id === "string" ? b.tour_id : "";
  const travel_date = typeof b.travel_date === "string" ? b.travel_date.slice(0, 10) : "";
  const travelers = Math.min(50, Math.max(1, Number(b.travelers) || 0));
  const notes = typeof b.notes === "string" ? b.notes.slice(0, 300) : null;

  if (!guest_name || !guest_email.includes("@") || !tour_id || !/^\d{4}-\d{2}-\d{2}$/.test(travel_date) || !Number(b.travelers)) {
    return res.status(400).json({ error: "Missing or invalid booking fields" });
  }

  try {
    const created = await sbInsert("bookings", {
      profile_id: null,
      guest_name,
      guest_email,
      tour_id,
      travel_date,
      travelers,
      // Registro interno: el sitio no muestra precios, se cotiza por WhatsApp
      total_clp: Number(b.total_clp) || 0,
      total_usd: Number(b.total_usd) || 0,
      status: "pending",
      payment_method: null,
      payment_id: null,
      notes,
    });

    // Aviso interno al negocio (best-effort, no bloquea la reserva)
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

    return res.json(created);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
