// offscreen/offscreen.js

let audioContext;
let preAmpGain;
let masterGain;
let filters = [];
let source;
let mediaStream;

const FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

let capturedTabId = null;

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'START_CAPTURE') {
        capturedTabId = request.tabId;
        startCapture(request.streamId);
        sendResponse(true);
    } else if (request.type === 'STOP_CAPTURE') {
        stopCapture();
        sendResponse(true);
    } else if (request.type === 'GET_CAPTURED_TAB_ID') {
        sendResponse(capturedTabId);
    } else if (request.type === 'UPDATE_FILTER') {
        updateFilter(request.index, request.value);
    } else if (request.type === 'UPDATE_MASTER') {
        updateMaster(request.value);
    } else if (request.type === 'UPDATE_PREAMP') {
        updatePreAmp(request.value);
    }
});

async function stopCapture() {
    if (audioContext) {
        await audioContext.close();
        audioContext = null;
    }
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    capturedTabId = null;
    console.log("Capture stopped.");
}

async function startCapture(streamId) {
    if (audioContext) {
        await audioContext.close();
    }
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }

    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: streamId
                }
            },
            video: false
        });

        audioContext = new AudioContext();
        console.log("AudioContext state:", audioContext.state);

        // Resume context if suspended (common in Chrome)
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
            console.log("AudioContext resumed. New state:", audioContext.state);
        }

        source = audioContext.createMediaStreamSource(mediaStream);

        // Create filters
        filters = FREQUENCIES.map(freq => {
            const filter = audioContext.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1.0;
            filter.gain.value = 0;
            return filter;
        });

        // Create Master Gain
        masterGain = audioContext.createGain();
        masterGain.gain.value = 1.0;

        // Create Pre Amp Gain
        preAmpGain = audioContext.createGain();
        preAmpGain.gain.value = 1.0; // Default 0dB

        // Connect the graph: Source -> PreAmp -> Filter[0] -> ... -> Filter[N] -> MasterGain -> Destination
        let node = source;
        node.connect(preAmpGain);
        node = preAmpGain;

        for (const filter of filters) {
            node.connect(filter);
            node = filter;
        }
        node.connect(masterGain);
        masterGain.connect(audioContext.destination);
        console.log("Audio graph connected and active.");


    } catch (err) {
        console.error('Error starting capture:', err);
    }
}

function updateFilter(index, value) {
    if (filters[index]) {
        // Value is typically in dB, e.g., -12 to +12
        filters[index].gain.value = value;
    }
}

function updatePreAmp(value) {
    if (preAmpGain) {
        // value is in dB, convert to gain
        // 10^(dB/20)
        const gain = Math.pow(10, value / 20);
        preAmpGain.gain.value = gain;
    }
}

function updateMaster(value) {
    if (masterGain) {
        // Value is a multiplier, e.g., 0.0 to 2.0
        masterGain.gain.value = value;
    }
}
