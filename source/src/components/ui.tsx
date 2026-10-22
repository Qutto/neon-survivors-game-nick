// Общие UI-компоненты в неоновом стиле
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { showAd } from "../game/ads";
import {
  Activity,
  Anchor,
  Atom,
  Axe,
  BatteryFull,
  Biohazard,
  Bomb,
  Bot,
  Brain,
  BrainCircuit,
  Castle,
  CircleDot,
  CloudLightning,
  Coins,
  Crosshair,
  Diamond,
  Disc3,
  Drill,
  Expand,
  Fan,
  FastForward,
  Flame,
  FlipHorizontal2,
  Focus,
  Footprints,
  Gauge,
  Gavel,
  Hammer,
  HandCoins,
  Heart,
  HeartCrack,
  HeartPulse,
  Hexagon,
  Hourglass,
  Layers,
  LifeBuoy,
  LocateFixed,
  Magnet,
  Network,
  Orbit,
  Radar,
  Radiation,
  RadioTower,
  Recycle,
  Rocket,
  Rows3,
  Satellite,
  ScanEye,
  ScanLine,
  Shield,
  ShieldCheck,
  ShieldHalf,
  ShieldPlus,
  Shuffle,
  Siren,
  Skull,
  Snowflake,
  Sparkles,
  Star,
  Sun,
  Sword,
  Swords,
  Target,
  Telescope,
  ThermometerSnowflake,
  Timer,
  Tornado,
  TriangleAlert,
  Waves,
  Weight,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../utils/cn";
import { audio } from "../game/audio";
import { PASSIVES, SUPERS, WEAPONS, perkDef } from "../game/data";
import { getModule } from "../game/modules";
import { drawSprite, getEnemySprite } from "../game/sprites";

export const ITEM_ICONS: Record<string, LucideIcon> = {
  plasma: Sparkles,
  whip: Sword,
  drones: Orbit,
  emp: Radar,
  missile: Rocket,
  tesla: Zap,
  disc: Disc3,
  strike: Satellite,
  singularity: Atom,
  railgun: Crosshair,
  plasma_evo: Flame,
  whip_evo: Swords,
  drones_evo: Network,
  emp_evo: ShieldCheck,
  missile_evo: Bomb,
  tesla_evo: CloudLightning,
  disc_evo: Fan,
  strike_evo: Sun,
  singularity_evo: Tornado,
  railgun_evo: Radiation,
  might: Brain,
  cooldown: Timer,
  speed: Footprints,
  armor: Shield,
  regen: HeartPulse,
  magnet: Magnet,
  area: Expand,
  amount: Layers,
  projSpeed: FastForward,
  duration: Hourglass,
  maxHp: BatteryFull,
  growth: ScanLine,
  heal: Heart,
  credits: Coins,
  luck: Sparkles,
  greed: Coins,
  rerolls: Layers,
  revival: Heart,
  super_dmg: Flame,
  super_cd: Timer,
  super_armor: Shield,
  super_hp: BatteryFull,
  super_area: Expand,
  mod_overclock: Gauge,
  mod_nanoarmor: ShieldHalf,
  mod_gravcore: Magnet,
  mod_salvager: Recycle,
  mod_collector: Bot,
  mod_scanner: Radar,
  mod_repulsor: Waves,
  // новые пушки и пассивки (столп 07)
  mines: CircleDot,
  turret: RadioTower,
  turret_evo: Castle,
  harpoon: Target,
  harpoon_evo: Axe,
  aegis: ShieldPlus,
  aegis_evo: LifeBuoy,
  tactical: BrainCircuit,
  adrenal: HeartCrack,
  anchor: Anchor,
  // перки-правила (столп 08)
  rule_monolith: Hexagon,
  rule_glass: Diamond,
  rule_heavy: Weight,
  rule_greed: HandCoins,
  rule_chaos: Shuffle,
  rule_magnet: Magnet,
  rule_laststand: TriangleAlert,
  rule_mirror: FlipHorizontal2,
  // оружие и пассивки коллеги
  mg: Rows3,
  mg_evo: Siren,
  sniper: LocateFixed,
  sniper_evo: Telescope,
  cryo: Snowflake,
  cryo_evo: ThermometerSnowflake,
  brand: Skull,
  brand_evo: Biohazard,
  mines_evo: Focus,
  shotgun: Hammer,
  shotgun_evo: Gavel,
  optics: ScanEye,
  breaker: Drill,
  // моды оружия
  wm_dmg: Flame,
  wm_cd: Timer,
  wm_amt: Layers,
  wm_area: Expand,
  wm_crit: Crosshair,
  wm_pierce: Drill,
  mod_shield: ShieldCheck,
  mod_retaliation: Activity,
  mod_chrono: Hourglass,
};

export function itemColor(id: string) {
  return WEAPONS[id]?.color || PASSIVES[id]?.color || SUPERS[id]?.color || getModule(id)?.color || perkDef(id)?.color || (id === "heal" ? "#4ade80" : "#facc15");
}

export function itemName(id: string) {
  return WEAPONS[id]?.name || PASSIVES[id]?.name || SUPERS[id]?.name || getModule(id)?.name || perkDef(id)?.name || id;
}

export function ItemIcon({ id, size = 44, className, color, dim }: { id: string; size?: number; className?: string; color?: string; dim?: boolean }) {
  const c = color || itemColor(id);
  const evolved = !!WEAPONS[id]?.evolved;
  const Icon = ITEM_ICONS[id] || Sparkles;
  return (
    <div
      className={cn("relative grid shrink-0 place-items-center rounded-md", dim && "opacity-40 grayscale", className)}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${c}38, ${c}0a)`,
        border: `1px solid ${c}b0`,
        boxShadow: `0 0 ${size * 0.25}px ${c}55, inset 0 0 ${size * 0.2}px ${c}25`,
      }}
    >
      <Icon size={Math.round(size * 0.55)} color={c} strokeWidth={2} style={{ filter: `drop-shadow(0 0 4px ${c})` }} />
      {evolved && (
        <Star
          className="absolute -right-1.5 -top-1.5"
          size={Math.max(12, size * 0.32)}
          fill="#fde047"
          color="#fde047"
          style={{ filter: "drop-shadow(0 0 4px #fde047)" }}
        />
      )}
    </div>
  );
}

type Variant = "primary" | "ghost" | "gold" | "danger" | "violet" | "green";

const VARIANTS: Record<Variant, string> = {
  primary: "border-cyan-400/70 text-cyan-100 bg-cyan-500/10 hover:bg-cyan-400/20 hover:shadow-[0_0_28px_rgba(34,211,238,0.45)]",
  ghost: "border-slate-500/50 text-slate-200 bg-slate-800/30 hover:bg-slate-700/40 hover:border-slate-300/60",
  gold: "border-amber-400/70 text-amber-100 bg-amber-500/10 hover:bg-amber-400/20 hover:shadow-[0_0_28px_rgba(251,191,36,0.45)]",
  danger: "border-rose-500/70 text-rose-100 bg-rose-500/10 hover:bg-rose-500/20 hover:shadow-[0_0_28px_rgba(244,63,94,0.45)]",
  violet: "border-fuchsia-400/70 text-fuchsia-100 bg-fuchsia-500/10 hover:bg-fuchsia-400/20 hover:shadow-[0_0_28px_rgba(232,121,249,0.45)]",
  green: "border-emerald-400/70 text-emerald-100 bg-emerald-500/10 hover:bg-emerald-400/20 hover:shadow-[0_0_28px_rgba(52,211,153,0.45)]",
};

export function NeonButton({
  variant = "primary",
  className,
  children,
  onClick,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...rest}
      onClick={(e) => {
        audio.init();
        audio.play("click");
        onClick?.(e);
      }}
      className={cn(
        "relative flex items-center justify-center gap-2 rounded-md border px-5 py-3 font-display text-sm uppercase tracking-wider backdrop-blur-sm transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

// Кнопка «за рекламу» (точки показа — как у коллеги): показывает рекламу и даёт награду, только если досмотрели
export function AdButton({
  placement,
  onReward,
  onBusy,
  children,
  className,
  disabled,
}: {
  placement: string;
  onReward: () => void;
  onBusy?: (busy: boolean) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <NeonButton
      variant="green"
      disabled={disabled || busy}
      className={cn("gap-2.5", className)}
      onClick={async (e) => {
        e.stopPropagation();
        setBusy(true);
        onBusy?.(true);
        const ok = await showAd("rewarded", placement);
        setBusy(false);
        onBusy?.(false);
        if (ok) onReward();
      }}
    >
      <span className="flex items-center gap-1 rounded bg-emerald-400/90 px-1.5 py-0.5 font-logo text-[9px] tracking-wider text-black">▶ AD</span>
      {children}
    </NeonButton>
  );
}

export function Panel({ children, className, color = "#22d3ee" }: { children: ReactNode; className?: string; color?: string }) {
  return (
    <div
      className={cn("relative rounded-xl border bg-[#0a0e1f]/85 backdrop-blur-md", className)}
      style={{ borderColor: `${color}55`, boxShadow: `0 0 30px ${color}1f, inset 0 0 30px ${color}0d` }}
    >
      <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2" style={{ borderColor: color }} />
      <span className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2" style={{ borderColor: color }} />
      <span className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2" style={{ borderColor: color }} />
      <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2" style={{ borderColor: color }} />
      {children}
    </div>
  );
}

export function CreditBadge({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 font-logo text-amber-200", className)}>
      <Coins size={16} className="text-amber-300" />
      <span className="tabular-nums">{Math.floor(value).toLocaleString("ru-RU")}</span>
    </div>
  );
}

export function LevelPips({ level, max, color }: { level: number; max: number; color: string }) {
  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 flex-1 rounded-sm"
          style={{ minWidth: 4, background: i < level ? color : "rgba(148,163,184,0.2)", boxShadow: i < level ? `0 0 4px ${color}` : undefined }}
        />
      ))}
    </div>
  );
}

export function formatTime(t: number) {
  const s = Math.max(0, Math.floor(t));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function EnemyPreview({ id, radius, color, size = 64 }: { id: string; radius: number; color: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = size * dpr;
    c.height = size * dpr;
    const g = c.getContext("2d")!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, size, size);
    const s = getEnemySprite(id, radius, color);
    const scale = (size * 0.5) / s.half;
    drawSprite(g, s, size / 2, size / 2, scale);
  }, [id, radius, color, size]);
  return <canvas ref={ref} style={{ width: size, height: size }} />;
}
