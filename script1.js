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

// Функция за интелигентно обобщаване на текста чрез OpenAI
document.getElementById('summarizeButton').addEventListener('click', function () {
    const extractedText = document.getElementById('extractedText').textContent;
    const summaryElement = document.getElementById('summaryText');

    if (!extractedText || extractedText.includes('качите изображение')) {
        alert('Няма разпознат текст за обобщаване!');
        return;
    }

    // Изпращаме текста към сървъра за обобщаване чрез OpenAI
    fetch('http://localhost:3000/summarize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: extractedText })
    })
    .then(response => {
        if (!response.ok) {
            // Ако отговорът не е успешен, хвърляме грешка
            return response.json().then(errorData => { throw new Error(errorData.error || 'Неизвестна грешка'); });
        }
        return response.json();
    })
    .then(data => {
        summaryElement.textContent = data.summary;
    })
    .catch(error => {
        console.error('Грешка при обобщаване:', error);
        alert('Грешка при обобщаване на текста: ' + error.message);
    });
});

// Конвертиране на обобщен текст в аудио чрез Voice RSS
document.getElementById('convertToAudioButton').addEventListener('click', function () {
    const summaryText = document.getElementById('summaryText').textContent;
    const audioPlayer = document.getElementById('audioPlayer');

    if (!summaryText) {
        alert('Няма обобщен текст за конвертиране в аудио!');
        return;
    }

    // Изпращаме текста към сървъра за преобразуване в аудио (Voice RSS API)
    fetch('http://localhost:3000/convert-to-audio', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: summaryText })
    })
    .then(response => response.blob())
    .then(blob => {
        const url = URL.createObjectURL(blob);
        audioPlayer.src = url;
        audioPlayer.play();
    })
    .catch(error => {
        console.error('Грешка при конвертиране в аудио:', error);
        alert('Грешка при преобразуване на текста в аудио');
    });
});






