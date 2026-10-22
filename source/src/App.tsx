// NEON//SURVIVORS 2199 — корневой компонент: экраны, сохранения, экономика
import { useCallback, useEffect, useRef, useState } from "react";
import { MainMenu } from "./components/MainMenu";
import { CharacterSelect } from "./components/CharacterSelect";
import { PlanetSelect } from "./components/PlanetSelect";
import { Hangar } from "./components/Hangar";
import { Shop, spentCredits } from "./components/Shop";
import { Codex } from "./components/Codex";
import { SettingsPanel } from "./components/SettingsPanel";
import { GameView } from "./components/GameView";
import { CHARACTERS, META_UPGRADES, metaCost, overloadCost } from "./game/data";
import { MODULES, MODULE_MAX_LEVEL, SLOT_COSTS, moduleUpgradeCost } from "./game/modules";
import { autoUnlock, claimDaily, freshSave, hasSave, isSandbox, loadSave, sandboxSave, setSandbox, writeSave, type SaveData, type Settings } from "./game/save";
import type { RunResult } from "./game/engine";
import { audio } from "./game/audio";
import { AdOverlay } from "./components/AdOverlay";

type Screen = "menu" | "select" | "planet" | "shop" | "codex" | "hangar" | "game";

// Новые модули — в коллекцию (ур. 1) и сразу в свободный слот
function collectModules(s: SaveData, ids: string[]): Pick<SaveData, "modules" | "equipped"> {
  const modules = { ...s.modules };
  const equipped = [...s.equipped];
  for (const id of ids) {
    if (modules[id]) continue;
    modules[id] = 1;
    if (equipped.length < s.slots) equipped.push(id);
  }
  return { modules, equipped };
}

export default function App() {
  const [sandbox, setSandboxState] = useState(() => isSandbox());
  const sandboxRef = useRef(sandbox);
  const [save, setSave] = useState<SaveData>(() => {
    const sb = sandboxRef.current;
    if (sb && !hasSave(true)) return sandboxSave(loadSave(false).settings);
    const s = loadSave(sb);
    return sb ? s : { ...s, settings: { ...s.settings, godMode: false } };
  });
  const [screen, setScreen] = useState<Screen>("menu");
  const [charId, setCharId] = useState<string>(() => save.lastCharacter);
  const [planetId, setPlanetId] = useState<string>(() => save.lastPlanet);
  const [showSettings, setShowSettings] = useState(false);

  const update = useCallback((fn: (s: SaveData) => SaveData) => {
    setSave((prev) => {
      const next = fn(prev);
      if (next !== prev) writeSave(next, sandboxRef.current);
      return next;
    });
  }, []);

  useEffect(() => {
    audio.setVolumes(save.settings.sfx, save.settings.music);
  }, [save.settings.sfx, save.settings.music]);

  useEffect(() => {
    const h = () => audio.init();
    window.addEventListener("pointerdown", h);
    window.addEventListener("keydown", h);
    return () => {
      window.removeEventListener("pointerdown", h);
      window.removeEventListener("keydown", h);
    };
  }, []);

  const pickPilot = (id: string) => {
    update((s) => ({ ...s, lastCharacter: id }));
    setCharId(id);
    setScreen("planet");
  };

  const launch = (pid: string) => {
    update((s) => ({ ...s, lastPlanet: pid }));
    setPlanetId(pid);
    setScreen("game");
  };

  const unlock = (id: string) => {
    const ch = CHARACTERS.find((c) => c.id === id);
    // пилоты за достижения открываются сами, за кредиты их не купить
    if (!ch || ch.unlock || save.credits < ch.price || save.unlocked.includes(id)) return;
    update((s) => (s.credits >= ch.price && !s.unlocked.includes(id) ? { ...s, credits: s.credits - ch.price, unlocked: [...s.unlocked, id] } : s));
    audio.play("chest");
  };

  const buy = (id: string) => {
    const def = META_UPGRADES.find((u) => u.id === id);
    if (!def) return;
    update((s) => {
      const lvl = s.upgrades[id] || 0;
      if (lvl >= def.maxLevel) {
        // «перегрузка» после максимума
        if (def.noOverload) return s;
        const ov = s.overload[id] || 0;
        const oc = overloadCost(def, ov);
        if (s.credits < oc) return s;
        return { ...s, credits: s.credits - oc, overload: { ...s.overload, [id]: ov + 1 } };
      }
      const cost = metaCost(def, lvl);
      if (s.credits < cost) return s;
      return { ...s, credits: s.credits - cost, upgrades: { ...s.upgrades, [id]: lvl + 1 } };
    });
    audio.play("levelup");
  };

  const refund = () => {
    update((s) => ({ ...s, credits: s.credits + spentCredits(s), upgrades: {}, overload: {} }));
    audio.play("warp");
  };

  const onRunEnd = useCallback(
    (r: RunResult) => {
      update((s) => autoUnlock({
        ...s,
        bossKills: (s.bossKills || 0) + r.bossesKilled,
        eliteKills: (s.eliteKills || 0) + r.elitesKilled,
        bestBaseStay: r.planetId === "home" ? Math.max(s.bestBaseStay || 0, r.baseStay) : s.bestBaseStay || 0,
        credits: s.credits + r.credits,
        runs: s.runs + 1,
        wins: s.wins + (r.victory ? 1 : 0),
        bestTime: Math.max(s.bestTime, r.time),
        bestKills: Math.max(s.bestKills, r.kills),
        bestLevel: Math.max(s.bestLevel, r.level),
        totalKills: s.totalKills + r.kills,
        bestEndless: Math.max(s.bestEndless || 0, r.endlessTime),
        discovered: Array.from(new Set([...s.discovered, ...r.discovered])),
        planetsCleared: r.victory && !s.planetsCleared.includes(r.planetId) ? [...s.planetsCleared, r.planetId] : s.planetsCleared,
        ...collectModules(s, r.modulesFound.filter((m) => !m.dup).map((m) => m.id)),
        fragments: s.fragments + r.fragments,
      }).save);
    },
    [update],
  );

  // ×2 награда за рекламу на экране итогов
  const addCredits = (n: number) => update((s) => ({ ...s, credits: s.credits + n }));

  // ежедневный контейнер (контент коллеги): ×1 или ×2 за рекламу
  const daily = (mul: number) => {
    update((s) => claimDaily(s, mul));
    audio.play("chest");
  };

  const equip = (id: string) =>
    update((s) => (s.modules[id] && !s.equipped.includes(id) && s.equipped.length < s.slots ? { ...s, equipped: [...s.equipped, id] } : s));
  const unequip = (id: string) => update((s) => ({ ...s, equipped: s.equipped.filter((x) => x !== id) }));
  const upgradeModule = (id: string) => {
    const def = MODULES.find((m) => m.id === id);
    if (!def) return;
    update((s) => {
      const lvl = s.modules[id] || 0;
      const c = moduleUpgradeCost(def, lvl);
      if (!lvl || lvl >= MODULE_MAX_LEVEL || s.credits < c.credits || s.fragments < c.fragments) return s;
      return { ...s, credits: s.credits - c.credits, fragments: s.fragments - c.fragments, modules: { ...s.modules, [id]: lvl + 1 } };
    });
    audio.play("levelup");
  };
  const buySlot = () => {
    update((s) => {
      const c = SLOT_COSTS[s.slots - 3];
      if (!c || s.credits < c.credits || s.fragments < c.fragments) return s;
      return { ...s, credits: s.credits - c.credits, fragments: s.fragments - c.fragments, slots: s.slots + 1 };
    });
    audio.play("chest");
  };

  // тестовый режим: при каждом включении — свежее сохранение «всё открыто»; настоящее не трогается
  const toggleSandbox = (v: boolean) => {
    setSandbox(v);
    sandboxRef.current = v;
    setSandboxState(v);
    const next = v ? sandboxSave(save.settings) : { ...loadSave(false), settings: { ...save.settings, godMode: false } };
    writeSave(next, v);
    setSave(next);
    setCharId(next.lastCharacter);
    setPlanetId(next.lastPlanet);
  };

  const changeSettings = (st: Settings) => update((s) => ({ ...s, settings: st }));

  const resetAll = () => {
    const fresh: SaveData = sandboxRef.current ? sandboxSave(save.settings) : { ...freshSave(), settings: save.settings };
    writeSave(fresh, sandboxRef.current);
    setSave(fresh);
    setCharId(fresh.lastCharacter);
    setShowSettings(false);
  };

  return (
    <div className="phone-stage">
    <div className="phone-frame">
      {screen === "menu" && (
        <MainMenu
          save={save}
          onPlay={() => setScreen("select")}
          onShop={() => setScreen("shop")}
          onCodex={() => setScreen("codex")}
          onHangar={() => setScreen("hangar")}
          sandbox={sandbox}
          onSettings={() => setShowSettings(true)}
          onDaily={daily}
        />
      )}
      {screen === "select" && <CharacterSelect save={save} onBack={() => setScreen("menu")} onStart={pickPilot} onUnlock={unlock} />}
      {screen === "planet" && <PlanetSelect save={save} onBack={() => setScreen("select")} onLaunch={launch} />}
      {screen === "shop" && <Shop save={save} onBack={() => setScreen("menu")} onBuy={buy} onRefund={refund} />}
      {screen === "codex" && <Codex save={save} onBack={() => setScreen("menu")} />}
      {screen === "hangar" && (
        <Hangar save={save} onBack={() => setScreen("menu")} onEquip={equip} onUnequip={unequip} onUpgrade={upgradeModule} onBuySlot={buySlot} />
      )}
      {screen === "game" && (
        <GameView
          save={save}
          characterId={charId}
          planetId={planetId}
          onExit={() => setScreen("menu")}
          onChangePilot={() => setScreen("select")}
          onRunEnd={onRunEnd}
          onSettingsChange={changeSettings}
          onBonusCredits={addCredits}
        />
      )}
      {showSettings && <SettingsPanel settings={save.settings} onChange={changeSettings} onClose={() => setShowSettings(false)} onReset={resetAll} sandbox={sandbox} onSandbox={toggleSandbox} />}
      <AdOverlay />
    </div>
    </div>
  );
}
