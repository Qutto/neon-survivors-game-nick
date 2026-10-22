// Скриншоты экранов меню с прокачанным сохранением (десктоп + телефон)
import { chromium } from "playwright";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
// по умолчанию — собранная игра (npm run build); можно задать GAME_URL, например http://localhost:5173/
const GAME = process.env.GAME_URL || pathToFileURL(path.resolve(HERE, "../../dist/index.html")).href;

import fs from "fs";

const OUT = path.join(HERE, "out", "screens");
fs.mkdirSync(OUT, { recursive: true });
const SAVE = {
  credits: 5200,
  fragments: 23,
  planetsCleared: ["home"],
  upgrades: { might: 5, maxHp: 5, armor: 3, regen: 2, cooldown: 4, area: 2 },
  overload: { might: 2 },
  modules: { mod_overclock: 3, mod_nanoarmor: 2, mod_shield: 1, mod_dash: 2, mod_scanner: 1 },
  equipped: ["mod_overclock", "mod_shield", "mod_dash"],
};

const browser = await chromium.launch({ args: process.platform==="win32"?["--use-angle=d3d11","--ignore-gpu-blocklist"]:[] });
const errors = [];

for (const [tag, vp] of [["desk", { width: 1280, height: 800 }], ["phone", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, hasTouch: tag === "phone" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.addInitScript((s) => localStorage.setItem("neon-survivors-2199-save", JSON.stringify(s)), SAVE);
  await page.goto(GAME);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${tag}-menu.png` });
  await page.getByRole("button", { name: "Ангар" }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${tag}-hangar.png`, fullPage: false });
  await page.getByRole("button", { name: "Назад" }).click();
  await page.getByRole("button", { name: "Лаборатория" }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${tag}-lab.png` });
  await page.getByRole("button", { name: "Назад" }).click();
  await page.getByText("Начать забег").click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "В бой" }).filter({ visible: true }).first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${tag}-planets.png` });
  await page.getByRole("button", { name: "Высадка" }).filter({ visible: true }).first().click();
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${OUT}/${tag}-game.png` });
  await ctx.close();
}
console.log("ERRORS:", errors.length ? errors.join("\n") : "none");
await browser.close();
