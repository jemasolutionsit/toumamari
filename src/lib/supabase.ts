import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error(
    'Supabase no está configurado: faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. ' +
      'Vite las inyecta en tiempo de build, así que hay que definirlas antes de compilar y redesplegar.',
  );
}

// createClient lanza "supabaseUrl is required" si falta config. Como este módulo se
// importa en la cadena de arranque (main -> App -> Home -> api -> supabase), ese throw
// ocurriría antes del render y dejaría la página en blanco. El proxy difiere el error
// hasta que alguien realmente consulte la base, permitiendo que la UI caiga al fallback.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (new Proxy({} as ReturnType<typeof createClient>, {
      get() {
        throw new Error('Supabase no está configurado (faltan las variables VITE_SUPABASE_*)');
      },
    }));
