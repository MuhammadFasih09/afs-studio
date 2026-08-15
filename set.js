let selectedRatio = '1:1';
let currentImageUrl = '';

window.addEventListener('DOMContentLoaded', () => {
    // Session Check
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (!session || !session.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // Apply Saved Theme Preference
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    if (settings.theme === 'dark') {
        document.body.classList.add('theme-dark');
    }
});

function selectRatio(ratio, element) {
    selectedRatio = ratio;
    document.querySelectorAll('.ratio-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

async function generateImage() {
    const promptInput = document.getElementById('prompt-input');
    const prompt = promptInput.value.trim();
    const displayArea = document.getElementById('image-container');
    const actionsArea = document.getElementById('output-actions');
    const genBtn = document.getElementById('generate-btn');

    if (!prompt) {
        alert('Please enter a prompt first!');
        return;
    }

    // UI Loading State
    genBtn.disabled = true;
    genBtn.innerHTML = '<span>⚡ GENERATING...</span>';
    displayArea.innerHTML = `
        <div class="placeholder-content">
            <div class="cyber-icon">🔮</div>
            <p>Rendering high-res neural image...</p>
        </div>
    `;
    actionsArea.classList.add('hidden');

    try {
        // Pollinations AI Endpoint
        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 999999);
        const settings = JSON.parse(localStorage.getItem('cyber_settings')) || { quality: 'standard' };
        
        let width = 1024;
        let height = 1024;

        if (selectedRatio === '16:9') { width = 1280; height = 720; }
        else if (selectedRatio === '9:16') { width = 720; height = 1280; }
        else if (selectedRatio === '4:3') { width = 1024; height = 768; }

        const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

        // Load Image
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            currentImageUrl = imageUrl;
            displayArea.innerHTML = `<img src="${imageUrl}" alt="${prompt}">`;
            actionsArea.classList.remove('hidden');

            // Save to Local History
            saveToHistory(prompt, imageUrl);

            genBtn.disabled = false;
            genBtn.innerHTML = '<span>✨ GENERATE IMAGE</span>';
        };

        img.onerror = () => {
            throw new Error('Failed to render image.');
        };

    } catch (err) {
        alert('Image generation failed. Please try again.');
        displayArea.innerHTML = `
            <div class="placeholder-content">
                <div class="cyber-icon">❌</div>
                <p>Generation Error. Try again.</p>
            </div>
        `;
        genBtn.disabled = false;
        genBtn.innerHTML = '<span>✨ GENERATE IMAGE</span>';
    }
}

function saveToHistory(prompt, url) {
    let history = JSON.parse(localStorage.getItem('cyber_history')) || [];
    history.unshift({ prompt, url, date: new Date().toLocaleDateString() });
    localStorage.setItem('cyber_history', JSON.stringify(history));
}

function downloadImage() {
    if (!currentImageUrl) return;
    const a = document.createElement('a');
    a.href = currentImageUrl;
    a.download = `AFS-IMG-GEN-${Date.now()}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function copyImageLink() {
    if (!currentImageUrl) return;
    navigator.clipboard.writeText(currentImageUrl);
    alert('Image URL copied to clipboard!');
}
