import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sbInsert, notifyOwner, esc } from "./_lib/store";

// Guarda el mensaje del formulario de contacto y avisa al negocio por correo.
// RLS bloquea los INSERT con la clave pública, por eso pasa por el backend.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const b = req.body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim().slice(0, 120) : "";
  const email = typeof b.email === "string" ? b.email.trim().slice(0, 200) : "";
  const subject = typeof b.subject === "string" && b.subject.trim() ? b.subject.trim().slice(0, 200) : null;
  const message = typeof b.message === "string" ? b.message.trim().slice(0, 4000) : "";

  if (!name || !email.includes("@") || !message) {
    return res.status(400).json({ error: "Missing or invalid contact fields" });
  }

  try {
    await sbInsert("contact_messages", { name, email, subject, message });

    // Aviso al negocio (best-effort): sin esto el mensaje solo queda en la BD
    await notifyOwner(
      `Nuevo mensaje de contacto — ${esc(name)}`,
      `<h2>Nuevo mensaje desde touamamari.vercel.app</h2>
       <p><b>Nombre:</b> ${esc(name)}<br/>
       <b>Email:</b> ${esc(email)}<br/>
       <b>Asunto:</b> ${esc(subject ?? "(sin asunto)")}</p>
       <p style="white-space:pre-wrap;border-left:3px solid #FFD700;padding-left:12px;">${esc(message)}</p>
       <p>Responde directamente al correo del visitante.</p>`,
    );

    return res.json({ success: true });
  } catch (err) {
    const message2 = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message2 });
  }
}
