import type { ReactNode } from "react";
import { Music, Volume2, X } from "lucide-react";
import { isSandbox, type Settings } from "../game/save";
import { NeonButton, Panel } from "./ui";
import { cn } from "../utils/cn";

function Slider({ label, icon, value, onChange }: { label: string; icon: ReactNode; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between text-sm text-slate-300">
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        <span className="font-logo text-xs text-cyan-300">{Math.round(value * 100)}%</span>
      </div>
      <input type="range" min={0} max={1} step={0.05} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-cyan-400" />
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="flex w-full items-center justify-between py-1 text-sm text-slate-300">
      <span>{label}</span>
      <span className={cn("relative h-6 w-11 rounded-full border transition-colors", value ? "border-cyan-400 bg-cyan-500/30" : "border-slate-600 bg-slate-800")}>
        <span
          className={cn("absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all", value ? "left-[22px] bg-cyan-300 shadow-[0_0_8px_#22d3ee]" : "left-0.5 bg-slate-500")}
          style={{ width: 18, height: 18 }}
        />
      </span>
    </button>
  );
}

// Тест пассивок (столп 06): команда переключает модель и сравнивает ощущения
function PassiveModelPicker({ settings, onChange }: { settings: Settings; onChange: (s: Settings) => void }) {
  const m = settings.passiveModel || "A";
  const opt = (id: "A" | "B", title: string, sub: string) => (
    <button
      type="button"
      onClick={() => onChange({ ...settings, passiveModel: id })}
      className={cn("flex-1 rounded-md border px-2 py-2 text-left transition-colors", m === id ? "border-fuchsia-400 bg-fuchsia-500/15" : "border-slate-700 bg-black/20")}
    >
      <div className={cn("font-display text-sm", m === id ? "text-fuchsia-100" : "text-slate-300")}>{title}</div>
      <div className="text-[10px] leading-tight text-slate-400">{sub}</div>
    </button>
  );
  return (
    <div className="border-t border-slate-700/60 pt-3" data-testid="passive-model">
      <div className="mb-1.5 text-sm text-slate-300">Тест пассивок</div>
      <div className="flex gap-2">
        {opt("A", "A · 4 слота", "Как оружие: 4 пассивки")}
        {opt("B", "B · без лимита", "Любые уникальные пассивки")}
      </div>
      <p className="mt-1 text-[10px] text-slate-500">Действует со следующего забега</p>
    </div>
  );
}

export function SettingsControls({ settings, onChange }: { settings: Settings; onChange: (s: Settings) => void }) {
  return (
    <div className="space-y-4">
      <Slider label="Звуковые эффекты" icon={<Volume2 size={16} />} value={settings.sfx} onChange={(v) => onChange({ ...settings, sfx: v })} />
      <Slider label="Музыка" icon={<Music size={16} />} value={settings.music} onChange={(v) => onChange({ ...settings, music: v })} />
      <div className="space-y-1 border-t border-slate-700/60 pt-3">
        <Toggle label="Цифры урона" value={settings.damageNumbers} onChange={(v) => onChange({ ...settings, damageNumbers: v })} />
        <Toggle label="Тряска экрана" value={settings.screenShake} onChange={(v) => onChange({ ...settings, screenShake: v })} />
        {isSandbox() && <Toggle label="Режим бога — бессмертие" value={!!settings.godMode} onChange={(v) => onChange({ ...settings, godMode: v })} />}
      </div>
      <PassiveModelPicker settings={settings} onChange={onChange} />
    </div>
  );
}

export function SettingsPanel({
  settings,
  onChange,
  onClose,
  onReset,
  sandbox,
  onSandbox,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
  onClose: () => void;
  onReset?: () => void;
  sandbox?: boolean;
  onSandbox?: (v: boolean) => void;
}) {
  return (
    <div className="fade-in fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="pop-in w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <Panel className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="neon-soft font-display text-2xl text-cyan-200">НАСТРОЙКИ</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X />
            </button>
          </div>
          <SettingsControls settings={settings} onChange={onChange} />
          {onSandbox && (
            <div className="mt-4 rounded-lg border border-amber-400/40 bg-amber-500/5 p-3">
              <Toggle label="Тестовый режим — всё открыто" value={!!sandbox} onChange={onSandbox} />
              <p className="mt-1 text-[11px] leading-snug text-slate-400">
                Все пилоты, планеты и модули, бесконечные кредиты и фрагменты. Это отдельное сохранение: при выключении вернётся твой настоящий прогресс.
              </p>
            </div>
          )}
          <div className="mt-6 flex flex-col gap-2">
            <NeonButton onClick={onClose}>Готово</NeonButton>
            {onReset && (
              <NeonButton
                variant="danger"
                className="text-xs"
                onClick={() => {
                  if (window.confirm(sandbox ? "Пересоздать тестовое сохранение?" : "Сбросить весь прогресс? Кредиты, пилоты и улучшения будут удалены.")) onReset();
                }}
              >
                {sandbox ? "Пересоздать тестовое сохранение" : "Сбросить весь прогресс"}
              </NeonButton>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
