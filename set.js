/* ==========================================================================
   AFS STUDIO // SET.JS (COMPLETE FIX)
   Link in set.html ONLY: <script src="set.js"></script>
   ========================================================================== */

// Helper function to safely get element by multiple possible IDs
function getElem(...ids) {
    for (let id of ids) {
        const el = document.getElementById(id);
        if (el) return el;
    }
    return null;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("[SET.JS] Script Loaded Successfully!");

    // 1. Session Protection Check
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (!session || !session.isLoggedIn) {
        console.warn("[SET.JS] No active session found. Redirecting to login...");
        window.location.href = 'index.html';
        return;
    }

    // 2. Locate DOM Elements safely (Handles any ID naming you used)
    const hfInput = getElem('hf-key-input', 'hf-key', 'hf_key');
    const prodiaInput = getElem('prodia-key-input', 'prodia-key', 'prodia_key');
    const sdInput = getElem('sd-key-input', 'sd-key', 'sd_key');
    const themeSelect = getElem('theme-select', 'theme', 'theme_select');
    
    // Save Buttons / Forms
    const settingsForm = getElem('settings-form', 'set-form', 'config-form');
    const saveBtn = getElem('save-settings-btn', 'save-btn', 'save-settings', 'submit-btn');

    // 3. Load Previously Saved Settings
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};

    // Populate Input Fields
    if (hfInput) hfInput.value = settings.hfKey || '';
    if (prodiaInput) prodiaInput.value = settings.prodiaKey || '';
    if (sdInput) sdInput.value = settings.sdKey || '';
    if (themeSelect) themeSelect.value = settings.theme || 'dark';

    // Apply Saved Theme Instantly
    if (settings.theme === 'light') {
        document.body.classList.add('theme-light');
    } else {
        document.body.classList.remove('theme-light');
    }

    // 4. Central Save Function
    function performSave(e) {
        if (e) e.preventDefault(); // Stop page reload!

        const updatedSettings = {
            hfKey: hfInput ? hfInput.value.trim() : '',
            prodiaKey: prodiaInput ? prodiaInput.value.trim() : '',
            sdKey: sdInput ? sdInput.value.trim() : '',
            theme: themeSelect ? themeSelect.value : 'dark'
        };

        // Save to LocalStorage
        localStorage.setItem('cyber_settings', JSON.stringify(updatedSettings));
        console.log("[SET.JS] Settings Saved:", updatedSettings);

        // Apply Theme Change Immediately
        if (updatedSettings.theme === 'light') {
            document.body.classList.add('theme-light');
        } else {
            document.body.classList.remove('theme-light');
        }

        // Visual Feedback
        showStatusNotification("Settings Successfully Saved!");
    }

    // 5. Attach Event Listeners (Form + Button दोनों पर)
    if (settingsForm) {
        settingsForm.addEventListener('submit', performSave);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', performSave);
    }

    // Direct change event on theme dropdown for instant preview
    if (themeSelect) {
        themeSelect.addEventListener('change', () => {
            if (themeSelect.value === 'light') {
                document.body.classList.add('theme-light');
            } else {
                document.body.classList.remove('theme-light');
            }
        });
    }
});

// Popup Notification (No External Library Needed)
function showStatusNotification(msg) {
    let popup = document.getElementById('set-toast-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'set-toast-popup';
        popup.style.cssText = `
            position: fixed;
            bottom: 25px;
            right: 25px;
            background: #00ffcc;
            color: #050508;
            padding: 14px 28px;
            border-radius: 8px;
            font-family: sans-serif;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 0 20px rgba(0, 255, 204, 0.5);
            z-index: 999999;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(popup);
    }
    popup.innerText = msg;
    popup.style.opacity = '1';
    popup.style.transform = 'translateY(0)';

    setTimeout(() => {
        popup.style.opacity = '0';
        popup.style.transform = 'translateY(10px)';
    }, 2500);
}
