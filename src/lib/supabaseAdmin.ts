import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

if (!process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
