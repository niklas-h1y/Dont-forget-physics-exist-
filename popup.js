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

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (status) => {
        window.postMessage({ type: 'TOGGLE_PHYSICS', enabled: status }, '*');
      },
      args: [isRunning]
    });
  }
});
