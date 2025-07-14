import { createClient } from "@supabase/supabase-js";

// Define your Supabase URL and Key
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SERVICE_KEY;


if (!SUPABASE_URL) {
	console.error("NEXT_PUBLIC_SUPABASE_URL is not defined");
}

if (!SUPABASE_KEY) {
	console.error("NEXT_PUBLIC_SERVICE_KEY is not defined");
}


// Create a Supabase client instance
const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_KEY ?? "");

export { supabase };
