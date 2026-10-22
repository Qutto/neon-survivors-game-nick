// Планеты: арена, волны, события, боссы и особые механики
import { WAVES, type GameEvent, type Wave } from "./data";

export type PlanetId = "home" | "ice" | "hive";

export interface PlanetPalette {
  bg: string;
  grid: string;
  grid2: string;
  decor: [string, string, string, string]; // 4 цвета декора пола (rgba)
  style: "tech" | "ice" | "hive";
}

export interface PlanetDef {
  id: PlanetId;
  name: string;
  title: string;
  desc: string;
  features: string[];
  color: string;
  palette: PlanetPalette;
  arena: { shape: "square" | "circle"; size: number }; // полуширина квадрата или радиус круга
  duration: number; // момент появления финального босса
  timeScale: number; // «время планеты» к финалу = 05:00 × timeScale (см. planetTime): по нему растут враги и идут волны
  finalBoss: string;
  waves: Wave[];
  events: GameEvent[];
  hpMul: number;
  dmgMul: number;
  bossHpMul: number;
  rewardMul: number;
  xpMul: number; // множитель опыта (Улей даёт больше врагов из гнёзд и деления — опыт за врага ниже)
  victoryBonus: number;
  traction: number; // 30 — обычное управление, меньше — скольжение
  base: number; // радиус купола-базы в центре (0 — нет)
  split: number; // шанс, что враг при смерти распадётся на личинок
  unlockAfter: PlanetId | null;
  frag: { boss: number; elite: number; nest: number }; // фрагменты: за босса; шанс за элитку / гнездо
  moduleChance: number; // шанс модуля с босса
  maxEnemies: number; // предел обычных врагов на поле
  startText: string;
  victoryText: string;
}

// Столп 09: забег 5–6 минут. «Время планеты» разгоняется постепенно: начало идёт в темпе прежней длинной игры,
// к финалу (RUN_END) время планеты = RUN_END × timeScale. Так первые минуты не душат новичка, а финал — плотный.
export const RUN_END = 300;
export function planetTime(t: number, ts: number): number {
  const a = (ts - 1) / RUN_END;
  if (t <= RUN_END) return t + a * t * t;
  return RUN_END * ts + ts * (t - RUN_END); // бесконечный режим: дальше линейно
}
function planetTimeInv(T: number, ts: number): number {
  const a = (ts - 1) / RUN_END;
  if (a <= 0) return T;
  if (T <= RUN_END * ts) return (-1 + Math.sqrt(1 + 4 * a * T)) / (2 * a);
  return RUN_END + (T - RUN_END * ts) / ts;
}

// Базовые волны (рассчитаны на 15 минут) переводятся во «время планеты»
const remap = (waves: Wave[], map: Record<string, string>, minMul: number, intMul: number, until = Infinity, ts = 1): Wave[] =>
  waves
    .filter((w) => w.t <= until)
    .map((w) => ({
      t: Math.round(planetTimeInv(w.t, ts)),
      min: Math.round(w.min * minMul),
      interval: +(w.interval * intMul).toFixed(2),
      batch: w.batch,
      pool: w.pool.map(([id, wt]) => [map[id] || id, wt] as [string, number]),
    }));

const byTime = (a: GameEvent, b: GameEvent) => a.t - b.t;
const elites = (from: number, to: number, step: number, skip: number[] = []): GameEvent[] => {
  const out: GameEvent[] = [];
  for (let t = from; t < to; t += step) if (!skip.some((s) => Math.abs(s - t) < 8)) out.push({ t, type: "elite" });
  return out;
};

// ---------------- Родная планета ----------------
// К 05:00 Нео-Терра доходит до «старых» 07:30, Крио-7 — до 08:00, Улей — до 08:30
const HOME_TS = 1.5;
const ICE_TS = 1.6;
const HIVE_TS = 1.7;
const HOME_WAVES: Wave[] = [
  ...remap(WAVES, {}, 1, 1, 450, HOME_TS),
  { t: 300, min: 45, interval: 0.95, batch: 3, pool: [["trooper", 2], ["swarm", 4], ["phantom", 1], ["mech", 1.2], ["brute", 0.4]] },
];
const HOME_EVENTS: GameEvent[] = ([
  ...elites(30, 300, 45, [150]),
  { t: 50, type: "ring", enemy: "swarm", count: 20 },
  { t: 100, type: "rush", enemy: "drone", count: 18 },
  { t: 150, type: "boss", enemy: "sentinel" },
  { t: 190, type: "ring", enemy: "crawler", count: 24 },
  { t: 240, type: "rush", enemy: "kamikaze", count: 14 },
  { t: 300, type: "boss", enemy: "dreadnought" },
] as GameEvent[]).sort(byTime);

// ---------------- Крио-7 ----------------
const ICE_MAP: Record<string, string> = {
  drone: "frost_drone",
  swarm: "snowmite",
  trooper: "cryo_trooper",
  crawler: "ice_crawler",
  gunner: "frost_gunner",
  brute: "ice_golem",
};
const ICE_EVENTS: GameEvent[] = ([
  ...elites(30, 300, 30, [150]),
  { t: 35, type: "ring", enemy: "snowmite", count: 26 },
  { t: 65, type: "rush", enemy: "frost_drone", count: 24 },
  { t: 125, type: "ring", enemy: "ice_crawler", count: 32 },
  { t: 150, type: "boss", enemy: "queen", hpMul: 0.4 },
  { t: 165, type: "rush", enemy: "kamikaze", count: 20 },
  { t: 225, type: "ring", enemy: "phantom", count: 36 },
  { t: 265, type: "rush", enemy: "ice_crawler", count: 30 },
  { t: 285, type: "ring", enemy: "snowmite", count: 48 },
  { t: 300, type: "boss", enemy: "omega", hpMul: 0.45 },
  { t: 50, type: "blizzard", count: 12 },
  { t: 145, type: "blizzard", count: 14 },
  { t: 235, type: "blizzard", count: 16 },
] as GameEvent[]).sort(byTime);

// ---------------- Улей Ксенос ----------------
const HIVE_MAP: Record<string, string> = {
  drone: "xeno_drone",
  swarm: "larva",
  trooper: "xeno_warrior",
  crawler: "xeno_crawler",
  gunner: "spitter",
  kamikaze: "bloater",
  mech: "carapace",
  phantom: "stalker",
  brute: "xeno_brute",
};
const HIVE_EVENTS: GameEvent[] = ([
  ...elites(25, 300, 25, [150]),
  { t: 10, type: "nest", count: 2 },
  { t: 35, type: "ring", enemy: "larva", count: 26 },
  { t: 40, type: "nest", count: 2 },
  { t: 65, type: "rush", enemy: "xeno_drone", count: 24 },
  { t: 80, type: "nest", count: 2 },
  { t: 120, type: "nest", count: 3 },
  { t: 125, type: "ring", enemy: "xeno_crawler", count: 32 },
  { t: 150, type: "boss", enemy: "omega", hpMul: 0.15 },
  { t: 160, type: "nest", count: 3 },
  { t: 165, type: "rush", enemy: "bloater", count: 20 },
  { t: 200, type: "nest", count: 3 },
  { t: 225, type: "ring", enemy: "stalker", count: 36 },
  { t: 240, type: "nest", count: 4 },
  { t: 265, type: "rush", enemy: "xeno_crawler", count: 30 },
  { t: 285, type: "ring", enemy: "larva", count: 48 },
  { t: 300, type: "boss", enemy: "hive_mother", hpMul: 0.35 },
] as GameEvent[]).sort(byTime);

export const PLANETS: PlanetDef[] = [
  {
    id: "home",
    name: "НЕО-ТЕРРА",
    title: "Оборона родной планеты",
    desc: "Твой дом. В центре — купол обороны: под ним чинишься, а враги вязнут. Лучшее место, чтобы накопить кредиты.",
    features: ["Купол в центре понемногу чинит", "Здесь учатся выживать", "5 минут, финал — Осадный дредноут"],
    color: "#34d399",
    palette: {
      bg: "#04100c",
      grid: "rgba(52,211,153,0.07)",
      grid2: "rgba(34,211,238,0.10)",
      decor: ["rgba(52,211,153,", "rgba(34,211,238,", "rgba(250,204,21,", "rgba(163,230,53,"],
      style: "tech",
    },
    arena: { shape: "circle", size: 2500 },
    duration: 300,
    timeScale: HOME_TS,
    finalBoss: "dreadnought",
    waves: HOME_WAVES,
    events: HOME_EVENTS,
    // HISTORY п. 18: новичок проходит первую планету с трудом (раньше — лёгкая ферма)
    hpMul: 1.2,
    dmgMul: 1,
    bossHpMul: 0.8,
    rewardMul: 1,
    xpMul: 1.15,
    victoryBonus: 150,
    traction: 30,
    base: 190,
    split: 0,
    unlockAfter: null,
    frag: { boss: 0, elite: 0, nest: 0 },
    moduleChance: 0.35,
    maxEnemies: 150,
    startText: "Защити купол · в 05:00 придёт Осадный дредноут",
    victoryText: "Осадный дредноут сбит. Нео-Терра в безопасности — путь на Крио-7 открыт.",
  },
  {
    id: "ice",
    name: "КРИО-7",
    title: "Ледяная планета",
    desc: "Скользкий лёд и метели, в которых не видно дальше вытянутой руки. Корабль разгоняется и тормозит с заносом.",
    features: ["Лёд: управление с инерцией", "Метели скрывают врагов", "5 минут, финал — ОМЕГА-ЯДРО", "Кредиты ×2, фрагменты"],
    color: "#e2e8f0",
    palette: {
      bg: "#07111c",
      grid: "rgba(226,232,240,0.07)",
      grid2: "rgba(186,230,253,0.12)",
      decor: ["rgba(186,230,253,", "rgba(125,211,252,", "rgba(224,242,254,", "rgba(147,197,253,"],
      style: "ice",
    },
    arena: { shape: "circle", size: 2000 },
    duration: 300,
    timeScale: ICE_TS,
    finalBoss: "omega",
    waves: [...remap(WAVES, ICE_MAP, 1.1, 1, 470, ICE_TS), ...remap(WAVES.slice(-1), ICE_MAP, 1.1, 1, Infinity, 3).map((w) => ({ ...w, t: RUN_END }))],
    events: ICE_EVENTS,
    hpMul: 1.3, // было 1.4 / 1.2 при 15-минутном забеге; плотность волн 5-минутного выше
    dmgMul: 1.05,
    bossHpMul: 2,
    rewardMul: 2,
    xpMul: 1,
    victoryBonus: 400,
    traction: 3.2,
    base: 0,
    split: 0,
    unlockAfter: "home",
    frag: { boss: 4, elite: 0.35, nest: 0 },
    moduleChance: 0.6,
    maxEnemies: 300,
    startText: "Лёд скользкий, метели близко · финал в 05:00",
    victoryText: "ОМЕГА-ЯДРО разбито о лёд Крио-7. Сигнал Улья засечён на краю системы.",
  },
  {
    id: "hive",
    name: "УЛЕЙ КСЕНОС",
    title: "Планета-улей пришельцев",
    desc: "Живая планета. Гнёзда без остановки рождают личинок, а убитые твари распадаются на новых. Арена тесная.",
    features: ["Гнёзда порождают личинок — уничтожай их", "Враги делятся при смерти", "Элитные враги каждые 25 секунд", "Кредиты ×3.5, много фрагментов"],
    color: "#d946ef",
    palette: {
      bg: "#0c0610",
      grid: "rgba(217,70,239,0.05)",
      grid2: "rgba(168,85,247,0.09)",
      decor: ["rgba(192,38,211,", "rgba(232,121,249,", "rgba(163,230,53,", "rgba(244,114,182,"],
      style: "hive",
    },
    arena: { shape: "square", size: 1600 },
    duration: 300,
    timeScale: HIVE_TS,
    finalBoss: "hive_mother",
    waves: [...remap(WAVES, HIVE_MAP, 1.2, 0.9, 500, HIVE_TS), ...remap(WAVES.slice(-1), HIVE_MAP, 1.2, 0.9, Infinity, 3).map((w) => ({ ...w, t: RUN_END }))],
    events: HIVE_EVENTS,
    hpMul: 1.6,
    dmgMul: 1.3,
    bossHpMul: 3,
    rewardMul: 3.5,
    xpMul: 0.8,
    victoryBonus: 900,
    traction: 30,
    base: 0,
    split: 0.18,
    unlockAfter: "ice",
    frag: { boss: 8, elite: 0.6, nest: 0.4 },
    moduleChance: 0.85,
    maxEnemies: 460,
    startText: "Жги гнёзда · в 05:00 — Праматерь Ксенос",
    victoryText: "Праматерь Ксенос мертва. Улей затих — система свободна.",
  },
];

export function getPlanet(id: string | undefined): PlanetDef {
  return PLANETS.find((p) => p.id === id) || PLANETS[0];
}

export function planetUnlocked(p: PlanetDef, cleared: string[]) {
  return !p.unlockAfter || cleared.includes(p.unlockAfter);
}
