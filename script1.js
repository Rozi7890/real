// 👉 Динамична променлива за бекенд URL
const BACKEND_URL = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000'
    : 'https://smartify-backend.onrender.com'; // сложи тук реалния ти URL, ако е различен

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
            'bul',
            { logger: (m) => console.log(m) }
        ).then(({ data: { text } }) => {
            extractedTextElement.textContent = text || 'Не беше намерен текст в изображението.';
        }).catch(error => {
            console.error('Грешка при разпознаване на изображението:', error);
            alert('Неуспешно разпознаване на текста!');
        });
    }
});

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

// Обобщаване чрез бекенд сървъра
async function summarizeTextAI(text) {
    try {
        const response = await fetch(`${BACKEND_URL}/summarize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error('Грешка при обобщаването:', errorMessage);
            alert('Грешка при обобщаването!');
            return null;
        }

        const result = await response.json();
        return result.summary || "Грешка при обобщаването.";
    } catch (err) {
        console.error('Грешка при обобщаването:', err);
        alert('Възникна проблем с обобщаването.');
        return null;
    }
}

document.getElementById('summarizeButton').addEventListener('click', async function () {
    const extractedText = document.getElementById('extractedText').textContent;
    const summaryElement = document.getElementById('summaryText');

    if (!extractedText || extractedText.includes('качете')) {
        alert('Няма разпознат текст за обобщаване!');
        return;
    }

    summaryElement.textContent = "Обобщаване...";

    const summarizedText = await summarizeTextAI(extractedText);
    summaryElement.textContent = summarizedText || "Грешка при обобщаването!";
});

// Преобразуване в аудио чрез бекенд сървъра
document.getElementById('convertToAudioButton').addEventListener('click', async function () {
    const summaryText = document.getElementById('summaryText').textContent;

    if (!summaryText || summaryText.includes('Грешка')) {
        alert('Няма текст за преобразуване в аудио!');
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/convert-to-audio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: summaryText })
        });

        if (!response.ok) {
            console.error('Грешка при преобразуването в аудио');
            alert('Грешка при преобразуването в аудио');
            return;
        }

        const data = await response.json();
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = data.audioUrl;
        audioPlayer.play();
    } catch (error) {
        console.error('Грешка при заявката:', error);
        alert('Проблем с комуникацията със сървъра.');
    }
});



