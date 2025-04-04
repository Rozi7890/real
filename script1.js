// Разпознаване на текст от изображение

document.getElementById('analyzeButton').addEventListener('click', function () {
    const imageInput = document.getElementById('imageInput');
    const extractedTextElement = document.getElementById('extractedText');

    if (imageInput.files.length === 0) {
        alert('Моля, качете изображение!');
        return;
    }

    const imageFile = imageInput.files[0];

    Tesseract.recognize(
        imageFile,
        'bul', // Български език
        {
            logger: (m) => console.log(m)
        }
    ).then(({ data: { text } }) => {
        extractedTextElement.textContent = text || 'Не беше намерен текст в изображението.';
        console.log('Разпознат текст:', text);
    }).catch(error => {
        console.error('Грешка при разпознаване:', error);
        alert('Неуспешно разпознаване на текста!');
    });
});

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
                model: "gpt-4-turbo", // Или "gpt-3.5-turbo"
                messages: [
                    { role: "system", content: "Ти си AI, който обобщава текст по ясен и смислен начин." },
                    { role: "user", content: `Обобщи този текст:

${text}` }
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





