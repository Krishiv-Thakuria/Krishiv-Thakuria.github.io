const OPENAI_API_KEY = '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';  // Your API key here

async function makeGptRequest(prompt) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: prompt
                }]
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('GPT API Error:', error);
        return 'Error: Could not get response from GPT';
    }
}
