// background.js

// Keep track of the offscreen document state
let creating;

async function setupOffscreenDocument(path) {
  // Check if an offscreen document already exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL(path)]
  });

  if (existingContexts.length > 0) {
    return;
  }

  // Create offscreen document
  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['USER_MEDIA'],
      justification: 'Recording tab audio for equalization'
    });
    try {
      await creating;
    } catch (err) {
      if (err.message.includes('Only a single offscreen document')) {
        console.warn('Offscreen document already exists or is being created.');
      } else {
        throw err;
      }
    } finally {
      creating = null;
    }
  }
}

// When extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  setupOffscreenDocument('offscreen/offscreen.html');
});

// Also ensure offscreen document exists when a message is received
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ENSURE_OFFSCREEN') {
    setupOffscreenDocument('offscreen/offscreen.html').then(() => {
      sendResponse(true);
    });
    return true; // Keep channel open for async response
  }
});

