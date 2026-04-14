import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://cmeydojjiomkhswilcku.supabase.co',
    'sb_publishable_CcP8CFM4b-L2y6HHVEproQ_r__10ygz'
  )
}
