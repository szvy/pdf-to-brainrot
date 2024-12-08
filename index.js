const uploadArea = document.getElementById('uploadarea');
const chatContainer = document.createElement('div');
chatContainer.setAttribute('id', 'chat-container');
document.body.appendChild(chatContainer);

const GROQ_API_KEY = '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';

uploadArea.innerHTML = '<p>Drag and drop a PDF here or click to upload</p>';

uploadArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    uploadArea.style.borderColor = 'lime';
    uploadArea.style.background = 'rgba(0, 255, 0, 0.1)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'white';
    uploadArea.style.background = 'rgba(255, 255, 255, 0.1)';
});

uploadArea.addEventListener('drop', async (event) => {
    event.preventDefault();
    uploadArea.style.borderColor = 'white';
    uploadArea.style.background = 'rgba(255, 255, 255, 0.1)';
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        await processPDF(files[0]);
    }
});

uploadArea.addEventListener('click', async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf';
    fileInput.onchange = async () => {
        const files = fileInput.files;
        if (files.length > 0) {
            await processPDF(files[0]);
        }
    };
    fileInput.click();
});

async function processPDF(file) {
    if (file.type !== 'application/pdf') {
        alert('Please upload a valid PDF file.');
        return;
    }

    appendMessage('Processing PDF...', 'system');

    try {
        const text = await extractTextFromPDF(file);
        appendMessage('PDF text extracted. Sending to AI...', 'system');
        const aiResponse = await sendToGroqAI(text);
        appendMessage(aiResponse, 'scai');
    } catch (error) {
        console.error(error);
        appendMessage(`Error: ${error.message}`, 'error');
    }
}

async function extractTextFromPDF(file) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

    const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
    const pdf = await loadingTask.promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text;
}

async function sendToGroqAI(text) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "mixtral-8x7b-32768",
            messages: [
                {
                    role: "system",
                    content: "Please convert the following text into using my terms. Please note that I need you to ONLY provide the converted text and nothing else, as if you say more than only the converted text it will break my system. now, im going to just give you a massive list of words for you to add. use these even tho i dont give you a definition. skibidi, gyatt, rizz, only in ohio, duke dennis, did you pray today, livvy dunne rizzing up baby gronk, sussy, imposter, pibby glitch in real life, sigma, alpha, omega, sigma male grindset, andrew tate, gooning, gooner, blud, schlawg, carti, playboi carti, griddy, biggest bird, lightskin stare, keanu reeves, zesty, poggers, smurf cat, dawg, ishowspeed, kai cenat, garten of banban, edging, 1 2 buckle my shoe, goofy ahh, aiden ross, uganded knuckles, do you know da wae, big chungus, dj khaled, oceangate, shadow wizard money gang, ayo, sus, amogus, ice spice, josh hutcherson, metal pipe falling sound, ocky way, sin city, monday left me broken, goated, goated with the sauce, cuteness overload, rose toy, kumalala salvesta, sisyphus, gigachad, based, cringe, no nut november, f in chat, social credit, bing chilling, xbox live, mrbeast, kid named finger, better call saul, i am a surgeon, john pork, wholesome, uncanny, pogchamp, huggy wuggy, nathaniel b, erm what the sigma, sigma meals skibidi slicers, whopper whopper whopper whopper, bussing, foot fetish, i love lean, i like ya cut g, ice spice, fr, 360 no scope, 69, 420, anita max wynn, hawk tuah, aura, before gta 6, beta, bop, bubblegum pink, coffin dance, caseoh, cooked, geeked, buggin, tweakin, max design pro, dababy car, deez nuts, discord, discord mod, dream, duolingo, edging streak, flight (person), flip, fnaf, gail lewis, galvanised square steel, get sturdy, glazing, goat, goonmaxxing, green fn, grind, james charles, jeffery epstein, jelqing, jittleyang, kevin g, lebron, ligma, faze clan, stable ronaldo, lock in, LOW TAPER FADE, imagine if ninja got a LOW TAPER FADE, you know whats crazy? is that low taper fade meme is still massive, mouth breather, munch, cap, npc, nuh uh, oi oi oi baka, baka, pokimane, peter griffin, opp, oil up, rizzler, aj, big justice, double chunk chocolate cookie, chicken bake, we bring the boom, costco guys, tiktok rizz party, unc, whos in parris, fellas in parris, yapping, yap, uwu, all my fellas, AI, chatgpt, ai generated, balkan rage, based, bbl drizzy, big back, bill collector, bombaclat, bro thinks hes carti, canthal tilt, chad, chalant, chat, chat is this real?, chill guy, chill guy who lowkey dont gaf, crashout, cook, cringy, darius, diddy, diddy party, do you like my sword, drake snake, english or spanish, erm actually, fein, fein, fein, fein, fein, fent, fine shyt, chopped shyt, aight shyt, fortnite battlepass, friutsnacks (person), freaky, freak, freakoff, freakbob, galaxy gas, gen alpha, german stare, glizzy, grindset, hear me out, huzz, huzz, huzz, huzz, huzz, huzz, huzz, huzz, huzz, huzz, huzz, huzz, huzz, huzz, I hope they play fein, i like my cheese drippy bruh, ipad kid, fuhulatoogan, jonkler why so feinous, just put the fries in the bag, lil bro, L, W, lunchly, mango, mango, mango, mango, mango, mango phonk, those who know, troll face edit, match my freak, mid, morbin time, morbius, nettspend, no diddy, nonadrenaline, nonchalant dreadhead. also, please just try to talk like you are a part of genz. One more thing, please just sometimes randomly mention rizzing up gyatts in ohio"
                },
                {
                    role: "user",
                    content: text
                }
            ],
            temperature: 0.9,
            max_tokens: 1024,
            stream: false
        })
    });

    if (!response.ok) {
        throw new Error(`Groq API returned an error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

function appendMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.innerHTML = `<p>${text}</p>`;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
