import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Check if environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Please check your .env.local file.")

  // In development, provide more helpful error messages
  if (process.env.NODE_ENV === "development") {
    console.error(`
      Please make sure you have the following in your .env.local file:
      
      NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
      
      You can find these values in your Supabase project settings.
    `)
  }
}

// Create the Supabase client with fallback empty strings to prevent runtime errors
// This will still fail on API calls, but won't crash the app on initialization
export const supabase = createClient<Database>(supabaseUrl || "", supabaseAnonKey || "")

