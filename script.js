let bleDevice;
let bleCharacteristic;
const serviceUuid = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const characteristicUuid = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

// Load API key from localStorage if it exists
document.getElementById('apiKey').value = localStorage.getItem('openai_api_key') || '';

async function connectBle() {
    try {
        bleDevice = await navigator.bluetooth.requestDevice({
            filters: [{ name: 'CodeCell-BLE' }],
            optionalServices: [serviceUuid]
        });
        
        const server = await bleDevice.gatt.connect();
        const service = await server.getPrimaryService(serviceUuid);
        bleCharacteristic = await service.getCharacteristic(characteristicUuid);
        
        document.getElementById('connectBle').textContent = 'Connected!';
        document.getElementById('statusText').textContent = 'Connected to CodeCell';
        
        // Listen for disconnection
        bleDevice.addEventListener('gattserverdisconnected', onDisconnected);
    } catch (error) {
        console.error('Bluetooth Error:', error);
        document.getElementById('statusText').textContent = 'Connection failed';
    }
}

function onDisconnected() {
    document.getElementById('connectBle').textContent = 'Connect to CodeCell';
    document.getElementById('statusText').textContent = 'Disconnected';
    bleCharacteristic = null;
}

async function sendToBle(text) {
    if (bleCharacteristic) {
        try {
            const encoder = new TextEncoder();
            await bleCharacteristic.writeValue(encoder.encode(text));
            return true;
        } catch (error) {
            console.error('Send Error:', error);
            return false;
        }
    }
    return false;
}

async function makeGptRequest(prompt) {
    const apiKey = document.getElementById('apiKey').value;
    if (!apiKey) {
        alert('Please enter your OpenAI API key');
        return;
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
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

async function handleSendPrompt() {
    const prompt = document.getElementById('prompt').value;
    const responseDiv = document.getElementById('response');
    
    if (!prompt) {
        responseDiv.textContent = 'Please enter a prompt';
        return;
    }
    
    responseDiv.textContent = 'Getting response from GPT...';
    
    try {
        // Get GPT response
        const gptResponse = await makeGptRequest(prompt);
        responseDiv.textContent = gptResponse;
        
        // Send to ESP32 via Bluetooth
        if (bleCharacteristic) {
            await sendToBle('p');  // Send 'p' to trigger sound
            await sendToBle(gptResponse);
        }
    } catch (error) {
        console.error('Error:', error);
        responseDiv.textContent = 'Error processing request';
    }
}

// Save API key to localStorage
document.getElementById('saveKey').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    localStorage.setItem('openai_api_key', apiKey);
    alert('API key saved!');
});

document.getElementById('connectBle').addEventListener('click', connectBle);
document.getElementById('sendPrompt').addEventListener('click', handleSendPrompt);
