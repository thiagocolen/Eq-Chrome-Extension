# Eq-Chrome-Extension Specification (Updated)

## Overview
**Eq-Chrome-Extension** is a high-performance graphical audio equalizer for Google Chrome (Manifest V3). It provides fine-grained control over tab-specific audio profiles, featuring a singleton capture model to ensure stability and precise audio routing, with a 4-band parametric EQ powered by [WEQ8](https://github.com/teropa/weq8).

## Architecture
The extension utilizes a **Singleton Audio Processing** model with a dynamic locking mechanism, plus a **UI/Engine split** required because WEQ8's runtime is a plain JS object that can't be shared across documents.

### Core Components:
1.  **Popup UI (`popup.html`, `popup.js`)**:
    - **Always-On capture**: Automatically initiates audio capture when opened.
    - **`<weq8-ui>` graph editor**: Renders WEQ8's interactive frequency-response graph, backed by a *second*, silent `WEQ8Runtime` instantiated on a throwaway `AudioContext` in the popup — it's never connected to a real source or to speakers, it only exists to drive the graph's math and drag interactions.
    - **4-Band EQ**: `lowshelf12`, 2× `peaking12`, `highshelf12` by default, all bands bypassed (off) until the user toggles one on (any of WEQ8's 14 filter types can be picked per band from the graph UI).
    - **Pre Amp Control**: Input gain adjustment (-12dB to +12dB) applied before the equalizer filters.
    - **Master Volume**: Final output gain adjustment.

2.  **Service Worker (`background.js`)**:
    - **Singleton Manager**: Tracks the `activeTabId` owning the audio session.
    - **Dynamic UI Locking**: Disables the popup for all tabs except the owner.
    - **Notification System**: Informs users when they attempt to use the extension on a secondary tab.
    - **Auto-Cleanup**: Automatically releases the session if the owner tab is closed or reloaded.

3.  **Offscreen Document (`offscreen.html`, `offscreen.js`)**:
    - **Audio Pipeline**: Headless processing using Web Audio API, with a *real* `WEQ8Runtime` doing the actual filtering.
    - **Audio Graph**:
        `Source (Tab Capture)` -> `PreAmp Gain` -> `WEQ8Runtime (4-band filter chain)` -> `Master Gain` -> `Destination`.
    - **Media Stream Lifecycle**: Explicitly manages track cleanup to prevent "active stream" conflicts during reloads.

4.  **Vendored WEQ8 (`vendor/weq8/`)**:
    - Manifest V3's CSP disallows remotely-loaded code, so WEQ8 (and its `lit` / `nanoevents` dependencies) are bundled at build time into two self-contained, dependency-free ES modules with esbuild — one for the runtime only (used by the offscreen document), one with the `<weq8-ui>` custom element too (used by the popup). See `build/` and the `build:weq8` npm script.

## File Structure

```text
/
├── manifest.json            # Permissions: tabCapture, offscreen, storage, notifications
├── background.js           # Session management & UI coordination
├── package.json             # weq8 dependency + esbuild bundling script
├── build/
│   ├── entry-runtime.js    # esbuild entry point: WEQ8Runtime only
│   └── entry-ui.js         # esbuild entry point: WEQ8Runtime + <weq8-ui>
├── vendor/weq8/
│   ├── weq8-runtime.js     # bundled, self-contained (offscreen document)
│   └── weq8-ui.js          # bundled, self-contained (popup)
├── shared/
│   ├── weq8-default-spec.js # default 4-band spec, all bands bypassed
│   └── weq8-spec-utils.js  # apply a full spec to a WEQ8Runtime; clone a spec
├── assets/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png         # Main neon logo
├── popup/
│   ├── popup.html          # Header + <weq8-ui> graph + Pre Amp/Master sliders
│   ├── popup.css           # Glassmorphism & Neon design
│   └── popup.js            # Capture initiation, UI-only WEQ8Runtime
└── offscreen/
    ├── offscreen.html      # Audio processing container
    └── offscreen.js        # Web Audio API implementation, real WEQ8Runtime
```

## Technical Logic

### 1. Tab Capture & Locking
When Tab A initiates capture, `background.js` sets the popup to `""` for all other tabs. Clicking the icon on Tab B triggers `chrome.action.onClicked`, which displays a notification pointing the user to Tab A.

### 2. Audio Processing
- **Filters**: WEQ8's 4-band filter chain (`WEQ8Runtime`), each band independently configurable as any of 14 `BiquadFilterNode`-based filter types. All bands start bypassed (off).
- **Pre Amp**: Uses logarithmic gain conversion: `10^(dB/20)`.
- **Latency**: Minimal overhead by using direct `createMediaStreamSource` routing.

### 3. UI/Engine Bridge
Because the popup and the offscreen document are separate JS documents, a live `WEQ8Runtime` object can't be shared between them:
- The popup owns a **UI-only** `WEQ8Runtime` (silent `AudioContext`, no source, no destination) purely so `<weq8-ui>` has a real runtime to read/mutate for its graph and drag handles.
- Every time the user edits a band, `WEQ8Runtime` emits `filtersChanged` with the full 4-band spec. The popup saves that spec to `chrome.storage.local` and relays it to the offscreen document as a `UPDATE_WEQ8_SPEC` message.
- The offscreen document holds the **real** `WEQ8Runtime`, wired into the live audio graph, and applies every incoming spec to it via `applySpecToRuntime` (`shared/weq8-spec-utils.js`).

### 4. State Management
Settings (`weq8Spec`, `preamp`, `master`) are persisted per-extension state (not per-tab) to maintain a consistent user experience during the active session.

## Usage
1. Load as an unpacked extension via `chrome://extensions`.
2. Activate by clicking the extension icon on any tab playing audio.
3. Adjust the **Pre Amp** to prevent clipping when boosting low frequencies.
4. Reloading or closing the tab will reset the extension's singleton lock.
