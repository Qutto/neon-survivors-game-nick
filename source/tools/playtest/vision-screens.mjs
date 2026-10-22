// Скриншоты новых систем вижна (телефон 390×844 и ПК с портретной колонкой): node vision-screens.mjs
import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = process.env.GAME_URL || pathToFileURL(path.resolve(HERE, "../../dist/index.html")).href;
const OUT = path.join(HERE, "out", "vision");
fs.mkdirSync(OUT, { recursive: true });

const SAVE = {
  credits: 5200,
  fragments: 23,
  planetsCleared: ["home", "ice"],
  unlocked: ["recruit", "reiji", "nova", "volt", "titan", "ghost", "echo", "bulldog", "mole"],
  bossKills: 6,
  eliteKills: 40,
  modules: { mod_overclock: 3, mod_repulsor: 2, mod_shield: 1 },
  equipped: ["mod_overclock", "mod_repulsor", "mod_shield"],
  runs: 4,
  lastCharacter: "bulldog",
};
const browser = await chromium.launch({ args: process.platform === "win32" ? ["--use-angle=d3d11"] : [] });
const errors = [];

for (const [tag, vp] of [["phone", { width: 390, height: 844 }], ["desk", { width: 1280, height: 800 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, hasTouch: tag === "phone" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(tag + " " + e.message));
  page.on("console", (m) => m.type() === "error" && !m.text().includes("ERR_TUNNEL") && errors.push(tag + " " + m.text()));
  await page.addInitScript((s) => localStorage.setItem("neon-survivors-2199-save", JSON.stringify(s)), SAVE);
  await page.goto(GAME + "?bot");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/${tag}-01-menu.png` });
  if (tag === "desk") {
    await ctx.close();
    continue;
  }
  await page.getByRole("button", { name: "Настройки" }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${tag}-02-settings.png` });
  await page.getByText("B · без лимита").click();
  await page.getByText("A · 4 слота").click();
  await page.getByRole("button", { name: "Готово" }).click();
  // ежедневный контейнер ×2 за рекламу
  await page.getByRole("button", { name: /×2/ }).first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${tag}-04-ad.png` });
  await page.getByRole("button", { name: "Получить награду" }).click({ timeout: 8000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${tag}-05-daily.png` });
  await page.getByRole("button", { name: "База данных" }).click();
  await page.getByRole("button", { name: "Перки" }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${tag}-06-codex-perks.png` });
  await page.getByRole("button", { name: "Назад" }).click();
  await page.getByText("Начать забег").click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${tag}-07-pilot.png`, fullPage: false });
  await page.getByTestId("pilot-perk").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${OUT}/${tag}-08-pilot-perk.png` });
  await page.getByRole("button", { name: "В бой" }).filter({ visible: true }).first().click();
  await page.waitForTimeout(400);
  await page.getByText("НЕО-ТЕРРА", { exact: true }).first().click();
  await page.screenshot({ path: `${OUT}/${tag}-09-planets.png` });
  await page.getByRole("button", { name: "Высадка" }).filter({ visible: true }).first().click();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${OUT}/${tag}-10-game.png` });
  // показываем редкие карты: перк-правило, перк пилота и новую пушку
  await page.evaluate(() => {
    const e = window.__engine;
    e.modal = "levelup";
    const w = e.weapons[0];
    e.cb.onLevelUp([e.weaponOption(w.def, 2, false), { kind: "wmod", id: w.def.id, modId: "wm_crit", slot: 0, name: w.def.name + ": Прицельный", color: "#fde047", level: 1, isNew: false, desc: "+15% шанса крита этого оружия" }], { rerolls: 0, skips: 1, adRerolls: 3 });
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${tag}-11-levelup-perks.png` });
  await page.locator("[data-kind=weapon]").first().click();
  await page.waitForTimeout(600);
  // пробуждение: родная пушка эволюционирует, следующий контейнер — анимация коллеги
  await page.evaluate(() => {
    const e = window.__engine;
    const w = e.weapons[0];
    w.level = 6;
    e.passives.push({ def: { id: "speed", name: "Сервоприводы", desc: "", color: "#4ade80", stat: "speed", perLevel: 0.1, maxLevel: 5 }, level: 1 });
    e.openChest();
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${tag}-11a-chest-charge.png` });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${OUT}/${tag}-11a-chest-open.png` });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  await page.evaluate(() => window.__engine.openChest());
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${OUT}/${tag}-11c-awaken.png` });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/${tag}-11d-carousel.png` });
  // выбор протокола после первого босса
  await page.evaluate(() => {
    const e = window.__engine;
    e.protocolOffered = true;
    e.openProtocol();
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${tag}-11b-protocol.png` });
  await page.locator("[data-kind=protocol]").nth(1).click();
  await page.waitForTimeout(600);
  // войд-зоны рядом с игроком
  await page.evaluate(() => {
    const e = window.__engine;
    e.voidsAroundPlayer(3, 85, 5);
    e.castVoid(e.player.x + 160, e.player.y - 220, 52, 22, 6, 4);
    e.voids[e.voids.length - 1].warn = 0;
    e.voids[1].warn = 0;
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${tag}-12-voids.png` });
  // победа над финальным боссом → выбор
  await page.evaluate(() => {
    const e = window.__engine;
    e.triggerVictory("ПРАМАТЕРЬ КСЕНОС");
  });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${OUT}/${tag}-13-victory-choice.png` });
  await page.screenshot({ path: `${OUT}/${tag}-13-victory-choice.png` });
  await page.getByRole("button", { name: "Продолжить забег" }).click();
  await page.waitForTimeout(12500);
  await page.screenshot({ path: `${OUT}/${tag}-14-endless.png` });
  // смерть → «второе дыхание»
  await page.evaluate(() => {
    const e = window.__engine;
    e.player.iframes = 0;
    e.shieldCd = 99;
    e.barrier = false;
    e.hurtPlayer(99999);
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${tag}-15-revive.png` });
  await page.getByRole("button", { name: "Нет, завершить забег" }).click();
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${OUT}/${tag}-16-result.png` });
  await page.getByRole("button", { name: /×2 кредита/ }).click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "Получить награду" }).click({ timeout: 8000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${tag}-17-result-doubled.png`, fullPage: true });
  await ctx.close();
}
console.log("ERRORS:", errors.length ? errors.join("\n") : "none");
await browser.close();
