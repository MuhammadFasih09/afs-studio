/* ==========================================================================
   AFS STUDIO // SCRIPT.JS
   Link in index.html ONLY: <script src="script.js"></script>
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Apply Saved Theme
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    if (settings.theme === 'light') {
        document.body.classList.add('theme-light');
    }

    // Auto-redirect if already logged in
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (session && session.isLoggedIn) {
        window.location.href = 'gen.html';
        return;
    }

    // Login Form Event Handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('cyber_user', JSON.stringify({ isLoggedIn: true }));
            window.location.href = 'gen.html';
        });
    }
});
