// Проверка тестового режима: включение, всё открыто, выключение возвращает настоящий прогресс
import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
// по умолчанию — собранная игра (npm run build); можно задать GAME_URL, например http://localhost:5173/
const GAME = process.env.GAME_URL || pathToFileURL(path.resolve(HERE, "../../dist/index.html")).href;
fs.mkdirSync(path.join(HERE, "out"), { recursive: true });


const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("dialog", (d) => d.accept());
await page.addInitScript(() => {
  if (!sessionStorage.getItem("init")) {
    sessionStorage.setItem("init", "1");
    localStorage.setItem("neon-survivors-2199-save", JSON.stringify({ credits: 123, runs: 7 }));
  }
});
await page.goto(GAME);
await page.waitForTimeout(1000);
const menuText = async () => (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, " ");
console.log("1 real:", (await menuText()).match(/ЭВАКУАЦИЙ.{0,4}|\d[\d\s]*\s?ФРАГМЕНТЫ/i)?.[0], "| credits 123 shown:", (await menuText()).includes("123"));
await page.getByRole("button", { name: "Настройки" }).click();
await page.getByText("Тестовый режим — всё открыто").click();
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(HERE, "out", "sandbox-settings.png") });
await page.getByRole("button", { name: "Готово" }).click();
await page.waitForTimeout(300);
const t2 = await menuText();
console.log("2 sandbox: badge", t2.includes("ТЕСТОВЫЙ РЕЖИМ"), "| 999 999 credits", t2.includes("999 999") || t2.includes("999999"));
await page.screenshot({ path: path.join(HERE, "out", "sandbox-menu.png") });
await page.getByRole("button", { name: "Ангар" }).click();
await page.waitForTimeout(300);
const t3 = await menuText();
console.log("3 hangar: unknown modules", (t3.match(/\?\?\?/g) || []).length, "| slots", t3.match(/Слоты корабля · \d\/\d/i)?.[0]);
await page.getByRole("button", { name: "Назад" }).click();
await page.getByText("Начать забег").click();
await page.waitForTimeout(300);
const t4 = await menuText();
console.log("4 pilots locked:", (t4.match(/Разблокировать/g) || []).length);
await page.getByRole("button", { name: "В бой" }).filter({ visible: true }).first().click();
await page.waitForTimeout(300);
const t5 = await menuText();
console.log("5 planets: closed", (t5.match(/закрыта/g) || []).length);
await page.screenshot({ path: path.join(HERE, "out", "sandbox-planets.png") });
// перезагрузка — режим должен сохраниться
await page.reload();
await page.waitForTimeout(800);
console.log("6 after reload badge:", (await menuText()).includes("ТЕСТОВЫЙ РЕЖИМ"));
await page.getByRole("button", { name: "Настройки" }).click();
await page.getByText("Тестовый режим — всё открыто").click();
await page.getByRole("button", { name: "Готово" }).click();
await page.waitForTimeout(300);
const t7 = await menuText();
console.log("7 back to real: badge", t7.includes("ТЕСТОВЫЙ РЕЖИМ"), "| credits 123", t7.includes("123"), "| real save runs:", await page.evaluate(() => JSON.parse(localStorage.getItem("neon-survivors-2199-save")).runs));
console.log("ERRORS:", errors.length ? errors.join("\n") : "none");
await browser.close();
