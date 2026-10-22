// Ангар: слоты корабля и коллекция модулей
import { Fragment, useState } from "react";
import { ChevronLeft, Coins, Gem, Lock, Minus, Plus, Wrench } from "lucide-react";
import { MAX_SLOTS, MODULES, MODULE_MAX_LEVEL, RARITY, SLOT_COSTS, moduleUpgradeCost, type ModuleDef } from "../game/modules";
import type { SaveData } from "../game/save";
import { CreditBadge, ItemIcon, LevelPips, NeonButton, Panel } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  save: SaveData;
  onBack: () => void;
  onEquip: (id: string) => void;
  onUnequip: (id: string) => void;
  onUpgrade: (id: string) => void;
  onBuySlot: () => void;
}

const WHERE: Record<string, string> = {
  common: "Выпадает с боссов на любой планете",
  rare: "Чаще всего — с боссов Крио-7 и Улья",
  epic: "С боссов Крио-7 и Улья Ксенос",
  legendary: "Редкий трофей боссов Улья Ксенос",
};

function FragBadge({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-fuchsia-400/50 bg-fuchsia-500/10 px-2.5 py-1 font-logo text-sm text-fuchsia-200">
      <Gem size={14} /> {value}
    </div>
  );
}

export function Hangar({ save, onBack, onEquip, onUnequip, onUpgrade, onBuySlot }: Props) {
  const [sel, setSel] = useState<string | null>(save.equipped[0] || Object.keys(save.modules)[0] || null);
  const selDef = MODULES.find((m) => m.id === sel) || null;
  const nextSlot = SLOT_COSTS[save.slots - 3];

  const card = (m: ModuleDef) => {
    const lvl = save.modules[m.id] || 0;
    const owned = lvl > 0;
    const r = RARITY[m.rarity];
    const on = save.equipped.includes(m.id);
    return (
      <button
        key={m.id}
        onClick={() => setSel(m.id)}
        className={cn(
          "relative flex items-center gap-3 rounded-lg border-2 bg-[#0a0e1f]/90 p-3 text-left transition-all",
          sel === m.id ? "scale-[1.01]" : "opacity-85 hover:opacity-100",
        )}
        style={{ borderColor: sel === m.id ? m.color : `${r.color}44`, boxShadow: sel === m.id ? `0 0 20px ${m.color}44` : undefined }}
      >
        <ItemIcon id={m.id} color={m.color} size={44} dim={!owned} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm" style={{ color: owned ? m.color : "#64748b" }}>
            {owned ? m.name : "???"}
          </div>
          <div className="text-[11px]" style={{ color: r.color }}>
            {r.name}
            {owned && ` · ур. ${lvl}`}
          </div>
        </div>
        {on && <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 font-logo text-[9px] text-cyan-200">УСТАНОВЛЕН</span>}
      </button>
    );
  };

  const renderDetail = (m: ModuleDef) => {
    const lvl = save.modules[m.id] || 0;
    const owned = lvl > 0;
    const r = RARITY[m.rarity];
    const on = save.equipped.includes(m.id);
    const maxed = lvl >= MODULE_MAX_LEVEL;
    const cost = moduleUpgradeCost(m, lvl);
    const canUp = owned && !maxed && save.credits >= cost.credits && save.fragments >= cost.fragments;
    const full = save.equipped.length >= save.slots;
    return (
      <Panel color={owned ? m.color : "#475569"} className="h-fit p-5">
        <div className="flex items-center gap-4">
          <ItemIcon id={m.id} color={m.color} size={64} dim={!owned} />
          <div className="min-w-0">
            <div className="font-display text-xl" style={{ color: owned ? m.color : "#94a3b8" }}>
              {owned ? m.name : "Неизвестный модуль"}
            </div>
            <div className="text-sm" style={{ color: r.color }}>
              {r.name}
            </div>
          </div>
        </div>
        {owned ? (
          <>
            <p className="mt-4 text-sm text-slate-200">{m.desc(lvl)}</p>
            {!maxed && <p className="mt-1 text-xs text-slate-500">На ур. {lvl + 1}: {m.desc(lvl + 1)}</p>}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1">
                <LevelPips level={lvl} max={MODULE_MAX_LEVEL} color={m.color} />
              </div>
              <span className="font-logo text-[11px] text-slate-400">
                {lvl}/{MODULE_MAX_LEVEL}
              </span>
            </div>
            <div className="mt-4 grid gap-2">
              {on ? (
                <NeonButton variant="ghost" onClick={() => onUnequip(m.id)} className="py-2 text-sm">
                  <Minus size={16} /> Снять
                </NeonButton>
              ) : (
                <NeonButton disabled={full} onClick={() => onEquip(m.id)} className="py-2 text-sm">
                  <Plus size={16} /> {full ? "Все слоты заняты" : "Установить"}
                </NeonButton>
              )}
              <NeonButton variant={maxed ? "ghost" : "gold"} disabled={!canUp} onClick={() => onUpgrade(m.id)} className="py-2 text-sm">
                {maxed ? (
                  "Максимальный уровень"
                ) : (
                  <>
                    <Wrench size={15} /> Улучшить · <Coins size={14} /> {cost.credits} · <Gem size={13} /> {cost.fragments}
                  </>
                )}
              </NeonButton>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-400">{WHERE[m.rarity]}. Дубликаты разбираются на фрагменты.</p>
        )}
      </Panel>
    );
  };

  return (
    <div className="thin-scroll relative h-full w-full overflow-y-auto bg-[#05060f]">
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-40" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <header className="mb-3 flex items-center justify-between gap-3">
          <NeonButton variant="ghost" onClick={onBack} className="px-3 py-2">
            <ChevronLeft size={18} /> Назад
          </NeonButton>
          <h2 className="neon-soft font-display text-lg text-cyan-200 sm:text-3xl">АНГАР</h2>
          <div className="flex flex-wrap justify-end gap-2">
            <FragBadge value={save.fragments} />
            <CreditBadge value={save.credits} />
          </div>
        </header>
        <p className="mb-5 text-center text-sm text-slate-400">
          Модули выпадают с боссов. Установленные работают во всех забегах. Прокачка — за кредиты и фрагменты (◆ дают Крио-7 и Улей).
        </p>


        <Panel className="mb-5 p-4">
          <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-slate-400">
            Слоты корабля · {save.equipped.length}/{save.slots}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {Array.from({ length: MAX_SLOTS }).map((_, i) => {
              const id = save.equipped[i];
              const m = id ? MODULES.find((x) => x.id === id) : null;
              if (i >= save.slots) {
                return (
                  <div key={i} className="grid h-16 w-16 place-items-center rounded-lg border border-dashed border-slate-700 bg-black/30 text-slate-600">
                    <Lock size={18} />
                  </div>
                );
              }
              return m ? (
                <button key={i} onClick={() => setSel(m.id)} className="rounded-lg" title={m.name}>
                  <ItemIcon id={m.id} color={m.color} size={64} />
                </button>
              ) : (
                <div key={i} className="grid h-16 w-16 place-items-center rounded-lg border border-dashed border-cyan-500/40 bg-cyan-500/5 text-[10px] text-cyan-300/60">
                  пусто
                </div>
              );
            })}
            {nextSlot && (
              <NeonButton
                variant="violet"
                disabled={save.credits < nextSlot.credits || save.fragments < nextSlot.fragments}
                onClick={onBuySlot}
                className="py-2 text-xs"
              >
                <Plus size={15} /> Слот · <Coins size={13} /> {nextSlot.credits} · <Gem size={12} /> {nextSlot.fragments}
              </NeonButton>
            )}
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="grid content-start gap-2.5 sm:grid-cols-2">
            {MODULES.map((m) => (
              <Fragment key={m.id}>
                {card(m)}
                {/* на телефоне описание раскрывается прямо под выбранной карточкой */}
                {sel === m.id && <div className="sm:col-span-2 lg:hidden">{renderDetail(m)}</div>}
              </Fragment>
            ))}
          </div>
          <div className="hidden lg:block">
            {selDef ? renderDetail(selDef) : <Panel className="h-fit p-5 text-sm text-slate-400">Победи босса, чтобы найти первый модуль.</Panel>}
          </div>
        </div>
      </div>
    </div>
  );
}
