// База данных: оружие, эволюции, модули, враги
import { useState } from "react";
import { ArrowRight, ChevronLeft, Lightbulb, Plus } from "lucide-react";
import { BASE_WEAPON_IDS, CHARACTERS, ENEMIES, ENEMY_CLASSES, PASSIVES, PASSIVE_IDS, MAX_WEAPON_MODS, RULE_PERKS, WEAPONS, WEAPON_MODS, WEAPON_ROLES } from "../game/data";
import type { SaveData } from "../game/save";
import { EnemyPreview, ItemIcon, NeonButton, Panel } from "./ui";
import { cn } from "../utils/cn";

type Tab = "weapons" | "passives" | "perks" | "enemies";

export function Codex({ save, onBack }: { save: SaveData; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("weapons");
  const tabs: [Tab, string][] = [
    ["weapons", "Оружие"],
    ["passives", "Системы"],
    ["perks", "Перки"],
    ["enemies", "Угрозы"],
  ];
  return (
    <div className="thin-scroll relative h-full w-full overflow-y-auto bg-[#05060f]">
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-40" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <header className="mb-4 flex items-center justify-between gap-3">
          <NeonButton variant="ghost" onClick={onBack} className="px-3 py-2">
            <ChevronLeft size={18} /> Назад
          </NeonButton>
          <h2 className="neon-soft font-display text-lg text-fuchsia-200 sm:text-3xl">БАЗА ДАННЫХ</h2>
          <div className="w-[90px]" />
        </header>

        <Panel color="#facc15" className="mb-5 flex items-start gap-3 p-4">
          <Lightbulb className="mt-0.5 shrink-0 text-amber-300" size={20} />
          <p className="text-sm text-slate-300">
            <b className="text-amber-200">Эволюция оружия:</b> прокачай оружие до максимального уровня, возьми нужный модуль (любого уровня) и открой{" "}
            <b className="text-amber-200">грузовой контейнер</b> — их сбрасывают элитные враги и боссы (02:30 и 05:00). Оружия в забеге — 4 слота: выбирай роли, а не всё подряд.
          </p>
        </Panel>

        <div className="mb-5 flex gap-2">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex-1 rounded-md border px-3 py-2 font-display text-sm uppercase tracking-wider transition-all",
                tab === id ? "border-fuchsia-400 bg-fuchsia-500/15 text-fuchsia-100 shadow-[0_0_18px_rgba(232,121,249,0.35)]" : "border-slate-700 text-slate-400 hover:text-slate-200",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "weapons" && (
          <div className="grid gap-3 md:grid-cols-2">
            {BASE_WEAPON_IDS.map((id) => {
              const w = WEAPONS[id];
              const evo = WEAPONS[w.evolvesInto || ""];
              const pas = PASSIVES[w.evolveWith || ""];
              const found = save.discovered.includes(evo?.id || "");
              return (
                <Panel key={id} color={w.color} className="p-4">
                  <div className="flex gap-3">
                    <ItemIcon id={id} size={48} />
                    <div>
                      <div className="font-display" style={{ color: w.color }}>
                        {w.name}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">{WEAPON_ROLES[id]}</div>
                      <div className="text-sm text-slate-400">{w.desc}</div>
                    </div>
                  </div>
                  <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-0.5 text-xs text-slate-400 sm:grid-cols-2">
                    {w.levels.map((l, i) => (
                      <li key={i}>
                        <span className="text-slate-500">Ур.{i + 2}:</span> {l.text}
                      </li>
                    ))}
                  </ul>
                  {evo && pas && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-700/60 bg-black/35 p-2.5">
                      <ItemIcon id={id} size={30} />
                      <Plus size={14} className="shrink-0 text-slate-500" />
                      <ItemIcon id={pas.id} size={30} />
                      <ArrowRight size={14} className="shrink-0 text-slate-500" />
                      <ItemIcon id={evo.id} size={34} dim={!found} />
                      <div className="ml-1 min-w-0">
                        <div className="font-display text-sm" style={{ color: found ? evo.color : "#94a3b8" }}>
                          {evo.name} {!found && <span className="text-[10px] text-slate-500">(не открыто)</span>}
                        </div>
                        <div className="text-[11px] leading-snug text-slate-400">{evo.desc}</div>
                      </div>
                    </div>
                  )}
                </Panel>
              );
            })}
          </div>
        )}

        {tab === "passives" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PASSIVE_IDS.map((id) => {
              const p = PASSIVES[id];
              const evolves = BASE_WEAPON_IDS.filter((w) => WEAPONS[w].evolveWith === id);
              return (
                <Panel key={id} color={p.color} className="flex gap-3 p-4">
                  <ItemIcon id={id} size={44} />
                  <div>
                    <div className="font-display text-sm" style={{ color: p.color }}>
                      {p.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {p.desc} · макс. ур. {p.maxLevel}
                    </div>
                    {evolves.length > 0 && <div className="mt-1 text-[11px] text-amber-200/80">Эволюция: {evolves.map((w) => WEAPONS[w].name).join(", ")}</div>}
                  </div>
                </Panel>
              );
            })}
          </div>
        )}

        {tab === "perks" && (
          <div className="space-y-5">
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.3em] text-slate-400">Протоколы · после первого босса выбираешь один из трёх — на весь забег</div>
              <div className="grid gap-3">
                {Object.values(RULE_PERKS).map((p) => (
                  <Panel key={p.id} color={p.color} className="flex gap-3 p-4">
                    <ItemIcon id={p.id} size={44} />
                    <div>
                      <div className="font-display text-sm" style={{ color: p.color }}>
                        {p.name}
                      </div>
                      <div className="text-xs text-slate-400">{p.desc}</div>
                    </div>
                  </Panel>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.3em] text-slate-400">Пробуждения пилотов · родная пушка эволюционировала → следующий контейнер</div>
              <div className="grid gap-3">
                {CHARACTERS.map((c) => (
                  <Panel key={c.id} color={c.color} className="flex gap-3 p-4">
                    <ItemIcon id={c.weapon} size={44} color={c.color} />
                    <div>
                      <div className="font-display text-sm" style={{ color: c.color }}>
                        {c.awakenName} <span className="text-[11px] text-slate-500">· {c.name}</span>
                      </div>
                      <div className="text-xs text-slate-400">{c.awakenText}</div>
                      <div className="mt-0.5 text-[11px] text-slate-500">{c.sigText}</div>
                    </div>
                  </Panel>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.3em] text-slate-400">Моды оружия · для пушки на пределе, до {MAX_WEAPON_MODS} на пушку</div>
              <div className="grid gap-3">
                {WEAPON_MODS.map((m) => (
                  <Panel key={m.id} color={m.color} className="flex gap-3 p-4">
                    <ItemIcon id={m.id} size={44} color={m.color} />
                    <div>
                      <div className="font-display text-sm" style={{ color: m.color }}>
                        {m.name}
                      </div>
                      <div className="text-xs text-slate-400">{m.desc}</div>
                    </div>
                  </Panel>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "enemies" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(ENEMIES).map((e) => (
              <Panel key={e.id} color={e.color} className="flex items-center gap-3 p-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-black/40">
                  <EnemyPreview id={e.sprite || e.id} radius={e.radius} color={e.color} size={56} />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-sm" style={{ color: e.color }}>
                    {e.name} {e.kind === "boss" && <span className="ml-1 rounded bg-rose-500/20 px-1.5 text-[10px] text-rose-300">БОСС</span>}
                    {e.cls && <span className="ml-1 rounded bg-slate-500/20 px-1.5 text-[10px] text-slate-300">{ENEMY_CLASSES[e.cls].name}</span>}
                  </div>
                  <div className="mt-1 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                    <span>
                      ОЗ <b className="text-slate-200">{e.hp}</b>
                    </span>
                    <span>
                      Урон <b className="text-slate-200">{e.damage}</b>
                    </span>
                    <span>
                      Скор. <b className="text-slate-200">{e.speed}</b>
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {e.kind === "gunner" && "Держит дистанцию и стреляет"}
                    {e.kind === "kamikaze" && "Взрывается рядом с пилотом"}
                    {e.kind === "phantom" && "Телепортируется к цели"}
                    {e.kind === "crate" && "Содержит полезные припасы"}
                    {e.kind === "nest" && "Неподвижно, порождает личинок"}
                    {e.kind === "boss" && "Войд-зоны, редкие залпы, рывки, призыв"}
                    {e.kind === "chaser" && "Преследует пилота"}
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
