// offscreen/offscreen.js (Chrome only — hosts the audio graph in a headless offscreen document)

let capturedTabId = null;

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'START_CAPTURE') {
        capturedTabId = request.tabId;
        startCapture(request.streamId).then(() => sendResponse(true));
        return true;
    } else if (request.type === 'STOP_CAPTURE') {
        stopAudioGraph().then(() => {
            capturedTabId = null;
            sendResponse(true);
        });
        return true;
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

async function startCapture(streamId) {
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

        await startAudioGraph(stream);
    } catch (err) {
        console.error('Error starting capture:', err);
    }
}
