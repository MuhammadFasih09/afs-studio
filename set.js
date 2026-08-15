/* ==========================================================================
   AFS STUDIO // SET.JS (FIXED & FULLY FUNCTIONAL)
   Link in set.html ONLY: <script src="set.js"></script>
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log("[SET.JS] Settings script loaded successfully.");

    // 1. Session Protection Check
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (!session || !session.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Fetch DOM Elements (Flexibility for multi-naming)
    const hfInput = document.getElementById('hf-key-input') || document.getElementById('hf-key');
    const prodiaInput = document.getElementById('prodia-key-input') || document.getElementById('prodia-key');
    const sdInput = document.getElementById('sd-key-input') || document.getElementById('sd-key');
    const themeSelect = document.getElementById('theme-select') || document.getElementById('theme');
    const saveBtn = document.getElementById('save-settings-btn') || document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-settings-btn');

    // 3. Load Saved Settings into Inputs on Page Load
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};

    // Apply Saved Theme
    if (settings.theme === 'light') {
        document.body.classList.add('theme-light');
    } else {
        document.body.classList.remove('theme-light');
    }

    // Populate Fields
    if (hfInput) hfInput.value = settings.hfKey || '';
    if (prodiaInput) prodiaInput.value = settings.prodiaKey || '';
    if (sdInput) sdInput.value = settings.sdKey || '';
    if (themeSelect) themeSelect.value = settings.theme || 'dark';

    // 4. Save Settings Functionality
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const updatedSettings = {
                hfKey: hfInput ? hfInput.value.trim() : '',
                prodiaKey: prodiaInput ? prodiaInput.value.trim() : '',
                sdKey: sdInput ? sdInput.value.trim() : '',
                theme: themeSelect ? themeSelect.value : 'dark'
            };

            // Save into LocalStorage (Accessible globally by gen.js)
            localStorage.setItem('cyber_settings', JSON.stringify(updatedSettings));

            // Instant Theme Toggle
            if (updatedSettings.theme === 'light') {
                document.body.classList.add('theme-light');
            } else {
                document.body.classList.remove('theme-light');
            }

            showToast('Settings & API Keys Saved Successfully!');
        });
    }

    // 5. Reset Settings (Optional Clear Button)
    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Kya aap saari settings aur API keys clear karna chahte hain?")) {
                localStorage.removeItem('cyber_settings');
                if (hfInput) hfInput.value = '';
                if (prodiaInput) prodiaInput.value = '';
                if (sdInput) sdInput.value = '';
                if (themeSelect) themeSelect.value = 'dark';
                document.body.classList.remove('theme-light');
                showToast('Settings reset ho chuki hain.');
            }
        });
    }
});

// Utility: Notification Toast
function showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #00ffcc;
            color: #000;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,255,204,0.4);
            z-index: 9999;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}
