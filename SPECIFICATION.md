# Eq-Chrome-Extension Specification (Updated)

## Overview
**Eq-Chrome-Extension** is a high-performance 10-band audio equalizer for Google Chrome and Firefox (Manifest V3). It provides fine-grained control over tab-specific audio profiles, featuring a singleton capture model to ensure stability and precise audio routing.

Chrome and Firefox use different manifests (`manifest.json` / `manifest.firefox.json`, assembled by `build.ps1` into `dist/chrome` and `dist/firefox`) because Firefox has no `chrome.tabCapture` or `chrome.offscreen` equivalent — see "Firefox Audio Capture" below.

## Architecture
The extension utilizes a **Singleton Audio Processing** model with a dynamic locking mechanism.

### Core Components:
1.  **Popup UI (`popup.html`, `popup.js`)**:
    - **Always-On capture**: Automatically initiates audio capture when opened.
    - **10 ISO Standard EQ Bands**: 32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz.
    - **Pre Amp Control**: Input gain adjustment (-12dB to +12dB) applied before the equalizer filters.
    - **Master Volume**: Final output gain adjustment.
    - **Presets**: Includes Bass Boost, Treble Boost, Vocal, Electronic, Treble Reducer, and Super Treble Reducer.

2.  **Service Worker (`background.js`)**:
    - **Singleton Manager**: Tracks the `activeTabId` owning the audio session.
    - **Dynamic UI Locking**: Disables the popup for all tabs except the owner.
    - **Notification System**: Informs users when they attempt to use the extension on a secondary tab.
    - **Auto-Cleanup**: Automatically releases the session if the owner tab is closed or reloaded.

3.  **Offscreen Document (`offscreen.html`, `offscreen.js`)**:
    - **Audio Pipeline**: Headless processing using Web Audio API.
    - **Audio Graph**:
        `Source (Tab Capture)` -> `PreAmp Gain` -> `Biquad Filters (x10)` -> `Master Gain` -> `Destination`.
    - **Media Stream Lifecycle**: Explicitly manages track cleanup to prevent "active stream" conflicts during reloads.

## File Structure

```text
/
├── manifest.json            # Chrome manifest — permissions: tabCapture, offscreen, storage, notifications
├── manifest.firefox.json    # Firefox manifest — no tabCapture/offscreen; browser_specific_settings.gecko.id
├── build.ps1                # Assembles dist/chrome and dist/firefox (each with its own manifest.json)
├── background.js            # Session management & UI coordination (browser.* API, shared)
├── audio-graph.js           # Shared Web Audio pipeline (used by offscreen.js and capture.js)
├── vendor/
│   └── browser-polyfill.js  # mozilla/webextension-polyfill — gives Chrome a promise-based browser.* API
├── assets/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png         # Main neon logo
├── popup/
│   ├── popup.html          # Vertical slider layout
│   ├── popup.css           # Glassmorphism & Neon design
│   └── popup.js            # Capture initiation & UI state (branches Chrome/Firefox)
├── offscreen/               # Chrome only
│   ├── offscreen.html      # Audio processing container
│   └── offscreen.js        # Gets tab stream via chrome.tabCapture, builds the audio graph
└── capture/                 # Firefox only
    ├── capture.html         # Small window hosting the manual capture grant
    └── capture.js           # Gets tab audio via getDisplayMedia, builds the audio graph
```

## Technical Logic

### 1. Tab Capture & Locking
When Tab A initiates capture, `background.js` sets the popup to `""` for all other tabs. Clicking the icon on Tab B triggers `chrome.action.onClicked`, which displays a notification pointing the user to Tab A.

### 2. Audio Processing
- **Filters**: 10 `peaking` BiquadFilterNodes.
- **Pre Amp**: Uses logarithmic gain conversion: `10^(dB/20)`.
- **Latency**: Minimal overhead by using direct `createMediaStreamSource` routing.

### 3. State Management
Settings are persisted per-extension state (not per-tab) to maintain a consistent user experience during the active session.

### 4. Firefox Audio Capture
Firefox's WebExtensions API has no equivalent of `chrome.tabCapture` or `chrome.offscreen` (the latter is unnecessary there anyway, since Firefox's MV3 background scripts are event pages that can use DOM/Web Audio APIs directly, unlike Chrome's service worker).

Instead, on Firefox, `background.js` opens a small dedicated window (`capture/capture.html`) via `browser.windows.create`. That window's `capture.js`:
1. Requires a manual click (real user gesture, since it's a fresh window) that calls `navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })`.
2. The user picks **This Tab** and checks **Share audio** in the browser's own share picker — there is no way to skip this prompt.
3. The video track is discarded immediately; the audio track feeds the same `audio-graph.js` pipeline used by Chrome's offscreen document.
4. The window must stay open for capture to continue; closing it (or the source tab) tears down the graph and unlocks other tabs, mirroring Chrome's auto-cleanup.

## Usage
1. Load as an unpacked extension via `chrome://extensions`.
2. Activate by clicking the extension icon on any tab playing audio.
3. Adjust the **Pre Amp** to prevent clipping when boosting low frequencies.
4. Reloading or closing the tab will reset the extension's singleton lock.
