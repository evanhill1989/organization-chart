import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/supabase";
import * as schema from "./schema"; // your drizzle schema

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const db = drizzle(supabase, { schema });
