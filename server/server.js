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

app.post('/text-to-speech', async (req, res) => {
    const { text } = req.body;

    try {
        const audioResponse = await axios({
            method: 'post',
            url: `https://api.elevenlabs.io/v1/text-to-speech/${process.env.VOICE_ID}`,
            data: {
                text: text,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            },
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY,
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        });

        const filePath = path.join(__dirname, 'output.mp3');
        fs.writeFileSync(filePath, audioResponse.data);
        res.sendFile(filePath);
    } catch (error) {
        console.error('Грешка при текст към реч:', error.response?.data || error.message);
        res.status(500).send('Грешка при текст към реч');
    }
});

app.listen(3000, () => {
    console.log('Сървърът е стартиран на http://localhost:3000');
});
