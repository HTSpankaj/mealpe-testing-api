// import { createClient } from '@supabase/supabase-js'
const createClient = require("@supabase/supabase-js").createClient

const supabaseUrl = "https://gntopufgkwftsqbbxysx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdudG9wdWZna3dmdHNxYmJ4eXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODczMjc2ODgsImV4cCI6MjAwMjkwMzY4OH0.gQkdDgqtNFT2d_8iGgj0_Z2D_KUrr4UkmOaObozJXug";
const otherOptions = {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
};

const supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, otherOptions);
exports.supabase = supabaseInstance;