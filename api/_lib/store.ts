// Acceso a Supabase con la service role key. Los INSERT públicos están
// bloqueados por RLS, así que el navegador llama a los endpoints /api/* y es
// el backend quien escribe con privilegios (la clave nunca llega al cliente).

export async function sbInsert<T = unknown>(table: string, row: unknown): Promise<T> {
  // Se leen dentro de la función: en dev, dotenv corre después de los imports
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Supabase server credentials not configured");
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Supabase insert into ${table} failed: HTTP ${res.status}`);
  }
  return (Array.isArray(body) ? body[0] : body) as T;
}

/** Casilla del negocio. Mientras Resend esté en sandbox (sin dominio
 *  verificado) es la ÚNICA dirección que puede recibir correos. */
export const OWNER_EMAIL = process.env.NOTIFY_EMAIL || "jemasolutionsit@gmail.com";

/** Remitente permitido en sandbox; cambiar a noreply@touamamari.com
 *  cuando el dominio esté comprado y verificado en Resend. */
export const FROM_EMAIL = "Touamamari Web <onboarding@resend.dev>";

/** Notificación interna al negocio. Best-effort: nunca lanza. */
export async function notifyOwner(subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_EMAIL, to: OWNER_EMAIL, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Escapa contenido del usuario antes de meterlo en HTML de correos. */
export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
