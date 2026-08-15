/* ==========================================================================
   AFS STUDIO // GEN.JS (API FALLBACK SYSTEM & THEME SYNC)
   ========================================================================== */

// API CONFIGURATIONS (Apni Keys Yahan Add Karein)
const API_KEYS = {
    HUGGING_FACE: "hf_YOUR_HUGGINGFACE_API_KEY_HERE",
    PRODIA: "YOUR_PRODIA_API_KEY_HERE",
    STABLE_DIFFUSION: "sk-YOUR_STABILITY_AI_KEY_HERE"
};

window.addEventListener('DOMContentLoaded', () => {
    console.log("[GEN.JS] Initializing Generator Page...");

    // 1. Session Protection Check
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (!session || !session.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Global Theme Syncing On Load
    applySavedTheme();

    // 3. Form Submit Listener Setup
    const genForm = document.getElementById('gen-form') || document.getElementById('generate-form');
    if (genForm) {
        genForm.addEventListener('submit', handleImageGeneration);
    }
});

// Theme Application Helper
function applySavedTheme() {
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || { theme: 'cyberpunk' };
    if (settings.theme) {
        document.body.classList.remove('theme-dark', 'theme-light', 'theme-cyberpunk');
        document.body.classList.add(`theme-${settings.theme}`);
        console.log(`[GEN.JS] Theme applied: theme-${settings.theme}`);
    }
}

// Main Generation Controller
async function handleImageGeneration(event) {
    if (event) event.preventDefault();

    const promptInput = document.getElementById('gen-prompt') || document.getElementById('prompt-input');
    const promptText = promptInput ? promptInput.value.trim() : '';

    if (!promptText) {
        alert('Please enter a prompt!');
        return;
    }

    showLoader(true, "Initializing Fallback Sequence...");

    let imageUrl = null;

    // STEP 1: Try Hugging Face API
    try {
        updateLoaderStatus("Requesting Stage 1: Hugging Face API...");
        imageUrl = await callHuggingFaceAPI(promptText);
        console.log("[GEN.JS] Success from Hugging Face API");
    } catch (err) {
        console.warn("[GEN.JS] Hugging Face failed, switching to Prodia...", err);
    }

    // STEP 2: Try Prodia API
    if (!imageUrl) {
        try {
            updateLoaderStatus("Stage 1 Failed. Requesting Stage 2: Prodia API...");
            imageUrl = await callProdiaAPI(promptText);
            console.log("[GEN.JS] Success from Prodia API");
        } catch (err) {
            console.warn("[GEN.JS] Prodia failed, switching to Stable Diffusion...", err);
        }
    }

    // STEP 3: Try Stable Diffusion (Stability AI) API
    if (!imageUrl) {
        try {
            updateLoaderStatus("Stage 2 Failed. Requesting Stage 3: Stable Diffusion...");
            imageUrl = await callStableDiffusionAPI(promptText);
            console.log("[GEN.JS] Success from Stable Diffusion API");
        } catch (err) {
            console.warn("[GEN.JS] Stable Diffusion failed, switching to Pollinations AI...", err);
        }
    }

    // STEP 4: Fallback to Pollinations AI (Guaranteed Unlimited Free Route)
    if (!imageUrl) {
        try {
            updateLoaderStatus("Stage 3 Failed. Re-routing to Final Backup: Pollinations AI...");
            imageUrl = await callPollinationsAPI(promptText);
            console.log("[GEN.JS] Success from Pollinations AI");
        } catch (err) {
            console.error("[GEN.JS] All Generation APIs failed.", err);
        }
    }

    showLoader(false);

    // Render & Save Image
    if (imageUrl) {
        displayGeneratedImage(imageUrl, promptText);
        saveToCyberHistory(promptText, imageUrl);
    } else {
        alert("Image generation failed across all fallback endpoints. Please check network or API keys.");
    }
}

/* ==========================================================================
   API PROVIDERS (CHAIN OF RESPONSIBILITY)
   ========================================================================== */

// 1. Hugging Face Provider
async function callHuggingFaceAPI(prompt) {
    if (!API_KEYS.HUGGING_FACE || API_KEYS.HUGGING_FACE.includes("YOUR_")) {
        throw new Error("Hugging Face API Key missing");
    }

    const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
            headers: { Authorization: `Bearer ${API_KEYS.HUGGING_FACE}` },
            method: "POST",
            body: JSON.stringify({ inputs: prompt }),
        }
    );

    if (!response.ok) throw new Error(`Hugging Face Error Status: ${response.status}`);

    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

// 2. Prodia Provider
async function callProdiaAPI(prompt) {
    if (!API_KEYS.PRODIA || API_KEYS.PRODIA.includes("YOUR_")) {
        throw new Error("Prodia API Key missing");
    }

    // Step A: Job Creation
    const jobRes = await fetch("https://api.prodia.com/v1/sdxl/generate", {
        method: "POST",
        headers: {
            "X-Prodia-Key": API_KEYS.PRODIA,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: prompt, model: "sd_xl_base_1.0.safetensors" })
    });

    if (!jobRes.ok) throw new Error("Prodia Job Submission Failed");
    const jobData = await jobRes.json();
    const jobId = jobData.job;

    // Step B: Polling status until completed
    let status = "queued";
    let imgResult = null;
    let attempts = 0;

    while (status !== "succeeded" && attempts < 15) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await fetch(`https://api.prodia.com/v1/job/${jobId}`, {
            headers: { "X-Prodia-Key": API_KEYS.PRODIA }
        });
        const statusData = await statusRes.json();
        status = statusData.status;

        if (status === "failed") throw new Error("Prodia Generation Failed");
        if (status === "succeeded") {
            imgResult = statusData.imageUrl;
            break;
        }
        attempts++;
    }

    if (!imgResult) throw new Error("Prodia Request Timed Out");
    return imgResult;
}

// 3. Stable Diffusion (Stability AI) Provider
async function callStableDiffusionAPI(prompt) {
    if (!API_KEYS.STABLE_DIFFUSION || API_KEYS.STABLE_DIFFUSION.includes("YOUR_")) {
        throw new Error("Stability AI Key missing");
    }

    const response = await fetch(
        "https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${API_KEYS.STABLE_DIFFUSION}`,
            },
            body: JSON.stringify({
                text_prompts: [{ text: prompt }],
                cfg_scale: 7,
                height: 512,
                width: 512,
                steps: 30,
                samples: 1,
            }),
        }
    );

    if (!response.ok) throw new Error("Stability AI API Request Failed");
    const responseJSON = await response.json();
    
    const base64Image = responseJSON.artifacts[0].base64;
    return `data:image/jpeg;base64,${base64Image}`;
}

// 4. Pollinations AI Provider (Dynamic Fallback)
async function callPollinationsAPI(prompt) {
    const encodedPrompt = encodeURIComponent(prompt);
    const randomSeed = Math.floor(Math.random() * 999999);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${randomSeed}&width=1024&height=1024&nologo=true`;

    // Pre-verify image response
    const res = await fetch(pollinationsUrl);
    if (!res.ok) throw new Error("Pollinations Endpoint Unreachable");

    return pollinationsUrl;
}

/* ==========================================================================
   UI HELPER & HISTORY STORAGE
   ========================================================================== */

function displayGeneratedImage(url, prompt) {
    const outputContainer = document.getElementById('gen-output') || document.getElementById('image-result');
    if (outputContainer) {
        outputContainer.innerHTML = `
            <div class="generated-image-card">
                <img src="${url}" alt="${prompt}" class="res-img" />
                <p class="res-prompt">${prompt}</p>
                <a href="${url}" download="afs-studio-render.jpg" target="_blank" class="download-btn">DOWNLOAD IMAGE</a>
            </div>
        `;
    }
}

function saveToCyberHistory(prompt, url) {
    let history = JSON.parse(localStorage.getItem('cyber_history')) || [];
    history.unshift({
        prompt: prompt,
        url: url,
        timestamp: new Date().toISOString()
    });

    // Limit log capacity to latest 30 items
    if (history.length > 30) history.pop();

    localStorage.setItem('cyber_history', JSON.stringify(history));
    console.log("[GEN.JS] Image logged into history successfully.");
}

function showLoader(show, message = "Generating Image...") {
    const loader = document.getElementById('gen-loader');
    const loaderText = document.getElementById('loader-status');
    
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
    if (loaderText) {
        loaderText.innerText = message;
    }
}

function updateLoaderStatus(message) {
    const loaderText = document.getElementById('loader-status');
    if (loaderText) {
        loaderText.innerText = message;
    }
}
