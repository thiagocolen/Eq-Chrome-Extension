# Eq-Chrome-Extension

A professional-grade, graphical audio equalizer extension for Google Chrome. Built with Manifest V3, the Web Audio API, and [WEQ8](https://github.com/teropa/weq8) for high-fidelity tab-specific sound processing.

## Key Features
- **Graphical 4-Band EQ**: Powered by [WEQ8](https://github.com/teropa/weq8) — drag nodes directly on the frequency-response curve to shape gain, frequency and Q, with a choice of filter types per band (peaking, low/high shelf, low/high pass, bandpass, notch). All 4 bands start bypassed (off) so playback is untouched until you turn one on.
- **Pre Amp Control**: Adjust input gain (-12dB to +12dB) before the signal hits the EQ to prevent digital clipping/distortion.
- **Smart Singleton Mode**: Locks the audio session to a single tab for maximum stability. One tab "owns" the equalizer at a time.
- **Dynamic UI Locking**: Automatically disables the popup on other tabs when a session is active. Includes system notifications to help you find the active EQ tab.
- **Always-On Logic**: Simple "Click-and-Use" behavior. The capture starts as soon as you open the popup on a tab playing audio.
- **Modern Glassmorphism UI**: Neon accents around WEQ8's own dark graph editor.

## Installation

Since this version is for developers/enthusiasts, install it via "Developer Mode":

1.  **Clone/Download** this repository to your local machine.
2.  Open Chrome and go to `chrome://extensions/`.
3.  Turn on **Developer mode** (top right switch).
4.  Click **Load unpacked** and select the folder containing the `manifest.json` file.

The WEQ8 library is already bundled locally under `vendor/weq8/` (required for Manifest V3, which disallows remotely-loaded code), so no build step is needed to run the extension. If you change `build/entry-runtime.js` or `build/entry-ui.js`, regenerate the bundles with:

```bash
npm install
npm run build:weq8
```

## How to Use

1.  Navigate to a tab playing audio (YouTube, Spotify, SoundCloud, etc.).
2.  Click the **Eq-Chrome-Extension icon** in your toolbar.
3.  The capture begins immediately. Use the **Pre Amp** to adjust the input level.
4.  Click a band's toggle to turn it on, then drag its node on the EQ graph to shape the sound. Bands start off, so audio is unaffected until you enable one.
5.  **Note**: If you try to use the extension on a second tab, it will notify you that the EQ is active elsewhere. Refresh or switch back to the original tab to reset.

## Technical Highlights

- **Manifest V3 Architecture**: Secure, efficient, and future-proof — no remotely-hosted code, WEQ8 is bundled locally.
- **Offscreen Processing**: Uses an offscreen document to host the `AudioContext`, keeping the audio engine alive even when the popup is closed.
- **Low Latency**: Direct stream capture ensures no noticeable delay in playback.
- **Auto-Cleanup**: Automatically releases audio tracks and locks when tabs are reloaded or closed.
- **UI/Engine Bridge**: The popup drives a second, silent `WEQ8Runtime` (never connected to any audio source) purely to power the interactive graph; edits are relayed to the real one in the offscreen document via `chrome.runtime.sendMessage`, since a live JS object can't be shared across the two documents.

## Troubleshooting

- **Audio doesn't change?** Refresh the tab playing the audio and open the extension popup again.
- **Locked out?** If you see a notification that EQ is active on another tab, reload that tab or close it to release the lock.
- **Distortion?** Lower the **Pre Amp** slider if you are applying high gain to the Bass or Treble bands.
