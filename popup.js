// Update text labels dynamically as sliders move
document.getElementById('gravity-slider').addEventListener('input', (e) => {
    document.getElementById('grav-label').innerText = `Gravity Strength: ${e.target.value}`;
    sendConfigToTab();
});

document.getElementById('bounce-slider').addEventListener('input', (e) => {
    document.getElementById('bounce-label').innerText = `Bounciness: ${e.target.value}`;
    sendConfigToTab();
});

// Trigger button injects core engine script if it hasn't run yet
document.getElementById('trigger-btn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['gravity.js']
    }, () => {
        // Send initial configurations right after injection
        sendConfigToTab();
    });
});

// Send physics parameter payloads down to the web page
async function sendConfigToTab() {
    const gVal = parseFloat(document.getElementById('gravity-slider').value);
    const bVal = parseFloat(document.getElementById('bounce-slider').value);
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_PHYSICS', gravity: gVal, bounce: bVal }).catch(() => {
            // Silently catch errors if engine script isn't injected yet
        });
    }
}
