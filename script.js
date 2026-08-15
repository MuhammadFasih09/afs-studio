/* ==========================================================================
   AFS IMG GEN ENGINE // SCRIPT.JS
   Connected to: index.html, gen.html, set.html
   ========================================================================== */

// Page Load Initialization
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // 1. Theme Sync across pages
    applySavedTheme();

    // 2. Identify Current Page Context
    const isGenPage = document.getElementById('prompt-input') !== null || document.getElementById('generate-btn') !== null;
    const isSetPage = document.getElementById('hf-key-input') !== null || document.getElementById('save-settings-btn') !== null;
    const isAuthPage = document.getElementById('login-form') !== null || document.getElementById('signup-form') !== null;

    if (isGenPage) {
        setupGenPage();
    } else if (isSetPage) {
        setupSetPage();
    } else if (isAuthPage) {
        setupAuthPage();
    }
}

// Global Theme Handler
function applySavedTheme() {
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    if (settings.theme === 'light') {
        document.body.classList.add('theme-light');
    } else {
        document.body.classList.remove('theme-light');
    }
}

// Retrieve Saved API Keys from LocalStorage
function getApiKeys() {
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    return {
        hfKey: settings.hfKey || '',
        prodiaKey: settings.prodiaKey || '',
        sdKey: settings.sdKey || ''
    };
}

/* ==========================================================================
   GEN.HTML LOGIC (IMAGE GENERATION & ASPECT RATIO)
   ========================================================================== */

function setupGenPage() {
    // Session Check
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (!session || !session.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    const genForm = document.getElementById('gen-form');
    const genBtn = document.getElementById('generate-btn');

    if (genForm) {
        genForm.addEventListener('submit', handlePromptSubmit);
    } else if (genBtn) {
        genBtn.addEventListener('click', handlePromptSubmit);
    }

    renderHistory();
}

// Aspect Ratio to Width/Height Helper
function getDimensionsFromRatio(ratioStr) {
    switch (ratioStr) {
        case '16:9': return { width: 1280, height: 720 };
        case '9:16': return { width: 720, height: 1280 };
        case '4:3':  return { width: 1024, height: 768 };
        case '3:4':  return { width: 768, height: 1024 };
        case '1:1':
        default:     return { width: 1024, height: 1024 };
    }
}

// 1. TIER 1: HUGGING FACE
async function generateViaHuggingFace(prompt, apiKey, width, height) {
    if (!apiKey) throw new Error("Hugging Face API key missing");

    const response = await fetch("https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev", {
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ 
            inputs: prompt,
            parameters: { width: width, height: height }
        }),
    });

    if (!response.ok) throw new Error(`HF Error: ${response.status}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

// 2. TIER 2: PRODIA API
async function generateViaProdia(prompt, apiKey, ratio) {
    if (!apiKey) throw new Error("Prodia API key missing");

    // Prodia aspect ratio map
    let prodiaRatio = 'square';
    if (ratio === '16:9') prodiaRatio = 'landscape';
    if (ratio === '9:16') prodiaRatio = 'portrait';

    const createRes = await fetch(`https://api.prodia.com/v1/sd/generate?prompt=${encodeURIComponent(prompt)}&aspect_ratio=${prodiaRatio}`, {
        method: 'GET',
        headers: {
            'X-Prodia-Key': apiKey,
            'Accept': 'application/json'
        }
    });

    if (!createRes.ok) throw new Error(`Prodia Creation Error: ${createRes.status}`);
    const jobData = await createRes.json();
    const jobId = jobData.job;

    for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await fetch(`https://api.prodia.com/v1/job/${jobId}`, {
            headers: { 'X-Prodia-Key': apiKey }
        });
        const statusData = await statusRes.json();

        if (statusData.status === 'succeeded') {
            return statusData.imageUrl;
        } else if (statusData.status === 'failed') {
            throw new Error("Prodia Generation Failed");
        }
    }
    throw new Error("Prodia Timeout");
}

// 3. TIER 3: STABLE DIFFUSION
async function generateViaStableDiffusion(prompt, apiKey, width, height) {
    if (!apiKey) throw new Error("Stable Diffusion API key missing");

    const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            text_prompts: [{ text: prompt }],
            cfg_scale: 7,
            height: height,
            width: width,
            steps: 30,
            samples: 1,
        }),
    });

    if (!response.ok) throw new Error(`Stable Diffusion Error: ${response.status}`);
    const data = await response.json();
    return `data:image/png;base64,${data.artifacts[0].base64}`;
}

// 4. TIER 4: POLLINATIONS AI (FALLBACK SAFETY NET)
async function generateViaPollinations(prompt, width, height) {
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(imageUrl);
        img.onerror = () => reject(new Error("Pollinations loading failed"));
        img.src = imageUrl;
    });
}

// Main Controller
async function generateImage(prompt, ratioStr) {
    const statusBox = document.getElementById('generation-status');
    const { hfKey, prodiaKey, sdKey } = getApiKeys();
    const { width, height } = getDimensionsFromRatio(ratioStr);

    function updateStatus(msg) {
        if (statusBox) statusBox.innerText = msg;
        console.log(`[GENERATION ENGINE]: ${msg}`);
    }

    // Try Tier 1: Hugging Face
    try {
        updateStatus("Attempting Hugging Face API...");
        return await generateViaHuggingFace(prompt, hfKey, width, height);
    } catch (err) { console.warn("HF Failed:", err.message); }

    // Try Tier 2: Prodia
    try {
        updateStatus("Attempting Prodia API...");
        return await generateViaProdia(prompt, prodiaKey, ratioStr);
    } catch (err) { console.warn("Prodia Failed:", err.message); }

    // Try Tier 3: Stable Diffusion
    try {
        updateStatus("Attempting Stable Diffusion...");
        return await generateViaStableDiffusion(prompt, sdKey, width, height);
    } catch (err) { console.warn("SD Failed:", err.message); }

    // Try Tier 4: Pollinations AI (100% Guaranteed)
    try {
        updateStatus("Falling back to Pollinations AI...");
        return await generateViaPollinations(prompt, width, height);
    } catch (err) {
        updateStatus("Generation failed across all endpoints.");
        throw err;
    }
}

// Submit Event
async function handlePromptSubmit(event) {
    if (event) event.preventDefault();

    const promptInput = document.getElementById('prompt-input');
    const aspectSelect = document.getElementById('aspect-ratio') || document.getElementById('aspect-select');
    const imageOutput = document.getElementById('generated-image-output');
    const generateBtn = document.getElementById('generate-btn');

    if (!promptInput) return;

    const prompt = promptInput.value.trim();
    const ratioStr = aspectSelect ? aspectSelect.value : '1:1';

    if (!prompt) {
        alert("Kripya prompt enter karein!");
        return;
    }

    try {
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.innerText = 'Generating...';
        }

        const finalUrl = await generateImage(prompt, ratioStr);

        if (imageOutput) {
            imageOutput.src = finalUrl;
            imageOutput.style.display = 'block';
        }

        saveToHistory(prompt, finalUrl, ratioStr);
        renderHistory();

    } catch (error) {
        alert("Image generate nahi hosaki. Please try again.");
    } finally {
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerText = 'Generate Image';
        }
    }
}

function saveToHistory(prompt, url, ratio) {
    const history = JSON.parse(localStorage.getItem('cyber_history')) || [];
    history.unshift({ prompt, url, ratio, timestamp: new Date().toISOString() });
    localStorage.setItem('cyber_history', JSON.stringify(history.slice(0, 20)));
}

function renderHistory() {
    const historyContainer = document.getElementById('history-container');
    if (!historyContainer) return;

    const history = JSON.parse(localStorage.getItem('cyber_history')) || [];
    historyContainer.innerHTML = history.map(item => `
        <div class="history-card">
            <img src="${item.url}" alt="${item.prompt}">
            <p><strong>${item.ratio || '1:1'}</strong> - ${item.prompt}</p>
        </div>
    `).join('');
}

/* ==========================================================================
   SET.HTML LOGIC (SAVE API KEYS & THEME)
   ========================================================================== */

function setupSetPage() {
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};

    // Auto-fill existing settings
    const hfInput = document.getElementById('hf-key-input');
    const prodiaInput = document.getElementById('prodia-key-input');
    const sdInput = document.getElementById('sd-key-input');
    const themeSelect = document.getElementById('theme-select');
    const saveBtn = document.getElementById('save-settings-btn');

    if (hfInput) hfInput.value = settings.hfKey || '';
    if (prodiaInput) prodiaInput.value = settings.prodiaKey || '';
    if (sdInput) sdInput.value = settings.sdKey || '';
    if (themeSelect) themeSelect.value = settings.theme || 'dark';

    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const updatedSettings = {
                hfKey: hfInput ? hfInput.value.trim() : '',
                prodiaKey: prodiaInput ? prodiaInput.value.trim() : '',
                sdKey: sdInput ? sdInput.value.trim() : '',
                theme: themeSelect ? themeSelect.value : 'dark'
            };
            localStorage.setItem('cyber_settings', JSON.stringify(updatedSettings));
            applySavedTheme();
            alert('Settings successfully save hogayi hain!');
        });
    }
}

/* ==========================================================================
   INDEX.HTML LOGIC (AUTH CHECK & SIMPLE LOGIN)
   ========================================================================== */

function setupAuthPage() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('cyber_user', JSON.stringify({ isLoggedIn: true }));
            window.location.href = 'gen.html';
        });
    }
}
