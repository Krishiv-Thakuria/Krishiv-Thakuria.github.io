let bleDevice;
let bleCharacteristic;
const serviceUuid = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const characteristicUuid = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

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

async function sendPrompt() {
    const prompt = document.getElementById('prompt').value;
    const responseDiv = document.getElementById('response');
    
    if (!prompt) {
        responseDiv.textContent = 'Please enter a prompt';
        return;
    }
    
    responseDiv.textContent = 'Sending request...';
    
    try {
        // Send 'p' to trigger sound
        await sendToBle('p');
        
        // Send the actual response text
        await sendToBle(prompt);
        
        responseDiv.textContent = `Sent: ${prompt}`;
    } catch (error) {
        console.error('Error:', error);
        responseDiv.textContent = 'Error sending prompt';
    }
}

document.getElementById('connectBle').addEventListener('click', connectBle);
document.getElementById('sendPrompt').addEventListener('click', sendPrompt);
