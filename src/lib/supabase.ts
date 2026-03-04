import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _supabase
}

export const getPublicUrl = (path: string) => {
  const supabase = getSupabase()
  const { data } = supabase.storage.from('images').getPublicUrl(path)
  return data.publicUrl
}
