import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Server-side Supabase client with admin privileges
// This should ONLY be used in Server Components or Server Actions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseKey)

