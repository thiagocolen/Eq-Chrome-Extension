// background.js

// Chrome loads this as a classic service worker (see manifest.json), where
// importScripts is available. Firefox loads it as a plain background script
// (see manifest.firefox.json) that already has a native `browser` global, so
// this guard only ever fires in Chrome.
if (typeof importScripts === 'function' && typeof browser === 'undefined') {
    importScripts('vendor/browser-polyfill.js');
}

// Firefox has no offscreen-document API; it uses a small dedicated window
// (capture/capture.html) to host the audio graph instead. See capture.js.
const isFirefox = typeof browser.offscreen === 'undefined';

let activeTabId = null;
let captureWindowId = null; // Firefox only

// Keep track of the offscreen document state (Chrome only)
let creating;

async function setupOffscreenDocument(path) {
    const existingContexts = await browser.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [browser.runtime.getURL(path)]
    });

    if (existingContexts.length > 0) return;

    if (creating) {
        await creating;
    } else {
        creating = browser.offscreen.createDocument({
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

// Firefox only: open (or reuse) the small window that hosts getDisplayMedia + the audio graph.
async function ensureCaptureWindow(tabId) {
    if (captureWindowId !== null) {
        try {
            await browser.windows.get(captureWindowId);
            return; // already open
        } catch (err) {
            captureWindowId = null; // was closed externally
        }
    }

    const win = await browser.windows.create({
        url: browser.runtime.getURL(`capture/capture.html?tabId=${tabId}`),
        type: 'popup',
        width: 360,
        height: 220
    });
    captureWindowId = win.id;
}

async function closeCaptureWindow() {
    if (captureWindowId !== null) {
        const idToClose = captureWindowId;
        captureWindowId = null;
        try {
            await browser.windows.remove(idToClose);
        } catch (err) {
            // already closed
        }
    }
}

async function updatePopups(ownerTabId) {
    activeTabId = ownerTabId;
    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
        if (ownerTabId === null) {
            // Unlock all tabs
            browser.action.setPopup({ tabId: tab.id, popup: 'popup/popup.html' });
        } else if (tab.id !== ownerTabId) {
            // Lock other tabs
            browser.action.setPopup({ tabId: tab.id, popup: '' });
        }
    }
}

browser.runtime.onInstalled.addListener(() => {
    if (!isFirefox) {
        setupOffscreenDocument('offscreen/offscreen.html');
    }
});

// Handle clicks on locked tabs
browser.action.onClicked.addListener((tab) => {
    if (activeTabId !== null && tab.id !== activeTabId) {
        browser.notifications.create({
            type: 'basic',
            iconUrl: 'assets/icon-128.png',
            title: 'Equalizer Active',
            message: 'The Equalizer is currently active on another tab. Turn it off there to use it here.'
        });
    }
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ENSURE_OFFSCREEN') {
        setupOffscreenDocument('offscreen/offscreen.html').then(() => sendResponse(true));
        return true;
    }

    if (message.type === 'ENSURE_CAPTURE_WINDOW') {
        ensureCaptureWindow(message.tabId).then(() => sendResponse(true));
        return true;
    }

    if (isFirefox && message.type === 'GET_CAPTURED_TAB_ID') {
        // Firefox has no offscreen document to ask, so background answers
        // directly from the singleton lock it already tracks.
        sendResponse(activeTabId);
        return;
    }

    if (message.type === 'START_CAPTURE') {
        updatePopups(message.tabId);
    }

    if (message.type === 'STOP_CAPTURE') {
        updatePopups(null);
        if (isFirefox) {
            closeCaptureWindow();
        }
    }
});

browser.tabs.onRemoved.addListener((tabId) => {
    if (tabId === activeTabId) {
        updatePopups(null);
        if (isFirefox) {
            closeCaptureWindow();
        }
    }
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tabId === activeTabId && changeInfo.status === 'loading') {
        updatePopups(null);
        browser.runtime.sendMessage({ type: 'STOP_CAPTURE' });
    }
});
