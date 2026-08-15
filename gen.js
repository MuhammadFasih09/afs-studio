/* ==========================================================================
   AFS STUDIO // GEN.JS (FULL FALLBACK & GEN.HTML CONNECTED)
   ========================================================================== */

let selectedRatio = '1:1';
let currentImageUrl = '';

window.addEventListener('DOMContentLoaded', () => {
    console.log("[GEN.JS] Studio initialized successfully.");

    // 1. Session Protection
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (!session || !session.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Global Theme Application
    applySavedTheme();
});

// Apply Theme Saved from Settings
function applySavedTheme() {
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || { theme: 'cyberpunk' };
    if (settings.theme) {
        document.body.classList.remove('theme-dark', 'theme-light', 'theme-cyberpunk');
        document.body.classList.add(`theme-${settings.theme}`);
    }
}

// Aspect Ratio Selector Event
function selectRatio(ratio, btnElement) {
    selectedRatio = ratio;
    document.querySelectorAll('.ratio-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) {
        btnElement.classList.add('active');
    }
}

// Convert Aspect Ratio to Dimensions
function getDimensions(ratio) {
    switch (ratio) {
        case '16:9': return { width: 1280, height: 720 };
        case '9:16': return { width: 720, height: 1280 };
        case '4:3':  return { width: 1024, height: 768 };
        case '1:1':
        default:     return { width: 1024, height: 1024 };
    }
}

/* ==========================================================================
   MAIN GENERATION ENGINE & FALLBACK SYSTEM
   ========================================================================== */

async function generateImage() {
    const promptInput = document.getElementById('prompt-input');
    const promptText = promptInput ? promptInput.value.trim() : '';
    const genBtn = document.getElementById('generate-btn');
    const imgContainer = document.getElementById('image-container');
    const actionsDiv = document.getElementById('output-actions');

    if (!promptText) {
        alert('Aap pehle prompt enter karein!');
        return;
    }

    // Keys from LocalStorage (Saved in set.html)
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    const dimensions = getDimensions(selectedRatio);

    // Loader UI
    if (genBtn) genBtn.disabled = true;
    if (actionsDiv) actionsDiv.classList.add('hidden');

    imgContainer.innerHTML = `
        <div class="placeholder-content">
            <div class="cyber-icon loading-spin">⚙️</div>
            <p id="loader-status-text">Stage 1: Connecting to Hugging Face API...</p>
        </div>
    `;

    let finalImageUrl = null;

    // STEP 1: Hugging Face API
    try {
        updateStatus("Stage 1: Processing via Hugging Face...");
        finalImageUrl = await callHuggingFace(promptText, settings.hfKey);
        console.log("[GEN.JS] Success from Hugging Face");
    } catch (err) {
        console.warn("[GEN.JS] Hugging Face failed, switching to Prodia...", err);
    }

    // STEP 2: Prodia API
    if (!finalImageUrl) {
        try {
            updateStatus("Stage 1 Failed. Stage 2: Requesting Prodia API...");
            finalImageUrl = await callProdia(promptText, settings.prodiaKey);
            console.log("[GEN.JS] Success from Prodia");
        } catch (err) {
            console.warn("[GEN.JS] Prodia failed, switching to Stable Diffusion...", err);
        }
    }

    // STEP 3: Stable Diffusion API
    if (!finalImageUrl) {
        try {
            updateStatus("Stage 2 Failed. Stage 3: Requesting Stable Diffusion...");
            finalImageUrl = await callStableDiffusion(promptText, settings.sdKey, dimensions);
            console.log("[GEN.JS] Success from Stable Diffusion");
        } catch (err) {
            console.warn("[GEN.JS] Stable Diffusion failed, switching to Pollinations AI...", err);
        }
    }

    // STEP 4: Pollinations AI (Guaranteed Fallback)
    if (!finalImageUrl) {
        try {
            updateStatus("Stage 3 Failed. Routing to Final Backup: Pollinations AI...");
            finalImageUrl = await callPollinations(promptText, dimensions);
            console.log("[GEN.JS] Success from Pollinations AI");
        } catch (err) {
            console.error("[GEN.JS] All APIs failed.", err);
        }
    }

    // Reset Button State
    if (genBtn) genBtn.disabled = false;

    // Handle Output Result
    if (finalImageUrl) {
        currentImageUrl = finalImageUrl;
        imgContainer.innerHTML = `<img src="${finalImageUrl}" alt="${promptText}" class="generated-render-img" />`;
        if (actionsDiv) actionsDiv.classList.remove('hidden');

        // Log into Settings History
        saveToHistory(promptText, finalImageUrl);
    } else {
        imgContainer.innerHTML = `
            <div class="placeholder-content">
                <div class="cyber-icon">❌</div>
                <p>Image generation failed across all routes. Please check your network connection.</p>
            </div>
        `;
    }
}

function updateStatus(message) {
    const statusEl = document.getElementById('loader-status-text');
    if (statusEl) statusEl.innerText = message;
}

/* ==========================================================================
   API PROVIDERS
   ========================================================================== */

// 1. Hugging Face Provider
async function callHuggingFace(prompt, apiKey) {
    if (!apiKey) throw new Error("Hugging Face API Key missing in Settings");

    const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
            headers: { Authorization: `Bearer ${apiKey}` },
            method: "POST",
            body: JSON.stringify({ inputs: prompt }),
        }
    );

    if (!response.ok) throw new Error(`Hugging Face Error: ${response.status}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

// 2. Prodia Provider
async function callProdia(prompt, apiKey) {
    if (!apiKey) throw new Error("Prodia API Key missing in Settings");

    const jobRes = await fetch("https://api.prodia.com/v1/sdxl/generate", {
        method: "POST",
        headers: {
            "X-Prodia-Key": apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: prompt, model: "sd_xl_base_1.0.safetensors" })
    });

    if (!jobRes.ok) throw new Error("Prodia Job Failed");
    const jobData = await jobRes.json();

    let status = "queued";
    let imgResult = null;
    let attempts = 0;

    while (status !== "succeeded" && attempts < 12) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await fetch(`https://api.prodia.com/v1/job/${jobData.job}`, {
            headers: { "X-Prodia-Key": apiKey }
        });
        const statusData = await statusRes.json();
        status = statusData.status;

        if (status === "failed") throw new Error("Prodia generation failed");
        if (status === "succeeded") {
            imgResult = statusData.imageUrl;
            break;
        }
        attempts++;
    }

    if (!imgResult) throw new Error("Prodia request timed out");
    return imgResult;
}

// 3. Stable Diffusion Provider
async function callStableDiffusion(prompt, apiKey, dimensions) {
    if (!apiKey) throw new Error("Stable Diffusion API Key missing in Settings");

    const response = await fetch(
        "https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                text_prompts: [{ text: prompt }],
                cfg_scale: 7,
                height: dimensions.height > 1024 ? 1024 : dimensions.height,
                width: dimensions.width > 1024 ? 1024 : dimensions.width,
                steps: 30,
                samples: 1,
            }),
        }
    );

    if (!response.ok) throw new Error("Stability AI failed");
    const data = await response.json();
    return `data:image/jpeg;base64,${data.artifacts[0].base64}`;
}

// 4. Pollinations AI Provider (Dynamic Backup)
async function callPollinations(prompt, dimensions) {
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 999999);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=${dimensions.width}&height=${dimensions.height}&nologo=true`;

    const res = await fetch(pollinationsUrl);
    if (!res.ok) throw new Error("Pollinations endpoint offline");

    return pollinationsUrl;
}

/* ==========================================================================
   ACTIONS & HISTORY HELPERS
   ========================================================================== */

function downloadImage() {
    if (!currentImageUrl) return;
    const a = document.createElement('a');
    a.href = currentImageUrl;
    a.download = `AFS-Studio-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function copyImageLink() {
    if (!currentImageUrl) return;
    navigator.clipboard.writeText(currentImageUrl).then(() => {
        alert('Image URL copied to clipboard!');
    }).catch(err => {
        console.error('Could not copy link: ', err);
    });
}

function saveToHistory(prompt, url) {
    let history = JSON.parse(localStorage.getItem('cyber_history')) || [];
    history.unshift({
        prompt: prompt,
        url: url,
        timestamp: new Date().toISOString()
    });

    if (history.length > 30) history.pop();
    localStorage.setItem('cyber_history', JSON.stringify(history));
}
