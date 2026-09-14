// shared/weq8-default-spec.js
//
// Default 4-band WEQ8 spec the popup and offscreen document start from
// before any saved state exists in chrome.storage.local. All bands start
// bypassed (off) so audio passes through unmodified until the user turns
// a band on from the graph UI.

export const DEFAULT_SPEC = [
    { type: 'lowshelf12', frequency: 100, Q: 0.7, gain: 0, bypass: true },
    { type: 'peaking12', frequency: 500, Q: 1.0, gain: 0, bypass: true },
    { type: 'peaking12', frequency: 3000, Q: 1.0, gain: 0, bypass: true },
    { type: 'highshelf12', frequency: 8000, Q: 0.7, gain: 0, bypass: true },
];
