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

// Функция за интелигентно обобщаване на текста
function summarizeText(text) {
    const sentences = text.match(/[^.!?]+[.!?]/g) || [text];
    if (sentences.length <= 2) return text;

    const wordFrequency = {};
    text.toLowerCase().split(/\s+/).forEach(word => {
        word = word.replace(/[^а-яa-z]/gi, '');
        if (word.length > 3) {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        }
    });
    
    const sentenceScores = sentences.map(sentence => {
        const words = sentence.toLowerCase().split(/\s+/);
        const score = words.reduce((sum, word) => sum + (wordFrequency[word] || 0), 0);
        return { sentence, score };
    });
    
    sentenceScores.sort((a, b) => b.score - a.score);
    
    const summary = sentenceScores.slice(0, Math.min(3, sentenceScores.length)).map(s => s.sentence).join(' ');
    return summary;
}

// Обобщаване на текста
document.getElementById('summarizeButton').addEventListener('click', function () {
    const extractedText = document.getElementById('extractedText').textContent;
    const summaryElement = document.getElementById('summaryText');

    if (!extractedText || extractedText.includes('качите изображение')) {
        alert('Няма разпознат текст за обобщаване!');
        return;
    }

    const summarizedText = summarizeText(extractedText);
    summaryElement.textContent = summarizedText;
});

// Конвертиране в аудио чрез VoiceRSS
document.getElementById('convertToAudioButton').addEventListener('click', function () {
    const summaryText = document.getElementById('summaryText').textContent;
    const audioPlayer = document.getElementById('audioPlayer');

    if (!summaryText) {
        alert('Няма обобщен текст за конвертиране в аудио!');
        return;
    }

    const apiKey = 'c7e7512d876444aa933c2a0a21f6ad8b'; // 🔁 Смени с твоя ключ!
    const encodedText = encodeURIComponent(summaryText);
    const ttsUrl = `https://api.voicerss.org/?key=${apiKey}&hl=bg-bg&src=${encodedText}&c=MP3&f=44khz_16bit_stereo`;

    audioPlayer.src = ttsUrl;
    audioPlayer.play().catch(error => {
        console.error('Грешка при пускане на аудиото:', error);
        alert('Грешка при зареждане на аудиото. Опитайте отново!');
    });
});

