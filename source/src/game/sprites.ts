// Предрендеренные неоновые спрайты (рисуются один раз в offscreen canvas, затем drawImage)

export interface Sprite {
  img: HTMLCanvasElement;
  flash: HTMLCanvasElement | null;
  half: number;
}

const SS = 2; // supersampling

// Полифил roundRect для старых браузеров
if (typeof CanvasRenderingContext2D !== "undefined" && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (
    this: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radii?: number | DOMPointInit | (number | DOMPointInit)[],
  ) {
    const r = Math.min(typeof radii === "number" ? radii : 0, w / 2, h / 2);
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
  };
}

function makeCanvas(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = Math.max(2, Math.ceil(size));
  return c;
}

function makeSprite(radius: number, pad: number, draw: (g: CanvasRenderingContext2D, r: number) => void, withFlash = false): Sprite {
  const half = radius + pad;
  const c = makeCanvas(half * 2 * SS);
  const g = c.getContext("2d")!;
  g.scale(SS, SS);
  g.translate(half, half);
  g.lineJoin = "round";
  g.lineCap = "round";
  draw(g, radius);
  let flash: HTMLCanvasElement | null = null;
  if (withFlash) {
    flash = makeCanvas(c.width);
    const f = flash.getContext("2d")!;
    f.drawImage(c, 0, 0);
    f.globalCompositeOperation = "source-atop";
    f.fillStyle = "rgba(255,255,255,0.9)";
    f.fillRect(0, 0, flash.width, flash.height);
  }
  return { img: c, flash, half };
}

function poly(g: CanvasRenderingContext2D, n: number, r: number, rot = 0) {
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
}

function glow(g: CanvasRenderingContext2D, color: string, blur: number) {
  g.shadowColor = color;
  g.shadowBlur = blur;
}

function noGlow(g: CanvasRenderingContext2D) {
  g.shadowBlur = 0;
}

function hexToRgba(hex: string, a: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
export { hexToRgba };

// ------------------------------------------------------------
//  Враги
// ------------------------------------------------------------
type EnemyDraw = (g: CanvasRenderingContext2D, r: number, c: string) => void;

const ENEMY_DRAW: Record<string, EnemyDraw> = {
  drone: (g, r, c) => {
    glow(g, c, 8);
    g.fillStyle = "#1a0610";
    g.strokeStyle = c;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, -r);
    g.lineTo(r, 0);
    g.lineTo(0, r);
    g.lineTo(-r, 0);
    g.closePath();
    g.fill();
    g.stroke();
    g.lineWidth = 1.5;
    for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      g.beginPath();
      g.arc(sx * r * 0.78, sy * r * 0.78, r * 0.32, 0, Math.PI * 2);
      g.stroke();
    }
    g.fillStyle = c;
    g.beginPath();
    g.arc(0, 0, r * 0.32, 0, Math.PI * 2);
    g.fill();
    noGlow(g);
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(0, 0, r * 0.13, 0, Math.PI * 2);
    g.fill();
  },
  swarm: (g, r, c) => {
    glow(g, c, 8);
    g.fillStyle = hexToRgba(c, 0.35);
    g.strokeStyle = c;
    g.lineWidth = 1.6;
    poly(g, 3, r, -Math.PI / 2);
    g.fill();
    g.stroke();
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(0, r * 0.1, r * 0.22, 0, Math.PI * 2);
    g.fill();
  },
  trooper: (g, r, c) => {
    glow(g, c, 8);
    g.fillStyle = "#1c0f06";
    g.strokeStyle = c;
    g.lineWidth = 2;
    poly(g, 6, r, Math.PI / 6);
    g.fill();
    g.stroke();
    g.fillStyle = c;
    g.fillRect(-r * 0.62, -r * 0.32, r * 1.24, r * 0.26);
    g.lineWidth = 1.4;
    g.strokeRect(-r * 0.4, r * 0.1, r * 0.8, r * 0.45);
    noGlow(g);
    g.fillStyle = "#fff";
    g.fillRect(-r * 0.15, -r * 0.28, r * 0.3, r * 0.18);
  },
  crawler: (g, r, c) => {
    glow(g, c, 8);
    g.strokeStyle = c;
    g.lineWidth = 1.8;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      const mx = Math.cos(a) * r * 0.85;
      const my = Math.sin(a) * r * 0.85;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(mx, my);
      g.lineTo(Math.cos(a + 0.5) * r * 1.1, Math.sin(a + 0.5) * r * 1.1);
      g.stroke();
    }
    g.fillStyle = "#0f1a05";
    g.beginPath();
    g.ellipse(0, 0, r * 0.62, r * 0.5, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    noGlow(g);
    g.fillStyle = "#fef08a";
    g.beginPath();
    g.arc(-r * 0.22, -r * 0.12, r * 0.13, 0, Math.PI * 2);
    g.arc(r * 0.22, -r * 0.12, r * 0.13, 0, Math.PI * 2);
    g.fill();
  },
  gunner: (g, r, c) => {
    glow(g, c, 8);
    g.fillStyle = "#1a1604";
    g.strokeStyle = c;
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7, r * 0.3);
    g.fill();
    g.stroke();
    g.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      g.beginPath();
      g.moveTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5);
      g.lineTo(Math.cos(a) * r * 1.15, Math.sin(a) * r * 1.15);
      g.stroke();
    }
    g.lineWidth = 2;
    g.beginPath();
    g.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = c;
    g.beginPath();
    g.arc(0, 0, r * 0.22, 0, Math.PI * 2);
    g.fill();
  },
  kamikaze: (g, r, c) => {
    glow(g, c, 12);
    g.fillStyle = "#200404";
    g.strokeStyle = c;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.fillStyle = "#facc15";
    for (let i = 0; i < 6; i++) {
      const a0 = (i / 6) * Math.PI * 2;
      g.beginPath();
      g.moveTo(0, 0);
      g.arc(0, 0, r * 0.78, a0, a0 + Math.PI / 6);
      g.closePath();
      g.fill();
    }
    g.fillStyle = c;
    g.beginPath();
    g.arc(0, 0, r * 0.38, 0, Math.PI * 2);
    g.fill();
    noGlow(g);
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(0, 0, r * 0.18, 0, Math.PI * 2);
    g.fill();
  },
  mech: (g, r, c) => {
    glow(g, c, 10);
    g.fillStyle = "#1c1204";
    g.strokeStyle = c;
    g.lineWidth = 2.5;
    // пушки
    g.fillRect(-r * 1.05, -r * 0.25, r * 0.35, r * 0.9);
    g.strokeRect(-r * 1.05, -r * 0.25, r * 0.35, r * 0.9);
    g.fillRect(r * 0.7, -r * 0.25, r * 0.35, r * 0.9);
    g.strokeRect(r * 0.7, -r * 0.25, r * 0.35, r * 0.9);
    poly(g, 8, r * 0.82, Math.PI / 8);
    g.fill();
    g.stroke();
    g.lineWidth = 1.5;
    poly(g, 8, r * 0.55, Math.PI / 8);
    g.stroke();
    g.fillStyle = c;
    g.fillRect(-r * 0.45, -r * 0.42, r * 0.9, r * 0.16);
    g.beginPath();
    g.arc(0, r * 0.12, r * 0.2, 0, Math.PI * 2);
    g.fill();
    noGlow(g);
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(0, r * 0.12, r * 0.09, 0, Math.PI * 2);
    g.fill();
  },
  phantom: (g, r, c) => {
    glow(g, c, 14);
    g.fillStyle = hexToRgba(c, 0.25);
    g.strokeStyle = c;
    g.lineWidth = 1.8;
    g.beginPath();
    g.arc(0, -r * 0.15, r * 0.8, Math.PI, 0);
    g.lineTo(r * 0.8, r * 0.85);
    for (let i = 0; i < 4; i++) {
      const x1 = r * 0.8 - (i + 0.5) * (r * 0.4);
      const x2 = r * 0.8 - (i + 1) * (r * 0.4);
      g.quadraticCurveTo(x1, r * (i % 2 === 0 ? 0.45 : 1.1), x2, r * 0.85);
    }
    g.closePath();
    g.fill();
    g.stroke();
    noGlow(g);
    g.fillStyle = "#fff";
    g.beginPath();
    g.ellipse(-r * 0.3, -r * 0.2, r * 0.13, r * 0.22, 0, 0, Math.PI * 2);
    g.ellipse(r * 0.3, -r * 0.2, r * 0.13, r * 0.22, 0, 0, Math.PI * 2);
    g.fill();
  },
  brute: (g, r, c) => {
    glow(g, c, 12);
    g.fillStyle = "#150a1f";
    g.strokeStyle = c;
    g.lineWidth = 2.5;
    // шипы
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.beginPath();
      g.moveTo(Math.cos(a - 0.18) * r * 0.75, Math.sin(a - 0.18) * r * 0.75);
      g.lineTo(Math.cos(a) * r * 1.05, Math.sin(a) * r * 1.05);
      g.lineTo(Math.cos(a + 0.18) * r * 0.75, Math.sin(a + 0.18) * r * 0.75);
      g.closePath();
      g.fill();
      g.stroke();
    }
    g.beginPath();
    g.roundRect(-r * 0.78, -r * 0.78, r * 1.56, r * 1.56, r * 0.35);
    g.fill();
    g.stroke();
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(-r * 0.5, -r * 0.5);
    g.lineTo(-r * 0.15, -r * 0.1);
    g.lineTo(-r * 0.4, r * 0.4);
    g.moveTo(r * 0.5, -r * 0.45);
    g.lineTo(r * 0.2, 0);
    g.lineTo(r * 0.45, r * 0.5);
    g.stroke();
    g.fillStyle = c;
    g.beginPath();
    g.arc(0, 0, r * 0.26, 0, Math.PI * 2);
    g.fill();
    noGlow(g);
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(0, 0, r * 0.12, 0, Math.PI * 2);
    g.fill();
  },
  crate: (g, r, c) => {
    glow(g, c, 10);
    g.fillStyle = "#06141c";
    g.strokeStyle = c;
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7, 3);
    g.fill();
    g.stroke();
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(-r * 0.85, -r * 0.85);
    g.lineTo(r * 0.85, r * 0.85);
    g.moveTo(r * 0.85, -r * 0.85);
    g.lineTo(-r * 0.85, r * 0.85);
    g.stroke();
    g.fillStyle = "#fde047";
    g.fillRect(-r * 0.3, -r * 0.3, r * 0.6, r * 0.6);
  },
  sentinel: (g, r, c) => {
    glow(g, c, 18);
    g.fillStyle = "#16040a";
    g.strokeStyle = c;
    g.lineWidth = 3;
    poly(g, 6, r, 0);
    g.fill();
    g.stroke();
    g.lineWidth = 2;
    poly(g, 6, r * 0.7, Math.PI / 6);
    g.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      g.beginPath();
      g.moveTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7);
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      g.stroke();
    }
    g.fillStyle = c;
    g.beginPath();
    g.arc(0, 0, r * 0.32, 0, Math.PI * 2);
    g.fill();
    noGlow(g);
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(0, 0, r * 0.14, 0, Math.PI * 2);
    g.fill();
  },
  queen: (g, r, c) => {
    glow(g, c, 18);
    // крылья
    g.fillStyle = hexToRgba(c, 0.18);
    g.strokeStyle = c;
    g.lineWidth = 2;
    for (const s of [-1, 1]) {
      g.beginPath();
      g.ellipse(s * r * 0.7, -r * 0.2, r * 0.55, r * 0.28, s * 0.5, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.beginPath();
      g.ellipse(s * r * 0.62, r * 0.25, r * 0.45, r * 0.22, -s * 0.4, 0, Math.PI * 2);
      g.fill();
      g.stroke();
    }
    g.fillStyle = "#1a0420";
    g.lineWidth = 2.5;
    // брюшко
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.ellipse(0, r * (0.25 + i * 0.25), r * (0.42 - i * 0.08), r * 0.18, 0, 0, Math.PI * 2);
      g.fill();
      g.stroke();
    }
    // голова
    g.beginPath();
    g.ellipse(0, -r * 0.25, r * 0.45, r * 0.38, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    // корона
    g.beginPath();
    for (let i = -2; i <= 2; i++) {
      g.moveTo(i * r * 0.14 - r * 0.06, -r * 0.55);
      g.lineTo(i * r * 0.14, -r * (0.85 - Math.abs(i) * 0.08));
      g.lineTo(i * r * 0.14 + r * 0.06, -r * 0.55);
    }
    g.stroke();
    noGlow(g);
    g.fillStyle = "#fef08a";
    for (const [ex, ey] of [[-0.18, -0.3], [0.18, -0.3], [-0.08, -0.14], [0.08, -0.14]]) {
      g.beginPath();
      g.arc(ex * r, ey * r, r * 0.06, 0, Math.PI * 2);
      g.fill();
    }
  },
  omega: (g, r, c) => {
    glow(g, c, 22);
    g.fillStyle = "#1a0404";
    g.strokeStyle = c;
    g.lineWidth = 3;
    g.beginPath();
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const rr = i % 2 === 0 ? r : r * 0.78;
      const x = Math.cos(a) * rr;
      const y = Math.sin(a) * rr;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.fill();
    g.stroke();
    g.lineWidth = 2;
    g.beginPath();
    g.arc(0, 0, r * 0.62, 0, Math.PI * 2);
    g.stroke();
    const grd = g.createRadialGradient(0, 0, r * 0.05, 0, 0, r * 0.5);
    grd.addColorStop(0, "#ffffff");
    grd.addColorStop(0.25, "#fecaca");
    grd.addColorStop(0.55, c);
    grd.addColorStop(1, "#450a0a");
    g.fillStyle = grd;
    g.beginPath();
    g.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    g.fill();
    noGlow(g);
    g.fillStyle = "#0a0000";
    g.beginPath();
    g.ellipse(0, 0, r * 0.09, r * 0.3, 0, 0, Math.PI * 2);
    g.fill();
  },
};

// Гнездо улья: пульсирующий органический кокон (рисуется отдельно, т.к. ENEMY_DRAW объявлен выше)
ENEMY_DRAW.nest = (g, r, c) => {
  glow(g, c, 14);
  g.fillStyle = "#0f1405";
  g.strokeStyle = c;
  g.lineWidth = 2.5;
  g.beginPath();
  for (let i = 0; i <= 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const rr = r * (0.86 + (i % 2 ? 0.14 : 0));
    if (i === 0) g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  g.closePath();
  g.fill();
  g.stroke();
  g.lineWidth = 1.5;
  g.strokeStyle = hexToRgba(c, 0.7);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + 0.3;
    g.beginPath();
    g.arc(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, r * 0.2, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = "#eab308";
  g.beginPath();
  g.arc(0, 0, r * 0.26, 0, Math.PI * 2);
  g.fill();
  noGlow(g);
  g.fillStyle = "#1a1200";
  g.beginPath();
  g.ellipse(0, 0, r * 0.08, r * 0.2, 0, 0, Math.PI * 2);
  g.fill();
};

const enemyCache = new Map<string, Sprite>();

export function getEnemySprite(id: string, radius: number, color: string): Sprite {
  const key = id + "|" + radius + "|" + color;
  let s = enemyCache.get(key);
  if (!s) {
    const draw = ENEMY_DRAW[id] || ENEMY_DRAW.drone;
    s = makeSprite(radius, Math.max(10, radius * 0.45), (g, r) => draw(g, r, color), true);
    enemyCache.set(key, s);
  }
  return s;
}

// ------------------------------------------------------------
//  Свечение (радиальный градиент) — для частиц и вспышек
// ------------------------------------------------------------
const glowCache = new Map<string, HTMLCanvasElement>();

export function getGlow(color: string): HTMLCanvasElement {
  let c = glowCache.get(color);
  if (!c) {
    c = makeCanvas(64);
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.18, hexToRgba(color, 0.95));
    grd.addColorStop(0.5, hexToRgba(color, 0.35));
    grd.addColorStop(1, hexToRgba(color, 0));
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    glowCache.set(color, c);
  }
  return c;
}

// ------------------------------------------------------------
//  Снаряды и предметы
// ------------------------------------------------------------
const miscCache = new Map<string, Sprite>();

function cached(key: string, build: () => Sprite) {
  let s = miscCache.get(key);
  if (!s) {
    s = build();
    miscCache.set(key, s);
  }
  return s;
}

export function getBoltSprite(color: string, r: number) {
  return cached("bolt" + color + r, () =>
    makeSprite(r, r * 1.6, (g) => {
      glow(g, color, r * 2.2);
      g.fillStyle = color;
      g.beginPath();
      g.ellipse(0, 0, r * 1.5, r * 0.8, 0, 0, Math.PI * 2);
      g.fill();
      noGlow(g);
      g.fillStyle = "#fff";
      g.beginPath();
      g.ellipse(r * 0.2, 0, r * 0.9, r * 0.4, 0, 0, Math.PI * 2);
      g.fill();
    }),
  );
}

export function getOrbSprite(color: string, r: number) {
  return cached("orb" + color + r, () =>
    makeSprite(r, r * 1.4, (g) => {
      glow(g, color, r * 2);
      g.fillStyle = color;
      g.beginPath();
      g.arc(0, 0, r, 0, Math.PI * 2);
      g.fill();
      noGlow(g);
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(0, 0, r * 0.45, 0, Math.PI * 2);
      g.fill();
    }),
  );
}

export function getMissileSprite(color: string) {
  return cached("missile" + color, () =>
    makeSprite(10, 8, (g) => {
      glow(g, color, 8);
      g.fillStyle = "#1f1308";
      g.strokeStyle = color;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(10, 0);
      g.lineTo(3, -3.5);
      g.lineTo(-7, -3.5);
      g.lineTo(-10, -6);
      g.lineTo(-9, 0);
      g.lineTo(-10, 6);
      g.lineTo(-7, 3.5);
      g.lineTo(3, 3.5);
      g.closePath();
      g.fill();
      g.stroke();
      g.fillStyle = color;
      g.fillRect(-2, -1.5, 6, 3);
    }),
  );
}

export function getDiscSprite(color: string, r: number) {
  return cached("disc" + color + r, () =>
    makeSprite(r, r * 0.8, (g) => {
      glow(g, color, r);
      g.strokeStyle = color;
      g.lineWidth = r * 0.22;
      g.beginPath();
      g.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = hexToRgba(color, 0.25);
      g.beginPath();
      g.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = r * 0.14;
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        g.stroke();
        g.beginPath();
        g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        g.lineTo(Math.cos(a + 0.6) * r * 1.15, Math.sin(a + 0.6) * r * 1.15);
        g.stroke();
      }
      noGlow(g);
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(0, 0, r * 0.2, 0, Math.PI * 2);
      g.fill();
    }),
  );
}

export function getOrbiterSprite(color: string, r: number) {
  return cached("orbiter" + color + r, () =>
    makeSprite(r, r, (g) => {
      glow(g, color, r * 1.2);
      g.fillStyle = "#140a24";
      g.strokeStyle = color;
      g.lineWidth = 2;
      poly(g, 4, r, 0);
      g.fill();
      g.stroke();
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(-r * 1.25, 0);
      g.lineTo(r * 1.25, 0);
      g.stroke();
      g.fillStyle = color;
      g.beginPath();
      g.arc(0, 0, r * 0.4, 0, Math.PI * 2);
      g.fill();
      noGlow(g);
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(0, 0, r * 0.18, 0, Math.PI * 2);
      g.fill();
    }),
  );
}

export const GEM_COLORS = ["#22d3ee", "#4ade80", "#facc15", "#f472b6"];

export function gemTier(value: number) {
  if (value < 3) return 0;
  if (value < 10) return 1;
  if (value < 30) return 2;
  return 3;
}

export function getGemSprite(tier: number) {
  const color = GEM_COLORS[tier];
  const r = 5 + tier * 1.6;
  return cached("gem" + tier, () =>
    makeSprite(r, 8, (g) => {
      glow(g, color, 8);
      g.fillStyle = hexToRgba(color, 0.85);
      g.strokeStyle = "#fff";
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, -r * 1.25);
      g.lineTo(r * 0.8, 0);
      g.lineTo(0, r * 1.25);
      g.lineTo(-r * 0.8, 0);
      g.closePath();
      g.fill();
      noGlow(g);
      g.stroke();
      g.fillStyle = "rgba(255,255,255,0.7)";
      g.beginPath();
      g.moveTo(0, -r * 1.25);
      g.lineTo(r * 0.3, -r * 0.1);
      g.lineTo(-r * 0.3, -r * 0.1);
      g.closePath();
      g.fill();
    }),
  );
}

export type PickupKind = "medkit" | "magnet" | "bomb" | "freeze" | "chest" | "coin" | "bigcoin";

export const PICKUP_COLORS: Record<PickupKind, string> = {
  medkit: "#4ade80",
  magnet: "#a78bfa",
  bomb: "#f97316",
  freeze: "#7dd3fc",
  chest: "#fbbf24",
  coin: "#facc15",
  bigcoin: "#fde047",
};

export function getPickupSprite(kind: PickupKind) {
  const color = PICKUP_COLORS[kind];
  return cached("pk" + kind, () => {
    const r = kind === "chest" ? 16 : kind === "coin" ? 7 : kind === "bigcoin" ? 10 : 12;
    return makeSprite(r, 12, (g) => {
      glow(g, color, 12);
      g.lineWidth = 2;
      g.strokeStyle = color;
      if (kind === "coin" || kind === "bigcoin") {
        g.fillStyle = "#2a1f02";
        poly(g, 6, r, Math.PI / 6);
        g.fill();
        g.stroke();
        noGlow(g);
        g.fillStyle = color;
        poly(g, 4, r * 0.45, 0);
        g.fill();
        return;
      }
      g.fillStyle = "#0b1020";
      g.beginPath();
      g.roundRect(-r, -r, r * 2, r * 2, kind === "chest" ? 4 : r * 0.45);
      g.fill();
      g.stroke();
      noGlow(g);
      g.fillStyle = color;
      g.strokeStyle = color;
      if (kind === "medkit") {
        g.fillRect(-r * 0.18, -r * 0.6, r * 0.36, r * 1.2);
        g.fillRect(-r * 0.6, -r * 0.18, r * 1.2, r * 0.36);
      } else if (kind === "magnet") {
        g.lineWidth = r * 0.28;
        g.lineCap = "butt";
        g.beginPath();
        g.arc(0, -r * 0.05, r * 0.45, Math.PI, 0, true);
        g.lineTo(r * 0.45, r * 0.55);
        g.moveTo(-r * 0.45, -r * 0.05);
        g.lineTo(-r * 0.45, r * 0.55);
        g.stroke();
        g.fillStyle = "#fff";
        g.fillRect(-r * 0.6, r * 0.35, r * 0.3, r * 0.22);
        g.fillRect(r * 0.3, r * 0.35, r * 0.3, r * 0.22);
      } else if (kind === "bomb") {
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
          g.beginPath();
          g.moveTo(0, 0);
          g.arc(0, 0, r * 0.7, a - 0.45, a + 0.45);
          g.closePath();
          g.fill();
        }
        g.fillStyle = "#0b1020";
        g.beginPath();
        g.arc(0, 0, r * 0.2, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = color;
        g.beginPath();
        g.arc(0, 0, r * 0.12, 0, Math.PI * 2);
        g.fill();
      } else if (kind === "freeze") {
        g.lineWidth = 1.8;
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI;
          g.beginPath();
          g.moveTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7);
          g.lineTo(-Math.cos(a) * r * 0.7, -Math.sin(a) * r * 0.7);
          g.stroke();
        }
        g.beginPath();
        g.arc(0, 0, r * 0.2, 0, Math.PI * 2);
        g.fill();
      } else if (kind === "chest") {
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(-r, -r * 0.2);
        g.lineTo(r, -r * 0.2);
        g.stroke();
        g.fillRect(-r * 0.22, -r * 0.45, r * 0.44, r * 0.5);
        g.fillStyle = "#fff";
        g.fillRect(-r * 0.08, -r * 0.3, r * 0.16, r * 0.2);
      }
    });
  });
}

// ============================================================
//  Неон 2.0 (графика коллеги): корпуса пилотов, пламя двигателей, анимированные враги
// ============================================================
type Pt = [number, number];
const TAU2 = Math.PI * 2;

const rgb = (hex: string): [number, number, number] => {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};
const rgba = (hex: string, a: number) => {
  const [r, g, b] = rgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};
const mix = (a: string, b: string, t: number) => {
  const x = rgb(a);
  const y = rgb(b);
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
const lighten = (c: string, t = 0.45) => mix(c, "#ffffff", t);
const darken = (c: string, t = 0.5) => mix(c, "#000000", t);
const shadowOn = (g: CanvasRenderingContext2D, c: string, b: number) => {
  g.shadowColor = c;
  g.shadowBlur = b;
};
const shadowOff = (g: CanvasRenderingContext2D) => {
  g.shadowBlur = 0;
};
const ngon = (g: CanvasRenderingContext2D, n: number, r: number, rot = 0) => {
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * TAU2;
    if (i) g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    else g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.closePath();
};
const path = (g: CanvasRenderingContext2D, pts: Pt[], s: number) => {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x * s, y * s) : g.moveTo(x * s, y * s)));
  g.closePath();
};
// корпус симметричен по оси X: задаём верхнюю половину, нижняя — зеркало
const mirrorHull = (pts: Pt[]): Pt[] => [...pts, ...pts.slice().reverse().filter(([, y]) => y !== 0).map(([x, y]) => [x, -y] as Pt)];
// светящееся ядро
const core = (g: CanvasRenderingContext2D, r: number, c: string, k: number, x = 0, y = 0) => {
  const grd = g.createRadialGradient(x, y, 0, x, y, r * k);
  grd.addColorStop(0, "#ffffff");
  grd.addColorStop(0.35, lighten(c, 0.2));
  grd.addColorStop(1, rgba(c, 0));
  g.fillStyle = grd;
  g.beginPath();
  g.arc(x, y, r * k, 0, TAU2);
  g.fill();
};
const hullFill = (g: CanvasRenderingContext2D, c: string, r: number, t = 0.62) => {
  const grd = g.createLinearGradient(r, -r, -r, r);
  grd.addColorStop(0, darken(c, t));
  grd.addColorStop(1, "#05070f");
  return grd;
};

interface ShipDef {
  hull: Pt[];
  engines: Pt[];
  cockpit: [number, number, number];
  flame: number;
  extra?: (g: CanvasRenderingContext2D, r: number, c: string) => void;
}

const SHIPS: Record<string, ShipDef> = {
  recruit: {
    hull: mirrorHull([[1.15, 0], [0.45, -0.2], [-0.15, -0.34], [-0.6, -0.95], [-0.82, -0.9], [-0.55, -0.3], [-0.86, -0.22]]),
    engines: [[-0.86, -0.13], [-0.86, 0.13]],
    cockpit: [0.38, 0.24, 0.12],
    flame: 0.65,
    extra: (g, r, c) => {
      g.fillStyle = c;
      for (const s of [-1, 1]) g.fillRect(0.05 * r, s * 0.55 * r - 0.04 * r, 0.7 * r, 0.08 * r);
    },
  },
  reiji: {
    hull: mirrorHull([[1.25, 0], [0.3, -0.14], [0.62, -0.72], [0.78, -0.98], [0.18, -0.62], [-0.4, -0.32], [-0.86, -0.24]]),
    engines: [[-0.86, -0.12], [-0.86, 0.12]],
    cockpit: [0.3, 0.22, 0.1],
    flame: 0.6,
    extra: (g, r, c) => {
      g.strokeStyle = lighten(c, 0.5);
      g.lineWidth = 1.4;
      for (const s of [-1, 1]) {
        g.beginPath();
        g.moveTo(0.32 * r, s * 0.18 * r);
        g.lineTo(0.74 * r, s * 0.92 * r);
        g.stroke();
      }
    },
  },
  nova: {
    hull: mirrorHull([[0.95, 0], [0.72, -0.38], [0.2, -0.58], [-0.4, -0.58], [-0.84, -0.32], [-0.9, 0]]),
    engines: [[-0.88, -0.18], [-0.88, 0.18]],
    cockpit: [0.45, 0.22, 0.15],
    flame: 0.55,
    extra: (g, r, c) => {
      for (const s of [-1, 1]) {
        g.fillStyle = "#0b0f1c";
        g.strokeStyle = c;
        g.lineWidth = 1.6;
        g.beginPath();
        g.arc(-0.1 * r, s * 0.78 * r, 0.24 * r, 0, TAU2);
        g.fill();
        g.stroke();
        core(g, r, c, 0.13, -0.1 * r, s * 0.78 * r);
      }
    },
  },
  volt: {
    hull: mirrorHull([[1, 0], [0.5, -0.3], [-0.2, -0.35], [-0.5, -0.82], [-0.8, -0.76], [-0.74, -0.3], [-0.9, -0.2]]),
    engines: [[-0.9, -0.1], [-0.9, 0.1]],
    cockpit: [0.4, 0.22, 0.12],
    flame: 0.6,
    extra: (g, r, c) => {
      g.strokeStyle = lighten(c, 0.2);
      g.lineWidth = 2;
      for (const x of [0.12, -0.25]) {
        g.beginPath();
        g.ellipse(x * r, 0, 0.08 * r, 0.52 * r, 0, 0, TAU2);
        g.stroke();
      }
    },
  },
  titan: {
    hull: mirrorHull([[0.95, -0.18], [0.6, -0.45], [0.1, -0.5], [-0.1, -0.95], [-0.7, -0.95], [-0.86, -0.55]]),
    engines: [[-0.86, -0.3], [-0.86, 0.3], [-0.72, -0.78], [-0.72, 0.78]],
    cockpit: [0.55, 0.2, 0.12],
    flame: 0.55,
    extra: (g, r, c) => {
      for (const s of [-1, 1]) {
        g.strokeStyle = c;
        g.fillStyle = "#0b0f1c";
        g.lineWidth = 1.5;
        g.beginPath();
        g.roundRect(-0.55 * r, s * 0.72 * r - 0.14 * r, 0.75 * r, 0.28 * r, 3);
        g.fill();
        g.stroke();
        g.fillStyle = lighten(c, 0.3);
        for (let k = 0; k < 3; k++) {
          g.beginPath();
          g.arc((0.1 - k * 0.22) * r, s * 0.72 * r, 0.06 * r, 0, TAU2);
          g.fill();
        }
      }
    },
  },
  ghost: {
    hull: mirrorHull([[1.3, 0], [0.25, -0.09], [-0.35, -0.12], [-0.05, -0.86], [-0.22, -0.9], [-0.72, -0.16], [-0.96, -0.07]]),
    engines: [[-0.96, 0]],
    cockpit: [0.38, 0.3, 0.06],
    flame: 0.9,
  },
  echo: {
    hull: mirrorHull([[1.5, 0], [0.3, -0.08], [-0.2, -0.18], [-0.45, -0.62], [-0.62, -0.62], [-0.55, -0.16], [-0.9, -0.1]]),
    engines: [[-0.9, 0]],
    cockpit: [0.25, 0.26, 0.07],
    flame: 0.75,
    extra: (g, r, c) => {
      g.strokeStyle = c;
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(0.6 * r, 0);
      g.lineTo(1.65 * r, 0);
      g.stroke();
    },
  },
  bulldog: {
    hull: mirrorHull([[0.85, -0.15], [0.55, -0.5], [-0.2, -0.62], [-0.5, -0.88], [-0.86, -0.72], [-0.86, -0.3]]),
    engines: [[-0.86, -0.18], [-0.86, 0.18], [-0.82, -0.55], [-0.82, 0.55]],
    cockpit: [0.38, 0.2, 0.14],
    flame: 0.5,
    extra: (g, r, c) => {
      g.fillStyle = "#1a1d27";
      g.strokeStyle = c;
      g.lineWidth = 1.3;
      for (const y of [-0.09, 0, 0.09]) {
        g.beginPath();
        g.rect(0.82 * r, (y - 0.035) * r, 0.36 * r, 0.07 * r);
        g.fill();
        g.stroke();
      }
    },
  },
  jay: {
    hull: mirrorHull([[1.35, 0], [0.5, -0.12], [0, -0.22], [-0.3, -0.76], [-0.5, -0.76], [-0.45, -0.2], [-0.85, -0.12]]),
    engines: [[-0.85, 0]],
    cockpit: [0.3, 0.24, 0.08],
    flame: 0.7,
    extra: (g, r, c) => {
      g.strokeStyle = lighten(c, 0.2);
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(0.5 * r, 0);
      g.lineTo(1.5 * r, 0);
      g.stroke();
      g.beginPath();
      g.arc(0.05 * r, 0, 0.12 * r, 0, TAU2);
      g.stroke();
    },
  },
  whaler: {
    hull: mirrorHull([[1, -0.12], [0.75, -0.5], [0.1, -0.7], [-0.45, -0.76], [-0.86, -0.45], [-0.86, 0]]),
    engines: [[-0.86, -0.25], [-0.86, 0.25]],
    cockpit: [0.5, 0.2, 0.14],
    flame: 0.55,
    extra: (g, r, c) => {
      g.strokeStyle = c;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(0.95 * r, 0);
      g.lineTo(1.45 * r, 0);
      g.stroke();
      g.fillStyle = lighten(c, 0.3);
      g.beginPath();
      g.moveTo(1.55 * r, 0);
      g.lineTo(1.35 * r, -0.12 * r);
      g.lineTo(1.4 * r, 0);
      g.lineTo(1.35 * r, 0.12 * r);
      g.closePath();
      g.fill();
    },
  },
  raven: {
    hull: mirrorHull([[1.1, 0], [0.4, -0.15], [0.1, -0.45], [-0.2, -0.96], [-0.35, -0.7], [-0.5, -0.9], [-0.6, -0.6], [-0.76, -0.76], [-0.7, -0.25], [-0.9, -0.12]]),
    engines: [[-0.9, 0]],
    cockpit: [0.4, 0.22, 0.09],
    flame: 0.7,
  },
  mole: {
    hull: mirrorHull([[0.95, 0], [0.75, -0.35], [0.3, -0.55], [-0.3, -0.55], [-0.7, -0.45], [-0.9, -0.2]]),
    engines: [[-0.9, -0.12], [-0.9, 0.12]],
    cockpit: [0.48, 0.22, 0.15],
    flame: 0.5,
    extra: (g, r, c) => {
      for (const s of [-1, 1]) {
        g.fillStyle = "#0b100a";
        g.strokeStyle = c;
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(-0.2 * r, s * 0.72 * r, 0.2 * r, 0, TAU2);
        g.fill();
        g.stroke();
        core(g, r, c, 0.12, -0.2 * r, s * 0.72 * r);
      }
    },
  },
  buffalo: {
    hull: mirrorHull([[0.9, -0.25], [1.15, -0.55], [0.85, -0.58], [0.5, -0.62], [-0.3, -0.66], [-0.86, -0.45], [-0.86, 0]]),
    engines: [[-0.86, -0.22], [-0.86, 0.22]],
    cockpit: [0.45, 0.2, 0.14],
    flame: 0.5,
    extra: (g, r, c) => {
      g.strokeStyle = rgba(c, 0.55);
      g.lineWidth = 1.2;
      for (const x of [0.6, 0.2, -0.2]) {
        g.beginPath();
        g.moveTo(x * r, -0.55 * r);
        g.lineTo(x * r, 0.55 * r);
        g.stroke();
      }
    },
  },
};

const shipDef = (id: string) => SHIPS[id] || SHIPS.recruit;

function drawShip(g: CanvasRenderingContext2D, id: string, r: number, c: string) {
  const d = shipDef(id);
  shadowOn(g, c, 14);
  g.lineWidth = 2;
  // у Призрака и Ворона корпус полупрозрачный
  g.fillStyle = id === "ghost" || id === "raven" ? rgba(darken(c, 0.55), 0.8) : hullFill(g, c, r);
  g.strokeStyle = c;
  path(g, d.hull, r);
  g.fill();
  g.stroke();
  shadowOff(g);
  g.strokeStyle = rgba(c, 0.45);
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(0.85 * r, 0);
  g.lineTo(-0.7 * r, 0);
  g.stroke();
  d.extra?.(g, r, c);
  const [cx, crx, cry] = d.cockpit;
  shadowOn(g, c, 10);
  g.fillStyle = lighten(c, 0.35);
  g.beginPath();
  g.ellipse(cx * r, 0, crx * r, cry * r, 0, 0, TAU2);
  g.fill();
  shadowOff(g);
  g.fillStyle = "rgba(255,255,255,.85)";
  g.beginPath();
  g.ellipse((cx + 0.06) * r, -cry * 0.35 * r, crx * 0.4 * r, cry * 0.3 * r, 0, 0, TAU2);
  g.fill();
}

// Пламя двигателей: рисуется каждый кадр в координатах корабля (нос по +X)
export function drawShipFlames(g: CanvasRenderingContext2D, id: string, r: number, c: string, time: number, moving: boolean) {
  const d = shipDef(id);
  const base = d.flame * (moving ? 1 : 0.55);
  d.engines.forEach(([ex, ey], i) => {
    const len = base * (0.75 + 0.25 * Math.sin(time * 38 + i * 1.7) + 0.1 * Math.sin(time * 91 + i * 5));
    const x = ex * r;
    const y = ey * r;
    const w = 0.09 * r;
    const grd = g.createLinearGradient(x, 0, x - len * r, 0);
    grd.addColorStop(0, "#ffffff");
    grd.addColorStop(0.25, lighten(c, 0.3));
    grd.addColorStop(1, rgba(c, 0));
    g.fillStyle = grd;
    g.beginPath();
    g.moveTo(x, y - w);
    g.quadraticCurveTo(x - len * r * 0.6, y, x - len * r, y);
    g.quadraticCurveTo(x - len * r * 0.6, y, x, y + w);
    g.closePath();
    g.fill();
  });
}

// Анимированные враги: t — фаза 0..1
type AnimDraw = (g: CanvasRenderingContext2D, r: number, c: string, t: number) => void;
const ANIM_FRAMES = 8;
const ANIM: Record<string, AnimDraw> = {
  drone: (g, r, c, t) => {
    g.strokeStyle = rgba(c, 0.7);
    g.lineWidth = 1.6;
    const arms: Pt[] = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
    for (const [x, y] of arms) {
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(x * r * 0.78, y * r * 0.78);
      g.stroke();
    }
    for (const [x, y] of arms) {
      const px = x * r * 0.78;
      const py = y * r * 0.78;
      const a = t * Math.PI * x;
      g.fillStyle = rgba(c, 0.14);
      g.beginPath();
      g.arc(px, py, r * 0.36, 0, TAU2);
      g.fill();
      shadowOn(g, c, 6);
      g.strokeStyle = lighten(c, 0.2);
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(px + Math.cos(a) * r * 0.34, py + Math.sin(a) * r * 0.34);
      g.lineTo(px - Math.cos(a) * r * 0.34, py - Math.sin(a) * r * 0.34);
      g.stroke();
      shadowOff(g);
    }
    shadowOn(g, c, 10);
    g.fillStyle = "#1a0610";
    g.strokeStyle = c;
    g.lineWidth = 2;
    path(g, [[0, -0.62], [0.62, 0], [0, 0.62], [-0.62, 0]], r);
    g.fill();
    g.stroke();
    shadowOff(g);
    core(g, r, c, 0.32 + 0.1 * Math.sin(t * TAU2));
  },
  swarm: (g, r, c, t) => {
    const f = Math.sin(t * TAU2);
    g.strokeStyle = rgba(lighten(c, 0.3), 0.8);
    g.fillStyle = rgba(c, 0.18);
    g.lineWidth = 1;
    for (const s of [-1, 1]) {
      g.beginPath();
      g.ellipse(s * r * 0.55, r * 0.1, r * 0.5, r * (0.18 + 0.12 * f), s * 0.5, 0, TAU2);
      g.fill();
      g.stroke();
    }
    shadowOn(g, c, 8);
    g.fillStyle = rgba(c, 0.4);
    g.strokeStyle = c;
    g.lineWidth = 1.6;
    ngon(g, 3, r * 0.8, -Math.PI / 2);
    g.fill();
    g.stroke();
    shadowOff(g);
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(0, r * 0.1, r * 0.2, 0, TAU2);
    g.fill();
  },
  trooper: (g, r, c, t) => {
    shadowOn(g, c, 9);
    g.fillStyle = "#1c0f06";
    g.strokeStyle = c;
    g.lineWidth = 2;
    ngon(g, 6, r, Math.PI / 6);
    g.fill();
    g.stroke();
    shadowOff(g);
    g.strokeStyle = rgba(c, 0.45);
    g.lineWidth = 1;
    ngon(g, 6, r * 0.72, Math.PI / 6);
    g.stroke();
    g.fillStyle = darken(c, 0.3);
    g.fillRect(-r * 0.62, -r * 0.32, r * 1.24, r * 0.26);
    // бегающий визор
    const vx = Math.sin(t * TAU2) * r * 0.5;
    shadowOn(g, "#fff", 8);
    g.fillStyle = "#fff";
    g.fillRect(vx - r * 0.1, -r * 0.3, r * 0.2, r * 0.22);
    shadowOff(g);
    g.strokeStyle = c;
    g.lineWidth = 1.4;
    g.strokeRect(-r * 0.4, r * 0.12, r * 0.8, r * 0.42);
    g.fillStyle = rgba(c, 0.5);
    g.fillRect(-r * 0.3, r * 0.22, r * 0.6 * (0.5 + 0.5 * Math.sin(t * TAU2 * 2)), r * 0.22);
  },
  crawler: (g, r, c, t) => {
    g.lineWidth = 1.6;
    g.strokeStyle = c;
    shadowOn(g, c, 6);
    for (let k = 0; k < 3; k++)
      for (const s of [-1, 1]) {
        const off = -0.6 + k * 0.6;
        const sw = Math.sin(t * TAU2 + k * 2.1 + (s > 0 ? Math.PI : 0)) * 0.28;
        const a = s * (Math.PI / 2 + off * 0.9 + sw);
        const kx = Math.cos(a) * r * 0.7;
        const ky = Math.sin(a) * r * 0.7;
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(kx, ky);
        g.lineTo(kx + Math.cos(a - s * 0.9) * r * 0.45, ky + Math.sin(a - s * 0.9) * r * 0.45);
        g.stroke();
      }
    shadowOff(g);
    const seg = (x: number, rx: number, ry: number) => {
      g.fillStyle = "#0d1604";
      g.strokeStyle = c;
      g.lineWidth = 1.8;
      g.beginPath();
      g.ellipse(x * r, 0, rx * r, ry * r, 0, 0, TAU2);
      g.fill();
      g.stroke();
    };
    shadowOn(g, c, 8);
    seg(-0.5, 0.42, 0.36);
    seg(0, 0.32, 0.3);
    seg(0.42, 0.27, 0.26);
    shadowOff(g);
    const m = Math.sin(t * TAU2 * 2) * 0.15;
    g.strokeStyle = lighten(c, 0.3);
    g.lineWidth = 1.6;
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(0.62 * r, s * 0.1 * r);
      g.quadraticCurveTo(0.85 * r, s * (0.25 + m) * r, 0.95 * r, s * 0.04 * r);
      g.stroke();
    }
    g.fillStyle = "#fef08a";
    shadowOn(g, "#fef08a", 6);
    for (const s of [-1, 1]) {
      g.beginPath();
      g.arc(0.5 * r, s * 0.11 * r, 0.07 * r, 0, TAU2);
      g.fill();
    }
    shadowOff(g);
  },
  gunner: (g, r, c, t) => {
    shadowOn(g, c, 9);
    g.fillStyle = "#1a1604";
    g.strokeStyle = c;
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7, r * 0.3);
    g.fill();
    g.stroke();
    const a0 = t * (TAU2 / 4) + Math.PI / 4;
    g.lineWidth = 3;
    for (let k = 0; k < 4; k++) {
      const a = a0 + (k / 4) * TAU2;
      g.beginPath();
      g.moveTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5);
      g.lineTo(Math.cos(a) * r * 1.15, Math.sin(a) * r * 1.15);
      g.stroke();
    }
    shadowOff(g);
    g.lineWidth = 2;
    g.strokeStyle = c;
    g.beginPath();
    g.arc(0, 0, r * 0.45, 0, TAU2);
    g.stroke();
    core(g, r, c, 0.3 + 0.06 * Math.sin(t * TAU2));
  },
  kamikaze: (g, r, c, t) => {
    shadowOn(g, c, 12);
    g.fillStyle = "#200404";
    g.strokeStyle = c;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(0, 0, r, 0, TAU2);
    g.fill();
    g.stroke();
    shadowOff(g);
    const a0 = t * (TAU2 / 6);
    g.fillStyle = "#facc15";
    for (let k = 0; k < 6; k++) {
      const a = a0 + (k / 6) * TAU2;
      g.beginPath();
      g.moveTo(0, 0);
      g.arc(0, 0, r * 0.78, a, a + Math.PI / 6);
      g.closePath();
      g.fill();
    }
    g.fillStyle = "#200404";
    g.beginPath();
    g.arc(0, 0, r * 0.45, 0, TAU2);
    g.fill();
    core(g, r, c, 0.4 + 0.15 * Math.sin(t * TAU2 * 2));
  },
  mech: (g, r, c, t) => {
    const f = Math.sin(t * TAU2);
    shadowOn(g, c, 10);
    g.fillStyle = "#1c1204";
    g.strokeStyle = c;
    g.lineWidth = 2.2;
    for (const s of [-1, 1]) {
      const st = f * s * r * 0.18;
      g.beginPath();
      g.roundRect(s * r * 0.55 - r * 0.18, r * 0.55 + st, r * 0.36, r * 0.38, r * 0.08);
      g.fill();
      g.stroke();
    }
    for (const x of [-1.05, 0.7]) {
      g.fillRect(x * r, -r * 0.25, r * 0.35, r * 0.9);
      g.strokeRect(x * r, -r * 0.25, r * 0.35, r * 0.9);
    }
    ngon(g, 8, r * 0.82, Math.PI / 8);
    g.fill();
    g.stroke();
    shadowOff(g);
    g.lineWidth = 1.5;
    g.strokeStyle = rgba(c, 0.6);
    ngon(g, 8, r * 0.55, Math.PI / 8);
    g.stroke();
    g.fillStyle = c;
    g.fillRect(-r * 0.45, -r * 0.42, r * 0.9, r * 0.16);
    core(g, r, c, 0.26, 0, r * 0.12);
  },
  phantom: (g, r, c, t) => {
    shadowOn(g, c, 14);
    g.fillStyle = rgba(c, 0.25);
    g.strokeStyle = c;
    g.lineWidth = 1.8;
    g.beginPath();
    g.arc(0, -r * 0.15, r * 0.8, Math.PI, 0);
    g.lineTo(r * 0.8, r * 0.85);
    for (let k = 0; k < 4; k++) {
      const x1 = r * 0.8 - (k + 0.5) * (r * 0.4);
      const x2 = r * 0.8 - (k + 1) * (r * 0.4);
      const w = Math.sin(t * TAU2 + k * 1.6) * 0.22;
      g.quadraticCurveTo(x1, r * ((k % 2 === 0 ? 0.45 : 1.1) + w), x2, r * 0.85);
    }
    g.closePath();
    g.fill();
    g.stroke();
    shadowOff(g);
    g.fillStyle = "#fff";
    const blink = t > 0.9 ? 0.25 : 1;
    g.beginPath();
    g.ellipse(-r * 0.3, -r * 0.2, r * 0.13, r * 0.22 * blink, 0, 0, TAU2);
    g.ellipse(r * 0.3, -r * 0.2, r * 0.13, r * 0.22 * blink, 0, 0, TAU2);
    g.fill();
  },
  brute: (g, r, c, t) => {
    const a0 = t * (TAU2 / 10);
    shadowOn(g, c, 12);
    g.fillStyle = "#150a1f";
    g.strokeStyle = c;
    g.lineWidth = 2.2;
    for (let k = 0; k < 10; k++) {
      const a = a0 + (k / 10) * TAU2;
      g.beginPath();
      g.moveTo(Math.cos(a - 0.16) * r * 0.78, Math.sin(a - 0.16) * r * 0.78);
      g.lineTo(Math.cos(a) * r * 1.08, Math.sin(a) * r * 1.08);
      g.lineTo(Math.cos(a + 0.16) * r * 0.78, Math.sin(a + 0.16) * r * 0.78);
      g.closePath();
      g.fill();
      g.stroke();
    }
    g.beginPath();
    g.roundRect(-r * 0.74, -r * 0.74, r * 1.48, r * 1.48, r * 0.36);
    g.fill();
    g.stroke();
    shadowOff(g);
    g.strokeStyle = rgba(c, 0.5);
    g.lineWidth = 1.4;
    for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as Pt[]) {
      g.beginPath();
      g.roundRect(x * r * 0.42 - r * 0.22, y * r * 0.42 - r * 0.22, r * 0.44, r * 0.44, r * 0.1);
      g.stroke();
    }
    const pl = 0.5 + 0.5 * Math.sin(t * TAU2);
    g.strokeStyle = rgba(lighten(c, 0.4), 0.4 + pl * 0.5);
    g.lineWidth = 1.5;
    shadowOn(g, c, 10);
    g.beginPath();
    g.moveTo(-r * 0.5, -r * 0.1);
    g.lineTo(-r * 0.2, 0);
    g.lineTo(-r * 0.32, r * 0.3);
    g.moveTo(r * 0.45, r * 0.05);
    g.lineTo(r * 0.18, -r * 0.05);
    g.lineTo(r * 0.3, -r * 0.35);
    g.stroke();
    shadowOff(g);
    core(g, r, c, 0.36 + pl * 0.1);
  },
  crate: (g, r, c, t) => {
    shadowOn(g, c, 10);
    g.fillStyle = "#06141c";
    g.strokeStyle = c;
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7, 3);
    g.fill();
    g.stroke();
    shadowOff(g);
    g.lineWidth = 1.2;
    g.strokeStyle = rgba(c, 0.6);
    g.beginPath();
    g.moveTo(-r * 0.85, -r * 0.85);
    g.lineTo(r * 0.85, r * 0.85);
    g.moveTo(r * 0.85, -r * 0.85);
    g.lineTo(-r * 0.85, r * 0.85);
    g.stroke();
    g.fillStyle = "#fde047";
    g.fillRect(-r * 0.3, -r * 0.3, r * 0.6, r * 0.6);
    if (t < 0.5) {
      shadowOn(g, "#fde047", 10);
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(r * 0.62, -r * 0.62, r * 0.12, 0, TAU2);
      g.fill();
      shadowOff(g);
    }
  },
  sentinel: (g, r, c, t) => {
    const a0 = t * (TAU2 / 6);
    shadowOn(g, c, 18);
    g.fillStyle = "#140a02";
    g.strokeStyle = c;
    g.lineWidth = 3;
    ngon(g, 6, r, Math.PI / 6);
    g.fill();
    g.stroke();
    shadowOff(g);
    g.strokeStyle = rgba(c, 0.45);
    g.lineWidth = 1.4;
    ngon(g, 6, r * 0.82, Math.PI / 6);
    g.stroke();
    for (let k = 0; k < 6; k++) {
      const a = Math.PI / 6 + (k / 6) * TAU2;
      g.beginPath();
      g.moveTo(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82);
      g.lineTo(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55);
      g.stroke();
      const lit = (k + Math.floor(t * 6)) % 3 === 0;
      g.fillStyle = lit ? "#fff" : rgba(c, 0.35);
      if (lit) shadowOn(g, c, 8);
      g.beginPath();
      g.arc(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9, r * 0.035, 0, TAU2);
      g.fill();
      shadowOff(g);
    }
    g.strokeStyle = c;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(0, 0, r * 0.55, 0, TAU2);
    g.stroke();
    for (let k = 0; k < 6; k++) {
      const a = a0 + (k / 6) * TAU2;
      g.save();
      g.translate(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55);
      g.rotate(a);
      shadowOn(g, c, 8);
      g.fillStyle = "#1c1206";
      g.strokeStyle = c;
      g.lineWidth = 1.6;
      g.beginPath();
      g.roundRect(-r * 0.09, -r * 0.09, r * 0.18, r * 0.18, 3);
      g.fill();
      g.stroke();
      g.fillStyle = c;
      g.fillRect(r * 0.09, -r * 0.025, r * 0.16, r * 0.05);
      shadowOff(g);
      g.restore();
    }
    core(g, r, c, 0.36 + 0.06 * Math.sin(t * TAU2));
  },
  queen: (g, r, c, t) => {
    const fl = 1 + 0.14 * Math.sin(t * TAU2);
    shadowOn(g, c, 18);
    g.fillStyle = rgba(c, 0.18);
    g.strokeStyle = c;
    g.lineWidth = 2;
    for (const s of [-1, 1]) {
      g.beginPath();
      g.ellipse(s * r * 0.7, -r * 0.2, r * 0.55 * fl, r * 0.28, s * 0.5, 0, TAU2);
      g.fill();
      g.stroke();
      g.beginPath();
      g.ellipse(s * r * 0.62, r * 0.25, r * 0.45 * fl, r * 0.22, -s * 0.4, 0, TAU2);
      g.fill();
      g.stroke();
    }
    g.fillStyle = "#1a0420";
    g.lineWidth = 2.5;
    const br = 1 + 0.06 * Math.sin(t * TAU2 * 2);
    for (let k = 0; k < 3; k++) {
      g.beginPath();
      g.ellipse(0, r * (0.25 + k * 0.25), r * (0.42 - k * 0.08) * br, r * 0.18, 0, 0, TAU2);
      g.fill();
      g.stroke();
    }
    g.beginPath();
    g.ellipse(0, -r * 0.25, r * 0.45, r * 0.38, 0, 0, TAU2);
    g.fill();
    g.stroke();
    g.beginPath();
    for (let k = -2; k <= 2; k++) {
      g.moveTo(k * r * 0.14 - r * 0.06, -r * 0.55);
      g.lineTo(k * r * 0.14, -r * (0.85 - Math.abs(k) * 0.08));
      g.lineTo(k * r * 0.14 + r * 0.06, -r * 0.55);
    }
    g.stroke();
    shadowOff(g);
    g.fillStyle = "#fef08a";
    for (const [x, y] of [[-0.18, -0.3], [0.18, -0.3], [-0.08, -0.14], [0.08, -0.14]] as Pt[]) {
      g.beginPath();
      g.arc(x * r, y * r, r * 0.06, 0, TAU2);
      g.fill();
    }
  },
  omega: (g, r, c, t) => {
    const a0 = t * (TAU2 / 12);
    shadowOn(g, c, 22);
    g.fillStyle = "#1a0404";
    g.strokeStyle = c;
    g.lineWidth = 3;
    g.beginPath();
    for (let k = 0; k < 24; k++) {
      const a = a0 + (k / 24) * TAU2;
      const rr = k % 2 === 0 ? r : r * 0.78;
      if (k === 0) g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      else g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    g.closePath();
    g.fill();
    g.stroke();
    g.lineWidth = 2;
    g.setLineDash([r * 0.2, r * 0.12]);
    g.lineDashOffset = -t * r * 0.64;
    g.beginPath();
    g.arc(0, 0, r * 0.62, 0, TAU2);
    g.stroke();
    g.setLineDash([]);
    shadowOff(g);
    const pl = 1 + 0.08 * Math.sin(t * TAU2);
    const grd = g.createRadialGradient(0, 0, r * 0.05, 0, 0, r * 0.5 * pl);
    grd.addColorStop(0, "#ffffff");
    grd.addColorStop(0.25, "#fecaca");
    grd.addColorStop(0.55, c);
    grd.addColorStop(1, "#450a0a");
    g.fillStyle = grd;
    g.beginPath();
    g.arc(0, 0, r * 0.5 * pl, 0, TAU2);
    g.fill();
    g.fillStyle = "#0a0000";
    g.beginPath();
    g.ellipse(0, 0, r * 0.09, r * 0.3, 0, 0, TAU2);
    g.fill();
  },
  nest: (g, r, c, t) => {
    const pl = 1 + 0.06 * Math.sin(t * TAU2);
    shadowOn(g, c, 14);
    g.fillStyle = "#0f1405";
    g.strokeStyle = c;
    g.lineWidth = 2.5;
    g.beginPath();
    for (let k = 0; k <= 14; k++) {
      const a = (k / 14) * TAU2;
      const rr = r * pl * (0.86 + (k % 2 ? 0.14 : 0));
      if (k === 0) g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      else g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    g.closePath();
    g.fill();
    g.stroke();
    shadowOff(g);
    g.lineWidth = 1.5;
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * TAU2 + 0.3;
      const rr = 0.16 + 0.06 * Math.sin(t * TAU2 + k * 1.3);
      g.strokeStyle = rgba(c, 0.7);
      g.beginPath();
      g.arc(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, r * rr, 0, TAU2);
      g.stroke();
    }
    core(g, r, "#eab308", 0.3 * pl);
  },
};

// Какие враги поворачиваются к пилоту и на какой угол повёрнут их рисунок (нос рисунка → +X)
export const ENEMY_FACING: Record<string, number> = { crawler: 0, trooper: Math.PI / 2, swarm: Math.PI / 2, mech: Math.PI / 2, phantom: Math.PI / 2, queen: Math.PI / 2 };

const framesCache = new Map<string, Sprite[]>();

// Кадры анимации врага (8 кадров для Неон 2.0, иначе — статичный рисунок)
export function getEnemyFrames(id: string, radius: number, color: string): Sprite[] {
  const key = id + "|" + radius + "|" + color;
  let f = framesCache.get(key);
  if (!f) {
    const draw = ANIM[id];
    f = draw
      ? Array.from({ length: ANIM_FRAMES }, (_, i) => makeSprite(radius, Math.max(10, radius * 0.45), (g, r) => draw(g, r, color, i / ANIM_FRAMES), true))
      : [getEnemySprite(id, radius, color)];
    framesCache.set(key, f);
  }
  return f;
}

// ------------------------------------------------------------
//  Пилот: у каждого свой корпус (Неон 2.0)
// ------------------------------------------------------------
export function getPlayerSprite(charId: string, color: string) {
  return cached("ship" + charId + color, () => makeSprite(18, 16, (g, r) => drawShip(g, charId, r, color)));
}

export function drawSprite(ctx: CanvasRenderingContext2D, s: Sprite, x: number, y: number, scale = 1, useFlash = false) {
  const h = s.half * scale;
  ctx.drawImage(useFlash && s.flash ? s.flash : s.img, x - h, y - h, h * 2, h * 2);
}

export function drawSpriteRot(ctx: CanvasRenderingContext2D, s: Sprite, x: number, y: number, rot: number, scale = 1, useFlash = false) {
  const h = s.half * scale;
  const c = Math.cos(rot);
  const sn = Math.sin(rot);
  ctx.save();
  ctx.transform(c, sn, -sn, c, x, y);
  ctx.drawImage(useFlash && s.flash ? s.flash : s.img, -h, -h, h * 2, h * 2);
  ctx.restore();
}
