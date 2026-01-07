// offscreen/offscreen.js

let audioContext;
let masterGain;
let filters = [];
let source;

const FREQUENCIES = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

let capturedTabId = null;

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'START_CAPTURE') {
        capturedTabId = request.tabId;
        startCapture(request.streamId);
        sendResponse(true);
    } else if (request.type === 'GET_CAPTURED_TAB_ID') {
        sendResponse(capturedTabId);
    } else if (request.type === 'UPDATE_FILTER') {
        updateFilter(request.index, request.value);
    } else if (request.type === 'UPDATE_MASTER') {
        updateMaster(request.value);
    }
});

async function startCapture(streamId) {
    if (audioContext) {
        await audioContext.close();
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
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

        source = audioContext.createMediaStreamSource(stream);

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

        // Connect the graph: Source -> Filter[0] -> ... -> Filter[N] -> MasterGain -> Destination
        let node = source;
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

function updateMaster(value) {
    if (masterGain) {
        // Value is a multiplier, e.g., 0.0 to 2.0
        masterGain.gain.value = value;
    }
}
