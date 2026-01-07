// popup/popup.js

const PRESETS = {
    'flat': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    'bass-boost': [8, 6, 4, 1, 0, 0, 0, 0, 0, 0],
    'treble-boost': [0, 0, 0, 0, 0, 2, 4, 6, 8, 10],
    'vocal': [-2, -2, -2, 2, 4, 4, 4, 2, 0, 0],
    'electronic': [5, 4, 1, 0, -2, -1, 0, 2, 4, 5],
    'treble-reducer': [0, 0, 0, 0, 0, -2, -4, -6, -8, -10],
    'super-treble-reducer': [0, 0, 0, 0, 0, -4, -8, -12, -12, -12]
};

document.addEventListener('DOMContentLoaded', async () => {
    // UI Elements
    const powerToggle = document.getElementById('power-toggle');
    const presetSelect = document.getElementById('presets');
    const sliders = Array.from(document.querySelectorAll('.eq-slider'));
    const masterVolume = document.getElementById('master-volume');

    // Load saved settings
    const storage = await chrome.storage.local.get(['gains', 'master', 'preset', 'enabled']);

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

    // Init Power
    powerToggle.checked = storage.enabled !== false; // Default true

    // Event Listeners
    powerToggle.addEventListener('change', () => {
        saveSettings();
        if (powerToggle.checked) {
            setupAudioCapture();
        } else {
            // Logic to bypass or disable?
            // For this simple version, turning off might just mean resetting gains to flat or stopping capture.
            // A true "bypass" requires connecting Source straight to Destination in Offscreen.
            // For now, we will just set listeners to "flat" if disabled, but visually keep sliders?
            // Better: update filters to 0 if disabled.
            applyState();
        }
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

    // Initial Setup
    if (powerToggle.checked) {
        await setupAudioCapture();
    }
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

function updateMaster(value) {
    chrome.runtime.sendMessage({
        type: 'UPDATE_MASTER',
        value: value
    });
}

function applyState() {
    const power = document.getElementById('power-toggle').checked;
    const sliders = Array.from(document.querySelectorAll('.eq-slider'));
    const master = document.getElementById('master-volume');

    if (power) {
        sliders.forEach((s, i) => updateFilter(i, parseFloat(s.value)));
        updateMaster(parseFloat(master.value));
    } else {
        // "Bypass" mode: set all to 0
        sliders.forEach((s, i) => updateFilter(i, 0));
        updateMaster(1.0); // or keep master volume? usually bypass keeps volume.
    }
}

function saveSettings() {
    const sliders = Array.from(document.querySelectorAll('.eq-slider'));
    const gains = sliders.map(s => parseFloat(s.value));
    const master = parseFloat(document.getElementById('master-volume').value);
    const preset = document.getElementById('presets').value;
    const enabled = document.getElementById('power-toggle').checked;

    chrome.storage.local.set({
        gains,
        master,
        preset,
        enabled
    });
}
