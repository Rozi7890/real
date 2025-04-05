// Инициализиране на pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.13.216/pdf.worker.min.js';

// Разпознаване на текст от изображение или PDF
document.getElementById('analyzeButton').addEventListener('click', async function () {
    const fileInput = document.getElementById('fileInput');
    const extractedTextElement = document.getElementById('extractedText');

    if (fileInput.files.length === 0) {
        alert('Моля, качете изображение или PDF файл!');
        return;
    }

    const file = fileInput.files[0];
    const fileType = file.type;

    extractedTextElement.textContent = "Обработване...";

    if (fileType === "application/pdf") {
        extractTextFromPDF(file).then(text => {
            extractedTextElement.textContent = text || 'Не беше намерен текст в PDF файла.';
        }).catch(error => {
            console.error('Грешка при разпознаване на PDF:', error);
            alert('Неуспешно разпознаване на текста от PDF!');
        });
    } else {
        Tesseract.recognize(
            file,
            'bul', // Български език
            { logger: (m) => console.log(m) }
        ).then(({ data: { text } }) => {
            extractedTextElement.textContent = text || 'Не беше намерен текст в изображението.';
        }).catch(error => {
            console.error('Грешка при разпознаване на изображението:', error);
            alert('Неуспешно разпознаване на текста!');
        });
    }
});

// Разпознаване на текст от PDF
async function extractTextFromPDF(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = async function () {
            try {
                const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(reader.result) }).promise;
                let text = "";
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map(item => item.str).join(" ") + " ";
                }
                resolve(text.trim());
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

// 👉 ТУК ВМЪКНИ ТВОЯ APYHUB API КЛЮЧ
const APYHUB_API_KEY = 'APY0U4A3taPQW9hc803Bvbqyqp3XhM4XpPLbpnc2bOUdb2KFqzatMJVXK2gILlRAq6BQtgs'; // <--- смени това

// Обобщаване чрез ApyHub
async function summarizeTextAI(text) {
    const response = await fetch('https://api.apyhub.com/generate/ai/text/summarize', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${APYHUB_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: text,
            type: 'short' // 'short', 'detailed', 'bullets'
        })
    });

    const result = await response.json();
    return result.data || "Грешка при обобщаването.";
}

// Обработка на бутона "Обобщи"
document.getElementById('summarizeButton').addEventListener('click', async function () {
    const extractedText = document.getElementById('extractedText').textContent;
    const summaryElement = document.getElementById('summaryText');

    if (!extractedText || extractedText.includes('качете')) {
        alert('Няма разпознат текст за обобщаване!');
        return;
    }

    summaryElement.textContent = "Обобщаване...";

    try {
        const summarizedText = await summarizeTextAI(extractedText);
        summaryElement.textContent = summarizedText;
    } catch (error) {
        console.error('Грешка при обобщаването:', error);
        summaryElement.textContent = "Грешка при AI обобщаването!";
    }
});

// 👉 ТУК ВМЪКНИ ТВОЯ VOICERSS API КЛЮЧ
const VOICERSS_API_KEY = 'c7e7512d876444aa933c2a0a21f6ad8b'; // <--- смени това

// Превръщане на текста в аудио
document.getElementById('convertToAudioButton').addEventListener('click', function () {
    const summaryText = document.getElementById('summaryText').textContent;
    const audioPlayer = document.getElementById('audioPlayer');

    if (!summaryText) {
        alert('Няма обобщен текст за конвертиране в аудио!');
        return;
    }

    const encodedText = encodeURIComponent(summaryText);
    const ttsUrl = `https://api.voicerss.org/?key=${VOICERSS_API_KEY}&hl=bg-bg&src=${encodedText}&c=MP3&f=44khz_16bit_stereo`;

    audioPlayer.src = ttsUrl;
    audioPlayer.play().catch(error => {
        console.error('Грешка при пускане на аудиото:', error);
        alert('Грешка при зареждане на аудиото. Опитайте отново!');
    });
});







