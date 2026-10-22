const noop = () => P;
const P = new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => 0 : k === 'then' ? undefined : P), apply: () => P, set: () => true });
const mkCanvas = () => ({ width: 1, height: 1, getContext: () => P, getBoundingClientRect: () => ({ width: 1280, height: 720, left: 0, top: 0 }), addEventListener() {}, removeEventListener() {} });
globalThis.window = { addEventListener() {}, removeEventListener() {}, devicePixelRatio: 1, setInterval, clearInterval };
globalThis.document = { createElement: mkCanvas, addEventListener() {}, removeEventListener() {}, hidden: false };
globalThis.location = { search: '' };
globalThis.requestAnimationFrame = () => 0; globalThis.cancelAnimationFrame = () => {};
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.__mkCanvas = mkCanvas;
