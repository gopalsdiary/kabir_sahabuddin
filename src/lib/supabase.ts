import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sbyvmktfmnucnmglajpr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNieXZta3RmbW51Y25tZ2xhanByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNDQ2MTEsImV4cCI6MjA5NjkyMDYxMX0.tCfl-jVijPf9s3C7-NsudfdG1GcgVZg--XgJVz85i5Y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
