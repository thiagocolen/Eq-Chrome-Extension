# Eq-Chrome-Extension

A professional-grade, 10-band audio equalizer extension for Google Chrome. Built with Manifest V3 and the Web Audio API for high-fidelity tab-specific sound processing.

## Key Features
- **Professional 10-Band EQ**: Standard ISO frequencies: `32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz`.
- **Pre Amp Control**: Adjust input gain (-12dB to +12dB) before the signal hits the EQ to prevent digital clipping/distortion.
- **Smart Singleton Mode**: Locks the audio session to a single tab for maximum stability. One tab "owns" the equalizer at a time.
- **Dynamic UI Locking**: Automatically disables the popup on other tabs when a session is active. Includes system notifications to help you find the active EQ tab.
- **Always-On Logic**: Simple "Click-and-Use" behavior. The capture starts as soon as you open the popup on a tab playing audio.
- **7 Professional Presets**: Flat, Bass Boost, Treble Boost, Vocal, Electronic, Treble Reducer, and Super Treble Reducer.
- **Modern Glassmorphism UI**: Neon accents and vertical controls optimized for desktop screens.

## Installation

Since this version is for developers/enthusiasts, install it via "Developer Mode":

1.  **Clone/Download** this repository to your local machine.
2.  Open Chrome and go to `chrome://extensions/`.
3.  Turn on **Developer mode** (top right switch).
4.  Click **Load unpacked** and select the folder containing the `manifest.json` file.

## How to Use

1.  Navigate to a tab playing audio (YouTube, Spotify, SoundCloud, etc.).
2.  Click the **Eq-Chrome-Extension icon** in your toolbar.
3.  The capture begins immediately. Use the **Pre Amp** to adjust the input level.
4.  Fine-tune the frequency bands or select a **Preset**.
5.  **Note**: If you try to use the extension on a second tab, it will notify you that the EQ is active elsewhere. Refresh or switch back to the original tab to reset.

## Technical Highlights

- **Manifest V3 Architecture**: Secure, efficient, and future-proof.
- **Offscreen Processing**: Uses an offscreen document to host the `AudioContext`, keeping the audio engine alive even when the popup is closed.
- **Low Latency**: Direct stream capture ensures no noticeable delay in playback.
- **Auto-Cleanup**: Automatically releases audio tracks and locks when tabs are reloaded or closed.

## Troubleshooting

- **Audio doesn't change?** Refresh the tab playing the audio and open the extension popup again.
- **Locked out?** If you see a notification that EQ is active on another tab, reload that tab or close it to release the lock.
- **Distortion?** Lower the **Pre Amp** slider if you are applying high gain to the Bass or Treble bands.
