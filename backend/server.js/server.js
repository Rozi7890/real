require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint за обобщаване на текст
app.post('/summarize', async (req, res) => {
    const { text } = req.body;
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Ти си AI, който обобщава текст.' },
                    { role: 'user', content: `Обобщи:\n\n${text}` }
                ],
                max_tokens: 300
            })
        });

        const data = await response.json();
        res.json({ summary: data.choices?.[0]?.message?.content || 'Няма резултат.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Грешка при OpenAI заявката.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Бекендът работи на порт ${PORT}`));

