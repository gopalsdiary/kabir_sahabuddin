/**
 * Authentication and Config for Supabase
 */

const SUPABASE_URL = 'https://vbfckjroisrhplrpqzkd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiZmNranJvaXNyaHBscnBxemtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDQzODYsImV4cCI6MjA3NzQyMDM4Nn0.nIbdwysoW2dp59eqPh3M9axjxR74rGDkn8OdZciue4Y';

// Initialize the official Supabase client safely in a unique global property
if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    if (!window.kbSupabaseClient) {
        window.kbSupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} else {
    console.error('Supabase library not loaded!');
}

/**
 * Check if a JWT token is expired
 */
function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000;
        return Date.now() >= (exp - 60000); // 1 minute buffer
    } catch (e) {
        return true;
    }
}

/**
 * Handle authentication errors by redirecting to login
 */
function handleAuthError() {
    console.warn('Auth error detected, redirecting...');
    localStorage.removeItem('supabase_access_token');
    localStorage.removeItem('supabase_session');
    localStorage.removeItem('supabase_user');
    window.location.href = 'login.html';
}
