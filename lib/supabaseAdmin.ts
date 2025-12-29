import { createClient } from "@supabase/supabase-js";

<<<<<<< HEAD
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!serviceKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
}
=======
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
>>>>>>> 538a2c8355010e56c39868cbbaf47ffc2f76de5d

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});