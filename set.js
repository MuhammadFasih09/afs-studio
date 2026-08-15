/* ==========================================================================
   AFS STUDIO // SET.JS (FULL SYNCED & FIXED VERSION)
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

    // 3. Load Saved Preferences & Render History
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

// 4. Update Profile Credentials & Password (ENHANCED LOGIN-SYNC FIX)
function saveProfile(event) {
    if (event) event.preventDefault();

    let session = JSON.parse(localStorage.getItem('cyber_user')) || {};
    
    // Save previous records before updating session
    const oldEmail = (session.email || '').toLowerCase().trim();
    const oldUsername = (session.username || '').toLowerCase().trim();

    const newUsernameInput = document.getElementById('set-username')?.value.trim();
    const newEmailInput = document.getElementById('set-email')?.value.trim();
    const newPassword = document.getElementById('set-password')?.value.trim();
    const confirmPassword = document.getElementById('set-confirm-password')?.value.trim();

    if (!newUsernameInput || !newEmailInput) {
        alert('Username aur Email required hain!');
        return;
    }

    // Password Validation Check
    let updatePassword = false;
    if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
            alert('New Password aur Confirm Password match nahi kar rahay!');
            return;
        }
        if (newPassword.length < 4) {
            alert('Password kam se kam 4 characters ka hona chahiye!');
            return;
        }
        updatePassword = true;
    }

    // Determine target password
    const finalPassword = updatePassword ? newPassword : (session.password || '');

    // 1. Update Session Object
    session.username = newUsernameInput;
    session.email = newEmailInput;
    if (updatePassword) {
        session.password = finalPassword;
    }
    localStorage.setItem('cyber_user', JSON.stringify(session));

    // 2. Update Global Registered Users Array ('cyber_users')
    let allUsers = JSON.parse(localStorage.getItem('cyber_users')) || [];

    // Look for matching user in allUsers database
    let userIndex = allUsers.findIndex(u => {
        const uEmail = (u.email || '').toLowerCase().trim();
        const uUser = (u.username || u.name || '').toLowerCase().trim();
        return (oldEmail && uEmail === oldEmail) || 
               (oldUsername && uUser === oldUsername) || 
               (uEmail === newEmailInput.toLowerCase()) || 
               (uUser === newUsernameInput.toLowerCase());
    });

    if (userIndex !== -1) {
        // Existing user updated
        allUsers[userIndex].username = newUsernameInput;
        allUsers[userIndex].email = newEmailInput;
        allUsers[userIndex].password = finalPassword;
    } else {
        // If not found in database, push new account
        allUsers.push({
            username: newUsernameInput,
            email: newEmailInput,
            password: finalPassword
        });
    }

    // Save updated users list back to localStorage
    localStorage.setItem('cyber_users', JSON.stringify(allUsers));

    // Clear Password Inputs
    if (document.getElementById('set-password')) document.getElementById('set-password').value = '';
    if (document.getElementById('set-confirm-password')) document.getElementById('set-confirm-password').value = '';

    alert('Profile & Password successfully update ho gaya hai! Ab aap naye password se login kar sakte hain.');
}
// 5. Theme Switcher (Syncs with Image Generator Page)
function setTheme(theme, btnElement) {
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetBtn = btnElement || document.querySelector(`.theme-btn[data-theme="${theme}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    document.body.classList.remove('theme-dark', 'theme-light', 'theme-cyberpunk');
    document.body.classList.add(`theme-${theme}`);

    const currentSettings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    currentSettings.theme = theme;
    localStorage.setItem('cyber_settings', JSON.stringify(currentSettings));
    
    console.log(`[SET.JS] Theme applied globally: theme-${theme}`);
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

    const qualityBtn = document.querySelector(`.quality-btn[data-quality="${settings.quality}"]`);
    if (qualityBtn) setQuality(settings.quality, qualityBtn);

    if (settings.theme) {
        const themeBtn = document.querySelector(`.theme-btn[data-theme="${settings.theme}"]`);
        setTheme(settings.theme, themeBtn);
    }
}

// 6. History Logs Section (Save, View & Clear)
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
