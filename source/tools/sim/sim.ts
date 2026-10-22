// Headless-симулятор забега: npm run sim -- <планета> <пилот> <минуты> <godMode 1/0>. FRESH=1 — профиль без меты.
// ENDLESS=1 — после финального босса продолжать (бесконечный режим). PERK=rule_monolith — брать этот перк, когда предложат.
// MODEL=B — пассивки без лимита (по умолчанию A — 4 слота).
import "./stubs.js";
import { Engine } from "../../src/game/engine";
import { CHARACTERS, META_UPGRADES } from "../../src/game/data";
import { getPlanet } from "../../src/game/planets";
import { computeStartStats, freshSave } from "../../src/game/save";

const [planetId = "hive", charId = "ghost", minutes = "15", god = "1", seedTag = ""] = process.argv.slice(2);
const save = freshSave();
const FRESH = process.env.FRESH === "1";
if (!FRESH) for (const u of META_UPGRADES) save.upgrades[u.id] = u.maxLevel;
save.modules = FRESH ? {} : { mod_gravcore: 5, mod_overclock: 5, mod_nanoarmor: 5, mod_salvager: 5, mod_scanner: 5 };
const ENDLESS = process.env.ENDLESS === "1";
const PERK = process.env.PERK || "";
const MODEL = (process.env.MODEL || "A") as "A" | "B";
save.equipped = Object.keys(save.modules); save.slots = 5;
const ch = CHARACTERS.find((c) => c.id === charId)!;
const stats = computeStartStats(save, ch);
// АоЕ-приоритет, как у игрока
const PRI: Record<string, number> = { area: 100, growth: 95, cooldown: 90, might: 85, amount: 80, duration: 70, magnet: 60,
  emp: 99, drones: 97, strike: 96, singularity: 94, missile: 92, tesla: 88, disc: 70, railgun: 60, plasma: 50, whip: 55,
  mines: 65, turret: 75, harpoon: 72, aegis: 58, tactical: 50, adrenal: 40, anchor: 45,
  mg: 60, sniper: 62, cryo: 86, brand: 70, shotgun: 66, optics: 40, breaker: 45, wmod: 55,
  super_dmg: 90, super_area: 100, super_hp: 70, super_armor: 60, super_cd: 80, heal: 1 };
let opts: any[] = []; let chest = false; let over: any = null;
const eng: any = new Engine(globalThis.__mkCanvas(), { character: ch, stats, settings: { sfx: 0, music: 0, damageNumbers: false, screenShake: false, godMode: god === "1" }, planet: getPlanet(planetId), modules: save.modules, owned: Object.keys(save.modules), passiveModel: MODEL } as any,
  { onLevelUp: (o: any) => (opts = o), onChest: () => (chest = true), onGameOver: (r: any) => (over = r), onHud() {}, onPauseKey() {}, onBlur() {},
    onProtocol: () => {}, ...(ENDLESS ? { onVictoryChoice: () => {} } : {}) } as any);
// движение: контейнеры/пикапы > кристаллы вне магнита > медленный круг
let ang = 0;
eng.inputDir = () => {
  const p = eng.player;
  let best: any = null, bd = 1e9;
  for (const pk of eng.pickups) { if (pk.dead) continue; const d = Math.hypot(pk.x - p.x, pk.y - p.y) * (pk.kind === "chest" ? 0.3 : 1); if (d < bd && d < 900) { bd = d; best = pk; } }
  if (!best) { const mr = 72 * eng.stats.magnet; for (const g of eng.gems) { if (g.dead || g.mag) continue; const d = Math.hypot(g.x - p.x, g.y - p.y); if (d > mr && d < bd && d < 700) { bd = d; best = g; } } }
  if (best) { const dx = best.x - p.x, dy = best.y - p.y, d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; }
  ang += 0.004; const tx = Math.cos(ang) * 300 - p.x, ty = Math.sin(ang) * 300 - p.y, d = Math.hypot(tx, ty) || 1; return d < 20 ? [0, 0] : [tx / d, ty / d];
};
const dt = 1 / 60; const end = +minutes * 60; let nextLog = 0; const log: string[] = [];
const fmt = (t: number) => `${String(Math.floor(t / 60)).padStart(2)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
let supersTaken = 0;
let awLogged = false;
const seenBoss = new Map<number, number>();
const evoSeen = new Set<string>();
while (eng.time < end && !over) {
  if (eng.modal === "protocol") { const o: string[] = eng.protocolOptions; const pick = o.includes(PERK) ? PERK : o[0]; log.push(`${fmt(eng.time)} ПРОТОКОЛ ${pick}`); eng.chooseProtocol(pick); continue; }
  if (eng.modal === "victory") { log.push(`${fmt(eng.time)} ФИНАЛ УБИТ → бесконечный режим`); eng.chooseEndless(true); continue; }
  if (eng.modal === "levelup") {
    const pri = (o: any) => (o.kind === "perk" ? (o.id === PERK || o.perkType === "pilot" ? 200 : -1) : (o.kind === "wmod" ? PRI.wmod : (PRI[o.id] ?? 10)) + (o.isNew ? 0 : 3));
    let best = opts[0];
    for (const o of opts) if (pri(o) > pri(best)) best = o;
    if (best.kind === "perk") log.push(`${fmt(eng.time)} ПЕРК ${best.name}`);
    if (best.kind === "super") supersTaken++;
    if (best.kind === "wmod") log.push(`${fmt(eng.time)} МОД ${best.name}`);
    eng.choose(best); continue;
  }
  if (eng.modal === "chest") { if (eng.awakened && !awLogged) { awLogged = true; log.push(`${fmt(eng.time)} ПРОБУЖДЕНИЕ ${ch.awakenName}`); } eng.closeChest(); continue; }
  if (eng.dying > 0) { eng.dying -= dt; if (eng.dying <= 0) eng.finish(false); continue; }
  eng.update(dt);
  for (const w of eng.weapons) if (w.def.evolved && !evoSeen.has(w.def.id)) { evoSeen.add(w.def.id); log.push(`${fmt(eng.time)} ЭВОЛЮЦИЯ ${w.def.name}`); }
  for (const e of eng.enemies) if (e.boss && !seenBoss.has(e.id)) { seenBoss.set(e.id, eng.time); log.push(`${fmt(eng.time)} БОСС ${e.def.id} hp=${Math.round(e.maxHp)}`); }
  for (const [id, t0] of seenBoss) if (t0 >= 0 && !eng.enemies.some((e: any) => e.id === id && !e.dead)) { log.push(`${fmt(eng.time)} босс убит за ${Math.round(eng.time - t0)} с`); seenBoss.set(id, -1); }
  if (eng.time >= nextLog) {
    nextLog += 30;
    const boss = eng.enemies.find((e: any) => e.boss && !e.dead);
    log.push(`${fmt(eng.time)} lvl=${String(eng.level).padStart(3)} kills=${String(eng.kills).padStart(6)} supers=${String(supersTaken).padStart(3)} might=${eng.stats.might.toFixed(2)} area=${eng.stats.area.toFixed(2)} hp=${Math.round(eng.player.hp)}/${Math.round(eng.stats.maxHp)} enemies=${eng.enemies.length} meds=${eng.pickups.filter((p: any) => p.kind === "medkit" && !p.dead).length}${boss ? ` BOSS ${boss.def.id} ${Math.round(boss.hp)}/${Math.round(boss.maxHp)}` : ""}`);
  }
}
const full = eng.weapons.map((w: any) => `${w.def.id}:${w.level}`).join(" ");
console.log(`== ${planetId} ${charId} god=${god} ${seedTag}`); console.log(log.join("\n"));
const totalDmg = eng.weapons.reduce((a: number, w: any) => a + w.damage, 0) || 1;
console.log("DMG " + eng.weapons.slice().sort((a: any, b: any) => b.damage - a.damage).map((w: any) => `${w.def.id}:${Math.round((100 * w.damage) / totalDmg)}%`).join(" "));
console.log(`END t=${fmt(eng.time)} lvl=${eng.level} kills=${eng.kills} supers=${supersTaken} victory=${over?.victory ?? "-"} credits=${over?.credits ?? "-"} endless=${over ? Math.round(over.endlessTime) + "s x" + over.endlessMul : "-"} | ${full}`);
