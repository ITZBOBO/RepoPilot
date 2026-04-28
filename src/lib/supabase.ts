import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon'
const supabaseRole = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-role'

// Client-side / anon key (safe to expose)
export const supabase = createClient(supabaseUrl, supabaseAnon)

// Server-side admin client — bypasses RLS, never expose to browser
export const supabaseAdmin = createClient(supabaseUrl, supabaseRole, {
  auth: { persistSession: false },
})
