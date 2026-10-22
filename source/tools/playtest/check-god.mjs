// Проверка режима бога: нет в обычном режиме, есть в тестовом, корабль не получает урона
import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
// по умолчанию — собранная игра (npm run build); можно задать GAME_URL, например http://localhost:5173/
const GAME = process.env.GAME_URL || pathToFileURL(path.resolve(HERE, "../../dist/index.html")).href;
fs.mkdirSync(path.join(HERE, "out"), { recursive: true });


const browser = await chromium.launch({ args: process.platform === "win32" ? ["--use-angle=d3d11"] : [] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(GAME);
await page.waitForTimeout(900);
const txt = async () => (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, " ");
await page.getByRole("button", { name: "Настройки" }).click();
console.log("1 real mode, god toggle visible:", (await txt()).includes("Режим бога"));
await page.getByText("Тестовый режим — всё открыто").click();
await page.waitForTimeout(200);
console.log("2 sandbox, god toggle visible:", (await txt()).includes("Режим бога"));
await page.getByText("Режим бога — бессмертие").click();
await page.getByRole("button", { name: "Готово" }).click();
await page.getByText("Начать забег").click();
await page.getByRole("button", { name: "В бой" }).filter({ visible: true }).first().click();
await page.getByText("УЛЕЙ КСЕНОС", { exact: true }).first().click();
await page.getByRole("button", { name: "Высадка" }).filter({ visible: true }).first().click();
let minHp = Infinity;
for (let i = 0; i < 40; i++) {
  await page.waitForTimeout(1000);
  const t = await txt();
  if (t.includes("НОВЫЙ УРОВЕНЬ")) await page.keyboard.press("Digit1");
  if (t.includes("ПРОДОЛЖИТЬ")) await page.keyboard.press("Enter");
  const m = t.match(/ЦЕЛОСТНОСТЬ (\d+)\/(\d+)/);
  if (m) minHp = Math.min(minHp, +m[1] / +m[2]);
  if (/СИГНАЛ ПОТЕРЯН/.test(t)) { console.log("DIED"); break; }
}
const t = await txt();
console.log("3 after 40s standing still: label", t.includes("РЕЖИМ БОГА"), "| min hp ratio", minHp, "| time", t.match(/\d\d:\d\d/)?.[0]);
await page.screenshot({ path: path.join(HERE, "out", "god.png") });
console.log("ERRORS:", errors.length ? errors.join("\n") : "none");
await browser.close();
