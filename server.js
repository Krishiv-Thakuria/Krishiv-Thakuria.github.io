require('dotenv').config();
const express = require('express');
const app = express();

app.post('/api/gpt', async (req, res) => {
    // API key stored securely in environment variables
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': Bearer ${process.env.OPENAI_API_KEY},
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
});
