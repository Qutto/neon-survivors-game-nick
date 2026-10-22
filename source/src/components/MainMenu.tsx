// Главное меню
import type { ReactNode } from "react";
import { useState } from "react";
import { BookOpen, Coins, Cpu, Crown, Gem, Gift, Infinity as InfinityIcon, Play, Pointer, Rocket, Settings, Skull, Trophy } from "lucide-react";
import { dailyState, type SaveData } from "../game/save";
import { MENU_BG } from "../game/portraits";
import { AdButton, CreditBadge, NeonButton, formatTime } from "./ui";

interface Props {
  save: SaveData;
  onPlay: () => void;
  onShop: () => void;
  onCodex: () => void;
  onHangar: () => void;
  sandbox?: boolean;
  onSettings: () => void;
  onDaily: (mul: number) => void;
}

// Ежедневный контейнер (контент коллеги): 7 дней подряд, ×2 за рекламу
function DailyPanel({ save, onDaily }: { save: SaveData; onDaily: (mul: number) => void }) {
  const d = dailyState(save);
  const [got, setGot] = useState<string | null>(null);
  if (got)
    return (
      <div className="pop-in flex items-center gap-2 rounded-lg border border-amber-400/50 bg-amber-500/10 px-3 py-2 font-logo text-sm text-amber-200">
        <Gift size={16} /> {got}
      </div>
    );
  if (!d.available) return null;
  const take = (mul: number) => {
    setGot(`+${d.credits * mul} кредитов${d.fragments ? ` · +${d.fragments * mul} ◆` : ""} · до завтра!`);
    onDaily(mul);
  };
  return (
    <div className="pop-in rounded-xl border border-amber-400/50 bg-[#0a0e1f]/85 p-3 shadow-[0_0_24px_rgba(251,191,36,0.15)] backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="floaty grid h-11 w-11 shrink-0 place-items-center rounded-lg border-2 border-amber-400 bg-amber-500/15 shadow-[0_0_18px_rgba(251,191,36,0.5)]">
          <Gift size={22} className="text-amber-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm text-amber-100">Ежедневный контейнер</div>
          <div className="flex items-center gap-1.5 font-logo text-xs text-amber-300">
            <Coins size={12} /> +{d.credits}
            {d.fragments > 0 && <span className="text-fuchsia-300">· +{d.fragments} ◆</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-logo text-[9px] text-slate-400">ДЕНЬ {d.day}/7</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <span key={i} className={`h-2 w-1.5 rounded-sm ${i < d.day ? "bg-amber-400 shadow-[0_0_4px_#fbbf24]" : "bg-slate-700"}`} />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <NeonButton variant="gold" className="px-2 py-2 text-xs" onClick={() => take(1)}>
          Забрать
        </NeonButton>
        <AdButton placement="ежедневный контейнер ×2" className="px-2 py-2 text-xs" onReward={() => take(2)}>
          ×2
        </AdButton>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-600/40 bg-black/40 px-3 py-1.5 backdrop-blur-sm">
      <span className="text-slate-400">{icon}</span>
      <span className="text-[11px] uppercase tracking-wider text-slate-400">{label}</span>
      <span className="font-logo text-sm text-slate-100 tabular-nums">{value}</span>
    </div>
  );
}

export function MainMenu({ save, onPlay, onShop, onCodex, onHangar, onSettings, onDaily, sandbox }: Props) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05060f]">
      <img src={MENU_BG} alt="" className="kenburns absolute inset-0 h-full w-full object-cover opacity-75" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#05060f] via-[#05060f]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#05060f] via-transparent to-[#05060f]/50" />
      <div className="grid-bg absolute inset-0 opacity-25" />
      <div className="scanlines pointer-events-none absolute inset-0" />

      <div className="thin-scroll relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center overflow-y-auto px-6 py-10 sm:px-12">
        <div className="fade-in">
          <div className="mb-3 flex items-center gap-3 font-logo text-[10px] tracking-[0.45em] text-fuchsia-300/90 sm:text-xs">
            <span className="h-px w-10 bg-fuchsia-400/70" />
            ПРОТОКОЛ ВЫЖИВАНИЯ · 2199
            {sandbox && <span className="rounded border border-amber-400/60 bg-amber-500/15 px-2 py-0.5 tracking-[0.2em] text-amber-300">ТЕСТОВЫЙ РЕЖИМ</span>}
          </div>
          <h1 className="glitch font-logo text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
            <span className="neon-text text-cyan-300">NEON</span>
            <span className="neon-soft text-fuchsia-500">//</span>
            <br className="sm:hidden" />
            <span className="text-white">SURVIVORS</span>
          </h1>
          <p className="mt-5 max-w-lg text-base text-slate-300 sm:text-lg">
            Система захвачена роями дронов, киборгами и тварями Улья. Защити <b className="text-cyan-300">Нео-Терру</b>, пробейся
            через льды <b className="text-sky-300">Крио-7</b> и выжги <b className="text-lime-300">Улей Ксенос</b>.
          </p>
        </div>

        <div className="mt-6 w-full max-w-xs">
          <DailyPanel save={save} onDaily={onDaily} />
        </div>

        <div className="pop-in mt-4 flex w-full max-w-xs flex-col gap-3">
          <NeonButton className="pulse-glow py-4 text-lg" onClick={onPlay}>
            <Play size={20} /> Начать забег
          </NeonButton>
          <NeonButton variant="gold" onClick={onShop}>
            <Cpu size={18} /> Лаборатория
          </NeonButton>
          <NeonButton variant="green" onClick={onHangar}>
            <Rocket size={18} /> Ангар
          </NeonButton>
          <NeonButton variant="violet" onClick={onCodex}>
            <BookOpen size={18} /> База данных
          </NeonButton>
          <NeonButton variant="ghost" onClick={onSettings}>
            <Settings size={18} /> Настройки
          </NeonButton>
        </div>

        <div className="mt-8 flex flex-wrap gap-2.5">
          <CreditBadge value={save.credits} />
          <Stat icon={<Gem size={15} />} label="Фрагменты" value={save.fragments} />
          <Stat icon={<Trophy size={15} />} label="Рекорд" value={formatTime(save.bestTime)} />
          <Stat icon={<Skull size={15} />} label="Убито" value={save.totalKills.toLocaleString("ru-RU")} />
          <Stat icon={<Crown size={15} />} label="Эвакуаций" value={save.wins} />
          {save.bestEndless > 0 && <Stat icon={<InfinityIcon size={15} />} label="Бесконечный" value={formatTime(save.bestEndless)} />}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-0 right-0 z-10 flex items-center justify-center gap-2 px-4 text-center text-[11px] text-slate-500 sm:text-xs">
        <Pointer size={14} className="shrink-0" />
        Один палец: зажми и веди — корабль летит за пальцем · оружие стреляет само · думай на выборе перков
      </div>
    </div>
  );
}
