// audio-graph.js
// Shared Web Audio pipeline used by offscreen.js (Chrome) and capture/capture.js (Firefox).
// Graph: Source -> PreAmp -> Filter[0] -> ... -> Filter[N] -> MasterGain -> Destination

const FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

let audioContext;
let preAmpGain;
let masterGain;
let filters = [];
let source;
let mediaStream;

async function startAudioGraph(stream) {
    await stopAudioGraph();

    mediaStream = stream;
    audioContext = new AudioContext();
    console.log("AudioContext state:", audioContext.state);

    if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log("AudioContext resumed. New state:", audioContext.state);
    }

    source = audioContext.createMediaStreamSource(mediaStream);

    filters = FREQUENCIES.map(freq => {
        const filter = audioContext.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.0;
        filter.gain.value = 0;
        return filter;
    });

    masterGain = audioContext.createGain();
    masterGain.gain.value = 1.0;

    preAmpGain = audioContext.createGain();
    preAmpGain.gain.value = 1.0; // Default 0dB

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
}

async function stopAudioGraph() {
    if (audioContext) {
        await audioContext.close();
        audioContext = null;
    }
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    filters = [];
    console.log("Capture stopped.");
}

function updateFilter(index, value) {
    if (filters[index]) {
        // Value is typically in dB, e.g., -12 to +12
        filters[index].gain.value = value;
    }
}

function updatePreAmp(value) {
    if (preAmpGain) {
        // value is in dB, convert to gain: 10^(dB/20)
        preAmpGain.gain.value = Math.pow(10, value / 20);
    }
}

function updateMaster(value) {
    if (masterGain) {
        // Value is a multiplier, e.g., 0.0 to 2.0
        masterGain.gain.value = value;
    }
}
