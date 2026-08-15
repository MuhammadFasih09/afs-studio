/* ==========================================================================
   AFS STUDIO // SCRIPT.JS
   Connected to: index.html & set.html
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    applySavedTheme();
    
    // Page Context Checking
    const isSetPage = document.getElementById('hf-key-input') !== null || document.getElementById('save-settings-btn') !== null;
    const isAuthPage = document.getElementById('login-form') !== null || document.getElementById('signup-form') !== null;

    if (isSetPage) {
        setupSetPage();
    } else if (isAuthPage) {
        setupAuthPage();
    }
});

// Apply Global Theme
function applySavedTheme() {
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    if (settings.theme === 'light') {
        document.body.classList.add('theme-light');
    } else {
        document.body.classList.remove('theme-light');
    }
}

// SETTINGS PAGE LOGIC (set.html)
function setupSetPage() {
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};

    const hfInput = document.getElementById('hf-key-input');
    const prodiaInput = document.getElementById('prodia-key-input');
    const sdInput = document.getElementById('sd-key-input');
    const themeSelect = document.getElementById('theme-select');
    const saveBtn = document.getElementById('save-settings-btn');

    // Load Existing Saved Keys
    if (hfInput) hfInput.value = settings.hfKey || '';
    if (prodiaInput) prodiaInput.value = settings.prodiaKey || '';
    if (sdInput) sdInput.value = settings.sdKey || '';
    if (themeSelect) themeSelect.value = settings.theme || 'dark';

    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const updatedSettings = {
                hfKey: hfInput ? hfInput.value.trim() : '',
                prodiaKey: prodiaInput ? prodiaInput.value.trim() : '',
                sdKey: sdInput ? sdInput.value.trim() : '',
                theme: themeSelect ? themeSelect.value : 'dark'
            };
            localStorage.setItem('cyber_settings', JSON.stringify(updatedSettings));
            applySavedTheme();
            alert('Settings and API Keys saved successfully!');
        });
    }
}

// AUTHENTICATION LOGIC (index.html)
function setupAuthPage() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('cyber_user', JSON.stringify({ isLoggedIn: true }));
            window.location.href = 'gen.html';
        });
    }
}
