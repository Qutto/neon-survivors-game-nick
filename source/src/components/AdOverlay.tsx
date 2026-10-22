// Заглушка рекламного показа: полноэкранный экран с таймером вместо настоящей рекламной сети
import { useEffect, useState } from "react";
import { MonitorPlay, X } from "lucide-react";
import { AD_MOCK_SECONDS, subscribeAds, type AdRequest } from "../game/ads";
import { audio } from "../game/audio";

export function AdOverlay() {
  const [req, setReq] = useState<AdRequest | null>(null);
  const [left, setLeft] = useState(AD_MOCK_SECONDS);

  useEffect(() => subscribeAds(setReq), []);

  useEffect(() => {
    if (!req) return;
    setLeft(AD_MOCK_SECONDS);
    audio.setMuted(true);
    const t0 = performance.now();
    const id = window.setInterval(() => {
      const l = Math.max(0, AD_MOCK_SECONDS - (performance.now() - t0) / 1000);
      setLeft(l);
      if (l <= 0) window.clearInterval(id);
    }, 100);
    return () => {
      window.clearInterval(id);
      audio.setMuted(false);
    };
  }, [req]);

  if (!req) return null;
  const done = left <= 0;
  const rewarded = req.kind === "rewarded";
  return (
    <div className="fade-in absolute inset-0 z-[80] flex flex-col items-center justify-center gap-5 bg-[#0b0b10] p-6 text-center" data-testid="ad-overlay">
      <div className="absolute left-3 top-3 rounded border border-slate-600 px-2 py-0.5 font-logo text-[10px] tracking-widest text-slate-400">
        РЕКЛАМА · {rewarded ? "ЗА НАГРАДУ" : "МЕЖСТРАНИЧНАЯ"}
      </div>
      {done && (
        <button
          onClick={() => req.resolve(true)}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-slate-500 text-slate-200"
          aria-label="Закрыть рекламу"
        >
          <X size={20} />
        </button>
      )}
      <MonitorPlay size={64} className="text-slate-500" />
      <div className="font-display text-2xl text-slate-200">Здесь будет реклама</div>
      <p className="max-w-xs text-sm text-slate-400">
        Заглушка рекламной сети. Место показа: <b className="text-slate-200">{req.placement}</b>
      </p>
      <div className="font-logo text-4xl tabular-nums text-slate-300">{done ? "✓" : Math.ceil(left)}</div>
      {done ? (
        <button onClick={() => req.resolve(true)} className="rounded-md border border-emerald-400/70 bg-emerald-500/15 px-6 py-3 font-display text-emerald-100">
          {rewarded ? "Получить награду" : "Продолжить"}
        </button>
      ) : (
        rewarded && (
          <button onClick={() => req.resolve(false)} className="text-xs text-slate-500 underline">
            Закрыть без награды
          </button>
        )
      )}
    </div>
  );
}
