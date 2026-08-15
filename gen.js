/* ==========================================================================
   AFS STUDIO // GEN.JS
   Connected to ONLY: gen.html
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Protection Check
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (!session || !session.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Load Theme
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    if (settings.theme === 'light') {
        document.body.classList.add('theme-light');
    }

    // 3. Attach Submit Listeners
    const genForm = document.getElementById('gen-form');
    const genBtn = document.getElementById('generate-btn');

    if (genForm) {
        genForm.addEventListener('submit', handlePromptSubmit);
    } else if (genBtn) {
        genBtn.addEventListener('click', handlePromptSubmit);
    }

    // 4. Render History
    renderHistory();
});

// Retrieve API Keys Saved from set.html via LocalStorage
function getApiKeys() {
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    return {
        hfKey: settings.hfKey || '',
        prodiaKey: settings.prodiaKey || '',
        sdKey: settings.sdKey || ''
    };
}

// Aspect Ratio to Exact Width and Height Pixel Mapper
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

/* API FALLBACK TIERS */

// Tier 1: Hugging Face FLUX.1
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

// Tier 2: Prodia API
async function generateViaProdia(prompt, apiKey, ratio) {
    if (!apiKey) throw new Error("Prodia API key missing");

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

// Tier 3: Stable Diffusion XL
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

    if (!response.ok) throw new Error(`SD Error: ${response.status}`);
    const data = await response.json();
    return `data:image/png;base64,${data.artifacts[0].base64}`;
}

// Tier 4: Pollinations AI (100% Free Always-Working Fallback)
async function generateViaPollinations(prompt, width, height) {
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(imageUrl);
        img.onerror = () => reject(new Error("Pollinations failed to load"));
        img.src = imageUrl;
    });
}

// Central Generation Controller
async function generateImage(prompt, ratioStr) {
    const statusBox = document.getElementById('generation-status');
    const { hfKey, prodiaKey, sdKey } = getApiKeys();
    const { width, height } = getDimensionsFromRatio(ratioStr);

    function updateStatus(msg) {
        if (statusBox) statusBox.innerText = msg;
        console.log(`[GENERATION ENGINE]: ${msg}`);
    }

    // Attempt Tier 1
    try {
        updateStatus("Generating via Hugging Face API...");
        return await generateViaHuggingFace(prompt, hfKey, width, height);
    } catch (err) { console.warn("HF Failed:", err.message); }

    // Attempt Tier 2
    try {
        updateStatus("Generating via Prodia API...");
        return await generateViaProdia(prompt, prodiaKey, ratioStr);
    } catch (err) { console.warn("Prodia Failed:", err.message); }

    // Attempt Tier 3
    try {
        updateStatus("Generating via Stable Diffusion...");
        return await generateViaStableDiffusion(prompt, sdKey, width, height);
    } catch (err) { console.warn("SD Failed:", err.message); }

    // Attempt Tier 4 (Guaranteed Backup)
    try {
        updateStatus("Generating via Pollinations Engine...");
        return await generateViaPollinations(prompt, width, height);
    } catch (err) {
        updateStatus("Image generation failed across all endpoints.");
        throw err;
    }
}

// Main Event Handler
async function handlePromptSubmit(event) {
    if (event) event.preventDefault();

    const promptInput = document.getElementById('prompt-input');
    const aspectSelect = document.getElementById('aspect-ratio') || document.getElementById('aspect-select');
    const imageOutput = document.getElementById('generated-image-output');
    const generateBtn = document.getElementById('generate-btn');
    const statusBox = document.getElementById('generation-status');

    if (!promptInput) return;

    const prompt = promptInput.value.trim();
    const ratioStr = aspectSelect ? aspectSelect.value : '1:1';

    if (!prompt) {
        alert("Please enter a prompt!");
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

        if (statusBox) statusBox.innerText = "Image generated successfully!";
        saveToHistory(prompt, finalUrl, ratioStr);
        renderHistory();

    } catch (error) {
        alert("Image generation failed. Please try again.");
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
