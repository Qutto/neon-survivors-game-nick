// Экран выбора планеты (после выбора пилота)
import { useState } from "react";
import { Check, ChevronLeft, Coins, Lock, Rocket } from "lucide-react";
import { PLANETS, getPlanet, planetUnlocked, type PlanetDef } from "../game/planets";
import type { SaveData } from "../game/save";
import { CreditBadge, NeonButton, Panel, formatTime } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  save: SaveData;
  onBack: () => void;
  onLaunch: (planetId: string) => void;
}

// Рисунок планеты: у каждой своя поверхность
function PlanetOrb({ p, size, dim }: { p: PlanetDef; size: number; dim?: boolean }) {
  const uid = `${p.id}-${size}`;
  return (
    <div className={cn("relative shrink-0", dim && "grayscale brightness-50")} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible", filter: `drop-shadow(0 0 ${size / 7}px ${p.color}88)` }}>
        <defs>
          <clipPath id={`clip-${uid}`}>
            <circle cx="50" cy="50" r="46" />
          </clipPath>
          <radialGradient id={`shade-${uid}`} cx="34%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="45%" stopColor="#fff" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.75" />
          </radialGradient>
        </defs>
        {p.id === "ice" && <ellipse cx="50" cy="52" rx="66" ry="13" fill="none" stroke="#cbd5e1" strokeOpacity="0.35" strokeWidth="5" />}
        <g clipPath={`url(#clip-${uid})`}>
          {p.id === "home" && (
            <>
              <rect width="100" height="100" fill="#0e5a8a" />
              <path d="M8 30 C20 18 34 22 40 30 C46 38 36 46 28 50 C20 54 12 48 8 40 Z" fill="#22c55e" />
              <path d="M52 14 C64 8 80 14 84 26 C88 38 74 40 66 36 C58 32 50 24 52 14 Z" fill="#16a34a" />
              <path d="M46 56 C58 50 74 56 78 68 C82 82 66 90 56 86 C46 82 38 70 46 56 Z" fill="#4ade80" />
              <path d="M14 66 C20 62 28 66 26 74 C24 80 16 80 14 74 Z" fill="#15803d" />
              <path d="M10 22 Q30 16 50 22 T90 20" stroke="#fff" strokeOpacity="0.45" strokeWidth="3" fill="none" />
              <path d="M20 84 Q40 78 60 84 T96 80" stroke="#fff" strokeOpacity="0.35" strokeWidth="2.5" fill="none" />
            </>
          )}
          {p.id === "ice" && (
            <>
              <rect width="100" height="100" fill="#dbeafe" />
              <ellipse cx="50" cy="6" rx="44" ry="16" fill="#ffffff" />
              <ellipse cx="50" cy="96" rx="44" ry="14" fill="#ffffff" />
              <path d="M8 46 L24 40 L34 52 L50 44 L62 56 L80 48 L96 56" stroke="#93c5fd" strokeWidth="1.6" fill="none" />
              <path d="M20 66 L32 62 L40 72 L56 66" stroke="#93c5fd" strokeWidth="1.2" fill="none" />
              <path d="M58 28 L68 34 L82 30" stroke="#bfdbfe" strokeWidth="1.2" fill="none" />
              <circle cx="70" cy="70" r="6" fill="#bfdbfe" />
              <circle cx="28" cy="30" r="4" fill="#bfdbfe" />
            </>
          )}
          {p.id === "hive" && (
            <>
              <rect width="100" height="100" fill="#6b21a8" />
              <circle cx="30" cy="34" r="12" fill="#4c1d95" />
              <circle cx="66" cy="62" r="16" fill="#4c1d95" />
              <circle cx="70" cy="26" r="8" fill="#581c87" />
              <circle cx="24" cy="72" r="9" fill="#581c87" />
              <circle cx="30" cy="34" r="4" fill="#a3e635" fillOpacity="0.8" />
              <circle cx="66" cy="62" r="5" fill="#a3e635" fillOpacity="0.8" />
              <path d="M0 50 C20 40 30 60 50 50 S80 38 100 48" stroke="#e879f9" strokeWidth="1.8" fill="none" />
              <path d="M40 0 C46 20 36 30 44 50 S52 80 46 100" stroke="#f0abfc" strokeOpacity="0.7" strokeWidth="1.4" fill="none" />
            </>
          )}
          <rect width="100" height="100" fill={`url(#shade-${uid})`} />
        </g>
        {p.id === "ice" && <path d="M-16 52 A66 13 0 0 0 116 52" fill="none" stroke="#e2e8f0" strokeOpacity="0.6" strokeWidth="5" />}
      </svg>
    </div>
  );
}

export function PlanetSelect({ save, onBack, onLaunch }: Props) {
  const first = getPlanet(save.lastPlanet);
  const [sel, setSel] = useState(planetUnlocked(first, save.planetsCleared) ? first.id : "home");
  const p = getPlanet(sel);
  const open = planetUnlocked(p, save.planetsCleared);
  const need = p.unlockAfter ? getPlanet(p.unlockAfter) : null;

  return (
    <div className="thin-scroll relative h-full w-full overflow-y-auto bg-[#05060f]">
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-40" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:pb-8">
        <header className="mb-5 flex items-center justify-between gap-3">
          <NeonButton variant="ghost" onClick={onBack} className="px-3 py-2">
            <ChevronLeft size={18} /> Пилот
          </NeonButton>
          <h2 className="neon-soft font-display text-lg text-cyan-200 sm:text-3xl">ВЫБОР ПЛАНЕТЫ</h2>
          <CreditBadge value={save.credits} />
        </header>

        <div className="grid gap-3 md:grid-cols-3">
          {PLANETS.map((pl, i) => {
            const un = planetUnlocked(pl, save.planetsCleared);
            const cleared = save.planetsCleared.includes(pl.id);
            const active = pl.id === sel;
            return (
              <button
                key={pl.id}
                onClick={() => setSel(pl.id)}
                className={cn(
                  "relative flex items-center gap-4 overflow-hidden rounded-xl border-2 bg-[#0a0e1f]/90 p-4 text-left transition-all duration-200 md:flex-col md:items-start",
                  active ? "scale-[1.01]" : "opacity-75 hover:opacity-100",
                )}
                style={{ borderColor: active ? pl.color : "rgba(100,116,139,0.35)", boxShadow: active ? `0 0 26px ${pl.color}55` : undefined }}
              >
                <PlanetOrb p={pl} size={72} dim={!un} />
                <div className="min-w-0">
                  <div className="font-logo text-[10px] tracking-[0.3em] text-slate-500">ЗОНА {i + 1}</div>
                  <div className="font-display text-xl leading-tight" style={{ color: un ? pl.color : "#64748b" }}>
                    {pl.name}
                  </div>
                  <div className="text-xs text-slate-400">{pl.title}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="flex items-center gap-1 rounded bg-black/40 px-1.5 py-0.5 text-amber-300">
                      <Coins size={11} /> ×{pl.rewardMul}
                    </span>
                    <span className="rounded bg-black/40 px-1.5 py-0.5 text-slate-300">{formatTime(pl.duration)}</span>
                    {cleared && (
                      <span className="flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">
                        <Check size={11} /> пройдена
                      </span>
                    )}
                    {!un && (
                      <span className="flex items-center gap-1 rounded bg-black/40 px-1.5 py-0.5 text-slate-400">
                        <Lock size={11} /> закрыта
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <Panel color={p.color} className="mt-5 p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <PlanetOrb p={p} size={110} dim={!open} />
            <div className="min-w-0 flex-1">
              <div className="font-display text-2xl" style={{ color: p.color, textShadow: `0 0 14px ${p.color}88` }}>
                {p.name}
              </div>
              <p className="mt-1 text-sm text-slate-300">{p.desc}</p>
              <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-200">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-xs text-slate-500">Бонус за победу: {p.victoryBonus} кредитов · после финала можно продолжить в бесконечном режиме</div>
            </div>
          </div>
          <div className="mt-5 hidden lg:block">
            <NeonButton className="w-full py-4 text-lg" disabled={!open} onClick={() => onLaunch(p.id)}>
              {open ? (
                <>
                  <Rocket size={20} /> Высадка
                </>
              ) : (
                <>
                  <Lock size={18} /> Сначала пройди {need?.name}
                </>
              )}
            </NeonButton>
          </div>
        </Panel>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-700/60 bg-[#05060f]/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate font-display" style={{ color: p.color }}>
              {p.name}
            </div>
            <div className="truncate text-xs text-slate-400">{open ? p.title : `Сначала пройди ${need?.name}`}</div>
          </div>
          <div className="w-44">
            <NeonButton className="w-full py-3" disabled={!open} onClick={() => onLaunch(p.id)}>
              {open ? <Rocket size={18} /> : <Lock size={16} />} Высадка
            </NeonButton>
          </div>
        </div>
      </div>
    </div>
  );
}
