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
            console.error('Грешка при разпознаване:', error);
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
            console.error('Грешка при разпознаване:', error);
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
    const apiKey = "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"; // 🔁 Замени с твоя OpenAI API ключ
    const url = "https://api.openai.com/v1/chat/completions";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4-turbo",
                messages: [
                    { role: "system", content: "Ти си AI, който обобщава текст по ясен и смислен начин." },
                    { role: "user", content: `Обобщи този текст:\n\n${text}` }
                ],
                max_tokens: 300,
                temperature: 0.7
            })
        });

        const result = await response.json();
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

    if (!extractedText || extractedText.includes('качите изображение')) {
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

    const apiKey = 'c7e7512d876444aa933c2a0a21f6ad8b'; // 🔁 Смени с твоя API ключ за VoiceRSS
    const encodedText = encodeURIComponent(summaryText);
    const ttsUrl = `https://api.voicerss.org/?key=${apiKey}&hl=bg-bg&src=${encodedText}&c=MP3&f=44khz_16bit_stereo`;

    audioPlayer.src = ttsUrl;
    audioPlayer.play().catch(error => {
        console.error('Грешка при пускане на аудиото:', error);
        alert('Грешка при зареждане на аудиото. Опитайте отново!');
    });
});





