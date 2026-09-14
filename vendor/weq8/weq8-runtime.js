// node_modules/weq8/dist/functions.697e57cd.js
function i(s) {
  switch (s) {
    case "lowpass12":
    case "lowpass24":
      return "lowpass";
    case "highpass12":
    case "highpass24":
      return "highpass";
    case "bandpass12":
    case "bandpass24":
      return "bandpass";
    case "lowshelf12":
    case "lowshelf24":
      return "lowshelf";
    case "highshelf12":
    case "highshelf24":
      return "highshelf";
    case "peaking12":
    case "peaking24":
      return "peaking";
    case "notch12":
    case "notch24":
      return "notch";
  }
}
function l(s) {
  switch (s) {
    case "noop":
      return 0;
    case "lowpass12":
    case "highpass12":
    case "bandpass12":
    case "lowshelf12":
    case "highshelf12":
    case "peaking12":
    case "notch12":
      return 1;
    case "lowpass24":
    case "highpass24":
    case "bandpass24":
    case "lowshelf24":
    case "highshelf24":
    case "peaking24":
    case "notch24":
      return 2;
  }
}

// node_modules/weq8/dist/runtime.js
var p = () => ({
  events: {},
  emit(r, ...e) {
    let t = this.events[r] || [];
    for (let i2 = 0, s = t.length; i2 < s; i2++)
      t[i2](...e);
  },
  on(r, e) {
    var t;
    return (t = this.events[r]) != null && t.push(e) || (this.events[r] = [e]), () => {
      var i2;
      this.events[r] = (i2 = this.events[r]) == null ? void 0 : i2.filter((s) => e !== s);
    };
  }
});
var u = [
  "lowpass12",
  "lowpass24",
  "highpass12",
  "highpass24",
  "bandpass12",
  "bandpass24",
  "lowshelf12",
  "lowshelf24",
  "highshelf12",
  "highshelf24",
  "peaking12",
  "peaking24",
  "notch12",
  "notch24"
];
var g = [
  { type: "lowshelf12", frequency: 30, gain: 0, Q: 0.7, bypass: false },
  { type: "peaking12", frequency: 200, gain: 0, Q: 0.7, bypass: false },
  { type: "peaking12", frequency: 1e3, gain: 0, Q: 0.7, bypass: false },
  { type: "highshelf12", frequency: 5e3, gain: 0, Q: 0.7, bypass: false },
  { type: "noop", frequency: 350, gain: 0, Q: 1, bypass: false },
  { type: "noop", frequency: 350, gain: 0, Q: 1, bypass: false },
  { type: "noop", frequency: 350, gain: 0, Q: 1, bypass: false },
  { type: "noop", frequency: 350, gain: 0, Q: 1, bypass: false }
];
var b = class {
  constructor(e, t = g, i2 = u) {
    this.audioCtx = e, this.spec = t, this.supportedFilterTypes = i2, this.filterbank = [], this.input = e.createGain(), this.output = e.createGain(), this.buildFilterChain(t), this.emitter = p();
  }
  connect(e) {
    this.output.connect(e);
  }
  disconnect(e) {
    this.output.disconnect(e);
  }
  on(e, t) {
    return this.emitter.on(e, t);
  }
  setFilterType(e, t) {
    var i2;
    if (t === "noop" && this.spec[e].type !== "noop" && !this.spec[e].bypass ? this.disconnectFilter(e) : t !== "noop" && this.spec[e].type === "noop" && !this.spec[e].bypass && this.connectFilter(e, t), this.spec[e].type = t, t !== "noop" && !this.spec[e].bypass) {
      let s = (i2 = this.filterbank.find((n) => n.idx === e)) == null ? void 0 : i2.filters;
      if (!s)
        throw new Error("Assertion failed: No filters in filterbank");
      for (let n of s)
        n.type = i(t);
      let l2 = l(t);
      for (; s.length > l2; ) {
        let n = s.length - 1, h = s[n], f = s[n - 1], c = this.getNextInChain(e);
        h.disconnect(), f.disconnect(h), f.connect(c), s.splice(n, 1);
      }
      for (; s.length < l2; ) {
        let n = this.audioCtx.createBiquadFilter();
        n.type = i(t), n.frequency.value = this.spec[e].frequency, n.Q.value = this.spec[e].Q, n.gain.value = this.spec[e].gain;
        let h = s[s.length - 1], f = this.getNextInChain(e);
        h.disconnect(f), h.connect(n), n.connect(f), s.push(n);
      }
    }
    this.emitter.emit("filtersChanged", this.spec);
  }
  toggleBypass(e, t) {
    t && !this.spec[e].bypass && this.spec[e].type !== "noop" ? this.disconnectFilter(e) : !t && this.spec[e].bypass && this.spec[e].type !== "noop" && this.connectFilter(e, this.spec[e].type), this.spec[e].bypass = t, this.emitter.emit("filtersChanged", this.spec);
  }
  disconnectFilter(e) {
    var l2;
    let t = (l2 = this.filterbank.find((n) => n.idx === e)) == null ? void 0 : l2.filters;
    if (!t)
      throw new Error("Assertion failed: No filters in filterbank when disconnecting filter. Was it connected?");
    let i2 = this.getPreviousInChain(e), s = this.getNextInChain(e);
    i2.disconnect(t[0]), t[t.length - 1].disconnect(s), i2.connect(s), this.filterbank = this.filterbank.filter((n) => n.idx !== e);
  }
  connectFilter(e, t) {
    let i2 = Array.from({ length: l(t) }, () => {
      let n = this.audioCtx.createBiquadFilter();
      return n.type = i(t), n.frequency.value = this.spec[e].frequency, n.Q.value = this.spec[e].Q, n.gain.value = this.spec[e].gain, n;
    }), s = this.getPreviousInChain(e), l2 = this.getNextInChain(e);
    s.disconnect(l2), s.connect(i2[0]);
    for (let n = 0; n < i2.length - 1; n++)
      i2[n].connect(i2[n + 1]);
    i2[i2.length - 1].connect(l2), this.filterbank.push({ idx: e, filters: i2 });
  }
  setFilterFrequency(e, t) {
    this.spec[e].frequency = t;
    let i2 = this.filterbank.find((s) => s.idx === e);
    if (i2)
      for (let s of i2.filters)
        s.frequency.value = t;
    this.emitter.emit("filtersChanged", this.spec);
  }
  setFilterQ(e, t) {
    this.spec[e].Q = t;
    let i2 = this.filterbank.find((s) => s.idx === e);
    if (i2)
      for (let s of i2.filters)
        s.Q.value = t;
    this.emitter.emit("filtersChanged", this.spec);
  }
  setFilterGain(e, t) {
    this.spec[e].gain = t;
    let i2 = this.filterbank.find((s) => s.idx === e);
    if (i2)
      for (let s of i2.filters)
        s.gain.value = t;
    this.emitter.emit("filtersChanged", this.spec);
  }
  getFrequencyResponse(e, t, i2, s, l2) {
    let n = this.filterbank.find((h) => h.idx === e);
    return n ? (n.filters[t].getFrequencyResponse(i2, s, l2), true) : false;
  }
  buildFilterChain(e) {
    this.filterbank = [];
    for (let t = 0; t < e.length; t++) {
      let i2 = e[t];
      if (i2.type === "noop" || i2.bypass)
        continue;
      let s = Array.from({ length: l(i2.type) }, () => {
        let l2 = this.audioCtx.createBiquadFilter();
        return l2.type = i(i2.type), l2.frequency.value = i2.frequency, l2.Q.value = i2.Q, l2.gain.value = i2.gain, l2;
      });
      this.filterbank.push({ idx: t, filters: s });
    }
    if (this.filterbank.length === 0)
      this.input.connect(this.output);
    else
      for (let t = 0; t < this.filterbank.length; t++) {
        let { filters: i2 } = this.filterbank[t];
        t === 0 ? this.input.connect(i2[0]) : this.filterbank[t - 1].filters[this.filterbank[t - 1].filters.length - 1].connect(i2[0]);
        for (let s = 0; s < i2.length - 1; s++)
          i2[s].connect(i2[s + 1]);
        t === this.filterbank.length - 1 && i2[i2.length - 1].connect(this.output);
      }
  }
  getPreviousInChain(e) {
    let t = this.input, i2 = -1;
    for (let s of this.filterbank)
      s.idx < e && s.idx > i2 && (t = s.filters[s.filters.length - 1], i2 = s.idx);
    return t;
  }
  getNextInChain(e) {
    let t = this.output, i2 = this.spec.length;
    for (let s of this.filterbank)
      s.idx > e && s.idx < i2 && (t = s.filters[0], i2 = s.idx);
    return t;
  }
};
export {
  b as WEQ8Runtime
};
