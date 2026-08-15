/* ==========================================================================
   AFS STUDIO // GEN.JS (DYNAMIC API KEYS & ASPECT RATIO INTEGRATED)
   ========================================================================== */

let selectedRatio = '1:1';
let currentImageUrl = '';

// ==========================================================================
// DIRECT DEFAULT API KEYS (Yahan apni direct keys daalein)
// ==========================================================================
const DEFAULT_HF_KEY = "hf_YOUR_HUGGING_FACE_KEY_HERE"; 
const DEFAULT_SD_KEY = "sk-YOUR_STABILITY_AI_KEY_HERE";

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
    
    // UI active state sync
    const allButtons = document.querySelectorAll('.ratio-btn');
    allButtons.forEach(btn => btn.classList.remove('active'));

    if (btnElement) {
        btnElement.classList.add('active');
    } else {
        const targetBtn = document.querySelector(`.ratio-btn[data-ratio="${ratio}"]`);
        if (targetBtn) targetBtn.classList.add('active');
    }
    console.log("[GEN.JS] Selected Aspect Ratio:", selectedRatio);
}

// Aspect Ratio to API Dimensions (Multiples of 64 for exact compatibility)
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

    // Settings se keys uthayen ga, agar blank ho tou DEFAULT_KEYS use hongi
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    const hfApiKey = settings.hfKey || settings.huggingFaceKey || DEFAULT_HF_KEY;
    const sdApiKey = settings.sdKey || settings.stabilityKey || DEFAULT_SD_KEY;
    const prodiaApiKey = settings.prodiaKey || '';

    const dimensions = getDimensions(selectedRatio);

    // Loader UI
    if (genBtn) genBtn.disabled = true;
    if (actionsDiv) actionsDiv.classList.add('hidden');

    imgContainer.innerHTML = `
        <div class="placeholder-content">
            <div class="cyber-icon loading-spin">⚙️</div>
            <p id="loader-status-text">Stage 1: Processing image with ${selectedRatio} aspect ratio...</p>
        </div>
    `;

    let finalImageUrl = null;

    // STEP 1: Hugging Face API
    try {
        updateStatus("Stage 1: Requesting Hugging Face API...");
        finalImageUrl = await callHuggingFace(promptText, hfApiKey, dimensions);
        console.log("[GEN.JS] Success from Hugging Face");
    } catch (err) {
        console.warn("[GEN.JS] Hugging Face failed/skipped, switching to Prodia/Stability...", err.message);
    }

    // STEP 2: Prodia API
    if (!finalImageUrl) {
        try {
            updateStatus("Stage 2: Requesting Prodia API...");
            finalImageUrl = await callProdia(promptText, prodiaApiKey, dimensions);
            console.log("[GEN.JS] Success from Prodia");
        } catch (err) {
            console.warn("[GEN.JS] Prodia failed/skipped, switching to Stability AI...", err.message);
        }
    }

    // STEP 3: Stability AI / Stable Diffusion API
    if (!finalImageUrl) {
        try {
            updateStatus("Stage 3: Requesting Stability AI API...");
            finalImageUrl = await callStableDiffusion(promptText, sdApiKey, dimensions);
            console.log("[GEN.JS] Success from Stability AI");
        } catch (err) {
            console.warn("[GEN.JS] Stability AI failed/skipped, switching to Pollinations AI...", err.message);
        }
    }

    // STEP 4: Pollinations AI (Guaranteed No-Key Local/Fallback Route)
    if (!finalImageUrl) {
        try {
            updateStatus("Routing to Final Backup: Pollinations AI...");
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
        imgContainer.innerHTML = `<img src="${finalImageUrl}" alt="${promptText}" class="generated-render-img" style="aspect-ratio: ${selectedRatio.replace(':', '/')}; object-fit: contain; max-height: 100%; width: 100%;" />`;
        if (actionsDiv) actionsDiv.classList.remove('hidden');

        // Save into LocalStorage History
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
   API PROVIDERS WITH DYNAMIC KEYS & DIMENSIONS
   ========================================================================== */

// 1. Hugging Face Provider
async function callHuggingFace(prompt, apiKey, dimensions) {
    if (!apiKey || apiKey.includes("YOUR_HUGGING_FACE_KEY_HERE")) {
        throw new Error("Hugging Face API Key is missing or invalid.");
    }

    const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
            headers: { 
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({ 
                inputs: prompt,
                parameters: {
                    width: dimensions.width,
                    height: dimensions.height
                }
            }),
        }
    );

    if (!response.ok) throw new Error(`Hugging Face Error Code: ${response.status}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

// 2. Prodia Provider
async function callProdia(prompt, apiKey, dimensions) {
    if (!apiKey) throw new Error("Prodia API Key missing");

    const jobRes = await fetch("https://api.prodia.com/v1/sdxl/generate", {
        method: "POST",
        headers: {
            "X-Prodia-Key": apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            prompt: prompt, 
            model: "sd_xl_base_1.0.safetensors",
            width: dimensions.width,
            height: dimensions.height
        })
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

// 3. Stability AI / Stable Diffusion Provider
async function callStableDiffusion(prompt, apiKey, dimensions) {
    if (!apiKey || apiKey.includes("YOUR_STABILITY_AI_KEY_HERE")) {
        throw new Error("Stability AI API Key is missing or invalid.");
    }

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

    if (!response.ok) throw new Error(`Stability AI Error Code: ${response.status}`);
    const data = await response.json();
    return `data:image/jpeg;base64,${data.artifacts[0].base64}`;
}

// 4. Pollinations AI Provider (Direct Backup Route)
async function callPollinations(prompt, dimensions) {
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 999999);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&seed=${seed}&nologo=true`;

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
    a.download = `AFS-Studio-${selectedRatio.replace(':', 'x')}-${Date.now()}.jpg`;
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
        ratio: selectedRatio,
        timestamp: new Date().toISOString()
    });

    if (history.length > 30) history.pop();
    localStorage.setItem('cyber_history', JSON.stringify(history));
}
