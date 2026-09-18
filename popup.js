const toggleBtn = document.getElementById('toggleBtn');

// Liest den Zustand beim Öffnen des Popups aus (Standard ist OFF, falls leer)
chrome.storage.local.get(['physicsEnabled'], async (result) => {
  let isRunning = result.physicsEnabled !== undefined ? result.physicsEnabled : false;
  
  updateButtonUI(isRunning);

  toggleBtn.addEventListener('click', async () => {
    isRunning = !isRunning;
    
    // Speichert den Zustand permanent im Browser
    await chrome.storage.local.set({ physicsEnabled: isRunning });
    updateButtonUI(isRunning);

    // Sendet den Zustand live an die geöffnete GitHub-Seite
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PHYSICS', enabled: isRunning }).catch(() => {});
    }
  });
});

function updateButtonUI(enabled) {
  if (enabled) {
    toggleBtn.textContent = "Engine Status: ON";
    toggleBtn.classList.remove('disabled');
  } else {
    toggleBtn.textContent = "Engine Status: OFF";
    toggleBtn.classList.add('disabled');
  }
}
