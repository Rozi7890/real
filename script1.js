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
        // Разпознаване на текст от PDF
        extractTextFromPDF(file).then(text => {
            extractedTextElement.textContent = text || 'Не беше намерен текст в PDF файла.';
        }).catch(error => {
            console.error('Грешка при разпознаване на PDF:', error);
            alert('Неуспешно разпознаване на текста от PDF!');
        });
    } else {
        // Разпознаване на текст от изображение с Tesseract.js
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

// Функция за разпознаване на текст от PDF (използва pdf.js)
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

// Функция за AI обобщение
async function summarizeTextAI(text) {
    // ВАЖНО: Замени YOUR_OPENAI_API_KEY с валиден ключ!
    const apiKey = "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";  
    const url = "https://api.openai.com/v1/chat/completions";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                // Ако нямаш достъп до GPT-4, използвай "gpt-3.5-turbo"
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Ти си AI, който обобщава текст по ясен и смислен начин." },
                    { role: "user", content: `Обобщи този текст:\n\n${text}` }
                ],
                max_tokens: 300,
                temperature: 0.7
            })
        });

        console.log('OpenAI API status:', response.status);
        const result = await response.json();
        console.log('OpenAI API response:', result);

        // Проверка дали API връща грешка
        if (response.status !== 200) {
            return "Грешка при обобщаването: " + (result.error ? result.error.message : "Неизвестна грешка.");
        }
        return result.choices?.[0]?.message?.content || "Грешка при обобщаването.";
    } catch (error) {
        console.error("Грешка при AI обобщаването:", error);
        return "Неуспешно обобщение.";
    }
}

// Обобщаване на текста
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
        summaryElement.textContent = "Грешка при AI обобщаването!";
    }
});

// Конвертиране в аудио чрез VoiceRSS
document.getElementById('convertToAudioButton').addEventListener('click', function () {
    const summaryText = document.getElementById('summaryText').textContent;
    const audioPlayer = document.getElementById('audioPlayer');

    if (!summaryText) {
        alert('Няма обобщен текст за конвертиране в аудио!');
        return;
    }

    // ВАЖНО: Замени YOUR_VOICERSS_API_KEY с твоя валиден ключ!
    const apiKey = 'c7e7512d876444aa933c2a0a21f6ad8b';
    const encodedText = encodeURIComponent(summaryText);
    const ttsUrl = `https://api.voicerss.org/?key=${apiKey}&hl=bg-bg&src=${encodedText}&c=MP3&f=44khz_16bit_stereo`;

    audioPlayer.src = ttsUrl;
    audioPlayer.play().catch(error => {
        console.error('Грешка при пускане на аудиото:', error);
        alert('Грешка при зареждане на аудиото. Опитайте отново!');
    });
});







