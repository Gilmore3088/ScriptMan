import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Client-side Supabase client (uses the anon key)
export const createBrowserClient = () => {
  return createClientComponentClient<Database>()
}

