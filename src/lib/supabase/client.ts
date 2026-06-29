// Browser-side Supabase client for Client Components
// Uses public anon key — safe to expose to frontend
// RLS policies enforced based on user session

import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
