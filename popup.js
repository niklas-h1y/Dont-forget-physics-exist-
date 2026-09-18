let isRunning = true;
const toggleBtn = document.getElementById('toggleBtn');

toggleBtn.addEventListener('click', async () => {
  isRunning = !isRunning;
  if (isRunning) {
    toggleBtn.textContent = "Engine Status: ON";
    toggleBtn.classList.remove('disabled');
  } else {
    toggleBtn.textContent = "Engine Status: OFF";
    toggleBtn.classList.add('disabled');
  }

  // Nutzt sendMessage anstelle des blockierten executeScript
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PHYSICS', enabled: isRunning }).catch(() => {
      // Ignoriert Fehler, falls die Seite noch lädt
    });
  }
});
