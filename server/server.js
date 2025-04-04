require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Маршрут за обобщаване на текст чрез OpenAI
app.post('/summarize', async (req, res) => {
    const { text } = req.body;
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Ти си помощник, който преразказва учебни текстове на лесен, кратък и ясен език за ученици.'
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: 0.7
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
                }
            }
        );
        const summary = response.data.choices[0].message.content;
        res.json({ summary });
    } catch (error) {
        console.error('Грешка при обобщаване:', error.response?.data || error.message);
        res.status(500).send('Грешка при обобщаване');
    }
});

// Маршрут за конвертиране на текст в аудио чрез Voice RSS
app.post('/convert-to-audio', (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).send('Няма текст за конвертиране в аудио');
    }

    const voiceRSSApiKey = process.env.VOICE_RSS_API_KEY;

    // Проверка дали ключът е наличен
    if (!voiceRSSApiKey) {
        return res.status(500).send('API ключът за Voice RSS не е конфигуриран');
    }

    axios.get('https://api.voicerss.org/', {
        params: {
            key: voiceRSSApiKey,
            src: text,
            hl: 'bg-bg', // Български език
            v: 'Eva', // Името на гласа (можеш да го промениш)
            r: '0', // Скорост на говоренето
            c: 'mp3', // Формат на аудиото
            f: '44khz_16bit_stereo', // Качество на аудиото
        }
    })
    .then(response => {
        res.set('Content-Type', 'audio/mpeg');
        res.send(response.data);
    })
    .catch(error => {
        console.error('Грешка при конвертиране на текста в аудио:', error);
        res.status(500).send('Грешка при генериране на аудио');
    });
});

// Слушаме на порт 3000
app.listen(port, () => {
    console.log(`Сървърът работи на http://localhost:${port}`);
});


