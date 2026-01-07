// popup/popup.js

const PRESETS = {
    'flat': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    'bass-boost': [8, 6, 4, 1, 0, 0, 0, 0, 0, 0],
    'treble-boost': [0, 0, 0, 0, 0, 2, 4, 6, 8, 10],
    'vocal': [-2, -2, -2, 2, 4, 4, 4, 2, 0, 0],
    'electronic': [5, 4, 1, 0, -2, -1, 0, 2, 4, 5],
    'treble-reducer': [0, 0, 0, 0, 0, -2, -4, -6, -8, -10],
    'super-treble-reducer': [0, 0, 0, 0, 0, -6, -12, -12, -12, -12]
};

document.addEventListener('DOMContentLoaded', async () => {
    // UI Elements
    const presetSelect = document.getElementById('presets');
    const sliders = Array.from(document.querySelectorAll('.eq-slider'));
    const preAmpSlider = document.getElementById('pre-amp');
    const masterVolume = document.getElementById('master-volume');

    // Load saved settings
    // Load saved settings
    const storage = await chrome.storage.local.get(['gains', 'master', 'preamp', 'preset']);

    // Init Gains
    const currentGains = storage.gains || PRESETS.flat;
    sliders.forEach((slider, i) => {
        slider.value = currentGains[i];
    });

    // Init Master
    if (storage.master !== undefined) {
        masterVolume.value = storage.master;
    }

    // Init Preset
    if (storage.preset) {
        presetSelect.value = storage.preset;
    }

    // Init Pre Amp
    if (storage.preamp !== undefined) {
        preAmpSlider.value = storage.preamp;
    }

    // Event Listeners
    preAmpSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        updatePreAmp(value);
        saveSettings();
    });

    presetSelect.addEventListener('change', () => {
        const presetName = presetSelect.value;
        if (PRESETS[presetName]) {
            const gains = PRESETS[presetName];
            sliders.forEach((slider, i) => {
                slider.value = gains[i];
                updateFilter(i, gains[i]);
            });
            saveSettings();
        }
    });

    sliders.forEach((slider) => {
        slider.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            const value = parseFloat(e.target.value);
            presetSelect.value = 'custom'; // Switch dropdown to indicate custom
            updateFilter(index, value);
            saveSettings();
        });
    });

    masterVolume.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        updateMaster(value);
        saveSettings();
    });

    // Initial Setup - Always On
    await setupAudioCapture();
});


async function setupAudioCapture() {
    // Send message to Background to ensure Offscreen document exists
    await chrome.runtime.sendMessage({ type: 'ENSURE_OFFSCREEN' });

    // Ask offscreen document if it's already capturing a tab
    const alreadyCapturing = await chrome.runtime.sendMessage({ type: 'GET_CAPTURED_TAB_ID' });

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) return;

    // If we're already capturing this tab, just apply state and exit
    if (alreadyCapturing === tab.id) {
        console.log("Already capturing tab:", tab.id);
        applyState();
        return;
    }

    // We need to get the media stream ID.
    // In MV3, chrome.tabCapture.getMediaStreamId must be called from an extension page.
    chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id }, (streamId) => {
        if (chrome.runtime.lastError) {
            console.error("TabCapture error:", chrome.runtime.lastError.message);
            return;
        }

        console.log("Got streamId:", streamId, "for tab:", tab.id);

        // Send streamId to offscreen document to start capturing
        chrome.runtime.sendMessage({
            type: 'START_CAPTURE',
            streamId: streamId,
            tabId: tab.id
        });

        // Apply current slider values immediately after starting
        applyState();
    });
}

function updateFilter(index, value) {
    chrome.runtime.sendMessage({
        type: 'UPDATE_FILTER',
        index: index,
        value: value
    });
}

function updatePreAmp(value) {
    chrome.runtime.sendMessage({
        type: 'UPDATE_PREAMP',
        value: value
    });
}

function updateMaster(value) {
    chrome.runtime.sendMessage({
        type: 'UPDATE_MASTER',
        value: value
    });
}

function applyState() {
    const sliders = Array.from(document.querySelectorAll('.eq-slider'));
    const preAmp = document.getElementById('pre-amp');
    const master = document.getElementById('master-volume');

    sliders.forEach((s, i) => updateFilter(i, parseFloat(s.value)));
    updatePreAmp(parseFloat(preAmp.value));
    updateMaster(parseFloat(master.value));
}


function saveSettings() {
    const sliders = Array.from(document.querySelectorAll('.eq-slider'));
    const gains = sliders.map(s => parseFloat(s.value));
    const preAmp = parseFloat(document.getElementById('pre-amp').value);
    const master = parseFloat(document.getElementById('master-volume').value);
    const preset = document.getElementById('presets').value;

    chrome.storage.local.set({
        gains,
        master,
        preamp: preAmp,
        preset
    });
}

