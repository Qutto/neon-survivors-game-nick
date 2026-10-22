import {
  BASE_WEAPON_IDS,
  BOSS_CONTACT_MUL,
  BOSS_ENTRY_SHIELD,
  BULLET_COUNT_MUL,
  BULLET_SPEED_MUL,
  CHAOS_EVERY,
  ARMOR_FLOOR,
  ENDLESS_BOSS_EVERY,
  ENDLESS_DMG_STEP,
  ENDLESS_HP_STEP,
  ENDLESS_REWARD_STEP,
  ENDLESS_SPAWN_STEP,
  ENDLESS_START_LEVEL,
  ENDLESS_STEP,
  ENDLESS_SURGE,
  GUNNER_FIRE_EVERY,
  ARMOR_MIN_HIT,
  AWAKEN_MIN_TIME,
  BOSS_ARMOR,
  ELITE_ARMOR,
  MAX_WEAPON_MODS,
  WEAPON_MODS,
  RULE_PERKS,
  RULE_PERK_IDS,
  RULE_PERK_OFFER,
  BULLET_DMG_MUL,
  MAGNET_SCHEDULE,
  SLOT_DMG_MUL,
  VOID_BOSS_DMG,
  VOID_ELITE_CHANCE,
  VOID_ELITE_DMG,
  VOID_TICK,
  VOID_WARN,
  maxPassives,
  perkDef,
  type PassiveModel,
  BOSS_SPAWN_EXTRA,
  ENEMIES,
  MEDKIT_EVERY,
  MEDKIT_MAX_STOCK,
  RARE_DROP_EVERY,
  REFILL_BURST,
  REFILL_MIN_RATE,
  REFILL_TIME,
  SINGULARITY_COLLAPSE_MUL,
  SUPER_XP_GROWTH,
  effectiveArea,
  superTotal,
  superValue,
  MAX_WEAPONS,
  PASSIVES,
  PASSIVE_IDS,
  PLAYER_BASE_MAGNET,
  PLAYER_BASE_SPEED,
  SUPERS,
  WEAPONS,
  weaponMaxLevel,
  weaponStatsAt,
  xpToNext,
  type CharacterDef,
  type EnemyDef,
  type GameEvent,
  type PassiveDef,
  type PlayerStats,
  type Wave,
  type WeaponDef,
  type WeaponStats,
} from "./data";
import { audio } from "./audio";
import {
  ENEMY_FACING,
  drawShipFlames,
  drawSprite,
  drawSpriteRot,
  gemTier,
  getBoltSprite,
  getDiscSprite,
  getEnemyFrames,
  getGemSprite,
  getGlow,
  getMissileSprite,
  getOrbSprite,
  getOrbiterSprite,
  getPickupSprite,
  getPlayerSprite,
  hexToRgba,
  type PickupKind,
  type Sprite,
} from "./sprites";
import type { Settings } from "./save";
import { planetTime, type PlanetDef } from "./planets";
import { REPULSOR_CROWD, REPULSOR_RADIUS, RARITY, repulsorCd, rollModule } from "./modules";

// ============================================================
//  Публичные типы
// ============================================================
export interface UpgradeOption {
  kind: "weapon" | "passive" | "heal" | "credits" | "super" | "perk" | "wmod";
  id: string;
  name: string;
  color: string;
  level: number;
  isNew: boolean;
  desc: string;
  hint?: string;
  perkType?: "rule"; // для kind === "perk"
  modId?: string; // для kind === "wmod": какой мод
  slot?: number; // для kind === "wmod": на какую пушку
}

export interface ChestItem {
  kind: "weapon" | "passive" | "evolution" | "heal" | "credits" | "super" | "perk" | "wmod";
  id: string;
  name: string;
  color: string;
  text: string;
}

export type ChestTier = "common" | "rare" | "legendary" | "evolution" | "awaken";
export interface ChestReward {
  items: ChestItem[];
  credits: number;
  tier: ChestTier;
  again: number; // сколько ещё раз можно открыть за рекламу в этом забеге
}

export interface HudItem {
  id: string;
  level: number;
  max: number;
  evolved?: boolean;
  ready?: boolean;
}

export interface HudState {
  hp: number;
  maxHp: number;
  xp: number;
  xpNext: number;
  level: number;
  time: number;
  kills: number;
  credits: number;
  weapons: HudItem[];
  passives: HudItem[];
  boss: { name: string; hp: number; maxHp: number; color: string } | null;
  freeze: number;
  revivals: number;
  duration: number;
  blizzard: number;
  fragments: number;
  repulsor: number; // -1 — нет модуля, иначе 0..1 готовность
  shield: number; // -1 — нет модуля, иначе 0..1 готовность
  barrier: boolean; // барьер «Бастиона» готов
  maxWeapons: number;
  maxPassives: number;
  perks: string[];
  endless: { time: number; mul: number; level: number; next: number } | null; // level — ступень угрозы, next — 0..1 до следующей
  still: boolean; // корабль стоит (для перков «стоя»)
}

export interface RunWeaponStat {
  id: string;
  level: number;
  damage: number;
  dps: number;
}

export interface RunResult {
  victory: boolean;
  time: number;
  kills: number;
  level: number;
  credits: number;
  creditsCollected: number;
  survivalBonus: number;
  victoryBonus: number;
  weapons: RunWeaponStat[];
  passives: HudItem[];
  characterId: string;
  damageTaken: number;
  bossesKilled: number;
  elitesKilled: number;
  baseStay: number; // сколько продержался в куполе Нео-Терры с начала забега, с
  discovered: string[];
  planetId: string;
  fragments: number;
  modulesFound: FoundModule[];
  perks: string[];
  endlessTime: number; // сколько продержался в бесконечном режиме, с (0 — не заходил)
  endlessMul: number; // множитель наград бесконечного режима на момент конца
  endlessBonus: number; // награда бесконечного режима (уже в credits)
  adRevived: boolean;
}

export interface VictoryInfo {
  boss: string;
  credits: number; // уже заработано в забеге (с бонусом за победу)
}

export interface FoundModule {
  id: string;
  dup: boolean;
  frags: number;
}

export interface BuildSnapshot {
  stats: PlayerStats;
  weapons: HudItem[];
  passives: HudItem[];
}

export interface LevelMeta {
  rerolls: number;
  skips: number;
  adRerolls: number; // перебросы за рекламу, когда обычные кончились
}

export interface EngineCallbacks {
  onHud: (h: HudState) => void;
  onLevelUp: (options: UpgradeOption[], meta: LevelMeta) => void;
  onChest: (r: ChestReward) => void;
  onGameOver: (r: RunResult) => void;
  onPauseKey: () => void;
  onBlur: () => void;
  onVictoryChoice?: (info: VictoryInfo) => void; // финальный босс убит: эвакуация или бесконечный режим
  onReviveOffer?: () => void; // смерть: предложить воскрешение за рекламу
  onProtocol?: (options: UpgradeOption[]) => void; // первый босс убит: выбор одного перка-правила
}

export interface EngineConfig {
  character: CharacterDef;
  stats: PlayerStats;
  settings: Settings;
  planet: PlanetDef;
  modules: Record<string, number>; // установленные модули и их уровни
  owned: string[]; // все модули в коллекции (для дубликатов)
  passiveModel?: PassiveModel;
  adRevive?: boolean; // можно ли предложить воскрешение за рекламу
}

// ============================================================
//  Внутренние сущности
// ============================================================
export interface Enemy {
  id: number;
  def: EnemyDef;
  x: number;
  y: number;
  kx: number;
  ky: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  radius: number;
  xp: number;
  flash: number;
  slow: number;
  slowAmt: number;
  stun: number;
  dead: boolean;
  elite: boolean;
  boss: boolean;
  frames: Sprite[]; // кадры анимации (Неон 2.0)
  face: number; // куда смотрит (враги поворачиваются к пилоту)
  armor: number; // броня элиток и боссов
  burnStacks: number; // «Метка смерти»
  burnT: number;
  burnDps: number;
  burnTick: number;
  burnSrc: number;
  frozenT: number; // заморожен «Криолучом»
  scale: number;
  hitUntil: number[];
  attackCd: number;
  t: number;
  t2: number;
  t3: number;
  spin: number;
  charge: number;
  dashing: number;
  dvx: number;
  dvy: number;
  anim: number;
  rush: boolean;
  rvx: number;
  rvy: number;
  rushLife: number;
  shield: number; // неуязвимость (вход босса)
  voidy: boolean; // аффикс элитки «Пустотный»: оставляет медленные войд-зоны
  voidT: number;
  inWell: number; // недавно был в колодце сингулярности (перк «Горизонт»)
  lastSrc: number; // кто нанёс последний удар (слот оружия)
}

export interface WeaponInst {
  slot: number;
  def: WeaponDef;
  level: number;
  stats: WeaponStats;
  timer: number;
  burst: number;
  burstTimer: number;
  burstIdx: number;
  targets: Enemy[];
  active: number;
  angle: number;
  pulse: number;
  damage: number;
  since: number;
  over: number; // уровни сверх максимума («Монолит»)
  count: number; // счётчик выстрелов/ударов
  aux: number[]; // таймеры пробуждений (кольцо мин, ледниковый период, таран)
  mods: string[]; // моды оружия
}

interface PassiveInst {
  def: PassiveDef;
  level: number;
}

type ProjKind = "bolt" | "missile" | "disc" | "bomblet" | "wave" | "pellet" | "slug";

interface Projectile {
  kind: ProjKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  r: number;
  damage: number;
  pierce: number;
  life: number;
  src: number;
  kb: number;
  sprite: Sprite;
  rot: number;
  spin: number;
  target: Enemy | null;
  retarget: number;
  area: number;
  spd: number;
  returned: boolean;
  dirX: number;
  dirY: number;
  hit: Set<number> | null;
  smoke: number;
  evo: boolean;
  dead: boolean;
  pct: number; // доля здоровья элитки/босса («Гарпун»)
  crit: boolean; // гарантированный крит
  life0: number;
  chain: number; // рикошеты снайперской пули
  look: string; // вид снаряда («mg» — трассер)
}

interface EBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  damage: number;
  life: number;
  sprite: Sprite;
  dead: boolean;
}

interface Gem {
  x: number;
  y: number;
  value: number;
  tier: number;
  mag: boolean;
  spd: number;
  dead: boolean;
}

interface Pickup {
  x: number;
  y: number;
  kind: PickupKind;
  mag: boolean;
  spd: number;
  bob: number;
  dead: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  streak: boolean; // искра-чёрточка (Неон 2.0)
}

interface DmgText {
  x: number;
  y: number;
  vy: number;
  life: number;
  text: string;
  color: string;
  crit: boolean;
}

type EffectKind = "slash" | "ring" | "flash" | "beam" | "lightning" | "strike" | "fireball" | "sigil" | "trail";

interface Effect {
  kind: EffectKind;
  x: number;
  y: number;
  x2: number;
  y2: number;
  r: number;
  life: number;
  max: number;
  color: string;
  width: number;
  side: number;
  pts: number[] | null;
}

interface Zone {
  kind: "marker" | "well" | "mine" | "puddle";
  x: number;
  y: number;
  r: number;
  life: number;
  max: number;
  tick: number;
  damage: number;
  src: number;
  pull: number;
  evo: boolean;
  color: string;
  dead: boolean;
}

// Войд-зона врага: сначала предупреждение на земле, потом медленно дрейфует к пилоту и бьёт стоящего внутри
interface VoidZone {
  x: number;
  y: number;
  r: number;
  warn: number;
  life: number;
  max: number;
  speed: number;
  damage: number;
  tick: number;
  dead: boolean;
}

interface Turret {
  x: number;
  y: number;
  life: number;
  max: number;
  fire: number;
  src: number;
  evo: boolean;
  angle: number;
  dead: boolean;
}

interface Banner {
  text: string;
  sub: string;
  color: string;
  life: number;
  max: number;
}

interface Eff {
  dmg: number;
  cd: number;
  amount: number;
  area: number;
  speed: number;
  dur: number;
  pierce: number;
  kb: number;
  extra: number;
}

// ============================================================
//  Утилиты
// ============================================================
const CELL = 64;
const BIG_R = 32;
const MAX_ENEMIES = 460;
const MAX_ENEMIES_ENDLESS = 560;
const BASE_HEAL = 3; // купол Нео-Терры чинит в секунду (было 10)
const MAX_PARTICLES = 700;
const MAX_TEXTS = 70;
const MAX_EBULLETS = 420;
const MAX_EFFECTS = 260;
const TAU = Math.PI * 2;
// реклама коллеги: перебросы, когда обычные кончились, и повтор контейнера — столько раз за забег
const AD_REROLLS = 3;
const AD_CHESTS = 2;
// помощь прицеливанию пулемёта: враг в этом конусе по курсу становится целью
const MG_ASSIST = 0.6;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const gkey = (cx: number, cy: number) => ((cx & 0xffff) << 16) | (cy & 0xffff);

function hash2(x: number, y: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function compact<T extends { dead: boolean }>(arr: T[]) {
  let j = 0;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (!v.dead) arr[j++] = v;
  }
  arr.length = j;
}

function jagged(pts: number[], amp: number): number[] {
  const out: number[] = [pts[0], pts[1]];
  for (let i = 2; i < pts.length; i += 2) {
    const x0 = pts[i - 2];
    const y0 = pts[i - 1];
    const x1 = pts[i];
    const y1 = pts[i + 1];
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const n = Math.max(2, Math.floor(len / 22));
    const nx = -dy / len;
    const ny = dx / len;
    for (let k = 1; k < n; k++) {
      const t = k / n;
      const o = rand(-amp, amp);
      out.push(x0 + dx * t + nx * o, y0 + dy * t + ny * o);
    }
    out.push(x1, y1);
  }
  return out;
}

function normAngle(a: number) {
  while (a > Math.PI) a -= TAU;
  while (a < -Math.PI) a += TAU;
  return a;
}

// ============================================================
//  Движок
// ============================================================
export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cb: EngineCallbacks;
  private character: CharacterDef;
  private baseStats: PlayerStats;
  private stats: PlayerStats;
  private settings: Settings;
  private planet: PlanetDef;
  private blizzard = 0;
  private blizzardMax = 1;
  private fog: HTMLCanvasElement;
  private mods: Record<string, number>;
  private owned: Set<string>;
  private supers: Record<string, number> = {};
  private fragments = 0;
  private modulesFound: FoundModule[] = [];
  private repulsorT = 0;
  private shieldCd = 0;
  private retalCd = 0;
  private collectT = 4;
  private chronoT = 30;
  private refillTokens = REFILL_BURST; // квота досыпания врагов до минимума волны
  private medTokens = 1; // квота аптечек с обычных врагов
  private rareTokens = 0; // квота бомб/хроностазиса с обычных врагов
  private superLevels = 0; // уровней, полученных после полной прокачки
  // вижн: перки, бесконечный режим, новые сущности
  private passiveModel: PassiveModel = "A";
  private maxPassivesN = 4;
  private perks = new Set<string>();
  private ruleTaken = 0;
  private chaosT = CHAOS_EVERY;
  private stillT = 0; // сколько секунд корабль стоит
  private dynMul = 1; // урон от условных бонусов (ранение, стоя, «Последний рубеж», «Хаос»)
  private barrier = false;
  private endless = false;
  private endlessStart = 0;
  private endlessBossT = 0;
  private endlessBosses = 0;
  private endlessLevel = 0;
  private victoryPending = false;
  private inVoid = false;
  private magnetIdx = 0;
  private protocolT = 0; // задержка перед окном выбора протокола после первого босса
  private protocolOffered = false;
  private protocolOptions: string[] = [];
  private adRevive = false;
  private adReviveUsed = false;
  private adRevived = false;
  private voids: VoidZone[] = [];
  // контент коллеги: пробуждения, достижения, реклама
  private awakened = false;
  private awakenT = 0;
  private elitesKilled = 0;
  private leftBase = false;
  private baseStay = 0;
  private dmgColor: string | null = null;
  private adRerolls = AD_REROLLS;
  private adChests = AD_CHESTS;
  private turrets: Turret[] = [];

  private w = 1;
  private h = 1;
  private dpr = 1;
  private zoom = 1;
  private viewHW = 1;
  private viewHH = 1;
  private canvasLeft = 0;
  private canvasTop = 0;
  private vignette: HTMLCanvasElement;
  private hurtVignette: HTMLCanvasElement;
  private gemSprites: Sprite[];
  private playerSprite: Sprite;

  private time = 0;
  private raf = 0;
  private lastT = 0;
  private modal: "levelup" | "chest" | "victory" | "revive" | "protocol" | null = null;
  private userPaused = false;
  private over = false;
  private dying = 0;
  private victoryTimer = 0;

  private player = { x: 0, y: 0, r: 13, hp: 100, vx: 0, vy: 0, fx: 1, fy: 0, side: 1, angle: 0, moving: false, iframes: 0, hurt: 0, thrust: 0 };
  private level = 1;
  private xp = 0;
  private xpNext = xpToNext(1);
  private pendingLevels = 0;
  private kills = 0;
  private runCredits = 0;
  private damageTaken = 0;
  private bossesKilled = 0;
  private rerolls = 0;
  private skips = 0;
  private revivals = 0;
  private acquired = new Set<string>();

  private weapons: WeaponInst[] = [];
  private passives: PassiveInst[] = [];
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private ebullets: EBullet[] = [];
  private gems: Gem[] = [];
  private pickups: Pickup[] = [];
  private particles: Particle[] = [];
  private texts: DmgText[] = [];
  private effects: Effect[] = [];
  private zones: Zone[] = [];
  private grid = new Map<number, Enemy[]>();
  private big: Enemy[] = [];
  private nextId = 1;
  private spawnTimer = 0;
  private eventIdx = 0;
  private crateTimer = 16;
  private freezeTimer = 0;
  private shake = 0;
  private flashScreen = 0;
  private banner: Banner | null = null;
  private hudTimer = 0;
  private keys = new Set<string>();
  private joy = { active: false, id: -1, ox: 0, oy: 0, x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement, cfg: EngineConfig, cb: EngineCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.cb = cb;
    // для автотестов (tools/playtest): открыть игру с ?bot — движок станет доступен как window.__engine
    if (new URLSearchParams(location.search).has("bot")) (window as unknown as { __engine: Engine }).__engine = this;
    this.character = cfg.character;
    this.baseStats = { ...cfg.stats };
    this.stats = { ...cfg.stats };
    this.stats.cooldown = Math.max(0.35, this.stats.cooldown);
    this.stats.area = effectiveArea(this.stats.area);
    this.settings = { ...cfg.settings };
    this.planet = cfg.planet;
    this.mods = { ...cfg.modules };
    this.owned = new Set(cfg.owned);
    this.passiveModel = cfg.passiveModel || "A";
    this.maxPassivesN = maxPassives(this.passiveModel);
    this.adRevive = !!cfg.adRevive;
    if (this.mods.mod_chrono) this.chronoT = 32 - 2 * this.mods.mod_chrono;
    this.player.hp = this.stats.maxHp;
    this.rerolls = Math.round(this.stats.rerolls);
    this.skips = Math.round(this.stats.skips);
    this.revivals = Math.round(this.stats.revival);
    this.playerSprite = getPlayerSprite(cfg.character.id, cfg.character.color);
    this.gemSprites = [0, 1, 2, 3].map((t) => getGemSprite(t));
    this.vignette = this.makeVignette("0,0,0", 0.72);
    this.hurtVignette = this.makeVignette("244,63,94", 0.9);
    this.fog = this.makeFog();
    this.addWeapon(cfg.character.weapon);
    this.resize();
    window.addEventListener("resize", this.resize);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlurEvt);
    document.addEventListener("visibilitychange", this.onVisibility);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
  }

  // ------------------------------------------------------------
  //  Публичное API
  // ------------------------------------------------------------
  start() {
    this.lastT = performance.now();
    this.showBanner(this.planet.name, this.planet.startText, this.planet.color, 4.5);
    this.emitHud();
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlurEvt);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
  }

  setUserPaused(v: boolean) {
    this.userPaused = v;
    this.keys.clear();
    this.joy.active = false;
  }

  setSettings(s: Settings) {
    this.settings = { ...s };
  }

  choose(o: UpgradeOption) {
    if (this.modal !== "levelup") return;
    this.applyOption(o);
    this.pendingLevels = Math.max(0, this.pendingLevels - 1);
    this.modal = null;
    const p = this.player;
    this.fx("ring", p.x, p.y, 120, 0.5, o.color);
    this.burst(p.x, p.y, 18, 240, o.color, 0.6, 3);
    this.emitHud();
    if (this.pendingLevels > 0) this.openLevelUp();
  }

  reroll() {
    if (this.modal !== "levelup" || this.rerolls <= 0) return;
    this.rerolls--;
    this.cb.onLevelUp(this.buildOptions(), this.levelMeta());
  }

  private levelMeta(): LevelMeta {
    return { rerolls: this.rerolls, skips: this.skips, adRerolls: this.adRerolls };
  }

  // переброс за рекламу — когда обычные кончились (реклама коллеги, 3 за забег)
  adReroll() {
    if (this.modal !== "levelup" || this.adRerolls <= 0) return;
    this.adRerolls--;
    this.cb.onLevelUp(this.buildOptions(), this.levelMeta());
  }

  // открыть контейнер ещё раз за рекламу (реклама коллеги, 2 за забег)
  chestAgain() {
    if (this.modal !== "chest" || this.adChests <= 0) return;
    this.adChests--;
    this.modal = null;
    this.openChest();
  }

  skip() {
    if (this.modal !== "levelup" || this.skips <= 0) return;
    this.skips--;
    this.pendingLevels = Math.max(0, this.pendingLevels - 1);
    this.modal = null;
    this.heal(10);
    this.emitHud();
    if (this.pendingLevels > 0) this.openLevelUp();
  }

  closeChest() {
    if (this.modal !== "chest") return;
    this.modal = null;
    this.emitHud();
    if (this.pendingLevels > 0) this.openLevelUp();
  }

  // Финальный босс убит: true — бесконечный режим, false — эвакуация (столп 09)
  chooseEndless(cont: boolean) {
    if (this.modal !== "victory") return;
    this.modal = null;
    this.victoryPending = false;
    if (!cont) {
      this.finish(true);
      return;
    }
    this.endless = true;
    this.endlessStart = this.time;
    this.endlessLevel = ENDLESS_START_LEVEL;
    this.endlessBossT = ENDLESS_BOSS_EVERY;
    // всплеск: рой смыкает кольцо сразу — первые секунды уже горячие
    const wave = this.currentWave();
    const p = this.player;
    const R = Math.max(this.viewHW, this.viewHH) * 0.95;
    for (let i = 0; i < ENDLESS_SURGE; i++) {
      const a = (i / ENDLESS_SURGE) * TAU;
      const [x, y] = this.clampPoint(p.x + Math.cos(a) * R, p.y + Math.sin(a) * R, 30);
      this.spawnEnemy(this.pickFromPool(wave.pool), x, y, false, 1, true);
    }
    for (let i = 0; i < 2; i++) {
      const [x, y] = this.spawnPos();
      this.spawnEnemy(this.pickFromPool(wave.pool), x, y, true);
    }
    this.showBanner("БЕСКОНЕЧНЫЙ РЕЖИМ", `Каждые ${ENDLESS_STEP} с угроза растёт. Награда за победу уже твоя`, "#f43f5e", 3.6);
    audio.play("boss");
    audio.intensity = 2;
    this.emitHud();
  }

  // воскрешение за рекламу (реклама коллеги): полное здоровье и взрывная волна, один раз за забег
  acceptRevive() {
    if (this.modal !== "revive") return;
    this.modal = null;
    this.adReviveUsed = true;
    this.adRevived = true;
    this.reviveBurst(1);
    this.showBanner("ВТОРОЙ ШАНС", "Пилот вернулся в бой", "#fde047", 2.6);
    this.emitHud();
  }

  declineRevive() {
    if (this.modal !== "revive") return;
    this.modal = null;
    this.adReviveUsed = true;
    this.die();
  }

  surrender() {
    if (!this.over) this.finish(false);
  }

  getSnapshot(): BuildSnapshot {
    return { stats: { ...this.stats }, weapons: this.hudWeapons(), passives: this.hudPassives() };
  }

  // ------------------------------------------------------------
  //  Ввод
  // ------------------------------------------------------------
  private resize = () => {
    const rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, rect.width);
    this.h = Math.max(1, rect.height);
    this.canvasLeft = rect.left;
    this.canvasTop = rect.top;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.zoom = clamp(Math.sqrt((this.w * this.h) / (1280 * 720)), 0.55, 1.35);
    this.viewHW = this.w / 2 / this.zoom;
    this.viewHH = this.h / 2 / this.zoom;
  };

  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.code;
    if (k === "Escape" || k === "KeyP") {
      if (!this.over && !this.modal && this.dying <= 0) this.cb.onPauseKey();
      return;
    }
    this.keys.add(k);
    if (k.startsWith("Arrow") || k === "Space") e.preventDefault();
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  private onBlurEvt = () => {
    this.keys.clear();
    this.joy.active = false;
    if (!this.over && !this.modal && !this.userPaused && this.dying <= 0) this.cb.onBlur();
  };

  private onVisibility = () => {
    if (document.hidden) this.onBlurEvt();
  };

  private onPointerDown = (e: PointerEvent) => {
    if (this.joy.active) return;
    this.joy.active = true;
    this.joy.id = e.pointerId;
    this.joy.ox = this.joy.x = e.clientX;
    this.joy.oy = this.joy.y = e.clientY;
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.joy.active && e.pointerId === this.joy.id) {
      this.joy.x = e.clientX;
      this.joy.y = e.clientY;
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerId === this.joy.id) this.joy.active = false;
  };

  private inputDir(): [number, number] {
    let x = 0;
    let y = 0;
    const k = this.keys;
    if (k.has("KeyW") || k.has("ArrowUp")) y -= 1;
    if (k.has("KeyS") || k.has("ArrowDown")) y += 1;
    if (k.has("KeyA") || k.has("ArrowLeft")) x -= 1;
    if (k.has("KeyD") || k.has("ArrowRight")) x += 1;
    const j = this.joy;
    if (j.active) {
      let dx = j.x - j.ox;
      let dy = j.y - j.oy;
      let d = Math.hypot(dx, dy);
      if (d > 70) {
        j.ox += (dx / d) * (d - 70);
        j.oy += (dy / d) * (d - 70);
        dx = j.x - j.ox;
        dy = j.y - j.oy;
        d = Math.hypot(dx, dy);
      }
      if (d > 8) {
        const m = Math.min(1, d / 46);
        return [(dx / d) * m, (dy / d) * m];
      }
    }
    const d = Math.hypot(x, y);
    if (d > 0) {
      x /= d;
      y /= d;
    }
    return [x, y];
  }

  // ------------------------------------------------------------
  //  Цикл
  // ------------------------------------------------------------
  private loop = (now: number) => {
    this.raf = requestAnimationFrame(this.loop);
    let dt = (now - this.lastT) / 1000;
    this.lastT = now;
    if (!(dt > 0)) dt = 0;
    if (dt > 0.05) dt = 0.05;
    if (!this.modal && !this.userPaused && !this.over) {
      if (this.dying > 0) {
        this.dying -= dt;
        this.updateFx(dt * 0.35);
        if (this.dying <= 0) this.finish(false);
      } else {
        this.update(dt);
      }
    }
    this.render();
  };

  private update(dt: number) {
    this.time += dt;
    if (this.freezeTimer > 0) this.freezeTimer -= dt;
    if (this.blizzard > 0) {
      this.blizzard -= dt;
      this.snow();
    }
    if (this.victoryTimer > 0) {
      this.victoryTimer -= dt;
      if (this.victoryTimer <= 0) {
        // столп 09: вместо мгновенной эвакуации — выбор «эвакуация / продолжить забег»
        if (this.cb.onVictoryChoice) {
          this.victoryPending = true;
          this.modal = "victory";
          this.emitHud();
          this.cb.onVictoryChoice({ boss: ENEMIES[this.planet.finalBoss]?.name || "", credits: this.creditsSoFar(true) });
        } else this.finish(true);
        return;
      }
    }
    this.updatePerks(dt);
    this.updateSpawning(dt);
    this.updatePlayer(dt);
    this.buildGrid();
    for (let i = 0; i < this.weapons.length; i++) this.updateWeapon(this.weapons[i], dt);
    this.updateProjectiles(dt);
    this.updateZones(dt);
    this.updateTurrets(dt);
    this.updateEnemies(dt);
    this.updateEnemyBullets(dt);
    this.updateVoids(dt);
    this.updateGems(dt);
    this.updateFx(dt);
    compact(this.enemies);
    compact(this.projectiles);
    compact(this.ebullets);
    compact(this.gems);
    compact(this.pickups);
    compact(this.zones);
    compact(this.voids);
    compact(this.turrets);
    this.hudTimer -= dt;
    if (this.hudTimer <= 0) {
      this.hudTimer = 0.1;
      this.emitHud();
    }
    if (this.protocolT > 0) {
      this.protocolT -= dt;
      if (this.protocolT <= 0 && !this.over) this.openProtocol();
    }
    if (this.pendingLevels > 0 && !this.modal && this.dying <= 0 && !this.over) this.openLevelUp();
  }

  // Протокол (столп 08): после первого босса — выбор 1 из 3 перков-правил, один на весь забег
  private openProtocol() {
    if (this.modal) {
      this.protocolT = 0.3;
      return;
    }
    const ids = RULE_PERK_IDS.filter((id) => !this.perks.has(id));
    const opts: string[] = [];
    while (opts.length < RULE_PERK_OFFER && ids.length) opts.push(ids.splice((Math.random() * ids.length) | 0, 1)[0]);
    if (!opts.length || !this.cb.onProtocol) return;
    this.protocolOptions = opts;
    this.modal = "protocol";
    audio.play("evolve");
    this.emitHud();
    this.cb.onProtocol(opts.map((id) => this.perkOption(id)));
  }

  chooseProtocol(id: string | null) {
    if (this.modal !== "protocol") return;
    this.modal = null;
    if (id && this.protocolOptions.includes(id)) this.applyPerk(id);
    this.emitHud();
    if (this.pendingLevels > 0) this.openLevelUp();
  }

  // ------------------------------------------------------------
  //  Перки и бесконечный режим
  // ------------------------------------------------------------
  private has(perk: string) {
    return this.perks.has(perk);
  }

  // «старое» время 15-минутного забега: от него считается рост врагов
  private scaledTime() {
    return planetTime(this.time, this.planet.timeScale);
  }

  private endlessTime() {
    return this.endless ? this.time - this.endlessStart : 0;
  }

  private endlessMul() {
    return 1 + ENDLESS_REWARD_STEP * this.endlessLevel;
  }

  private creditsSoFar(withVictory: boolean) {
    return Math.floor(this.runCredits) + this.survivalBonus() + (withVictory ? this.planet.victoryBonus : 0);
  }

  private survivalBonus() {
    return Math.round(Math.floor(this.time / 60) * 8 * this.planet.timeScale * this.planet.rewardMul);
  }

  private updatePerks(dt: number) {
    const p = this.player;
    this.stillT = p.moving ? 0 : this.stillT + dt;
    const still = this.stillT > 0.4;
    const ratio = p.hp / this.stats.maxHp;
    let m = 1;
    if (ratio < 0.5) m += this.stats.lowHpMight;
    if (still) m += this.stats.stillMight;
    if (this.has("rule_laststand") && ratio < 0.3) m *= 2;
    if (this.has("rule_chaos")) m *= 1.25;
    this.dynMul = m;
    if (this.has("rule_chaos")) {
      this.chaosT -= dt;
      if (this.chaosT <= 0) {
        this.chaosT = CHAOS_EVERY;
        this.chaosSwap();
      }
    }
    if (this.endless) {
      // новая ступень угрозы каждые ENDLESS_STEP секунд
      const lvl = ENDLESS_START_LEVEL + Math.floor(this.endlessTime() / ENDLESS_STEP);
      if (lvl > this.endlessLevel) {
        this.endlessLevel = lvl;
        this.showBanner(`УГРОЗА ${lvl}`, `Враги крепче ×${Math.pow(ENDLESS_HP_STEP, lvl).toFixed(1)}, урон ×${Math.pow(ENDLESS_DMG_STEP, lvl).toFixed(1)} · награды ×${this.endlessMul().toFixed(2)}`, "#f43f5e", 2.2);
        audio.play("boss");
        // каждая ступень — ещё и элитка
        const wave = this.currentWave();
        const [x, y] = this.spawnPos();
        this.spawnEnemy(this.pickFromPool(wave.pool), x, y, true);
      }
      this.endlessBossT -= dt;
      if (this.endlessBossT <= 0) {
        this.endlessBossT = ENDLESS_BOSS_EVERY;
        this.endlessBosses++;
        const bosses = this.planet.events.filter((e) => e.type === "boss");
        const ev = bosses[(Math.random() * bosses.length) | 0];
        this.runEvent({ ...ev, hpMul: (ev.hpMul ?? 1) * (0.6 + 0.4 * this.endlessBosses) });
      }
    }
  }

  // «Хаос-протокол»: одна пушка (не эволюция) меняется на случайную того же уровня
  private chaosSwap() {
    const cand = this.weapons.filter((w) => !w.def.evolved);
    if (!cand.length) return;
    const owned = new Set(this.weapons.map((w) => w.def.evolvedFrom || w.def.id));
    const pool = BASE_WEAPON_IDS.filter((id) => !owned.has(id));
    if (!pool.length) return;
    const old = cand[(Math.random() * cand.length) | 0];
    const nd = WEAPONS[pool[(Math.random() * pool.length) | 0]];
    const nw = this.makeWeapon(nd, old.slot, 0, this.time);
    nw.level = Math.min(old.level, weaponMaxLevel(nd));
    nw.stats = weaponStatsAt(nd, nw.level);
    this.weapons[old.slot] = nw;
    this.acquired.add(nd.id);
    this.showBanner("ХАОС-ПРОТОКОЛ", `${old.def.name} → ${nd.name}`, "#a78bfa", 2.4);
    audio.play("warp");
    this.emitHud();
  }

  private applyPerk(id: string) {
    if (this.perks.has(id)) return;
    this.perks.add(id);
    if (RULE_PERKS[id]) this.ruleTaken++;
    if (id === "rule_monolith" && this.weapons.length > 1) {
      // остаётся пушка, которая нанесла больше всего урона
      let keep = this.weapons[0];
      for (const w of this.weapons) if (w.damage > keep.damage) keep = w;
      keep.slot = 0;
      this.weapons = [keep];
      this.projectiles.length = 0;
      for (const z of this.zones) if (z.kind === "mine") z.dead = true;
      this.turrets.length = 0;
    }
    const prevMax = this.stats.maxHp;
    this.recomputeStats();
    if (this.stats.maxHp > prevMax) this.player.hp += this.stats.maxHp - prevMax;
    const d = perkDef(id);
    if (d) {
      this.showBanner(d.name.toUpperCase(), d.desc, d.color, 2.8);
      this.fx("ring", this.player.x, this.player.y, 220, 0.7, d.color);
    }
  }

  private maxWeapons() {
    return this.has("rule_monolith") ? 1 : MAX_WEAPONS;
  }

  // ------------------------------------------------------------
  //  Спавн
  // ------------------------------------------------------------
  private currentWave(): Wave {
    const waves = this.planet.waves;
    // бесконечный режим: берём самую плотную волну планеты (её наращивает ENDLESS_SPAWN_STEP)
    if (this.endless) {
      let peak = waves[0];
      for (const x of waves) if (x.min > peak.min) peak = x;
      return peak;
    }
    let w = waves[0];
    for (const x of waves) if (this.time >= x.t) w = x;
    return w;
  }

  private pickFromPool(pool: [string, number][]) {
    let total = 0;
    for (const [, wt] of pool) total += wt;
    let r = Math.random() * total;
    for (const [id, wt] of pool) {
      r -= wt;
      if (r <= 0) return id;
    }
    return pool[0][0];
  }

  private spawnPos(bias = false): [number, number] {
    const hw = this.viewHW + 60;
    const hh = this.viewHH + 60;
    const p = this.player;
    let bx = 0;
    let by = 0;
    let best = -Infinity;
    let found = 0;
    const tries = bias && p.moving ? 3 : 1;
    for (let i = 0; i < 12 && found < tries; i++) {
      const r = Math.random() * (2 * hw + 2 * hh);
      let x: number;
      let y: number;
      if (r < 2 * hw) {
        x = -hw + r;
        y = Math.random() < 0.5 ? -hh : hh;
      } else {
        y = -hh + (r - 2 * hw);
        x = Math.random() < 0.5 ? -hw : hw;
      }
      if (!this.inArena(p.x + x, p.y + y, 30)) continue;
      found++;
      const score = x * p.fx + y * p.fy;
      if (score > best) {
        best = score;
        bx = x;
        by = y;
      }
    }
    if (found) return [p.x + bx, p.y + by];
    // край экрана целиком за стеной — берём точку арены подальше от пилота
    for (let i = 0; i < 12; i++) {
      const [x, y] = this.randomArenaPoint(40);
      if (Math.abs(x - p.x) > this.viewHW * 0.8 || Math.abs(y - p.y) > this.viewHH * 0.8) return [x, y];
    }
    return this.randomArenaPoint(40);
  }

  // ------------------------------------------------------------
  //  Арена
  // ------------------------------------------------------------
  private inArena(x: number, y: number, m: number) {
    const a = this.planet.arena;
    const lim = a.size - m;
    if (a.shape === "circle") return x * x + y * y <= lim * lim;
    return Math.abs(x) <= lim && Math.abs(y) <= lim;
  }

  private clampToArena(o: { x: number; y: number }, m: number): boolean {
    const a = this.planet.arena;
    const lim = a.size - m;
    if (a.shape === "circle") {
      const d = Math.hypot(o.x, o.y);
      if (d <= lim) return false;
      o.x *= lim / d;
      o.y *= lim / d;
      return true;
    }
    let hit = false;
    if (o.x > lim) {
      o.x = lim;
      hit = true;
    } else if (o.x < -lim) {
      o.x = -lim;
      hit = true;
    }
    if (o.y > lim) {
      o.y = lim;
      hit = true;
    } else if (o.y < -lim) {
      o.y = -lim;
      hit = true;
    }
    return hit;
  }

  private clampPoint(x: number, y: number, m: number): [number, number] {
    const o = { x, y };
    this.clampToArena(o, m);
    return [o.x, o.y];
  }

  private randomArenaPoint(m: number): [number, number] {
    const a = this.planet.arena;
    const lim = a.size - m;
    if (a.shape === "circle") {
      const r = Math.sqrt(Math.random()) * lim;
      const t = Math.random() * TAU;
      return [Math.cos(t) * r, Math.sin(t) * r];
    }
    return [rand(-lim, lim), rand(-lim, lim)];
  }

  private inBase(x: number, y: number) {
    const b = this.planet.base;
    return b > 0 && x * x + y * y < b * b;
  }

  private spawnNests(n: number) {
    const p = this.player;
    for (let k = 0; k < n; k++) {
      let pos = this.randomArenaPoint(80);
      for (let i = 0; i < 16; i++) {
        const d = Math.hypot(pos[0] - p.x, pos[1] - p.y);
        if (d > 450 && d < 1300) break;
        pos = this.randomArenaPoint(80);
      }
      this.spawnEnemy("nest", pos[0], pos[1]);
    }
  }

  private updateSpawning(dt: number) {
    if (this.victoryTimer > 0) return;
    const events = this.planet.events;
    while (this.eventIdx < events.length && this.time >= events[this.eventIdx].t) {
      this.runEvent(events[this.eventIdx]);
      this.eventIdx++;
    }
    const wave = this.currentWave();
    // «Жадный контракт» и бесконечный режим — больше врагов
    const crowd = (this.has("rule_greed") ? 1.3 : 1) * (1 + ENDLESS_SPAWN_STEP * this.endlessLevel);
    const min = Math.round(wave.min * crowd);
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = wave.interval;
      const batch = Math.round(wave.batch * crowd);
      for (let i = 0; i < batch; i++) {
        const [x, y] = this.spawnPos();
        this.spawnEnemy(this.pickFromPool(wave.pool), x, y);
      }
    }
    // досыпаем до минимума волны с ограниченной скоростью — быстрая зачистка больше не даёт бесконечный поток опыта
    this.refillTokens = Math.min(REFILL_BURST, this.refillTokens + Math.max(REFILL_MIN_RATE, min / REFILL_TIME) * dt);
    let need = min - this.enemies.length;
    while (need > 0 && this.refillTokens >= 1) {
      const [x, y] = this.spawnPos();
      this.spawnEnemy(this.pickFromPool(wave.pool), x, y);
      this.refillTokens--;
      need--;
    }
    // первые 2 минуты магнит гарантированно падает рядом с пилотом
    if (this.magnetIdx < MAGNET_SCHEDULE.length && this.time >= MAGNET_SCHEDULE[this.magnetIdx]) {
      this.magnetIdx++;
      const a = Math.random() * TAU;
      const d = rand(130, 200);
      const [mx, my] = this.clampPoint(this.player.x + Math.cos(a) * d, this.player.y + Math.sin(a) * d, 40);
      this.spawnPickup(mx, my, "magnet");
      this.fx("ring", mx, my, 40, 0.6, "#c4b5fd");
    }
    this.medTokens = Math.min(MEDKIT_MAX_STOCK, this.medTokens + dt / MEDKIT_EVERY);
    this.rareTokens = Math.min(1, this.rareTokens + dt / RARE_DROP_EVERY);
    this.crateTimer -= dt;
    if (this.crateTimer <= 0) {
      this.crateTimer = rand(26, 38);
      const a = Math.random() * TAU;
      const d = rand(260, 520);
      const [x, y] = this.clampPoint(this.player.x + Math.cos(a) * d, this.player.y + Math.sin(a) * d, 60);
      this.spawnEnemy("crate", x, y);
    }
  }

  private enemyCap() {
    const cap = this.planet.maxEnemies * (this.has("rule_greed") ? 1.3 : 1) * (this.endless ? 1.6 : 1);
    return Math.min(this.endless ? MAX_ENEMIES_ENDLESS : MAX_ENEMIES, Math.round(cap));
  }

  private spawnEnemy(id: string, x: number, y: number, elite = false, bossHpMul = 1, force = false): Enemy | null {
    const def = ENEMIES[id];
    const isBoss = def.kind === "boss";
    if (this.enemies.length >= this.enemyCap() && !elite && !isBoss && !force) return null;
    // рост врагов идёт по «старому» времени 15-минутного забега — 5 минут проходят ту же кривую сложности быстрее
    const t = this.scaledTime();
    let hp = isBoss ? def.hp * this.planet.bossHpMul * bossHpMul : def.hp * (1 + t / 150 + (t / 600) ** 2) * this.planet.hpMul;
    let dmg = def.damage * (1 + t / 360) * this.planet.dmgMul;
    // бесконечный режим: каждая ступень угрозы делает новых врагов крепче и злее
    if (this.endless && def.kind !== "crate") {
      if (!isBoss) hp *= Math.pow(ENDLESS_HP_STEP, this.endlessLevel);
      dmg *= Math.pow(ENDLESS_DMG_STEP, this.endlessLevel);
    }
    let speed = def.speed * (1 + t / 1800) * (isBoss ? 1 : rand(0.9, 1.1));
    let radius = def.radius;
    let xp = def.xp;
    let scale = 1;
    if (elite) {
      hp *= Math.max(5, 14 - def.hp / 25);
      dmg *= 1.4;
      speed *= 0.9;
      radius *= 1.6;
      scale = 1.6;
      xp = def.xp * 12 + 10;
    }
    if (def.kind === "crate") {
      hp = 1;
      dmg = 0;
    } else if (def.kind === "nest") {
      hp = def.hp * (1 + t / 240) * this.planet.hpMul;
      dmg = 0;
    }
    const e: Enemy = {
      id: this.nextId++,
      def,
      x,
      y,
      kx: 0,
      ky: 0,
      hp,
      maxHp: hp,
      speed,
      damage: dmg,
      radius,
      xp,
      flash: 0,
      slow: 0,
      slowAmt: 0,
      stun: 0,
      dead: false,
      elite,
      boss: isBoss,
      frames: getEnemyFrames(def.sprite || def.id, def.radius, def.color),
      face: Math.atan2(this.player.y - y, this.player.x - x),
      // броня элиток и боссов растёт со «временем планеты» (контент коллеги)
      armor: isBoss ? BOSS_ARMOR(t) : elite ? ELITE_ARMOR(t) : 0,
      burnStacks: 0,
      burnT: 0,
      burnDps: 0,
      burnTick: 0,
      burnSrc: -1,
      frozenT: 0,
      scale,
      hitUntil: [0, 0, 0, 0, 0, 0, 0, 0],
      attackCd: 0,
      t: rand(1, 2.5),
      t2: 4,
      t3: isBoss ? 3 : 0,
      spin: 0,
      charge: 0,
      dashing: 0,
      dvx: 0,
      dvy: 0,
      anim: Math.random() * 10,
      rush: false,
      rvx: 0,
      rvy: 0,
      rushLife: 0,
      shield: isBoss ? BOSS_ENTRY_SHIELD : 0,
      voidy: elite && def.kind !== "crate" && Math.random() < VOID_ELITE_CHANCE,
      voidT: rand(2, 4),
      inWell: 0,
      lastSrc: -1,
    };
    this.enemies.push(e);
    return e;
  }

  private runEvent(ev: GameEvent) {
    const p = this.player;
    switch (ev.type) {
      case "elite": {
        const wave = this.currentWave();
        const eliteId = this.pickFromPool(wave.pool);
        const [x, y] = this.spawnPos();
        const el = this.spawnEnemy(eliteId, x, y, true);
        if (el?.voidy) this.showBanner("ПУСТОТНЫЙ ЭЛИТНЫЙ ВРАГ", "Оставляет медленные войд-зоны — не стой в них", "#c084fc", 2.6);
        else this.showBanner("ЭЛИТНЫЙ ВРАГ", "Уничтожь его — получишь грузовой контейнер", "#fbbf24", 2.6);
        break;
      }
      case "ring": {
        const n = ev.count || 24;
        const R = Math.max(this.viewHW, this.viewHH) * 0.95;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * TAU;
          const [x, y] = this.clampPoint(p.x + Math.cos(a) * R, p.y + Math.sin(a) * R, 30);
          this.spawnEnemy(ev.enemy || "swarm", x, y);
        }
        this.showBanner("ОКРУЖЕНИЕ!", "Рой смыкает кольцо", "#e879f9", 2.4);
        break;
      }
      case "rush": {
        const n = ev.count || 20;
        const a = Math.random() * TAU;
        const dirx = -Math.cos(a);
        const diry = -Math.sin(a);
        const R = Math.max(this.viewHW, this.viewHH) + 120;
        const sx = p.x + Math.cos(a) * R;
        const sy = p.y + Math.sin(a) * R;
        for (let i = 0; i < n; i++) {
          const off = (i - n / 2) * 28;
          const back = rand(0, 220);
          const e = this.spawnEnemy(ev.enemy || "drone", sx - diry * off - dirx * back, sy + dirx * off - diry * back);
          if (e) {
            e.rush = true;
            e.rvx = dirx * e.speed * 2.2;
            e.rvy = diry * e.speed * 2.2;
            e.rushLife = 9;
          }
        }
        this.showBanner("ЛОБОВАЯ АТАКА!", "Уходи с линии удара", "#f43f5e", 2.4);
        break;
      }
      case "boss": {
        const id = ev.enemy || "sentinel";
        // босс входит из-за края экрана и первые секунды неуязвим — его видно до начала боя
        const a = Math.random() * TAU;
        const R = Math.max(this.viewHW, this.viewHH) + BOSS_SPAWN_EXTRA;
        const [x, y] = this.clampPoint(p.x + Math.cos(a) * R, p.y + Math.sin(a) * R, 80);
        this.spawnEnemy(id, x, y, false, ev.hpMul ?? 1);
        this.showBanner("⚠ " + ENEMIES[id].name, "Угроза высшего уровня приближается", "#ef4444", 3.6);
        audio.play("boss");
        audio.intensity = 2;
        break;
      }
      case "blizzard": {
        this.blizzard = this.blizzardMax = ev.count || 20;
        this.showBanner("МЕТЕЛЬ", "Видимость почти нулевая — держись подальше от толпы", "#e0f2fe", 2.6);
        audio.play("warp");
        break;
      }
      case "nest": {
        this.spawnNests(ev.count || 2);
        if (this.time > 10) this.showBanner("НОВЫЕ ГНЁЗДА", "Уничтожь их, пока Улей не задавил тебя личинками", "#a3e635", 2.4);
        break;
      }
    }
  }

  // ------------------------------------------------------------
  //  Игрок
  // ------------------------------------------------------------
  private updatePlayer(dt: number) {
    const p = this.player;
    const [ix, iy] = this.inputDir();
    const sp = PLAYER_BASE_SPEED * this.stats.speed * (this.inVoid ? 0.75 : 1);
    const tr = this.planet.traction;
    if (tr >= 30) {
      p.vx = ix * sp;
      p.vy = iy * sp;
    } else {
      const k = 1 - Math.exp(-tr * dt);
      p.vx += (ix * sp - p.vx) * k;
      p.vy += (iy * sp - p.vy) * k;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (this.clampToArena(p, p.r + 6)) {
      p.vx *= 0.5;
      p.vy *= 0.5;
    }
    p.moving = ix !== 0 || iy !== 0;
    if (p.moving) {
      const d = Math.hypot(ix, iy);
      p.fx = ix / d;
      p.fy = iy / d;
      if (Math.abs(ix) > 0.15) p.side = ix > 0 ? 1 : -1;
      p.thrust -= dt;
      if (p.thrust <= 0) {
        p.thrust = 0.035;
        this.particle(p.x - p.fx * 13, p.y - p.fy * 13, -p.fx * 70 + rand(-25, 25), -p.fy * 70 + rand(-25, 25), 0.3, 3, this.character.color);
      }
    }
    const da = normAngle(Math.atan2(p.fy, p.fx) - p.angle);
    p.angle += da * Math.min(1, dt * 14);
    if (p.iframes > 0) p.iframes -= dt;
    if (p.hurt > 0) p.hurt -= dt;
    if (this.stats.regen > 0 && p.hp < this.stats.maxHp) p.hp = Math.min(this.stats.maxHp, p.hp + this.stats.regen * dt);
    if (this.inBase(p.x, p.y) && p.hp < this.stats.maxHp) p.hp = Math.min(this.stats.maxHp, p.hp + BASE_HEAL * dt);
    // достижение Буйвола: сколько продержался в куполе, не выходя из него
    if (this.planet.base > 0 && !this.leftBase) {
      if (this.inBase(p.x, p.y)) this.baseStay = this.time;
      else this.leftBase = true;
    }
    this.updateAwaken(dt);
    this.updateModules(dt);
  }

  private updateModules(dt: number) {
    const m = this.mods;
    const p = this.player;
    if (this.repulsorT > 0) this.repulsorT -= dt;
    if (this.retalCd > 0) this.retalCd -= dt;
    // «Отталкиватель»: сам срабатывает, когда корабль зажали — без кнопки (столп 03)
    if (m.mod_repulsor && this.repulsorT <= 0) {
      let n = 0;
      this.forEachNear(p.x, p.y, REPULSOR_RADIUS, (en) => {
        if (en.def.kind !== "crate" && en.def.kind !== "nest") n++;
      });
      if (n >= REPULSOR_CROWD) {
        this.repulsorT = repulsorCd(m.mod_repulsor);
        p.iframes = Math.max(p.iframes, 0.6);
        this.forEachNear(p.x, p.y, 220, (en) => {
          if (en.def.kind === "crate" || en.def.kind === "nest") return;
          const dx = en.x - p.x;
          const dy = en.y - p.y;
          const d = Math.hypot(dx, dy) || 1;
          this.damageEnemy(en, 20 * this.stats.might, -1, dx / d, dy / d, en.boss ? 0 : 7);
        });
        this.fx("ring", p.x, p.y, 220, 0.45, "#22d3ee");
        this.fx("flash", p.x, p.y, 160, 0.25, "#22d3ee");
        audio.play("warp");
      }
    }
    if (m.mod_shield && this.shieldCd > 0) {
      this.shieldCd -= dt;
      if (this.shieldCd <= 0) this.fx("ring", p.x, p.y, 40, 0.35, "#60a5fa");
    }
    if (m.mod_collector) {
      this.collectT -= dt;
      if (this.collectT <= 0) {
        this.collectT = 4;
        const R = 260 + 40 * m.mod_collector;
        let any = false;
        for (const g of this.gems) {
          if (g.dead || g.mag) continue;
          const dx = g.x - p.x;
          const dy = g.y - p.y;
          if (dx * dx + dy * dy < R * R) {
            g.mag = true;
            g.spd = 200;
            any = true;
          }
        }
        if (any) this.fx("ring", p.x, p.y, R, 0.4, "#2dd4bf");
      }
    }
    if (m.mod_chrono) {
      this.chronoT -= dt;
      if (this.chronoT <= 0) {
        this.chronoT = 32 - 2 * m.mod_chrono;
        this.freezeTimer = Math.max(this.freezeTimer, 2 + 0.3 * m.mod_chrono);
        this.fx("ring", p.x, p.y, 380, 0.6, "#fde047");
        audio.play("warp");
      }
    }
  }

  private hurtPlayer(amount: number): boolean {
    const p = this.player;
    if (p.iframes > 0 || this.dying > 0 || this.victoryTimer > 0) return false;
    if (this.settings.godMode) {
      p.hurt = 0.15;
      return false;
    }
    // барьер «Бастиона» поглощает один удар
    if (this.barrier) {
      this.barrier = false;
      p.iframes = 0.4;
      this.fx("ring", p.x, p.y, 60, 0.35, "#86efac");
      audio.play("pickup");
      return false;
    }
    if (this.mods.mod_shield && this.shieldCd <= 0) {
      this.shieldCd = 14 - 1.5 * (this.mods.mod_shield - 1);
      p.iframes = 0.5;
      this.fx("ring", p.x, p.y, 70, 0.4, "#60a5fa");
      this.burst(p.x, p.y, 14, 200, "#93c5fd", 0.4, 3);
      audio.play("pickup");
      return false;
    }
    const dmg = Math.max(1, amount * ARMOR_FLOOR, amount - this.stats.armor);
    p.hp -= dmg;
    p.iframes = 0.12;
    p.hurt = 0.3;
    this.damageTaken += dmg;
    this.addShake(4);
    audio.play("hurt");
    const rl = this.mods.mod_retaliation || 0;
    if (rl && this.retalCd <= 0 && p.hp > 0) {
      this.retalCd = 0.5;
      const dmgR = 60 * (1 + 0.5 * (rl - 1)) * this.stats.might;
      this.forEachNear(p.x, p.y, 170, (en) => {
        if (en.def.kind === "crate") return;
        const dx = en.x - p.x;
        const dy = en.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        this.damageEnemy(en, dmgR, -1, dx / d, dy / d, 5);
      });
      this.fx("ring", p.x, p.y, 170, 0.35, "#f472b6");
    }
    if (p.hp <= 0) this.playerDown();
    return true;
  }

  private playerDown() {
    if (this.revivals > 0) {
      this.revivals--;
      this.reviveBurst();
      this.showBanner("РЕЗЕРВНЫЙ КЛОН", "Сознание перенесено в резервное тело", "#fde047", 2.6);
      return;
    }
    // «Второе дыхание» за рекламу (столп 01) — один раз за забег
    if (this.adRevive && !this.adReviveUsed && this.cb.onReviveOffer) {
      this.player.hp = 0;
      this.modal = "revive";
      this.emitHud();
      this.cb.onReviveOffer();
      return;
    }
    this.die();
  }

  private reviveBurst(hpFrac = 0.5) {
    const p = this.player;
    p.hp = this.stats.maxHp * hpFrac;
    p.iframes = 3;
    p.hurt = 0;
    for (const e of this.enemies) {
      if (e.dead || e.boss) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < 400) this.damageEnemy(e, 300 * this.stats.might, -1, dx / d, dy / d, 8);
    }
    for (const b of this.ebullets) b.dead = true;
    for (const v of this.voids) v.dead = true;
    this.fx("ring", p.x, p.y, 420, 0.7, "#fde047");
    this.flashScreen = 0.6;
    audio.play("evolve");
  }

  private die() {
    const p = this.player;
    p.hp = 0;
    this.dying = 1.6;
    this.burst(p.x, p.y, 60, 380, this.character.color, 1.2, 4);
    this.burst(p.x, p.y, 30, 260, "#ffffff", 0.9, 3);
    this.fx("ring", p.x, p.y, 260, 0.9, this.character.color);
    this.fx("flash", p.x, p.y, 200, 0.6, this.character.color);
    this.addShake(12);
    audio.play("death");
  }

  private heal(v: number) {
    const p = this.player;
    const before = p.hp;
    p.hp = Math.min(this.stats.maxHp, p.hp + v);
    const got = p.hp - before;
    if (got >= 1) this.addText(p.x, p.y - 28, `+${Math.round(got)}`, "#4ade80");
  }

  // ------------------------------------------------------------
  //  Оружие
  // ------------------------------------------------------------
  private makeWeapon(def: WeaponDef, slot: number, damage: number, since: number): WeaponInst {
    return {
      slot,
      def,
      level: 1,
      stats: weaponStatsAt(def, 1),
      timer: 0.35,
      burst: 0,
      burstTimer: 0,
      burstIdx: 0,
      targets: [],
      active: 0,
      angle: 0,
      pulse: 0,
      damage,
      since,
      over: 0,
      count: 0,
      aux: [],
      mods: [],
    };
  }

  private addWeapon(id: string) {
    const def = WEAPONS[id];
    this.weapons.push(this.makeWeapon(def, this.weapons.length, 0, this.time));
    this.acquired.add(id);
  }

  // пушки, у которых «Зеркало» стреляет назад; остальным оно даёт +1 снаряд
  private static MIRROR_DIRECT = new Set(["plasma", "railgun", "disc"]);

  // родная пушка пилота (и её эволюция): получает фирменный бонус и пробуждение
  private isSignature(w: WeaponInst) {
    return (w.def.evolvedFrom || w.def.id) === this.character.weapon;
  }

  private isAwakened(w: WeaponInst) {
    return this.awakened && !!w.def.evolved && this.isSignature(w);
  }

  private modCount(w: WeaponInst, id: string) {
    let n = 0;
    for (const m of w.mods) if (m === id) n++;
    return n;
  }

  private eff(w: WeaponInst): Eff {
    const s = w.stats;
    const st = this.stats;
    const base = w.def.evolvedFrom || w.def.id;
    const sig = this.isSignature(w) ? this.character.sig : {};
    let dmg = s.damage * st.might * SLOT_DMG_MUL * (sig.dmgMul ?? 1) * (1 + 0.25 * this.modCount(w, "wm_dmg"));
    let cd = s.cooldown * st.cooldown * (sig.cdMul ?? 1) * Math.pow(0.85, this.modCount(w, "wm_cd"));
    let amount = s.amount + st.amount + (sig.amount ?? 0) + this.modCount(w, "wm_amt");
    let area = s.area * st.area * (sig.areaMul ?? 1) * (1 + 0.25 * this.modCount(w, "wm_area"));
    if (this.has("rule_monolith")) {
      dmg *= 2 * (1 + 0.15 * w.over);
      cd *= 0.75;
      amount += 1;
    }
    if (this.has("rule_heavy")) {
      dmg *= 2.5;
      cd *= 2;
      area *= 1.25;
    }
    if (this.has("rule_mirror")) {
      cd *= 1.4;
      if (!Engine.MIRROR_DIRECT.has(base)) amount += 1;
    }
    return {
      dmg,
      cd: Math.max(w.def.id === "mg_evo" ? 0.03 : 0.08, cd),
      amount: Math.max(1, Math.round(amount)),
      area,
      speed: s.speed * st.projSpeed,
      dur: s.duration * st.duration,
      pierce: s.pierce + this.modCount(w, "wm_pierce"),
      kb: s.knockback,
      extra: s.extra + (sig.extra ?? 0),
    };
  }

  private updateWeapon(w: WeaponInst, dt: number) {
    const e = this.eff(w);
    const evo = !!w.def.evolved;
    switch (w.def.evolvedFrom || w.def.id) {
      case "plasma":
        this.wPlasma(w, e, dt, evo);
        break;
      case "whip":
        this.wWhip(w, e, dt, evo);
        break;
      case "drones":
        this.wDrones(w, e, dt, evo);
        break;
      case "emp":
        this.wEmp(w, e, dt, evo);
        break;
      case "missile":
        this.wMissile(w, e, dt, evo);
        break;
      case "tesla":
        this.wTesla(w, e, dt, evo);
        break;
      case "disc":
        this.wDisc(w, e, dt, evo);
        break;
      case "strike":
        this.wStrike(w, e, dt, evo);
        break;
      case "singularity":
        this.wSingularity(w, e, dt, evo);
        break;
      case "railgun":
        this.wRailgun(w, e, dt, evo);
        break;
      case "mg":
        this.wMg(w, e, dt, evo);
        break;
      case "sniper":
        this.wSniper(w, e, dt, evo);
        break;
      case "cryo":
        this.wCryo(w, e, dt, evo);
        break;
      case "brand":
        this.wBrand(w, e, dt, evo);
        break;
      case "mines":
        this.wMines(w, e, dt, evo);
        break;
      case "shotgun":
        this.wShotgun(w, e, dt, evo);
        break;
      case "turret":
        this.wTurret(w, e, dt, evo);
        break;
      case "harpoon":
        this.wHarpoon(w, e, dt, evo);
        break;
      case "aegis":
        this.wAegis(w, e, dt, evo);
        break;
    }
  }

  private addProj(kind: ProjKind, x: number, y: number, vx: number, vy: number, r: number, damage: number, pierce: number, life: number, src: number, kb: number, sprite: Sprite): Projectile {
    const p: Projectile = {
      kind,
      x,
      y,
      vx,
      vy,
      ax: 0,
      ay: 0,
      r,
      damage,
      pierce,
      life,
      src,
      kb,
      sprite,
      rot: Math.atan2(vy, vx),
      spin: 0,
      target: null,
      retarget: 0,
      area: 0,
      spd: 0,
      returned: false,
      dirX: 0,
      dirY: 0,
      hit: null,
      smoke: 0,
      evo: false,
      dead: false,
      pct: 0,
      crit: false,
      life0: life,
      chain: 0,
      look: "",
    };
    this.projectiles.push(p);
    return p;
  }

  private wPlasma(w: WeaponInst, e: Eff, dt: number, evo: boolean) {
    w.timer -= dt;
    if (w.burst > 0) {
      w.burstTimer -= dt;
      while (w.burst > 0 && w.burstTimer <= 0) {
        w.burstTimer += evo ? 0.045 : 0.075;
        w.burst--;
        const p = this.player;
        let t: Enemy | null = w.targets.length ? w.targets[w.burstIdx % w.targets.length] : null;
        w.burstIdx++;
        if (!t || t.dead) t = this.nearestEnemy(p.x, p.y, 720);
        if (!t) continue;
        let a = Math.atan2(t.y - p.y, t.x - p.x);
        if (evo) a += rand(-0.07, 0.07);
        const r = 5.5 * Math.sqrt(e.area);
        const mirror = this.has("rule_mirror");
        for (const aa of mirror ? [a, a + Math.PI] : [a]) {
          const pr = this.addProj("bolt", p.x, p.y, Math.cos(aa) * e.speed, Math.sin(aa) * e.speed, r, e.dmg, e.pierce, e.dur, w.slot, e.kb, getBoltSprite(w.def.color, 6));
          if (e.pierce > 1) pr.hit = new Set();
        }
        audio.play("shoot");
      }
    }
    if (w.timer <= 0 && w.burst <= 0) {
      const targets = this.nearestEnemies(this.player.x, this.player.y, e.amount, 720);
      if (!targets.length) {
        w.timer = 0.1;
        return;
      }
      w.targets = targets;
      w.burst = e.amount;
      w.burstIdx = 0;
      w.burstTimer = 0;
      w.timer = e.cd;
      // пробуждение Кая «Сверхновая»: каждый 8-й залп взрывается в цели
      if (this.isAwakened(w) && ++w.pulse % 8 === 0) {
        const t = targets[0];
        this.explode(t.x, t.y, 110 * e.area, e.dmg * 4, w.slot, false);
        this.fx("ring", t.x, t.y, 150 * e.area, 0.5, "#a5f3fc");
        this.fx("flash", t.x, t.y, 170 * e.area, 0.3, "#ffffff");
      }
    }
  }

  private wWhip(w: WeaponInst, e: Eff, dt: number, evo: boolean) {
    w.timer -= dt;
    if (w.burst > 0) {
      w.burstTimer -= dt;
      if (w.burstTimer <= 0) {
        w.burstTimer = 0.13;
        const i = w.burstIdx++;
        w.burst--;
        const side = i % 2 === 0 ? 1 : -1; // вперёд / назад по направлению полёта
        const row = Math.floor(i / 2);
        const yOff = row === 0 ? 0 : (row % 2 === 1 ? -1 : 1) * Math.ceil(row / 2) * 30 * e.area;
        this.slash(w, e, side, yOff, evo);
      }
    }
    if (w.timer <= 0) {
      w.timer = e.cd;
      w.burst = e.amount;
      w.burstIdx = 0;
      w.burstTimer = 0;
    }
  }

  // Дуга клинка идёт вперёд/назад по направлению полёта (на вертикальном экране враги в основном сверху и снизу)
  private slash(w: WeaponInst, e: Eff, side: number, yOff: number, evo: boolean) {
    const p = this.player;
    const len = 210 * e.area; // было 175: ближний бой должен прощать дистанцию
    const hh = 30 * e.area;
    const ax = p.fx * side;
    const ay = p.fy * side;
    const cx = p.x + (ax * len) / 2 - ay * yOff;
    const cy = p.y + (ay * len) / 2 + ax * yOff;
    let hits = 0;
    this.forEachNear(cx, cy, len / 2 + hh, (en) => {
      const dx = en.x - cx;
      const dy = en.y - cy;
      const along = dx * ax + dy * ay;
      const across = -dx * ay + dy * ax;
      if (Math.abs(along) <= len / 2 + en.radius && Math.abs(across) <= hh + en.radius) {
        this.damageEnemy(en, e.dmg, w.slot, ax, ay, e.kb);
        hits++;
      }
    });
    if (evo && hits > 0) this.heal(1); // было до 6 за удар — с двумя ударами в секунду это давало дикий реген
    // пробуждение Рэйдзи «Тысяча порезов»: каждый удар задевает ещё двух врагов поблизости
    if (this.isAwakened(w)) {
      for (let k = 0; k < 2; k++) {
        const t = this.randomNearEnemy(p.x, p.y, 280, 8);
        if (!t) break;
        this.damageEnemy(t, e.dmg, w.slot, 0, 0, e.kb);
        const c = this.fx("slash", t.x, t.y, 0, 0.18, w.def.color);
        c.x2 = 70 * e.area;
        c.y2 = 14 * e.area;
        c.side = 1;
        c.width = Math.random() * TAU;
      }
    }
    this.sparks(cx + ax * len * 0.3, cy + ay * len * 0.3, 5, w.def.color, 260, Math.atan2(ay, ax), 0.8);
    const f = this.fx("slash", cx, cy, 0, 0.22, w.def.color);
    f.x2 = len;
    f.y2 = hh;
    f.side = 1;
    f.width = Math.atan2(ay, ax); // угол дуги
    audio.play("laser");
  }

  private wDrones(w: WeaponInst, e: Eff, dt: number, evo: boolean) {
    if (w.active > 0 || evo) {
      if (!evo) w.active -= dt;
      w.angle += e.speed * dt;
      // пробуждение Новы «Рой-матка»: дрон за каждые 100 убийств, до +6
      const n = e.amount + (this.isAwakened(w) ? Math.min(6, Math.floor(this.kills / 100)) : 0);
      const R = 82 * e.area;
      const dr = 11 * Math.sqrt(e.area);
      const p = this.player;
      for (let i = 0; i < n; i++) {
        const a = w.angle + (i / n) * TAU;
        const dx = p.x + Math.cos(a) * R;
        const dy = p.y + Math.sin(a) * R;
        this.forEachNear(dx, dy, dr, (en) => {
          if (this.time >= en.hitUntil[w.slot]) {
            en.hitUntil[w.slot] = this.time + 0.5;
            const kx = en.x - p.x;
            const ky = en.y - p.y;
            const d = Math.hypot(kx, ky) || 1;
            this.damageEnemy(en, e.dmg, w.slot, kx / d, ky / d, e.kb);
          }
        });
      }
      if (!evo && w.active <= 0) w.timer = e.cd;
    } else {
      w.timer -= dt;
      if (w.timer <= 0) w.active = e.dur;
    }
  }

  private wEmp(w: WeaponInst, e: Eff, dt: number, evo: boolean) {
    w.timer -= dt;
    if (w.pulse > 0) w.pulse = Math.max(0, w.pulse - dt * 3);
    if (w.timer <= 0) {
      w.timer = e.cd;
      w.pulse = 1;
      const R = 70 * e.area;
      const p = this.player;
      this.forEachNear(p.x, p.y, R, (en) => {
        const kx = en.x - p.x;
        const ky = en.y - p.y;
        const d = Math.hypot(kx, ky) || 1;
        this.damageEnemy(en, e.dmg, w.slot, kx / d, ky / d, e.kb);
        if (evo) {
          en.slow = e.cd + 0.15;
          en.slowAmt = 0.5;
        }
      });
    }
  }

  private wMissile(w: WeaponInst, e: Eff, dt: number, evo: boolean) {
    w.timer -= dt;
    if (w.burst > 0) {
      w.burstTimer -= dt;
      if (w.burstTimer <= 0) {
        w.burstTimer = 0.09;
        w.burst--;
        const p = this.player;
        const t = this.randomNearEnemy(p.x, p.y, 620, 6);
        const base = t ? Math.atan2(t.y - p.y, t.x - p.x) : Math.random() * TAU;
        const a = base + rand(-1.2, 1.2);
        const pr = this.addProj("missile", p.x, p.y, Math.cos(a) * e.speed * 0.45, Math.sin(a) * e.speed * 0.45, 7, e.dmg, 1, e.dur, w.slot, e.kb, getMissileSprite(w.def.color));
        pr.target = t;
        pr.area = 52 * e.area;
        pr.spd = e.speed;
        pr.evo = evo;
        audio.play("missile");
      }
    }
    if (w.timer <= 0) {
      w.timer = e.cd;
      w.burst = e.amount;
      w.burstTimer = 0;
    }
  }

  private wTesla(w: WeaponInst, e: Eff, dt: number, evo: boolean) {
    w.timer -= dt;
    if (w.timer > 0) return;
    w.timer = e.cd;
    let fired = 0;
    const p = this.player;
    for (let k = 0; k < e.amount; k++) {
      const first = this.randomNearEnemy(p.x, p.y, 480, 10);
      if (!first) break;
      fired++;
      const pts: number[] = [p.x, p.y];
      const hit = new Set<number>();
      let cur: Enemy | null = first;
      const range = 135 * e.area;
      for (let j = 0; j <= e.extra && cur; j++) {
        hit.add(cur.id);
        pts.push(cur.x, cur.y);
        this.fx("flash", cur.x, cur.y, 26, 0.15, w.def.color);
        this.damageEnemy(cur, e.dmg, w.slot, 0, 0, 0);
        if (evo && cur.shield <= 0) cur.stun = Math.max(cur.stun, 0.45);
        // пробуждение Вольта «Грозовой фронт»: молнии оставляют заряженные лужи
        if (this.isAwakened(w) && Math.random() < 0.5)
          this.zones.push({ kind: "puddle", x: cur.x, y: cur.y, r: 38 * e.area, life: 2.5, max: 2.5, tick: 0, damage: e.dmg * 0.25, src: w.slot, pull: 0, evo: true, color: w.def.color, dead: false });
        cur = this.nearestInRange(cur.x, cur.y, range, hit);
      }
      const f = this.fx("lightning", p.x, p.y, 0, 0.2, w.def.color);
      f.pts = jagged(pts, evo ? 12 : 9);
      f.width = evo ? 3 : 2;
    }
    if (fired) audio.play("zap");
    else w.timer = 0.15;
  }

  private wDisc(w: WeaponInst, e: Eff, dt: number, evo: boolean) {
    w.timer -= dt;
    if (w.burst > 0) {
      w.burstTimer -= dt;
      if (w.burstTimer <= 0) {
        w.burstTimer = 0.12;
        w.burst--;
        const p = this.player;
        const t = this.randomNearEnemy(p.x, p.y, 520, 4);
        let a = t ? Math.atan2(t.y - p.y, t.x - p.x) : Math.atan2(p.fy, p.fx);
        a += w.burstIdx++ === 0 ? 0 : rand(-0.6, 0.6);
        const dx = Math.cos(a);
        const dy = Math.sin(a);
        const r = 14 * e.area;
        for (const sgn of this.has("rule_mirror") ? [1, -1] : [1]) {
          const pr = this.addProj("disc", p.x, p.y, sgn * dx * e.speed, sgn * dy * e.speed, r, e.dmg, 9999, e.dur, w.slot, e.kb, getDiscSprite(w.def.color, 14));
          pr.ax = -sgn * dx * e.speed * 1.45;
          pr.ay = -sgn * dy * e.speed * 1.45;
          pr.dirX = sgn * dx;
          pr.dirY = sgn * dy;
          pr.hit = new Set();
          pr.spin = 16;
          pr.evo = evo;
        }
      }
    }
    if (w.timer <= 0) {
      w.timer = e.cd;
      w.burst = e.amount;
      w.burstIdx = 0;
      w.burstTimer = 0;
    }
  }

  private wStrike(w: WeaponInst, e: Eff, dt: number, evo: boolean) {
    w.timer -= dt;
    if (w.timer > 0) return;
    w.timer = e.cd;
    const p = this.player;
    const cands = this.enemiesInView();
    for (let k = 0; k < e.amount; k++) {
      let x: number;
      let y: number;
      if (cands.length) {
        const idx = (Math.random() * cands.length) | 0;
        const t = cands[idx];
        cands[idx] = cands[cands.length - 1];
        cands.pop();
        x = t.x;
        y = t.y;
      } else {
        const a = Math.random() * TAU;
        const d = rand(60, 280);
        x = p.x + Math.cos(a) * d;
        y = p.y + Math.sin(a) * d;
      }
      this.zones.push({
        kind: "marker",
        x,
        y,
        r: 50 * e.area,
        life: e.dur + k * 0.07,
        max: e.dur + k * 0.07,
        tick: 0,
        damage: e.dmg,
        src: w.slot,
        pull: 0,
        evo,
        color: w.def.color,
        dead: false,
      });
    }
  }

  private wSingularity(w: WeaponInst, e: Eff, dt: number, evo: boolean) {
    w.timer -= dt;
    if (w.timer > 0) return;
    w.timer = e.cd;
    const p = this.player;
    for (let k = 0; k < e.amount; k++) {
      let x: number;
      let y: number;
      const t = this.densestEnemy(p.x, p.y, 430);
      if (t) {
        x = t.x + rand(-25, 25);
        y = t.y + rand(-25, 25);
      } else {
        const a = Math.random() * TAU;
        x = p.x + Math.cos(a) * 160;
        y = p.y + Math.sin(a) * 160;
      }
      this.zones.push({
        kind: "well",
        x,
        y,
        r: 80 * e.area,
        life: e.dur,
        max: e.dur,
        tick: 0,
        damage: e.dmg,
        src: w.slot,
        pull: e.extra,
        evo,
        color: w.def.color,
        dead: false,
      });
      this.fx("ring", x, y, 90 * e.area, 0.4, w.def.color);
    }
  }

  private wRailgun(w: WeaponInst, e: Eff, dt: number, evo: boolean) {
    w.timer -= dt;
    if (w.timer > 0) return;
    const p = this.player;
    const t = this.nearestEnemy(p.x, p.y, 820);
    if (!t) {
      w.timer = 0.15;
      return;
    }
    w.timer = e.cd;
    const base = Math.atan2(t.y - p.y, t.x - p.x);
    const len = 1300;
    const half = 8 * e.area;
    const dmg = e.dmg;
    const dirs: number[] = [];
    // пробуждение Эхо «Выстрел через миры» (как и «Зеркало»): каждый выстрел бьёт и вперёд, и назад
    const both = this.has("rule_mirror") || this.isAwakened(w);
    for (let k = 0; k < e.amount; k++) {
      const a = base + (k - (e.amount - 1) / 2) * 0.13;
      dirs.push(a);
      if (both) dirs.push(a + Math.PI);
    }
    for (const a of dirs) {
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      for (const en of this.enemies) {
        if (en.dead) continue;
        const rx = en.x - p.x;
        const ry = en.y - p.y;
        const proj = rx * dx + ry * dy;
        if (proj < -en.radius || proj > len) continue;
        if (Math.abs(rx * dy - ry * dx) <= half + en.radius) this.damageEnemy(en, dmg, w.slot, dx, dy, e.kb);
      }
      this.fx("flash", p.x + dx * 18, p.y + dy * 18, 40, 0.15, "#ffffff");
      const f = this.fx("beam", p.x, p.y, 0, evo ? 0.4 : 0.3, w.def.color);
      f.x2 = p.x + dx * len;
      f.y2 = p.y + dy * len;
      f.width = half * 2;
      for (let i = 0; i < 12; i++) {
        const d = Math.random() * 650;
        const s = rand(-70, 70);
        this.particle(p.x + dx * d, p.y + dy * d, -dy * s, dx * s, 0.45, 2.5, w.def.color);
      }
    }
    audio.play("rail");
    this.addShake(evo ? 4 : 2.5);
  }

  // ---------------- Оружие коллеги ----------------
  // Пулемёт: очередь туда, куда летит корабль (стоя — в ближайшего). Эволюция стреляет непрерывно и быстрее на ходу.
  private wMg(w: WeaponInst, e: Eff, dt: number, evo: boolean) {
    const p = this.player;
    const spin = this.isAwakened(w);
    const fire = () => {
      let a: number;
      // пробуждение Бульдог «Карусель»: стоя на месте, корабль крутится и стреляет во все стороны
      if (spin && !p.moving) {
        w.angle += TAU / 8 + 0.07;
        a = w.angle;
      } else if (p.moving) {
        // целишься движением; помощь прицеливанию — враг в конусе ±35° по курсу (один палец, без снайперской точности)
        const head = Math.atan2(p.fy, p.fx);
        a = head;
        let bd = 420 * 420;
        for (const en of this.enemies) {
          if (en.dead || en.def.kind === "crate") continue;
          const dx = en.x - p.x;
          const dy = en.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < bd && Math.abs(normAngle(Math.atan2(dy, dx) - head)) < MG_ASSIST) {
            bd = d2;
            a = Math.atan2(dy, dx);
          }
        }
        a += rand(-0.08, 0.08);
      } else {
        const t = this.nearestEnemy(p.x, p.y, 520);
        a = (t ? Math.atan2(t.y - p.y, t.x - p.x) : Math.atan2(p.fy, p.fx)) + rand(-0.08, 0.08);
      }
      const x = p.x + Math.cos(a) * 18;
      const y = p.y + Math.sin(a) * 18;
      const pr = this.addProj("bolt", x, y, Math.cos(a) * e.speed, Math.sin(a) * e.speed, 4, e.dmg, e.pierce, e.dur, w.slot, e.kb, getBoltSprite(w.def.color, 4));
      pr.look = "mg";
      if (e.pierce > 1) pr.hit = new Set();
      if (w.burstIdx % 2 === 0) this.fx("flash", x, y, 16, 0.06, "#fde68a");
      const sd = Math.random() < 0.5 ? 1 : -1;
      // гильзы
      this.particle(p.x, p.y, -Math.sin(a) * sd * rand(90, 150) - Math.cos(a) * 40, Math.cos(a) * sd * rand(90, 150) - Math.sin(a) * 40, 0.45, 2.2, "#d97706");
      if (w.burstIdx++ % 3 === 0) audio.play("shoot");
    };
    if (evo) {
      w.timer -= dt * (p.moving ? this.stats.speed * 1.15 : 0.6);
      let n = 0;
      while (w.timer <= 0 && n++ < 6) {
        w.timer += e.cd;
        fire();
      }
      return;
    }
    w.timer -= dt;
    if (w.burst > 0) {
      w.burstTimer -= dt;
      while (w.burst > 0 && w.burstTimer <= 0) {
        w.burstTimer += 0.05;
        w.burst--;
        fire();
      }
    } else if (w.timer <= 0) {
      w.timer = e.cd;
      w.burst = e.amount;
      w.burstTimer = 0;
    }
  }

  // самые живучие цели рядом: боссы, потом элитки, потом по здоровью
  private strongestEnemies(x: number, y: number, n: number, maxD: number): Enemy[] {
    const out: Enemy[] = [];
    const r2 = maxD * maxD;
    for (const en of this.enemies) {
      if (en.dead || en.def.kind === "crate") continue;
      const dx = en.x - x;
      const dy = en.y - y;
      if (dx * dx + dy * dy <= r2) out.push(en);
    }
    const score = (en: Enemy) => (en.boss ? 1e9 : 0) + (en.elite ? 1e6 : 0) + en.hp;
    out.sort((a, b) => score(b) - score(a));
    return out.slice(0, n);
  }

  // Снайперская винтовка: пуля в самого живучего; убила — остаток урона рикошетит (до 3 раз)
  private wSniper(w: WeaponInst, e: Eff, dt: number, evo: boolean) {
    w.timer -= dt;
    if (w.timer > 0) return;
    const p = this.player;
    const ts = this.strongestEnemies(p.x, p.y, e.amount, 900);
    if (!ts.length) {
      w.timer = 0.2;
      return;
    }
    w.timer = e.cd;
    // пробуждение Сойки «Контракт»: после убийства элитки/босса следующий выстрел ×2
    const mul = w.pulse > 0 ? 2 : 1;
    w.pulse = 0;
    for (const t of ts) {
      const a = Math.atan2(t.y - p.y, t.x - p.x);
      const pr = this.addProj("slug", p.x + Math.cos(a) * 16, p.y + Math.sin(a) * 16, Math.cos(a) * 2400, Math.sin(a) * 2400, 4, e.dmg * mul, 1, 1.2, w.slot, e.kb, getOrbSprite("#ffffff", 3));
      pr.target = t;
      pr.chain = 3;
      pr.evo = evo;
      pr.crit = evo; // «Прицел бога»: каждая пуля критическая
      pr.hit = new Set();
      this.fx("flash", p.x + Math.cos(a) * 20, p.y + Math.sin(a) * 20, 34, 0.12, "#ffffff");
    }
    audio.play("rail");
    this.addShake(1.2);
  }

  private updateSlug(pr: Projectile, dt: number) {
    let t = pr.target;
    if (!t || t.dead) {
      t = pr.target = this.nearestInRange(pr.x, pr.y, 420, pr.hit || new Set());
      if (!t) {
        pr.dead = true;
        return;
      }
    }
    const dx = t.x - pr.x;
    const dy = t.y - pr.y;
    const d = Math.hypot(dx, dy) || 1;
    const step = 2400 * dt;
    const tr = this.fx("trail", pr.x, pr.y, 0, 0.45, "#cbd5e1");
    tr.x2 = pr.x + (dx / d) * Math.min(step, d);
    tr.y2 = pr.y + (dy / d) * Math.min(step, d);
    tr.width = pr.evo ? 2.4 : 1.6;
    if (d <= step + t.radius) {
      pr.x = t.x;
      pr.y = t.y;
      pr.hit?.add(t.id);
      this.damageEnemy(t, pr.damage, pr.src, dx / d, dy / d, pr.kb, pr.crit);
      this.fx("flash", t.x, t.y, 50, 0.2, "#ffffff");
      this.burst(t.x, t.y, 6, 180, "#e2e8f0", 0.3, 2);
      const w = this.weapons[pr.src];
      if (w && this.isAwakened(w) && t.dead && (t.elite || t.boss)) {
        w.timer = 0.15;
        w.pulse = 1;
        this.addText(this.player.x, this.player.y - 30, "КОНТРАКТ", w.def.color, true);
      }
      const left = t.dead ? -t.hp : 0;
      if (left > 4 && pr.chain > 0) {
        const nx = this.nearestInRange(t.x, t.y, 320, pr.hit || new Set());
        if (nx) {
          pr.chain--;
          pr.damage = left;
          pr.target = nx;
          const a = Math.atan2(nx.y - t.y, nx.x - t.x);
          pr.vx = Math.cos(a) * 2400;
          pr.vy = Math.sin(a) * 2400;
          this.fx("ring", t.x, t.y, 18, 0.15, "#ffffff");
          return;
        }
      }
      pr.dead = true;
      return;
    }
    pr.vx = (dx / d) * 2400;
    pr.vy = (dy / d) * 2400;
    pr.x += (dx / d) * step;
    pr.y += (dy / d) * step;
  }

  // Криолуч: лучи вращаются вокруг корабля
  private cryoBeams(w: WeaponInst, e: Eff): [number, number, number][] {
    const n = e.amount;
    const len = 210 * e.area;
    const out: [number, number, number][] = [];
    for (let k = 0; k < n; k++) out.push([w.angle + (k * TAU) / n, len, 9 * Math.sqrt(e.area)]);
    return out;
  }

  private freeze(en: Enemy, t: number) {
    if (en.boss) {
      en.slow = Math.max(en.slow, t);
      en.slowAmt = Math.max(en.slowAmt, 0.5);
      return;
    }
    if (en.shield > 0) return;
    en.stun = Math.max(en.stun, t);
    en.frozenT = Math.max(en.frozenT, t);
  }

  private wCryo(w: WeaponInst, e: Eff, dt: number, _evo: boolean) {
    const p = this.player;
    w.angle += dt * e.speed;
    // фирменный бонус Кита: заморозка на 1 с дольше
    const ft = e.dur + (this.character.id === "whaler" && this.isSignature(w) ? 1 : 0);
    for (const [a, len, half] of this.cryoBeams(w, e)) {
      const cx = Math.cos(a);
      const cy = Math.sin(a);
      this.forEachNear(p.x, p.y, len + 40, (en) => {
        if (en.def.kind === "crate") return;
        const rx = en.x - p.x;
        const ry = en.y - p.y;
        const along = rx * cx + ry * cy;
        if (along < 0 || along > len + en.radius || Math.abs(rx * cy - ry * cx) > half + en.radius || this.time < en.hitUntil[w.slot]) return;
        en.hitUntil[w.slot] = this.time + 0.35;
        this.damageEnemy(en, e.dmg, w.slot, 0, 0, 0);
        if (!en.dead) this.freeze(en, ft);
      });
      if (Math.random() < 0.6) {
        const d = rand(20, len);
        this.particle(p.x + cx * d, p.y + cy * d, -cy * rand(-40, 40) + cx * 20, cx * rand(-40, 40) + cy * 20, 0.5, 2.5, Math.random() < 0.5 ? "#e0f2fe" : w.def.color);
      }
    }
    // пробуждение Кита «Ледниковый период»: раз в 10 с замораживает всех врагов на экране
    if (this.isAwakened(w)) {
      if (w.aux.length !== 1) w.aux = [10];
      w.aux[0] -= dt;
      if (w.aux[0] <= 0) {
        w.aux[0] = 10;
        for (const en of this.enemiesInView()) if (en.def.kind !== "nest") this.freeze(en, 1.5);
        this.fx("ring", p.x, p.y, Math.max(this.viewHW, this.viewHH), 0.7, "#e0f2fe");
        this.fx("flash", p.x, p.y, 260, 0.35, "#bae6fd");
        this.showBanner("ЛЕДНИКОВЫЙ ПЕРИОД", "", "#e0f2fe", 1.2);
        audio.play("warp");
      }
    }
  }

  // «Абсолютный ноль»: замёрзший при смерти разлетается осколками
  private shatter(en: Enemy) {
    const w = this.weapons.find((x) => x.def.id === "cryo_evo");
    if (!w) return;
    const dmg = this.eff(w).dmg * 1.5;
    this.forEachNear(en.x, en.y, 70, (o) => {
      if (o !== en && o.def.kind !== "crate") this.damageEnemy(o, dmg, w.slot, 0, 0, 1);
    });
    for (let k = 0; k < 10; k++) {
      const a = Math.random() * TAU;
      const v = rand(160, 320);
      this.particle(en.x, en.y, Math.cos(a) * v, Math.sin(a) * v, 0.5, 3, k % 2 ? "#e0f2fe" : "#7dd3fc", true);
    }
    this.fx("ring", en.x, en.y, 70, 0.3, "#bae6fd");
  }

  // Метка смерти: стопки горения, меченые получают больше урона от остального оружия
  private applyBrand(w: WeaponInst, e: Eff, en: Enemy) {
    if (en.burnT > 0 && en.burnSrc === w.slot) en.burnStacks = Math.min(Math.round(e.extra), en.burnStacks + 1);
    else en.burnStacks = 1;
    en.burnT = e.dur;
    en.burnDps = e.dmg;
    en.burnSrc = w.slot;
    if (en.burnTick <= 0) en.burnTick = 0.5;
    this.fx("sigil", en.x, en.y, en.radius * en.scale + 8, 0.35, w.def.color);
    this.sparks(en.x, en.y, 4, w.def.color, 160);
  }

  private wBrand(w: WeaponInst, e: Eff, dt: number, _evo: boolean) {
    w.timer -= dt;
    if (w.timer > 0) return;
    w.timer = e.cd;
    const p = this.player;
    // пробуждение Ворона «Список смертников»: вдвое больше меток
    const n = e.amount * (this.isAwakened(w) ? 2 : 1);
    const maxStacks = Math.round(e.extra);
    const cands: Enemy[] = [];
    this.forEachNear(p.x, p.y, 480, (en) => {
      if (en.def.kind !== "crate") cands.push(en);
    });
    if (!cands.length) {
      w.timer = 0.2;
      return;
    }
    // сначала элитки и боссы (пока стопки не полные), потом свежие цели, потом ближние меченые
    const score = (en: Enemy) => {
      const mine = en.burnT > 0 && en.burnSrc === w.slot;
      const d = Math.hypot(en.x - p.x, en.y - p.y);
      if ((en.boss || en.elite) && (!mine || en.burnStacks < maxStacks)) return 1e9 - d;
      return mine ? -d : 1e6 - d;
    };
    cands.sort((a, b) => score(b) - score(a));
    for (let k = 0; k < Math.min(n, cands.length); k++) this.applyBrand(w, e, cands[k]);
  }

  // смерть горящего врага: огонь перекидывается (с 3-го уровня — на двух соседей, у «Приговора» — на всех вокруг)
  private brandDeath(en: Enemy) {
    const w = this.weapons[en.burnSrc];
    if (!w || (w.def.evolvedFrom || w.def.id) !== "brand") return;
    const e = this.eff(w);
    if (this.isAwakened(w)) this.heal(1);
    if (w.def.evolved) {
      this.forEachNear(en.x, en.y, 140, (o) => {
        if (o !== en && o.def.kind !== "crate") this.applyBrand(w, e, o);
      });
      this.fx("ring", en.x, en.y, 140, 0.35, w.def.color);
    } else if (w.level >= 3) {
      const near = this.nearestEnemies(en.x, en.y, 3, 160).filter((o) => o !== en).slice(0, 2);
      for (const o of near) this.applyBrand(w, e, o);
    }
  }

  // Гравимины: ложатся позади корабля и взрываются, когда враг наступает. «Минное поле» ещё и стягивает врагов.
  private wMines(w: WeaponInst, e: Eff, dt: number, evo: boolean) {
    const p = this.player;
    w.timer -= dt;
    if (w.timer <= 0) {
      w.timer = e.cd;
      for (let k = 0; k < e.amount; k++) {
        const x = p.x - p.fx * 34 + rand(-26, 26);
        const y = p.y - p.fy * 34 + rand(-26, 26);
        this.zones.push({ kind: "mine", x, y, r: 70 * e.area, life: e.dur, max: e.dur, tick: 0.4, damage: e.dmg, src: w.slot, pull: evo ? 120 : 0, evo, color: w.def.color, dead: false });
      }
      // не копим бесконечно: старые мины уходят первыми
      let mines = 0;
      for (let i = this.zones.length - 1; i >= 0; i--) {
        const z = this.zones[i];
        if (z.kind === "mine" && !z.dead && ++mines > 60) z.dead = true;
      }
    }
    // пробуждение Крота «Минный пояс»: кольцо из 6 мин вокруг корабля, взорванные восстанавливаются за 3 с
    if (this.isAwakened(w)) {
      w.angle += dt * 1.6;
      if (w.aux.length !== 6) w.aux = [0, 0, 0, 0, 0, 0];
      for (let k = 0; k < 6; k++) {
        if (w.aux[k] > 0) {
          w.aux[k] -= dt;
          continue;
        }
        const a = w.angle + (k / 6) * TAU;
        const x = p.x + Math.cos(a) * 78;
        const y = p.y + Math.sin(a) * 78;
        if (this.anyNear(x, y, 14)) {
          this.explode(x, y, 60 * e.area, e.dmg, w.slot, false);
          w.aux[k] = 3;
        }
      }
    }
  }

  // Дробовик: веер дроби в ближайшего, урон падает с расстоянием
  private wShotgun(w: WeaponInst, e: Eff, dt: number, evo: boolean) {
    const p = this.player;
    // пробуждение Буйвола «Таран»: раз в 6 с рывок к врагу с выстрелом в упор (один палец — рывок сам)
    if (this.isAwakened(w)) {
      if (w.aux.length !== 1) w.aux = [6];
      w.aux[0] -= dt;
      const t = w.aux[0] <= 0 ? this.nearestEnemy(p.x, p.y, 320) : null;
      if (t) {
        w.aux[0] = 6;
        const a = Math.atan2(t.y - p.y, t.x - p.x);
        const sx = p.x;
        const sy = p.y;
        p.x += Math.cos(a) * 170;
        p.y += Math.sin(a) * 170;
        this.clampToArena(p, p.r + 6);
        p.iframes = Math.max(p.iframes, 0.4);
        for (let k = 0; k <= 6; k++) {
          const x = sx + (p.x - sx) * (k / 6);
          const y = sy + (p.y - sy) * (k / 6);
          this.forEachNear(x, y, 34, (en) => {
            if (en.hitUntil[w.slot] > this.time) return;
            en.hitUntil[w.slot] = this.time + 0.4;
            this.damageEnemy(en, e.dmg * 3, w.slot, Math.cos(a), Math.sin(a), 4);
          });
          this.particle(x, y, rand(-40, 40), rand(-40, 40), 0.4, 4, w.def.color);
        }
        this.addShake(4);
        w.timer = 0;
      }
    }
    w.timer -= dt;
    if (w.timer > 0) return;
    const t = this.nearestEnemy(p.x, p.y, 330);
    if (!t) {
      w.timer = 0.15;
      return;
    }
    w.timer = e.cd;
    const base = Math.atan2(t.y - p.y, t.x - p.x);
    const n = e.amount;
    for (let k = 0; k < n; k++) {
      const a = base + (n > 1 ? (k / (n - 1) - 0.5) * 0.62 : 0) + rand(-0.04, 0.04);
      const v = e.speed * rand(0.88, 1.1);
      const pr = this.addProj("pellet", p.x + Math.cos(a) * 16, p.y + Math.sin(a) * 16, Math.cos(a) * v, Math.sin(a) * v, 4, e.dmg, e.pierce, e.dur, w.slot, e.kb, getBoltSprite(w.def.color, 4));
      if (e.pierce > 1) pr.hit = new Set();
    }
    const mx = p.x + Math.cos(base) * 20;
    const my = p.y + Math.sin(base) * 20;
    this.fx("flash", mx, my, 34, 0.1, "#fed7aa");
    for (let k = 0; k < 10; k++) {
      const a = base + rand(-0.35, 0.35);
      const v = rand(160, 380);
      this.particle(mx, my, Math.cos(a) * v, Math.sin(a) * v, 0.16, 3, k % 2 ? "#fdba74" : "#fff7ed");
    }
    for (let k = 0; k < 4; k++) this.particle(mx, my, Math.cos(base) * rand(20, 60) + rand(-20, 20), Math.sin(base) * rand(20, 60) + rand(-20, 20), 0.7, 5, "#64748b");
    // ударная волна: у «Разрывателя» всегда, у Буйвола — фирменный бонус
    if (evo || (this.character.id === "buffalo" && this.isSignature(w))) {
      const R = 110 * e.area;
      this.forEachNear(p.x, p.y, R, (en) => {
        const dx = en.x - p.x;
        const dy = en.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        this.damageEnemy(en, evo ? e.dmg : e.dmg * 0.3, w.slot, dx / d, dy / d, 4);
      });
      this.fx("ring", p.x, p.y, R, 0.3, w.def.color);
    }
    audio.play("explode");
    this.addShake(1.5);
  }

  // пробуждения, которые не живут внутри функции пушки
  private updateAwaken(dt: number) {
    if (!this.awakened) return;
    const w = this.weapons.find((x) => this.isAwakened(x));
    if (!w) return;
    // пробуждение Титана «Ковровая бомбардировка»: раз в 15 с — десять взрывов по экрану
    if (this.character.weapon === "missile") {
      this.awakenT -= dt;
      if (this.awakenT <= 0) {
        this.awakenT = 15;
        const e = this.eff(w);
        const view = this.enemiesInView();
        const p = this.player;
        for (let k = 0; k < 10; k++) {
          let x = p.x + rand(-this.viewHW, this.viewHW);
          let y = p.y + rand(-this.viewHH, this.viewHH);
          if (view.length) {
            const t = view[(Math.random() * view.length) | 0];
            x = t.x;
            y = t.y;
          }
          this.explode(x, y, 70 * e.area, e.dmg * 2, w.slot, false);
        }
        this.showBanner("КОВРОВАЯ БОМБАРДИРОВКА", "", this.character.color, 1.4);
      }
    }
  }

  // Турель: ставится там, где сейчас корабль, и сама стреляет
  private wTurret(w: WeaponInst, e: Eff, dt: number, evo: boolean) {
    w.timer -= dt;
    if (w.timer > 0) return;
    w.timer = e.cd;
    const p = this.player;
    for (let k = 0; k < e.amount; k++) {
      const a = (k / e.amount) * TAU + Math.random();
      const off = e.amount > 1 ? 40 : 0;
      const [x, y] = this.clampPoint(p.x + Math.cos(a) * off, p.y + Math.sin(a) * off, 30);
      this.turrets.push({ x, y, life: e.dur, max: e.dur, fire: 0.2, src: w.slot, evo, angle: 0, dead: false });
      this.fx("ring", x, y, 50, 0.35, w.def.color);
    }
    audio.play("pickup");
  }

  private updateTurrets(dt: number) {
    for (const t of this.turrets) {
      if (t.dead) continue;
      t.life -= dt;
      if (t.life <= 0) {
        t.dead = true;
        this.fx("ring", t.x, t.y, 30, 0.3, "#38bdf8");
        continue;
      }
      const w = this.weapons[t.src];
      if (!w || (w.def.evolvedFrom || w.def.id) !== "turret") {
        t.dead = true;
        continue;
      }
      t.fire -= dt;
      const tg = this.nearestEnemy(t.x, t.y, 380);
      if (tg) t.angle = Math.atan2(tg.y - t.y, tg.x - t.x);
      if (t.fire > 0 || !tg) continue;
      const e = this.eff(w);
      t.fire = Math.max(0.1, (w.stats.extra / 100) * this.stats.cooldown);
      const shots = t.evo ? [-0.15, 0, 0.15] : [0];
      for (const da of shots) {
        const a = t.angle + da;
        const pr = this.addProj("bolt", t.x, t.y, Math.cos(a) * e.speed, Math.sin(a) * e.speed, 5 * Math.sqrt(e.area), e.dmg, e.pierce, 1.2, t.src, e.kb, getBoltSprite(w.def.color, 5));
        if (e.pierce > 1) pr.hit = new Set();
      }
    }
  }

  // Гарпун: самая живучая цель рядом (боссы и элитки — в приоритете), бьёт ещё и % здоровья
  private wHarpoon(w: WeaponInst, e: Eff, dt: number, evo: boolean) {
    w.timer -= dt;
    if (w.timer > 0) return;
    const p = this.player;
    const cands: Enemy[] = [];
    for (const en of this.enemies) {
      if (en.dead || en.def.kind === "crate") continue;
      if (Math.hypot(en.x - p.x, en.y - p.y) < 650) cands.push(en);
    }
    if (!cands.length) {
      w.timer = 0.2;
      return;
    }
    w.timer = e.cd;
    const score = (en: Enemy) => en.hp * (en.boss ? 100 : en.elite ? 10 : 1);
    cands.sort((a, b) => score(b) - score(a));
    for (let k = 0; k < e.amount; k++) {
      const t = cands[Math.min(k, cands.length - 1)];
      const a = Math.atan2(t.y - p.y, t.x - p.x) + (k > 0 && t === cands[0] ? (k % 2 ? 0.1 : -0.1) : 0);
      const pr = this.addProj("bolt", p.x, p.y, Math.cos(a) * e.speed, Math.sin(a) * e.speed, 9 * Math.sqrt(e.area), e.dmg, e.pierce, e.dur, w.slot, e.kb, getBoltSprite(w.def.color, 9));
      pr.pct = e.extra / 1000;
      pr.hit = new Set();
      pr.evo = evo;
    }
    audio.play("rail");
  }

  // Щит-проектор: импульс лечит, отталкивает, у эволюции — ещё и барьер
  private wAegis(w: WeaponInst, e: Eff, dt: number, evo: boolean) {
    w.timer -= dt;
    if (w.pulse > 0) w.pulse = Math.max(0, w.pulse - dt * 2);
    if (w.timer > 0) return;
    w.timer = e.cd;
    w.pulse = 1;
    const p = this.player;
    const R = 95 * e.area;
    this.heal(e.extra);
    if (evo && !this.barrier) this.barrier = true;
    this.forEachNear(p.x, p.y, R, (en) => {
      if (en.def.kind === "crate") return;
      const dx = en.x - p.x;
      const dy = en.y - p.y;
      const d = Math.hypot(dx, dy) || 1;
      this.damageEnemy(en, e.dmg, w.slot, dx / d, dy / d, e.kb);
    });
    for (const b of this.ebullets) if (!b.dead && Math.hypot(b.x - p.x, b.y - p.y) < R) b.dead = true;
    this.fx("ring", p.x, p.y, R, 0.45, w.def.color);
    audio.play("pickup");
  }

  // ------------------------------------------------------------
  //  Снаряды и зоны
  // ------------------------------------------------------------
  private updateProjectiles(dt: number) {
    for (const pr of this.projectiles) {
      if (pr.dead) continue;
      pr.life -= dt;
      switch (pr.kind) {
        case "bolt":
        case "wave":
        case "pellet":
          pr.x += pr.vx * dt;
          pr.y += pr.vy * dt;
          this.projHit(pr);
          break;
        case "slug":
          this.updateSlug(pr, dt);
          break;
        case "disc":
          pr.vx += pr.ax * dt;
          pr.vy += pr.ay * dt;
          pr.x += pr.vx * dt;
          pr.y += pr.vy * dt;
          pr.rot += pr.spin * dt;
          if (!pr.returned && pr.vx * pr.dirX + pr.vy * pr.dirY < 0) {
            pr.returned = true;
            pr.hit?.clear();
          }
          this.projHit(pr);
          break;
        case "missile":
          this.updateMissile(pr, dt);
          break;
        case "bomblet": {
          const f = Math.pow(0.03, dt);
          pr.vx *= f;
          pr.vy *= f;
          pr.x += pr.vx * dt;
          pr.y += pr.vy * dt;
          if (pr.life <= 0) {
            this.explode(pr.x, pr.y, pr.area, pr.damage, pr.src, false);
            pr.dead = true;
          }
          break;
        }
      }
      if (pr.life <= 0 && !pr.dead) {
        if (pr.kind === "missile") this.explode(pr.x, pr.y, pr.area, pr.damage, pr.src, pr.evo);
        pr.dead = true;
      }
    }
  }

  private projHit(pr: Projectile) {
    this.forEachNear(pr.x, pr.y, pr.r, (en) => {
      if (pr.dead) return;
      if (pr.hit) {
        if (pr.hit.has(en.id)) return;
        pr.hit.add(en.id);
      }
      const sp = Math.hypot(pr.vx, pr.vy) || 1;
      let dmg = pr.damage;
      // дробь слабеет с расстоянием: в упор 100%, на излёте 35%
      if (pr.kind === "pellet") dmg *= 0.35 + (0.65 * Math.max(0, pr.life)) / (pr.life0 || 1);
      // «Гарпун»: по элиткам и боссам — ещё и процент от их здоровья
      if (pr.pct > 0 && (en.elite || en.boss)) dmg += en.maxHp * pr.pct;
      this.damageEnemy(en, dmg, pr.src, pr.vx / sp, pr.vy / sp, pr.kb, pr.crit);
      if (pr.kind === "bolt" || pr.kind === "pellet") {
        pr.pierce--;
        if (pr.pierce <= 0) {
          pr.dead = true;
          this.burst(pr.x, pr.y, 4, 120, this.weapons[pr.src]?.def.color || "#22d3ee", 0.25, 2);
        }
      }
    });
  }

  private updateMissile(pr: Projectile, dt: number) {
    if (!pr.target || pr.target.dead) {
      pr.retarget -= dt;
      if (pr.retarget <= 0) {
        pr.retarget = 0.2;
        pr.target = this.nearestEnemy(pr.x, pr.y, 520);
      }
    }
    const sp = Math.min(pr.spd * 1.3, Math.hypot(pr.vx, pr.vy) + pr.spd * 2.4 * dt);
    let ang = Math.atan2(pr.vy, pr.vx);
    if (pr.target && !pr.target.dead) {
      const want = Math.atan2(pr.target.y - pr.y, pr.target.x - pr.x);
      const turn = 5.5 * dt;
      ang += clamp(normAngle(want - ang), -turn, turn);
    }
    pr.vx = Math.cos(ang) * sp;
    pr.vy = Math.sin(ang) * sp;
    pr.rot = ang;
    pr.x += pr.vx * dt;
    pr.y += pr.vy * dt;
    pr.smoke -= dt;
    if (pr.smoke <= 0) {
      pr.smoke = 0.025;
      this.particle(pr.x - Math.cos(ang) * 9, pr.y - Math.sin(ang) * 9, rand(-15, 15), rand(-15, 15), 0.35, 3, "#fdba74");
    }
    if (this.anyNear(pr.x, pr.y, pr.r)) {
      this.explode(pr.x, pr.y, pr.area, pr.damage, pr.src, pr.evo);
      pr.dead = true;
    }
  }

  private explode(x: number, y: number, radius: number, dmg: number, src: number, cluster: boolean) {
    this.forEachNear(x, y, radius, (en) => {
      const kx = en.x - x;
      const ky = en.y - y;
      const d = Math.hypot(kx, ky) || 1;
      this.damageEnemy(en, dmg, src, kx / d, ky / d, 2);
    });
    this.fx("fireball", x, y, radius, 0.42, "#fb923c");
    this.fx("ring", x, y, radius * 1.15, 0.32, "#fdba74");
    this.fx("flash", x, y, radius * 1.4, 0.16, "#fff7ed");
    if (this.particles.length < 560) {
      this.sparks(x, y, 10, "#fed7aa", 380);
      this.burst(x, y, 5, 90, "#f97316", 0.55, 4);
    }
    audio.play("explode");
    this.addShake(2);
    if (cluster) {
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + rand(-0.3, 0.3);
        const b = this.addProj("bomblet", x, y, Math.cos(a) * 260, Math.sin(a) * 260, 4, dmg * 0.5, 1, 0.32, src, 1, getOrbSprite("#fdba74", 4));
        b.area = radius * 0.65;
      }
    }
  }

  private updateZones(dt: number) {
    for (const z of this.zones) {
      if (z.dead) continue;
      z.life -= dt;
      if (z.kind === "marker") {
        if (z.life <= 0) {
          z.dead = true;
          this.forEachNear(z.x, z.y, z.r, (en) => this.damageEnemy(en, z.damage, z.src, 0, 0, 0));
          const f = this.fx("strike", z.x, z.y, 0, 0.35, z.color);
          f.width = z.r * 0.55;
          this.fx("ring", z.x, z.y, z.r * 1.25, 0.4, z.color);
          this.fx("flash", z.x, z.y, z.r * 1.4, 0.25, z.color);
          this.burst(z.x, z.y, 12, 220, z.color, 0.45, 3);
          audio.play("strike");
          this.addShake(z.evo ? 3.5 : 2.5);
        }
      } else if (z.kind === "mine") {
        z.tick -= dt;
        if (z.tick <= 0) {
          // «Минное поле»: взведённые мины стягивают врагов к себе
          if (z.pull > 0)
            this.forEachNear(z.x, z.y, z.r * 2, (en) => {
              if (en.boss || en.def.kind === "crate" || en.def.kind === "nest") return;
              const dx = z.x - en.x;
              const dy = z.y - en.y;
              const d = Math.hypot(dx, dy) || 1;
              const m = Math.min(z.pull * dt * (1 - en.def.kbResist * 0.7), d);
              en.x += (dx / d) * m;
              en.y += (dy / d) * m;
            });
          if (this.anyNear(z.x, z.y, 20)) {
            z.dead = true;
            this.explode(z.x, z.y, z.r, z.damage, z.src, false);
            this.fx("ring", z.x, z.y, z.r, 0.35, z.color);
          }
        }
        if (z.life <= 0) z.dead = true;
      } else if (z.kind === "puddle") {
        z.tick -= dt;
        if (z.tick <= 0) {
          z.tick = 0.3;
          this.forEachNear(z.x, z.y, z.r, (en) => this.damageEnemy(en, z.damage, z.src, 0, 0, 0));
        }
        if (z.life <= 0) z.dead = true;
      } else {
        // зона притяжения = зона урона (было ×1.15), элитки поддаются слабо
        const pr = z.r;
        // пробуждение Призрака «Горизонт событий»: колодцы замедляют даже боссов (не тянут — сингулярность остаётся контролем)
        const horizon = this.awakened && this.character.weapon === "singularity";
        this.forEachNear(z.x, z.y, pr, (en) => {
          en.inWell = 0.3;
          if (en.boss && horizon) {
            en.slow = Math.max(en.slow, 0.3);
            en.slowAmt = Math.max(en.slowAmt, 0.3);
          }
          if (en.boss || en.def.kind === "crate" || en.def.kind === "nest") return;
          // колодец вязкий: враги в нём замедлены на 40% — это и помогает оторваться
          if (en.slow <= 0 || en.slowAmt <= 0.4) {
            en.slow = Math.max(en.slow, 0.3);
            en.slowAmt = 0.4;
          }
          const dx = z.x - en.x;
          const dy = z.y - en.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 14) return;
          const f = z.pull * (1 - en.def.kbResist * 0.7) * (en.elite ? 0.35 : 1) * dt * (0.5 + 0.5 * (1 - d / pr));
          const m = Math.min(f, d);
          en.x += (dx / d) * m;
          en.y += (dy / d) * m;
        });
        z.tick -= dt;
        if (z.tick <= 0) {
          z.tick = 0.25;
          this.forEachNear(z.x, z.y, z.r, (en) => this.damageEnemy(en, z.damage, z.src, 0, 0, 0));
        }
        if (Math.random() < 0.7) {
          const a = Math.random() * TAU;
          const rr = z.r * rand(0.7, 1.1);
          this.particle(z.x + Math.cos(a) * rr, z.y + Math.sin(a) * rr, -Math.cos(a) * rr * 1.6 - Math.sin(a) * 90, -Math.sin(a) * rr * 1.6 + Math.cos(a) * 90, 0.45, 2.5, z.color);
        }
        if (z.life <= 0) {
          z.dead = true;
          if (z.evo) {
            const mul = SINGULARITY_COLLAPSE_MUL * (this.awakened && this.character.weapon === "singularity" ? 2 : 1);
            this.forEachNear(z.x, z.y, z.r * 1.3, (en) => this.damageEnemy(en, z.damage * mul, z.src, 0, 0, 0));
            this.fx("ring", z.x, z.y, z.r * 1.6, 0.5, z.color);
            this.fx("flash", z.x, z.y, z.r * 1.8, 0.3, "#ffffff");
            this.burst(z.x, z.y, 24, 320, z.color, 0.6, 3);
            audio.play("explode");
            this.addShake(5);
          } else {
            this.fx("ring", z.x, z.y, z.r, 0.3, z.color);
          }
        }
      }
    }
  }

  // ------------------------------------------------------------
  //  Враги
  // ------------------------------------------------------------
  private buildGrid() {
    this.grid.clear();
    this.big.length = 0;
    for (const e of this.enemies) {
      if (e.dead) continue;
      if (e.radius > BIG_R) {
        this.big.push(e);
        continue;
      }
      const k = gkey(Math.floor(e.x / CELL), Math.floor(e.y / CELL));
      let arr = this.grid.get(k);
      if (!arr) {
        arr = [];
        this.grid.set(k, arr);
      }
      arr.push(e);
    }
  }

  private forEachNear(x: number, y: number, r: number, fn: (e: Enemy) => void) {
    const m = r + BIG_R;
    const x0 = Math.floor((x - m) / CELL);
    const x1 = Math.floor((x + m) / CELL);
    const y0 = Math.floor((y - m) / CELL);
    const y1 = Math.floor((y + m) / CELL);
    for (let cx = x0; cx <= x1; cx++) {
      for (let cy = y0; cy <= y1; cy++) {
        const arr = this.grid.get(gkey(cx, cy));
        if (!arr) continue;
        for (let i = 0; i < arr.length; i++) {
          const e = arr[i];
          if (e.dead) continue;
          const dx = e.x - x;
          const dy = e.y - y;
          const rr = r + e.radius;
          if (dx * dx + dy * dy <= rr * rr) fn(e);
        }
      }
    }
    for (let i = 0; i < this.big.length; i++) {
      const e = this.big[i];
      if (e.dead) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      const rr = r + e.radius;
      if (dx * dx + dy * dy <= rr * rr) fn(e);
    }
  }

  private anyNear(x: number, y: number, r: number) {
    let n = 0;
    this.forEachNear(x, y, r, () => {
      n++;
    });
    return n > 0;
  }

  private nearestEnemy(x: number, y: number, maxD: number): Enemy | null {
    let best: Enemy | null = null;
    let bd = maxD * maxD;
    for (const e of this.enemies) {
      if (e.dead || e.def.kind === "crate") continue;
      const dx = e.x - x;
      const dy = e.y - y;
      const d = dx * dx + dy * dy;
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    return best;
  }

  private nearestEnemies(x: number, y: number, n: number, maxD: number): Enemy[] {
    const md = maxD * maxD;
    const cand: { e: Enemy; d: number }[] = [];
    for (const e of this.enemies) {
      if (e.dead || e.def.kind === "crate") continue;
      const dx = e.x - x;
      const dy = e.y - y;
      const d = dx * dx + dy * dy;
      if (d < md) cand.push({ e, d });
    }
    cand.sort((a, b) => a.d - b.d);
    const out: Enemy[] = [];
    for (let i = 0; i < n && i < cand.length; i++) out.push(cand[i].e);
    return out;
  }

  private randomNearEnemy(x: number, y: number, maxD: number, k: number): Enemy | null {
    const arr = this.nearestEnemies(x, y, k, maxD);
    return arr.length ? arr[(Math.random() * arr.length) | 0] : null;
  }

  private nearestInRange(x: number, y: number, r: number, exclude: Set<number>): Enemy | null {
    let best: Enemy | null = null;
    let bd = Infinity;
    this.forEachNear(x, y, r, (e) => {
      if (exclude.has(e.id) || e.def.kind === "crate") return;
      const dx = e.x - x;
      const dy = e.y - y;
      const d = dx * dx + dy * dy;
      if (d < bd) {
        bd = d;
        best = e;
      }
    });
    return best;
  }

  private densestEnemy(x: number, y: number, maxD: number): Enemy | null {
    const cands = this.nearestEnemies(x, y, 24, maxD);
    if (!cands.length) return null;
    let best = cands[0];
    let bc = -1;
    for (let i = 0; i < 6; i++) {
      const c = cands[(Math.random() * cands.length) | 0];
      let n = 0;
      this.forEachNear(c.x, c.y, 70, () => {
        n++;
      });
      if (n > bc) {
        bc = n;
        best = c;
      }
    }
    return best;
  }

  private enemiesInView(): Enemy[] {
    const p = this.player;
    const out: Enemy[] = [];
    for (const e of this.enemies) {
      if (e.dead || e.def.kind === "crate") continue;
      if (Math.abs(e.x - p.x) < this.viewHW && Math.abs(e.y - p.y) < this.viewHH) out.push(e);
    }
    return out;
  }

  private updateEnemies(dt: number) {
    const p = this.player;
    const frozen = this.freezeTimer > 0;
    const kf = Math.exp(-9 * dt);
    const farX = this.viewHW + 420;
    const farY = this.viewHH + 420;
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.dead) continue;
      if (e.flash > 0) e.flash -= dt;
      if (e.attackCd > 0) e.attackCd -= dt;
      if (e.slow > 0) e.slow -= dt;
      if (e.stun > 0) e.stun -= dt;
      if (e.inWell > 0) e.inWell -= dt;
      if (e.frozenT > 0) e.frozenT -= dt;
      // горение «Метки смерти»: тик раз в 0.5 с, урон × стопки
      if (e.burnT > 0) {
        e.burnT -= dt;
        e.burnTick -= dt;
        if (e.burnTick <= 0) {
          e.burnTick = 0.5;
          this.dmgColor = this.weapons[e.burnSrc]?.def.color || "#e879f9";
          this.damageEnemy(e, e.burnDps * e.burnStacks * 0.5, e.burnSrc, 0, 0, 0);
          this.dmgColor = null;
          if (e.dead) continue;
        }
        if (Math.random() < 0.25) this.particle(e.x + rand(-e.radius, e.radius) * 0.6, e.y, rand(-10, 10), rand(-70, -40), 0.45, 3, this.weapons[e.burnSrc]?.def.color || "#e879f9");
        if (e.burnT <= 0) e.burnStacks = 0;
      }
      // «Пустотная» элитка оставляет медленные войд-зоны
      if (e.voidy && !frozen) {
        e.voidT -= dt;
        if (e.voidT <= 0) {
          e.voidT = rand(5, 7);
          this.castVoid(e.x, e.y, 52, 22, 6, e.damage * VOID_ELITE_DMG);
        }
      }
      if (e.shield > 0) e.shield -= dt;
      e.anim += dt;
      if (e.kx !== 0 || e.ky !== 0) {
        e.x += e.kx * dt;
        e.y += e.ky * dt;
        e.kx *= kf;
        e.ky *= kf;
        if (Math.abs(e.kx) + Math.abs(e.ky) < 2) {
          e.kx = 0;
          e.ky = 0;
        }
      }
      let dx = p.x - e.x;
      let dy = p.y - e.y;
      const dist = Math.hypot(dx, dy) || 1;
      const kind = e.def.kind;
      if (kind === "crate") {
        if (dist > 2600) e.dead = true;
        continue;
      }
      if (kind === "nest") {
        if (!frozen) {
          e.t -= dt;
          if (e.t <= 0 && dist < 750 && this.enemies.length < 220) {
            e.t = rand(5, 7);
            for (let k = 0; k < 2; k++) {
              const a = Math.random() * TAU;
              this.spawnEnemy("larva", e.x + Math.cos(a) * e.radius * 1.4, e.y + Math.sin(a) * e.radius * 1.4);
            }
          }
        }
        continue;
      }
      if (!frozen && e.stun <= 0) {
        const slowMul = e.slow > 0 ? 1 - e.slowAmt : 1;
        const sp = e.speed * slowMul * (!e.boss && this.inBase(e.x, e.y) ? 0.45 : 1);
        if (e.rush) {
          e.x += e.rvx * dt * slowMul;
          e.y += e.rvy * dt * slowMul;
          e.rushLife -= dt;
          if (e.rushLife <= 0) {
            e.dead = true;
            continue;
          }
        } else if (kind === "gunner") {
          this.aiGunner(e, dx, dy, dist, sp, dt);
        } else if (kind === "boss") {
          this.aiBoss(e, dx, dy, dist, sp, dt);
        } else {
          if (kind === "phantom") this.aiPhantom(e, dx, dy, dist, dt);
          if (dist > e.radius * 0.75 + p.r) {
            e.x += (dx / dist) * sp * dt;
            e.y += (dy / dist) * sp * dt;
          }
        }
      }
      if (!e.rush) this.clampToArena(e, e.radius * e.scale * 0.6);
      {
        // Неон 2.0: враги поворачиваются к пилоту (несущиеся рои — по курсу)
        const want = e.rush ? Math.atan2(e.rvy, e.rvx) : Math.atan2(p.y - e.y, p.x - e.x);
        e.face += normAngle(want - e.face) * Math.min(1, dt * 7);
      }
      if (!e.boss && !e.rush && (Math.abs(dx) > farX || Math.abs(dy) > farY)) {
        const pos = this.spawnPos(true);
        e.x = pos[0];
        e.y = pos[1];
        e.kx = 0;
        e.ky = 0;
        continue;
      }
      if (frozen) continue;
      dx = p.x - e.x;
      dy = p.y - e.y;
      const d2 = dx * dx + dy * dy;
      if (kind === "kamikaze") {
        const tr = e.radius + p.r + 16;
        if (d2 < tr * tr) this.kamikazeBlast(e);
        continue;
      }
      if (e.attackCd <= 0) {
        const rr = e.radius * 0.9 + p.r;
        // касание босса слабее: его угроза — зоны и рывки, а не таран (столп 03)
        if (d2 < rr * rr && this.hurtPlayer(e.boss && e.dashing <= 0 ? e.damage * BOSS_CONTACT_MUL : e.damage)) e.attackCd = 0.8;
      }
    }
    this.separate();
  }

  private aiGunner(e: Enemy, dx: number, dy: number, dist: number, sp: number, dt: number) {
    const nx = dx / dist;
    const ny = dy / dist;
    if (dist > 280) {
      e.x += nx * sp * dt;
      e.y += ny * sp * dt;
    } else if (dist < 190) {
      e.x -= nx * sp * 0.7 * dt;
      e.y -= ny * sp * 0.7 * dt;
    } else {
      e.x += -ny * sp * 0.5 * dt;
      e.y += nx * sp * 0.5 * dt;
    }
    e.t -= dt;
    if (e.t <= 0 && dist < 560) {
      // пули редкие и медленные (столп 03)
      e.t = rand(GUNNER_FIRE_EVERY[0], GUNNER_FIRE_EVERY[1]);
      const a = Math.atan2(dy, dx);
      if (e.elite) for (let k = -1; k <= 1; k += 2) this.enemyShoot(e.x, e.y, a + k * 0.18, 200, e.damage, "#ff4d6d");
      else this.enemyShoot(e.x, e.y, a, 190, e.damage, "#ff4d6d");
    }
  }

  private aiPhantom(e: Enemy, dx: number, dy: number, dist: number, dt: number) {
    e.t -= dt;
    if (e.t <= 0 && dist > 140 && dist < 650) {
      e.t = rand(3.5, 6);
      this.fx("ring", e.x, e.y, 28, 0.3, e.def.color);
      const jump = Math.min(dist - 90, 170);
      e.x += (dx / dist) * jump;
      e.y += (dy / dist) * jump;
      this.fx("ring", e.x, e.y, 28, 0.3, e.def.color);
    }
  }

  private aiBoss(e: Enemy, dx: number, dy: number, dist: number, sp: number, dt: number) {
    const ang = Math.atan2(dy, dx);
    e.t -= dt;
    e.t2 -= dt;
    e.t3 -= dt;
    if (e.dashing > 0) {
      e.dashing -= dt;
      e.x += e.dvx * dt;
      e.y += e.dvy * dt;
      if (Math.random() < 0.5) this.particle(e.x, e.y, rand(-60, 60), rand(-60, 60), 0.4, 4, e.def.color);
      return;
    }
    if (e.charge > 0) {
      e.charge -= dt;
      if (e.charge <= 0) {
        e.dashing = 0.55;
        e.dvx = Math.cos(ang) * 600;
        e.dvy = Math.sin(ang) * 600;
      }
      return;
    }
    if (dist > e.radius * 0.7 + this.player.r) {
      e.x += (dx / dist) * sp * dt;
      e.y += (dy / dist) * sp * dt;
    }
    const id = e.def.id;
    // Боссы: пуль мало и они медленные, основная угроза — войд-зоны с предупреждением на земле (столп 03)
    if (id === "sentinel") {
      if (e.t <= 0) {
        e.t = 4.5;
        this.enemyRing(e.x, e.y, 14, 170, e.damage * 0.5, e.anim, "#fb7185");
      }
      if (e.t2 <= 0) {
        e.t2 = 7;
        e.charge = 0.75;
      }
      if (e.t3 <= 0) {
        e.t3 = 6.5;
        this.voidsAroundPlayer(2, 80, e.damage * VOID_BOSS_DMG);
      }
    } else if (id === "queen") {
      if (e.t <= 0) {
        e.t = 3;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * TAU;
          this.spawnEnemy(this.planet.id === "ice" ? "snowmite" : "swarm", e.x + Math.cos(a) * e.radius, e.y + Math.sin(a) * e.radius);
        }
      }
      if (e.t2 <= 0) {
        e.t2 = 6;
        e.spin++;
        if (e.spin % 2 === 0) this.enemyRing(e.x, e.y, 20, 135, e.damage * 0.42, e.anim, "#f0abfc");
        else for (let k = -1; k <= 1; k++) this.enemyShoot(e.x, e.y, ang + k * 0.2, 210, e.damage * 0.5, "#f0abfc");
      }
      if (e.t3 <= 0) {
        e.t3 = 7;
        this.voidsAroundPlayer(3, 85, e.damage * VOID_BOSS_DMG);
      }
    } else if (id === "omega") {
      const phase2 = e.hp < e.maxHp * 0.5;
      if (e.t3 <= 0) {
        // спираль стала редкой: было 3–4 рукава каждые 0.09–0.13 с
        e.t3 = phase2 ? 0.7 : 1;
        e.spin += 0.5;
        const arms = 2;
        for (let k = 0; k < arms; k++) this.enemyShoot(e.x, e.y, e.spin + (k * TAU) / arms, 150, e.damage * 0.32, "#f87171");
      }
      if (e.t <= 0) {
        e.t = phase2 ? 6 : 8;
        const p = this.player;
        const kam = this.planet.id === "hive" ? "bloater" : "kamikaze";
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU;
          this.spawnEnemy(kam, p.x + Math.cos(a) * 360, p.y + Math.sin(a) * 360);
        }
      }
      if (e.t2 <= 0) {
        e.t2 = 6;
        e.charge = 0.8;
        this.voidsAroundPlayer(phase2 ? 3 : 2, 90, e.damage * VOID_BOSS_DMG);
      }
    } else if (id === "dreadnought") {
      const phase2 = e.hp < e.maxHp * 0.5;
      if (e.t <= 0) {
        // прицельный залп веером
        e.t = phase2 ? 4.4 : 5.5;
        const n = 3;
        for (let k = 0; k < n; k++) this.enemyShoot(e.x, e.y, ang + (k - (n - 1) / 2) * 0.16, 200, e.damage * 0.45, "#fbbf24");
        if (phase2) this.enemyRing(e.x, e.y, 16, 150, e.damage * 0.35, e.anim, "#f59e0b");
      }
      if (e.t2 <= 0) {
        // высадка дронов + войд-зоны
        e.t2 = 5.5;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * TAU;
          this.spawnEnemy("drone", e.x + Math.cos(a) * e.radius * 1.3, e.y + Math.sin(a) * e.radius * 1.3);
        }
        this.voidsAroundPlayer(phase2 ? 3 : 2, 80, e.damage * VOID_BOSS_DMG);
      }
      if (e.t3 <= 0) {
        e.t3 = 8;
        e.charge = 0.85;
      }
    } else if (id === "hive_mother") {
      const phase2 = e.hp < e.maxHp * 0.5;
      if (e.t <= 0) {
        e.t = phase2 ? 2.6 : 3.4;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU;
          this.spawnEnemy("larva", e.x + Math.cos(a) * e.radius, e.y + Math.sin(a) * e.radius);
        }
      }
      if (e.t2 <= 0) {
        e.t2 = phase2 ? 4.6 : 6;
        e.spin++;
        if (e.spin % 2 === 0) this.enemyRing(e.x, e.y, phase2 ? 28 : 22, 140, e.damage * 0.4, e.anim, "#bef264");
        else this.voidsAroundPlayer(phase2 ? 4 : 3, 95, e.damage * VOID_BOSS_DMG);
      }
      if (e.t3 <= 0) {
        e.t3 = 8;
        e.charge = 0.8;
      }
    }
  }

  // ------------------------------------------------------------
  //  Войд-зоны
  // ------------------------------------------------------------
  private castVoid(x: number, y: number, r: number, speed: number, life: number, damage: number) {
    if (this.voids.length >= 40) return;
    const [cx, cy] = this.clampPoint(x, y, r);
    this.voids.push({ x: cx, y: cy, r, warn: VOID_WARN, life, max: life, speed, damage, tick: 0, dead: false });
  }

  // босс ставит зоны вокруг пилота: на земле видно предупреждение, есть время уйти
  private voidsAroundPlayer(n: number, r: number, damage: number) {
    const p = this.player;
    const a0 = Math.random() * TAU;
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * TAU;
      // первая зона — рядом с кораблём, а не прямо под ним: есть куда шагнуть
      const d = i === 0 ? rand(70, 110) : rand(150, 240);
      this.castVoid(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, r, 30, 7, damage);
    }
    audio.play("warp");
  }

  private updateVoids(dt: number) {
    const p = this.player;
    const frozen = this.freezeTimer > 0;
    let inside = false;
    for (const v of this.voids) {
      if (v.dead) continue;
      if (v.warn > 0) {
        v.warn -= dt;
        continue;
      }
      v.life -= dt;
      if (v.life <= 0) {
        v.dead = true;
        continue;
      }
      const dx = p.x - v.x;
      const dy = p.y - v.y;
      const d = Math.hypot(dx, dy) || 1;
      if (!frozen) {
        v.x += (dx / d) * v.speed * dt;
        v.y += (dy / d) * v.speed * dt;
      }
      if (d < v.r - p.r * 0.3) {
        inside = true;
        v.tick -= dt;
        if (v.tick <= 0) {
          v.tick = VOID_TICK;
          this.hurtPlayer(v.damage);
        }
      } else v.tick = Math.min(v.tick, 0.15);
    }
    this.inVoid = inside;
  }

  private kamikazeBlast(e: Enemy) {
    e.dead = true;
    const p = this.player;
    this.fx("ring", e.x, e.y, 70, 0.35, "#ef4444");
    this.fx("flash", e.x, e.y, 90, 0.2, "#f97316");
    this.burst(e.x, e.y, 14, 220, "#f97316", 0.45, 3);
    audio.play("explode");
    const dx = p.x - e.x;
    const dy = p.y - e.y;
    if (dx * dx + dy * dy < 75 * 75) this.hurtPlayer(e.damage);
  }

  private enemyShoot(x: number, y: number, a: number, speed: number, dmg: number, color: string) {
    if (this.ebullets.length >= MAX_EBULLETS) return;
    const sp = speed * BULLET_SPEED_MUL;
    this.ebullets.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 7, damage: dmg * BULLET_DMG_MUL, life: 9, sprite: getOrbSprite(color, 6), dead: false });
  }

  // кольцо пуль поредело: между пулями всегда есть щель, в которую проходит корабль
  private enemyRing(x: number, y: number, n: number, speed: number, dmg: number, offset: number, color: string) {
    const m = Math.max(4, Math.round(n * BULLET_COUNT_MUL));
    for (let i = 0; i < m; i++) this.enemyShoot(x, y, offset + (i / m) * TAU, speed, dmg, color);
  }

  private updateEnemyBullets(dt: number) {
    if (this.freezeTimer > 0) return;
    const p = this.player;
    for (const b of this.ebullets) {
      if (b.dead) continue;
      b.life -= dt;
      if (b.life <= 0) {
        b.dead = true;
        continue;
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      const dx = b.x - p.x;
      const dy = b.y - p.y;
      const rr = b.r + p.r * 0.75;
      if (dx * dx + dy * dy < rr * rr && this.hurtPlayer(b.damage)) {
        b.dead = true;
        this.burst(b.x, b.y, 6, 120, "#f472b6", 0.3, 2);
      }
    }
  }

  private separate() {
    for (const e of this.enemies) {
      if (e.dead || e.def.kind === "crate" || e.def.kind === "nest" || e.radius > BIG_R) continue;
      const cx = Math.floor(e.x / CELL);
      const cy = Math.floor(e.y / CELL);
      for (let ix = cx - 1; ix <= cx + 1; ix++) {
        for (let iy = cy - 1; iy <= cy + 1; iy++) {
          const arr = this.grid.get(gkey(ix, iy));
          if (!arr) continue;
          for (let k = 0; k < arr.length; k++) {
            const o = arr[k];
            if (o.id <= e.id || o.dead || o.def.kind === "crate" || o.def.kind === "nest") continue;
            const dx = o.x - e.x;
            const dy = o.y - e.y;
            const rr = (o.radius + e.radius) * 0.85;
            const d2 = dx * dx + dy * dy;
            if (d2 < rr * rr && d2 > 0.0001) {
              const d = Math.sqrt(d2);
              const push = (rr - d) * 0.35;
              const nx = dx / d;
              const ny = dy / d;
              e.x -= nx * push;
              e.y -= ny * push;
              o.x += nx * push;
              o.y += ny * push;
            }
          }
        }
      }
    }
    for (const b of this.big) {
      if (b.dead) continue;
      this.forEachNear(b.x, b.y, b.radius, (o) => {
        if (o === b || o.boss || o.def.kind === "crate" || o.def.kind === "nest") return;
        const dx = o.x - b.x;
        const dy = o.y - b.y;
        const d = Math.hypot(dx, dy) || 1;
        const rr = b.radius + o.radius;
        if (d < rr) {
          const push = (rr - d) * 0.5;
          o.x += (dx / d) * push;
          o.y += (dy / d) * push;
        }
      });
    }
  }

  // src: слот оружия; -1 — без оружия; -3 — разряд «Перегрузки сети» (засчитывается тесле, но не запускает новую цепь)
  private damageEnemy(e: Enemy, dmg: number, src: number, kx: number, ky: number, kb: number, forceCrit = false) {
    if (e.dead || e.shield > 0) return;
    let d = dmg * (0.9 + Math.random() * 0.2) * this.dynMul;
    const ww = src >= 0 ? this.weapons[src] : undefined;
    // крит: удача + «Оптика» + мод «Прицельный»
    const crit = forceCrit || Math.random() < 0.05 * this.stats.luck + this.stats.crit + (ww ? 0.15 * this.modCount(ww, "wm_crit") : 0);
    if (crit) d *= 2;
    // «Метка смерти»: меченые получают больше урона от остального оружия (у Ворона — +75%)
    if (e.burnT > 0 && src !== e.burnSrc) {
      const bw = this.weapons[e.burnSrc];
      d *= this.character.id === "raven" && bw && this.isSignature(bw) ? 1.75 : 1.5;
    }
    if (e.frozenT > 0) d *= 1.3;
    if (e.elite || e.boss) {
      d *= 1 + this.stats.bossDmg;
      // броня элиток и боссов: «Бронебой», мод «Бронебойный», заморозка «Абсолютного нуля» её пробивают
      const iceBreak = e.frozenT > 0 && this.weapons.some((x) => x.def.id === "cryo_evo");
      const pen = this.stats.armorPen + (ww ? 3 * this.modCount(ww, "wm_pierce") : 0);
      const armor = iceBreak ? 0 : Math.max(0, e.armor - pen);
      d = Math.max(d * ARMOR_MIN_HIT, d - armor);
    }
    e.hp -= d;
    e.flash = 0.08;
    e.lastSrc = src;
    const w = src >= 0 ? this.weapons[src] : src === -3 ? this.weapons.find((x) => (x.def.evolvedFrom || x.def.id) === "tesla") : undefined;
    if (w) w.damage += d;
    if (kb > 0 && e.def.kbResist < 1) {
      const f = kb * 55 * (1 - e.def.kbResist) * (e.elite ? 0.35 : 1);
      e.kx += kx * f;
      e.ky += ky * f;
      const m = Math.abs(e.kx) + Math.abs(e.ky);
      if (m > 420) {
        e.kx *= 420 / m;
        e.ky *= 420 / m;
      }
    }
    if (ww && !this.dmgColor && this.particles.length < 480 && Math.random() < 0.55) this.sparks(e.x, e.y, crit ? 5 : 2, crit ? "#fde047" : ww.def.color, crit ? 300 : 200);
    if (this.settings.damageNumbers) this.addText(e.x + rand(-8, 8), e.y - e.radius * 0.6, String(Math.round(d)), crit ? "#fde047" : this.dmgColor || "#ffffff", crit);
    if (e.hp <= 0) this.killEnemy(e);
    else audio.play("hit");
  }

  private killEnemy(e: Enemy) {
    if (e.dead) return;
    e.dead = true;
    const kind = e.def.kind;
    const n = Math.min(18, 5 + Math.floor((e.radius * e.scale) / 3));
    this.burst(e.x, e.y, n, 150 + e.radius * 3, e.def.color, 0.5, 3);
    if (kind === "crate") {
      const r = Math.random() * 100;
      const k: PickupKind = r < 35 ? "medkit" : r < 60 ? "bigcoin" : r < 75 ? "magnet" : r < 88 ? "freeze" : "bomb";
      this.spawnPickup(e.x, e.y, k);
      return;
    }
    this.kills++;
    if (e.xp > 0) this.spawnGem(e.x, e.y, e.xp);
    if (e.elite && !e.boss) this.elitesKilled++;
    if (e.burnT > 0) this.brandDeath(e);
    if (e.frozenT > 0) this.shatter(e);
    if (kind === "nest") {
      if (Math.random() < this.planet.frag.nest) this.gainFragments(1, e.x, e.y);
      this.spawnPickup(e.x, e.y, Math.random() < 0.3 ? "chest" : "bigcoin");
      this.fx("ring", e.x, e.y, 140, 0.5, e.def.color);
      audio.play("explode");
      return;
    }
    const luck = this.stats.luck;
    if (e.boss) {
      this.bossesKilled++;
      if (this.planet.frag.boss) this.gainFragments(this.planet.frag.boss, e.x, e.y - 30);
      this.spawnPickup(e.x, e.y, "chest");
      for (let i = 0; i < 6; i++) this.spawnPickup(e.x + rand(-60, 60), e.y + rand(-60, 60), "bigcoin");
      this.fx("ring", e.x, e.y, 320, 0.8, e.def.color);
      this.fx("flash", e.x, e.y, 260, 0.5, "#ffffff");
      this.burst(e.x, e.y, 50, 420, e.def.color, 1, 4);
      this.addShake(12);
      this.flashScreen = 0.45;
      audio.play("explode");
      audio.intensity = 1;
      this.dropModule();
      // первый убитый босс открывает выбор протокола — одного перка-правила на весь забег
      if (!this.protocolOffered && e.def.id !== this.planet.finalBoss) {
        this.protocolOffered = true;
        this.protocolT = 1.4;
      }
      if (e.def.id === this.planet.finalBoss && !this.endless && !this.victoryPending) this.triggerVictory(e.def.name);
      else this.showBanner("БОСС ПОВЕРЖЕН", `${e.def.name} · контейнер с трофеями сброшен`, "#4ade80", 2.6);
    } else if (e.elite) {
      if (Math.random() < this.planet.frag.elite) this.gainFragments(1, e.x, e.y - 20);
      this.spawnPickup(e.x, e.y, "chest");
      this.spawnPickup(e.x + rand(-30, 30), e.y + rand(-30, 30), "bigcoin");
      this.fx("ring", e.x, e.y, 120, 0.5, "#fbbf24");
      audio.play("explode");
    } else {
      if (this.planet.split > 0 && e.def.id !== "larva" && Math.random() < this.planet.split) {
        for (let k = 0; k < 2; k++) this.spawnEnemy("larva", e.x + rand(-12, 12), e.y + rand(-12, 12));
      }
      if (Math.random() < 0.025 * luck) this.spawnPickup(e.x, e.y, "coin");
      else if (this.medTokens >= 1 && Math.random() < 0.004 * luck) {
        this.medTokens--;
        this.spawnPickup(e.x, e.y, "medkit");
      } else if (Math.random() < 0.0012 * luck) this.spawnPickup(e.x, e.y, "magnet");
      else if (this.rareTokens >= 1 && Math.random() < 0.0009 * luck) {
        this.rareTokens--;
        this.spawnPickup(e.x, e.y, Math.random() < 0.5 ? "bomb" : "freeze");
      }
    }
  }

  private gainFragments(n: number, x: number, y: number) {
    this.fragments += n;
    this.addText(x, y, `+${n} ◆`, "#c084fc", true);
  }

  private dropModule() {
    if (Math.random() >= this.planet.moduleChance) return;
    const m = rollModule(this.planet.id);
    const r = RARITY[m.rarity];
    if (this.owned.has(m.id)) {
      this.fragments += r.dupFragments;
      this.modulesFound.push({ id: m.id, dup: true, frags: r.dupFragments });
      this.showBanner("ДУБЛИКАТ МОДУЛЯ", `${m.name} разобран на ${r.dupFragments} фрагментов`, r.color, 2.6);
    } else {
      this.owned.add(m.id);
      this.modulesFound.push({ id: m.id, dup: false, frags: 0 });
      this.showBanner("НОВЫЙ МОДУЛЬ!", `${m.name} · ${r.name.toLowerCase()} · ждёт в ангаре`, r.color, 3);
    }
    audio.play("evolve");
  }

  private triggerVictory(name: string) {
    this.victoryTimer = 3.2;
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.dead = true;
      this.burst(e.x, e.y, 5, 150, e.def.color, 0.5, 3);
    }
    for (const b of this.ebullets) b.dead = true;
    for (const v of this.voids) v.dead = true;
    this.flashScreen = 1;
    this.addShake(14);
    this.showBanner("ЦЕЛЬ УНИЧТОЖЕНА", `${name} · эвакуационный шаттл на подлёте...`, "#4ade80", 3.2);
    audio.play("evolve");
  }

  // ------------------------------------------------------------
  //  Предметы
  // ------------------------------------------------------------
  private spawnGem(x: number, y: number, v: number) {
    if (this.gems.length >= 360) {
      const g = this.gems[(Math.random() * this.gems.length) | 0];
      if (g && !g.dead) {
        g.value += v;
        g.tier = gemTier(g.value);
        return;
      }
    }
    this.gems.push({ x, y, value: v, tier: gemTier(v), mag: false, spd: 0, dead: false });
  }

  private spawnPickup(x: number, y: number, kind: PickupKind) {
    this.pickups.push({ x, y, kind, mag: false, spd: 0, bob: Math.random() * 6, dead: false });
  }

  private updateGems(dt: number) {
    const p = this.player;
    const mr = PLAYER_BASE_MAGNET * this.stats.magnet;
    const mr2 = mr * mr;
    for (const g of this.gems) {
      if (g.dead) continue;
      const dx = p.x - g.x;
      const dy = p.y - g.y;
      const d2 = dx * dx + dy * dy;
      if (!g.mag) {
        if (d2 < mr2) {
          g.mag = true;
          g.spd = -140;
        } else continue;
      }
      g.spd = Math.min(g.spd + 1600 * dt, 1200);
      const d = Math.sqrt(d2) || 1;
      const step = Math.min(g.spd * dt, d);
      g.x += (dx / d) * step;
      g.y += (dy / d) * step;
      if (d < p.r + 10) {
        g.dead = true;
        this.addXp(g.value);
        audio.play("gem");
      }
    }
    const pr = mr * 0.7;
    const pr2 = pr * pr;
    for (const pk of this.pickups) {
      if (this.modal) break;
      if (pk.dead) continue;
      const dx = p.x - pk.x;
      const dy = p.y - pk.y;
      const d2 = dx * dx + dy * dy;
      if (!pk.mag) {
        const grab = pk.kind === "chest" ? 34 * 34 : pr2;
        if (d2 < grab) {
          pk.mag = true;
          pk.spd = 60;
        } else continue;
      }
      pk.spd = Math.min(pk.spd + 1200 * dt, 900);
      const d = Math.sqrt(d2) || 1;
      const step = Math.min(pk.spd * dt, d);
      pk.x += (dx / d) * step;
      pk.y += (dy / d) * step;
      if (d < p.r + 12) {
        pk.dead = true;
        this.collectPickup(pk.kind, pk.x, pk.y);
      }
    }
  }

  // кредиты в бою: удача-жадность, планета, «Жадный контракт», бесконечный режим
  private creditMul() {
    return this.stats.greed * this.planet.rewardMul * (this.has("rule_greed") ? 1.5 : 1) * this.endlessMul();
  }

  private addXp(v: number) {
    this.xp += v * this.stats.growth * this.planet.xpMul * (this.has("rule_greed") ? 1.5 : 1);
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.level++;
      if (this.buildComplete()) {
        // после полной прокачки каждый следующий уровень дороже на 12% — сверхулучшения идут всё реже
        this.superLevels++;
        this.xpNext = Math.round(xpToNext(this.level) * Math.pow(SUPER_XP_GROWTH, this.superLevels));
      } else {
        this.xpNext = xpToNext(this.level);
      }
      this.pendingLevels++;
    }
  }

  private collectPickup(kind: PickupKind, x: number, y: number) {
    switch (kind) {
      case "medkit":
        this.heal(30);
        audio.play("pickup");
        break;
      case "magnet":
        for (const g of this.gems) {
          g.mag = true;
          if (g.spd < 250) g.spd = 250;
        }
        this.addText(x, y - 14, "МАГНИТ", "#c4b5fd");
        audio.play("pickup");
        break;
      case "bomb":
        this.bomb();
        break;
      case "freeze":
        this.freezeTimer = 6 * this.stats.duration;
        this.showBanner("ХРОНОСТАЗИС", "Время для врагов остановлено", "#7dd3fc", 1.8);
        audio.play("warp");
        break;
      case "chest":
        this.openChest();
        break;
      case "coin":
        this.runCredits += this.creditMul();
        audio.play("gem");
        break;
      case "bigcoin":
        this.runCredits += 10 * this.creditMul();
        this.addText(x, y - 14, `+${Math.round(10 * this.creditMul())} ◈`, "#facc15");
        audio.play("pickup");
        break;
    }
  }

  private bomb() {
    const p = this.player;
    for (const e of this.enemies) {
      if (e.dead || e.def.kind === "crate") continue;
      if (Math.abs(e.x - p.x) > this.viewHW + 60 || Math.abs(e.y - p.y) > this.viewHH + 60) continue;
      if (e.boss) this.damageEnemy(e, e.maxHp * 0.05 + 400 * this.stats.might, -1, 0, 0, 0);
      else if (e.elite) this.damageEnemy(e, e.maxHp * 0.5, -1, 0, 0, 0);
      else this.killEnemy(e);
    }
    for (const b of this.ebullets) b.dead = true;
    this.flashScreen = 0.6;
    this.addShake(10);
    this.fx("ring", p.x, p.y, Math.max(this.viewHW, this.viewHH), 0.55, "#f97316");
    audio.play("warp");
    audio.play("explode");
  }

  // ------------------------------------------------------------
  //  Улучшения
  // ------------------------------------------------------------
  private openLevelUp() {
    this.modal = "levelup";
    audio.play("levelup");
    this.emitHud();
    this.cb.onLevelUp(this.buildOptions(), this.levelMeta());
  }

  private weaponOption(def: WeaponDef, level: number, isNew: boolean): UpgradeOption {
    const pas = def.evolveWith ? PASSIVES[def.evolveWith] : null;
    return {
      kind: "weapon",
      id: def.id,
      name: def.name,
      color: def.color,
      level,
      isNew,
      desc: isNew ? def.desc : def.levels[level - 2]?.text || "",
      hint: pas ? `Эволюция: макс. уровень + «${pas.name}»` : undefined,
    };
  }

  private passiveOption(def: PassiveDef, level: number, isNew: boolean): UpgradeOption {
    const evoW = this.weapons.find((w) => !w.def.evolved && w.def.evolveWith === def.id);
    return {
      kind: "passive",
      id: def.id,
      name: def.name,
      color: def.color,
      level,
      isNew,
      desc: def.desc,
      hint: evoW ? `Нужен для эволюции: ${evoW.def.name}` : undefined,
    };
  }

  // всё оружие и все системы на пределе — дальше только сверхулучшения
  private buildComplete(): boolean {
    for (const w of this.weapons) if (!w.def.evolved && w.level < weaponMaxLevel(w.def)) return false;
    if (this.weapons.length < this.maxWeapons()) return false;
    for (const p of this.passives) if (p.level < p.def.maxLevel) return false;
    return this.passives.length >= this.maxPassivesN;
  }

  private perkOption(id: string): UpgradeOption {
    const d = perkDef(id)!;
    return { kind: "perk", id, name: d.name, color: d.color, level: 0, isNew: true, desc: d.desc, perkType: "rule" };
  }

  // «Монолит»: единственная пушка качается выше максимума
  private overOption(w: WeaponInst): UpgradeOption {
    return { kind: "weapon", id: w.def.id, name: w.def.name, color: w.def.color, level: weaponMaxLevel(w.def) + w.over + 1, isNew: false, desc: "Перегрузка ствола: урон +15%", hint: "Монолит: качается выше максимума" };
  }

  private buildOptions(): UpgradeOption[] {
    const pool: { o: UpgradeOption; w: number }[] = [];
    const ownedW = new Set(this.weapons.map((w) => w.def.evolvedFrom || w.def.id));
    const maxW = this.maxWeapons();
    for (const w of this.weapons) {
      if (!w.def.evolved && w.level < weaponMaxLevel(w.def)) pool.push({ o: this.weaponOption(w.def, w.level + 1, false), w: 1.3 });
      else if (this.has("rule_monolith")) pool.push({ o: this.overOption(w), w: 1.3 });
    }
    if (this.weapons.length < maxW) {
      for (const id of BASE_WEAPON_IDS) if (!ownedW.has(id)) pool.push({ o: this.weaponOption(WEAPONS[id], 1, true), w: 0.85 });
    }
    // моды оружия (контент коллеги): для пушки на пределе или эволюционировавшей, до 3 на пушку
    for (const w of this.weapons) {
      if (w.mods.length >= MAX_WEAPON_MODS || (!w.def.evolved && w.level < weaponMaxLevel(w.def))) continue;
      const free = WEAPON_MODS.filter((m) => !w.mods.includes(m.id));
      const m = free[(Math.random() * free.length) | 0];
      if (m) pool.push({ o: { kind: "wmod", id: w.def.id, modId: m.id, slot: w.slot, name: `${w.def.name}: ${m.name}`, color: m.color, level: w.mods.length + 1, isNew: false, desc: m.desc }, w: 0.9 });
    }
    for (const p of this.passives) {
      if (p.level < p.def.maxLevel) pool.push({ o: this.passiveOption(p.def, p.level + 1, false), w: 1 });
    }
    if (this.passives.length < this.maxPassivesN) {
      for (const id of PASSIVE_IDS) {
        if (!this.passives.some((p) => p.def.id === id)) pool.push({ o: this.passiveOption(PASSIVES[id], 1, true), w: 0.75 });
      }
    }
    const count = this.stats.luck >= 1.25 ? 4 : 3;
    const out: UpgradeOption[] = [];
    while (out.length < count && pool.length) {
      let total = 0;
      for (const it of pool) total += it.w;
      let r = Math.random() * total;
      let idx = 0;
      for (; idx < pool.length - 1; idx++) {
        r -= pool[idx].w;
        if (r <= 0) break;
      }
      out.push(pool[idx].o);
      pool.splice(idx, 1);
    }
    if (!out.length) {
      // всё прокачано до предела — бесконечные сверхулучшения
      // перезарядку на пределе не предлагаем — она бы ничего не дала
      const ids = Object.keys(SUPERS).filter((id) => !(SUPERS[id].stat === "cooldown" && this.stats.cooldown <= 0.351));
      while (out.length < count - 1 && ids.length) {
        const sd = SUPERS[ids.splice((Math.random() * ids.length) | 0, 1)[0]];
        const n = this.supers[sd.id] || 0;
        const v = superValue(sd, n);
        const flat = sd.stat === "maxHp" || sd.stat === "armor";
        const vt = flat ? (Math.round(Math.abs(v) * 10) / 10).toString() : (Math.round(Math.abs(v) * 1000) / 10).toString() + "%";
        out.push({ kind: "super", id: sd.id, name: sd.name, color: sd.color, level: n + 1, isNew: false, desc: `${v < 0 ? "−" : "+"}${vt} ${sd.desc} (каждое следующее слабее)` });
      }
      out.push({ kind: "heal", id: "heal", name: "Нано-аптечка", color: "#4ade80", level: 0, isNew: false, desc: "Восстанавливает 40 ОЗ" });
    }
    return out;
  }

  private applyOption(o: UpgradeOption) {
    if (o.kind === "perk") {
      this.applyPerk(o.id);
    } else if (o.kind === "weapon") {
      const w = this.weapons.find((x) => x.def.id === o.id);
      if (w) {
        if (!w.def.evolved && w.level < weaponMaxLevel(w.def)) {
          w.level++;
          w.stats = weaponStatsAt(w.def, w.level);
        } else if (this.has("rule_monolith")) w.over++;
      } else if (this.weapons.length < this.maxWeapons()) {
        this.addWeapon(o.id);
      }
    } else if (o.kind === "passive") {
      const p = this.passives.find((x) => x.def.id === o.id);
      if (p) p.level = Math.min(p.def.maxLevel, p.level + 1);
      else if (this.passives.length < this.maxPassivesN) this.passives.push({ def: PASSIVES[o.id], level: 1 });
      const prevMax = this.stats.maxHp;
      this.recomputeStats();
      if (this.stats.maxHp > prevMax) this.player.hp += this.stats.maxHp - prevMax;
    } else if (o.kind === "wmod") {
      const w = o.slot !== undefined ? this.weapons[o.slot] : undefined;
      if (w && o.modId && w.mods.length < MAX_WEAPON_MODS && !w.mods.includes(o.modId)) w.mods.push(o.modId);
    } else if (o.kind === "super") {
      this.supers[o.id] = (this.supers[o.id] || 0) + 1;
      const prevMax = this.stats.maxHp;
      this.recomputeStats();
      if (this.stats.maxHp > prevMax) this.player.hp += this.stats.maxHp - prevMax;
    } else if (o.kind === "heal") {
      this.heal(40);
    } else if (o.kind === "credits") {
      this.runCredits += 30 * this.planet.rewardMul;
    }
  }

  private recomputeStats() {
    const s: PlayerStats = { ...this.baseStats };
    for (const p of this.passives) s[p.def.stat] += p.def.perLevel * p.level;
    for (const [id, n] of Object.entries(this.supers)) if (SUPERS[id]) s[SUPERS[id].stat] += superTotal(SUPERS[id], n);
    // перки-правила, которые меняют характеристики множителем
    if (this.has("rule_glass")) {
      s.might *= 1.8;
      s.maxHp *= 0.5;
    }
    if (this.has("rule_magnet")) {
      s.magnet *= 3;
      s.speed *= 0.8;
    }
    s.cooldown = Math.max(0.35, s.cooldown);
    s.area = effectiveArea(s.area);
    this.stats = s;
    this.player.hp = Math.min(this.player.hp, s.maxHp);
  }

  private openChest() {
    const items: ChestItem[] = [];
    const evoW = this.weapons.find(
      (w) => !w.def.evolved && w.def.evolvesInto && w.level >= weaponMaxLevel(w.def) && this.passives.some((p) => p.def.id === w.def.evolveWith),
    );
    if (evoW && evoW.def.evolvesInto) {
      const nd = WEAPONS[evoW.def.evolvesInto];
      this.weapons[evoW.slot] = this.makeWeapon(nd, evoW.slot, evoW.damage, evoW.since);
      this.weapons[evoW.slot].mods = evoW.mods;
      this.acquired.add(nd.id);
      items.push({ kind: "evolution", id: nd.id, name: nd.name, color: nd.color, text: `${evoW.def.name} → ${nd.name}` });
      const p = this.player;
      this.fx("ring", p.x, p.y, 260, 0.7, nd.color);
      this.burst(p.x, p.y, 40, 320, nd.color, 0.8, 3);
      audio.play("evolve");
    } else if (!this.awakened && this.time >= AWAKEN_MIN_TIME && this.weapons.some((w) => w.def.evolved && this.isSignature(w))) {
      // пробуждение пилота (столп 10): родная пушка уже эволюционировала — следующий контейнер её пробуждает
      this.awakened = true;
      const w = this.weapons.find((x) => x.def.evolved && this.isSignature(x))!;
      const ch = this.character;
      items.push({ kind: "evolution", id: w.def.id, name: `Пробуждение: ${ch.awakenName}`, color: ch.color, text: ch.awakenText });
      const p = this.player;
      this.fx("ring", p.x, p.y, 300, 0.8, ch.color);
      this.burst(p.x, p.y, 50, 340, ch.color, 0.9, 3);
      audio.play("evolve");
    } else {
      const roll = Math.random() * this.stats.luck;
      const n = roll > 0.95 ? 5 : roll > 0.7 ? 3 : 1;
      for (let i = 0; i < n; i++) {
        const ups: UpgradeOption[] = [];
        for (const w of this.weapons) if (!w.def.evolved && w.level < weaponMaxLevel(w.def)) ups.push(this.weaponOption(w.def, w.level + 1, false));
        for (const p of this.passives) if (p.level < p.def.maxLevel) ups.push(this.passiveOption(p.def, p.level + 1, false));
        if (!ups.length) break;
        const o = ups[(Math.random() * ups.length) | 0];
        this.applyOption(o);
        items.push({ kind: o.kind, id: o.id, name: o.name, color: o.color, text: `Ур. ${o.level}: ${o.desc}` });
      }
      if (!items.length) {
        this.heal(40);
        items.push({ kind: "heal", id: "heal", name: "Нано-аптечка", color: "#4ade80", text: "+40 ОЗ" });
      }
      audio.play("chest");
    }
    const credits = Math.round(rand(15, 40) * this.creditMul());
    this.runCredits += credits;
    this.modal = "chest";
    this.emitHud();
    const evo = items.find((x) => x.kind === "evolution");
    const tier: ChestTier = evo ? (evo.name.startsWith("Пробуждение") ? "awaken" : "evolution") : items.length >= 5 ? "legendary" : items.length >= 3 ? "rare" : "common";
    this.cb.onChest({ items, credits, tier, again: this.adChests });
  }

  // ------------------------------------------------------------
  //  Эффекты
  // ------------------------------------------------------------
  private fx(kind: EffectKind, x: number, y: number, r: number, life: number, color: string): Effect {
    const f: Effect = { kind, x, y, x2: 0, y2: 0, r, life, max: life, color, width: 0, side: 1, pts: null };
    if (this.effects.length < MAX_EFFECTS || kind === "beam" || kind === "lightning" || kind === "slash") this.effects.push(f);
    return f;
  }

  private particle(x: number, y: number, vx: number, vy: number, life: number, size: number, color: string, streak = false) {
    if (this.particles.length >= MAX_PARTICLES) return;
    this.particles.push({ x, y, vx, vy, life, max: life, size, color, streak });
  }

  // искры-чёрточки (Неон 2.0): веером вокруг направления или во все стороны
  private sparks(x: number, y: number, n: number, color: string, speed: number, dir?: number, spread = Math.PI) {
    for (let i = 0; i < n; i++) {
      const a = dir === undefined ? Math.random() * TAU : dir + rand(-spread, spread);
      const v = speed * rand(0.5, 1.1);
      this.particle(x, y, Math.cos(a) * v, Math.sin(a) * v, rand(0.18, 0.35), rand(1.4, 2.4), color, true);
    }
  }

  private burst(x: number, y: number, n: number, speed: number, color: string, life: number, size: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const s = speed * rand(0.25, 1);
      this.particle(x, y, Math.cos(a) * s, Math.sin(a) * s, life * rand(0.6, 1.2), size * rand(0.6, 1.3), color);
    }
  }

  private addText(x: number, y: number, text: string, color: string, crit = false) {
    if (this.texts.length >= MAX_TEXTS) {
      if (!crit) return;
      this.texts.shift();
    }
    this.texts.push({ x, y, text, color, crit, life: crit ? 0.9 : 0.6, vy: crit ? -55 : -40 });
  }

  private showBanner(text: string, sub: string, color: string, life: number) {
    this.banner = { text, sub, color, life, max: life };
  }

  private addShake(v: number) {
    if (!this.settings.screenShake) return;
    this.shake = Math.min(14, Math.max(this.shake, v));
  }

  private updateFx(dt: number) {
    const ps = this.particles;
    const f = Math.exp(-3 * dt);
    let j = 0;
    for (let i = 0; i < ps.length; i++) {
      const q = ps[i];
      q.life -= dt;
      if (q.life <= 0) continue;
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.vx *= f;
      q.vy *= f;
      ps[j++] = q;
    }
    ps.length = j;

    const ts = this.texts;
    j = 0;
    for (let i = 0; i < ts.length; i++) {
      const t = ts[i];
      t.life -= dt;
      if (t.life <= 0) continue;
      t.y += t.vy * dt;
      ts[j++] = t;
    }
    ts.length = j;

    const es = this.effects;
    j = 0;
    for (let i = 0; i < es.length; i++) {
      const e = es[i];
      e.life -= dt;
      if (e.life <= 0) continue;
      es[j++] = e;
    }
    es.length = j;

    if (this.banner) {
      this.banner.life -= dt;
      if (this.banner.life <= 0) this.banner = null;
    }
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 30);
    if (this.flashScreen > 0) this.flashScreen = Math.max(0, this.flashScreen - dt * 1.6);
  }

  // ------------------------------------------------------------
  //  HUD / результат
  // ------------------------------------------------------------
  private hudWeapons(): HudItem[] {
    return this.weapons.map((w) => {
      const max = weaponMaxLevel(w.def);
      const ready = !w.def.evolved && w.level >= max && this.passives.some((p) => p.def.id === w.def.evolveWith);
      return { id: w.def.id, level: w.level, max, evolved: !!w.def.evolved, ready };
    });
  }

  private hudPassives(): HudItem[] {
    return this.passives.map((p) => ({ id: p.def.id, level: p.level, max: p.def.maxLevel }));
  }

  private emitHud() {
    let boss: Enemy | null = null;
    for (const e of this.enemies) {
      if (e.boss && !e.dead) {
        boss = e;
        break;
      }
    }
    this.cb.onHud({
      hp: this.player.hp,
      maxHp: this.stats.maxHp,
      xp: this.xp,
      xpNext: this.xpNext,
      level: this.level,
      time: this.time,
      kills: this.kills,
      credits: Math.floor(this.runCredits),
      weapons: this.hudWeapons(),
      passives: this.hudPassives(),
      boss: boss ? { name: boss.def.name, hp: boss.hp, maxHp: boss.maxHp, color: boss.def.color } : null,
      freeze: this.freezeTimer,
      revivals: this.revivals,
      duration: this.planet.duration,
      blizzard: Math.max(0, this.blizzard),
      fragments: this.fragments,
      repulsor: this.mods.mod_repulsor ? 1 - Math.max(0, this.repulsorT) / repulsorCd(this.mods.mod_repulsor) : -1,
      shield: this.mods.mod_shield ? 1 - Math.max(0, this.shieldCd) / (14 - 1.5 * (this.mods.mod_shield - 1)) : -1,
      barrier: this.barrier,
      maxWeapons: this.maxWeapons(),
      maxPassives: this.maxPassivesN,
      perks: Array.from(this.perks),
      endless: this.endless
        ? { time: this.endlessTime(), mul: this.endlessMul(), level: this.endlessLevel, next: (this.endlessTime() % ENDLESS_STEP) / ENDLESS_STEP }
        : null,
      still: this.stillT > 0.4,
    });
  }

  private finish(victory: boolean) {
    if (this.over) return;
    this.over = true;
    // в бесконечном режиме победа уже засчитана: смерть ничего не отнимает
    const win = victory || this.endless;
    const survivalBonus = this.survivalBonus();
    const victoryBonus = win ? this.planet.victoryBonus : 0;
    const endlessTime = this.endless ? this.time - this.endlessStart : 0;
    const endlessMul = this.endless ? this.endlessMul() : 1;
    // награда за бесконечный режим: за каждую минуту, растёт вместе с множителем
    const endlessBonus = this.endless ? Math.round((endlessTime / 60) * 40 * this.planet.rewardMul * endlessMul) : 0;
    const collected = Math.floor(this.runCredits);
    const t = this.time;
    this.emitHud();
    this.cb.onGameOver({
      victory: win,
      time: t,
      kills: this.kills,
      level: this.level,
      credits: collected + survivalBonus + victoryBonus + endlessBonus,
      creditsCollected: collected,
      survivalBonus,
      victoryBonus,
      weapons: this.weapons.map((w) => ({ id: w.def.id, level: w.level, damage: Math.round(w.damage), dps: w.damage / Math.max(1, t - w.since) })),
      passives: this.hudPassives(),
      characterId: this.character.id,
      damageTaken: Math.round(this.damageTaken),
      bossesKilled: this.bossesKilled,
      elitesKilled: this.elitesKilled,
      baseStay: this.planet.base > 0 ? this.baseStay : 0,
      discovered: Array.from(this.acquired),
      planetId: this.planet.id,
      fragments: this.fragments,
      modulesFound: this.modulesFound,
      perks: Array.from(this.perks),
      endlessTime,
      endlessMul,
      endlessBonus,
      adRevived: this.adRevived,
    });
  }

  // ------------------------------------------------------------
  //  Рендер
  // ------------------------------------------------------------
  private makeVignette(rgb: string, a: number) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(128, 128, 70, 128, 128, 182);
    grd.addColorStop(0, `rgba(${rgb},0)`);
    grd.addColorStop(1, `rgba(${rgb},${a})`);
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    return c;
  }

  private makeFog() {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(256, 256, 0, 256, 256, 256);
    grd.addColorStop(0, "rgba(225,240,255,0)");
    grd.addColorStop(0.3, "rgba(225,240,255,0.04)");
    grd.addColorStop(0.55, "rgba(205,228,250,0.78)");
    grd.addColorStop(1, "rgba(195,222,248,0.95)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 512, 512);
    return c;
  }

  private snow() {
    const p = this.player;
    for (let i = 0; i < 4; i++) {
      this.particle(p.x + rand(-this.viewHW, this.viewHW), p.y + rand(-this.viewHH, this.viewHH), rand(-170, -100), rand(120, 210), 1.1, 2.5, "#e0f2fe");
    }
  }

  private drawMinimap() {
    const ctx = this.ctx;
    const W = this.w;
    const H = this.h;
    const p = this.player;
    const a = this.planet.arena;
    const S = W < 640 ? 92 : 128;
    const x0 = W - S - 12;
    const y0 = H - S - 12;
    const sc = S / (2 * a.size);
    const mx = (x: number) => x0 + S / 2 + x * sc;
    const my = (y: number) => y0 + S / 2 + y * sc;
    ctx.save();
    ctx.fillStyle = "rgba(4,7,18,0.74)";
    ctx.strokeStyle = hexToRgba(this.planet.color, 0.6);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (a.shape === "circle") ctx.arc(x0 + S / 2, y0 + S / 2, S / 2, 0, TAU);
    else ctx.rect(x0, y0, S, S);
    ctx.fill();
    ctx.stroke();
    ctx.clip();
    if (this.planet.base > 0) {
      ctx.fillStyle = hexToRgba(this.planet.color, 0.3);
      ctx.beginPath();
      ctx.arc(mx(0), my(0), Math.max(3, this.planet.base * sc), 0, TAU);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(mx(p.x - this.viewHW), my(p.y - this.viewHH), this.viewHW * 2 * sc, this.viewHH * 2 * sc);
    const hide = this.blizzard > 0 && !this.mods.mod_scanner;
    if (!hide) {
      ctx.fillStyle = "rgba(244,63,94,0.7)";
      for (const e of this.enemies) {
        if (e.dead || e.boss || e.elite || e.def.kind === "crate" || e.def.kind === "nest") continue;
        ctx.fillRect(mx(e.x) - 1, my(e.y) - 1, 2, 2);
      }
    }
    const dot = (x: number, y: number, r: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(mx(x), my(y), r, 0, TAU);
      ctx.fill();
    };
    for (const e of this.enemies) {
      if (e.dead) continue;
      const k = e.def.kind;
      if (k === "nest") dot(e.x, e.y, 3.2, "#a3e635");
      else if (k === "crate") dot(e.x, e.y, 2.4, "#38bdf8");
      else if (e.boss) dot(e.x, e.y, 4.5, "#ef4444");
      else if (e.elite && !hide) dot(e.x, e.y, 3, "#fbbf24");
    }
    for (const pk of this.pickups) if (!pk.dead && pk.kind === "chest") dot(pk.x, pk.y, 3, "#fbbf24");
    dot(p.x, p.y, 3.2, "#ffffff");
    ctx.restore();
  }

  private render() {
    const ctx = this.ctx;
    const p = this.player;
    const z = this.zoom;
    const dpr = this.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.planet.palette.bg;
    ctx.fillRect(0, 0, this.w, this.h);
    let sx = 0;
    let sy = 0;
    if (this.shake > 0.2) {
      sx = rand(-this.shake, this.shake);
      sy = rand(-this.shake, this.shake);
    }
    const cx = p.x + sx / z;
    const cy = p.y + sy / z;
    ctx.setTransform(dpr * z, 0, 0, dpr * z, dpr * (this.w / 2 - cx * z), dpr * (this.h / 2 - cy * z));
    this.drawBackground(cx, cy);
    this.drawZones();
    this.drawVoids();
    this.drawAuras();
    this.drawPickups(cx, cy);
    this.drawEnemies(cx, cy);
    this.drawTurrets();
    if (this.dying <= 0 && !(this.over && p.hp <= 0)) this.drawPlayer();
    ctx.globalCompositeOperation = "lighter";
    this.drawOrbiters();
    this.drawProjectiles(cx, cy);
    this.drawEffects();
    this.drawParticles(cx, cy);
    this.drawEnemyBullets(cx, cy);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.drawTexts(cx, cy);
    this.drawOverlay(cx, cy);
  }

  private drawBackground(cx: number, cy: number) {
    const ctx = this.ctx;
    const hw = this.viewHW + 8;
    const hh = this.viewHH + 8;
    const x0 = cx - hw;
    const x1 = cx + hw;
    const y0 = cy - hh;
    const y1 = cy + hh;

    // декор пола (цвета и форма зависят от планеты)
    const pal = this.planet.palette;
    const [c0, c1, c2, c3] = pal.decor;
    const ds = 256;
    for (let gx = Math.floor(x0 / ds); gx <= Math.floor(x1 / ds); gx++) {
      for (let gy = Math.floor(y0 / ds); gy <= Math.floor(y1 / ds); gy++) {
        const h = hash2(gx, gy);
        if (h > 0.45) continue;
        const h2 = hash2(gx + 71, gy - 13);
        const bx = gx * ds;
        const by = gy * ds;
        if (h < 0.12) {
          const s = 70 + h2 * 60;
          ctx.fillStyle = c0 + "0.035)";
          ctx.strokeStyle = c0 + "0.16)";
          ctx.lineWidth = 2;
          if (pal.style === "tech") {
            ctx.fillRect(bx + 40, by + 40, s, s);
            ctx.strokeRect(bx + 40, by + 40, s, s);
            ctx.strokeRect(bx + 48, by + 48, s - 16, s - 16);
          } else if (pal.style === "ice") {
            // ледяная плита-шестиугольник
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const a = (i / 6) * TAU + h2;
              const px = bx + 128 + Math.cos(a) * s * 0.6;
              const py = by + 128 + Math.sin(a) * s * 0.6;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else {
            // скопление пор улья
            for (let i = 0; i < 4; i++) {
              const a = i * 1.7 + h2 * 6;
              ctx.beginPath();
              ctx.arc(bx + 128 + Math.cos(a) * 34, by + 128 + Math.sin(a) * 34, 14 + ((h2 * 10 + i * 7) % 16), 0, TAU);
              ctx.fill();
              ctx.stroke();
            }
          }
        } else if (h < 0.25) {
          ctx.strokeStyle = c1 + "0.16)";
          ctx.lineWidth = 2;
          const oy = 50 + h2 * 120;
          ctx.beginPath();
          if (pal.style === "tech") {
            ctx.moveTo(bx + 16, by + oy);
            ctx.lineTo(bx + 100, by + oy);
            ctx.lineTo(bx + 140, by + oy + 40);
            ctx.lineTo(bx + 236, by + oy + 40);
            ctx.moveTo(bx + 100, by + oy);
            ctx.lineTo(bx + 100, by + oy - 40);
            ctx.stroke();
            ctx.fillStyle = c1 + "0.4)";
            ctx.fillRect(bx + 232, by + oy + 36, 8, 8);
            ctx.fillRect(bx + 96, by + oy - 44, 8, 8);
          } else if (pal.style === "ice") {
            // трещина во льду
            ctx.moveTo(bx + 20, by + oy);
            for (let i = 1; i <= 6; i++) ctx.lineTo(bx + 20 + i * 36, by + oy + (hash2(gx * 7 + i, gy) - 0.5) * 60);
            ctx.moveTo(bx + 92, by + oy);
            ctx.lineTo(bx + 120, by + oy - 46);
            ctx.stroke();
          } else {
            // прожилка
            ctx.moveTo(bx + 10, by + oy);
            ctx.bezierCurveTo(bx + 80, by + oy - 70, bx + 160, by + oy + 70, bx + 246, by + oy);
            ctx.stroke();
            ctx.fillStyle = c1 + "0.35)";
            ctx.beginPath();
            ctx.arc(bx + 246, by + oy, 5, 0, TAU);
            ctx.fill();
          }
        } else if (h < 0.34) {
          ctx.strokeStyle = c2 + "0.12)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(bx + 128, by + 128, 60, 0, TAU);
          ctx.stroke();
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(bx + 128, by + 128, 40, 0, TAU);
          ctx.moveTo(bx + 128 - 20, by + 128);
          ctx.lineTo(bx + 128 + 20, by + 128);
          ctx.moveTo(bx + 128, by + 128 - 20);
          ctx.lineTo(bx + 128, by + 128 + 20);
          ctx.stroke();
        } else {
          ctx.fillStyle = c3 + "0.07)";
          const yy = by + 60 + h2 * 120;
          if (pal.style === "tech") {
            for (let i = 0; i < 6; i++) {
              const xx = bx + 30 + i * 30;
              ctx.beginPath();
              ctx.moveTo(xx, yy);
              ctx.lineTo(xx + 14, yy);
              ctx.lineTo(xx + 30, yy + 20);
              ctx.lineTo(xx + 16, yy + 20);
              ctx.closePath();
              ctx.fill();
            }
          } else {
            // сугробы / споры
            for (let i = 0; i < 5; i++) {
              ctx.beginPath();
              ctx.ellipse(bx + 40 + i * 40, yy + ((i * 37) % 30), pal.style === "ice" ? 30 : 9, pal.style === "ice" ? 10 : 9, 0, 0, TAU);
              ctx.fill();
            }
          }
        }
      }
    }

    // сетка
    const step = 64;
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = Math.floor(x0 / step) * step; x <= x1; x += step) {
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y1);
    }
    for (let y = Math.floor(y0 / step) * step; y <= y1; y += step) {
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
    }
    ctx.stroke();
    const big = 512;
    ctx.strokeStyle = pal.grid2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = Math.floor(x0 / big) * big; x <= x1; x += big) {
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y1);
    }
    for (let y = Math.floor(y0 / big) * big; y <= y1; y += big) {
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
    }
    ctx.stroke();
    this.drawArena(x0, y0, x1, y1);
  }

  private drawArena(x0: number, y0: number, x1: number, y1: number) {
    const ctx = this.ctx;
    const a = this.planet.arena;
    const col = this.planet.color;
    const S = a.size;
    // купол обороны в центре
    const base = this.planet.base;
    if (base > 0 && x0 < base && x1 > -base && y0 < base && y1 > -base) {
      const pulse = 0.5 + Math.sin(this.time * 2) * 0.5;
      ctx.fillStyle = hexToRgba(col, 0.05 + pulse * 0.03);
      ctx.beginPath();
      ctx.arc(0, 0, base, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = hexToRgba(col, 0.55);
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);
      ctx.lineDashOffset = this.time * 20;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = hexToRgba(col, 0.25);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const an = (i / 6) * TAU + this.time * 0.2;
        const px = Math.cos(an) * base * 0.55;
        const py = Math.sin(an) * base * 0.55;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = hexToRgba(col, 0.6);
      ctx.beginPath();
      ctx.arc(0, 0, 10 + pulse * 3, 0, TAU);
      ctx.fill();
    }
    // видна ли граница арены
    const visible =
      a.shape === "circle"
        ? Math.max(Math.hypot(x0, y0), Math.hypot(x1, y0), Math.hypot(x0, y1), Math.hypot(x1, y1)) > S
        : x0 < -S || x1 > S || y0 < -S || y1 > S;
    if (!visible) return;
    const shape = (inset: number) => {
      ctx.beginPath();
      if (a.shape === "circle") ctx.arc(0, 0, S - inset, 0, TAU);
      else ctx.rect(-S + inset, -S + inset, (S - inset) * 2, (S - inset) * 2);
    };
    // всё за стеной — тёмная пустота
    ctx.fillStyle = "rgba(0,0,0,0.66)";
    ctx.beginPath();
    ctx.rect(x0, y0, x1 - x0, y1 - y0);
    if (a.shape === "circle") ctx.arc(0, 0, S, 0, TAU);
    else ctx.rect(-S, -S, S * 2, S * 2);
    ctx.fill("evenodd");
    // энергетический забор
    ctx.strokeStyle = hexToRgba(col, 0.9);
    ctx.lineWidth = 4;
    ctx.shadowColor = col;
    ctx.shadowBlur = 14;
    ctx.setLineDash([28, 14]);
    ctx.lineDashOffset = -this.time * 40;
    shape(0);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = hexToRgba(col, 0.25);
    ctx.lineWidth = 1.5;
    shape(12);
    ctx.stroke();
  }

  private drawZones() {
    const ctx = this.ctx;
    for (const zn of this.zones) {
      if (zn.dead) continue;
      if (zn.kind === "mine") {
        // Гравимина: шестигранник с бегающим огоньком, взведённая — мигает и пульсирует
        const armed = zn.tick <= 0;
        const blink = armed && Math.floor(this.time * 4 + zn.x) % 2 === 0;
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = armed ? 0.55 : 0.25;
        ctx.drawImage(getGlow(zn.color), zn.x - 18, zn.y - 18, 36, 36);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#0b100a";
        ctx.strokeStyle = zn.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * TAU + Math.PI / 6;
          if (k) ctx.lineTo(zn.x + Math.cos(a) * 9, zn.y + Math.sin(a) * 9);
          else ctx.moveTo(zn.x + Math.cos(a) * 9, zn.y + Math.sin(a) * 9);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        const sa = this.time * 5 + zn.x;
        ctx.fillStyle = blink ? "#ffffff" : zn.color;
        ctx.beginPath();
        ctx.arc(zn.x + Math.cos(sa) * 3.5, zn.y + Math.sin(sa) * 3.5, 2.2, 0, TAU);
        ctx.fill();
        if (armed) {
          const ph = (this.time * 1.2 + zn.x * 0.01) % 1;
          ctx.strokeStyle = hexToRgba(zn.color, 0.5 * (1 - ph));
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(zn.x, zn.y, 9 + ph * 22, 0, TAU);
          ctx.stroke();
          if (zn.pull > 0) {
            ctx.strokeStyle = hexToRgba(zn.color, 0.25);
            ctx.setLineDash([4, 6]);
            ctx.beginPath();
            ctx.arc(zn.x, zn.y, zn.r * 0.9, 0, TAU);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        continue;
      }
      if (zn.kind === "puddle") {
        const t = clamp(zn.life / 0.5, 0, 1);
        ctx.fillStyle = hexToRgba(zn.color, 0.12 * t);
        ctx.strokeStyle = hexToRgba(zn.color, 0.55 * t);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(zn.x, zn.y, zn.r, 0, TAU);
        ctx.fill();
        ctx.stroke();
        if (Math.random() < 0.3) this.particle(zn.x + rand(-zn.r, zn.r) * 0.7, zn.y + rand(-zn.r, zn.r) * 0.7, 0, 0, 0.15, 2, "#ffffff");
        continue;
      }
      if (zn.kind === "marker") {
        // прицел орбитального удара: вращающиеся скобы и заполняющаяся дуга
        const t = clamp(1 - zn.life / zn.max, 0, 1);
        ctx.save();
        ctx.translate(zn.x, zn.y);
        ctx.rotate(this.time * 2);
        ctx.strokeStyle = hexToRgba(zn.color, 0.85);
        ctx.lineWidth = 2;
        for (let k = 0; k < 4; k++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.arc(0, 0, zn.r * 1.12, -0.35, 0.35);
          ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(zn.x, zn.y, zn.r * 0.55, -Math.PI / 2, -Math.PI / 2 + TAU * t);
        ctx.stroke();
        ctx.strokeStyle = hexToRgba(zn.color, 0.35 + t * 0.5);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(zn.x, zn.y, zn.r, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = hexToRgba(zn.color, 0.08 + t * 0.16);
        ctx.beginPath();
        ctx.arc(zn.x, zn.y, zn.r * t, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(zn.x - zn.r * 0.4, zn.y);
        ctx.lineTo(zn.x + zn.r * 0.4, zn.y);
        ctx.moveTo(zn.x, zn.y - zn.r * 0.4);
        ctx.lineTo(zn.x, zn.y + zn.r * 0.4);
        ctx.stroke();
        continue;
      }
      // колодец сингулярности: свечение, спиральные рукава, горизонт событий
      const fade = clamp(Math.min(zn.life * 3, (zn.max - zn.life) * 5), 0, 1);
      const s = zn.r * 1.5;
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.5 * fade;
      ctx.drawImage(getGlow(zn.color), zn.x - s, zn.y - s, s * 2, s * 2);
      ctx.globalAlpha = 0.55 * fade;
      ctx.strokeStyle = zn.color;
      ctx.lineCap = "round";
      for (let k = 0; k < 4; k++) {
        const a0 = -this.time * 3 + (k / 4) * TAU;
        ctx.lineWidth = 3 - k * 0.3;
        ctx.beginPath();
        for (let i = 0; i <= 14; i++) {
          const u = i / 14;
          const a = a0 + u * 2.6;
          const rr = zn.r * (1 - u * 0.68);
          if (i) ctx.lineTo(zn.x + Math.cos(a) * rr, zn.y + Math.sin(a) * rr);
          else ctx.moveTo(zn.x + Math.cos(a) * rr, zn.y + Math.sin(a) * rr);
        }
        ctx.stroke();
      }
      ctx.lineCap = "butt";
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = fade;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(zn.x, zn.y, zn.r * 0.28, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(zn.x, zn.y, zn.r * 0.3, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = zn.color;
      ctx.lineWidth = 2;
      const rot = this.time * 4;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.arc(zn.x, zn.y, zn.r * (0.45 + k * 0.2), rot + k * 2, rot + k * 2 + 1.6);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  // Войд-зоны в стиле Неон 2.0: «анти-свечение» — тёмная воронка с фиолетовым ободом и рукавами, закрученными внутрь
  private drawVoids() {
    const ctx = this.ctx;
    for (const v of this.voids) {
      if (v.dead) continue;
      if (v.warn > 0) {
        // предупреждение на земле: вращающиеся скобы прицела и заполняющийся круг
        const t = 1 - v.warn / VOID_WARN;
        ctx.save();
        ctx.translate(v.x, v.y);
        ctx.rotate(-this.time * 2);
        ctx.strokeStyle = `rgba(192,132,252,${0.5 + t * 0.4})`;
        ctx.lineWidth = 2;
        for (let k = 0; k < 4; k++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.arc(0, 0, v.r, -0.4, 0.4);
          ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle = `rgba(192,132,252,${0.3 + t * 0.4})`;
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = -this.time * 30;
        ctx.beginPath();
        ctx.arc(v.x, v.y, v.r, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(147,51,234,${0.1 + t * 0.15})`;
        ctx.beginPath();
        ctx.arc(v.x, v.y, v.r * t, 0, TAU);
        ctx.fill();
        continue;
      }
      const fade = clamp(Math.min(v.life * 2, (v.max - v.life) * 6), 0, 1);
      const pulse = 0.5 + 0.5 * Math.sin(this.time * 5 + v.x * 0.01);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = (0.35 + pulse * 0.15) * fade;
      ctx.drawImage(getGlow("#a855f7"), v.x - v.r * 1.5, v.y - v.r * 1.5, v.r * 3, v.r * 3);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = fade;
      const g = ctx.createRadialGradient(v.x, v.y, v.r * 0.1, v.x, v.y, v.r);
      g.addColorStop(0, "rgba(0,0,0,0.95)");
      g.addColorStop(0.6, "rgba(20,4,36,0.85)");
      g.addColorStop(1, "rgba(88,28,135,0.55)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(v.x, v.y, v.r, 0, TAU);
      ctx.fill();
      ctx.shadowColor = "#c084fc";
      ctx.shadowBlur = 12;
      ctx.strokeStyle = "rgba(216,180,254,0.95)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(232,121,249,0.6)";
      ctx.lineCap = "round";
      for (let k = 0; k < 3; k++) {
        const a0 = this.time * 2.2 + (k / 3) * TAU;
        ctx.lineWidth = 2.2 - k * 0.4;
        ctx.beginPath();
        for (let i = 0; i <= 12; i++) {
          const u = i / 12;
          const a = a0 - u * 2.4;
          const rr = v.r * (0.95 - u * 0.7);
          if (i) ctx.lineTo(v.x + Math.cos(a) * rr, v.y + Math.sin(a) * rr);
          else ctx.moveTo(v.x + Math.cos(a) * rr, v.y + Math.sin(a) * rr);
        }
        ctx.stroke();
      }
      ctx.lineCap = "butt";
      if (Math.random() < 0.3) {
        const a = Math.random() * TAU;
        this.particle(v.x + Math.cos(a) * v.r, v.y + Math.sin(a) * v.r, -Math.cos(a) * 40, -Math.sin(a) * 40, 0.5, 2, "#d8b4fe");
      }
      ctx.globalAlpha = 1;
    }
  }

  // Турель в стиле Неон 2.0: тёмный шестигранник с неоновым контуром, свечение, вращающийся радар, ствол с дульной вспышкой
  private drawTurrets() {
    const ctx = this.ctx;
    for (const t of this.turrets) {
      if (t.dead) continue;
      const col = t.evo ? "#7dd3fc" : "#38bdf8";
      const a0 = Math.min(1, t.life * 3);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.35 * a0;
      ctx.drawImage(getGlow(col), t.x - 30, t.y - 30, 60, 60);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = a0;
      ctx.shadowColor = col;
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#06141c";
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + Math.PI / 6;
        const px = t.x + Math.cos(a) * 13;
        const py = t.y + Math.sin(a) * 13;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      // радар
      ctx.strokeStyle = hexToRgba(col, 0.5);
      ctx.lineWidth = 1.2;
      const ra = this.time * 3;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 19, ra, ra + 1.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(t.x, t.y, 19, ra + Math.PI, ra + Math.PI + 1.1);
      ctx.stroke();
      // стволы
      ctx.lineCap = "round";
      ctx.strokeStyle = col;
      const barrels = t.evo ? [-0.18, 0.18] : [0];
      for (const da of barrels) {
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(t.x + Math.cos(t.angle + da) * 4, t.y + Math.sin(t.angle + da) * 4);
        ctx.lineTo(t.x + Math.cos(t.angle + da) * 19, t.y + Math.sin(t.angle + da) * 19);
        ctx.stroke();
      }
      ctx.lineCap = "butt";
      if (t.fire > 0 && t.fire < 0.06) {
        ctx.globalCompositeOperation = "lighter";
        ctx.drawImage(getGlow("#e0f2fe"), t.x + Math.cos(t.angle) * 20 - 9, t.y + Math.sin(t.angle) * 20 - 9, 18, 18);
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(t.x, t.y, 3, 0, TAU);
      ctx.fill();
      // полоска оставшегося времени
      ctx.fillStyle = col;
      ctx.fillRect(t.x - 12, t.y + 20, 24 * clamp(t.life / t.max, 0, 1), 2.5);
      ctx.globalAlpha = 1;
    }
  }

  private drawAuras() {
    const ctx = this.ctx;
    const p = this.player;
    // криолучи
    for (const w of this.weapons) {
      if ((w.def.evolvedFrom || w.def.id) !== "cryo") continue;
      for (const [a, len, half] of this.cryoBeams(w, this.eff(w))) {
        const ex = p.x + Math.cos(a) * len;
        const ey = p.y + Math.sin(a) * len;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        const g1 = ctx.createLinearGradient(p.x, p.y, ex, ey);
        g1.addColorStop(0, "rgba(224,242,254,0.55)");
        g1.addColorStop(1, "rgba(125,211,252,0.05)");
        ctx.strokeStyle = g1;
        ctx.lineWidth = half * 3.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        const g2 = ctx.createLinearGradient(p.x, p.y, ex, ey);
        g2.addColorStop(0, "rgba(255,255,255,0.95)");
        g2.addColorStop(1, "rgba(186,230,253,0.25)");
        ctx.strokeStyle = g2;
        ctx.lineWidth = half * 0.9;
        ctx.stroke();
        const k = 14 + Math.sin(this.time * 20) * 3;
        ctx.drawImage(getGlow("#bae6fd"), ex - k, ey - k, k * 2, k * 2);
        ctx.restore();
      }
    }
    for (const w of this.weapons) {
      const base = w.def.evolvedFrom || w.def.id;
      if (base === "aegis" && w.pulse > 0) {
        // щит-проектор: вспышка купола при импульсе
        const R = 95 * this.eff(w).area;
        ctx.fillStyle = hexToRgba(w.def.color, 0.1 * w.pulse);
        ctx.beginPath();
        ctx.arc(p.x, p.y, R * (1.05 - w.pulse * 0.2), 0, TAU);
        ctx.fill();
        continue;
      }
      if (base !== "emp") continue;
      const R = 70 * this.eff(w).area;
      const g = ctx.createRadialGradient(p.x, p.y, R * 0.2, p.x, p.y, R);
      g.addColorStop(0, hexToRgba(w.def.color, 0));
      g.addColorStop(0.75, hexToRgba(w.def.color, 0.05 + w.pulse * 0.08));
      g.addColorStop(1, hexToRgba(w.def.color, 0.16 + w.pulse * 0.2));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = hexToRgba(w.def.color, 0.35 + w.pulse * 0.4);
      ctx.lineWidth = 1.5 + w.pulse * 2;
      ctx.setLineDash([10, 8]);
      ctx.lineDashOffset = -this.time * 30;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      if (w.pulse > 0) {
        ctx.strokeStyle = hexToRgba(w.def.color, w.pulse * 0.6);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, R * (1 - w.pulse * 0.3), 0, TAU);
        ctx.stroke();
      }
    }
  }

  private drawPickups(cx: number, cy: number) {
    const ctx = this.ctx;
    const hw = this.viewHW + 30;
    const hh = this.viewHH + 30;
    for (const g of this.gems) {
      if (g.dead || Math.abs(g.x - cx) > hw || Math.abs(g.y - cy) > hh) continue;
      drawSprite(ctx, this.gemSprites[g.tier], g.x, g.y);
    }
    for (const pk of this.pickups) {
      if (pk.dead || Math.abs(pk.x - cx) > hw || Math.abs(pk.y - cy) > hh) continue;
      const bob = Math.sin(this.time * 4 + pk.bob) * 3;
      if (pk.kind === "chest") {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.5 + Math.sin(this.time * 5) * 0.2;
        ctx.drawImage(getGlow("#fbbf24"), pk.x - 40, pk.y - 40 + bob, 80, 80);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }
      drawSprite(ctx, getPickupSprite(pk.kind), pk.x, pk.y + bob);
    }
  }

  private drawEnemies(cx: number, cy: number) {
    const ctx = this.ctx;
    const hw = this.viewHW + 90;
    const hh = this.viewHH + 90;
    const frozen = this.freezeTimer > 0;
    const p = this.player;
    for (const e of this.enemies) {
      if (e.dead || Math.abs(e.x - cx) > hw || Math.abs(e.y - cy) > hh) continue;
      const kind = e.def.kind;
      const bob = kind === "crate" ? 0 : Math.sin(e.anim * 6 + e.id) * 1.2;
      let scale = e.scale;
      if (kind === "kamikaze") scale *= 1 + Math.sin(e.anim * 14) * 0.08;
      if (e.elite) {
        ctx.strokeStyle = e.voidy ? "rgba(192,132,252,0.8)" : "rgba(250,204,21,0.75)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius + 6 + Math.sin(e.anim * 5) * 2, 0, TAU);
        ctx.stroke();
      }
      if (e.boss && e.shield > 0) {
        ctx.strokeStyle = "rgba(186,230,253,0.85)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius + 24 + Math.sin(e.anim * 10) * 3, 0, TAU);
        ctx.stroke();
      }
      if (e.boss) {
        ctx.strokeStyle = hexToRgba(e.def.color, 0.65);
        ctx.lineWidth = 3;
        const rr = e.radius + 14;
        const a = e.anim * 1.5;
        ctx.beginPath();
        ctx.arc(e.x, e.y, rr, a, a + 1.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(e.x, e.y, rr, a + Math.PI, a + Math.PI + 1.2);
        ctx.stroke();
        if (e.charge > 0) {
          const ang = Math.atan2(p.y - e.y, p.x - e.x);
          ctx.strokeStyle = "rgba(239,68,68,0.7)";
          ctx.lineWidth = 5;
          ctx.setLineDash([14, 10]);
          ctx.beginPath();
          ctx.moveTo(e.x, e.y);
          ctx.lineTo(e.x + Math.cos(ang) * 340, e.y + Math.sin(ang) * 340);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      let alpha = 1;
      if (kind === "phantom") alpha = 0.55 + Math.sin(e.anim * 5 + e.id) * 0.3;
      if (alpha !== 1) ctx.globalAlpha = alpha;
      // Неон 2.0: анимированные кадры, часть врагов поворачивается к пилоту
      const fr = e.frames[(Math.floor(e.anim * 12) + e.id) % e.frames.length];
      const rot = ENEMY_FACING[e.def.sprite || e.def.id];
      const flash = e.flash > 0 || (e.charge > 0 && Math.floor(e.anim * 20) % 2 === 0);
      const draw = (useFlash: boolean) => {
        if (rot !== undefined) drawSpriteRot(ctx, fr, e.x, e.y + bob, e.face + rot, scale, useFlash);
        else drawSprite(ctx, fr, e.x, e.y + bob, scale, useFlash);
      };
      draw(flash);
      if (e.frozenT > 0) {
        // лёд «Криолуча»: белая корка и иглы
        ctx.globalAlpha = 0.55;
        draw(true);
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = "#7dd3fc";
        ctx.lineWidth = 1.5;
        const fr2 = e.radius * e.scale * 1.15;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * TAU + e.id;
          ctx.moveTo(e.x + Math.cos(a) * fr2 * 0.6, e.y + Math.sin(a) * fr2 * 0.6);
          ctx.lineTo(e.x + Math.cos(a) * fr2 * 1.25, e.y + Math.sin(a) * fr2 * 1.25);
        }
        ctx.stroke();
      } else if (frozen || e.stun > 0) {
        ctx.globalAlpha = 0.35;
        draw(true);
      }
      ctx.globalAlpha = 1;
      if (e.burnT > 0) {
        // метка смерти над целью и число стопок
        const col = this.weapons[e.burnSrc]?.def.color || "#e879f9";
        const my = e.y - e.radius * e.scale - 10;
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(e.x, my, 4, 0, TAU);
        ctx.moveTo(e.x - 7, my);
        ctx.lineTo(e.x + 7, my);
        ctx.moveTo(e.x, my - 7);
        ctx.lineTo(e.x, my + 7);
        ctx.stroke();
        if (e.burnStacks > 1) {
          ctx.fillStyle = col;
          ctx.font = '700 9px "Exo 2", sans-serif';
          ctx.textAlign = "left";
          ctx.fillText("×" + e.burnStacks, e.x + 8, my + 3);
        }
      }
      if (e.elite && e.hp < e.maxHp) {
        const bw = e.radius * 2;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(e.x - bw / 2, e.y - e.radius - 14, bw, 4);
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(e.x - bw / 2, e.y - e.radius - 14, bw * clamp(e.hp / e.maxHp, 0, 1), 4);
      }
    }
  }

  private drawPlayer() {
    const ctx = this.ctx;
    const p = this.player;
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.3;
    ctx.drawImage(getGlow(this.character.color), p.x - 42, p.y - 42, 84, 84);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    const blink = p.iframes > 0 && (p.hurt > 0 || p.iframes > 0.5) && Math.floor(this.time * 30) % 2 === 0;
    if (!blink) {
      // Неон 2.0: у каждого пилота свой корпус и живое пламя двигателей
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      drawShipFlames(ctx, this.character.id, 18, this.character.color, this.time, p.moving);
      ctx.restore();
      drawSpriteRot(ctx, this.playerSprite, p.x, p.y, p.angle, 1);
    }
    if (this.barrier) {
      ctx.strokeStyle = "rgba(134,239,172,0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 24 + Math.sin(this.time * 6) * 1.5, 0, TAU);
      ctx.stroke();
    }
    // на телефоне полоска здоровья крупнее
    const bw = 50;
    const bh = 6;
    const ratio = clamp(p.hp / this.stats.maxHp, 0, 1);
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(p.x - bw / 2 - 1, p.y + 22, bw + 2, bh + 2);
    ctx.fillStyle = ratio > 0.5 ? "#4ade80" : ratio > 0.25 ? "#facc15" : "#f43f5e";
    ctx.fillRect(p.x - bw / 2, p.y + 23, bw * ratio, bh);
  }

  private drawOrbiters() {
    const ctx = this.ctx;
    const p = this.player;
    // «Минный пояс» Крота
    for (const w of this.weapons) {
      if (!this.isAwakened(w) || (w.def.evolvedFrom || w.def.id) !== "mines") continue;
      for (let k = 0; k < 6; k++) {
        if ((w.aux[k] ?? 0) > 0) continue;
        const a = w.angle + (k / 6) * TAU;
        ctx.drawImage(getGlow(w.def.color), p.x + Math.cos(a) * 78 - 12, p.y + Math.sin(a) * 78 - 12, 24, 24);
      }
    }
    for (const w of this.weapons) {
      if ((w.def.evolvedFrom || w.def.id) !== "drones") continue;
      const evo = !!w.def.evolved;
      if (!evo && w.active <= 0) continue;
      const e = this.eff(w);
      const alpha = evo ? 1 : Math.min(1, w.active / 0.25);
      const R = 82 * e.area;
      const n = e.amount + (this.isAwakened(w) ? Math.min(6, Math.floor(this.kills / 100)) : 0);
      const s = getOrbiterSprite(w.def.color, 10);
      const sc = Math.sqrt(e.area);
      ctx.globalAlpha = alpha * 0.22;
      ctx.strokeStyle = w.def.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = alpha;
      ctx.lineCap = "round";
      for (let i = 0; i < n; i++) {
        const a = w.angle + (i / n) * TAU;
        // шлейф за дроном
        for (let k = 0; k < 3; k++) {
          ctx.globalAlpha = alpha * (0.32 - k * 0.09);
          ctx.strokeStyle = w.def.color;
          ctx.lineWidth = 7 * sc - k * 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, R, a - 0.18 - k * 0.22, a - k * 0.22);
          ctx.stroke();
        }
        ctx.globalAlpha = alpha;
        const x = p.x + Math.cos(a) * R;
        const y = p.y + Math.sin(a) * R;
        ctx.drawImage(getGlow(w.def.color), x - 16 * sc, y - 16 * sc, 32 * sc, 32 * sc);
        drawSpriteRot(ctx, s, x, y, a + Math.PI / 2, sc);
      }
      ctx.lineCap = "butt";
      ctx.globalAlpha = 1;
    }
  }

  private drawProjectiles(cx: number, cy: number) {
    const ctx = this.ctx;
    const hw = this.viewHW + 40;
    const hh = this.viewHH + 40;
    for (const pr of this.projectiles) {
      if (pr.dead || Math.abs(pr.x - cx) > hw || Math.abs(pr.y - cy) > hh) continue;
      switch (pr.kind) {
        case "bolt": {
          const sp = Math.hypot(pr.vx, pr.vy) || 1;
          const nx = pr.vx / sp;
          const ny = pr.vy / sp;
          if (pr.look === "mg") {
            // трассер пулемёта
            ctx.lineCap = "round";
            ctx.drawImage(getGlow("#fbbf24"), pr.x - 8, pr.y - 8, 16, 16);
            ctx.strokeStyle = "rgba(251,146,60,0.6)";
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.moveTo(pr.x - nx * 28, pr.y - ny * 28);
            ctx.lineTo(pr.x, pr.y);
            ctx.stroke();
            ctx.strokeStyle = "#fef3c7";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(pr.x - nx * 14, pr.y - ny * 14);
            ctx.lineTo(pr.x, pr.y);
            ctx.stroke();
            ctx.lineCap = "butt";
            break;
          }
          const col = this.weapons[pr.src]?.def.color || "#22d3ee";
          if (pr.pct > 0) {
            // гарпун: наконечник-копьё и трос к кораблю
            const p = this.player;
            ctx.strokeStyle = hexToRgba(col, 0.35);
            ctx.lineWidth = 1.2;
            ctx.setLineDash([6, 5]);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(pr.x, pr.y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.save();
            ctx.translate(pr.x, pr.y);
            ctx.rotate(Math.atan2(ny, nx));
            ctx.shadowColor = col;
            ctx.shadowBlur = 10;
            ctx.fillStyle = "#1a0610";
            ctx.strokeStyle = col;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(14, 0);
            ctx.lineTo(0, -6);
            ctx.lineTo(-14, -2);
            ctx.lineTo(-14, 2);
            ctx.lineTo(0, 6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(2, -1.2, 9, 2.4);
            ctx.restore();
            break;
          }
          const L = 16 + pr.r * 3;
          const g = ctx.createLinearGradient(pr.x - nx * L, pr.y - ny * L, pr.x, pr.y);
          g.addColorStop(0, hexToRgba(col, 0));
          g.addColorStop(1, hexToRgba(col, 0.8));
          ctx.strokeStyle = g;
          ctx.lineWidth = pr.r * 1.4;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(pr.x - nx * L, pr.y - ny * L);
          ctx.lineTo(pr.x, pr.y);
          ctx.stroke();
          ctx.lineCap = "butt";
          drawSpriteRot(ctx, pr.sprite, pr.x, pr.y, Math.atan2(pr.vy, pr.vx), pr.r / 5.5);
          break;
        }
        case "missile": {
          const k = 9 + Math.random() * 5;
          ctx.globalAlpha = 0.9;
          ctx.drawImage(getGlow("#fb923c"), pr.x - Math.cos(pr.rot) * 11 - k, pr.y - Math.sin(pr.rot) * 11 - k, k * 2, k * 2);
          ctx.globalAlpha = 1;
          drawSpriteRot(ctx, pr.sprite, pr.x, pr.y, pr.rot, 1);
          break;
        }
        case "disc":
          for (let k = 3; k >= 1; k--) {
            ctx.globalAlpha = 0.12 * (4 - k);
            drawSpriteRot(ctx, pr.sprite, pr.x - pr.vx * 0.012 * k, pr.y - pr.vy * 0.012 * k, pr.rot - k * 0.35, pr.r / 14);
          }
          ctx.globalAlpha = 1;
          drawSpriteRot(ctx, pr.sprite, pr.x, pr.y, pr.rot, pr.r / 14);
          break;
        case "pellet": {
          const sp = Math.hypot(pr.vx, pr.vy) || 1;
          const t = clamp(pr.life / (pr.life0 || 1), 0, 1);
          ctx.strokeStyle = `rgba(251,146,60,${0.25 + t * 0.45})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(pr.x - (pr.vx / sp) * 10, pr.y - (pr.vy / sp) * 10);
          ctx.lineTo(pr.x, pr.y);
          ctx.stroke();
          ctx.globalAlpha = 0.5 + t * 0.5;
          ctx.drawImage(getGlow("#fb923c"), pr.x - 9, pr.y - 9, 18, 18);
          ctx.globalAlpha = 1;
          ctx.fillStyle = t > 0.4 ? "#fff7ed" : "#fdba74";
          ctx.beginPath();
          ctx.arc(pr.x, pr.y, 3.2, 0, TAU);
          ctx.fill();
          break;
        }
        case "slug": {
          const sp = Math.hypot(pr.vx, pr.vy) || 1;
          const tx = pr.x - (pr.vx / sp) * 90;
          const ty = pr.y - (pr.vy / sp) * 90;
          const g = ctx.createLinearGradient(tx, ty, pr.x, pr.y);
          g.addColorStop(0, "rgba(226,232,240,0)");
          g.addColorStop(1, "rgba(255,255,255,0.95)");
          ctx.strokeStyle = g;
          ctx.lineWidth = pr.evo ? 3.5 : 2.5;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(pr.x, pr.y);
          ctx.stroke();
          ctx.lineCap = "butt";
          drawSprite(ctx, pr.sprite, pr.x, pr.y, 1);
          break;
        }
        default:
          drawSprite(ctx, pr.sprite, pr.x, pr.y, 1);
      }
    }
  }

  private drawEffects() {
    const ctx = this.ctx;
    for (const f of this.effects) {
      const t = clamp(f.life / f.max, 0, 1);
      switch (f.kind) {
        case "ring": {
          // двойное кольцо: широкий ореол и яркая кромка
          const r = f.r * (0.25 + 0.75 * (1 - t));
          ctx.globalAlpha = t * 0.35;
          ctx.strokeStyle = f.color;
          ctx.lineWidth = 6 + 12 * t;
          ctx.beginPath();
          ctx.arc(f.x, f.y, r, 0, TAU);
          ctx.stroke();
          ctx.globalAlpha = t;
          ctx.lineWidth = 1.5 + 3 * t;
          ctx.stroke();
          break;
        }
        case "fireball": {
          const u = 1 - t;
          const r = f.r * (0.35 + 0.75 * u);
          const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
          g.addColorStop(0, `rgba(255,255,240,${0.95 * t})`);
          g.addColorStop(0.3, `rgba(253,186,116,${0.85 * t})`);
          g.addColorStop(0.65, `rgba(239,68,68,${0.5 * t})`);
          g.addColorStop(1, "rgba(127,29,29,0)");
          ctx.globalAlpha = 1;
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(f.x, f.y, r, 0, TAU);
          ctx.fill();
          break;
        }
        case "sigil": {
          const r = f.r * (1 + 1.4 * t);
          const rot = (1 - t) * 3;
          ctx.globalAlpha = Math.min(1, (1 - t) * 3) * 0.9;
          ctx.strokeStyle = f.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(f.x, f.y, r, 0, TAU);
          ctx.stroke();
          ctx.beginPath();
          for (let k = 0; k < 3; k++) {
            const a = rot + (k / 3) * TAU;
            ctx.moveTo(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r);
            ctx.lineTo(f.x + Math.cos(a + TAU / 3) * r, f.y + Math.sin(a + TAU / 3) * r);
          }
          ctx.stroke();
          break;
        }
        case "trail": {
          ctx.globalAlpha = t * 0.55;
          ctx.strokeStyle = f.color;
          ctx.lineWidth = f.width * (0.5 + t);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(f.x2, f.y2);
          ctx.stroke();
          break;
        }
        case "flash": {
          const s = f.r * (0.7 + 0.3 * (1 - t));
          ctx.globalAlpha = t;
          ctx.drawImage(getGlow(f.color), f.x - s, f.y - s, s * 2, s * 2);
          break;
        }
        case "slash": {
          // лезвие-полумесяц Неон 2.0; f.width — угол удара (клинок бьёт вперёд/назад по курсу)
          ctx.save();
          ctx.translate(f.x, f.y);
          ctx.rotate(f.width);
          const len = f.x2;
          const hh = f.y2;
          const grow = Math.min(1, (1 - t) * 4 + 0.15);
          const N = 18;
          const top: number[] = [];
          const bot: number[] = [];
          for (let i = 0; i <= N; i++) {
            const u = (i / N) * grow;
            const x = -len / 2 + u * len;
            const mid = -hh * 1.1 * Math.sin(u * Math.PI) + hh * 0.5 * (u - 0.5);
            const th = hh * 0.95 * Math.pow(Math.sin(u * Math.PI), 0.7) + 1;
            top.push(x, mid - th * 0.35);
            bot.push(x, mid + th * 0.65);
          }
          const shape = (pad: number) => {
            ctx.beginPath();
            ctx.moveTo(top[0], top[1] - pad);
            for (let i = 2; i < top.length; i += 2) ctx.lineTo(top[i], top[i + 1] - pad);
            for (let i = bot.length - 2; i >= 0; i -= 2) ctx.lineTo(bot[i], bot[i + 1] + pad);
            ctx.closePath();
          };
          const g = ctx.createLinearGradient(-len / 2, 0, len / 2, 0);
          g.addColorStop(0, hexToRgba(f.color, 0));
          g.addColorStop(0.55, hexToRgba(f.color, 0.85));
          g.addColorStop(1, "rgba(255,255,255,0.95)");
          ctx.globalAlpha = t * 0.35;
          ctx.fillStyle = f.color;
          shape(5);
          ctx.fill();
          ctx.globalAlpha = t;
          ctx.fillStyle = g;
          shape(0);
          ctx.fill();
          ctx.restore();
          break;
        }
        case "beam": {
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(f.x2, f.y2);
          ctx.globalAlpha = t * 0.3;
          ctx.strokeStyle = f.color;
          ctx.lineWidth = f.width * 5 * t + 4;
          ctx.stroke();
          ctx.globalAlpha = t;
          ctx.lineWidth = f.width * 2 * t + 2;
          ctx.stroke();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = f.width * 0.7 * t + 1;
          ctx.stroke();
          ctx.globalAlpha = t * 0.9;
          const r = f.width * 3 + 10;
          ctx.drawImage(getGlow(f.color), f.x - r, f.y - r, r * 2, r * 2);
          break;
        }
        case "lightning": {
          const pts = f.pts;
          if (!pts) break;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          const jit = (v: number, i: number) => (i < 2 || i >= pts.length - 2 ? v : v + rand(-3, 3));
          ctx.beginPath();
          ctx.moveTo(pts[0], pts[1]);
          for (let i = 2; i < pts.length; i += 2) ctx.lineTo(jit(pts[i], i), jit(pts[i + 1], i));
          ctx.globalAlpha = t * 0.3;
          ctx.strokeStyle = f.color;
          ctx.lineWidth = f.width * 6 + 4;
          ctx.stroke();
          ctx.globalAlpha = t;
          ctx.lineWidth = f.width * 2 + 1.5;
          ctx.stroke();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = f.width * 0.7;
          ctx.stroke();
          // ответвления
          ctx.globalAlpha = t * 0.7;
          ctx.strokeStyle = f.color;
          ctx.lineWidth = 1.2;
          for (let i = 2; i < pts.length - 2; i += 4) {
            if (Math.random() < 0.5) continue;
            const a = Math.random() * TAU;
            const l = rand(8, 18);
            ctx.beginPath();
            ctx.moveTo(pts[i], pts[i + 1]);
            ctx.lineTo(pts[i] + Math.cos(a) * l, pts[i + 1] + Math.sin(a) * l);
            ctx.stroke();
          }
          ctx.lineCap = "butt";
          break;
        }
        case "strike": {
          const wd = f.width * t + 2;
          ctx.lineCap = "butt";
          ctx.beginPath();
          ctx.moveTo(f.x, f.y - 900);
          ctx.lineTo(f.x, f.y);
          ctx.globalAlpha = t * 0.25;
          ctx.strokeStyle = f.color;
          ctx.lineWidth = wd * 5;
          ctx.stroke();
          ctx.globalAlpha = t;
          ctx.lineWidth = wd * 2;
          ctx.stroke();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = wd * 0.7;
          ctx.stroke();
          const r = f.width * 2.6 + 20;
          ctx.drawImage(getGlow(f.color), f.x - r, f.y - r * 0.6, r * 2, r * 1.2);
          break;
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.lineCap = "butt";
  }

  private drawParticles(cx: number, cy: number) {
    const ctx = this.ctx;
    const hw = this.viewHW + 20;
    const hh = this.viewHH + 20;
    ctx.lineCap = "round";
    for (const q of this.particles) {
      if (Math.abs(q.x - cx) > hw || Math.abs(q.y - cy) > hh) continue;
      const t = q.life / q.max;
      ctx.globalAlpha = t;
      if (q.streak) {
        ctx.strokeStyle = q.color;
        ctx.lineWidth = q.size;
        ctx.beginPath();
        ctx.moveTo(q.x - q.vx * 0.035, q.y - q.vy * 0.035);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      } else {
        ctx.fillStyle = q.color;
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.size * (0.45 + 0.55 * t), 0, TAU);
        ctx.fill();
      }
    }
    ctx.lineCap = "butt";
    ctx.globalAlpha = 1;
  }

  private drawEnemyBullets(cx: number, cy: number) {
    const ctx = this.ctx;
    const hw = this.viewHW + 20;
    const hh = this.viewHH + 20;
    for (const b of this.ebullets) {
      if (b.dead || Math.abs(b.x - cx) > hw || Math.abs(b.y - cy) > hh) continue;
      drawSprite(ctx, b.sprite, b.x, b.y, 1.15);
    }
  }

  private drawTexts(cx: number, cy: number) {
    if (!this.texts.length) return;
    const ctx = this.ctx;
    const z = this.zoom;
    const W2 = this.w / 2;
    const H2 = this.h / 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    for (let pass = 0; pass < 2; pass++) {
      ctx.font = pass === 0 ? '700 13px "Exo 2", sans-serif' : '900 19px "Exo 2", sans-serif';
      ctx.lineWidth = pass === 0 ? 3 : 4;
      ctx.strokeStyle = "rgba(0,0,0,0.85)";
      for (const t of this.texts) {
        if ((pass === 1) !== t.crit) continue;
        const x = (t.x - cx) * z + W2;
        const y = (t.y - cy) * z + H2;
        if (x < -40 || x > this.w + 40 || y < -40 || y > this.h + 40) continue;
        ctx.globalAlpha = Math.min(1, t.life * 2.5);
        ctx.strokeText(t.text, x, y);
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, x, y);
      }
    }
    ctx.globalAlpha = 1;
  }

  private drawOverlay(cx: number, cy: number) {
    const ctx = this.ctx;
    const W = this.w;
    const H = this.h;
    const p = this.player;
    if (this.blizzard > 0) {
      const fa = clamp(Math.min(this.blizzard, this.blizzardMax - this.blizzard) / 1.5, 0, 1);
      const D = Math.max(W, H) * 1.35;
      ctx.globalAlpha = fa;
      ctx.drawImage(this.fog, W / 2 - D / 2, H / 2 - D / 2, D, D);
      ctx.globalAlpha = 1;
    }
    ctx.drawImage(this.vignette, 0, 0, W, H);
    const ratio = p.hp / this.stats.maxHp;
    let hurtA = Math.max(0, p.hurt) * 2.2;
    if (ratio < 0.3 && this.dying <= 0 && !this.over) hurtA = Math.max(hurtA, (0.3 - ratio) * 2.2 * (0.6 + 0.4 * Math.sin(this.time * 6)));
    if (hurtA > 0) {
      ctx.globalAlpha = Math.min(1, hurtA);
      ctx.drawImage(this.hurtVignette, 0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    if (this.freezeTimer > 0) {
      ctx.fillStyle = `rgba(125,211,252,${Math.min(0.14, this.freezeTimer * 0.05)})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (this.flashScreen > 0) {
      ctx.fillStyle = `rgba(255,255,255,${Math.min(0.8, this.flashScreen)})`;
      ctx.fillRect(0, 0, W, H);
    }
    // указатели на боссов и контейнеры за краем экрана
    const edgeArrow = (wx: number, wy: number, color: string, size: number) => {
      const ex = (wx - cx) * this.zoom + W / 2;
      const ey = (wy - cy) * this.zoom + H / 2;
      if (ex > 0 && ex < W && ey > 0 && ey < H) return;
      const ang = Math.atan2(ey - H / 2, ex - W / 2);
      const ax = clamp(ex, 30, W - 30);
      const ay = clamp(ey, 90, H - 30);
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(ang);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(size, 0);
      ctx.lineTo(-size * 0.5, -size * 0.7);
      ctx.lineTo(-size * 0.2, 0);
      ctx.lineTo(-size * 0.5, size * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    for (const e of this.big) {
      if (e.boss && !e.dead) edgeArrow(e.x, e.y, "#ef4444", 16);
    }
    for (const pk of this.pickups) {
      if (pk.kind === "chest" && !pk.dead) edgeArrow(pk.x, pk.y, "#fbbf24", 13);
    }
    this.drawMinimap();
    // баннер
    const b = this.banner;
    if (b) {
      const a = clamp(Math.min(b.life * 2, (b.max - b.life) * 5), 0, 1);
      ctx.globalAlpha = a;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const size = Math.min(42, W / 14);
      ctx.font = `${size}px "Russo One", sans-serif`;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 22;
      ctx.fillStyle = b.color;
      ctx.fillText(b.text, W / 2, H * 0.27);
      ctx.shadowBlur = 0;
      const fs = Math.max(13, size * 0.38);
      ctx.font = `600 ${fs}px "Exo 2", sans-serif`;
      ctx.fillStyle = "#e2e8f0";
      // подзаголовок переносится по словам — на узком вертикальном экране длинные описания перков не влезают в строку
      const maxW = W * 0.88;
      const lines: string[] = [];
      let line = "";
      for (const word of b.sub.split(" ")) {
        const test = line ? line + " " + word : word;
        if (ctx.measureText(test).width > maxW && line) {
          lines.push(line);
          line = word;
        } else line = test;
      }
      if (line) lines.push(line);
      lines.slice(0, 3).forEach((l, i) => ctx.fillText(l, W / 2, H * 0.27 + size * 0.9 + i * fs * 1.25));
      ctx.globalAlpha = 1;
    }
    // джойстик
    const j = this.joy;
    if (j.active && !this.userPaused && !this.modal) {
      const ox = j.ox - this.canvasLeft;
      const oy = j.oy - this.canvasTop;
      const dx = j.x - j.ox;
      const dy = j.y - j.oy;
      const d = Math.hypot(dx, dy);
      const m = Math.min(d, 50);
      const kx = ox + (d > 0 ? (dx / d) * m : 0);
      const ky = oy + (d > 0 ? (dy / d) * m : 0);
      ctx.strokeStyle = "rgba(34,211,238,0.5)";
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(34,211,238,0.08)";
      ctx.beginPath();
      ctx.arc(ox, oy, 56, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(34,211,238,0.55)";
      ctx.beginPath();
      ctx.arc(kx, ky, 22, 0, TAU);
      ctx.fill();
    }
  }
}
