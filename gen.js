let selectedRatio = '1:1';
let currentImageUrl = '';

window.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (!session || !session.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // Apply Saved Theme
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    if (settings.theme === 'light') {
        document.body.classList.add('theme-light');
    }
});

function selectRatio(ratio, element) {
    selectedRatio = ratio;
    document.querySelectorAll('.ratio-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

// Calculate dimensions based on Ratio & Quality Settings
function getDimensions() {
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || { quality: 'hd' };
    let multiplier = 1;
    if (settings.quality === '2k') multiplier = 1.5;
    if (settings.quality === '4k') multiplier = 2;

    let baseW = 1024, baseH = 1024;
    if (selectedRatio === '16:9') { baseW = 1280; baseH = 720; }
    else if (selectedRatio === '9:16') { baseW = 720; baseH = 1280; }
    else if (selectedRatio === '4:3') { baseW = 1024; baseH = 768; }

    return {
        width: Math.round(baseW * multiplier),
        height: Math.round(baseH * multiplier)
    };
}

// 1. Hugging Face API Request
async function fetchHuggingFace(prompt) {
    const response = await fetch("https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
    });
    if (!response.ok) throw new Error("Hugging Face API Failed");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

// 2. Prodia API Fallback
async function fetchProdia(prompt, width, height) {
    const seed = Math.floor(Math.random() * 999999);
    const url = `https://api.prodia.com/v1/sd/generate?prompt=${encodeURIComponent(prompt)}&width=${width}&height=${height}&seed=${seed}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Prodia API Failed");
    const data = await res.json();
    return data.imageUrl;
}

// 3. Stable Diffusion Fallback
async function fetchStableDiffusion(prompt, width, height) {
    const seed = Math.floor(Math.random() * 999999);
    const url = `https://stablediffusionapi.com/api/v3/text2img`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            key: "", // Public Fallback Mode
            prompt: prompt,
            width: width.toString(),
            height: height.toString(),
            samples: "1"
        })
    });
    if (!res.ok) throw new Error("Stable Diffusion API Failed");
    const data = await res.json();
    if (data.output && data.output[0]) return data.output[0];
    throw new Error("Stable Diffusion No Output");
}

// 4. Pollinations AI Final Safety Net
function fetchPollinations(prompt, width, height) {
    const seed = Math.floor(Math.random() * 999999);
    return `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
}

// MAIN EXECUTION WITH AUTOMATIC API FALLBACK CHAIN
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

    genBtn.disabled = true;
    genBtn.innerHTML = '<span>⚡ GENERATING...</span>';
    displayArea.innerHTML = `
        <div class="placeholder-content">
            <div class="cyber-icon">🔮</div>
            <p>Processing request through Neural API Pipeline...</p>
        </div>
    `;
    actionsArea.classList.add('hidden');

    const dims = getDimensions();
    let finalImageUrl = "";

    // Sequential Fallback Execution
    try {
        console.log("Trying Hugging Face API...");
        finalImageUrl = await fetchHuggingFace(prompt);
    } catch (e1) {
        console.warn("Hugging Face failed. Trying Prodia API...", e1);
        try {
            finalImageUrl = await fetchProdia(prompt, dims.width, dims.height);
        } catch (e2) {
            console.warn("Prodia failed. Trying Stable Diffusion API...", e2);
            try {
                finalImageUrl = await fetchStableDiffusion(prompt, dims.width, dims.height);
            } catch (e3) {
                console.warn("Stable Diffusion failed. Falling back to Pollinations AI...", e3);
                finalImageUrl = fetchPollinations(prompt, dims.width, dims.height);
            }
        }
    }

    // Render Image Result
    const img = new Image();
    img.src = finalImageUrl;
    img.onload = () => {
        currentImageUrl = finalImageUrl;
        displayArea.innerHTML = `<img src="${finalImageUrl}" alt="${prompt}">`;
        actionsArea.classList.remove('hidden');

        // Immediate Save To History
        saveToHistory(prompt, finalImageUrl);

        genBtn.disabled = false;
        genBtn.innerHTML = '<span>✨ GENERATE IMAGE</span>';
    };

    img.onerror = () => {
        // Ultimate fallback to pollinations directly if blob loading fails
        const fallbackUrl = fetchPollinations(prompt, dims.width, dims.height);
        currentImageUrl = fallbackUrl;
        displayArea.innerHTML = `<img src="${fallbackUrl}" alt="${prompt}">`;
        actionsArea.classList.remove('hidden');
        saveToHistory(prompt, fallbackUrl);

        genBtn.disabled = false;
        genBtn.innerHTML = '<span>✨ GENERATE IMAGE</span>';
    };
}

function saveToHistory(prompt, url) {
    let history = JSON.parse(localStorage.getItem('cyber_history')) || [];
    history.unshift({ prompt, url, date: new Date().toLocaleTimeString() });
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
