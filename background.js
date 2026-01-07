// background.js

// Keep track of the offscreen document state
let creating;

let activeTabId = null;

async function setupOffscreenDocument(path) {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL(path)]
  });

  if (existingContexts.length > 0) return;

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
      if (!err.message.includes('Only a single offscreen document')) throw err;
    } finally {
      creating = null;
    }
  }
}

function updatePopups(ownerTabId) {
  activeTabId = ownerTabId;
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (ownerTabId === null) {
        // Unlock all tabs
        chrome.action.setPopup({ tabId: tab.id, popup: 'popup/popup.html' });
      } else if (tab.id !== ownerTabId) {
        // Lock other tabs
        chrome.action.setPopup({ tabId: tab.id, popup: '' });
      }
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  setupOffscreenDocument('offscreen/offscreen.html');
});

// Handle clicks on locked tabs
chrome.action.onClicked.addListener((tab) => {
  if (activeTabId !== null && tab.id !== activeTabId) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icon-128.png',
      title: 'Equalizer Active',
      message: 'The Equalizer is currently active on another tab. Turn it off there to use it here.'
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ENSURE_OFFSCREEN') {
    setupOffscreenDocument('offscreen/offscreen.html').then(() => sendResponse(true));
    return true;
  }

  if (message.type === 'START_CAPTURE') {
    updatePopups(message.tabId);
  }

  if (message.type === 'STOP_CAPTURE') {
    updatePopups(null);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId) {
    updatePopups(null);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.status === 'loading') {
    updatePopups(null);
    chrome.runtime.sendMessage({ type: 'STOP_CAPTURE' });
  }
});

