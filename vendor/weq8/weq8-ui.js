// node_modules/weq8/dist/functions.697e57cd.js
function o(s5) {
  return s5 === "lowshelf12" || s5 === "lowshelf24" || s5 === "highshelf12" || s5 === "highshelf24" || s5 === "peaking12" || s5 === "peaking24";
}
function t(s5) {
  return s5 !== "noop";
}
function r(s5) {
  return s5 === "lowpass12" || s5 === "lowpass24" || s5 === "highpass12" || s5 === "highpass24" || s5 === "bandpass12" || s5 === "bandpass24" || s5 === "peaking12" || s5 === "peaking24" || s5 === "notch12" || s5 === "notch24";
}
function i(s5) {
  switch (s5) {
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
function l(s5) {
  switch (s5) {
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
function g(s5, a3, e8) {
  let n7 = Math.log10(a3), h3 = Math.log10(e8);
  return (Math.log10(c(s5, a3, e8)) - n7) / (h3 - n7);
}
function u(s5, a3, e8) {
  let n7 = Math.log10(a3), h3 = Math.log10(e8);
  return c(Math.pow(10, s5 * (h3 - n7) + n7), a3, e8);
}
function c(s5, a3, e8) {
  return Math.min(Math.max(s5, a3), e8);
}
function f(s5, a3 = false) {
  return s5 >= 1e3 && !a3 ? (s5 / 1e3).toFixed(2) : s5.toFixed(0);
}
function p(s5, a3 = false) {
  return s5 >= 1e3 && !a3 ? "kHz" : "Hz";
}

// node_modules/weq8/dist/runtime.js
var p2 = () => ({
  events: {},
  emit(r5, ...e8) {
    let t6 = this.events[r5] || [];
    for (let i7 = 0, s5 = t6.length; i7 < s5; i7++)
      t6[i7](...e8);
  },
  on(r5, e8) {
    var t6;
    return (t6 = this.events[r5]) != null && t6.push(e8) || (this.events[r5] = [e8]), () => {
      var i7;
      this.events[r5] = (i7 = this.events[r5]) == null ? void 0 : i7.filter((s5) => e8 !== s5);
    };
  }
});
var u2 = [
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
var g2 = [
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
  constructor(e8, t6 = g2, i7 = u2) {
    this.audioCtx = e8, this.spec = t6, this.supportedFilterTypes = i7, this.filterbank = [], this.input = e8.createGain(), this.output = e8.createGain(), this.buildFilterChain(t6), this.emitter = p2();
  }
  connect(e8) {
    this.output.connect(e8);
  }
  disconnect(e8) {
    this.output.disconnect(e8);
  }
  on(e8, t6) {
    return this.emitter.on(e8, t6);
  }
  setFilterType(e8, t6) {
    var i7;
    if (t6 === "noop" && this.spec[e8].type !== "noop" && !this.spec[e8].bypass ? this.disconnectFilter(e8) : t6 !== "noop" && this.spec[e8].type === "noop" && !this.spec[e8].bypass && this.connectFilter(e8, t6), this.spec[e8].type = t6, t6 !== "noop" && !this.spec[e8].bypass) {
      let s5 = (i7 = this.filterbank.find((n7) => n7.idx === e8)) == null ? void 0 : i7.filters;
      if (!s5)
        throw new Error("Assertion failed: No filters in filterbank");
      for (let n7 of s5)
        n7.type = i(t6);
      let l6 = l(t6);
      for (; s5.length > l6; ) {
        let n7 = s5.length - 1, h3 = s5[n7], f3 = s5[n7 - 1], c5 = this.getNextInChain(e8);
        h3.disconnect(), f3.disconnect(h3), f3.connect(c5), s5.splice(n7, 1);
      }
      for (; s5.length < l6; ) {
        let n7 = this.audioCtx.createBiquadFilter();
        n7.type = i(t6), n7.frequency.value = this.spec[e8].frequency, n7.Q.value = this.spec[e8].Q, n7.gain.value = this.spec[e8].gain;
        let h3 = s5[s5.length - 1], f3 = this.getNextInChain(e8);
        h3.disconnect(f3), h3.connect(n7), n7.connect(f3), s5.push(n7);
      }
    }
    this.emitter.emit("filtersChanged", this.spec);
  }
  toggleBypass(e8, t6) {
    t6 && !this.spec[e8].bypass && this.spec[e8].type !== "noop" ? this.disconnectFilter(e8) : !t6 && this.spec[e8].bypass && this.spec[e8].type !== "noop" && this.connectFilter(e8, this.spec[e8].type), this.spec[e8].bypass = t6, this.emitter.emit("filtersChanged", this.spec);
  }
  disconnectFilter(e8) {
    var l6;
    let t6 = (l6 = this.filterbank.find((n7) => n7.idx === e8)) == null ? void 0 : l6.filters;
    if (!t6)
      throw new Error("Assertion failed: No filters in filterbank when disconnecting filter. Was it connected?");
    let i7 = this.getPreviousInChain(e8), s5 = this.getNextInChain(e8);
    i7.disconnect(t6[0]), t6[t6.length - 1].disconnect(s5), i7.connect(s5), this.filterbank = this.filterbank.filter((n7) => n7.idx !== e8);
  }
  connectFilter(e8, t6) {
    let i7 = Array.from({ length: l(t6) }, () => {
      let n7 = this.audioCtx.createBiquadFilter();
      return n7.type = i(t6), n7.frequency.value = this.spec[e8].frequency, n7.Q.value = this.spec[e8].Q, n7.gain.value = this.spec[e8].gain, n7;
    }), s5 = this.getPreviousInChain(e8), l6 = this.getNextInChain(e8);
    s5.disconnect(l6), s5.connect(i7[0]);
    for (let n7 = 0; n7 < i7.length - 1; n7++)
      i7[n7].connect(i7[n7 + 1]);
    i7[i7.length - 1].connect(l6), this.filterbank.push({ idx: e8, filters: i7 });
  }
  setFilterFrequency(e8, t6) {
    this.spec[e8].frequency = t6;
    let i7 = this.filterbank.find((s5) => s5.idx === e8);
    if (i7)
      for (let s5 of i7.filters)
        s5.frequency.value = t6;
    this.emitter.emit("filtersChanged", this.spec);
  }
  setFilterQ(e8, t6) {
    this.spec[e8].Q = t6;
    let i7 = this.filterbank.find((s5) => s5.idx === e8);
    if (i7)
      for (let s5 of i7.filters)
        s5.Q.value = t6;
    this.emitter.emit("filtersChanged", this.spec);
  }
  setFilterGain(e8, t6) {
    this.spec[e8].gain = t6;
    let i7 = this.filterbank.find((s5) => s5.idx === e8);
    if (i7)
      for (let s5 of i7.filters)
        s5.gain.value = t6;
    this.emitter.emit("filtersChanged", this.spec);
  }
  getFrequencyResponse(e8, t6, i7, s5, l6) {
    let n7 = this.filterbank.find((h3) => h3.idx === e8);
    return n7 ? (n7.filters[t6].getFrequencyResponse(i7, s5, l6), true) : false;
  }
  buildFilterChain(e8) {
    this.filterbank = [];
    for (let t6 = 0; t6 < e8.length; t6++) {
      let i7 = e8[t6];
      if (i7.type === "noop" || i7.bypass)
        continue;
      let s5 = Array.from({ length: l(i7.type) }, () => {
        let l6 = this.audioCtx.createBiquadFilter();
        return l6.type = i(i7.type), l6.frequency.value = i7.frequency, l6.Q.value = i7.Q, l6.gain.value = i7.gain, l6;
      });
      this.filterbank.push({ idx: t6, filters: s5 });
    }
    if (this.filterbank.length === 0)
      this.input.connect(this.output);
    else
      for (let t6 = 0; t6 < this.filterbank.length; t6++) {
        let { filters: i7 } = this.filterbank[t6];
        t6 === 0 ? this.input.connect(i7[0]) : this.filterbank[t6 - 1].filters[this.filterbank[t6 - 1].filters.length - 1].connect(i7[0]);
        for (let s5 = 0; s5 < i7.length - 1; s5++)
          i7[s5].connect(i7[s5 + 1]);
        t6 === this.filterbank.length - 1 && i7[i7.length - 1].connect(this.output);
      }
  }
  getPreviousInChain(e8) {
    let t6 = this.input, i7 = -1;
    for (let s5 of this.filterbank)
      s5.idx < e8 && s5.idx > i7 && (t6 = s5.filters[s5.filters.length - 1], i7 = s5.idx);
    return t6;
  }
  getNextInChain(e8) {
    let t6 = this.output, i7 = this.spec.length;
    for (let s5 of this.filterbank)
      s5.idx > e8 && s5.idx < i7 && (t6 = s5.filters[0], i7 = s5.idx);
    return t6;
  }
};

// node_modules/@lit/reactive-element/css-tag.js
var t2 = window;
var e = t2.ShadowRoot && (void 0 === t2.ShadyCSS || t2.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var n = /* @__PURE__ */ new WeakMap();
var o2 = class {
  constructor(t6, e8, n7) {
    if (this._$cssResult$ = true, n7 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t6, this.t = e8;
  }
  get styleSheet() {
    let t6 = this.o;
    const s5 = this.t;
    if (e && void 0 === t6) {
      const e8 = void 0 !== s5 && 1 === s5.length;
      e8 && (t6 = n.get(s5)), void 0 === t6 && ((this.o = t6 = new CSSStyleSheet()).replaceSync(this.cssText), e8 && n.set(s5, t6));
    }
    return t6;
  }
  toString() {
    return this.cssText;
  }
};
var r2 = (t6) => new o2("string" == typeof t6 ? t6 : t6 + "", void 0, s);
var i2 = (t6, ...e8) => {
  const n7 = 1 === t6.length ? t6[0] : e8.reduce(((e9, s5, n8) => e9 + ((t7) => {
    if (true === t7._$cssResult$) return t7.cssText;
    if ("number" == typeof t7) return t7;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t7 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s5) + t6[n8 + 1]), t6[0]);
  return new o2(n7, t6, s);
};
var S = (s5, n7) => {
  e ? s5.adoptedStyleSheets = n7.map(((t6) => t6 instanceof CSSStyleSheet ? t6 : t6.styleSheet)) : n7.forEach(((e8) => {
    const n8 = document.createElement("style"), o8 = t2.litNonce;
    void 0 !== o8 && n8.setAttribute("nonce", o8), n8.textContent = e8.cssText, s5.appendChild(n8);
  }));
};
var c2 = e ? (t6) => t6 : (t6) => t6 instanceof CSSStyleSheet ? ((t7) => {
  let e8 = "";
  for (const s5 of t7.cssRules) e8 += s5.cssText;
  return r2(e8);
})(t6) : t6;

// node_modules/@lit/reactive-element/reactive-element.js
var s2;
var e2 = window;
var r3 = e2.trustedTypes;
var h = r3 ? r3.emptyScript : "";
var o3 = e2.reactiveElementPolyfillSupport;
var n2 = { toAttribute(t6, i7) {
  switch (i7) {
    case Boolean:
      t6 = t6 ? h : null;
      break;
    case Object:
    case Array:
      t6 = null == t6 ? t6 : JSON.stringify(t6);
  }
  return t6;
}, fromAttribute(t6, i7) {
  let s5 = t6;
  switch (i7) {
    case Boolean:
      s5 = null !== t6;
      break;
    case Number:
      s5 = null === t6 ? null : Number(t6);
      break;
    case Object:
    case Array:
      try {
        s5 = JSON.parse(t6);
      } catch (t7) {
        s5 = null;
      }
  }
  return s5;
} };
var a = (t6, i7) => i7 !== t6 && (i7 == i7 || t6 == t6);
var l2 = { attribute: true, type: String, converter: n2, reflect: false, hasChanged: a };
var d = "finalized";
var u3 = class extends HTMLElement {
  constructor() {
    super(), this._$Ei = /* @__PURE__ */ new Map(), this.isUpdatePending = false, this.hasUpdated = false, this._$El = null, this._$Eu();
  }
  static addInitializer(t6) {
    var i7;
    this.finalize(), (null !== (i7 = this.h) && void 0 !== i7 ? i7 : this.h = []).push(t6);
  }
  static get observedAttributes() {
    this.finalize();
    const t6 = [];
    return this.elementProperties.forEach(((i7, s5) => {
      const e8 = this._$Ep(s5, i7);
      void 0 !== e8 && (this._$Ev.set(e8, s5), t6.push(e8));
    })), t6;
  }
  static createProperty(t6, i7 = l2) {
    if (i7.state && (i7.attribute = false), this.finalize(), this.elementProperties.set(t6, i7), !i7.noAccessor && !this.prototype.hasOwnProperty(t6)) {
      const s5 = "symbol" == typeof t6 ? /* @__PURE__ */ Symbol() : "__" + t6, e8 = this.getPropertyDescriptor(t6, s5, i7);
      void 0 !== e8 && Object.defineProperty(this.prototype, t6, e8);
    }
  }
  static getPropertyDescriptor(t6, i7, s5) {
    return { get() {
      return this[i7];
    }, set(e8) {
      const r5 = this[t6];
      this[i7] = e8, this.requestUpdate(t6, r5, s5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t6) {
    return this.elementProperties.get(t6) || l2;
  }
  static finalize() {
    if (this.hasOwnProperty(d)) return false;
    this[d] = true;
    const t6 = Object.getPrototypeOf(this);
    if (t6.finalize(), void 0 !== t6.h && (this.h = [...t6.h]), this.elementProperties = new Map(t6.elementProperties), this._$Ev = /* @__PURE__ */ new Map(), this.hasOwnProperty("properties")) {
      const t7 = this.properties, i7 = [...Object.getOwnPropertyNames(t7), ...Object.getOwnPropertySymbols(t7)];
      for (const s5 of i7) this.createProperty(s5, t7[s5]);
    }
    return this.elementStyles = this.finalizeStyles(this.styles), true;
  }
  static finalizeStyles(i7) {
    const s5 = [];
    if (Array.isArray(i7)) {
      const e8 = new Set(i7.flat(1 / 0).reverse());
      for (const i8 of e8) s5.unshift(c2(i8));
    } else void 0 !== i7 && s5.push(c2(i7));
    return s5;
  }
  static _$Ep(t6, i7) {
    const s5 = i7.attribute;
    return false === s5 ? void 0 : "string" == typeof s5 ? s5 : "string" == typeof t6 ? t6.toLowerCase() : void 0;
  }
  _$Eu() {
    var t6;
    this._$E_ = new Promise(((t7) => this.enableUpdating = t7)), this._$AL = /* @__PURE__ */ new Map(), this._$Eg(), this.requestUpdate(), null === (t6 = this.constructor.h) || void 0 === t6 || t6.forEach(((t7) => t7(this)));
  }
  addController(t6) {
    var i7, s5;
    (null !== (i7 = this._$ES) && void 0 !== i7 ? i7 : this._$ES = []).push(t6), void 0 !== this.renderRoot && this.isConnected && (null === (s5 = t6.hostConnected) || void 0 === s5 || s5.call(t6));
  }
  removeController(t6) {
    var i7;
    null === (i7 = this._$ES) || void 0 === i7 || i7.splice(this._$ES.indexOf(t6) >>> 0, 1);
  }
  _$Eg() {
    this.constructor.elementProperties.forEach(((t6, i7) => {
      this.hasOwnProperty(i7) && (this._$Ei.set(i7, this[i7]), delete this[i7]);
    }));
  }
  createRenderRoot() {
    var t6;
    const s5 = null !== (t6 = this.shadowRoot) && void 0 !== t6 ? t6 : this.attachShadow(this.constructor.shadowRootOptions);
    return S(s5, this.constructor.elementStyles), s5;
  }
  connectedCallback() {
    var t6;
    void 0 === this.renderRoot && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), null === (t6 = this._$ES) || void 0 === t6 || t6.forEach(((t7) => {
      var i7;
      return null === (i7 = t7.hostConnected) || void 0 === i7 ? void 0 : i7.call(t7);
    }));
  }
  enableUpdating(t6) {
  }
  disconnectedCallback() {
    var t6;
    null === (t6 = this._$ES) || void 0 === t6 || t6.forEach(((t7) => {
      var i7;
      return null === (i7 = t7.hostDisconnected) || void 0 === i7 ? void 0 : i7.call(t7);
    }));
  }
  attributeChangedCallback(t6, i7, s5) {
    this._$AK(t6, s5);
  }
  _$EO(t6, i7, s5 = l2) {
    var e8;
    const r5 = this.constructor._$Ep(t6, s5);
    if (void 0 !== r5 && true === s5.reflect) {
      const h3 = (void 0 !== (null === (e8 = s5.converter) || void 0 === e8 ? void 0 : e8.toAttribute) ? s5.converter : n2).toAttribute(i7, s5.type);
      this._$El = t6, null == h3 ? this.removeAttribute(r5) : this.setAttribute(r5, h3), this._$El = null;
    }
  }
  _$AK(t6, i7) {
    var s5;
    const e8 = this.constructor, r5 = e8._$Ev.get(t6);
    if (void 0 !== r5 && this._$El !== r5) {
      const t7 = e8.getPropertyOptions(r5), h3 = "function" == typeof t7.converter ? { fromAttribute: t7.converter } : void 0 !== (null === (s5 = t7.converter) || void 0 === s5 ? void 0 : s5.fromAttribute) ? t7.converter : n2;
      this._$El = r5, this[r5] = h3.fromAttribute(i7, t7.type), this._$El = null;
    }
  }
  requestUpdate(t6, i7, s5) {
    let e8 = true;
    void 0 !== t6 && (((s5 = s5 || this.constructor.getPropertyOptions(t6)).hasChanged || a)(this[t6], i7) ? (this._$AL.has(t6) || this._$AL.set(t6, i7), true === s5.reflect && this._$El !== t6 && (void 0 === this._$EC && (this._$EC = /* @__PURE__ */ new Map()), this._$EC.set(t6, s5))) : e8 = false), !this.isUpdatePending && e8 && (this._$E_ = this._$Ej());
  }
  async _$Ej() {
    this.isUpdatePending = true;
    try {
      await this._$E_;
    } catch (t7) {
      Promise.reject(t7);
    }
    const t6 = this.scheduleUpdate();
    return null != t6 && await t6, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var t6;
    if (!this.isUpdatePending) return;
    this.hasUpdated, this._$Ei && (this._$Ei.forEach(((t7, i8) => this[i8] = t7)), this._$Ei = void 0);
    let i7 = false;
    const s5 = this._$AL;
    try {
      i7 = this.shouldUpdate(s5), i7 ? (this.willUpdate(s5), null === (t6 = this._$ES) || void 0 === t6 || t6.forEach(((t7) => {
        var i8;
        return null === (i8 = t7.hostUpdate) || void 0 === i8 ? void 0 : i8.call(t7);
      })), this.update(s5)) : this._$Ek();
    } catch (t7) {
      throw i7 = false, this._$Ek(), t7;
    }
    i7 && this._$AE(s5);
  }
  willUpdate(t6) {
  }
  _$AE(t6) {
    var i7;
    null === (i7 = this._$ES) || void 0 === i7 || i7.forEach(((t7) => {
      var i8;
      return null === (i8 = t7.hostUpdated) || void 0 === i8 ? void 0 : i8.call(t7);
    })), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t6)), this.updated(t6);
  }
  _$Ek() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$E_;
  }
  shouldUpdate(t6) {
    return true;
  }
  update(t6) {
    void 0 !== this._$EC && (this._$EC.forEach(((t7, i7) => this._$EO(i7, this[i7], t7))), this._$EC = void 0), this._$Ek();
  }
  updated(t6) {
  }
  firstUpdated(t6) {
  }
};
u3[d] = true, u3.elementProperties = /* @__PURE__ */ new Map(), u3.elementStyles = [], u3.shadowRootOptions = { mode: "open" }, null == o3 || o3({ ReactiveElement: u3 }), (null !== (s2 = e2.reactiveElementVersions) && void 0 !== s2 ? s2 : e2.reactiveElementVersions = []).push("1.6.3");

// node_modules/lit-html/lit-html.js
var t3;
var i3 = window;
var s3 = i3.trustedTypes;
var e3 = s3 ? s3.createPolicy("lit-html", { createHTML: (t6) => t6 }) : void 0;
var o4 = "$lit$";
var n3 = `lit$${(Math.random() + "").slice(9)}$`;
var l3 = "?" + n3;
var h2 = `<${l3}>`;
var r4 = document;
var u4 = () => r4.createComment("");
var d2 = (t6) => null === t6 || "object" != typeof t6 && "function" != typeof t6;
var c3 = Array.isArray;
var v = (t6) => c3(t6) || "function" == typeof (null == t6 ? void 0 : t6[Symbol.iterator]);
var a2 = "[ 	\n\f\r]";
var f2 = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p3 = RegExp(`>|${a2}(?:([^\\s"'>=/]+)(${a2}*=${a2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g3 = /'/g;
var $ = /"/g;
var y = /^(?:script|style|textarea|title)$/i;
var w = (t6) => (i7, ...s5) => ({ _$litType$: t6, strings: i7, values: s5 });
var x = w(1);
var b2 = w(2);
var T = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var E = /* @__PURE__ */ new WeakMap();
var C = r4.createTreeWalker(r4, 129, null, false);
function P(t6, i7) {
  if (!Array.isArray(t6) || !t6.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i7) : i7;
}
var V = (t6, i7) => {
  const s5 = t6.length - 1, e8 = [];
  let l6, r5 = 2 === i7 ? "<svg>" : "", u5 = f2;
  for (let i8 = 0; i8 < s5; i8++) {
    const s6 = t6[i8];
    let d4, c5, v3 = -1, a3 = 0;
    for (; a3 < s6.length && (u5.lastIndex = a3, c5 = u5.exec(s6), null !== c5); ) a3 = u5.lastIndex, u5 === f2 ? "!--" === c5[1] ? u5 = _ : void 0 !== c5[1] ? u5 = m : void 0 !== c5[2] ? (y.test(c5[2]) && (l6 = RegExp("</" + c5[2], "g")), u5 = p3) : void 0 !== c5[3] && (u5 = p3) : u5 === p3 ? ">" === c5[0] ? (u5 = null != l6 ? l6 : f2, v3 = -1) : void 0 === c5[1] ? v3 = -2 : (v3 = u5.lastIndex - c5[2].length, d4 = c5[1], u5 = void 0 === c5[3] ? p3 : '"' === c5[3] ? $ : g3) : u5 === $ || u5 === g3 ? u5 = p3 : u5 === _ || u5 === m ? u5 = f2 : (u5 = p3, l6 = void 0);
    const w3 = u5 === p3 && t6[i8 + 1].startsWith("/>") ? " " : "";
    r5 += u5 === f2 ? s6 + h2 : v3 >= 0 ? (e8.push(d4), s6.slice(0, v3) + o4 + s6.slice(v3) + n3 + w3) : s6 + n3 + (-2 === v3 ? (e8.push(void 0), i8) : w3);
  }
  return [P(t6, r5 + (t6[s5] || "<?>") + (2 === i7 ? "</svg>" : "")), e8];
};
var N = class _N {
  constructor({ strings: t6, _$litType$: i7 }, e8) {
    let h3;
    this.parts = [];
    let r5 = 0, d4 = 0;
    const c5 = t6.length - 1, v3 = this.parts, [a3, f3] = V(t6, i7);
    if (this.el = _N.createElement(a3, e8), C.currentNode = this.el.content, 2 === i7) {
      const t7 = this.el.content, i8 = t7.firstChild;
      i8.remove(), t7.append(...i8.childNodes);
    }
    for (; null !== (h3 = C.nextNode()) && v3.length < c5; ) {
      if (1 === h3.nodeType) {
        if (h3.hasAttributes()) {
          const t7 = [];
          for (const i8 of h3.getAttributeNames()) if (i8.endsWith(o4) || i8.startsWith(n3)) {
            const s5 = f3[d4++];
            if (t7.push(i8), void 0 !== s5) {
              const t8 = h3.getAttribute(s5.toLowerCase() + o4).split(n3), i9 = /([.?@])?(.*)/.exec(s5);
              v3.push({ type: 1, index: r5, name: i9[2], strings: t8, ctor: "." === i9[1] ? H : "?" === i9[1] ? L : "@" === i9[1] ? z : k });
            } else v3.push({ type: 6, index: r5 });
          }
          for (const i8 of t7) h3.removeAttribute(i8);
        }
        if (y.test(h3.tagName)) {
          const t7 = h3.textContent.split(n3), i8 = t7.length - 1;
          if (i8 > 0) {
            h3.textContent = s3 ? s3.emptyScript : "";
            for (let s5 = 0; s5 < i8; s5++) h3.append(t7[s5], u4()), C.nextNode(), v3.push({ type: 2, index: ++r5 });
            h3.append(t7[i8], u4());
          }
        }
      } else if (8 === h3.nodeType) if (h3.data === l3) v3.push({ type: 2, index: r5 });
      else {
        let t7 = -1;
        for (; -1 !== (t7 = h3.data.indexOf(n3, t7 + 1)); ) v3.push({ type: 7, index: r5 }), t7 += n3.length - 1;
      }
      r5++;
    }
  }
  static createElement(t6, i7) {
    const s5 = r4.createElement("template");
    return s5.innerHTML = t6, s5;
  }
};
function S2(t6, i7, s5 = t6, e8) {
  var o8, n7, l6, h3;
  if (i7 === T) return i7;
  let r5 = void 0 !== e8 ? null === (o8 = s5._$Co) || void 0 === o8 ? void 0 : o8[e8] : s5._$Cl;
  const u5 = d2(i7) ? void 0 : i7._$litDirective$;
  return (null == r5 ? void 0 : r5.constructor) !== u5 && (null === (n7 = null == r5 ? void 0 : r5._$AO) || void 0 === n7 || n7.call(r5, false), void 0 === u5 ? r5 = void 0 : (r5 = new u5(t6), r5._$AT(t6, s5, e8)), void 0 !== e8 ? (null !== (l6 = (h3 = s5)._$Co) && void 0 !== l6 ? l6 : h3._$Co = [])[e8] = r5 : s5._$Cl = r5), void 0 !== r5 && (i7 = S2(t6, r5._$AS(t6, i7.values), r5, e8)), i7;
}
var M = class {
  constructor(t6, i7) {
    this._$AV = [], this._$AN = void 0, this._$AD = t6, this._$AM = i7;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t6) {
    var i7;
    const { el: { content: s5 }, parts: e8 } = this._$AD, o8 = (null !== (i7 = null == t6 ? void 0 : t6.creationScope) && void 0 !== i7 ? i7 : r4).importNode(s5, true);
    C.currentNode = o8;
    let n7 = C.nextNode(), l6 = 0, h3 = 0, u5 = e8[0];
    for (; void 0 !== u5; ) {
      if (l6 === u5.index) {
        let i8;
        2 === u5.type ? i8 = new R(n7, n7.nextSibling, this, t6) : 1 === u5.type ? i8 = new u5.ctor(n7, u5.name, u5.strings, this, t6) : 6 === u5.type && (i8 = new Z(n7, this, t6)), this._$AV.push(i8), u5 = e8[++h3];
      }
      l6 !== (null == u5 ? void 0 : u5.index) && (n7 = C.nextNode(), l6++);
    }
    return C.currentNode = r4, o8;
  }
  v(t6) {
    let i7 = 0;
    for (const s5 of this._$AV) void 0 !== s5 && (void 0 !== s5.strings ? (s5._$AI(t6, s5, i7), i7 += s5.strings.length - 2) : s5._$AI(t6[i7])), i7++;
  }
};
var R = class _R {
  constructor(t6, i7, s5, e8) {
    var o8;
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t6, this._$AB = i7, this._$AM = s5, this.options = e8, this._$Cp = null === (o8 = null == e8 ? void 0 : e8.isConnected) || void 0 === o8 || o8;
  }
  get _$AU() {
    var t6, i7;
    return null !== (i7 = null === (t6 = this._$AM) || void 0 === t6 ? void 0 : t6._$AU) && void 0 !== i7 ? i7 : this._$Cp;
  }
  get parentNode() {
    let t6 = this._$AA.parentNode;
    const i7 = this._$AM;
    return void 0 !== i7 && 11 === (null == t6 ? void 0 : t6.nodeType) && (t6 = i7.parentNode), t6;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t6, i7 = this) {
    t6 = S2(this, t6, i7), d2(t6) ? t6 === A || null == t6 || "" === t6 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t6 !== this._$AH && t6 !== T && this._(t6) : void 0 !== t6._$litType$ ? this.g(t6) : void 0 !== t6.nodeType ? this.$(t6) : v(t6) ? this.T(t6) : this._(t6);
  }
  k(t6) {
    return this._$AA.parentNode.insertBefore(t6, this._$AB);
  }
  $(t6) {
    this._$AH !== t6 && (this._$AR(), this._$AH = this.k(t6));
  }
  _(t6) {
    this._$AH !== A && d2(this._$AH) ? this._$AA.nextSibling.data = t6 : this.$(r4.createTextNode(t6)), this._$AH = t6;
  }
  g(t6) {
    var i7;
    const { values: s5, _$litType$: e8 } = t6, o8 = "number" == typeof e8 ? this._$AC(t6) : (void 0 === e8.el && (e8.el = N.createElement(P(e8.h, e8.h[0]), this.options)), e8);
    if ((null === (i7 = this._$AH) || void 0 === i7 ? void 0 : i7._$AD) === o8) this._$AH.v(s5);
    else {
      const t7 = new M(o8, this), i8 = t7.u(this.options);
      t7.v(s5), this.$(i8), this._$AH = t7;
    }
  }
  _$AC(t6) {
    let i7 = E.get(t6.strings);
    return void 0 === i7 && E.set(t6.strings, i7 = new N(t6)), i7;
  }
  T(t6) {
    c3(this._$AH) || (this._$AH = [], this._$AR());
    const i7 = this._$AH;
    let s5, e8 = 0;
    for (const o8 of t6) e8 === i7.length ? i7.push(s5 = new _R(this.k(u4()), this.k(u4()), this, this.options)) : s5 = i7[e8], s5._$AI(o8), e8++;
    e8 < i7.length && (this._$AR(s5 && s5._$AB.nextSibling, e8), i7.length = e8);
  }
  _$AR(t6 = this._$AA.nextSibling, i7) {
    var s5;
    for (null === (s5 = this._$AP) || void 0 === s5 || s5.call(this, false, true, i7); t6 && t6 !== this._$AB; ) {
      const i8 = t6.nextSibling;
      t6.remove(), t6 = i8;
    }
  }
  setConnected(t6) {
    var i7;
    void 0 === this._$AM && (this._$Cp = t6, null === (i7 = this._$AP) || void 0 === i7 || i7.call(this, t6));
  }
};
var k = class {
  constructor(t6, i7, s5, e8, o8) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t6, this.name = i7, this._$AM = e8, this.options = o8, s5.length > 2 || "" !== s5[0] || "" !== s5[1] ? (this._$AH = Array(s5.length - 1).fill(new String()), this.strings = s5) : this._$AH = A;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t6, i7 = this, s5, e8) {
    const o8 = this.strings;
    let n7 = false;
    if (void 0 === o8) t6 = S2(this, t6, i7, 0), n7 = !d2(t6) || t6 !== this._$AH && t6 !== T, n7 && (this._$AH = t6);
    else {
      const e9 = t6;
      let l6, h3;
      for (t6 = o8[0], l6 = 0; l6 < o8.length - 1; l6++) h3 = S2(this, e9[s5 + l6], i7, l6), h3 === T && (h3 = this._$AH[l6]), n7 || (n7 = !d2(h3) || h3 !== this._$AH[l6]), h3 === A ? t6 = A : t6 !== A && (t6 += (null != h3 ? h3 : "") + o8[l6 + 1]), this._$AH[l6] = h3;
    }
    n7 && !e8 && this.j(t6);
  }
  j(t6) {
    t6 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, null != t6 ? t6 : "");
  }
};
var H = class extends k {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t6) {
    this.element[this.name] = t6 === A ? void 0 : t6;
  }
};
var I = s3 ? s3.emptyScript : "";
var L = class extends k {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t6) {
    t6 && t6 !== A ? this.element.setAttribute(this.name, I) : this.element.removeAttribute(this.name);
  }
};
var z = class extends k {
  constructor(t6, i7, s5, e8, o8) {
    super(t6, i7, s5, e8, o8), this.type = 5;
  }
  _$AI(t6, i7 = this) {
    var s5;
    if ((t6 = null !== (s5 = S2(this, t6, i7, 0)) && void 0 !== s5 ? s5 : A) === T) return;
    const e8 = this._$AH, o8 = t6 === A && e8 !== A || t6.capture !== e8.capture || t6.once !== e8.once || t6.passive !== e8.passive, n7 = t6 !== A && (e8 === A || o8);
    o8 && this.element.removeEventListener(this.name, this, e8), n7 && this.element.addEventListener(this.name, this, t6), this._$AH = t6;
  }
  handleEvent(t6) {
    var i7, s5;
    "function" == typeof this._$AH ? this._$AH.call(null !== (s5 = null === (i7 = this.options) || void 0 === i7 ? void 0 : i7.host) && void 0 !== s5 ? s5 : this.element, t6) : this._$AH.handleEvent(t6);
  }
};
var Z = class {
  constructor(t6, i7, s5) {
    this.element = t6, this.type = 6, this._$AN = void 0, this._$AM = i7, this.options = s5;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t6) {
    S2(this, t6);
  }
};
var B = i3.litHtmlPolyfillSupport;
null == B || B(N, R), (null !== (t3 = i3.litHtmlVersions) && void 0 !== t3 ? t3 : i3.litHtmlVersions = []).push("2.8.0");
var D = (t6, i7, s5) => {
  var e8, o8;
  const n7 = null !== (e8 = null == s5 ? void 0 : s5.renderBefore) && void 0 !== e8 ? e8 : i7;
  let l6 = n7._$litPart$;
  if (void 0 === l6) {
    const t7 = null !== (o8 = null == s5 ? void 0 : s5.renderBefore) && void 0 !== o8 ? o8 : null;
    n7._$litPart$ = l6 = new R(i7.insertBefore(u4(), t7), t7, void 0, null != s5 ? s5 : {});
  }
  return l6._$AI(t6), l6;
};

// node_modules/lit-element/lit-element.js
var l4;
var o5;
var s4 = class extends u3 {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t6, e8;
    const i7 = super.createRenderRoot();
    return null !== (t6 = (e8 = this.renderOptions).renderBefore) && void 0 !== t6 || (e8.renderBefore = i7.firstChild), i7;
  }
  update(t6) {
    const i7 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t6), this._$Do = D(i7, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t6;
    super.connectedCallback(), null === (t6 = this._$Do) || void 0 === t6 || t6.setConnected(true);
  }
  disconnectedCallback() {
    var t6;
    super.disconnectedCallback(), null === (t6 = this._$Do) || void 0 === t6 || t6.setConnected(false);
  }
  render() {
    return T;
  }
};
s4.finalized = true, s4._$litElement$ = true, null === (l4 = globalThis.litElementHydrateSupport) || void 0 === l4 || l4.call(globalThis, { LitElement: s4 });
var n4 = globalThis.litElementPolyfillSupport;
null == n4 || n4({ LitElement: s4 });
(null !== (o5 = globalThis.litElementVersions) && void 0 !== o5 ? o5 : globalThis.litElementVersions = []).push("3.3.3");

// node_modules/@lit/reactive-element/decorators/custom-element.js
var e4 = (e8) => (n7) => "function" == typeof n7 ? ((e9, n8) => (customElements.define(e9, n8), n8))(e8, n7) : ((e9, n8) => {
  const { kind: t6, elements: s5 } = n8;
  return { kind: t6, elements: s5, finisher(n9) {
    customElements.define(e9, n9);
  } };
})(e8, n7);

// node_modules/@lit/reactive-element/decorators/property.js
var i4 = (i7, e8) => "method" === e8.kind && e8.descriptor && !("value" in e8.descriptor) ? { ...e8, finisher(n7) {
  n7.createProperty(e8.key, i7);
} } : { kind: "field", key: /* @__PURE__ */ Symbol(), placement: "own", descriptor: {}, originalKey: e8.key, initializer() {
  "function" == typeof e8.initializer && (this[e8.key] = e8.initializer.call(this));
}, finisher(n7) {
  n7.createProperty(e8.key, i7);
} };
var e5 = (i7, e8, n7) => {
  e8.constructor.createProperty(n7, i7);
};
function n5(n7) {
  return (t6, o8) => void 0 !== o8 ? e5(n7, t6, o8) : i4(n7, t6);
}

// node_modules/@lit/reactive-element/decorators/state.js
function t4(t6) {
  return n5({ ...t6, state: true });
}

// node_modules/@lit/reactive-element/decorators/base.js
var o6 = ({ finisher: e8, descriptor: t6 }) => (o8, n7) => {
  var r5;
  if (void 0 === n7) {
    const n8 = null !== (r5 = o8.originalKey) && void 0 !== r5 ? r5 : o8.key, i7 = null != t6 ? { kind: "method", placement: "prototype", key: n8, descriptor: t6(o8.key) } : { ...o8, key: n8 };
    return null != e8 && (i7.finisher = function(t7) {
      e8(t7, n8);
    }), i7;
  }
  {
    const r6 = o8.constructor;
    void 0 !== t6 && Object.defineProperty(o8, n7, t6(n7)), null == e8 || e8(r6, n7);
  }
};

// node_modules/@lit/reactive-element/decorators/query.js
function i5(i7, n7) {
  return o6({ descriptor: (o8) => {
    const t6 = { get() {
      var o9, n8;
      return null !== (n8 = null === (o9 = this.renderRoot) || void 0 === o9 ? void 0 : o9.querySelector(i7)) && void 0 !== n8 ? n8 : null;
    }, enumerable: true, configurable: true };
    if (n7) {
      const n8 = "symbol" == typeof o8 ? /* @__PURE__ */ Symbol() : "__" + o8;
      t6.get = function() {
        var o9, t7;
        return void 0 === this[n8] && (this[n8] = null !== (t7 = null === (o9 = this.renderRoot) || void 0 === o9 ? void 0 : o9.querySelector(i7)) && void 0 !== t7 ? t7 : null), this[n8];
      };
    }
    return t6;
  } });
}

// node_modules/@lit/reactive-element/decorators/query-assigned-elements.js
var n6;
var e6 = null != (null === (n6 = window.HTMLSlotElement) || void 0 === n6 ? void 0 : n6.prototype.assignedElements) ? (o8, n7) => o8.assignedElements(n7) : (o8, n7) => o8.assignedNodes(n7).filter(((o9) => o9.nodeType === Node.ELEMENT_NODE));

// node_modules/lit-html/directive.js
var t5 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
var e7 = (t6) => (...e8) => ({ _$litDirective$: t6, values: e8 });
var i6 = class {
  constructor(t6) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t6, e8, i7) {
    this._$Ct = t6, this._$AM = e8, this._$Ci = i7;
  }
  _$AS(t6, e8) {
    return this.update(t6, e8);
  }
  update(t6, e8) {
    return this.render(...e8);
  }
};

// node_modules/lit-html/directives/class-map.js
var o7 = e7(class extends i6 {
  constructor(t6) {
    var i7;
    if (super(t6), t6.type !== t5.ATTRIBUTE || "class" !== t6.name || (null === (i7 = t6.strings) || void 0 === i7 ? void 0 : i7.length) > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(t6) {
    return " " + Object.keys(t6).filter(((i7) => t6[i7])).join(" ") + " ";
  }
  update(i7, [s5]) {
    var r5, o8;
    if (void 0 === this.it) {
      this.it = /* @__PURE__ */ new Set(), void 0 !== i7.strings && (this.nt = new Set(i7.strings.join(" ").split(/\s/).filter(((t6) => "" !== t6))));
      for (const t6 in s5) s5[t6] && !(null === (r5 = this.nt) || void 0 === r5 ? void 0 : r5.has(t6)) && this.it.add(t6);
      return this.render(s5);
    }
    const e8 = i7.element.classList;
    this.it.forEach(((t6) => {
      t6 in s5 || (e8.remove(t6), this.it.delete(t6));
    }));
    for (const t6 in s5) {
      const i8 = !!s5[t6];
      i8 === this.it.has(t6) || (null === (o8 = this.nt) || void 0 === o8 ? void 0 : o8.has(t6)) || (i8 ? (e8.add(t6), this.it.add(t6)) : (e8.remove(t6), this.it.delete(t6)));
    }
    return T;
  }
});

// node_modules/weq8/dist/ui.js
function d3(y2, e8, t6, i7) {
  var s5 = arguments.length, r5 = s5 < 3 ? e8 : i7 === null ? i7 = Object.getOwnPropertyDescriptor(e8, t6) : i7, n7;
  if (typeof Reflect == "object" && typeof Reflect.decorate == "function")
    r5 = Reflect.decorate(y2, e8, t6, i7);
  else
    for (var a3 = y2.length - 1; a3 >= 0; a3--)
      (n7 = y2[a3]) && (r5 = (s5 < 3 ? n7(r5) : s5 > 3 ? n7(e8, t6, r5) : n7(e8, t6)) || r5);
  return s5 > 3 && r5 && Object.defineProperty(e8, t6, r5), r5;
}
var z2 = class {
  constructor(e8, t6) {
    this.runtime = e8, this.canvas = t6, this.disposed = false, this.analyser = e8.audioCtx.createAnalyser(), this.analyser.fftSize = 8192, this.analyser.smoothingTimeConstant = 0.5, e8.connect(this.analyser), this.analysisData = new Uint8Array(this.analyser.frequencyBinCount);
    let i7 = Math.log10(e8.audioCtx.sampleRate / 2) - 1;
    this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio, this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio, this.analysisXs = this.calculateAnalysisXs(i7), this.resizeObserver = new ResizeObserver(() => {
      this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio, this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio, this.analysisXs = this.calculateAnalysisXs(i7);
    }), this.resizeObserver.observe(this.canvas);
  }
  calculateAnalysisXs(e8) {
    return Array.from(this.analysisData).map((t6, i7) => {
      let s5 = i7 / this.analysisData.length * (this.runtime.audioCtx.sampleRate / 2);
      return Math.floor((Math.log10(s5) - 1) / e8 * this.canvas.width);
    });
  }
  analyse() {
    let e8 = () => {
      this.disposed || (this.analyser.getByteFrequencyData(this.analysisData), this.draw(), requestAnimationFrame(e8));
    };
    requestAnimationFrame(e8);
  }
  draw() {
    let e8 = this.canvas.width, t6 = this.canvas.height, i7 = this.canvas.height / 255, s5 = this.canvas.getContext("2d");
    if (!s5)
      throw new Error("Could not get a canvas context!");
    s5.clearRect(0, 0, e8, t6);
    let r5 = new Path2D();
    r5.moveTo(0, t6);
    for (let n7 = 0; n7 < this.analysisData.length; n7++) {
      let a3 = Math.floor(t6 - this.analysisData[n7] * i7);
      r5.lineTo(this.analysisXs[n7], a3);
    }
    r5.lineTo(e8, t6), s5.fillStyle = "rgba(30, 30, 60, 0.7)", s5.fill(r5), s5.strokeStyle = "rgb(155, 155, 255)", s5.stroke(r5);
  }
  dispose() {
    this.disposed = true, this.analyser.disconnect(), this.resizeObserver.disconnect();
  }
};
var E2 = class {
  constructor(e8, t6) {
    this.runtime = e8, this.canvas = t6, this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio, this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio, this.frequencies = this.calculateFrequencies(), this.filterMagResponse = new Float32Array(this.frequencies.length), this.filterPhaseResponse = new Float32Array(this.frequencies.length), this.frequencyResponse = new Float32Array(this.frequencies.length), this.resizeObserver = new ResizeObserver(() => {
      this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio, this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio, this.frequencies = this.calculateFrequencies(), this.filterMagResponse = new Float32Array(this.frequencies.length), this.filterPhaseResponse = new Float32Array(this.frequencies.length), this.frequencyResponse = new Float32Array(this.frequencies.length), this.render();
    }), this.resizeObserver.observe(this.canvas);
  }
  dispose() {
    this.resizeObserver.disconnect();
  }
  render() {
    this.frequencyResponse.fill(1);
    for (let e8 = 0; e8 < this.runtime.spec.length; e8++)
      for (let t6 = 0; t6 < l(this.runtime.spec[e8].type); t6++)
        if (this.runtime.getFrequencyResponse(e8, t6, this.frequencies, this.filterMagResponse, this.filterPhaseResponse))
          for (let s5 = 0; s5 < this.frequencyResponse.length; s5++)
            this.frequencyResponse[s5] *= this.filterMagResponse[s5];
    this.draw();
  }
  draw() {
    let e8 = this.canvas.getContext("2d"), t6 = this.canvas.width, i7 = this.canvas.height;
    if (!e8)
      throw new Error("Could not get a canvas context!");
    e8.clearRect(0, 0, t6, i7), e8.strokeStyle = "#ffffff", e8.lineWidth = 2, e8.beginPath();
    let s5 = 13, r5 = -s5;
    for (let n7 = 0; n7 < this.frequencyResponse.length; n7++) {
      let a3 = this.frequencyResponse[n7], l6 = 20 * Math.log10(a3), o8 = i7 - (l6 - r5) / (s5 - r5) * i7;
      n7 === 0 ? e8.moveTo(n7, o8) : e8.lineTo(n7, o8);
    }
    e8.stroke();
  }
  calculateFrequencies() {
    let e8 = new Float32Array(this.canvas.width), t6 = this.runtime.audioCtx.sampleRate / 2, i7 = 1, s5 = Math.log10(t6);
    for (let r5 = 0; r5 < this.canvas.width; r5++) {
      let n7 = i7 + r5 / this.canvas.width * (s5 - i7), a3 = Math.pow(10, n7);
      e8[r5] = a3;
    }
    return e8;
  }
};
var A2 = i2`
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@500&display=swap");

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    background-color: #111;
    color: white;
    --font-stack: "Inter", sans-serif;
    --font-size: 11px;
    --font-weight: 500;
    font-family: var(--font-stack);
    font-size: var(--font-size);
    font-weight: var(--font-weight);
  }
`;
var M2 = [
  ["noop", "Add +"],
  ["lowpass12", "LP12"],
  ["lowpass24", "LP24"],
  ["highpass12", "HP12"],
  ["highpass24", "HP24"],
  ["lowshelf12", "LS12"],
  ["lowshelf24", "LS24"],
  ["highshelf12", "HS12"],
  ["highshelf24", "HS24"],
  ["peaking12", "PK12"],
  ["peaking24", "PK24"],
  ["notch12", "NT12"],
  ["notch24", "NT24"]
];
var v2;
var g4 = (v2 = class extends s4 {
  constructor() {
    super(), this.frequencyInputFocused = false, this.dragStates = { frequency: null, gain: null, Q: null }, this.addEventListener("click", () => this.dispatchEvent(new CustomEvent("select", { composed: true, bubbles: true })));
  }
  render() {
    if (!this.runtime || this.index === void 0)
      return;
    let e8 = M2.filter((i7) => this.runtime.supportedFilterTypes.includes(i7[0])), t6 = this.runtime.spec[this.index];
    return x`
      <th>
        <div
          class=${o7({
      chip: true,
      disabled: !t(t6.type),
      bypassed: t6.bypass
    })}
        >
          <div
            class=${o7({
      filterNumber: true,
      bypassed: t6.bypass
    })}
            @click=${() => this.toggleBypass()}
          >
            ${this.index + 1}
          </div>
          <select
            class=${o7({ filterTypeSelect: true, bypassed: t6.bypass })}
            @change=${(i7) => this.setFilterType(i7.target.value)}
          >
            ${e8.map(([i7, s5]) => x`<option value=${i7} ?selected=${t6.type === i7}>
                  ${s5}
                </option>`)}
          </select>
        </div>
      </th>
      <td>
        <input
          class=${o7({
      frequencyInput: true,
      numberInput: true,
      bypassed: t6.bypass
    })}
          type="number"
          step="0.1"
          lang="en_EN"
          .value=${f(t6.frequency, this.frequencyInputFocused)}
          ?disabled=${!t(t6.type)}
          @focus=${() => this.frequencyInputFocused = true}
          @blur=${() => {
      this.frequencyInputFocused = false, this.setFilterFrequency(c(t6.frequency, 10, this.nyquist));
    }}
          @input=${(i7) => this.setFilterFrequency(i7.target.valueAsNumber)}
          @pointerdown=${(i7) => this.startDraggingValue(i7, "frequency")}
          @pointerup=${(i7) => this.stopDraggingValue(i7, "frequency")}
          @pointermove=${(i7) => this.dragValue(i7, "frequency")}
        />
        <span
          class=${o7({
      frequencyUnit: true,
      disabled: !t(t6.type),
      bypassed: t6.bypass
    })}
          >${p(t6.frequency, this.frequencyInputFocused)}</span
        >
      </td>
      <td>
        <input
          class=${o7({
      gainInput: true,
      numberInput: true,
      bypassed: t6.bypass
    })}
          type="number"
          min="-15"
          max="15"
          step="0.1"
          lang="en_EN"
          .value=${t6.gain.toFixed(1)}
          ?disabled=${!o(t6.type)}
          @input=${(i7) => this.setFilterGain(i7.target.valueAsNumber)}
          @pointerdown=${(i7) => this.startDraggingValue(i7, "gain")}
          @pointerup=${(i7) => this.stopDraggingValue(i7, "gain")}
          @pointermove=${(i7) => this.dragValue(i7, "gain")}
        />
        <span
          class=${o7({
      gainUnit: true,
      disabled: !o(t6.type),
      bypassed: t6.bypass
    })}
          >dB</span
        >
      </td>
      <td>
        <input
          class=${o7({
      qInput: true,
      numberInput: true,
      bypassed: t6.bypass
    })}
          type="number"
          min="0.1"
          max="18"
          step="0.1"
          .value=${t6.Q.toFixed(2)}
          ?disabled=${!r(t6.type)}
          @input=${(i7) => this.setFilterQ(i7.target.valueAsNumber)}
          @pointerdown=${(i7) => this.startDraggingValue(i7, "Q")}
          @pointerup=${(i7) => this.stopDraggingValue(i7, "Q")}
          @pointermove=${(i7) => this.dragValue(i7, "Q")}
        />
      </td>
    `;
  }
  get nyquist() {
    var e8, t6;
    return ((t6 = (e8 = this.runtime) == null ? void 0 : e8.audioCtx.sampleRate) != null ? t6 : 48e3) / 2;
  }
  toggleBypass() {
    !this.runtime || this.index === void 0 || this.runtime.toggleBypass(this.index, !this.runtime.spec[this.index].bypass);
  }
  setFilterType(e8) {
    !this.runtime || this.index === void 0 || this.runtime.setFilterType(this.index, e8);
  }
  setFilterFrequency(e8) {
    !this.runtime || this.index === void 0 || isNaN(e8) || this.runtime.setFilterFrequency(this.index, e8);
  }
  setFilterGain(e8) {
    !this.runtime || this.index === void 0 || isNaN(e8) || this.runtime.setFilterGain(this.index, e8);
  }
  setFilterQ(e8) {
    !this.runtime || this.index === void 0 || isNaN(e8) || this.runtime.setFilterQ(this.index, e8);
  }
  startDraggingValue(e8, t6) {
    !this.runtime || this.index === void 0 || (e8.target.setPointerCapture(e8.pointerId), this.dragStates = {
      ...this.dragStates,
      [t6]: {
        pointer: e8.pointerId,
        startY: e8.clientY,
        startValue: this.runtime.spec[this.index][t6]
      }
    });
  }
  stopDraggingValue(e8, t6) {
    var i7;
    !this.runtime || this.index === void 0 || ((i7 = this.dragStates[t6]) == null ? void 0 : i7.pointer) === e8.pointerId && (e8.target.releasePointerCapture(e8.pointerId), this.dragStates = { ...this.dragStates, [t6]: null });
  }
  dragValue(e8, t6) {
    if (!this.runtime || this.index === void 0)
      return;
    let i7 = this.dragStates[t6];
    if (i7 && i7.pointer === e8.pointerId) {
      let s5 = i7.startY, n7 = -(e8.clientY - s5), a3 = c(n7 / 150, -1, 1);
      if (t6 === "frequency") {
        let l6 = 10, o8 = this.runtime.audioCtx.sampleRate / 2, h3 = g(i7.startValue, l6, o8), p4 = u(h3 + a3, l6, o8);
        this.runtime.setFilterFrequency(this.index, p4);
      } else if (t6 === "gain") {
        let l6 = a3 * 15;
        this.runtime.setFilterGain(this.index, c(i7.startValue + l6, -15, 15));
      } else if (t6 === "Q") {
        let l6 = 0.1, o8 = 18, h3 = g(i7.startValue, l6, o8), p4 = u(h3 + a3, l6, o8);
        this.runtime.setFilterQ(this.index, p4);
      }
      e8.target.blur();
    }
  }
}, (() => {
  v2.styles = [
    A2,
    i2`
      :host {
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 60px 60px 50px 40px;
        align-items: center;
        gap: 4px;
        background-color: transparent;
        border-radius: 22px;
        transition: background-color 0.15s ease;
      }
      :host(.selected) {
        background-color: #373737;
      }
      input,
      select {
        padding: 0;
        border: 0;
      }
      input {
        border-bottom: 1px solid transparent;
        transition: border-color 0.15s ease;
      }
      input:focus,
      input:active {
        border-color: white;
      }
      .chip {
        display: inline-grid;
        grid-auto-flow: column;
        gap: 3px;
        height: 20px;
        padding-right: 6px;
        border-radius: 10px;
        background: #373737;
        transition: background-color 0.15s ease;
      }
      :host(.selected) .chip .filterNumber {
        background: #ffcc00;
      }
      .chip.disabled:hover {
        background: #444444;
      }
      .filterNumber {
        cursor: pointer;
        width: 20px;
        height: 20px;
        border-radius: 10px;
        display: grid;
        place-content: center;
        background: white;
        font-weight: var(--font-weight);
        color: black;
        transition: background-color 0.15s ease;
      }
      .chip.disabled .filterNumber {
        background: transparent;
        color: white;
      }
      .chip.bypassed .filterNumber {
        background: #7d7d7d;
        color: black;
      }
      .filterTypeSelect {
        width: 30px;
        appearance: none;
        outline: none;
        background-color: transparent;
        color: white;
        cursor: pointer;
        text-align: center;
        font-family: var(--font-stack);
        font-size: var(--font-size);
        font-weight: var(--font-weight);
      }
      .filterTypeSelect.bypassed {
        color: #7d7d7d;
      }
      .chip.disabled .filterTypeSelect {
        pointer-events: all;
      }
      .frequencyInput {
        width: 28px;
      }
      .gainInput {
        width: 26px;
      }
      .qInput {
        width: 30px;
      }
      .numberInput {
        appearance: none;
        outline: none;
        background-color: transparent;
        color: white;
        text-align: right;
        -moz-appearance: textfield;
        font-family: var(--font-stack);
        font-size: var(--font-size);
        font-weight: var(--font-weight);
        touch-action: none;
      }
      .numberInput:disabled,
      .disabled {
        color: #7d7d7d;
        pointer-events: none;
      }
      .bypassed {
        color: #7d7d7d;
      }
      .numberInput::-webkit-inner-spin-button,
      .numberInput::-webkit-outer-spin-button {
        -webkit-appearance: none !important;
        margin: 0 !important;
      }
    `
  ];
})(), v2);
d3([
  n5({ attribute: false })
], g4.prototype, "runtime", void 0);
d3([
  n5()
], g4.prototype, "index", void 0);
d3([
  t4()
], g4.prototype, "frequencyInputFocused", void 0);
d3([
  t4()
], g4.prototype, "dragStates", void 0);
g4 = d3([
  e4("weq8-ui-filter-row")
], g4);
var w2;
var c4 = (w2 = class extends s4 {
  constructor() {
    super(), this.gridXs = [], this.dragStates = {}, this.selectedFilterIdx = -1, this.addEventListener("click", (e8) => {
      e8.composedPath()[0] === this && (this.selectedFilterIdx = -1);
    });
  }
  updated(e8) {
    var t6, i7;
    if (e8.has("runtime") && ((t6 = this.analyser) == null || t6.dispose(), (i7 = this.frequencyResponse) == null || i7.dispose(), this.runtime && this.analyserCanvas && this.frequencyResponseCanvas)) {
      this.analyser = new z2(this.runtime, this.analyserCanvas), this.analyser.analyse(), this.frequencyResponse = new E2(this.runtime, this.frequencyResponseCanvas), this.frequencyResponse.render();
      let s5 = [], r5 = this.runtime.audioCtx.sampleRate / 2, n7 = Math.floor(Math.log10(r5));
      for (let a3 = 0; a3 < n7; a3++) {
        let l6 = Math.pow(10, a3 + 1);
        for (let o8 = 1; o8 < 10; o8++) {
          let h3 = l6 * o8;
          if (h3 > r5)
            break;
          s5.push((Math.log10(h3) - 1) / (Math.log10(r5) - 1) * 100);
        }
      }
      this.gridXs = s5, this.runtime.on("filtersChanged", () => {
        var a3, l6, o8;
        (a3 = this.frequencyResponse) == null || a3.render(), this.requestUpdate();
        for (let h3 of Array.from((o8 = (l6 = this.shadowRoot) == null ? void 0 : l6.querySelectorAll("weq8-ui-filter-row")) != null ? o8 : []))
          h3.requestUpdate();
      });
    }
  }
  render() {
    var e8;
    return x`
      <table class="filters">
        <thead>
          <tr>
            <th class="headerFilter">Filter</th>
            <th>Freq</th>
            <th>Gain</th>
            <th>Q</th>
          </tr>
        </thead>
        <tbody>
          ${Array.from({ length: 8 }).map((t6, i7) => x`<weq8-ui-filter-row
                class="${o7({ selected: this.selectedFilterIdx === i7 })}"
                .runtime=${this.runtime}
                .index=${i7}
                @select=${(s5) => {
      var r5;
      this.selectedFilterIdx = ((r5 = this.runtime) == null ? void 0 : r5.spec[i7].type) === "noop" ? -1 : i7, s5.stopPropagation();
    }}
              />`)}
        </tbody>
      </table>
      <div class="visualisation">
        <svg
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          ${this.gridXs.map(this.renderGridX)}
          ${[12, 6, 0, -6, -12].map(this.renderGridY)}
        </svg>
        <canvas class="analyser"></canvas>
        <canvas
          class="frequencyResponse"
          @click=${() => this.selectedFilterIdx = -1}
        ></canvas>
        ${(e8 = this.runtime) == null ? void 0 : e8.spec.map((t6, i7) => t6.type === "noop" ? void 0 : this.renderFilterHandle(t6, i7))}
      </div>
    `;
  }
  renderGridX(e8) {
    return b2`<line
      class="grid-x"
      x1=${e8}
      y1="0"
      x2=${e8}
      y2="10"
    />`;
  }
  renderGridY(e8) {
    let i7 = (e8 + 15) / 30 * 10;
    return b2`<line
      class="grid-y"
      x1="0"
      y1=${i7}
      x2="100"
      y2=${i7}
    />`;
  }
  renderFilterHandle(e8, t6) {
    var l6, o8, h3, p4;
    if (!this.runtime)
      return;
    let i7 = this.runtime.spec[t6].type, s5 = (o8 = (l6 = this.analyserCanvas) == null ? void 0 : l6.offsetWidth) != null ? o8 : 0, r5 = (p4 = (h3 = this.analyserCanvas) == null ? void 0 : h3.offsetHeight) != null ? p4 : 0, n7 = g(e8.frequency, 10, this.runtime.audioCtx.sampleRate / 2) * s5, a3 = r5 - (e8.gain + 15) / 30 * r5;
    return o(i7) || (a3 = r5 - g(e8.Q, 0.1, 18) * r5), x`<div
      class="filter-handle-positioner"
      style="transform: translate(${n7}px,${a3}px)"
      @pointerdown=${(m2) => this.startDraggingFilterHandle(m2, t6)}
      @pointerup=${(m2) => this.stopDraggingFilterHandle(m2, t6)}
      @pointermove=${(m2) => this.dragFilterHandle(m2, t6)}
    >
      <div
        class="${o7({
      "filter-handle": true,
      bypassed: e8.bypass,
      selected: t6 === this.selectedFilterIdx
    })}"
      >
        ${t6 + 1}
      </div>
    </div>`;
  }
  startDraggingFilterHandle(e8, t6) {
    e8.target.setPointerCapture(e8.pointerId), this.dragStates = { ...this.dragStates, [t6]: e8.pointerId }, this.selectedFilterIdx = t6, e8.preventDefault();
  }
  stopDraggingFilterHandle(e8, t6) {
    this.dragStates[t6] === e8.pointerId && (e8.target.releasePointerCapture(e8.pointerId), this.dragStates = { ...this.dragStates, [t6]: null });
  }
  dragFilterHandle(e8, t6) {
    var i7, s5;
    if (this.runtime && this.dragStates[t6] === e8.pointerId) {
      let r5 = this.runtime.spec[t6].type, n7 = (s5 = (i7 = this.frequencyResponseCanvas) == null ? void 0 : i7.getBoundingClientRect()) != null ? s5 : {
        left: 0,
        top: 0,
        width: 0,
        height: 0
      }, a3 = e8.clientX - n7.left, l6 = e8.clientY - n7.top, o8 = u(a3 / n7.width, 10, this.runtime.audioCtx.sampleRate / 2);
      this.runtime.setFilterFrequency(t6, o8);
      let h3 = 1 - l6 / n7.height;
      if (o(r5)) {
        let p4 = c(h3 * 30 - 15, -15, 15);
        this.runtime.setFilterGain(t6, p4);
      } else {
        let p4 = u(h3, 0.1, 18);
        this.runtime.setFilterQ(t6, p4);
      }
    }
  }
}, (() => {
  w2.styles = [
    A2,
    i2`
      :host {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        gap: 10px;
        min-width: 600px;
        min-height: 200px;
        padding: 20px;
        border-radius: 8px;
        overflow: hidden;
        background: #202020;
        border: 1px solid #373737;
      }
      .filters {
        display: inline-grid;
        grid-auto-flow: row;
        gap: 4px;
      }
      .filters tbody,
      .filters tr {
        display: contents;
      }
      .filters thead {
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 60px 60px 50px 40px;
        align-items: center;
        gap: 4px;
      }
      .filters thead th {
        display: grid;
        place-content: center;
        height: 20px;
        border-radius: 10px;
        font-weight: var(--font-weight);
        border: 1px solid #373737;
      }
      .filters thead th.headerFilter {
        text-align: left;
        padding-left: 18px;
        border: none;
      }
      .visualisation {
        flex: 1;
        position: relative;
        border: 1px solid #373737;
      }
      canvas,
      svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      svg {
        overflow: visible;
      }
      .grid-x,
      .grid-y {
        stroke: #333;
        stroke-width: 1;
        vector-effect: non-scaling-stroke;
      }
      .filter-handle-positioner {
        position: absolute;
        top: 0;
        left: 0;
        width: 30px;
        height: 30px;
        touch-action: none;
      }
      .filter-handle {
        position: absolute;
        top: 0;
        left: 0;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #fff;
        color: black;
        transform: translate(-50%, -50%);
        display: flex;
        justify-content: center;
        align-items: center;
        user-select: none;
        cursor: grab;
        transition: background-color 0.15s ease;
      }
      .filter-handle.selected {
        background: #ffcc00;
      }
      .filter-handle.bypassed {
        background: #7d7d7d;
      }
    `
  ];
})(), w2);
d3([
  n5({ attribute: false })
], c4.prototype, "runtime", void 0);
d3([
  t4()
], c4.prototype, "analyser", void 0);
d3([
  t4()
], c4.prototype, "frequencyResponse", void 0);
d3([
  t4()
], c4.prototype, "gridXs", void 0);
d3([
  t4()
], c4.prototype, "dragStates", void 0);
d3([
  t4()
], c4.prototype, "selectedFilterIdx", void 0);
d3([
  i5(".analyser")
], c4.prototype, "analyserCanvas", void 0);
d3([
  i5(".frequencyResponse")
], c4.prototype, "frequencyResponseCanvas", void 0);
c4 = d3([
  e4("weq8-ui")
], c4);
export {
  b as WEQ8Runtime
};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
lit-html/directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/class-map.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
