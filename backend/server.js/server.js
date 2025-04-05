// Извличане на OpenAI API ключ от GitHub Secrets
const openAI_API_Key = process.env.OPENAI_API_KEY; // Това ще се извлече от GitHub Actions

if (!openAI_API_Key) {
  console.error('OpenAI API ключът не е зададен!');
  process.exit(1);  // Спира сървъра, ако не е зададен ключа
}

// Няма нужда от .env файл, защото GitHub Secrets ще предостави стойността на ключа

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/summarize', async (req, res) => {
    const { text } = req.body;
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAI_API_Key}`  // Използваме GitHub Secret
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
        console.error('Error during OpenAI request:', err);
        res.status(500).json({ error: 'Грешка при OpenAI заявката.', details: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Бекендът работи на порт ${PORT}`));


