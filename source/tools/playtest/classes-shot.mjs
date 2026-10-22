// Скриншот классов врагов: рой, средние, тяжёлые и замах элитки (неделя врагов)
import { chromium } from "playwright";
import path from "path"; import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = pathToFileURL(path.resolve(HERE, "../../dist/index.html")).href;
const OUT = path.join(HERE, "out", "classes"); fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
await page.addInitScript(() => localStorage.setItem("neon-survivors-2199-save", JSON.stringify({ planetsCleared: ["home"], settings: { sfx: 0, music: 0, damageNumbers: false, screenShake: false, godMode: true } })));
await page.goto(GAME + "?bot"); await page.waitForTimeout(1000);
await page.getByText("Начать забег").click(); await page.waitForTimeout(500);
await page.getByText("Кай", { exact: true }).first().click(); await page.waitForTimeout(300);
await page.getByRole("button", { name: "В бой" }).filter({ visible: true }).first().click();
await page.waitForTimeout(800);
await page.getByText("НЕО-ТЕРРА", { exact: true }).first().click(); await page.waitForTimeout(300);
await page.getByRole("button", { name: "Высадка" }).filter({ visible: true }).first().click();
await page.waitForTimeout(1500);
await page.evaluate(() => {
  const e = window.__engine; const p = e.player; e.settings.godMode = true;
  e.weapons.length = 0; // чтобы враги не умирали на скриншоте
  for (const en of e.enemies) en.dead = true;
  const put = (id, dx, dy, el = false) => e.spawnEnemy(id, p.x + dx, p.y + dy, el, 1, true);
  for (let i = 0; i < 7; i++) put("swarm", -150 + i * 22, -260 + (i % 2) * 18);
  put("crawler", 120, -230); put("crawler", 160, -200);
  put("trooper", -120, 120); put("trooper", -60, 160); put("gunner", 140, 140);
  put("mech", 150, -40); put("brute", -170, -40);
  const el = put("trooper", 0, 300, true); el.t2 = 0; window.__el = el;
});
await page.waitForTimeout(450);
await page.screenshot({ path: path.join(OUT, "classes.png") });
console.log("ok", await page.evaluate(() => ({ charge: window.__el.charge, enemies: window.__engine.enemies.filter(x => !x.dead).map(x => x.def.id + (x.elite ? "*" : "") + ":" + Math.round(x.speed)).join(" ") })));
await browser.close();
