// Auth Check
if (localStorage.getItem('ai_logged_in') !== 'true') {
    window.location.href = 'index.html';
}

// Apply theme on load
const savedTheme = localStorage.getItem('ai_theme') || 'dark';
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
}

// Tab Switching Logic
const tabBtns = document.querySelectorAll('.tab-btn');
const contentSections = document.querySelectorAll('.content-section');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');

        // Handle Logout separately
        if (targetId === 'logout') {
            if(confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('ai_logged_in');
                window.location.href = 'index.html';
            }
            return;
        }

        if (!targetId) return;

        // Remove active class from all buttons and sections
        tabBtns.forEach(b => b.classList.remove('active'));
        contentSections.forEach(s => s.classList.remove('active'));

        // Add active class to clicked button and target section
        btn.classList.add('active');
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // If history tab is opened, load history dynamically
        if (targetId === 'history') {
            loadHistoryData();
        }
    });
});

// Load Profile Data into Inputs
const profileForm = document.getElementById('profile-form');
const profileNameInput = document.getElementById('profile-name');
const profileEmailInput = document.getElementById('profile-email');

const storedUser = JSON.parse(localStorage.getItem('ai_user'));
if (storedUser) {
    profileNameInput.value = storedUser.name || '';
    profileEmailInput.value = storedUser.email || '';
}

profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (storedUser) {
        storedUser.name = profileNameInput.value.trim();
        storedUser.email = profileEmailInput.value.trim();
        localStorage.setItem('ai_user', JSON.stringify(storedUser));
        alert('Profile updated successfully!');
    }
});

// Theme Switching Logic in Settings
const darkThemeBtn = document.getElementById('dark-theme-btn');
const lightThemeBtn = document.getElementById('light-theme-btn');

darkThemeBtn.addEventListener('click', () => {
    localStorage.setItem('ai_theme', 'dark');
    document.body.classList.remove('light-theme');
    alert('Dark theme applied!');
});

lightThemeBtn.addEventListener('click', () => {
    localStorage.setItem('ai_theme', 'light');
    document.body.classList.add('light-theme');
    alert('Light theme applied!');
});

// Fake Resolution / Quality Function
function fakeRes(quality) {
    localStorage.setItem('ai_fake_resolution', quality);
    alert('Success: Output quality set to ' + quality + '!');
}

// Load Generation History Function
function loadHistoryData() {
    const historyGrid = document.getElementById('history-grid');
    const historyData = JSON.parse(localStorage.getItem('ai_history')) || [];

    historyGrid.innerHTML = '';

    if (historyData.length === 0) {
        historyGrid.innerHTML = '<p style="color: #94a3b8; grid-column: 1/-1; text-align: center;">No generation history found yet.</p>';
        return;
    }

    historyData.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <img src="${item.image}" alt="Generated Art" onerror="this.src='https://via.placeholder.com/200x120?text=Image'">
            <p title="${item.prompt}">${item.prompt}</p>
            <small style="color: #64748b; font-size: 10px;">${item.date}</small>
        `;
        historyGrid.appendChild(historyItem);
    });
}
