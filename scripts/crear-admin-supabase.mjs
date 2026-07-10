/**
 * Crea (o actualiza la password de) el usuario admin en Supabase Auth.
 *
 * Uso:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/crear-admin-supabase.mjs correo@ejemplo.com "contraseña"
 *
 * No genera ni elige el email/password: los recibe como argumentos, para que
 * sea una acción explícita de quien la ejecuta, no una decisión del agente.
 */
const [, , email, password] = process.argv;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "https://fdhwvzspdyethtiqcwqv.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !password) {
  console.error('Uso: node scripts/crear-admin-supabase.mjs "email@ejemplo.com" "contraseña-segura"');
  process.exit(1);
}
if (!SERVICE_KEY) {
  console.error("Falta SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

const authAdmin = (path, init = {}) =>
  fetch(`${SUPABASE_URL}/auth/v1/admin${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

const list = await authAdmin(`/users?filter=${encodeURIComponent(email)}`);
const { users } = await list.json();
const existing = users?.find((u) => u.email === email);

if (existing) {
  const res = await authAdmin(`/users/${existing.id}`, {
    method: "PUT",
    body: JSON.stringify({ password, email_confirm: true }),
  });
  console.log(res.ok ? `Password actualizada para ${email}` : "Error actualizando");
  if (!res.ok) console.error(await res.text());
} else {
  const res = await authAdmin("/users", {
    method: "POST",
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("Error creando usuario:", data);
    process.exit(1);
  }
  console.log(`Usuario creado: ${data.id} (${email})`);
}

console.log(
  "\nSiguiente paso: reemplazar CAMBIAR-ESTE-EMAIL@ejemplo.com por " +
    email +
    " en supabase/migrations/002_rls_admin_real.sql y correrlo en el SQL Editor.",
);
