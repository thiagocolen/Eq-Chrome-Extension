# Eq-Chrome-Extension

A professional-grade, 10-band audio equalizer extension for Google Chrome and Firefox. Built with Manifest V3 and the Web Audio API for high-fidelity tab-specific sound processing.

## Key Features
- **Professional 10-Band EQ**: Standard ISO frequencies: `32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz`.
- **Pre Amp Control**: Adjust input gain (-12dB to +12dB) before the signal hits the EQ to prevent digital clipping/distortion.
- **Smart Singleton Mode**: Locks the audio session to a single tab for maximum stability. One tab "owns" the equalizer at a time.
- **Dynamic UI Locking**: Automatically disables the panel/popup on other tabs when a session is active. Includes system notifications to help you find the active EQ tab.
- **Always-On Logic**: Simple "Click-and-Use" behavior. The capture starts as soon as you open the panel/popup on a tab playing audio.
- **Chrome Side Panel**: On Chrome, the equalizer opens in the side panel instead of a floating popup, so it stays visible while you browse.
- **7 Professional Presets**: Flat, Bass Boost, Treble Boost, Vocal, Electronic, Treble Reducer, and Super Treble Reducer.
- **Modern Glassmorphism UI**: Neon accents and vertical controls optimized for desktop screens.

## Build

Chrome and Firefox need slightly different manifests and capture code, so a build step assembles a self-contained folder for each:

```powershell
./build.ps1
```

This produces `dist/chrome/` and `dist/firefox/`, each ready to load unpacked.

## Installation

### Chrome / Chromium (Edge, Brave, etc.)

1.  **Clone/Download** this repository and run `./build.ps1`.
2.  Open Chrome and go to `chrome://extensions/`.
3.  Turn on **Developer mode** (top right switch).
4.  Click **Load unpacked** and select the `dist/chrome` folder.

### Firefox

1.  Run `./build.ps1` if you haven't already.
2.  Open `about:debugging#/runtime/this-firefox`.
3.  Click **Load Temporary Add-on...** and select `dist/firefox/manifest.json`.
4.  Firefox unloads temporary add-ons on restart — you'll need to reload it each session, unless you [self-distribute a signed build via AMO](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/).

**Firefox limitation**: Firefox's WebExtensions API has no equivalent of Chrome's `tabCapture`, so there's no silent, one-click way to grab a tab's audio there. Instead, starting capture opens a small "Eq Tab Audio Capture" window — click its button and, in the browser's share picker, choose **This Tab** (or the matching window) with **Share audio** checked. That window has to stay open for the equalizer to keep working. This is a platform limitation, not a bug.

## How to Use

1.  Navigate to a tab playing audio (YouTube, Spotify, SoundCloud, etc.).
2.  Click the **Eq-Chrome-Extension icon** in your toolbar.
3.  **Chrome**: the side panel opens and capture begins immediately. **Firefox**: a capture window opens — click its button and grant tab-audio sharing (see above).
4.  Use the **Pre Amp** to adjust the input level, then fine-tune the frequency bands or select a **Preset**.
5.  **Note**: If you try to use the extension on a second tab, it will notify you that the EQ is active elsewhere. Refresh or switch back to the original tab to reset.

## Technical Highlights

- **Manifest V3 Architecture**: Secure, efficient, and future-proof.
- **Cross-Browser Core**: `background.js`/`popup.js` use the [`browser.*`](https://github.com/mozilla/webextension-polyfill) promise API (vendored in `vendor/`) so the same code runs on both browsers; only the audio-capture entry point differs.
- **Chrome — Offscreen Processing**: Uses `chrome.tabCapture` + an offscreen document to host the `AudioContext`, keeping the audio engine alive even when the popup is closed.
- **Firefox — Capture Window**: Since Firefox has neither `tabCapture` nor `offscreen`, a small dedicated window hosts a manual `getDisplayMedia` "share this tab" grant + the same `AudioContext` graph (shared via `audio-graph.js`).
- **Low Latency**: Direct stream capture ensures no noticeable delay in playback.
- **Auto-Cleanup**: Automatically releases audio tracks and locks when tabs are reloaded or closed.

## Troubleshooting

- **Audio doesn't change?** Refresh the tab playing the audio and open the extension popup again.
- **Locked out?** If you see a notification that EQ is active on another tab, reload that tab or close it to release the lock.
- **Distortion?** Lower the **Pre Amp** slider if you are applying high gain to the Bass or Treble bands.
