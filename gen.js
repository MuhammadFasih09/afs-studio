let selectedRatio = '1:1';
let currentImageUrl = '';

// Auth Check & Session Load
window.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (!session || !session.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('user-display').innerText = `RUNNER: ${session.username.toUpperCase()}`;
    loadHistory();
});

function logout() {
    localStorage.removeItem('cyber_user');
    window.location.href = 'index.html';
}

function setRatio(ratio, element) {
    selectedRatio = ratio;
    document.querySelectorAll('.ratio-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

async function generateImage() {
    const prompt = document.getElementById('prompt-input').value.trim();
    if (!prompt) {
        alert('Please enter a description for the image.');
        return;
    }

    const btnText = document.getElementById('btn-text');
    const spinner = document.getElementById('btn-spinner');
    const generateBtn = document.getElementById('generate-btn');
    const placeholder = document.getElementById('placeholder');
    const outputImage = document.getElementById('output-image');
    const actionBar = document.getElementById('action-bar');

    // UI Loading state
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
    generateBtn.disabled = true;

    // Dimensions based on ratio
    let width = 1024;
    let height = 1024;
    if (selectedRatio === '16:9') { width = 1280; height = 720; }
    if (selectedRatio === '9:16') { width = 720; height = 1280; }

    const seed = Math.floor(Math.random() * 999999);
    const encodedPrompt = encodeURIComponent(prompt);
    
    // Quality check from settings if saved
    const userSettings = JSON.parse(localStorage.getItem('cyber_settings')) || { quality: 'standard' };
    const enhance = userSettings.quality === 'high' ? 'true' : 'false';

    const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&enhance=${enhance}&nologo=true`;

    const imgLoader = new Image();
    imgLoader.src = imageUrl;

    imgLoader.onload = () => {
        currentImageUrl = imageUrl;
        outputImage.src = imageUrl;
        placeholder.classList.add('hidden');
        outputImage.classList.remove('hidden');
        actionBar.classList.remove('hidden');

        // Reset BTN State
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
        generateBtn.disabled = false;

        // Save to Local History
        saveToHistory(prompt, imageUrl);
    };

    imgLoader.onerror = () => {
        alert('Image generation failed. Try again.');
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
        generateBtn.disabled = false;
    };
}

function saveToHistory(prompt, url) {
    let history = JSON.parse(localStorage.getItem('cyber_history')) || [];
    history.unshift({ prompt, url, date: new Date().toISOString() });
    if (history.length > 10) history.pop(); // Keep last 10
    localStorage.setItem('cyber_history', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const historyGrid = document.getElementById('history-grid');
    const history = JSON.parse(localStorage.getItem('cyber_history')) || [];
    
    if (history.length === 0) {
        historyGrid.innerHTML = '<p style="color:var(--text-muted); font-size:12px;">No renders saved yet.</p>';
        return;
    }

    historyGrid.innerHTML = history.map(item => `
        <div class="history-item" onclick="viewHistoryItem('${item.url}')">
            <img src="${item.url}" alt="${item.prompt}">
        </div>
    `).join('');
}

function viewHistoryItem(url) {
    currentImageUrl = url;
    const outputImage = document.getElementById('output-image');
    document.getElementById('placeholder').classList.add('hidden');
    outputImage.src = url;
    outputImage.classList.remove('hidden');
    document.getElementById('action-bar').classList.remove('hidden');
}

function downloadImage() {
    if (!currentImageUrl) return;
    const link = document.createElement('a');
    link.href = currentImageUrl;
    link.download = `CyberGen_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function openFullImage() {
    if (currentImageUrl) window.open(currentImageUrl, '_blank');
}
