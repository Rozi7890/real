// Разпознаване на текст от изображение с Tesseract
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
    const sentences = text.match(/[^.!?]+[.!?]/g) || [text]; // Разделяне на текста на изречения
    if (sentences.length <= 2) return text; // Ако има само едно изречение, връща целия текст

    const wordFrequency = {};
    text.toLowerCase().split(/\s+/).forEach(word => {
        word = word.replace(/[^а-яa-z]/gi, ''); // Премахване на специални символи
        if (word.length > 3) {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        }
    });

    // Оценяване на изреченията според честотата на думите
    const sentenceScores = sentences.map(sentence => {
        const words = sentence.toLowerCase().split(/\s+/);
        const score = words.reduce((sum, word) => sum + (wordFrequency[word] || 0), 0);
        return { sentence, score };
    });

    // Подреждаме изреченията по оценка и вземаме най-важните
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

// Конвертиране на обобщения текст в аудио с Voice RSS
document.getElementById('convertToAudioButton').addEventListener('click', function () {
    const summaryText = document.getElementById('summaryText').textContent;
    const audioPlayer = document.getElementById('audioPlayer');

    if (!summaryText) {
        alert('Няма обобщен текст за конвертиране в аудио!');
        return;
    }

    // Постави твоят Voice RSS API ключ тук
    const apiKey = 'c7e7512d876444aa933c2a0a21f6ad8b';
    const voiceUrl = `https://api.voicerss.org/?key=${apiKey}&hl=bg-bg&src=${encodeURIComponent(summaryText)}&c=MP3`;

    // Зареждаме аудиото в плейъра
    audioPlayer.src = voiceUrl;
    audioPlayer.play().catch(error => {
        console.error('Грешка при пускане на аудиото:', error);
        alert('Грешка при зареждане на аудиото. Опитайте отново!');
    });
});


