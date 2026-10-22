// Лаборатория: постоянные улучшения
import { ChevronLeft, Coins, RotateCcw, Zap } from "lucide-react";
import { META_UPGRADES, OVERLOAD_FACTOR, metaCost, overloadCost } from "../game/data";
import type { SaveData } from "../game/save";
import { CreditBadge, ItemIcon, LevelPips, NeonButton, Panel } from "./ui";

interface Props {
  save: SaveData;
  onBack: () => void;
  onBuy: (id: string) => void;
  onRefund: () => void;
}

export function spentCredits(save: SaveData) {
  let sum = 0;
  for (const u of META_UPGRADES) {
    const l = save.upgrades[u.id] || 0;
    for (let i = 0; i < l; i++) sum += metaCost(u, i);
    const ov = save.overload[u.id] || 0;
    for (let i = 0; i < ov; i++) sum += overloadCost(u, i);
  }
  return sum;
}

export function Shop({ save, onBack, onBuy, onRefund }: Props) {
  const spent = spentCredits(save);
  return (
    <div className="thin-scroll relative h-full w-full overflow-y-auto bg-[#05060f]">
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-40" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <header className="mb-3 flex items-center justify-between gap-3">
          <NeonButton variant="ghost" onClick={onBack} className="px-3 py-2">
            <ChevronLeft size={18} /> Назад
          </NeonButton>
          <h2 className="neon-soft font-display text-lg text-amber-200 sm:text-3xl">ЛАБОРАТОРИЯ</h2>
          <CreditBadge value={save.credits} />
        </header>
        <p className="mb-5 text-center text-sm text-slate-400">
          Импланты действуют на всех пилотов во всех забегах. Прокачанное до максимума можно «перегружать» бесконечно: каждый уровень даёт половину эффекта и стоит дороже.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {META_UPGRADES.map((u) => {
            const lvl = save.upgrades[u.id] || 0;
            const maxed = lvl >= u.maxLevel;
            const ov = save.overload[u.id] || 0;
            const canOverload = maxed && !u.noOverload;
            const cost = canOverload ? overloadCost(u, ov) : metaCost(u, lvl);
            const ovValue = u.perLevel * OVERLOAD_FACTOR;
            const flat = u.stat === "maxHp" || u.stat === "armor" || u.stat === "regen";
            const fmt = (v: number) => `${v > 0 ? "+" : "−"}${flat ? +Math.abs(v).toFixed(2) : +Math.abs(v * 100).toFixed(2) + "%"}`;
            return (
              <Panel key={u.id} color={u.color} className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3">
                  <ItemIcon id={u.stat} color={u.color} size={42} />
                  <div className="min-w-0">
                    <div className="font-display text-sm leading-tight" style={{ color: u.color }}>
                      {u.name}
                    </div>
                    <div className="text-xs text-slate-400">{u.desc}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <LevelPips level={lvl} max={u.maxLevel} color={u.color} />
                  </div>
                  <span className="font-logo text-[11px] text-slate-400">
                    {lvl}/{u.maxLevel}
                  </span>
                </div>
                {canOverload && (
                  <div className="flex items-center justify-between rounded border border-fuchsia-400/30 bg-fuchsia-500/10 px-2 py-1 text-[11px] text-fuchsia-200">
                    <span className="flex items-center gap-1">
                      <Zap size={12} /> Перегрузка {ov > 0 ? `ур. ${ov}` : ""}
                    </span>
                    <span>{fmt(ovValue)} за уровень</span>
                  </div>
                )}
                <NeonButton
                  variant={maxed && !canOverload ? "ghost" : canOverload ? "violet" : "gold"}
                  disabled={(maxed && !canOverload) || save.credits < cost}
                  onClick={() => onBuy(u.id)}
                  className="mt-auto py-2 text-xs"
                >
                  {maxed && !canOverload ? (
                    "Максимум"
                  ) : (
                    <>
                      {canOverload ? "Перегрузить" : "Улучшить"} · <Coins size={14} /> {cost}
                    </>
                  )}
                </NeonButton>
              </Panel>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <NeonButton variant="danger" disabled={spent === 0} onClick={onRefund} className="text-xs">
            <RotateCcw size={16} /> Сбросить улучшения (+{spent})
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
