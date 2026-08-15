window.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (!session || !session.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // Populate Input Fields
    document.getElementById('set-username').value = session.username || '';
    document.getElementById('set-email').value = session.email || '';

    loadPreferences();
    renderSettingsHistory();
});

function toggleAccordion(panelId) {
    const panel = document.getElementById(panelId);
    const parent = panel.parentElement;
    const isOpen = !panel.classList.contains('hidden');

    document.querySelectorAll('.accordion-panel').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.setting-accordion').forEach(a => a.classList.remove('open'));

    if (!isOpen) {
        panel.classList.remove('hidden');
        parent.classList.add('open');
    }
}

// REALTIME CREDENTIALS SAVE & LOGIN SYNC
function saveProfile(event) {
    event.preventDefault();
    const newUsername = document.getElementById('set-username').value.trim();
    const newEmail = document.getElementById('set-email').value.trim();
    const newPassword = document.getElementById('set-pass').value;

    let registeredUser = JSON.parse(localStorage.getItem('cyber_registered_user')) || {};
    let session = JSON.parse(localStorage.getItem('cyber_user')) || {};

    // Update Registered User Database
    registeredUser.username = newUsername;
    registeredUser.email = newEmail;
    if (newPassword) {
        registeredUser.password = newPassword;
    }

    // Update Current Session
    session.username = newUsername;
    session.email = newEmail;

    localStorage.setItem('cyber_registered_user', JSON.stringify(registeredUser));
    localStorage.setItem('cyber_user', JSON.stringify(session));

    alert('Account details updated successfully! Your new password will be required on next login.');
    document.getElementById('set-pass').value = '';
}

function setTheme(theme, btnElement) {
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    if (theme === 'light') {
        document.body.classList.add('theme-light');
    } else {
        document.body.classList.remove('theme-light');
    }

    const currentSettings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    currentSettings.theme = theme;
    localStorage.setItem('cyber_settings', JSON.stringify(currentSettings));
}

function setQuality(quality, btnElement) {
    document.querySelectorAll('.quality-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    const currentSettings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    currentSettings.quality = quality;
    localStorage.setItem('cyber_settings', JSON.stringify(currentSettings));
}

function loadPreferences() {
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || { quality: 'hd', theme: 'dark' };

    // Apply Quality
    const qualityBtn = document.querySelector(`.quality-btn[data-quality="${settings.quality}"]`);
    if (qualityBtn) {
        document.querySelectorAll('.quality-btn').forEach(btn => btn.classList.remove('active'));
        qualityBtn.classList.add('active');
    }

    // Apply Theme
    if (settings.theme) {
        const themeBtn = document.querySelector(`.theme-btn[data-theme="${settings.theme}"]`);
        if (themeBtn) setTheme(settings.theme, themeBtn);
    }
}

function renderSettingsHistory() {
    const grid = document.getElementById('settings-history-grid');
    const history = JSON.parse(localStorage.getItem('cyber_history')) || [];

    if (history.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-muted); font-size:12px; grid-column:1/-1;">No generation history found.</p>';
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
    if (confirm('Are you sure you want to clear all history logs?')) {
        localStorage.removeItem('cyber_history');
        renderSettingsHistory();
    }
}

function logout() {
    localStorage.removeItem('cyber_user');
    window.location.href = 'index.html';
}
