/* ==========================================================================
   AFS STUDIO // SET.JS (FULL FIXED VERSION)
   ========================================================================== */

window.addEventListener('DOMContentLoaded', () => {
    console.log("[SET.JS] Initializing Settings Script...");

    // 1. Session Protection Check
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (!session || !session.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Populate Current User Details Safely
    const usernameInput = document.getElementById('set-username');
    const emailInput = document.getElementById('set-email');
    
    if (usernameInput) usernameInput.value = session.username || '';
    if (emailInput) emailInput.value = session.email || '';

    // 3. Load Preferences & Render History
    loadPreferences();
    renderSettingsHistory();
});

// Toggle Accordion Panels
function toggleAccordion(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const parentAccordion = panel.parentElement;
    const isOpen = !panel.classList.contains('hidden');

    // Close all panels
    document.querySelectorAll('.accordion-panel').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.setting-accordion').forEach(a => a.classList.remove('open'));

    // If it was closed, open it
    if (!isOpen) {
        panel.classList.remove('hidden');
        if (parentAccordion) parentAccordion.classList.add('open');
    }
}

function logout() {
    localStorage.removeItem('cyber_user');
    window.location.href = 'index.html';
}

// 4. Update Profile (Name, Email & Password)
function saveProfile(event) {
    if (event) event.preventDefault();

    const session = JSON.parse(localStorage.getItem('cyber_user')) || {};
    
    const newUsername = document.getElementById('set-username')?.value.trim();
    const newEmail = document.getElementById('set-email')?.value.trim();
    const newPassword = document.getElementById('set-password')?.value.trim();
    const confirmPassword = document.getElementById('set-confirm-password')?.value.trim();

    if (!newUsername || !newEmail) {
        alert('Username aur Email field khali nahi ho sakti!');
        return;
    }

    // Password Validation Check (Agar user naya password daal raha hai)
    if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
            alert('New Password aur Confirm Password match nahi kar rahay!');
            return;
        }
        if (newPassword.length < 4) {
            alert('Password kam se kam 4 characters ka hona chahiye!');
            return;
        }
        session.password = newPassword;
    }

    // Update Current Active Session
    session.username = newUsername;
    session.email = newEmail;
    localStorage.setItem('cyber_user', JSON.stringify(session));

    // Update Registered Users Array in LocalStorage (Agar multiple accounts hain)
    let allUsers = JSON.parse(localStorage.getItem('cyber_users')) || [];
    const userIndex = allUsers.findIndex(u => u.email === session.email || u.username === session.username);
    
    if (userIndex !== -1) {
        allUsers[userIndex].username = newUsername;
        allUsers[userIndex].email = newEmail;
        if (newPassword) allUsers[userIndex].password = newPassword;
        localStorage.setItem('cyber_users', JSON.stringify(allUsers));
    }

    // Clear Password Inputs
    if (document.getElementById('set-password')) document.getElementById('set-password').value = '';
    if (document.getElementById('set-confirm-password')) document.getElementById('set-confirm-password').value = '';

    alert('Profile Credentials & Password Updated Successfully!');
}

// 5. Theme Switcher (Flexible for Dark / Cyberpunk / Light)
function setTheme(theme, btnElement) {
    // Active class update
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    
    // Auto detect button if not passed directly
    const targetBtn = btnElement || document.querySelector(`.theme-btn[data-theme="${theme}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    // Clean previous theme classes from body
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-cyberpunk');
    
    // Apply selected theme class
    document.body.classList.add(`theme-${theme}`);

    // Save Preference Globally
    const currentSettings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    currentSettings.theme = theme;
    localStorage.setItem('cyber_settings', JSON.stringify(currentSettings));
    
    console.log(`[SET.JS] Theme applied: theme-${theme}`);
}

function setQuality(quality, btnElement) {
    document.querySelectorAll('.quality-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetBtn = btnElement || document.querySelector(`.quality-btn[data-quality="${quality}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    const currentSettings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    currentSettings.quality = quality;
    localStorage.setItem('cyber_settings', JSON.stringify(currentSettings));
}

function loadPreferences() {
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || { quality: 'standard', theme: 'cyberpunk' };

    // Apply Quality State
    const qualityBtn = document.querySelector(`.quality-btn[data-quality="${settings.quality}"]`);
    if (qualityBtn) setQuality(settings.quality, qualityBtn);

    // Apply Theme State
    if (settings.theme) {
        const themeBtn = document.querySelector(`.theme-btn[data-theme="${settings.theme}"]`);
        setTheme(settings.theme, themeBtn);
    }
}

// 6. History Logs Section
function renderSettingsHistory() {
    const grid = document.getElementById('settings-history-grid');
    if (!grid) return;

    const history = JSON.parse(localStorage.getItem('cyber_history')) || [];

    if (history.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-muted, #888); font-size:12px; grid-column:1/-1;">No render logs found.</p>';
        return;
    }

    grid.innerHTML = history.map((item, index) => `
        <div class="settings-history-card">
            <img src="${item.url}" alt="${item.prompt}">
            <div class="history-card-info">
                <p title="${item.prompt}">${item.prompt}</p>
                <div class="history-card-actions">
                    <button class="mini-btn" onclick="window.open('${item.url}', '_blank')">VIEW</button>
                    <button class="mini-btn" onclick="deleteHistoryItem(${index})">DELETE</button>
                </div>
            </div>
        </div>
    `).join('');
}

function deleteHistoryItem(index) {
    let history = JSON.parse(localStorage.getItem('cyber_history')) || [];
    history.splice(index, 1);
    localStorage.setItem('cyber_history', JSON.stringify(history));
    renderSettingsHistory();
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all generation logs?')) {
        localStorage.removeItem('cyber_history');
        renderSettingsHistory();
    }
}
