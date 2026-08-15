/* ==========================================================================
   AFS STUDIO // SET.JS
   Link in set.html ONLY: <script src="set.js"></script>
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Session Protection Check
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (!session || !session.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Load Saved Settings into Inputs
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};

    const hfInput = document.getElementById('hf-key-input');
    const prodiaInput = document.getElementById('prodia-key-input');
    const sdInput = document.getElementById('sd-key-input');
    const themeSelect = document.getElementById('theme-select');
    const saveBtn = document.getElementById('save-settings-btn');

    if (settings.theme === 'light') {
        document.body.classList.add('theme-light');
    }

    if (hfInput) hfInput.value = settings.hfKey || '';
    if (prodiaInput) prodiaInput.value = settings.prodiaKey || '';
    if (sdInput) sdInput.value = settings.sdKey || '';
    if (themeSelect) themeSelect.value = settings.theme || 'dark';

    // 3. Save Settings Handler
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const updatedSettings = {
                hfKey: hfInput ? hfInput.value.trim() : '',
                prodiaKey: prodiaInput ? prodiaInput.value.trim() : '',
                sdKey: sdInput ? sdInput.value.trim() : '',
                theme: themeSelect ? themeSelect.value : 'dark'
            };

            // Save to LocalStorage (Shared across gen.js)
            localStorage.setItem('cyber_settings', JSON.stringify(updatedSettings));

            // Theme Immediate Update
            if (updatedSettings.theme === 'light') {
                document.body.classList.add('theme-light');
            } else {
                document.body.classList.remove('theme-light');
            }

            alert('API Keys aur Settings successfully save hogayi hain!');
        });
    }
});
