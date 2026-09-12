// capture/capture.js (Firefox only)
// Hosts a manual getDisplayMedia "share this tab's audio" grant + the audio graph,
// since Firefox has no tabCapture/offscreen API. Opened by background.js as a
// small window; must stay open for the equalizer to keep working.

const params = new URLSearchParams(location.search);
const tabId = parseInt(params.get('tabId'), 10);

const grantBtn = document.getElementById('grant-btn');
const statusEl = document.getElementById('status');

let capturing = false;

grantBtn.addEventListener('click', startCapture);

async function startCapture() {
    grantBtn.disabled = true;
    statusEl.textContent = 'Waiting for you to pick a source...';

    let displayStream;
    try {
        displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    } catch (err) {
        statusEl.textContent = 'Capture cancelled or denied. Try again.';
        grantBtn.disabled = false;
        return;
    }

    const audioTracks = displayStream.getAudioTracks();
    displayStream.getVideoTracks().forEach(track => track.stop());

    if (audioTracks.length === 0) {
        statusEl.textContent = 'No audio was shared - retry and check "Share audio".';
        grantBtn.disabled = false;
        return;
    }

    const audioStream = new MediaStream(audioTracks);
    audioTracks[0].addEventListener('ended', handleSourceEnded);

    await startAudioGraph(audioStream);
    await applyStoredSettings();

    capturing = true;
    grantBtn.hidden = true;
    statusEl.textContent = 'Capturing tab audio - keep this window open.';

    browser.runtime.sendMessage({ type: 'START_CAPTURE', tabId });
}

async function applyStoredSettings() {
    const storage = await browser.storage.local.get(['gains', 'master', 'preamp']);
    (storage.gains || []).forEach((value, index) => updateFilter(index, value));
    if (storage.preamp !== undefined) updatePreAmp(storage.preamp);
    if (storage.master !== undefined) updateMaster(storage.master);
}

function handleSourceEnded() {
    // The user stopped sharing from the browser's own "you are sharing" UI.
    teardown();
    browser.runtime.sendMessage({ type: 'STOP_CAPTURE' });
}

async function teardown() {
    capturing = false;
    await stopAudioGraph();
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'STOP_CAPTURE') {
        teardown().then(() => window.close());
    } else if (message.type === 'UPDATE_FILTER') {
        updateFilter(message.index, message.value);
    } else if (message.type === 'UPDATE_PREAMP') {
        updatePreAmp(message.value);
    } else if (message.type === 'UPDATE_MASTER') {
        updateMaster(message.value);
    }
});

window.addEventListener('beforeunload', () => {
    if (capturing) {
        browser.runtime.sendMessage({ type: 'STOP_CAPTURE' });
    }
});
