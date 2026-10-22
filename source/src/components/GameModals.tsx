// Модальные окна игры: уровень, контейнер, пауза, итоги
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bot, Clock, Coins, Crown, Dices, Heart, House, Infinity as InfinityIcon, Play, Rocket, RotateCcw, Skull, SkipForward, Star, Flag } from "lucide-react";
import type { BuildSnapshot, ChestReward, ChestTier, RunResult, UpgradeOption, VictoryInfo } from "../game/engine";
import { audio } from "../game/audio";
import type { Settings } from "../game/save";
import { getCharacter } from "../game/save";
import { getPlanet } from "../game/planets";
import { RARITY, getModule } from "../game/modules";
import { ENDLESS_DMG_STEP, ENDLESS_HP_STEP, ENDLESS_REWARD_STEP, ENDLESS_STEP, WEAPONS, WEAPON_ROLES, perkDef } from "../game/data";
import { AdButton, ItemIcon, LevelPips, NeonButton, Panel, formatTime, itemColor, itemName } from "./ui";
import { SettingsControls } from "./SettingsPanel";

// ------------------------------------------------------------
//  Повышение уровня
// ------------------------------------------------------------
export function LevelUpModal({
  options,
  rerolls,
  skips,
  adRerolls,
  level,
  onChoose,
  onReroll,
  onAdReroll,
  onSkip,
}: {
  options: UpgradeOption[];
  rerolls: number;
  skips: number;
  adRerolls: number;
  level: number;
  onChoose: (o: UpgradeOption) => void;
  onReroll: () => void;
  onAdReroll: () => void;
  onSkip: () => void;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const t = window.setTimeout(() => setReady(true), 320);
    return () => window.clearTimeout(t);
  }, [options]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!ready) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= options.length) onChoose(options[n - 1]);
      else if (e.code === "KeyR" && rerolls > 0) onReroll();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [ready, options, rerolls, onChoose, onReroll]);

  const kindLabel = (o: UpgradeOption) =>
    o.kind === "weapon"
      ? `Оружие${WEAPON_ROLES[o.id] ? " · " + WEAPON_ROLES[o.id] : ""}`
      : o.kind === "passive"
        ? "Система"
        : o.kind === "super"
          ? "Сверхулучшение"
          : o.kind === "perk"
            ? "Протокол · меняет игру"
            : o.kind === "wmod"
              ? "Мод оружия"
              : "Бонус";

  return (
    <div className="fade-in thin-scroll absolute inset-0 z-30 overflow-y-auto bg-[#02030a]/75 backdrop-blur-[3px]">
      <div className="flex min-h-full items-center justify-center p-3 py-6">
        <div className="w-full max-w-4xl">
          <div className="mb-5 text-center">
            <div className="font-logo text-[10px] tracking-[0.5em] text-cyan-300/80 sm:text-xs">СИСТЕМА ОБНОВЛЕНА · УР {level}</div>
            <h2 className="neon-text font-display text-3xl text-cyan-100 sm:text-5xl">НОВЫЙ УРОВЕНЬ</h2>
            <div className="mt-1 text-sm text-slate-400">Выбери модификацию</div>
          </div>
          <div className="grid gap-3">
            {options.map((o, i) => (
              <button
                key={o.id + i}
                onClick={() => ready && onChoose(o)}
                data-kind={o.kind}
                className={`pop-in group relative flex flex-col gap-2.5 rounded-xl border-2 bg-[#0a0e1f]/95 p-4 text-left transition-all duration-150 hover:-translate-y-1 ${o.kind === "perk" ? "perk-card" : ""}`}
                style={{
                  borderColor: o.kind === "perk" ? o.color : `${o.color}88`,
                  boxShadow: o.kind === "perk" ? `0 0 30px ${o.color}66, inset 0 0 30px ${o.color}22` : `0 0 22px ${o.color}2a, inset 0 0 24px ${o.color}12`,
                  animationDelay: `${i * 70}ms`,
                }}
              >
                <span className="absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100" style={{ boxShadow: `0 0 34px ${o.color}66, inset 0 0 30px ${o.color}22` }} />
                <div className="flex items-center gap-3">
                  <ItemIcon id={o.id} size={54} color={o.color} />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.15em]" style={{ color: o.color }}>
                      {kindLabel(o)}
                    </div>
                    <div className="font-display text-base leading-tight text-white">{o.name}</div>
                    <div className="mt-0.5 text-xs font-bold">
                      {o.kind === "perk" ? (
                        <span className="text-amber-200">★ РЕДКАЯ КАРТА</span>
                      ) : o.isNew ? (
                        <span className="text-emerald-300">● НОВОЕ</span>
                      ) : o.kind === "wmod" ? (
                        <span className="text-amber-200">Мод {o.level} из 3</span>
                      ) : o.level > 0 ? (
                        <span className="text-slate-300">Уровень {o.level}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="text-sm leading-snug text-slate-300">{o.desc}</div>
                {o.hint && <div className="text-[11px] leading-snug text-amber-200/80">★ {o.hint}</div>}
                <span className="absolute right-2.5 top-2 hidden font-logo text-[10px] text-slate-600 sm:block">{i + 1}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {rerolls > 0 || adRerolls <= 0 ? (
              <NeonButton variant="violet" disabled={rerolls <= 0} onClick={onReroll} className="py-2 text-xs">
                <Dices size={16} /> Переброс ({rerolls})
              </NeonButton>
            ) : (
              <AdButton placement="переброс улучшений" onReward={onAdReroll} disabled={!ready} className="py-2 text-xs">
                <Dices size={16} /> Переброс · {adRerolls}
              </AdButton>
            )}
            <NeonButton variant="ghost" disabled={skips <= 0} onClick={() => ready && onSkip()} className="py-2 text-xs">
              <SkipForward size={16} /> Пропуск +10 ОЗ ({skips})
            </NeonButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
//  Контейнер (анимация коллеги): падает, дрожит и заряжается, взрывается — лут вылетает по одному
// ------------------------------------------------------------
const CHEST_TIERS: Record<ChestTier, { sub: string; title: string; color: string; charge: number; sparks: number; coins: number; rainbow?: boolean }> = {
  common: { sub: "ДОСТАВКА СНАБЖЕНИЯ", title: "ГРУЗОВОЙ КОНТЕЙНЕР", color: "#fbbf24", charge: 1, sparks: 90, coins: 18 },
  rare: { sub: "ЦЕННЫЙ ГРУЗ", title: "РЕДКИЙ КОНТЕЙНЕР", color: "#a855f7", charge: 1.3, sparks: 140, coins: 30 },
  legendary: { sub: "СЕКРЕТНЫЙ ГРУЗ", title: "ЛЕГЕНДАРНЫЙ КОНТЕЙНЕР", color: "#f472b6", charge: 1.7, sparks: 220, coins: 50, rainbow: true },
  evolution: { sub: "ПРОТОКОЛ ЭВОЛЮЦИИ", title: "ЭВОЛЮЦИЯ!", color: "#22d3ee", charge: 1.6, sparks: 200, coins: 30 },
  awaken: { sub: "ЛИЧНЫЙ ПРОТОКОЛ ПИЛОТА", title: "ПРОБУЖДЕНИЕ!", color: "#fde047", charge: 1.9, sparks: 260, coins: 40, rainbow: true },
};
const DROP_T = 0.42; // с: падение контейнера
const REVEAL_STEP = 260; // мс между предметами
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

interface ChestParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  hue: number;
  kind: number; // 0 — втягивается при зарядке, 1 — искры взрыва, 2 — монеты, 3 — пылинки
  rot: number;
}

function CrateArt({ color, open, glow }: { color: string; open: boolean; glow?: boolean }) {
  return (
    <svg width="190" height="170" viewBox="0 0 190 170" className={glow ? "hue-cycle" : ""} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="crate-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141a33" />
          <stop offset="1" stopColor="#070a17" />
        </linearGradient>
        <radialGradient id="crate-core">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.35" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className={open ? "body-blow" : ""}>
        <path d="M18 62 H172 L164 160 H26 Z" fill="url(#crate-body)" stroke={color} strokeWidth="3" strokeLinejoin="round" />
        <path d="M34 78 H156 M38 144 H152" stroke={color} strokeOpacity="0.35" strokeWidth="2" />
        <path d="M46 78 L50 144 M144 78 L140 144" stroke={color} strokeOpacity="0.5" strokeWidth="2" />
        <polygon points="95,90 113,100 113,122 95,132 77,122 77,100" fill="#05070f" stroke={color} strokeWidth="2.5" />
        <circle cx="95" cy="111" r="16" fill="url(#crate-core)" opacity="0.95" />
        <rect x="18" y="58" width="154" height="6" rx="3" fill={color} opacity="0.9" />
      </g>
      <g className={open ? "lid-fly" : ""}>
        <path d="M10 30 H180 L172 58 H18 Z" fill="#10152b" stroke={color} strokeWidth="3" strokeLinejoin="round" />
        <path d="M60 30 L56 58 M130 30 L134 58" stroke={color} strokeOpacity="0.5" strokeWidth="2" />
        <rect x="76" y="20" width="38" height="12" rx="3" fill="#0b1022" stroke={color} strokeWidth="2.5" />
        <path d="M24 44 H48 M142 44 H166" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function ChestModal({ reward, onClose, onAgain }: { reward: ChestReward; onClose: () => void; onAgain: () => void }) {
  const evo = reward.items.find((i) => i.kind === "evolution");
  const base = CHEST_TIERS[reward.tier] || CHEST_TIERS.common;
  const cfg = { ...base, color: evo ? evo.color : base.color };
  const [opened, setOpened] = useState(false);
  const [settled, setSettled] = useState(false);
  const [shown, setShown] = useState(0);
  const [coins, setCoins] = useState(0);
  const done = opened && shown >= reward.items.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const crateRef = useRef<HTMLDivElement>(null);
  const raysRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(false);
  const openAt = useRef(0);
  const timers = useRef<number[]>([]);
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const burst = () => {
    if (openedRef.current) return;
    openedRef.current = true;
    openAt.current = performance.now();
    setOpened(true);
    audio.play("chestBurst");
    if (reward.tier === "evolution" || reward.tier === "awaken") audio.play("evolve");
    const f = flashRef.current;
    if (f) {
      f.style.transition = "none";
      f.style.opacity = "1";
      requestAnimationFrame(() => {
        f.style.transition = "opacity 0.45s ease-out";
        f.style.opacity = "0";
      });
    }
    later(650, () => setSettled(true));
    reward.items.forEach((_, i) =>
      later(380 + i * REVEAL_STEP, () => {
        setShown(i + 1);
        audio.play("reveal");
      }),
    );
  };
  // тап: сначала вскрыть, потом — показать всё сразу
  const skipAnim = () => {
    if (!openedRef.current) return burst();
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setSettled(true);
    setShown(reward.items.length);
  };

  useEffect(() => {
    const a = window.setTimeout(() => audio.play("chestCharge"), DROP_T * 1000 - 60);
    const b = window.setTimeout(burst, (DROP_T + cfg.charge) * 1000);
    const list = timers.current;
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      list.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // счётчик кредитов
  useEffect(() => {
    if (!done) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 700);
      setCoins(Math.round(reward.credits * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [done, reward.credits]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.code !== "Enter" && e.code !== "Space") return;
      e.preventDefault();
      if (done) onClose();
      else skipAnim();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, onClose]);

  // частицы, дрожь контейнера, лучи
  useEffect(() => {
    const cv = canvasRef.current!;
    const g = cv.getContext("2d")!;
    const ps: ChestParticle[] = [];
    const t0 = performance.now();
    let last = t0;
    let raf = 0;
    let exploded = false;
    let coinsLeft = cfg.coins;
    let coinAcc = 0;
    let suckAcc = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fit = () => {
      const r = rootRef.current!.getBoundingClientRect();
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
    };
    fit();
    window.addEventListener("resize", fit);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;
      const W = cv.width / dpr;
      const H = cv.height / dpr;
      const root = rootRef.current!.getBoundingClientRect();
      const an = anchorRef.current?.getBoundingClientRect();
      const cx = an ? an.left - root.left + an.width / 2 : W / 2;
      const cy = an ? an.top - root.top + an.height / 2 : H / 2;
      const isOpen = openedRef.current;
      const charge = isOpen ? 1 : Math.max(0, Math.min(1, (t - DROP_T) / cfg.charge));
      const crate = crateRef.current;
      if (crate && !isOpen) {
        if (t < DROP_T) {
          const k = t / DROP_T;
          crate.style.transform = `translateY(${-window.innerHeight * 0.6 * Math.pow(1 - k, 2)}px) scale(${0.7 + 0.3 * k})`;
        } else {
          const land = Math.max(0, 1 - (t - DROP_T) / 0.18);
          const amp = 0.6 + 7 * charge * charge;
          const sx = Math.sin(t * 53) * amp + Math.sin(t * 31) * amp * 0.5;
          const sy = Math.cos(t * 47) * amp * 0.5 + land * 10;
          const rot = Math.sin(t * 41) * amp * 0.45;
          const sc = 1 + charge * 0.08 + Math.sin(t * 18) * 0.012 * charge - land * 0.08;
          crate.style.transform = `translate(${sx}px, ${sy}px) rotate(${rot}deg) scale(${sc}, ${sc + land * 0.1})`;
        }
        crate.style.filter = `drop-shadow(0 0 ${8 + 34 * charge}px ${cfg.color}) brightness(${1 + charge * 0.7})`;
      }
      const rays = raysRef.current;
      if (rays) {
        const op = isOpen ? Math.max(0.28, 1 - (now - openAt.current) / 900) : charge * 0.55;
        const sc = isOpen ? 1.25 : 0.55 + charge * 0.5;
        rays.style.opacity = String(op);
        rays.style.transform = `translate(-50%, -50%) rotate(${t * (isOpen ? 14 : 30 + 90 * charge)}deg) scale(${sc})`;
      }
      // зарядка: искры втягиваются в контейнер
      if (!isOpen && t > DROP_T)
        for (suckAcc += dt * (30 + 160 * charge); suckAcc >= 1; suckAcc--) {
          const a = Math.random() * Math.PI * 2;
          const d = rnd(150, 300);
          ps.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, vx: 0, vy: 0, life: 1.2, max: 1.2, size: rnd(1.5, 3), hue: cfg.rainbow ? rnd(0, 360) : -1, kind: 0, rot: 0 });
        }
      if (isOpen && !exploded) {
        exploded = true;
        for (let i = 0; i < cfg.sparks; i++) {
          const a = Math.random() * Math.PI * 2;
          const v = rnd(250, 1100);
          ps.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, life: rnd(0.5, 1.2), max: 1.2, size: rnd(1.5, 3.2), hue: cfg.rainbow ? rnd(0, 360) : Math.random() < 0.25 ? 50 : -1, kind: 1, rot: 0 });
        }
      }
      // дождь монет
      if (isOpen && coinsLeft > 0 && now - openAt.current > 250)
        for (coinAcc += dt * 40; coinAcc >= 1 && coinsLeft > 0; coinAcc--, coinsLeft--)
          ps.push({ x: rnd(W * 0.1, W * 0.9), y: -10, vx: rnd(-30, 30), vy: rnd(60, 160), life: 3, max: 3, size: rnd(5, 8), hue: 45, kind: 2, rot: rnd(0, 6) });
      if (isOpen && Math.random() < dt * 14)
        ps.push({ x: rnd(W * 0.15, W * 0.85), y: H + 6, vx: rnd(-10, 10), vy: rnd(-70, -30), life: rnd(3, 5), max: 5, size: rnd(1, 2.4), hue: cfg.rainbow ? rnd(0, 360) : -1, kind: 3, rot: 0 });
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      g.globalCompositeOperation = "lighter";
      let n = 0;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.life -= dt;
        if (p.kind === 0) {
          const dx = cx - p.x;
          const dy = cy - p.y;
          const d = Math.hypot(dx, dy) || 1;
          const pull = 900 + 1400 * charge;
          p.vx += (dx / d) * pull * dt;
          p.vy += (dy / d) * pull * dt;
          if (d < 26 || isOpen) p.life = 0;
        } else if (p.kind === 1) {
          p.vx *= Math.exp(-2.6 * dt);
          p.vy = p.vy * Math.exp(-2.6 * dt) + 300 * dt;
        } else if (p.kind === 2) {
          p.vy += 420 * dt;
          p.rot += dt * 9;
          if (p.y > H + 20) p.life = 0;
        }
        if (p.life <= 0) continue;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        ps[n++] = p;
        const a = Math.min(1, p.life / (p.max * 0.4));
        const col = p.hue < 0 ? cfg.color : `hsl(${p.hue},100%,65%)`;
        g.globalAlpha = a;
        if (p.kind === 2) {
          g.globalCompositeOperation = "source-over";
          g.fillStyle = "#fbbf24";
          g.strokeStyle = "#fde68a";
          g.lineWidth = 1;
          g.beginPath();
          g.ellipse(p.x, p.y, p.size * Math.abs(Math.cos(p.rot)) + 0.8, p.size, 0, 0, Math.PI * 2);
          g.fill();
          g.stroke();
          g.globalCompositeOperation = "lighter";
        } else if (p.kind <= 1) {
          const v = Math.hypot(p.vx, p.vy) || 1;
          const l = Math.min(26, v * 0.03);
          g.strokeStyle = col;
          g.lineWidth = p.size;
          g.lineCap = "round";
          g.beginPath();
          g.moveTo(p.x, p.y);
          g.lineTo(p.x - (p.vx / v) * l, p.y - (p.vy / v) * l);
          g.stroke();
        } else {
          g.fillStyle = col;
          g.beginPath();
          g.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          g.fill();
        }
      }
      ps.length = n;
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const big = !!evo;
  return (
    <div ref={rootRef} className="fade-in absolute inset-0 z-30 select-none overflow-hidden bg-[#02030a]/85 backdrop-blur-[3px]" onPointerDown={() => !done && skipAnim()} data-testid="chest">
      <div
        className={`pointer-events-none absolute inset-0 ${cfg.rainbow ? "hue-cycle" : ""}`}
        style={{ background: `radial-gradient(circle at 50% 46%, ${cfg.color}38 0%, ${cfg.color}10 35%, transparent 65%)` }}
      />
      <div
        ref={raysRef}
        className={`pointer-events-none absolute left-1/2 top-[46%] h-[1100px] w-[1100px] ${cfg.rainbow ? "hue-cycle" : ""}`}
        style={{
          opacity: 0,
          background: `repeating-conic-gradient(from 0deg, ${cfg.color}55 0deg 5deg, transparent 5deg 15deg)`,
          WebkitMaskImage: "radial-gradient(circle, #000 0%, rgba(0,0,0,0.6) 25%, transparent 55%)",
          maskImage: "radial-gradient(circle, #000 0%, rgba(0,0,0,0.6) 25%, transparent 55%)",
        }}
      />
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      {opened && <div className="shockwave pointer-events-none absolute left-1/2 top-[46%] h-40 w-40 rounded-full border-solid" style={{ borderColor: cfg.color, boxShadow: `0 0 40px ${cfg.color}` }} />}
      <div className="thin-scroll relative flex h-full flex-col items-center overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-[calc(env(safe-area-inset-top)+28px)]">
        <div className="text-center">
          <div className="font-logo text-[10px] tracking-[0.45em] text-slate-300/80">{cfg.sub}</div>
          {opened ? (
            <h2 className={`title-slam neon-text mt-1 font-display text-3xl ${cfg.rainbow ? "hue-cycle" : ""}`} style={{ color: cfg.color }}>
              {cfg.title}
            </h2>
          ) : (
            <h2 className="mt-1 font-display text-2xl text-slate-200/90">ВХОДЯЩИЙ ГРУЗ…</h2>
          )}
        </div>
        <div ref={anchorRef} className="relative my-auto flex w-full max-w-md flex-col items-center justify-center py-6" style={{ minHeight: 260 }}>
          {!settled && (
            <div ref={crateRef} className="will-change-transform" style={{ transform: "translateY(-60vh)" }}>
              <CrateArt color={cfg.color} open={opened} glow={cfg.rainbow} />
            </div>
          )}
          {opened && (
            <div className={`w-full ${settled ? "" : "absolute inset-x-0"} ${big ? "" : "space-y-2.5"}`}>
              {reward.items.slice(0, shown).map((it, i) =>
                big && it.kind === "evolution" ? (
                  <div
                    key={i}
                    className="loot-in relative overflow-hidden rounded-2xl border-2 bg-black/50 p-6 text-center"
                    style={{ borderColor: it.color, boxShadow: `0 0 50px ${it.color}66, inset 0 0 40px ${it.color}22` }}
                  >
                    <div className="relative mx-auto mb-3 grid h-28 w-28 place-items-center">
                      <div
                        className="spin-slow absolute inset-[-30px] rounded-full"
                        style={{
                          background: `repeating-conic-gradient(${it.color}66 0deg 8deg, transparent 8deg 24deg)`,
                          WebkitMaskImage: "radial-gradient(circle, #000 30%, transparent 70%)",
                          maskImage: "radial-gradient(circle, #000 30%, transparent 70%)",
                        }}
                      />
                      <ItemIcon id={it.id} color={it.color} size={88} />
                    </div>
                    <div className="font-display text-xl" style={{ color: it.color }}>
                      {it.name}
                    </div>
                    <div className="mt-1 text-sm text-slate-300">{it.text}</div>
                    <span className="shine-sweep pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  </div>
                ) : (
                  <div
                    key={i}
                    className="loot-in relative flex items-center gap-3 overflow-hidden rounded-xl border bg-black/55 p-3 text-left"
                    style={{ borderColor: `${it.color}88`, boxShadow: `0 0 22px ${it.color}33` }}
                  >
                    <ItemIcon id={it.id} color={it.color} size={48} />
                    <div className="min-w-0">
                      <div className="font-display" style={{ color: it.color }}>
                        {it.name}
                      </div>
                      <div className="text-xs text-slate-300">{it.text}</div>
                    </div>
                    <span className="shine-sweep pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                ),
              )}
            </div>
          )}
        </div>
        <div className="w-full max-w-md" style={{ minHeight: 150 }}>
          {done ? (
            <div className="pop-in">
              <div className="mb-4 flex items-center justify-center gap-2 font-logo text-2xl text-amber-300 [text-shadow:0_0_12px_rgba(251,191,36,0.7)]">
                <Coins size={22} /> +{coins}
              </div>
              <NeonButton variant="gold" className="w-full py-4" onClick={onClose}>
                Продолжить
              </NeonButton>
              {reward.again > 0 && (
                <AdButton placement="контейнер ещё раз" onReward={onAgain} className="mt-3 w-full">
                  <RotateCcw size={16} /> Открыть ещё раз · {reward.again}
                </AdButton>
              )}
            </div>
          ) : (
            <div className="hint-blink pt-6 text-center font-logo text-[11px] tracking-[0.3em] text-slate-400">{opened ? "НАЖМИ — ПОКАЗАТЬ ВСЁ" : "НАЖМИ — ВСКРЫТЬ"}</div>
          )}
        </div>
      </div>
      <div ref={flashRef} className="pointer-events-none absolute inset-0 bg-white" style={{ opacity: 0 }} />
    </div>
  );
}

// ------------------------------------------------------------
//  Протокол: после первого босса — один перк-правило на весь забег (столп 08)
// ------------------------------------------------------------
export function ProtocolModal({ options, onChoose }: { options: UpgradeOption[]; onChoose: (id: string) => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 600);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div className="fade-in thin-scroll absolute inset-0 z-30 overflow-y-auto bg-[#02030a]/85 backdrop-blur-[3px]" data-testid="protocol-choice">
      <div className="flex min-h-full items-center justify-center p-3 py-6">
        <div className="w-full">
          <div className="mb-4 text-center">
            <div className="font-logo text-[10px] tracking-[0.4em] text-fuchsia-300">БОСС ПОВЕРЖЕН · ДОСТУП ОТКРЫТ</div>
            <h2 className="neon-text font-display text-3xl text-fuchsia-100">ВЫБЕРИ ПРОТОКОЛ</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-300">Один на весь забег. Он меняет правила игры — под него и собирай билд.</p>
          </div>
          <div className="grid gap-3">
            {options.map((o, i) => (
              <button
                key={o.id}
                data-kind="protocol"
                onClick={() => ready && onChoose(o.id)}
                className="pop-in perk-card relative flex items-start gap-3 rounded-xl border-2 bg-[#0a0e1f]/95 p-4 text-left"
                style={{ borderColor: o.color, boxShadow: `0 0 30px ${o.color}55, inset 0 0 30px ${o.color}1a`, animationDelay: `${i * 90}ms` }}
              >
                <ItemIcon id={o.id} size={54} color={o.color} />
                <div className="min-w-0">
                  <div className="font-display text-lg leading-tight" style={{ color: o.color }}>
                    {o.name}
                  </div>
                  <div className="mt-1 text-sm leading-snug text-slate-200">{o.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
//  Финальный босс убит: эвакуация или бесконечный режим (столп 09)
// ------------------------------------------------------------
export function VictoryChoiceModal({ info, planetId, onChoose }: { info: VictoryInfo; planetId: string; onChoose: (cont: boolean) => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 500);
    return () => window.clearTimeout(t);
  }, []);
  const pl = getPlanet(planetId);
  return (
    <div className="fade-in absolute inset-0 z-30 grid place-items-center overflow-y-auto bg-[#02030a]/85 p-4 backdrop-blur-[3px]" data-testid="victory-choice">
      <div className="pop-in w-full max-w-md">
        <Panel color="#4ade80" className="p-6 text-center">
          <div className="font-logo text-[10px] tracking-[0.4em] text-emerald-300">ЦЕЛЬ УНИЧТОЖЕНА</div>
          <h2 className="neon-soft mt-1 font-display text-3xl text-emerald-200">{info.boss}</h2>
          <p className="mt-2 text-sm text-slate-300">{pl.name} отбита. Награда за победу уже твоя.</p>
          <div className="mt-3 flex items-center justify-center gap-2 font-logo text-xl text-amber-300">
            <Coins size={18} /> {info.credits}
          </div>
          <div className="mt-5 grid gap-3">
            <NeonButton variant="gold" className="py-4" onClick={() => ready && onChoose(true)}>
              <InfinityIcon size={18} /> Продолжить забег
            </NeonButton>
            <div className="-mt-1 text-left text-[11px] leading-snug text-rose-200/90">
              Испытание на износ. Сразу — кольцо врагов. Каждые {ENDLESS_STEP} с угроза растёт: враги крепче на {Math.round((ENDLESS_HP_STEP - 1) * 100)}% и бьют на{" "}
              {Math.round((ENDLESS_DMG_STEP - 1) * 100)}% сильнее, босс — каждую минуту. Награды +{Math.round(ENDLESS_REWARD_STEP * 100)}% за ступень. Награда за победу уже твоя.
            </div>
            <NeonButton variant="ghost" onClick={() => ready && onChoose(false)}>
              <Rocket size={16} /> Эвакуация — забрать награду
            </NeonButton>
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
//  Воскрешение за рекламу (как у коллеги): 9 секунд на решение, полное здоровье и взрывная волна
// ------------------------------------------------------------
const REVIVE_SECONDS = 9;

export function ReviveModal({ time, duration, endless, onRevive, onDecline }: { time: number; duration: number; endless: boolean; onRevive: () => void; onDecline: () => void }) {
  const [left, setLeft] = useState(REVIVE_SECONDS);
  const [busy, setBusy] = useState(false);
  const declineRef = useRef(onDecline);
  declineRef.current = onDecline;
  useEffect(() => {
    if (busy) return;
    if (left <= 0) {
      declineRef.current();
      return;
    }
    const t = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left, busy]);
  const toBoss = Math.max(0, duration - time);
  return (
    <div className="fade-in absolute inset-0 z-40 grid place-items-center bg-[#02030a]/80 p-4 backdrop-blur-sm" data-testid="revive-offer">
      <div className="pop-in w-full max-w-sm text-center">
        <div className="font-logo text-[10px] tracking-[0.5em] text-rose-300">КРИТИЧЕСКОЕ ПОВРЕЖДЕНИЕ</div>
        <h2 className="neon-text glitch mt-1 font-display text-4xl text-rose-400">СИГНАЛ СЛАБЕЕТ</h2>
        <p className="mt-2 text-sm text-slate-300">
          {endless ? (
            "Бесконечный режим: победа уже засчитана"
          ) : toBoss > 0 ? (
            <>
              До финального босса оставалось <b className="font-logo text-amber-300">{formatTime(toBoss)}</b>
            </>
          ) : (
            "Финальный бой ещё не окончен"
          )}
        </p>
        <div className="relative mx-auto my-6 grid h-28 w-28 place-items-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#1e293b" strokeWidth="6" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={276.5}
              strokeDashoffset={276.5 * (1 - left / REVIVE_SECONDS)}
              style={{ transition: "stroke-dashoffset 1s linear", filter: "drop-shadow(0 0 6px #f43f5e)" }}
            />
          </svg>
          <span className="font-logo text-4xl text-white">{left}</span>
        </div>
        <AdButton placement="воскрешение" className="w-full py-4 text-base" onBusy={setBusy} onReward={onRevive}>
          <Heart size={18} /> Воскреснуть
        </AdButton>
        <button onClick={onDecline} className="mt-4 text-sm text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline">
          Нет, завершить забег
        </button>
        <div className="mt-3 text-[11px] text-slate-500">Полное здоровье и взрывная волна вокруг пилота · один раз за забег</div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
//  Пауза
// ------------------------------------------------------------
const pct = (v: number) => `${v >= 0 ? "+" : ""}${Math.round(v * 100)}%`;

export function PauseMenu({
  snapshot,
  settings,
  onSettings,
  onResume,
  onSurrender,
}: {
  snapshot: BuildSnapshot | null;
  settings: Settings;
  onSettings: (s: Settings) => void;
  onResume: () => void;
  onSurrender: () => void;
}) {
  const s = snapshot?.stats;
  const rows: [string, string][] = s
    ? [
        ["Здоровье", String(Math.round(s.maxHp))],
        ["Броня", String(s.armor)],
        ["Регенерация", `${s.regen.toFixed(1)}/с`],
        ["Урон", pct(s.might - 1)],
        ["Перезарядка", pct(s.cooldown - 1)],
        ["Площадь", pct(s.area - 1)],
        ["Доп. снаряды", `+${s.amount}`],
        ["Скор. снарядов", pct(s.projSpeed - 1)],
        ["Длительность", pct(s.duration - 1)],
        ["Скорость", pct(s.speed - 1)],
        ["Радиус сбора", pct(s.magnet - 1)],
        ["Опыт", pct(s.growth - 1)],
        ["Удача", pct(s.luck - 1)],
        ["Кредиты", pct(s.greed - 1)],
      ]
    : [];
  return (
    <div className="fade-in thin-scroll absolute inset-0 z-30 overflow-y-auto bg-[#02030a]/80 backdrop-blur-sm">
      <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-center p-4 py-8">
        <h2 className="neon-text mb-5 text-center font-display text-4xl text-cyan-100 sm:text-5xl">ПАУЗА</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Panel className="p-4">
            <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-slate-400">Снаряжение</div>
            <div className="space-y-2">
              {snapshot?.weapons.map((w) => (
                <div key={w.id} className="flex items-center gap-3">
                  <ItemIcon id={w.id} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm" style={{ color: itemColor(w.id) }}>
                      {itemName(w.id)}
                    </div>
                    {!w.evolved ? <LevelPips level={w.level} max={w.max} color={itemColor(w.id)} /> : <div className="text-[10px] text-amber-300">★ ЭВОЛЮЦИЯ</div>}
                  </div>
                  {w.ready && <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] text-amber-200">готово к эволюции</span>}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {snapshot?.passives.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-md border border-slate-700/60 bg-black/30 py-1 pl-1 pr-2" title={itemName(p.id)}>
                  <ItemIcon id={p.id} size={26} />
                  <span className="font-logo text-[11px] text-slate-300">
                    {p.level}/{p.max}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel className="p-4">
            <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-slate-400">Характеристики</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-slate-800/80 py-0.5">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-logo text-xs text-slate-100">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-slate-700/60 pt-4">
              <SettingsControls settings={settings} onChange={onSettings} />
            </div>
          </Panel>
        </div>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <NeonButton className="py-4 sm:min-w-56" onClick={onResume}>
            <Play size={18} /> Продолжить
          </NeonButton>
          <NeonButton
            variant="danger"
            onClick={() => {
              if (window.confirm("Завершить забег? Заработанные кредиты сохранятся.")) onSurrender();
            }}
          >
            <Flag size={16} /> Завершить забег
          </NeonButton>
        </div>
        <div className="mt-3 text-center text-xs text-slate-500">ESC — продолжить</div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
//  Итоги забега
// ------------------------------------------------------------
function BigStat({ icon, label, value, color }: { icon: ReactNode; label: string; value: ReactNode; color: string }) {
  return (
    <Panel color={color} className="p-3 text-center">
      <div className="mb-1 flex justify-center" style={{ color }}>
        {icon}
      </div>
      <div className="font-logo text-xl text-white tabular-nums sm:text-2xl">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-slate-400">{label}</div>
    </Panel>
  );
}

export function GameOverScreen({
  result,
  onRetry,
  onMenu,
  onChangePilot,
  onDouble,
  newPilots = [],
}: {
  result: RunResult;
  onRetry: () => void;
  onMenu: () => void;
  onChangePilot: () => void;
  onDouble: () => Promise<boolean>;
  newPilots?: string[];
}) {
  const [doubled, setDoubled] = useState(false);
  const ch = getCharacter(result.characterId);
  const v = result.victory;
  const mainColor = v ? "#4ade80" : "#f43f5e";
  const maxDmg = Math.max(1, ...result.weapons.map((w) => w.damage));
  const weapons = [...result.weapons].sort((a, b) => b.damage - a.damage);
  return (
    <div className="fade-in thin-scroll absolute inset-0 z-40 overflow-y-auto bg-[#02030a]/85 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="text-center">
          <div className="font-logo text-[10px] tracking-[0.5em] sm:text-xs" style={{ color: mainColor }}>
            {v ? "МИССИЯ ВЫПОЛНЕНА" : "ПИЛОТ ПОТЕРЯН"} · {ch.name.toUpperCase()}
          </div>
          <h2 className="neon-text glitch mt-1 font-display text-4xl sm:text-6xl" style={{ color: mainColor }}>
            {v ? (result.endlessTime > 0 ? "ЛЕГЕНДА СИСТЕМЫ" : "ЭВАКУАЦИЯ УСПЕШНА") : "СИГНАЛ ПОТЕРЯН"}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {v ? getPlanet(result.planetId).victoryText : `${getPlanet(result.planetId).name} · данные боя загружены в Лабораторию. Следующий клон будет сильнее.`}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <BigStat icon={<Clock size={20} />} label="Время" value={formatTime(result.time)} color="#22d3ee" />
          <BigStat icon={<Star size={20} />} label="Уровень" value={result.level} color="#a78bfa" />
          <BigStat icon={<Skull size={20} />} label="Уничтожено" value={result.kills.toLocaleString("ru-RU")} color="#f43f5e" />
          <BigStat icon={<Crown size={20} />} label="Боссов" value={result.bossesKilled} color="#fbbf24" />
        </div>

        <Panel color="#fbbf24" className="mt-4 p-4">
          <div className="mb-2 text-[10px] uppercase tracking-[0.3em] text-slate-400">Награда</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Собрано в бою</span>
              <span className="font-logo text-amber-200">+{result.creditsCollected}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Бонус за выживание</span>
              <span className="font-logo text-amber-200">+{result.survivalBonus}</span>
            </div>
            {result.victoryBonus > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Бонус за победу</span>
                <span className="font-logo text-amber-200">+{result.victoryBonus}</span>
              </div>
            )}
            {result.endlessTime > 0 && (
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-amber-200">
                  <InfinityIcon size={14} /> Бесконечный {formatTime(result.endlessTime)} · ×{result.endlessMul.toFixed(2)}
                </span>
                <span className="font-logo text-amber-200">+{result.endlessBonus}</span>
              </div>
            )}
            {doubled && (
              <div className="flex justify-between">
                <span className="text-emerald-300">×2 кредита за рекламу</span>
                <span className="font-logo text-emerald-300">+{result.credits}</span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-amber-400/30 pt-2 text-base">
              <span className="font-display text-amber-100">Итого</span>
              <span className="flex items-center gap-1.5 font-logo text-xl text-amber-300">
                <Coins size={18} /> {doubled ? result.credits * 2 : result.credits}
              </span>
            </div>
          </div>
          {!doubled && result.credits > 0 && (
            <NeonButton variant="green" className="mt-3 w-full py-3" onClick={async () => setDoubled(await onDouble())}>
              <span className="flex items-center gap-1 rounded bg-emerald-400/90 px-1.5 py-0.5 font-logo text-[9px] tracking-wider text-black">▶ AD</span>
              ×2 кредита: {result.credits} → {result.credits * 2}
            </NeonButton>
          )}
        </Panel>

        {newPilots.length > 0 && (
          <Panel color="#fde047" className="mt-4 p-4">
            <div className="mb-2 text-[10px] uppercase tracking-[0.3em] text-amber-300">Открыт новый пилот!</div>
            <div className="flex flex-wrap gap-3">
              {newPilots.map((id) => {
                const c = getCharacter(id);
                return (
                  <div key={id} className="flex items-center gap-2 rounded-lg border bg-black/40 px-3 py-2" style={{ borderColor: `${c.color}88` }}>
                    <span className="font-display" style={{ color: c.color }}>
                      {c.name}
                    </span>
                    <span className="text-xs text-slate-400">{c.title}</span>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}

        {result.perks.length > 0 && (
          <Panel color="#e879f9" className="mt-4 p-4">
            <div className="mb-2 text-[10px] uppercase tracking-[0.3em] text-slate-400">Перки забега</div>
            <div className="space-y-1.5">
              {result.perks.map((id) => {
                const d = perkDef(id);
                return d ? (
                  <div key={id} className="text-sm">
                    <span className="font-display" style={{ color: d.color }}>
                      {d.name}
                    </span>{" "}
                    <span className="text-xs text-slate-400">— {d.desc}</span>
                  </div>
                ) : null;
              })}
            </div>
          </Panel>
        )}

        {(result.fragments > 0 || result.modulesFound.length > 0) && (
          <Panel color="#c084fc" className="mt-4 p-4">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-slate-400">
              <span>Трофеи для ангара</span>
              {result.fragments > 0 && <span className="font-logo text-sm normal-case tracking-normal text-fuchsia-300">+{result.fragments} ◆ фрагментов</span>}
            </div>
            <div className="space-y-2">
              {result.modulesFound.map((m, i) => {
                const def = getModule(m.id);
                if (!def) return null;
                const r = RARITY[def.rarity];
                return (
                  <div key={i} className="flex items-center gap-3 rounded-lg border bg-black/40 p-2.5" style={{ borderColor: `${r.color}66` }}>
                    <ItemIcon id={def.id} color={def.color} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-sm" style={{ color: def.color }}>
                        {def.name}
                      </div>
                      <div className="text-xs" style={{ color: r.color }}>
                        {r.name}
                        {m.dup ? ` · дубликат → ${m.frags} ◆` : " · новый модуль!"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}

        <Panel className="mt-4 p-4">
          <div className="mb-3 flex justify-between text-[10px] uppercase tracking-[0.3em] text-slate-400">
            <span>Урон по оружию</span>
            <span>Получено урона: {result.damageTaken}</span>
          </div>
          <div className="space-y-2.5">
            {weapons.map((w) => {
              const c = WEAPONS[w.id]?.color || "#22d3ee";
              return (
                <div key={w.id} className="flex items-center gap-3">
                  <ItemIcon id={w.id} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate" style={{ color: c }}>
                        {itemName(w.id)} {WEAPONS[w.id]?.evolved ? "★" : `· ур.${w.level}`}
                      </span>
                      <span className="ml-2 shrink-0 font-logo text-xs text-slate-300">
                        {w.damage.toLocaleString("ru-RU")} <span className="text-slate-500">({Math.round(w.dps)}/с)</span>
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded bg-slate-800">
                      <div className="h-full rounded" style={{ width: `${(w.damage / maxDmg) * 100}%`, background: c, boxShadow: `0 0 8px ${c}` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <NeonButton className="py-4 sm:min-w-48" onClick={onRetry}>
            <RotateCcw size={18} /> Ещё раз
          </NeonButton>
          <NeonButton variant="violet" onClick={onChangePilot}>
            <Bot size={18} /> Сменить пилота
          </NeonButton>
          <NeonButton variant="ghost" onClick={onMenu}>
            <House size={18} /> В меню
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
