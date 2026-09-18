// Listen for the user clicking the extension icon in the toolbar
chrome.action.onClicked.addListener((tab) => {
  // Inject the gravity simulation script into the current open webpage
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['gravity.js']
  });
});
