# Eq-Chrome-Extension Specification

## Overview
**Eq-Chrome-Extension** is a Google Chrome Extension (Manifest V3) that provides a 10-band audio equalizer for the active tab. It allows users to adjust frequency bands to enhance their audio experience while browsing.

## Architecture
The extension uses the **Chrome Extension Manifest V3** architecture.

### Core Components:
1.  **Popup UI (`popup.html`, `popup.js`)**:
    - The user interface containing the Equalizer sliders (e.g., 60Hz, 170Hz, 310Hz, 600Hz, 1kHz, 3kHz, 6kHz, 12kHz, 14kHz, 16kHz).
    - A "Preset" selector (e.g., Bass Boost, Classical, Default).
    - A master volume/gain slider.
    - Communicates with the background/offscreen script to update filter gains.

2.  **Service Worker (`background.js`)**:
    - Handles extension events.
    - Manages the creation and lifecycle of the Offscreen Document.

3.  **Offscreen Document (`offscreen.html`, `offscreen.js`)**:
    - **Crucial for Manifest V3 Audio**: Since Service Workers cannot access the DOM or Web Audio API directly and reliably for streaming, we use an Offscreen Document.
    - Uses `chrome.tabCapture` to capture the audio stream of the current tab.
    - Implements the Web Audio API graph:
        - `SourceNode` (Stream from tab)
        - `BiquadFilterNode` x 10 (Peaking/Shelf filters for each band)
        - `GainNode` (Pre-amp/Master volume)
        - `DestinationNode` (Hardware output)
    - Listens for messages from the Popup to adjust frequency values.

## File Structure

```text
/
├── manifest.json            # Extension configuration
├── background.js           # Service worker (entry point)
├── assets/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── popup/
│   ├── popup.html          # UI Layout
│   ├── popup.css           # UI Styling (Modern, Dark Mode)
│   └── popup.js            # UI Logic & Messaging
└── offscreen/
    ├── offscreen.html      # Headless document for audio processing
    └── offscreen.js        # AudioContext & Equalizer Logic
```

## Detailed Component Specifications

### 1. `manifest.json`
- **Manifest Version**: 3
- **Permissions**:
    - `tabCapture`: To capture tab audio.
    - `offscreen`: To process audio in the background.
    - `storage`: To save user presets/settings.
    - `activeTab`: To access the current tab info.
- **Action**: Defines the popup.
- **Background**: Defines the service worker.

### 2. Offscreen Script (`offscreen.js`)
- Initializes `AudioContext`.
- Listens for a 'START_CAPTURE' message from Background or Popup.
- **Audio Graph**:
    - `StreamSource` -> `Filter[0]` -> `Filter[1]` ... -> `Filter[9]` -> `MasterGain` -> `Context.destination`.

### 3. Popup (`popup.js`)
- On load:
    - Check if audio is already being processed for this tab.
    - Retrieve current gain values from Storage or internal state query.
    - Render sliders.
- On Slider Change:
    - Send message to Runtime (received by Offscreen): `type: 'SET_GAIN', frequency: 60, gain: +5`.
    - Update UI.

## Usage
1. Open Chrome.
2. Navigate to `chrome://extensions`.
3. Enable "Developer Mode".
4. Click "Load Unpacked" and select the extension folder.
5. Go to a tab playing audio and click the extension icon.
