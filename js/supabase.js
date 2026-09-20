const SUPABASE_URL = "https://kubasvucgapjwttfjamt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_LxcgICL99LgOYAKrV1fRWQ_7lAz_XxV";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);