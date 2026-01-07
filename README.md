# Eq-Chrome-Extension

A modern, 10-band audio equalizer extension for Google Chrome. Enhance your listening experience with custom presets and fine-tuned frequency control.

## Features
- **10-Band Equalizer**: Control frequencies from 60Hz to 16kHz.
- **Presets**: Bass Boost, Treble Boost, Vocal, Electronic, and Flat.
- **Master Volume**: Boost or lower the overall volume.
- **Persistent Settings**: Your EQ settings are saved automatically.
- **Dark Mode UI**: Sleek, modern interface.

## Installation

Since this is a developer version, you need to install it in "Developer Mode".

1.  **Download/Clone** this repository to a folder on your computer.
2.  Open Google Chrome.
3.  Navigate to `chrome://extensions/`.
4.  Toggle **Developer mode** in the top right corner.
5.  Click the **Load unpacked** button in the top left.
6.  Select the folder where you saved this extension (the folder containing `manifest.json`).

## How to Use

1.  Open any website that plays audio (e.g., YouTube, Spotify Web, SoundCloud).
2.  Start playing audio.
3.  Click the **Eq-Chrome-Extension icon** in your Chrome toolbar.
4.  **Enable** the equalizer using the toggle switch in the top right of the popup.
5.  Select a **Preset** or adjust the **Sliders** manually.
6.  Adjust the **Master Volume** if needed.

## Troubleshooting

- **No Sound?** 
    - Ensure the toggle switch is ON.
    - Refresh the tab playing the audio.
    - Some sites with strict security (DRM) might block capture, though rare for basic audio.
- **Extension Error?**
    - Go to `chrome://extensions`, find the extension, and click "Errors" to see logs.
    - Click the "Refresh" (reload) icon on the extension card to restart it.

## Technical Details (For Developers)

- **Manifest V3**: Uses the latest Chrome Extension architecture.
- **Offscreen Document**: Audio processing happens in an offscreen document to ensure persistence and access to the Web Audio API without keeping a popup open.
