import { createClient } from "@supabase/supabase-js";


const supabaseClient = createClient<DB>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const supabaseServer = createClient

export default {
    supabaseClient,
}