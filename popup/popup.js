// popup/popup.js

import { WEQ8Runtime } from '../vendor/weq8/weq8-ui.js';
import { DEFAULT_SPEC } from '../shared/weq8-default-spec.js';
import { cloneSpec } from '../shared/weq8-spec-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    // UI Elements
    const preAmpSlider = document.getElementById('pre-amp');
    const masterVolume = document.getElementById('master-volume');
    const weq8Element = document.querySelector('weq8-ui');

    // Load saved settings
    const storage = await chrome.storage.local.get(['weq8Spec', 'master', 'preamp']);

    const initialSpec = storage.weq8Spec || cloneSpec(DEFAULT_SPEC);

    // A silent, UI-only AudioContext: it drives the WEQ8 graph editor's math
    // (frequency-response curve, drag handles) but is never fed a real audio
    // source or connected to speakers. The actual audio processing happens
    // in the offscreen document's own WEQ8Runtime, kept in sync via messages.
    const uiAudioCtx = new AudioContext();
    const uiRuntime = new WEQ8Runtime(uiAudioCtx, cloneSpec(initialSpec));
    weq8Element.runtime = uiRuntime;

    // Init Master / Pre Amp
    if (storage.master !== undefined) {
        masterVolume.value = storage.master;
    }
    if (storage.preamp !== undefined) {
        preAmpSlider.value = storage.preamp;
    }

    // Event Listeners
    uiRuntime.on('filtersChanged', (spec) => {
        chrome.storage.local.set({ weq8Spec: cloneSpec(spec) });
        chrome.runtime.sendMessage({ type: 'UPDATE_WEQ8_SPEC', spec: cloneSpec(spec) });
    });

    preAmpSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        updatePreAmp(value);
        saveGainSettings();
    });

    masterVolume.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        updateMaster(value);
        saveGainSettings();
    });

    function saveGainSettings() {
        chrome.storage.local.set({
            master: parseFloat(masterVolume.value),
            preamp: parseFloat(preAmpSlider.value)
        });
    }

    // Initial Setup - Always On
    await setupAudioCapture(uiRuntime);
});

async function setupAudioCapture(uiRuntime) {
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
        applyState(uiRuntime);
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

        // Apply current state immediately after starting
        applyState(uiRuntime);
    });
}

function updateWeq8Spec(spec) {
    chrome.runtime.sendMessage({
        type: 'UPDATE_WEQ8_SPEC',
        spec
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

function applyState(uiRuntime) {
    const preAmp = document.getElementById('pre-amp');
    const master = document.getElementById('master-volume');

    updateWeq8Spec(cloneSpec(uiRuntime.spec));
    updatePreAmp(parseFloat(preAmp.value));
    updateMaster(parseFloat(master.value));
}
