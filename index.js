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
                    content: "Please convert the following text into using my terms. Please note that I need you to ONLY provide the converted text and nothing else, as if you say more than only the converted text it will break my system. I have provided you a list of terms and their definitons in the format of '{term} - {definiton}'. These are the terms, 'skibidi - good','ohio - bad','rizz - shorter version of charisma','mew - an excersize to improve your jawline','mog - to look better when compared to someone else','fanum tax - stealing someones food','gyatt - someones anus', also, please just try to talk like you are a part of genz. One more thing, please just sometimes randomly mention rizzing up gyatts in ohio"
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
