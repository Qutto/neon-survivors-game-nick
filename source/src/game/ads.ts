// Реклама — единственная монетизация (столп 01). Сейчас это заглушка: вместо сети показывается экран «РЕКЛАМА» на несколько секунд.
// Подключение реальной сети (Яндекс Игры, CrazyGames SDK, AdMob и т.п.) — заменить тело showAd, остальной код не трогать.

export type AdKind = "rewarded" | "interstitial";

export interface AdRequest {
  kind: AdKind;
  placement: string; // где показываем — для аналитики и текста на заглушке
  resolve: (watched: boolean) => void;
}

// Точки показа — как у коллеги (живая версия): воскрешение, переброс ×3 за забег, повтор контейнера ×2 за забег,
// ×2 к ежедневному контейнеру, ×2 кредита на экране итогов. Межстраничной рекламы и контейнера в ангаре нет.
export const AD_MOCK_SECONDS = 3; // длительность заглушки

type Listener = (r: AdRequest | null) => void;
let current: AdRequest | null = null;
const listeners = new Set<Listener>();

export function subscribeAds(fn: Listener) {
  listeners.add(fn);
  fn(current);
  return () => {
    listeners.delete(fn);
  };
}

function emit() {
  for (const fn of listeners) fn(current);
}

// Показать рекламу. Промис вернёт true, если реклама досмотрена (за награду — только тогда даём награду).
export function showAd(kind: AdKind, placement: string): Promise<boolean> {
  if (current) return Promise.resolve(false);
  return new Promise((resolve) => {
    current = {
      kind,
      placement,
      resolve: (watched) => {
        current = null;
        emit();
        resolve(watched);
      },
    };
    emit();
  });
}
