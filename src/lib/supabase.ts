import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export const BUCKETS = {
  PRODUTOS: "PRODUCT_IMAGE_BUCKET",
  PARTIDAS: "PublicImages_Matchs",
  NOTICIAS: "noticias"
} as const;
