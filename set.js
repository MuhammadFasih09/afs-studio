window.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (!session || !session.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // Populate Current Profile
    document.getElementById('set-username').value = session.username;
    document.getElementById('set-email').value = session.email;

    // Load Settings & History
    loadPreferences();
    renderSettingsHistory();
});

function logout() {
    localStorage.removeItem('cyber_user');
    window.location.href = 'index.html';
}

function saveProfile(event) {
    event.preventDefault();
    const session = JSON.parse(localStorage.getItem('cyber_user')) || {};
    
    session.username = document.getElementById('set-username').value;
    session.email = document.getElementById('set-email').value;

    localStorage.setItem('cyber_user', JSON.stringify(session));
    alert('User Profile Credentials Updated Successfully!');
}

function savePreferences() {
    const quality = document.getElementById('set-quality').value;
    const currentSettings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    currentSettings.quality = quality;
    localStorage.setItem('cyber_settings', JSON.stringify(currentSettings));
}

function loadPreferences() {
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || { quality: 'standard', theme: 'cyberpunk' };
    document.getElementById('set-quality').value = settings.quality || 'standard';
    
    if (settings.theme) {
        const themeBtn = document.querySelector(`.theme-btn[data-theme="${settings.theme}"]`);
        if (themeBtn) setTheme(settings.theme, themeBtn);
    }
}

function setTheme(theme, btnElement) {
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    if (theme === 'dark') {
        document.body.classList.add('theme-dark');
    } else {
        document.body.classList.remove('theme-dark');
    }

    const currentSettings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    currentSettings.theme = theme;
    localStorage.setItem('cyber_settings', JSON.stringify(currentSettings));
}

function renderSettingsHistory() {
    const grid = document.getElementById('settings-history-grid');
    const history = JSON.parse(localStorage.getItem('cyber_history')) || [];

    if (history.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-muted); font-size:13px;">No render logs found.</p>';
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
