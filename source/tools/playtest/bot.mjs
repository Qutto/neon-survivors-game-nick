// Умный бот: уворачивается от врагов/пуль, собирает опыт, выбирает улучшения по приоритету.
// Открывает игру с ?bot — движок доступен как window.__engine.
// Запуск: node bot.mjs <секунд> <пилот> <ПЛАНЕТА> <метка> <fresh|mid|high>
// ENDLESS=1 — после финального босса продолжать забег; AD=1 — соглашаться на рекламу (воскрешение, ×2); MODEL=B — пассивки без лимита
import { chromium } from "playwright";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
// по умолчанию — собранная игра (npm run build); можно задать GAME_URL, например http://localhost:5173/
const GAME = process.env.GAME_URL || pathToFileURL(path.resolve(HERE, "../../dist/index.html")).href;

import fs from "fs";

const DUR = Number(process.argv[2] || 1100) * 1000;
const PILOT = process.argv[3] || "Кай";
const PLANET = process.argv[4] || "НЕО-ТЕРРА";
const OUT = path.join(HERE, "out", "bot-" + (process.argv[5] || "run"));
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: process.platform === "win32" ? ["--use-angle=d3d11", "--enable-gpu-rasterization", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"] : ["--enable-unsafe-swiftshader"] });
// вертикальный экран телефона (столп 04)
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true });
const errors = [];
// профиль сохранения: fresh — новичок, mid — пофармил Нео-Терру, high — прошёл Крио-7
const PROFILE = process.argv[6] || "fresh";
const PROFILES = {
  fresh: { planetsCleared: ["home", "ice"] },
  mid: {
    planetsCleared: ["home", "ice"],
    unlocked: ["recruit", "reiji", "nova", "volt", "titan", "ghost", "echo"],
    upgrades: { might: 3, maxHp: 3, armor: 2, regen: 3, cooldown: 2, area: 2, speed: 2, magnet: 2, growth: 3, luck: 1 },
    modules: { mod_overclock: 2, mod_nanoarmor: 2, mod_shield: 1 },
    equipped: ["mod_overclock", "mod_nanoarmor", "mod_shield"],
  },
  high: {
    planetsCleared: ["home", "ice"],
    unlocked: ["recruit", "reiji", "nova", "volt", "titan", "ghost", "echo"],
    upgrades: { might: 5, maxHp: 5, armor: 3, regen: 5, cooldown: 4, area: 4, speed: 4, magnet: 4, growth: 5, luck: 3, amount: 1, revival: 1 },
    overload: { might: 4, maxHp: 3 },
    modules: { mod_overclock: 4, mod_nanoarmor: 4, mod_shield: 3, mod_retaliation: 2, mod_collector: 2 },
    equipped: ["mod_overclock", "mod_nanoarmor", "mod_shield", "mod_retaliation"],
    slots: 4,
  },
};
const MODEL = process.env.MODEL || "A";
// UNLOCK_ALL=1 — открыть всех 13 пилотов (проверка пилотов коллеги)
if (process.env.UNLOCK_ALL === "1") PROFILES[PROFILE].unlocked = ["recruit", "reiji", "nova", "volt", "titan", "ghost", "echo", "bulldog", "jay", "whaler", "raven", "mole", "buffalo"];
await page.addInitScript((save) => {
  if (!localStorage.getItem("neon-survivors-2199-save")) localStorage.setItem("neon-survivors-2199-save", JSON.stringify(save));
}, { ...PROFILES[PROFILE], settings: { sfx: 0, music: 0, damageNumbers: true, screenShake: true, passiveModel: MODEL } });
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));

await page.goto(GAME + "?bot");
await page.waitForTimeout(1200);
await page.getByText("Начать забег").click();
await page.waitForTimeout(600);
await page.getByText(PILOT, { exact: true }).first().click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: "В бой" }).filter({ visible: true }).first().click();
await page.waitForTimeout(600);
await page.getByText(PLANET, { exact: true }).first().click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/planet-select.png` });
await page.getByRole("button", { name: "Высадка" }).filter({ visible: true }).first().click();
await page.waitForTimeout(800);

// Пилотирование внутри страницы, каждый кадр
await page.evaluate(() => {
  const E = window.__engine;
  const origLvl = E.cb.onLevelUp;
  E.cb.onLevelUp = (o, m) => { window.__opts = o; origLvl(o, m); };
  window.__frames = 0;
  // откуда приходит урон: касание, пули, войд-зоны, камикадзе, босс
  window.__dmg = {};
  const origHurt = E.hurtPlayer.bind(E);
  E.hurtPlayer = (amount) => {
    const st = new Error().stack || "";
    let k = st.includes("updateVoids") ? "void" : st.includes("updateEnemyBullets") ? "bullet" : st.includes("kamikazeBlast") ? "kamikaze" : "contact";
    const hp0 = E.player.hp;
    const r = origHurt(amount);
    if (k === "contact") {
      const p = E.player;
      const boss = E.enemies.find((x) => x.boss && !x.dead && Math.hypot(x.x - p.x, x.y - p.y) < x.radius + 40);
      if (boss) k = "boss-contact";
    }
    window.__dmg[k] = (window.__dmg[k] || 0) + Math.max(0, hp0 - E.player.hp);
    return r;
  };
  let wander = Math.random() * 6.28;
  const step = () => {
    window.__frames++;
    const e = window.__engine;
    if (e && !e.over) {
      const p = e.player;
      let tx = 0, ty = 0;
      for (const en of e.enemies) {
        if (en.dead || en.def.kind === "crate") continue;
        const dx = p.x - en.x, dy = p.y - en.y;
        const rr = en.radius * en.scale;
        const d = Math.hypot(dx, dy) - rr;
        const reach = en.boss ? 330 : en.elite ? 260 : 190;
        if (d > reach) continue;
        const w = (en.boss ? 3 : en.elite ? 2 : 1) * 9000 / Math.max(d, 8) ** 2;
        const n = Math.hypot(dx, dy) || 1;
        tx += (dx / n) * w; ty += (dy / n) * w;
      }
      // войд-зоны: и предупреждения на земле, и активные — обходим
      for (const v of e.voids) {
        if (v.dead) continue;
        const dx = p.x - v.x, dy = p.y - v.y;
        const d = Math.hypot(dx, dy) - v.r;
        if (d > 90) continue;
        const w = 26000 / Math.max(d + 30, 8) ** 2;
        const n = Math.hypot(dx, dy) || 1;
        tx += (dx / n) * w; ty += (dy / n) * w;
      }
      for (const b of e.ebullets) {
        if (b.dead) continue;
        const dx = p.x - b.x, dy = p.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d > 170) continue;
        const toward = -(dx * b.vx + dy * b.vy) < 0; // летит к игроку
        if (!toward) continue;
        const w = 14000 / Math.max(d, 8) ** 2;
        // уходим перпендикулярно траектории
        const vn = Math.hypot(b.vx, b.vy) || 1;
        let px = -b.vy / vn, py = b.vx / vn;
        if (px * dx + py * dy < 0) { px = -px; py = -py; }
        tx += px * w; ty += py * w;
      }
      {
        const a = e.planet.arena;
        let dw, nx, ny;
        if (a.shape === "circle") {
          const d = Math.hypot(p.x, p.y) || 1;
          dw = a.size - d; nx = -p.x / d; ny = -p.y / d;
          tx += nx * (dw < 320 ? 30000 / Math.max(dw, 10) ** 2 : 0) * 1; ty += ny * (dw < 320 ? 30000 / Math.max(dw, 10) ** 2 : 0);
        } else {
          for (const [pos, sgn, axis] of [[p.x, 1, 0], [p.x, -1, 0], [p.y, 1, 1], [p.y, -1, 1]]) {
            dw = a.size - pos * sgn;
            if (dw < 320) { const f = 30000 / Math.max(dw, 10) ** 2; if (axis === 0) tx -= sgn * f; else ty -= sgn * f; }
          }
        }
      }
      const threat = Math.hypot(tx, ty);
      // цель: пикапы, контейнеры, кристаллы
      const hpLow = p.hp < e.stats.maxHp * 0.5;
      // на родной планете при низком здоровье — к куполу
      if (hpLow && e.planet.base > 0 && threat < 2) {
        const n = Math.hypot(p.x, p.y) || 1;
        if (n > e.planet.base * 0.6) { tx += (-p.x / n) * 1.5; ty += (-p.y / n) * 1.5; }
      }
      let best = null, bd = 700;
      for (const pk of e.pickups) {
        if (pk.dead) continue;
        let d = Math.hypot(pk.x - p.x, pk.y - p.y);
        if (pk.kind === "chest") d *= 0.4;
        if (pk.kind === "medkit" && hpLow) d *= 0.3;
        if (d < bd) { bd = d; best = pk; }
      }
      for (const en of e.enemies) {
        if (en.dead || (en.def.kind !== "crate" && en.def.kind !== "nest")) continue;
        const d = Math.hypot(en.x - p.x, en.y - p.y) * 0.8;
        if (d < bd) { bd = d; best = en; }
      }
      for (const g of e.gems) {
        if (g.dead || g.mag) continue;
        const d = Math.hypot(g.x - p.x, g.y - p.y);
        if (d < bd) { bd = d; best = g; }
      }
      let gx = 0, gy = 0;
      if (best) {
        const n = Math.hypot(best.x - p.x, best.y - p.y) || 1;
        gx = (best.x - p.x) / n; gy = (best.y - p.y) / n;
      } else {
        wander += 0.004;
        gx = Math.cos(wander); gy = Math.sin(wander);
      }
      const gw = threat > 1.2 ? 0.25 : 1;
      let mx = tx + gx * gw, my = ty + gy * gw;
      // небольшое «закручивание», чтобы не загонять себя в угол
      if (threat > 0.3) { const k = 0.35; const ox = mx; mx = mx - my * k; my = my + ox * k; }
      const m = Math.hypot(mx, my);
      if (m > 0.02) {
        e.joy.active = true; e.joy.id = -99;
        e.joy.ox = 0; e.joy.oy = 0; e.joy.x = (mx / m) * 46; e.joy.y = (my / m) * 46;
      } else e.joy.active = false;
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
});

const score = (o, st) => {
  if (o.kind === "perk") return 5;
  if (o.kind === "wmod") return 7;
  if (o.kind === "weapon") return o.isNew ? (st.weapons < 4 ? 8 : 2) : 10;
  if (o.kind === "passive") {
    if (o.hint && o.hint.startsWith("Нужен для эволюции")) return 9.5;
    return ["maxHp", "armor", "might", "cooldown", "amount", "area", "regen"].includes(o.id) ? 6 : 4;
  }
  return o.kind === "heal" ? 2 : 1;
};

const t0 = Date.now();
let lastLog = -1e9, lastShot = 0, shotN = 0, lastFrames = 0, bossSeen = new Set(), picks = [];
while (Date.now() - t0 < DUR) {
  const now = Date.now() - t0;
  const st = await page.evaluate(() => {
    const e = window.__engine;
    const t = document.body.innerText;
    const boss = e.enemies.find((x) => x.boss && !x.dead);
    return {
      over: e.over,
      modal: e.modal,
      ready: t.includes("НОВЫЙ УРОВЕНЬ"),
      perks: [...e.perks].join(","),
      voids: e.voids.length,
      time: e.time, level: e.level, hp: Math.round(e.player.hp), maxHp: Math.round(e.stats.maxHp),
      enemies: e.enemies.length, kills: e.kills, revivals: e.revivals,
      weapons: e.weapons.length,
      build: e.weapons.map((w) => `${w.def.id}:${w.level}`).join(" ") + " | " + e.passives.map((p) => `${p.def.id}:${p.level}`).join(" "),
      boss: boss ? `${boss.def.id} ${Math.round(boss.hp)}/${Math.round(boss.maxHp)}` : null,
      nests: e.enemies.filter((x) => !x.dead && x.def.kind === "nest").length,
      bliz: Math.round(e.blizzard),
      credits: Math.floor(e.runCredits),
      bossId: boss ? boss.def.id : null,
      frames: window.__frames,
      opts: window.__opts || null,
    };
  });
  if (st.over) {
    console.log("DMG_TAKEN", JSON.stringify(await page.evaluate(() => window.__dmg)));
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/zz-end.png` });
    console.log(`END at real ${Math.round(now / 1000)}s, game ${Math.floor(st.time / 60)}:${String(Math.floor(st.time % 60)).padStart(2, "0")} lvl=${st.level}`);
    console.log((await page.evaluate(() => document.body.innerText)).replace(/\n+/g, " | ").slice(0, 900));
    break;
  }
  if (st.modal === "levelup" && st.opts) {
    await page.waitForTimeout(380);
    const opts = st.opts;
    let bi = 0;
    opts.forEach((o, i) => { if (score(o, st) > score(opts[bi], st)) bi = i; });
    picks.push(`${opts[bi].id}${opts[bi].isNew ? "(new)" : ""}`);
    await page.keyboard.press(`Digit${bi + 1}`);
    await page.waitForTimeout(350);
    continue;
  }
  if (st.modal === "protocol") {
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/protocol-choice.png` });
    const names = await page.locator("[data-kind=protocol]").allInnerTexts();
    console.log(`  PROTOCOL @${Math.round(st.time)}s: ${names.map((n) => n.split("\n")[0]).join(" / ")} → беру первый`);
    await page.locator("[data-kind=protocol]").first().click();
    await page.waitForTimeout(300);
    continue;
  }
  if (st.modal === "victory") {
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/victory-choice.png` });
    const cont = process.env.ENDLESS === "1";
    console.log(`  VICTORY @${Math.round(st.time)}s → ${cont ? "бесконечный режим" : "эвакуация"}`);
    await page.getByRole("button", { name: cont ? "Продолжить забег" : "Эвакуация" }).click();
    await page.waitForTimeout(300);
    continue;
  }
  if (st.modal === "revive") {
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/revive-offer.png` });
    const ad = process.env.AD === "1";
    console.log(`  DEATH @${Math.round(st.time)}s → ${ad ? "второе дыхание за рекламу" : "отказ"}`);
    if (ad) {
      await page.getByRole("button", { name: /Воскреснуть/ }).click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${OUT}/ad-mock.png` });
      await page.getByRole("button", { name: "Получить награду" }).click({ timeout: 8000 });
    } else await page.getByRole("button", { name: "Нет, завершить забег" }).click();
    await page.waitForTimeout(300);
    continue;
  }
  if (st.modal === "chest") {
    await page.waitForTimeout(800);
    const txt = await page.evaluate(() => document.body.innerText.replace(/\n+/g, " | ").slice(0, 300));
    console.log(`  CHEST @${Math.round(st.time)}s: ${txt}`);
    // анимация контейнера: первый Enter — вскрыть/показать всё, второй — продолжить
    for (let k = 0; k < 4; k++) {
      await page.keyboard.press("Enter");
      await page.waitForTimeout(250);
      if (!(await page.evaluate(() => window.__engine.modal === "chest"))) break;
    }
    continue;
  }
  if (st.bossId && !bossSeen.has(st.bossId)) {
    bossSeen.add(st.bossId);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/boss-${st.bossId}.png` });
  }
  if (now - lastLog > 20000) {
    const fps = Math.round((st.frames - lastFrames) / ((now - lastLog) / 1000));
    lastFrames = st.frames;
    console.log(`[${Math.round(now / 1000)}s] t=${Math.floor(st.time / 60)}:${String(Math.floor(st.time % 60)).padStart(2, "0")} lvl=${st.level} hp=${st.hp}/${st.maxHp} en=${st.enemies} kills=${st.kills} cr=${st.credits} voids=${st.voids} fps≈${fps} ${st.boss ? "BOSS " + st.boss : ""}\n     ${st.build} ${st.perks ? "perks: " + st.perks : ""}`);
    lastLog = now;
  }
  if (now - lastShot > 60000) {
    await page.screenshot({ path: `${OUT}/${String(shotN++).padStart(2, "0")}-play.png` });
    lastShot = now;
  }
  await page.waitForTimeout(80);
}
await page.screenshot({ path: `${OUT}/zz-final.png` });
console.log("PICKS:", picks.join(", "));
console.log("ERRORS:", errors.length ? errors.slice(0, 20).join("\n") : "none");
await browser.close();
