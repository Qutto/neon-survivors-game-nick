// Сохранение прогресса в localStorage
import { BASE_STATS, CHARACTERS, META_UPGRADES, OVERLOAD_FACTOR, type PassiveModel, type PlayerStats, type CharacterDef } from "./data";
import { BASE_SLOTS, MAX_SLOTS, MODULES, MODULE_MAX_LEVEL, MODULE_RENAMES, getModule, moduleStatBonus } from "./modules";
import { PLANETS } from "./planets";

export interface Settings {
  sfx: number;
  music: number;
  damageNumbers: boolean;
  screenShake: boolean;
  godMode?: boolean; // бессмертие — работает только в тестовом режиме
  passiveModel?: PassiveModel; // тест пассивок (столп 06): A — 4 слота, B — без лимита
}

export interface SaveData {
  credits: number;
  upgrades: Record<string, number>;
  unlocked: string[];
  bestTime: number;
  bestKills: number;
  bestLevel: number;
  totalKills: number;
  runs: number;
  wins: number;
  lastCharacter: string;
  discovered: string[];
  planetsCleared: string[];
  lastPlanet: string;
  fragments: number;
  modules: Record<string, number>; // id → уровень (есть в коллекции)
  equipped: string[]; // установленные в слоты
  slots: number;
  overload: Record<string, number>; // уровни «перегрузки» улучшений лаборатории
  settings: Settings;
  bestEndless: number; // рекорд бесконечного режима, с
  // контент коллеги: достижения для открытия пилотов и ежедневный контейнер
  bossKills: number;
  eliteKills: number;
  bestBaseStay: number; // рекорд «в куполе Нео-Терры, не выходя», с
  dailyDate: string; // последний забранный ежедневный контейнер (ГГГГ-ММ-ДД)
  dailyStreak: number;
}

const KEY = "neon-survivors-2199-save";
// Тестовый режим живёт в отдельном сохранении — настоящий прогресс не трогается
const SANDBOX_KEY = "neon-survivors-2199-sandbox-save";
const SANDBOX_FLAG = "neon-survivors-2199-sandbox";

export function isSandbox(): boolean {
  try {
    return localStorage.getItem(SANDBOX_FLAG) === "1";
  } catch {
    return false;
  }
}

export function setSandbox(v: boolean) {
  try {
    if (v) localStorage.setItem(SANDBOX_FLAG, "1");
    else localStorage.removeItem(SANDBOX_FLAG);
  } catch {
    /* ignore */
  }
}

// Всё открыто: пилоты, планеты, модули на максимуме, все слоты, кредиты и фрагменты с запасом
export function sandboxSave(settings: Settings): SaveData {
  const modules: Record<string, number> = {};
  for (const m of MODULES) modules[m.id] = MODULE_MAX_LEVEL;
  return {
    ...freshSave(),
    credits: 999999,
    fragments: 99999,
    unlocked: CHARACTERS.map((c) => c.id),
    planetsCleared: PLANETS.map((p) => p.id),
    modules,
    slots: MAX_SLOTS,
    settings: { ...settings },
  };
}

export const DEFAULT_SAVE: SaveData = {
  credits: 0,
  upgrades: {},
  unlocked: ["recruit", "reiji"],
  bestTime: 0,
  bestKills: 0,
  bestLevel: 0,
  totalKills: 0,
  runs: 0,
  wins: 0,
  lastCharacter: "recruit",
  discovered: [],
  planetsCleared: [],
  lastPlanet: "home",
  fragments: 0,
  modules: {},
  equipped: [],
  slots: BASE_SLOTS,
  overload: {},
  settings: { sfx: 0.6, music: 0.35, damageNumbers: true, screenShake: true, passiveModel: "A" },
  bestEndless: 0,
  bossKills: 0,
  eliteKills: 0,
  bestBaseStay: 0,
  dailyDate: "",
  dailyStreak: 0,
};

// переименованные модули: переносим уровень и слот
function migrateModules(mods: Record<string, number>, equipped: string[]) {
  const m = { ...mods };
  const eq = [...equipped];
  for (const [from, to] of Object.entries(MODULE_RENAMES)) {
    if (m[from]) {
      m[to] = Math.max(m[to] || 0, m[from]);
      delete m[from];
    }
    const i = eq.indexOf(from);
    if (i >= 0) {
      if (eq.includes(to)) eq.splice(i, 1);
      else eq[i] = to;
    }
  }
  return { modules: m, equipped: eq };
}

export function freshSave(): SaveData {
  return JSON.parse(JSON.stringify(DEFAULT_SAVE)) as SaveData;
}

export function hasSave(sandbox = false): boolean {
  try {
    return !!localStorage.getItem(sandbox ? SANDBOX_KEY : KEY);
  } catch {
    return false;
  }
}

export function loadSave(sandbox = false): SaveData {
  try {
    const raw = localStorage.getItem(sandbox ? SANDBOX_KEY : KEY);
    if (!raw) return freshSave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const mig = migrateModules(parsed.modules || {}, parsed.equipped || []);
    return {
      ...freshSave(),
      ...parsed,
      settings: { ...DEFAULT_SAVE.settings, ...(parsed.settings || {}) },
      upgrades: { ...(parsed.upgrades || {}) },
      modules: mig.modules,
      overload: { ...(parsed.overload || {}) },
      equipped: mig.equipped.filter((id) => getModule(id)),
      unlocked: Array.from(new Set([...(DEFAULT_SAVE.unlocked), ...(parsed.unlocked || [])])),
      discovered: parsed.discovered || [],
      // старые сохранения с победами считаем прошедшими родную планету
      planetsCleared: parsed.planetsCleared || ((parsed.wins || 0) > 0 ? ["home"] : []),
    };
  } catch {
    return freshSave();
  }
}

export function writeSave(s: SaveData, sandbox = false) {
  try {
    localStorage.setItem(sandbox ? SANDBOX_KEY : KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function computeStartStats(save: SaveData, ch: CharacterDef): PlayerStats {
  const s: PlayerStats = { ...BASE_STATS };
  for (const up of META_UPGRADES) {
    const lvl = save.upgrades[up.id] || 0;
    if (lvl > 0) s[up.stat] += up.perLevel * lvl;
    const ov = save.overload[up.id] || 0;
    if (ov > 0) s[up.stat] += up.perLevel * OVERLOAD_FACTOR * ov;
  }
  const mods = moduleStatBonus(equippedLevels(save));
  (Object.keys(mods) as (keyof PlayerStats)[]).forEach((k) => {
    s[k] += mods[k] as number;
  });
  (Object.keys(ch.bonuses) as (keyof PlayerStats)[]).forEach((k) => {
    s[k] += ch.bonuses[k] as number;
  });
  return s;
}

export function equippedLevels(save: SaveData): Record<string, number> {
  const out: Record<string, number> = {};
  for (const id of save.equipped) if (save.modules[id]) out[id] = save.modules[id];
  return out;
}

export function getCharacter(id: string): CharacterDef {
  return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
}

// ------------------------------------------------------------
//  Пилоты за достижения (контент коллеги)
// ------------------------------------------------------------
const mmss = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

export function unlockProgress(save: SaveData, ch: CharacterDef): { done: boolean; text: string } {
  const u = ch.unlock;
  if (!u) return { done: save.credits >= ch.price, text: String(ch.price) };
  const v = Number(u.value);
  switch (u.kind) {
    case "bosses":
      return { done: save.bossKills >= v, text: `Боссов: ${Math.min(save.bossKills, v)}/${v}` };
    case "elites":
      return { done: save.eliteKills >= v, text: `Элиток: ${Math.min(save.eliteKills, v)}/${v}` };
    case "planet": {
      const ok = save.planetsCleared.includes(String(u.value));
      return { done: ok, text: ok ? "Выполнено" : "Ещё не пройдено" };
    }
    case "base":
      return { done: save.bestBaseStay >= v, text: `Рекорд в куполе: ${mmss(save.bestBaseStay)} из ${mmss(v)}` };
  }
}

// открыть всех пилотов, чьи достижения выполнены; fresh — кто открылся только что
export function autoUnlock(save: SaveData): { save: SaveData; fresh: string[] } {
  const fresh = CHARACTERS.filter((c) => c.unlock && !save.unlocked.includes(c.id) && unlockProgress(save, c).done).map((c) => c.id);
  return fresh.length ? { save: { ...save, unlocked: [...save.unlocked, ...fresh] }, fresh } : { save, fresh };
}

// ------------------------------------------------------------
//  Ежедневный контейнер (контент коллеги): 7 дней подряд, награда растёт, на 7-й — фрагменты
// ------------------------------------------------------------
export const DAILY_BASE = 100;
export const DAILY_STEP = 50;
export const DAILY_FRAGMENTS = 10;

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function dailyState(save: SaveData, now = new Date()) {
  const today = dayKey(now);
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const day = ((save.dailyDate === dayKey(y) ? save.dailyStreak : 0) % 7) + 1;
  return { available: save.dailyDate !== today, day, credits: DAILY_BASE + DAILY_STEP * (day - 1), fragments: day === 7 ? DAILY_FRAGMENTS : 0 };
}

export function claimDaily(save: SaveData, mul: number, now = new Date()): SaveData {
  const d = dailyState(save, now);
  if (!d.available) return save;
  return { ...save, credits: save.credits + d.credits * mul, fragments: save.fragments + d.fragments * mul, dailyDate: dayKey(now), dailyStreak: d.day === 1 ? 1 : save.dailyStreak + 1 };
}
