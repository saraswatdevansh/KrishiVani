import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kmnpryzlktgcascturib.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbnByeXpsa3RnY2FzY3R1cmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMDA5MTcsImV4cCI6MjEwMzc3NjkxN30.8U3GdDmFemUqdo5chEFirpkSRdkpSahl-M_4sGoHjc0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
