// Экран выбора пилота
import { useState, type ReactNode } from "react";
import { ChevronLeft, Coins, Lock, Play, Sparkles, Star, Trophy } from "lucide-react";
import { CHARACTERS, WEAPONS } from "../game/data";
import { computeStartStats, getCharacter, unlockProgress, type SaveData } from "../game/save";
import { PORTRAITS } from "../game/portraits";
import { CreditBadge, ItemIcon, NeonButton, Panel } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  save: SaveData;
  onBack: () => void;
  onStart: (id: string) => void;
  onUnlock: (id: string) => void;
}

function StatBox({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border border-slate-700/60 bg-black/30 px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="font-logo text-sm text-slate-100">{value}</div>
    </div>
  );
}

const pct = (v: number) => `${v >= 0 ? "+" : ""}${Math.round(v * 100)}%`;

export function CharacterSelect({ save, onBack, onStart, onUnlock }: Props) {
  const [sel, setSel] = useState(save.lastCharacter);
  const ch = getCharacter(sel);
  const unlocked = save.unlocked.includes(ch.id);
  const st = computeStartStats(save, ch);
  const w = WEAPONS[ch.weapon];
  const prog = unlockProgress(save, ch);

  const action = unlocked ? (
    <NeonButton className="w-full py-4 text-lg" onClick={() => onStart(ch.id)}>
      <Play size={20} /> В бой
    </NeonButton>
  ) : ch.unlock ? (
    // пилот за достижение (контент коллеги)
    <NeonButton variant="ghost" className="w-full py-3 text-xs" disabled>
      <Trophy size={16} /> {prog.text}
    </NeonButton>
  ) : (
    <NeonButton variant="gold" className="w-full py-4" disabled={save.credits < ch.price} onClick={() => onUnlock(ch.id)}>
      <Lock size={18} /> Разблокировать · {ch.price} <Coins size={16} />
    </NeonButton>
  );

  return (
    <div className="thin-scroll relative h-full w-full overflow-y-auto bg-[#05060f]">
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-40" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:pb-8">
        <header className="mb-5 flex items-center justify-between gap-3">
          <NeonButton variant="ghost" onClick={onBack} className="px-3 py-2">
            <ChevronLeft size={18} /> Назад
          </NeonButton>
          <h2 className="neon-soft font-display text-lg text-cyan-200 sm:text-3xl">ВЫБОР ПИЛОТА</h2>
          <CreditBadge value={save.credits} />
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
          <div className="grid content-start grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {CHARACTERS.map((c) => {
              const un = save.unlocked.includes(c.id);
              const active = c.id === sel;
              return (
                <button
                  key={c.id}
                  onClick={() => setSel(c.id)}
                  className={cn(
                    "group relative aspect-[3/4] overflow-hidden rounded-lg border-2 text-left transition-all duration-200",
                    active ? "scale-[1.02]" : "opacity-80 hover:opacity-100",
                  )}
                  style={{ borderColor: active ? c.color : "rgba(100,116,139,0.35)", boxShadow: active ? `0 0 26px ${c.color}66` : undefined }}
                >
                  <img
                    src={PORTRAITS[c.id]}
                    alt={c.name}
                    className={cn("absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110", !un && "brightness-50 grayscale")}
                    style={{ objectPosition: "50% 30%" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                  <div className="absolute left-2 top-2">
                    <ItemIcon id={c.weapon} size={30} />
                  </div>
                  {!un && (
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <Lock className="text-slate-200" />
                        {c.unlock ? (
                          <span className="flex items-center gap-1 rounded bg-black/75 px-2 py-0.5 text-[10px] text-amber-200">
                            <Trophy size={11} /> достижение
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded bg-black/75 px-2 py-0.5 font-logo text-xs text-amber-300">
                            <Coins size={12} /> {c.price}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <div className="font-display text-lg leading-tight" style={{ color: c.color, textShadow: `0 0 10px ${c.color}88` }}>
                      {c.name}
                    </div>
                    <div className="text-[11px] text-slate-300">{c.title}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <Panel color={ch.color} className="h-fit overflow-hidden">
            <div className="relative h-48 overflow-hidden rounded-t-xl sm:h-56">
              <img
                key={ch.id}
                src={PORTRAITS[ch.id]}
                alt={ch.name}
                className={cn("fade-in h-full w-full object-cover", !unlocked && "grayscale")}
                style={{ objectPosition: "50% 25%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1f] via-[#0a0e1f]/20 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <div className="font-display text-3xl" style={{ color: ch.color, textShadow: `0 0 16px ${ch.color}` }}>
                  {ch.name}
                </div>
                <div className="text-sm text-slate-300">{ch.title}</div>
              </div>
            </div>
            <div className="space-y-4 p-4">
              <p className="text-sm text-slate-300">{ch.desc}</p>
              <div className="flex items-center gap-3 rounded-lg border border-slate-700/60 bg-black/30 p-3">
                <ItemIcon id={w.id} size={44} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">Стартовое оружие</div>
                  <div className="font-display" style={{ color: w.color }}>
                    {w.name}
                  </div>
                  <div className="text-xs text-slate-400">{w.desc}</div>
                </div>
              </div>
              {/* фирменный бонус и пробуждение (контент коллеги, столп 10) */}
              <div className="space-y-2 rounded-lg border bg-black/30 p-3 text-sm" style={{ borderColor: `${ch.color}55` }} data-testid="pilot-perk">
                <div className="flex items-start gap-2">
                  <Star size={15} className="mt-0.5 shrink-0" style={{ color: ch.color }} />
                  <span className="text-slate-200">{ch.sigText}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles size={15} className="mt-0.5 shrink-0 text-amber-300" />
                  <span className="text-slate-300">
                    <b className="text-amber-200">Пробуждение «{ch.awakenName}»:</b> {ch.awakenText}.{" "}
                    <span className="text-slate-500">Выпадает из контейнера, когда родная пушка уже эволюционировала.</span>
                  </span>
                </div>
              </div>
              {!unlocked && ch.unlock && (
                <div className="rounded-lg border border-amber-400/40 bg-amber-500/5 p-3 text-sm text-amber-100">
                  <Trophy size={14} className="mr-1 inline" /> Как открыть: {ch.unlock.text}
                </div>
              )}
              <div>
                <div className="mb-1.5 text-[10px] uppercase tracking-widest text-slate-500">Особенности</div>
                <ul className="space-y-1">
                  {ch.bonusText.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-slate-200">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: ch.color, boxShadow: `0 0 6px ${ch.color}` }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <StatBox label="Здоровье" value={Math.round(st.maxHp)} />
                <StatBox label="Броня" value={st.armor} />
                <StatBox label="Урон" value={pct(st.might - 1)} />
                <StatBox label="Скорость" value={pct(st.speed - 1)} />
                <StatBox label="Перезарядка" value={pct(st.cooldown - 1)} />
                <StatBox label="Площадь" value={pct(st.area - 1)} />
              </div>
              <div className="hidden lg:block">{action}</div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-700/60 bg-[#05060f]/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate font-display" style={{ color: ch.color }}>
              {ch.name}
            </div>
            <div className="truncate text-xs text-slate-400">{w.name}</div>
          </div>
          <div className="w-52">{action}</div>
        </div>
      </div>
    </div>
  );
}
