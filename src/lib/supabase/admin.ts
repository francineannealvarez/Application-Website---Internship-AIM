// Admin-only Supabase client using service role key
// BYPASSES Row Level Security — use ONLY for intentional admin operations
// Examples: bulk data updates, cleanup tasks, operations that need unrestricted access
// DO NOT use this in regular queries or user-facing endpoints

import { createClient } from '@supabase/supabase-js'

export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
