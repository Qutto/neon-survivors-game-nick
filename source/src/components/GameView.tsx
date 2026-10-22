// Игровой экран: canvas + HUD + модальные окна
import { useCallback, useEffect, useRef, useState } from "react";
import { Anchor, Coins, Gem, Heart, Infinity as InfinityIcon, Pause, ShieldCheck, Skull, Snowflake, Waves } from "lucide-react";
import { Engine, type BuildSnapshot, type ChestReward, type HudItem, type HudState, type RunResult, type UpgradeOption, type VictoryInfo } from "../game/engine";
import { computeStartStats, equippedLevels, getCharacter, isSandbox, type SaveData, type Settings } from "../game/save";
import { perkDef } from "../game/data";
import { getPlanet } from "../game/planets";
import { audio } from "../game/audio";
import { showAd } from "../game/ads";
import { ItemIcon, formatTime, itemColor } from "./ui";
import { ChestModal, GameOverScreen, LevelUpModal, PauseMenu, ProtocolModal, ReviveModal, VictoryChoiceModal } from "./GameModals";

// ------------------------------------------------------------
//  HUD
// ------------------------------------------------------------
function HudSlot({ item, size }: { item?: HudItem; size: number }) {
  if (!item) return <div className="rounded-md border border-dashed border-slate-600/40 bg-black/20" style={{ width: size, height: size }} />;
  const c = itemColor(item.id);
  return (
    <div className={`relative ${item.ready ? "animate-pulse" : ""}`}>
      <ItemIcon id={item.id} size={size} />
      {!item.evolved && (
        <span
          className="absolute -bottom-1 -right-1 min-w-[14px] rounded px-[3px] text-center font-logo text-[9px] font-bold leading-[13px] text-black"
          style={{ background: item.level >= item.max ? "#fde047" : c }}
        >
          {item.level >= item.max ? "M" : item.level}
        </span>
      )}
      {item.ready && <span className="absolute inset-0 rounded-md ring-2 ring-amber-300" />}
    </div>
  );
}

function Hud({ hud, onPause, god }: { hud: HudState; onPause: () => void; god: boolean }) {
  const xpPct = Math.min(100, (hud.xp / hud.xpNext) * 100);
  const hpPct = Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100));
  const slot = 26;
  const finalPhase = hud.time >= hud.duration && !hud.endless;
  // модель B (без лимита): показываем только взятые пассивки
  const passiveSlots = hud.maxPassives <= 6 ? hud.maxPassives : hud.passives.length;
  const stillPerk = hud.still && hud.passives.some((p) => p.id === "anchor");
  return (
    <div className="pointer-events-none absolute inset-0 z-10 select-none">
      <div className="absolute left-0 right-0 top-0 h-3.5 border-b border-cyan-400/30 bg-black/70">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-fuchsia-500 shadow-[0_0_12px_rgba(34,211,238,0.8)] transition-[width] duration-150"
          style={{ width: `${xpPct}%` }}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 font-logo text-[10px] font-bold text-white [text-shadow:0_0_4px_#000]">УР {hud.level}</div>
      </div>

      <div className="absolute left-2 top-5 flex flex-col gap-1.5" data-testid="hud-slots">
        <div className="flex gap-1">
          {Array.from({ length: hud.maxWeapons }).map((_, i) => (
            <HudSlot key={i} item={hud.weapons[i]} size={slot} />
          ))}
        </div>
        <div className="flex flex-wrap gap-1" style={{ maxWidth: (slot + 4) * 5 }}>
          {Array.from({ length: passiveSlots }).map((_, i) => (
            <HudSlot key={i} item={hud.passives[i]} size={slot - 4} />
          ))}
        </div>
        {hud.perks.length > 0 && (
          <div className="flex flex-wrap gap-1" data-testid="hud-perks">
            {hud.perks.map((id) => (
              <div key={id} className="flex items-center gap-1 rounded border bg-black/50 px-1.5 py-0.5 text-[10px] font-bold" style={{ borderColor: `${itemColor(id)}88`, color: itemColor(id) }}>
                {perkDef(id)?.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="absolute left-1/2 top-5 -translate-x-1/2 text-center">
        <div className={`font-logo text-2xl font-bold tabular-nums ${finalPhase ? "text-rose-300" : hud.endless ? "text-amber-200" : "text-white"} neon-soft`}>{formatTime(hud.time)}</div>
        {finalPhase && hud.boss && <div className="font-display text-[10px] tracking-widest text-rose-300">ФИНАЛЬНАЯ БИТВА</div>}
        {hud.endless && (
          <div className="mx-auto mt-0.5 w-fit rounded border border-rose-500/70 bg-black/70 px-1.5 pb-0.5 font-logo text-[11px] text-rose-200" data-testid="hud-endless" title="Бесконечный режим: ступень угрозы и множитель наград">
            <div className="flex items-center gap-1">
              <InfinityIcon size={13} /> УГРОЗА {hud.endless.level} <span className="text-amber-200">×{hud.endless.mul.toFixed(2)}</span>
            </div>
            <div className="mt-0.5 h-1 overflow-hidden rounded bg-rose-950">
              <div className="h-full bg-rose-500" style={{ width: `${hud.endless.next * 100}%` }} />
            </div>
          </div>
        )}
        {god && <div className="font-logo text-[10px] tracking-widest text-amber-300">РЕЖИМ БОГА</div>}
        {hud.freeze > 0 && (
          <div className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-sky-300">
            <Snowflake size={12} /> {hud.freeze.toFixed(1)}с
          </div>
        )}
      </div>

      <div className="absolute right-2 top-5 flex flex-col items-end gap-1.5">
        <button
          onClick={onPause}
          className="pointer-events-auto grid h-9 w-9 place-items-center rounded-md border border-cyan-400/50 bg-black/50 text-cyan-200 backdrop-blur hover:bg-cyan-500/20"
          aria-label="Пауза"
        >
          <Pause size={18} />
        </button>
        <div className="flex items-center gap-1.5 rounded bg-black/40 px-2 py-0.5 font-logo text-xs text-slate-100">
          <Skull size={14} className="text-rose-400" /> {hud.kills.toLocaleString("ru-RU")}
        </div>
        <div className="flex items-center gap-1.5 rounded bg-black/40 px-2 py-0.5 font-logo text-xs text-amber-300">
          <Coins size={14} /> {hud.credits}
        </div>
        {hud.fragments > 0 && (
          <div className="flex items-center gap-1.5 rounded bg-black/40 px-2 py-0.5 font-logo text-xs text-fuchsia-300">
            <Gem size={14} /> {hud.fragments}
          </div>
        )}
        {hud.revivals > 0 && (
          <div className="flex items-center gap-1 rounded bg-black/40 px-2 py-0.5 font-logo text-[11px] text-yellow-200">
            <Heart size={12} fill="#fde047" /> ×{hud.revivals}
          </div>
        )}
      </div>

      {hud.boss && (
        <div className="absolute left-1/2 top-[96px] w-[86%] -translate-x-1/2">
          <div className="mb-0.5 flex justify-between font-display text-[11px] tracking-widest" style={{ color: hud.boss.color }}>
            <span className="neon-soft">{hud.boss.name}</span>
            <span className="font-logo text-slate-300">{Math.max(0, Math.ceil(hud.boss.hp)).toLocaleString("ru-RU")}</span>
          </div>
          <div className="h-3 overflow-hidden rounded border bg-black/70" style={{ borderColor: `${hud.boss.color}88` }}>
            <div
              className="h-full transition-[width] duration-150"
              style={{
                width: `${Math.max(0, (hud.boss.hp / hud.boss.maxHp) * 100)}%`,
                background: `linear-gradient(90deg, ${hud.boss.color}, #fda4af)`,
                boxShadow: `0 0 12px ${hud.boss.color}`,
              }}
            />
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 w-[46%]">
        {stillPerk && (
          <div className="mb-1 flex w-fit items-center gap-1 rounded border border-sky-400/60 bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-sky-200">
            <Anchor size={11} /> СТОЯ: БОНУС
          </div>
        )}
        <div className="mb-0.5 flex justify-between font-logo text-[10px] text-rose-200">
          <span className="flex items-center gap-1">
            ЦЕЛОСТНОСТЬ
            {hud.shield >= 0 && <ShieldCheck size={12} className={hud.shield >= 1 ? "text-sky-300" : "text-slate-600"} />}
            {hud.repulsor >= 0 && <Waves size={12} className={hud.repulsor >= 1 ? "text-cyan-300" : "text-slate-600"} />}
            {hud.barrier && <ShieldCheck size={12} className="text-emerald-300" />}
          </span>
          <span>
            {Math.ceil(Math.max(0, hud.hp))}/{Math.round(hud.maxHp)}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded border border-rose-400/40 bg-black/70">
          <div
            className={`h-full transition-[width] duration-150 ${hpPct < 30 ? "bg-rose-500" : "bg-gradient-to-r from-rose-500 to-pink-400"}`}
            style={{ width: `${hpPct}%`, boxShadow: "0 0 10px rgba(244,63,94,0.7)" }}
          />
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
//  Игровой экран
// ------------------------------------------------------------
interface Props {
  save: SaveData;
  characterId: string;
  planetId: string;
  onExit: () => void;
  onChangePilot: () => void;
  onRunEnd: (r: RunResult) => void;
  onSettingsChange: (s: Settings) => void;
  onBonusCredits: (n: number) => void;
}

export function GameView({ save, characterId, planetId, onExit, onChangePilot, onRunEnd, onSettingsChange, onBonusCredits }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [hud, setHud] = useState<HudState | null>(null);
  const [levelUp, setLevelUp] = useState<{ options: UpgradeOption[]; rerolls: number; skips: number; adRerolls: number } | null>(null);
  const [chest, setChest] = useState<ChestReward | null>(null);
  const [chestKey, setChestKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [snapshot, setSnapshot] = useState<BuildSnapshot | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [victory, setVictory] = useState<VictoryInfo | null>(null);
  const [revive, setRevive] = useState(false);
  const [protocol, setProtocol] = useState<UpgradeOption[] | null>(null);
  const [runKey, setRunKey] = useState(0);
  const saveRef = useRef(save);
  const unlockedAtStart = useRef<string[]>(save.unlocked);
  const onRunEndRef = useRef(onRunEnd);

  useEffect(() => {
    saveRef.current = save;
    onRunEndRef.current = onRunEnd;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = saveRef.current;
    unlockedAtStart.current = s.unlocked;
    const ch = getCharacter(characterId);
    const engine = new Engine(
      canvas,
      {
        character: ch,
        stats: computeStartStats(s, ch),
        settings: s.settings,
        planet: getPlanet(planetId),
        modules: equippedLevels(s),
        owned: Object.keys(s.modules),
        passiveModel: s.settings.passiveModel || "A",
        adRevive: true,
      },
      {
        onHud: (h) => setHud(h),
        onLevelUp: (options, meta) => setLevelUp({ options, ...meta }),
        onChest: (r) => {
          setChest(r);
          setChestKey((k) => k + 1);
        },
        onGameOver: (r) => {
          audio.stopMusic();
          setResult(r);
          onRunEndRef.current(r);
        },
        onPauseKey: () => setPaused((p) => !p),
        onBlur: () => setPaused(true),
        onVictoryChoice: (info) => setVictory(info),
        onReviveOffer: () => setRevive(true),
        onProtocol: (opts) => setProtocol(opts),
      },
    );
    engineRef.current = engine;
    engine.start();
    audio.init();
    audio.intensity = 1;
    audio.startMusic();
    return () => {
      engine.destroy();
      engineRef.current = null;
      audio.stopMusic();
    };
  }, [runKey, characterId, planetId]);

  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    e.setUserPaused(paused);
    if (paused) setSnapshot(e.getSnapshot());
  }, [paused]);

  const choose = useCallback((o: UpgradeOption) => {
    setLevelUp(null);
    engineRef.current?.choose(o);
  }, []);
  const reroll = useCallback(() => engineRef.current?.reroll(), []);
  // переброс за рекламу — когда обычные кончились (реклама коллеги)
  const adReroll = useCallback(() => engineRef.current?.adReroll(), []);
  // открыть контейнер ещё раз за рекламу (реклама коллеги)
  const chestAgain = useCallback(() => engineRef.current?.chestAgain(), []);
  const skip = useCallback(() => {
    setLevelUp(null);
    engineRef.current?.skip();
  }, []);
  const closeChest = useCallback(() => {
    setChest(null);
    engineRef.current?.closeChest();
  }, []);

  const changeSettings = (s: Settings) => {
    onSettingsChange(s);
    engineRef.current?.setSettings(s);
  };

  const retry = () => {
    setResult(null);
    setHud(null);
    setLevelUp(null);
    setChest(null);
    setVictory(null);
    setRevive(false);
    setProtocol(null);
    setPaused(false);
    setRunKey((k) => k + 1);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05060f]">
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" onContextMenu={(e) => e.preventDefault()} />
      {hud && !result && <Hud hud={hud} onPause={() => setPaused(true)} god={!!save.settings.godMode && isSandbox()} />}
      {levelUp && !result && (
        <LevelUpModal
          options={levelUp.options}
          rerolls={levelUp.rerolls}
          skips={levelUp.skips}
          adRerolls={levelUp.adRerolls}
          level={hud?.level ?? 1}
          onChoose={choose}
          onReroll={reroll}
          onAdReroll={adReroll}
          onSkip={skip}
        />
      )}
      {chest && !result && <ChestModal key={chestKey} reward={chest} onClose={closeChest} onAgain={chestAgain} />}
      {protocol && !result && (
        <ProtocolModal
          options={protocol}
          onChoose={(id) => {
            setProtocol(null);
            engineRef.current?.chooseProtocol(id);
          }}
        />
      )}
      {victory && !result && (
        <VictoryChoiceModal
          info={victory}
          planetId={planetId}
          onChoose={(cont) => {
            setVictory(null);
            engineRef.current?.chooseEndless(cont);
          }}
        />
      )}
      {revive && !result && (
        <ReviveModal
          time={hud?.time ?? 0}
          duration={hud?.duration ?? 0}
          endless={!!hud?.endless}
          onRevive={() => {
            setRevive(false);
            engineRef.current?.acceptRevive();
          }}
          onDecline={() => {
            setRevive(false);
            engineRef.current?.declineRevive();
          }}
        />
      )}
      {paused && !result && !levelUp && !chest && !victory && !revive && !protocol && (
        <PauseMenu
          snapshot={snapshot}
          settings={save.settings}
          onSettings={changeSettings}
          onResume={() => setPaused(false)}
          onSurrender={() => {
            engineRef.current?.surrender();
            setPaused(false);
          }}
        />
      )}
      {result && (
        <GameOverScreen
          result={result}
          onRetry={retry}
          onMenu={onExit}
          onChangePilot={onChangePilot}
          newPilots={save.unlocked.filter((id) => !unlockedAtStart.current.includes(id))}
          onDouble={async () => {
            const ok = await showAd("rewarded", "×2 кредита после забега");
            if (ok) onBonusCredits(result.credits);
            return ok;
          }}
        />
      )}
    </div>
  );
}
