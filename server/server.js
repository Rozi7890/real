// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

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

app.post('/convert-to-audio', (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).send('Няма текст за конвертиране в аудио');
    }

    const voiceRSSApiKey = process.env.VOICE_RSS_API_KEY;

    axios.get('https://api.voicerss.org/', {
        params: {
            key: voiceRSSApiKey,
            src: text,
            hl: 'bg-bg', // Български език
            v: 'Eva', // Името на гласа (можеш да смениш на друг, ако искаш)
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

app.listen(port, () => {
    console.log(`Сървърът работи на http://localhost:${port}`);
});

app.listen(3000, () => {
    console.log('Сървърът е стартиран на http://localhost:3000');
});
