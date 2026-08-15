/* ==========================================================================
   AFS IMG GEN // GEN.JS (Image Generation & Multi-Tier Fallback Engine)
   Link this file ONLY in gen.html: <script src="gen.js"></script>
   ========================================================================== */

// 1. Session Protection Check (Agar user logged in nahi hai toh index.html bhej do)
window.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (!session || !session.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // Saved Theme Apply
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    if (settings.theme === 'light') {
        document.body.classList.add('theme-light');
    }

    // Load History on Page Load
    renderHistory();
});

// Helper to get saved API Keys from set.html (via localStorage)
function getApiKeys() {
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    return {
        hfKey: settings.hfKey || '',
        prodiaKey: settings.prodiaKey || '',
        sdKey: settings.sdKey || ''
    };
}

// 1. TIER 1: HUGGING FACE
async function generateViaHuggingFace(prompt, apiKey) {
    if (!apiKey) throw new Error("Hugging Face API key missing");
    
    const response = await fetch("https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev", {
        headers: { 
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json" 
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) throw new Error(`HF Error: ${response.status}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

// 2. TIER 2: PRODIA API
async function generateViaProdia(prompt, apiKey) {
    if (!apiKey) throw new Error("Prodia API key missing");

    const createRes = await fetch(`https://api.prodia.com/v1/sd/generate?prompt=${encodeURIComponent(prompt)}`, {
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
async function generateViaStableDiffusion(prompt, apiKey) {
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
            height: 1024,
            width: 1024,
            steps: 30,
            samples: 1,
        }),
    });

    if (!response.ok) throw new Error(`Stable Diffusion Error: ${response.status}`);
    const data = await response.json();
    return `data:image/png;base64,${data.artifacts[0].base64}`;
}

// 4. TIER 4: POLLINATIONS AI (FALLBACK SAFETY NET - 100% FREE)
async function generateViaPollinations(prompt) {
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true`;
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(imageUrl);
        img.onerror = () => reject(new Error("Pollinations loading failed"));
        img.src = imageUrl;
    });
}

// MAIN GENERATION CONTROLLER
async function generateImage(prompt) {
    const statusBox = document.getElementById('generation-status');
    const { hfKey, prodiaKey, sdKey } = getApiKeys();

    function updateStatus(msg) {
        if (statusBox) statusBox.innerText = msg;
        console.log(`[FALLBACK ENGINE]: ${msg}`);
    }

    // Try Tier 1
    try {
        updateStatus("Attempting Hugging Face API...");
        return await generateViaHuggingFace(prompt, hfKey);
    } catch (err) { console.warn("HF Failed:", err.message); }

    // Try Tier 2
    try {
        updateStatus("Attempting Prodia API...");
        return await generateViaProdia(prompt, prodiaKey);
    } catch (err) { console.warn("Prodia Failed:", err.message); }

    // Try Tier 3
    try {
        updateStatus("Attempting Stable Diffusion...");
        return await generateViaStableDiffusion(prompt, sdKey);
    } catch (err) { console.warn("SD Failed:", err.message); }

    // Try Tier 4 (Guaranteed Fallback)
    try {
        updateStatus("Falling back to Pollinations AI...");
        return await generateViaPollinations(prompt);
    } catch (err) {
        updateStatus("Generation failed across all endpoints.");
        throw err;
    }
}

// Form Submit Handler for gen.html
async function handlePromptSubmit(event) {
    if (event) event.preventDefault();
    const promptInput = document.getElementById('prompt-input');
    const imageOutput = document.getElementById('generated-image-output');
    const generateBtn = document.getElementById('generate-btn');

    const prompt = promptInput.value.trim();
    if (!prompt) return;

    try {
        if (generateBtn) generateBtn.disabled = true;
        
        const finalUrl = await generateImage(prompt);
        if (imageOutput) imageOutput.src = finalUrl;

        saveToHistory(prompt, finalUrl);
        renderHistory();
    } catch (error) {
        alert("Image generation failed.");
    } finally {
        if (generateBtn) generateBtn.disabled = false;
    }
}

function saveToHistory(prompt, url) {
    const history = JSON.parse(localStorage.getItem('cyber_history')) || [];
    history.unshift({ prompt, url, timestamp: new Date().toISOString() });
    localStorage.setItem('cyber_history', JSON.stringify(history.slice(0, 20)));
}

function renderHistory() {
    const historyContainer = document.getElementById('history-container');
    if (!historyContainer) return;

    const history = JSON.parse(localStorage.getItem('cyber_history')) || [];
    historyContainer.innerHTML = history.map(item => `
        <div class="history-card">
            <img src="${item.url}" alt="${item.prompt}">
            <p>${item.prompt}</p>
        </div>
    `).join('');
}
