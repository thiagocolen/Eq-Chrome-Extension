// shared/weq8-spec-utils.js
//
// Small helpers for moving a WEQ8 spec (an array of band configs) between
// the popup's UI-only WEQ8Runtime and the offscreen document's real one,
// since a live JS object can't be shared across those two documents.

export function applySpecToRuntime(runtime, spec) {
    spec.forEach((band, i) => {
        runtime.setFilterType(i, band.type);
        runtime.setFilterFrequency(i, band.frequency);
        runtime.setFilterQ(i, band.Q);
        runtime.setFilterGain(i, band.gain);
        runtime.toggleBypass(i, band.bypass);
    });
}

export function cloneSpec(spec) {
    return spec.map((band) => ({ ...band }));
}
