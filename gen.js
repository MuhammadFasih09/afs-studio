// --- DOMContentLoaded taake HTML load hone ke baad script chale ---
document.addEventListener('DOMContentLoaded', () => {

    // 1. Auth Check
    if (localStorage.getItem('ai_logged_in') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    // 2. Theme Apply on Load
    const savedTheme = localStorage.getItem('ai_theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }

    // 3. DOM Elements
    const generateBtn = document.getElementById('generate-btn');
    const promptInput = document.getElementById('prompt-input');
    const placeholderContent = document.getElementById('placeholder-content');
    const loader = document.getElementById('loader');
    const outputImage = document.getElementById('output-image');
    const downloadBtn = document.getElementById('download-btn');
    const resOptionBtns = document.querySelectorAll('.res-option-btn');

    // 4. Resolution Selection Logic
    let selectedResolution = '512x512';

    resOptionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            resOptionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedResolution = btn.getAttribute('data-res');
        });
    });

    // API Keys Configuration
    const API_KEYS = {
        huggingface: "YAHAN_HUGGINGFACE_KEY_DALO",
        prodia: "YAHAN_PRODIA_KEY_DALO",
        stability: "sk-9JjCnaLaxCT1HWbWegCKIWC5SDmo2tmU4F4Hyt9arPxsIL3a"
    };

    // 5. Generate Button Click Event
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const promptText = promptInput.value.trim();
            if (!promptText) {
                alert('Please enter a prompt first!');
                return;
            }

            // Extract Width and Height
            const imgWidth = parseInt(selectedResolution.split('x')[0]);
            const imgHeight = parseInt(selectedResolution.split('x')[1]);

            // UI Loading State
            if (placeholderContent) placeholderContent.style.display = 'none';
            if (outputImage) outputImage.style.display = 'none';
            if (downloadBtn) downloadBtn.style.display = 'none';
            if (loader) loader.style.display = 'block';
            
            generateBtn.disabled = true;
            generateBtn.textContent = "Generating via AI Network...";

            let imageUrl = null;

            // --- STEP 1: Try Hugging Face ---
            try {
                const response = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${API_KEYS.huggingface}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ 
                        inputs: promptText,
                        parameters: { width: imgWidth, height: imgHeight }
                    })
                });
                if (response.ok) {
                    const blob = await response.blob();
                    imageUrl = URL.createObjectURL(blob);
                }
            } catch (e) {
                console.log("Hugging Face failed, switching to Pollinations...");
            }

            // --- STEP 2: Try Pollinations (Backup) ---
            if (!imageUrl) {
                try {
                    const encodedPrompt = encodeURIComponent(promptText);
                    const pollUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${imgWidth}&height=${imgHeight}`;
                    const imgCheck = new Image();
                    imgCheck.src = pollUrl;
                    await new Promise((resolve, reject) => {
                        imgCheck.onload = resolve;
                        imgCheck.onerror = reject;
                    });
                    imageUrl = pollUrl;
                } catch (e) {
                    console.log("Pollinations failed.");
                }
            }

            // --- Final Result Handling ---
            if (imageUrl) {
                if (loader) loader.style.display = 'none';
                if (outputImage) {
                    outputImage.src = imageUrl;
                    outputImage.style.display = 'block';
                }

                // Show Download Button
                if (downloadBtn) {
                    downloadBtn.style.display = 'inline-flex';
                    downloadBtn.href = imageUrl;
                }

                // Save to History
                const history = JSON.parse(localStorage.getItem('ai_history')) || [];
                const newEntry = {
                    prompt: promptText,
                    image: imageUrl,
                    date: new Date().toLocaleDateString()
                };
                history.unshift(newEntry);
                localStorage.setItem('ai_history', JSON.stringify(history));
            } else {
                alert('Image generation failed. Please try again!');
                if (loader) loader.style.display = 'none';
                if (placeholderContent) placeholderContent.style.display = 'flex';
            }

            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate';
        });
    }
});
                
