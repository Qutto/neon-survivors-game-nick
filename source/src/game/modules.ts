// Модули корабля: выпадают с боссов, ставятся в слоты ангара, прокачиваются за кредиты + фрагменты
import type { PlayerStats } from "./data";

export type Rarity = "common" | "rare" | "epic" | "legendary";

export const RARITY: Record<Rarity, { name: string; color: string; dupFragments: number; baseCost: number; fragMul: number }> = {
  common: { name: "Обычный", color: "#94a3b8", dupFragments: 2, baseCost: 200, fragMul: 1 },
  rare: { name: "Редкий", color: "#38bdf8", dupFragments: 4, baseCost: 350, fragMul: 2 },
  epic: { name: "Эпический", color: "#c084fc", dupFragments: 8, baseCost: 600, fragMul: 3 },
  legendary: { name: "Легендарный", color: "#fbbf24", dupFragments: 15, baseCost: 1000, fragMul: 5 },
};

export interface ModuleDef {
  id: string;
  name: string;
  rarity: Rarity;
  color: string;
  desc: (lvl: number) => string;
  stats?: (lvl: number) => Partial<PlayerStats>; // пассивная прибавка к характеристикам
}

export const MODULE_MAX_LEVEL = 5;

// «Отталкиватель»: срабатывает, когда рядом с кораблём столько врагов
export const REPULSOR_CROWD = 7;
export const REPULSOR_RADIUS = 120;
export function repulsorCd(l: number) {
  return 9 - 0.75 * (l - 1);
}
// старые сохранения: модули, которые переименованы
export const MODULE_RENAMES: Record<string, string> = { mod_dash: "mod_repulsor" };

export const MODULES: ModuleDef[] = [
  {
    id: "mod_overclock",
    name: "Боевой разгон",
    rarity: "common",
    color: "#f87171",
    desc: (l) => `+${5 * l}% урона`,
    stats: (l) => ({ might: 0.05 * l }),
  },
  {
    id: "mod_nanoarmor",
    name: "Нанопанцирь",
    rarity: "common",
    color: "#94a3b8",
    desc: (l) => `+${8 * l} к здоровью${l >= 2 ? `, +${Math.floor(l / 2)} брони` : ""}`,
    stats: (l) => ({ maxHp: 8 * l, armor: Math.floor(l / 2) }),
  },
  {
    id: "mod_gravcore",
    name: "Гравиядро",
    rarity: "common",
    color: "#a78bfa",
    desc: (l) => `+${12 * l}% радиуса сбора, +${3 * l}% опыта`,
    stats: (l) => ({ magnet: 0.12 * l, growth: 0.03 * l }),
  },
  {
    id: "mod_salvager",
    name: "Утилизатор",
    rarity: "common",
    color: "#facc15",
    desc: (l) => `+${6 * l}% кредитов`,
    stats: (l) => ({ greed: 0.06 * l }),
  },
  {
    id: "mod_collector",
    name: "Дрон-сборщик",
    rarity: "rare",
    color: "#2dd4bf",
    desc: (l) => `Каждые 4 с стягивает опыт в радиусе ${260 + 40 * l}`,
  },
  {
    id: "mod_scanner",
    name: "Сканер",
    rarity: "rare",
    color: "#38bdf8",
    desc: (l) => `Видит врагов на миникарте даже в метель, +${5 * l}% удачи`,
    stats: (l) => ({ luck: 0.05 * l }),
  },
  {
    // заменил «Форсаж»: рывок требовал второй кнопки, а игра управляется одним пальцем (столп 03)
    id: "mod_repulsor",
    name: "Отталкиватель",
    rarity: "rare",
    color: "#22d3ee",
    desc: (l) => `Сам срабатывает, когда тебя зажимают: отбрасывает толпу и даёт миг неуязвимости · раз в ${repulsorCd(l).toFixed(1)} с`,
  },
  {
    id: "mod_shield",
    name: "Щит-генератор",
    rarity: "epic",
    color: "#60a5fa",
    desc: (l) => `Поглощает один удар · перезарядка ${(14 - 1.5 * (l - 1)).toFixed(1)} с`,
  },
  {
    id: "mod_retaliation",
    name: "Ответный импульс",
    rarity: "epic",
    color: "#f472b6",
    desc: (l) => `Когда по тебе попали — взрыв на ${Math.round(60 * (1 + 0.5 * (l - 1)))} урона вокруг`,
  },
  {
    id: "mod_chrono",
    name: "Хроноядро",
    rarity: "legendary",
    color: "#fde047",
    desc: (l) => `Каждые ${32 - 2 * l} с останавливает время для врагов на ${(2 + 0.3 * l).toFixed(1)} с`,
  },
];

export function getModule(id: string) {
  return MODULES.find((m) => m.id === id);
}

export function moduleUpgradeCost(def: ModuleDef, lvl: number) {
  const r = RARITY[def.rarity];
  return { credits: r.baseCost * lvl, fragments: r.fragMul * lvl };
}

// Шансы редкости по планетам (веса)
const DROP_WEIGHTS: Record<string, Record<Rarity, number>> = {
  home: { common: 80, rare: 20, epic: 0, legendary: 0 },
  ice: { common: 45, rare: 35, epic: 18, legendary: 2 },
  hive: { common: 20, rare: 35, epic: 35, legendary: 10 },
};

export function rollModule(planetId: string): ModuleDef {
  const w = DROP_WEIGHTS[planetId] || DROP_WEIGHTS.home;
  let total = 0;
  for (const k of Object.keys(w) as Rarity[]) total += w[k];
  let r = Math.random() * total;
  let rar: Rarity = "common";
  for (const k of Object.keys(w) as Rarity[]) {
    r -= w[k];
    if (r <= 0) {
      rar = k;
      break;
    }
  }
  const pool = MODULES.filter((m) => m.rarity === rar);
  return pool[(Math.random() * pool.length) | 0];
}

export const SLOT_COSTS = [
  { credits: 1500, fragments: 10 }, // 4-й слот
  { credits: 4000, fragments: 40 }, // 5-й слот
];
export const BASE_SLOTS = 3;
export const MAX_SLOTS = BASE_SLOTS + SLOT_COSTS.length;

export function moduleStatBonus(levels: Record<string, number>): Partial<PlayerStats> {
  const out: Partial<PlayerStats> = {};
  for (const [id, l] of Object.entries(levels)) {
    const def = getModule(id);
    if (!def?.stats || l <= 0) continue;
    const add = def.stats(l);
    (Object.keys(add) as (keyof PlayerStats)[]).forEach((k) => {
      out[k] = (out[k] || 0) + (add[k] as number);
    });
  }
  return out;
}
