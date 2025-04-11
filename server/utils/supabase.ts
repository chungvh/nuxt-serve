import { createClient } from '@supabase/supabase-js'
let supabase = null

export function getSupabase() {
    if (!supabase) {
        const config = useRuntimeConfig()
        supabase = createClient(config.supabaseUrl, config.supabaseKey)
    }
    return supabase
}
