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
 * Advanced Auto-logout system (Subtle & Robust)
 * Synchronizes across tabs and survives reloads
 */
function initAutoLogout() {
    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes
    const WARNING_TIME = 60 * 1000; // Show warning 1 minute before
    const CHECK_INTERVAL = 1000; // Check every second
    const STORAGE_KEY = 'kb_last_activity';

    function logout() {
        console.warn('Session expired due to inactivity.');
        handleAuthError();
    }

    function updateLastActivity() {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }

    function checkInactivity() {
        const lastActivity = parseInt(localStorage.getItem(STORAGE_KEY) || Date.now());
        const elapsed = Date.now() - lastActivity;

        if (elapsed >= INACTIVITY_LIMIT) {
            logout();
        } else if (elapsed >= INACTIVITY_LIMIT - WARNING_TIME) {
            // Show a subtle warning if not already shown
            showSessionWarning(Math.ceil((INACTIVITY_LIMIT - elapsed) / 1000));
        } else {
            hideSessionWarning();
        }
    }

    // Modal UI for Warning
    function showSessionWarning(secondsLeft) {
        let warningEl = document.getElementById('session-warning-modal');
        if (!warningEl) {
            warningEl = document.createElement('div');
            warningEl.id = 'session-warning-modal';
            warningEl.style.cssText = `
                position: fixed; bottom: 20px; right: 20px; 
                background: #fff; border-left: 4px solid #ff4d4f;
                padding: 15px 25px; border-radius: 8px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                z-index: 9999; font-family: sans-serif;
                display: flex; align-items: center; gap: 15px;
                transition: all 0.3s ease; animation: slideIn 0.5s ease;
            `;
            warningEl.innerHTML = `
                <div style="font-size: 20px;">⏳</div>
                <div>
                    <div style="font-weight: bold; color: #333;">Session Timeout</div>
                    <div style="font-size: 13px; color: #666;">Logging out in <span id="session-timer">${secondsLeft}</span>s</div>
                </div>
            `;
            document.body.appendChild(warningEl);
            
            // Add animation
            const style = document.createElement('style');
            style.innerHTML = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
            document.head.appendChild(style);
        }
        document.getElementById('session-timer').textContent = secondsLeft;
    }

    function hideSessionWarning() {
        const warningEl = document.getElementById('session-warning-modal');
        if (warningEl) warningEl.remove();
    }

    // Activity Tracking
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
        document.addEventListener(event, () => {
            updateLastActivity();
            hideSessionWarning();
        }, { passive: true });
    });

    // Initialize and loop
    updateLastActivity();
    setInterval(checkInactivity, CHECK_INTERVAL);
}

// Automatically start if not on login page
if (!window.location.pathname.includes('login.html')) {
    initAutoLogout();
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
