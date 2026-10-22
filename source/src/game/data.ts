// ============================================================
//  NEON//SURVIVORS — игровые данные (оружие, враги, пилоты...)
// ============================================================

export interface PlayerStats {
  maxHp: number;
  speed: number; // множитель
  armor: number;
  regen: number; // ОЗ в секунду
  might: number; // множитель урона
  area: number;
  cooldown: number; // множитель (меньше — лучше)
  amount: number; // доп. снаряды
  projSpeed: number;
  duration: number;
  magnet: number;
  growth: number;
  luck: number;
  greed: number;
  revival: number;
  rerolls: number;
  skips: number;
  bossDmg: number; // доп. урон по элитам и боссам
  crit: number; // доп. шанс крита (0.05 = +5%)
  armorPen: number; // сколько брони элиток и боссов игнорирует урон
  lowHpMight: number; // доп. урон, пока здоровья меньше половины
  stillMight: number; // доп. урон, пока корабль стоит
}

export type StatKey = keyof PlayerStats;

export const BASE_STATS: PlayerStats = {
  maxHp: 100,
  speed: 1,
  armor: 0,
  regen: 0,
  might: 1,
  area: 1,
  cooldown: 1,
  amount: 0,
  projSpeed: 1,
  duration: 1,
  magnet: 1,
  growth: 1,
  luck: 1,
  greed: 1,
  revival: 0,
  rerolls: 2,
  skips: 2,
  bossDmg: 0,
  crit: 0,
  armorPen: 0,
  lowHpMight: 0,
  stillMight: 0,
};

export const PLAYER_BASE_SPEED = 190;
export const PLAYER_BASE_MAGNET = 72;

// ------------------------------------------------------------
//  Оружие
// ------------------------------------------------------------
export interface WeaponStats {
  damage: number;
  cooldown: number;
  amount: number;
  area: number;
  speed: number;
  duration: number;
  pierce: number;
  knockback: number;
  extra: number;
}

export interface WeaponLevel {
  d: Partial<WeaponStats>;
  text: string;
}

export interface WeaponDef {
  id: string;
  name: string;
  desc: string;
  color: string;
  base: WeaponStats;
  levels: WeaponLevel[]; // уровни 2..max
  evolveWith?: string;
  evolvesInto?: string;
  evolved?: boolean;
  evolvedFrom?: string;
}

const W = (p: Partial<WeaponStats>): WeaponStats => ({
  damage: 10,
  cooldown: 1,
  amount: 1,
  area: 1,
  speed: 400,
  duration: 1,
  pierce: 1,
  knockback: 1,
  extra: 0,
  ...p,
});

export const WEAPONS: Record<string, WeaponDef> = {
  plasma: {
    id: "plasma",
    name: "Плазменный бластер",
    desc: "Выпускает плазменные заряды в ближайших врагов.",
    color: "#22d3ee",
    base: W({ damage: 10, cooldown: 1.0, amount: 1, speed: 540, duration: 1.4, pierce: 1, knockback: 1 }),
    levels: [
      { d: { amount: 1 }, text: "+1 снаряд" },
      { d: { damage: 5, cooldown: -0.1 }, text: "Урон +5, перезарядка −0.1с" },
      { d: { amount: 1 }, text: "+1 снаряд" },
      { d: { pierce: 1, damage: 5 }, text: "Пробивание +1, урон +5" },
      { d: { amount: 1, cooldown: -0.1 }, text: "+1 снаряд, перезарядка −0.1с" },
    ],
    evolveWith: "cooldown",
    evolvesInto: "plasma_evo",
  },
  whip: {
    id: "whip",
    name: "Энергоклинок",
    desc: "Рассекает пространство перед пилотом лазерной дугой.",
    color: "#f43f5e",
    // бьёт в обе стороны с первого уровня: бот и игрок постоянно отходят, удар в одну сторону почти не попадал
    base: W({ damage: 18, cooldown: 1.2, amount: 2, area: 1, duration: 0.22, knockback: 2.2 }),
    levels: [
      { d: { damage: 5, area: 0.1 }, text: "Урон +5, площадь +10%" },
      { d: { damage: 6 }, text: "Урон +6" },
      { d: { area: 0.15, damage: 4 }, text: "Площадь +15%, урон +4" },
      { d: { damage: 6, cooldown: -0.1 }, text: "Урон +6, перезарядка −0.1с" },
      { d: { area: 0.2, damage: 6 }, text: "Площадь +20%, урон +6" },
    ],
    evolveWith: "regen",
    evolvesInto: "whip_evo",
  },
  drones: {
    id: "drones",
    name: "Орбитальные дроны",
    desc: "Боевые дроны вращаются вокруг пилота и таранят врагов.",
    color: "#a78bfa",
    base: W({ damage: 9, cooldown: 3.0, amount: 2, area: 1, speed: 3.2, duration: 2.8, knockback: 1.6 }),
    levels: [
      { d: { amount: 1 }, text: "+1 дрон" },
      { d: { speed: 0.8, damage: 4 }, text: "Скорость вращения +25%, урон +4" },
      { d: { duration: 0.7, area: 0.15 }, text: "Длительность +0.7с, площадь +15%" },
      { d: { amount: 1 }, text: "+1 дрон" },
      { d: { damage: 6, duration: 0.7 }, text: "Урон +6, длительность +0.7с" },
    ],
    evolveWith: "area",
    evolvesInto: "drones_evo",
  },
  emp: {
    id: "emp",
    name: "ЭМИ-поле",
    desc: "Импульсное поле постоянно поражает врагов вокруг пилота.",
    color: "#38bdf8",
    base: W({ damage: 5, cooldown: 0.7, area: 1, knockback: 0.5 }),
    levels: [
      { d: { area: 0.2, damage: 2 }, text: "Радиус +20%, урон +2" },
      { d: { cooldown: -0.1 }, text: "Частота импульсов +15%" },
      { d: { area: 0.2, damage: 2 }, text: "Радиус +20%, урон +2" },
      { d: { damage: 3, cooldown: -0.1 }, text: "Урон +3, частота +15%" },
      { d: { area: 0.25, damage: 3 }, text: "Радиус +25%, урон +3" },
    ],
    evolveWith: "armor",
    evolvesInto: "emp_evo",
  },
  missile: {
    id: "missile",
    name: "Ракетный модуль",
    desc: "Самонаводящиеся микроракеты взрываются при попадании.",
    color: "#fb923c",
    base: W({ damage: 18, cooldown: 2.2, amount: 1, area: 1, speed: 310, duration: 3, knockback: 2 }),
    levels: [
      { d: { amount: 1 }, text: "+1 ракета" },
      { d: { damage: 10 }, text: "Урон +10" },
      { d: { area: 0.25 }, text: "Радиус взрыва +25%" },
      { d: { amount: 1 }, text: "+1 ракета" },
      { d: { damage: 12, cooldown: -0.4 }, text: "Урон +12, перезарядка −0.4с" },
    ],
    evolveWith: "amount",
    evolvesInto: "missile_evo",
  },
  tesla: {
    id: "tesla",
    name: "Тесла-катушка",
    desc: "Цепная молния перескакивает между врагами.",
    color: "#facc15",
    base: W({ damage: 14, cooldown: 1.5, amount: 1, area: 1, extra: 3, knockback: 0 }),
    levels: [
      { d: { extra: 1 }, text: "+1 цель цепи" },
      { d: { damage: 6 }, text: "Урон +6" },
      { d: { amount: 1 }, text: "+1 разряд" },
      { d: { extra: 2 }, text: "+2 цели цепи" },
      { d: { damage: 8, cooldown: -0.3 }, text: "Урон +8, перезарядка −0.3с" },
    ],
    evolveWith: "maxHp",
    evolvesInto: "tesla_evo",
  },
  disc: {
    id: "disc",
    name: "Плазменный диск",
    desc: "Режущий диск летит к врагу и возвращается обратно.",
    color: "#2dd4bf",
    base: W({ damage: 15, cooldown: 1.7, amount: 1, area: 1, speed: 440, duration: 2.2, pierce: 999, knockback: 2.4 }),
    levels: [
      { d: { amount: 1 }, text: "+1 диск" },
      { d: { damage: 7 }, text: "Урон +7" },
      { d: { area: 0.25, speed: 60 }, text: "Размер +25%, скорость +15%" },
      { d: { amount: 1 }, text: "+1 диск" },
      { d: { damage: 10 }, text: "Урон +10" },
    ],
    evolveWith: "projSpeed",
    evolvesInto: "disc_evo",
  },
  strike: {
    id: "strike",
    name: "Орбитальный удар",
    desc: "Спутник наносит удары лучом по случайным целям.",
    color: "#fde047",
    base: W({ damage: 28, cooldown: 2.8, amount: 2, area: 1, duration: 0.55, knockback: 1 }),
    levels: [
      { d: { amount: 1 }, text: "+1 удар" },
      { d: { damage: 14, area: 0.1 }, text: "Урон +14, радиус +10%" },
      { d: { amount: 1 }, text: "+1 удар" },
      { d: { cooldown: -0.5 }, text: "Перезарядка −0.5с" },
      { d: { amount: 1, damage: 16 }, text: "+1 удар, урон +16" },
    ],
    evolveWith: "growth",
    evolvesInto: "strike_evo",
  },
  singularity: {
    id: "singularity",
    name: "Сингулярность",
    desc: "Создаёт гравитационный колодец, затягивающий врагов.",
    color: "#c084fc",
    // инструмент контроля: стягивает толпу под другое оружие, урон — второстепенный (нерф, HISTORY п. 16)
    // притяжение ослаблено вдвое (HISTORY п. 18): колодец стягивает, но не превращает толпу в одну точку
    base: W({ damage: 2, cooldown: 4.6, amount: 1, area: 1, duration: 2.4, extra: 65, knockback: 0 }),
    levels: [
      { d: { extra: 20 }, text: "Сила притяжения +30%" },
      { d: { area: 0.2 }, text: "Радиус +20%" },
      { d: { duration: 1 }, text: "Длительность +1с" },
      { d: { amount: 1 }, text: "+1 колодец" },
      { d: { damage: 1, area: 0.15, extra: 15 }, text: "Урон +1, радиус +15%, притяжение +20%" },
    ],
    evolveWith: "duration",
    evolvesInto: "singularity_evo",
  },
  railgun: {
    id: "railgun",
    name: "Рельсотрон",
    desc: "Пробивает всех врагов на линии огня сверхзвуковым снарядом.",
    color: "#60a5fa",
    base: W({ damage: 42, cooldown: 2.5, amount: 1, area: 1, knockback: 3 }),
    levels: [
      { d: { damage: 16 }, text: "Урон +16" },
      { d: { amount: 1 }, text: "+1 выстрел веером" },
      { d: { cooldown: -0.4 }, text: "Перезарядка −0.4с" },
      { d: { damage: 20, area: 0.3 }, text: "Урон +20, ширина луча +30%" },
      { d: { amount: 1 }, text: "+1 выстрел веером" },
    ],
    evolveWith: "might",
    evolvesInto: "railgun_evo",
  },

  // ---------------- Новые роли (вижн, столп 07) ----------------
  // ---------------- Контент коллеги (живая версия, «13 пилотов, 6 новых видов оружия») ----------------
  // Курсовое оружие: стреляет туда, куда летит корабль — целишься движением, а не кнопкой
  mg: {
    id: "mg",
    name: "Пулемёт «Шквал»",
    desc: "Очередь пуль туда, куда летит корабль. Целишься движением.",
    color: "#f87171",
    base: W({ damage: 6, cooldown: 0.9, amount: 3, speed: 820, duration: 0.65, pierce: 1, knockback: 0.4 }),
    levels: [
      { d: { amount: 1 }, text: "+1 пуля в очереди" },
      { d: { amount: 1, damage: 3 }, text: "+1 пуля, урон +3" },
      { d: { pierce: 1 }, text: "Пробивание +1" },
      { d: { amount: 2 }, text: "+2 пули в очереди" },
      { d: { damage: 3, pierce: 1 }, text: "Урон +3, пробивание +1" },
    ],
    evolveWith: "speed",
    evolvesInto: "mg_evo",
  },
  // Против боссов: пуля в самого живучего врага, остаток урона после убийства рикошетит дальше
  sniper: {
    id: "sniper",
    name: "Снайперская винтовка",
    desc: "Пуля в самого живучего врага. Если убила — остаток урона рикошетит дальше (до 3 раз).",
    color: "#e2e8f0",
    base: W({ damage: 90, cooldown: 2.6, amount: 1, knockback: 3 }),
    levels: [
      { d: { damage: 40 }, text: "Урон +40" },
      { d: { cooldown: -0.4 }, text: "Заряд быстрее на 0.4с" },
      { d: { damage: 50 }, text: "Урон +50" },
      { d: { amount: 1 }, text: "+1 цель за выстрел" },
      { d: { damage: 60, cooldown: -0.3 }, text: "Урон +60, заряд −0.3с" },
    ],
    evolveWith: "optics",
    evolvesInto: "sniper_evo",
  },
  // Контроль: вращающийся луч замораживает. speed — скорость вращения, duration — заморозка
  cryo: {
    id: "cryo",
    name: "Криолуч",
    desc: "Ледяной луч вращается вокруг корабля и замораживает врагов. По замороженным урон +30%.",
    color: "#7dd3fc",
    base: W({ damage: 9, cooldown: 0, amount: 1, area: 1, speed: 1.7, duration: 1.2, knockback: 0 }),
    levels: [
      { d: { damage: 4 }, text: "Урон +4" },
      { d: { area: 0.2 }, text: "Луч длиннее на 20%" },
      { d: { duration: 0.5 }, text: "Заморозка +0.5с" },
      { d: { amount: 1 }, text: "+1 луч" },
      { d: { damage: 6, speed: 0.4 }, text: "Урон +6, вращение быстрее" },
    ],
    evolveWith: "breaker",
    evolvesInto: "cryo_evo",
  },
  // Усиление: метка поджигает, а меченые получают больше урона от всего оружия. extra — стопки горения
  brand: {
    id: "brand",
    name: "Метка смерти",
    desc: "Клеймо поджигает врага, а меченые получают +50% урона от всего оружия.",
    color: "#e879f9",
    base: W({ damage: 6, cooldown: 1, amount: 1, duration: 4, extra: 3, knockback: 0 }),
    levels: [
      { d: { damage: 3 }, text: "Горение +3 урона/с" },
      { d: {}, text: "Огонь перекидывается на соседей при смерти" },
      { d: { amount: 1 }, text: "+1 метка за раз" },
      { d: { extra: 2 }, text: "Стопок горения 3 → 5" },
      { d: { damage: 4, duration: 1 }, text: "Горение +4 урона/с и +1с" },
    ],
    evolveWith: "tactical",
    evolvesInto: "brand_evo",
  },
  // Ловушки: мины позади корабля, взрываются, когда враг наступает
  mines: {
    id: "mines",
    name: "Гравимины",
    desc: "Мины позади корабля. Взрываются, когда враг наступает.",
    color: "#a3e635",
    base: W({ damage: 40, cooldown: 1.6, amount: 1, area: 1, duration: 10, knockback: 2 }),
    levels: [
      { d: { damage: 15 }, text: "Урон +15" },
      { d: { amount: 1 }, text: "+1 мина" },
      { d: { area: 0.25 }, text: "Радиус взрыва +25%" },
      { d: { damage: 20, cooldown: -0.3 }, text: "Урон +20, перезарядка −0.3с" },
      { d: { amount: 1 }, text: "+1 мина" },
    ],
    evolveWith: "magnet",
    evolvesInto: "mines_evo",
  },
  // Ближний круг: веер дроби, урон падает с расстоянием
  shotgun: {
    id: "shotgun",
    name: "Дробовик",
    desc: "Веер дроби в ближайшего врага. Страшен вплотную, слабеет с расстоянием.",
    color: "#818cf8",
    base: W({ damage: 14, cooldown: 1.2, amount: 7, speed: 620, duration: 0.38, pierce: 1, knockback: 2.5 }),
    levels: [
      { d: { damage: 5 }, text: "Урон дроби +5" },
      { d: { amount: 2 }, text: "+2 дробины" },
      { d: { cooldown: -0.2 }, text: "Перезарядка −0.2с" },
      { d: { pierce: 1 }, text: "Дробь пробивает +1 врага" },
      { d: { damage: 6, amount: 2 }, text: "Урон +6, +2 дробины" },
    ],
    evolveWith: "armor",
    evolvesInto: "shotgun_evo",
  },
  // Точка обороны: турель ставится там, где стоит корабль. extra — пауза между выстрелами ×100.
  turret: {
    id: "turret",
    name: "Сторожевая турель",
    desc: "Ставит турель, которая сама стреляет по ближайшим врагам.",
    color: "#38bdf8",
    base: W({ damage: 9, cooldown: 7, amount: 1, area: 1, speed: 520, duration: 6, pierce: 1, knockback: 0.8, extra: 45 }),
    levels: [
      { d: { damage: 5 }, text: "Урон +5" },
      { d: { duration: 2 }, text: "Турель работает на 2 с дольше" },
      { d: { amount: 1 }, text: "+1 турель" },
      { d: { cooldown: -1.5, extra: -10 }, text: "Ставится чаще, стреляет быстрее" },
      { d: { damage: 8, pierce: 1 }, text: "Урон +8, пробивание +1" },
    ],
    evolveWith: "anchor",
    evolvesInto: "turret_evo",
  },
  // Противобоссовое: бьёт самую толстую цель, по элиткам и боссам — ещё и % от их здоровья. extra — % ×10.
  harpoon: {
    id: "harpoon",
    name: "Гарпун-деструктор",
    desc: "Бьёт самую живучую цель рядом. По элитным врагам и боссам — ещё и процентом от их здоровья.",
    color: "#e11d48",
    base: W({ damage: 30, cooldown: 2.6, amount: 1, area: 1, speed: 620, duration: 1.4, pierce: 1, knockback: 2, extra: 10 }),
    levels: [
      { d: { damage: 15 }, text: "Урон +15" },
      { d: { cooldown: -0.4 }, text: "Перезарядка −0.4с" },
      { d: { extra: 5 }, text: "+0.5% здоровья цели" },
      { d: { amount: 1 }, text: "+1 гарпун" },
      { d: { damage: 25, extra: 5 }, text: "Урон +25, +0.5% здоровья цели" },
    ],
    evolveWith: "tactical",
    evolvesInto: "harpoon_evo",
  },
  // Поддержка: импульс лечит и отталкивает толпу. extra — лечение за импульс.
  aegis: {
    id: "aegis",
    name: "Щит-проектор",
    desc: "Импульс чинит корабль и отбрасывает врагов вокруг.",
    color: "#4ade80",
    base: W({ damage: 10, cooldown: 6, amount: 1, area: 1, knockback: 3, extra: 3 }),
    levels: [
      { d: { extra: 1 }, text: "Лечение +1" },
      { d: { cooldown: -1 }, text: "Импульс на 1 с чаще" },
      { d: { area: 0.25 }, text: "Радиус +25%" },
      { d: { damage: 10, extra: 1 }, text: "Урон +10, лечение +1" },
      { d: { cooldown: -1 }, text: "Импульс на 1 с чаще" },
    ],
    evolveWith: "adrenal",
    evolvesInto: "aegis_evo",
  },

  // ---------------- Эволюции ----------------
  plasma_evo: {
    id: "plasma_evo",
    name: "Плазменная буря",
    desc: "Непрерывный шквал пробивающей плазмы.",
    color: "#67e8f9",
    base: W({ damage: 18, cooldown: 0.34, amount: 3, speed: 660, duration: 1.4, pierce: 3, knockback: 0.8 }),
    levels: [],
    evolved: true,
    evolvedFrom: "plasma",
  },
  whip_evo: {
    id: "whip_evo",
    name: "Нано-жнец",
    desc: "Гигантская дуга: удар, задевший врагов, чинит 1 ОЗ.",
    color: "#fb7185",
    base: W({ damage: 34, cooldown: 1.0, amount: 2, area: 1.5, duration: 0.25, knockback: 3 }),
    levels: [],
    evolved: true,
    evolvedFrom: "whip",
  },
  drones_evo: {
    id: "drones_evo",
    name: "Гало-рой",
    desc: "Шесть дронов вращаются вокруг пилота без перерыва.",
    color: "#c4b5fd",
    base: W({ damage: 18, cooldown: 0, amount: 6, area: 1.35, speed: 4.4, duration: 999, knockback: 2 }),
    levels: [],
    evolved: true,
    evolvedFrom: "drones",
  },
  emp_evo: {
    id: "emp_evo",
    name: "Квантовый барьер",
    desc: "Огромное поле наносит урон и замедляет врагов на 50%.",
    color: "#7dd3fc",
    base: W({ damage: 14, cooldown: 0.4, area: 2.1, knockback: 0.8 }),
    levels: [],
    evolved: true,
    evolvedFrom: "emp",
  },
  missile_evo: {
    id: "missile_evo",
    name: "Кассетный залп",
    desc: "Залп ракет, каждая из которых рассыпается на кассетные бомбы.",
    color: "#fdba74",
    base: W({ damage: 32, cooldown: 1.6, amount: 4, area: 1.4, speed: 340, duration: 3, knockback: 2.5 }),
    levels: [],
    evolved: true,
    evolvedFrom: "missile",
  },
  tesla_evo: {
    id: "tesla_evo",
    name: "Грозовой реактор",
    desc: "Мощнейшие разряды оглушают все цели в цепи.",
    color: "#fef08a",
    base: W({ damage: 26, cooldown: 0.9, amount: 3, area: 1.3, extra: 8, knockback: 0 }),
    levels: [],
    evolved: true,
    evolvedFrom: "tesla",
  },
  disc_evo: {
    id: "disc_evo",
    name: "Вихревые лезвия",
    desc: "Четыре огромных диска перемалывают всё на своём пути.",
    color: "#5eead4",
    base: W({ damage: 28, cooldown: 1.2, amount: 4, area: 1.6, speed: 530, duration: 2.4, pierce: 999, knockback: 3 }),
    levels: [],
    evolved: true,
    evolvedFrom: "disc",
  },
  strike_evo: {
    id: "strike_evo",
    name: "Копьё небес",
    desc: "Орбитальная группировка обрушивает шквал лучей.",
    color: "#fef9c3",
    base: W({ damage: 55, cooldown: 2.0, amount: 7, area: 1.4, duration: 0.45, knockback: 1.5 }),
    levels: [],
    evolved: true,
    evolvedFrom: "strike",
  },
  singularity_evo: {
    id: "singularity_evo",
    name: "Горизонт событий",
    desc: "Мощные чёрные дыры стягивают целые толпы и в конце коллапсируют взрывом.",
    color: "#e9d5ff",
    base: W({ damage: 2, cooldown: 4.0, amount: 2, area: 1.4, duration: 3.5, extra: 130, knockback: 0 }),
    levels: [],
    evolved: true,
    evolvedFrom: "singularity",
  },
  railgun_evo: {
    id: "railgun_evo",
    name: "Аннигилятор",
    desc: "Тройной луч антиматерии стирает врагов из реальности.",
    color: "#93c5fd",
    base: W({ damage: 110, cooldown: 1.7, amount: 3, area: 2.2, knockback: 4 }),
    levels: [],
    evolved: true,
    evolvedFrom: "railgun",
  },
  mg_evo: {
    id: "mg_evo",
    name: "Буря свинца",
    desc: "Сплошной поток пуль. Чем быстрее летишь, тем быстрее стреляет.",
    color: "#fca5a5",
    base: W({ damage: 11, cooldown: 0.07, amount: 1, speed: 900, duration: 0.7, pierce: 2, knockback: 0.3 }),
    levels: [],
    evolved: true,
    evolvedFrom: "mg",
  },
  sniper_evo: {
    id: "sniper_evo",
    name: "Прицел бога",
    desc: "Две пули за выстрел, и каждая — критическая.",
    color: "#ffffff",
    base: W({ damage: 260, cooldown: 1.6, amount: 2, knockback: 4 }),
    levels: [],
    evolved: true,
    evolvedFrom: "sniper",
  },
  cryo_evo: {
    id: "cryo_evo",
    name: "Абсолютный ноль",
    desc: "Два длинных луча. Замёрзшие при смерти разлетаются осколками, броня их не спасает.",
    color: "#e0f2fe",
    base: W({ damage: 22, cooldown: 0, amount: 2, area: 1.5, speed: 2.2, duration: 1.8, knockback: 0 }),
    levels: [],
    evolved: true,
    evolvedFrom: "cryo",
  },
  brand_evo: {
    id: "brand_evo",
    name: "Приговор",
    desc: "Огонь не гаснет, а смерть горящего поджигает всех вокруг.",
    color: "#f0abfc",
    base: W({ damage: 14, cooldown: 0.8, amount: 3, duration: 999, extra: 5, knockback: 0 }),
    levels: [],
    evolved: true,
    evolvedFrom: "brand",
  },
  mines_evo: {
    id: "mines_evo",
    name: "Минное поле",
    desc: "Мины притягивают врагов и взрываются кучей.",
    color: "#bef264",
    base: W({ damage: 80, cooldown: 1, amount: 3, area: 1.4, duration: 12, knockback: 3 }),
    levels: [],
    evolved: true,
    evolvedFrom: "mines",
  },
  shotgun_evo: {
    id: "shotgun_evo",
    name: "Разрыватель",
    desc: "Двенадцать дробин и ударная волна с каждым выстрелом.",
    color: "#a5b4fc",
    base: W({ damage: 24, cooldown: 0.9, amount: 12, speed: 660, duration: 0.42, pierce: 2, knockback: 3.5 }),
    levels: [],
    evolved: true,
    evolvedFrom: "shotgun",
  },
  turret_evo: {
    id: "turret_evo",
    name: "Огневая точка",
    desc: "Две тяжёлые турели бьют веером по три снаряда.",
    color: "#7dd3fc",
    base: W({ damage: 18, cooldown: 5, amount: 2, area: 1.2, speed: 600, duration: 9, pierce: 2, knockback: 1, extra: 30 }),
    levels: [],
    evolved: true,
    evolvedFrom: "turret",
  },
  harpoon_evo: {
    id: "harpoon_evo",
    name: "Разрушитель титанов",
    desc: "Два гарпуна рвут броню самых живучих целей.",
    color: "#fb7185",
    base: W({ damage: 80, cooldown: 1.8, amount: 2, area: 1.3, speed: 700, duration: 1.4, pierce: 2, knockback: 3, extra: 30 }),
    levels: [],
    evolved: true,
    evolvedFrom: "harpoon",
  },
  aegis_evo: {
    id: "aegis_evo",
    name: "Бастион",
    desc: "Мощный импульс лечит, отбрасывает толпу и ставит барьер на один удар.",
    color: "#86efac",
    base: W({ damage: 30, cooldown: 3.5, amount: 1, area: 1.6, knockback: 4, extra: 5 }),
    levels: [],
    evolved: true,
    evolvedFrom: "aegis",
  },
};

export const BASE_WEAPON_IDS = ["plasma", "whip", "drones", "emp", "missile", "tesla", "disc", "strike", "singularity", "railgun", "mg", "sniper", "cryo", "brand", "mines", "shotgun", "turret", "harpoon", "aegis"];

// Роль оружия в билде (столп 07: новая пушка закрывает роль, а не дублирует цифры)
export const WEAPON_ROLES: Record<string, string> = {
  plasma: "Точечный урон",
  railgun: "Точечный урон",
  whip: "Ближний круг",
  drones: "Ближний круг",
  emp: "Ближний круг",
  missile: "Площадь",
  strike: "Площадь",
  tesla: "Цепь",
  disc: "Цепь",
  singularity: "Контроль",
  mg: "Курсовой огонь",
  sniper: "Против боссов",
  cryo: "Контроль",
  brand: "Усиление",
  mines: "Ловушки",
  shotgun: "Ближний круг",
  turret: "Точка обороны",
  harpoon: "Против боссов",
  aegis: "Поддержка",
};

// Моды оружия (контент коллеги): карта уровня для прокачанной до предела или эволюционировавшей пушки.
// Глубина внутри пушки, а не ширина билда — хорошо ложится на 4 слота.
export interface WeaponModDef {
  id: string;
  name: string;
  desc: string;
  color: string;
}
export const WEAPON_MODS: WeaponModDef[] = [
  { id: "wm_dmg", name: "Разгон", desc: "+25% урона этого оружия", color: "#f87171" },
  { id: "wm_cd", name: "Скорострельность", desc: "−15% перезарядки этого оружия", color: "#38bdf8" },
  { id: "wm_amt", name: "Сдвоенный", desc: "+1 снаряд этого оружия", color: "#e879f9" },
  { id: "wm_area", name: "Расширитель", desc: "+25% площади и радиуса этого оружия", color: "#fbbf24" },
  { id: "wm_crit", name: "Прицельный", desc: "+15% шанса крита этого оружия", color: "#fde047" },
  { id: "wm_pierce", name: "Бронебойный", desc: "+1 пробивание, игнорирует 3 брони элиток и боссов", color: "#94a3b8" },
];
export const MAX_WEAPON_MODS = 3;

// Броня элиток и боссов (контент коллеги): вычитается из удара, но удар не слабее 30%.
// Растёт со «временем планеты». Пробивают «Бронебой», мод «Бронебойный», заморозка «Абсолютного нуля».
// У коллеги 1 + t/120 и 3 + t/100 при забеге 10–15 минут; у нас бои с боссами короче и плотнее — броня мягче:
// элитка 1 → ~4, босс 2.7 (середина) → ~5 (финал).
export const ELITE_ARMOR = (t: number) => 1 + t / 150;
export const BOSS_ARMOR = (t: number) => 2 + t / 150;
export const ARMOR_MIN_HIT = 0.3;

export function weaponMaxLevel(def: WeaponDef) {
  return def.levels.length + 1;
}

export function weaponStatsAt(def: WeaponDef, level: number): WeaponStats {
  const s: WeaponStats = { ...def.base };
  for (let i = 0; i < level - 1 && i < def.levels.length; i++) {
    const d = def.levels[i].d;
    (Object.keys(d) as (keyof WeaponStats)[]).forEach((k) => {
      s[k] += d[k] as number;
    });
  }
  return s;
}

// ------------------------------------------------------------
//  Пассивные модули
// ------------------------------------------------------------
export interface PassiveDef {
  id: string;
  name: string;
  desc: string;
  color: string;
  stat: StatKey;
  perLevel: number;
  maxLevel: number;
}

export const PASSIVES: Record<string, PassiveDef> = {
  might: { id: "might", name: "Нейроусилитель", desc: "+10% к урону", color: "#f87171", stat: "might", perLevel: 0.1, maxLevel: 5 },
  cooldown: { id: "cooldown", name: "Ускоритель частиц", desc: "−8% перезарядки оружия", color: "#38bdf8", stat: "cooldown", perLevel: -0.08, maxLevel: 5 },
  speed: { id: "speed", name: "Сервоприводы", desc: "+10% скорости движения", color: "#4ade80", stat: "speed", perLevel: 0.1, maxLevel: 5 },
  armor: { id: "armor", name: "Нанокомпозит", desc: "+1 к броне", color: "#94a3b8", stat: "armor", perLevel: 1, maxLevel: 5 },
  regen: { id: "regen", name: "Нанорегенератор", desc: "+0.15 ОЗ в секунду", color: "#f472b6", stat: "regen", perLevel: 0.15, maxLevel: 5 },
  magnet: { id: "magnet", name: "Гравимагнит", desc: "+30% радиуса сбора", color: "#a78bfa", stat: "magnet", perLevel: 0.3, maxLevel: 5 },
  area: { id: "area", name: "Усилитель поля", desc: "+10% площади атак", color: "#fbbf24", stat: "area", perLevel: 0.1, maxLevel: 5 },
  amount: { id: "amount", name: "Мультипликатор", desc: "+1 снаряд для всего оружия", color: "#e879f9", stat: "amount", perLevel: 1, maxLevel: 2 },
  projSpeed: { id: "projSpeed", name: "Гироскоп", desc: "+10% скорости снарядов", color: "#2dd4bf", stat: "projSpeed", perLevel: 0.1, maxLevel: 5 },
  duration: { id: "duration", name: "Хронодвигатель", desc: "+10% длительности эффектов", color: "#818cf8", stat: "duration", perLevel: 0.1, maxLevel: 5 },
  maxHp: { id: "maxHp", name: "Энергоячейка", desc: "+20 к макс. здоровью", color: "#fb7185", stat: "maxHp", perLevel: 20, maxLevel: 5 },
  growth: { id: "growth", name: "Квантовый сканер", desc: "+8% к получаемому опыту", color: "#a3e635", stat: "growth", perLevel: 0.08, maxLevel: 5 },
  // контент коллеги
  optics: { id: "optics", name: "Оптика", desc: "+5% шанса крита", color: "#e2e8f0", stat: "crit", perLevel: 0.05, maxLevel: 5 },
  breaker: { id: "breaker", name: "Бронебой", desc: "Игнорирует 2 брони элиток и боссов", color: "#f59e0b", stat: "armorPen", perLevel: 2, maxLevel: 5 },
  // «Тактический ИИ» был и у нас, и у коллеги с одинаковым смыслом — оставлен один
  tactical: { id: "tactical", name: "Тактический ИИ", desc: "+10% урона по элиткам и боссам", color: "#f0abfc", stat: "bossDmg", perLevel: 0.1, maxLevel: 5 },
  // новые пассивки-условия (столп 07)
  adrenal: { id: "adrenal", name: "Адреналиновый контур", desc: "+12% урона, пока здоровья меньше половины", color: "#f43f5e", stat: "lowHpMight", perLevel: 0.12, maxLevel: 5 },
  anchor: { id: "anchor", name: "Якорь стабилизации", desc: "+10% урона, пока корабль стоит на месте", color: "#7dd3fc", stat: "stillMight", perLevel: 0.1, maxLevel: 5 },
};

export const PASSIVE_IDS = Object.keys(PASSIVES);

// Столп 05: 4 слота оружия — билд надо продумывать
export const MAX_WEAPONS = 4;
// Столп 06: тест двух моделей пассивок — A (4 слота) или B (без лимита уникальных)
export type PassiveModel = "A" | "B";
export function maxPassives(model: PassiveModel | undefined) {
  return model === "B" ? PASSIVE_IDS.length : 4;
}
// Слотов меньше — каждая пушка весит больше
export const SLOT_DMG_MUL = 1.3;

// ------------------------------------------------------------
//  Враги
// ------------------------------------------------------------
export type EnemyKind = "chaser" | "gunner" | "kamikaze" | "phantom" | "boss" | "crate" | "nest";

export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  speed: number;
  damage: number;
  radius: number;
  xp: number;
  color: string;
  kind: EnemyKind;
  kbResist: number;
  sprite?: string; // чей рисунок использовать (по умолчанию — id)
  planet?: string; // на какой планете встречается (для базы данных)
}

export const ENEMIES: Record<string, EnemyDef> = {
  drone: { id: "drone", name: "Дрон-разведчик", hp: 7, speed: 70, damage: 5, radius: 12, xp: 1, color: "#f43f5e", kind: "chaser", kbResist: 0 },
  swarm: { id: "swarm", name: "Наномошка", hp: 3, speed: 96, damage: 3, radius: 8, xp: 1, color: "#e879f9", kind: "chaser", kbResist: 0 },
  trooper: { id: "trooper", name: "Киборг-пехотинец", hp: 26, speed: 58, damage: 8, radius: 15, xp: 2, color: "#fb923c", kind: "chaser", kbResist: 0.2 },
  crawler: { id: "crawler", name: "Мутант-краулер", hp: 18, speed: 106, damage: 7, radius: 13, xp: 2, color: "#a3e635", kind: "chaser", kbResist: 0.1 },
  gunner: { id: "gunner", name: "Бот-стрелок", hp: 30, speed: 52, damage: 7, radius: 15, xp: 3, color: "#facc15", kind: "gunner", kbResist: 0.2 },
  kamikaze: { id: "kamikaze", name: "Дрон-камикадзе", hp: 12, speed: 145, damage: 18, radius: 12, xp: 2, color: "#ef4444", kind: "kamikaze", kbResist: 0 },
  mech: { id: "mech", name: "Тяжёлый мех", hp: 140, speed: 42, damage: 15, radius: 25, xp: 7, color: "#f59e0b", kind: "chaser", kbResist: 0.7 },
  phantom: { id: "phantom", name: "Фантом", hp: 45, speed: 84, damage: 10, radius: 14, xp: 3, color: "#67e8f9", kind: "phantom", kbResist: 0.3 },
  brute: { id: "brute", name: "Штурмовой голем", hp: 320, speed: 46, damage: 22, radius: 30, xp: 14, color: "#c084fc", kind: "chaser", kbResist: 0.85 },
  crate: { id: "crate", name: "Контейнер снабжения", hp: 1, speed: 0, damage: 0, radius: 16, xp: 0, color: "#38bdf8", kind: "crate", kbResist: 1 },
  sentinel: { id: "sentinel", name: "СТРАЖ-01", hp: 2600, speed: 64, damage: 20, radius: 46, xp: 120, color: "#f43f5e", kind: "boss", kbResist: 1 },
  queen: { id: "queen", name: "КОРОЛЕВА УЛЬЯ", hp: 7000, speed: 52, damage: 26, radius: 54, xp: 220, color: "#d946ef", kind: "boss", kbResist: 1 },
  omega: { id: "omega", name: "ОМЕГА-ЯДРО", hp: 22000, speed: 58, damage: 34, radius: 66, xp: 0, color: "#ef4444", kind: "boss", kbResist: 1 },

  // Нео-Терра — финальный босс
  dreadnought: { id: "dreadnought", name: "ОСАДНЫЙ ДРЕДНОУТ", hp: 7000, speed: 50, damage: 26, radius: 58, xp: 220, color: "#f59e0b", kind: "boss", kbResist: 1, sprite: "sentinel", planet: "home" },

  // Крио-7
  frost_drone: { id: "frost_drone", name: "Морозный дрон", hp: 8, speed: 72, damage: 5, radius: 12, xp: 1, color: "#7dd3fc", kind: "chaser", kbResist: 0, sprite: "drone", planet: "ice" },
  snowmite: { id: "snowmite", name: "Снежный клещ", hp: 4, speed: 100, damage: 3, radius: 8, xp: 1, color: "#e0f2fe", kind: "chaser", kbResist: 0, sprite: "swarm", planet: "ice" },
  cryo_trooper: { id: "cryo_trooper", name: "Криопехотинец", hp: 30, speed: 58, damage: 8, radius: 15, xp: 2, color: "#93c5fd", kind: "chaser", kbResist: 0.25, sprite: "trooper", planet: "ice" },
  ice_crawler: { id: "ice_crawler", name: "Ледяной краулер", hp: 20, speed: 118, damage: 7, radius: 13, xp: 2, color: "#a5f3fc", kind: "chaser", kbResist: 0.1, sprite: "crawler", planet: "ice" },
  frost_gunner: { id: "frost_gunner", name: "Крио-стрелок", hp: 32, speed: 52, damage: 7, radius: 15, xp: 3, color: "#bae6fd", kind: "gunner", kbResist: 0.2, sprite: "gunner", planet: "ice" },
  ice_golem: { id: "ice_golem", name: "Ледяной голем", hp: 360, speed: 44, damage: 24, radius: 31, xp: 15, color: "#e0f2fe", kind: "chaser", kbResist: 0.85, sprite: "brute", planet: "ice" },

  // Улей Ксенос
  xeno_drone: { id: "xeno_drone", name: "Ксено-трутень", hp: 9, speed: 76, damage: 6, radius: 12, xp: 1, color: "#84cc16", kind: "chaser", kbResist: 0, sprite: "drone", planet: "hive" },
  larva: { id: "larva", name: "Личинка", hp: 4, speed: 112, damage: 3, radius: 8, xp: 1, color: "#bef264", kind: "chaser", kbResist: 0, sprite: "swarm", planet: "hive" },
  xeno_warrior: { id: "xeno_warrior", name: "Ксено-воин", hp: 32, speed: 62, damage: 9, radius: 15, xp: 2, color: "#65a30d", kind: "chaser", kbResist: 0.2, sprite: "trooper", planet: "hive" },
  xeno_crawler: { id: "xeno_crawler", name: "Ползун", hp: 22, speed: 120, damage: 8, radius: 13, xp: 2, color: "#a3e635", kind: "chaser", kbResist: 0.1, sprite: "crawler", planet: "hive" },
  spitter: { id: "spitter", name: "Плевун", hp: 34, speed: 54, damage: 8, radius: 15, xp: 3, color: "#d9f99d", kind: "gunner", kbResist: 0.2, sprite: "gunner", planet: "hive" },
  bloater: { id: "bloater", name: "Пузырь", hp: 14, speed: 140, damage: 20, radius: 13, xp: 2, color: "#eab308", kind: "kamikaze", kbResist: 0, sprite: "kamikaze", planet: "hive" },
  carapace: { id: "carapace", name: "Панцирник", hp: 160, speed: 44, damage: 16, radius: 25, xp: 7, color: "#4d7c0f", kind: "chaser", kbResist: 0.7, sprite: "mech", planet: "hive" },
  stalker: { id: "stalker", name: "Охотник", hp: 50, speed: 88, damage: 11, radius: 14, xp: 3, color: "#4ade80", kind: "phantom", kbResist: 0.3, sprite: "phantom", planet: "hive" },
  xeno_brute: { id: "xeno_brute", name: "Ксено-громила", hp: 380, speed: 48, damage: 25, radius: 31, xp: 15, color: "#3f6212", kind: "chaser", kbResist: 0.85, sprite: "brute", planet: "hive" },
  nest: { id: "nest", name: "Гнездо", hp: 260, speed: 0, damage: 0, radius: 28, xp: 20, color: "#a3e635", kind: "nest", kbResist: 1, planet: "hive" },
  hive_mother: { id: "hive_mother", name: "ПРАМАТЕРЬ КСЕНОС", hp: 30000, speed: 50, damage: 36, radius: 72, xp: 0, color: "#84cc16", kind: "boss", kbResist: 1, sprite: "queen", planet: "hive" },
};

export interface Wave {
  t: number;
  min: number;
  interval: number;
  batch: number;
  pool: [string, number][];
}

export const WAVES: Wave[] = [
  { t: 0, min: 8, interval: 1.6, batch: 1, pool: [["drone", 1]] },
  { t: 40, min: 18, interval: 1.2, batch: 2, pool: [["drone", 3], ["swarm", 2]] },
  { t: 90, min: 28, interval: 1.0, batch: 2, pool: [["drone", 2], ["swarm", 2], ["trooper", 1]] },
  { t: 150, min: 40, interval: 0.9, batch: 3, pool: [["swarm", 3], ["trooper", 2], ["crawler", 2]] },
  { t: 210, min: 50, interval: 0.85, batch: 3, pool: [["trooper", 2], ["crawler", 3], ["gunner", 1]] },
  { t: 270, min: 60, interval: 0.8, batch: 4, pool: [["crawler", 2], ["trooper", 2], ["gunner", 1], ["kamikaze", 1]] },
  { t: 330, min: 70, interval: 0.75, batch: 4, pool: [["trooper", 3], ["mech", 1], ["swarm", 4]] },
  { t: 390, min: 85, interval: 0.7, batch: 5, pool: [["mech", 1], ["kamikaze", 2], ["gunner", 1], ["crawler", 3]] },
  { t: 450, min: 95, interval: 0.65, batch: 5, pool: [["phantom", 2], ["trooper", 2], ["swarm", 4]] },
  { t: 510, min: 110, interval: 0.65, batch: 6, pool: [["phantom", 2], ["mech", 1], ["kamikaze", 2], ["crawler", 2]] },
  { t: 570, min: 120, interval: 0.6, batch: 6, pool: [["phantom", 3], ["gunner", 2], ["swarm", 5]] },
  { t: 630, min: 135, interval: 0.6, batch: 7, pool: [["brute", 1], ["trooper", 3], ["crawler", 3], ["kamikaze", 2]] },
  { t: 690, min: 150, interval: 0.55, batch: 7, pool: [["brute", 1], ["phantom", 3], ["mech", 2], ["swarm", 4]] },
  { t: 750, min: 165, interval: 0.55, batch: 8, pool: [["brute", 2], ["gunner", 2], ["phantom", 3], ["kamikaze", 3]] },
  { t: 810, min: 185, interval: 0.5, batch: 8, pool: [["brute", 2], ["mech", 2], ["phantom", 3], ["crawler", 4]] },
  { t: 870, min: 200, interval: 0.45, batch: 9, pool: [["brute", 2], ["mech", 2], ["phantom", 4], ["swarm", 6], ["kamikaze", 2]] },
  { t: 900, min: 70, interval: 0.8, batch: 3, pool: [["phantom", 2], ["swarm", 4], ["kamikaze", 1]] },
];

export type GameEventType = "elite" | "ring" | "rush" | "boss" | "blizzard" | "nest";
export interface GameEvent {
  t: number;
  type: GameEventType;
  enemy?: string;
  count?: number;
  hpMul?: number; // для босса: множитель здоровья поверх planet.bossHpMul
}

export const EVENTS: GameEvent[] = [
  { t: 60, type: "elite" },
  { t: 100, type: "ring", enemy: "swarm", count: 26 },
  { t: 120, type: "elite" },
  { t: 180, type: "elite" },
  { t: 200, type: "rush", enemy: "drone", count: 24 },
  { t: 240, type: "elite" },
  { t: 300, type: "boss", enemy: "sentinel" },
  { t: 360, type: "elite" },
  { t: 380, type: "ring", enemy: "crawler", count: 32 },
  { t: 420, type: "elite" },
  { t: 480, type: "elite" },
  { t: 500, type: "rush", enemy: "kamikaze", count: 20 },
  { t: 540, type: "elite" },
  { t: 600, type: "boss", enemy: "queen" },
  { t: 660, type: "elite" },
  { t: 680, type: "ring", enemy: "phantom", count: 36 },
  { t: 720, type: "elite" },
  { t: 780, type: "elite" },
  { t: 800, type: "rush", enemy: "crawler", count: 30 },
  { t: 840, type: "elite" },
  { t: 860, type: "ring", enemy: "swarm", count: 48 },
  { t: 900, type: "boss", enemy: "omega" },
];

// Уровни 1–29 — как раньше (старт не меняется). С 30-го требуемый опыт дополнительно растёт на XP_LATE_GROWTH за уровень,
// чтобы полная прокачка приходилась ближе к финалу, а не на 4–5-ю минуту.
export const XP_LATE_FROM = 30;
export const XP_LATE_GROWTH = 1.06;
// Забег 5 минут и 4+4 слота: прокачек нужно меньше, а врагов в минуту больше — опыт до уровня дороже.
// Цель: новичок закрывает билд к финальному боссу, прокачанный игрок — к ~4-й минуте. Первые 10 уровней не дорожают.
export const XP_CURVE_MUL = 1.3;
export function xpToNext(level: number): number {
  let base: number;
  if (level < 20) base = 5 + (level - 1) * 6;
  else if (level < 40) base = 140 + (level - 20) * 10;
  else base = 345 + (level - 40) * 13;
  if (level >= XP_LATE_FROM) base *= Math.pow(XP_LATE_GROWTH, level - XP_LATE_FROM + 1);
  // удорожание включается плавно: до 10-го уровня — как раньше, к 25-му — полностью
  const k = Math.min(1, Math.max(0, (level - 10) / 15));
  return Math.round(base * (1 + (XP_CURVE_MUL - 1) * k));
}

// ------------------------------------------------------------
//  Пилоты
// ------------------------------------------------------------
export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  weapon: string;
  color: string;
  desc: string;
  bonusText: string[];
  bonuses: Partial<PlayerStats>;
  price: number;
  // Фирменный бонус к родной пушке (контент коллеги)
  sig: { cdMul?: number; amount?: number; extra?: number; areaMul?: number; dmgMul?: number };
  sigText: string;
  // Пробуждение: уникальный эффект родной пушки после её эволюции (столп 10)
  awakenName: string;
  awakenText: string;
  // Открывается достижением, а не за кредиты
  unlock?: { kind: "bosses" | "elites" | "planet" | "base"; value: number | string; text: string };
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: "recruit",
    name: "Кай",
    title: "Штурмовик Сектора-7",
    weapon: "plasma",
    color: "#22d3ee",
    desc: "Последний выживший из отряда зачистки. Надёжен и неприхотлив.",
    bonusText: ["+10% скорости снарядов", "+10 к здоровью"],
    bonuses: { projSpeed: 0.1, maxHp: 10 },
    price: 0,
    sig: { cdMul: 0.85 },
    sigText: "Плазма: перезарядка на 15% быстрее",
    awakenName: "Сверхновая",
    awakenText: "Каждый 8-й залп взрывается сверхновой в цели",
  },
  {
    id: "reiji",
    name: "Рэйдзи",
    title: "Кибер-ронин",
    weapon: "whip",
    color: "#f43f5e",
    desc: "Наёмник без корпорации. Предпочитает ближний бой и холодный неон.",
    bonusText: ["+15% урона", "+5% скорости", "−10 к здоровью"],
    bonuses: { might: 0.15, speed: 0.05, maxHp: -10 },
    price: 0,
    sig: { amount: 1 },
    sigText: "Энергоклинок: +1 удар",
    awakenName: "Тысяча порезов",
    awakenText: "Каждый удар задевает ещё двух врагов поблизости",
  },
  {
    id: "nova",
    name: "Нова",
    title: "Оператор дронов",
    weapon: "drones",
    color: "#a78bfa",
    desc: "Бывший инженер ВКС. Управляет роем силой мысли через нейроинтерфейс.",
    bonusText: ["+10% площади атак", "+10% длительности"],
    bonuses: { area: 0.1, duration: 0.1 },
    price: 250,
    sig: { amount: 1 },
    sigText: "Дроны: +1 дрон",
    awakenName: "Рой-матка",
    // забег 5 минут: дрон за каждые 100 убийств (у коллеги — 150 при забеге 10–15 минут)
    awakenText: "Каждые 100 убийств — ещё один дрон (до +6)",
  },
  {
    id: "volt",
    name: "Вольт",
    title: "Инженер-энергетик",
    weapon: "tesla",
    color: "#facc15",
    desc: "Собрал тесла-перчатки из обломков термоядерной станции.",
    bonusText: ["−8% перезарядки", "+0.1 ОЗ/с регенерации"],
    bonuses: { cooldown: -0.08, regen: 0.1 },
    price: 450,
    sig: { extra: 2 },
    sigText: "Тесла: молния прыгает на 2 цели дальше",
    awakenName: "Грозовой фронт",
    awakenText: "Молнии оставляют на земле заряженные лужи",
  },
  {
    id: "titan",
    name: "Титан",
    title: "Тяжёлый экзокостюм",
    weapon: "missile",
    color: "#fb923c",
    desc: "Ходячая крепость. Медленный, но выдерживает то, что убьёт любого.",
    bonusText: ["+50 к здоровью", "+2 брони", "−12% скорости"],
    bonuses: { maxHp: 50, armor: 2, speed: -0.12 },
    price: 700,
    sig: { amount: 1 },
    sigText: "Ракеты: +1 ракета в залпе",
    awakenName: "Ковровая бомбардировка",
    awakenText: "Раз в 15 с — десять взрывов по всему экрану",
  },
  {
    id: "ghost",
    name: "Призрак",
    title: "Нетраннер",
    weapon: "singularity",
    color: "#34d399",
    desc: "Взломал квантовую сеть и научился сворачивать пространство.",
    bonusText: ["+12% скорости", "+10% опыта", "+30% радиуса сбора"],
    bonuses: { speed: 0.12, growth: 0.1, magnet: 0.3 },
    price: 1000,
    sig: { areaMul: 1.25 },
    sigText: "Сингулярность: радиус +25%",
    awakenName: "Горизонт событий",
    // сингулярность у нас — контроль, а не неуязвимость: боссов колодцы не тянут, а замедляют
    awakenText: "Колодцы замедляют даже боссов, финальный взрыв вдвое сильнее",
  },
  {
    id: "echo",
    name: "Эхо",
    title: "Андроид-снайпер",
    weapon: "railgun",
    color: "#60a5fa",
    desc: "Прототип боевого андроида. Вычисляет траекторию за наносекунды.",
    bonusText: ["+10% урона", "+20% удачи", "−4% перезарядки"],
    bonuses: { might: 0.1, luck: 0.2, cooldown: -0.04 },
    price: 1400,
    sig: { dmgMul: 1.2 },
    sigText: "Рельсотрон: урон +20%",
    awakenName: "Выстрел через миры",
    awakenText: "Каждый выстрел бьёт и вперёд, и назад",
  },
  {
    id: "bulldog",
    name: "Бульдог",
    title: "Наёмница-штурмовик",
    weapon: "mg",
    color: "#ef4444",
    desc: "Бывший пулемётчик абордажных команд. Громкая, грубая, лезет в самую гущу.",
    bonusText: ["+15% скорости", "−10 к здоровью"],
    bonuses: { speed: 0.15, maxHp: -10 },
    price: 1600,
    sig: { amount: 1 },
    sigText: "Пулемёт: +1 пуля в очереди",
    awakenName: "Карусель",
    awakenText: "Отпусти палец: стоя на месте, корабль крутится и стреляет во все стороны",
  },
  {
    id: "jay",
    name: "Сойка",
    title: "Охотница за головами",
    weapon: "sniper",
    color: "#e2e8f0",
    desc: "Берёт заказы только на боссов. Холодная и терпеливая.",
    bonusText: ["+25% урона по элиткам и боссам", "−10 к здоровью"],
    bonuses: { bossDmg: 0.25, maxHp: -10 },
    price: 0,
    sig: { cdMul: 0.7 },
    sigText: "Винтовка: заряд на 30% быстрее",
    awakenName: "Контракт",
    awakenText: "Убийство элитки или босса мгновенно перезаряжает винтовку, следующий выстрел ×2",
    unlock: { kind: "bosses", value: 10, text: "Убей 10 боссов" },
  },
  {
    id: "whaler",
    name: "Кит",
    title: "Китобой с ледяных лун",
    weapon: "cryo",
    color: "#2dd4bf",
    desc: "Молчаливый великан. Раньше охотился на космических китов, теперь — на мехов.",
    bonusText: ["+2 брони", "−10% перезарядки"],
    bonuses: { armor: 2, cooldown: -0.1 },
    price: 0,
    sig: {},
    sigText: "Криолуч: заморозка на 1 с дольше",
    awakenName: "Ледниковый период",
    awakenText: "Раз в 10 с — ледяная волна замораживает всех врагов на экране",
    unlock: { kind: "planet", value: "ice", text: "Победи на Крио-7" },
  },
  {
    id: "raven",
    name: "Ворон",
    title: "Нетраннер-ассасин",
    weapon: "brand",
    color: "#e879f9",
    desc: "Взламывает системы целей и помечает их для всех орудий. Говорит шёпотом.",
    bonusText: ["+15% удачи", "−15 к здоровью"],
    bonuses: { luck: 0.15, maxHp: -15 },
    price: 0,
    sig: {},
    sigText: "Метка: меченые получают +75% урона вместо +50%",
    awakenName: "Список смертников",
    awakenText: "Вдвое больше меток, убийство горящего врага чинит 1 ОЗ",
    // забег 5 минут: элиток за забег меньше, чем у коллеги (там 300 при забегах 10–15 минут)
    unlock: { kind: "elites", value: 100, text: "Убей 100 элитных врагов" },
  },
  {
    id: "mole",
    name: "Крот",
    title: "Сапёр шахт Нео-Терры",
    weapon: "mines",
    color: "#a3e635",
    desc: "Держал оборону шахт. Осторожный параноик, всегда отступает по плану.",
    bonusText: ["+20% площади", "+10% длительности"],
    bonuses: { area: 0.2, duration: 0.1 },
    price: 2200,
    sig: { amount: 1 },
    sigText: "Гравимины: +1 мина за раз",
    awakenName: "Минный пояс",
    awakenText: "Вокруг корабля вращается кольцо из 6 мин, которые восстанавливаются",
  },
  {
    id: "buffalo",
    name: "Буйвол",
    title: "Вышибала неоновых баров",
    weapon: "shotgun",
    color: "#818cf8",
    desc: "Решает вопросы в упор. Добродушный, пока не разозлишь.",
    bonusText: ["+30 к здоровью", "+10% урона", "−10% радиуса сбора"],
    bonuses: { maxHp: 30, might: 0.1, magnet: -0.1 },
    price: 0,
    sig: {},
    sigText: "Дробовик: каждый выстрел отталкивает врагов волной",
    awakenName: "Таран",
    awakenText: "Раз в 6 с — рывок к врагу с выстрелом в упор, сбивает всех по пути",
    // забег 5 минут: у коллеги было 5:00 в куполе — это весь забег
    unlock: { kind: "base", value: 150, text: "Продержись 2:30 на Нео-Терре, не выходя из купола" },
  },
];

// ------------------------------------------------------------
//  Перки-правила (столп 08)
// ------------------------------------------------------------
export interface PerkDef {
  id: string;
  name: string;
  desc: string;
  color: string;
}

// Перки-правила («протоколы»): сильный плюс всегда с заметной ценой. Один за забег — выбор 1 из 3 после первого босса.
export const RULE_PERKS: Record<string, PerkDef> = {
  rule_monolith: { id: "rule_monolith", name: "Монолит", desc: "Остаётся одна пушка — та, что нанесла больше урона. Урон ×2, перезарядка −25%, +1 снаряд, качается выше максимума", color: "#22d3ee" },
  rule_glass: { id: "rule_glass", name: "Стеклянное ядро", desc: "Урон ×1.8, максимум здоровья ×0.5", color: "#f43f5e" },
  rule_heavy: { id: "rule_heavy", name: "Тяжёлый калибр", desc: "Перезарядка ×2, урон ×2.5, снаряды и зоны крупнее", color: "#facc15" },
  rule_greed: { id: "rule_greed", name: "Жадный контракт", desc: "Врагов на 30% больше, опыта и кредитов +50%", color: "#fbbf24" },
  rule_chaos: { id: "rule_chaos", name: "Хаос-протокол", desc: "Урон +25%, но раз в 45 с одна пушка меняется на случайную того же уровня", color: "#a78bfa" },
  rule_magnet: { id: "rule_magnet", name: "Магнитный якорь", desc: "Радиус сбора ×3, скорость корабля −20%", color: "#2dd4bf" },
  rule_laststand: { id: "rule_laststand", name: "Последний рубеж", desc: "Пока здоровья меньше 30%, урон ×2", color: "#fb7185" },
  rule_mirror: { id: "rule_mirror", name: "Зеркало", desc: "Пушки бьют и назад (остальным +1 снаряд), перезарядка +40%", color: "#e879f9" },
};
export const RULE_PERK_IDS = Object.keys(RULE_PERKS);

export function perkDef(id: string): PerkDef | undefined {
  return RULE_PERKS[id];
}

// Перк-правило («протокол») — один за забег: после первого убитого босса игрок выбирает 1 из 3 (HISTORY п. 18)
export const RULE_PERK_OFFER = 3;
export const CHAOS_EVERY = 45;

// Пробуждение пилота (столп 10, контент коллеги): родная пушка эволюционировала → следующий контейнер её пробуждает.
// У коллеги — не раньше 6:00 при забеге 10–15 минут; у нас забег 5 минут, поэтому без привязки ко времени.
export const AWAKEN_MIN_TIME = 0;

// ------------------------------------------------------------
//  Постоянные улучшения (Лаборатория)
// ------------------------------------------------------------
export interface MetaUpgradeDef {
  id: string;
  name: string;
  desc: string;
  stat: StatKey;
  perLevel: number;
  maxLevel: number;
  baseCost: number;
  color: string;
  noOverload?: boolean; // без бесконечной «перегрузки»
}

export const META_UPGRADES: MetaUpgradeDef[] = [
  { id: "might", name: "Боевые стимуляторы", desc: "+5% урона за уровень", stat: "might", perLevel: 0.05, maxLevel: 5, baseCost: 100, color: "#f87171" },
  { id: "maxHp", name: "Расширенная батарея", desc: "+10 к макс. здоровью", stat: "maxHp", perLevel: 10, maxLevel: 5, baseCost: 80, color: "#fb7185" },
  { id: "armor", name: "Укреплённый каркас", desc: "+1 к броне", stat: "armor", perLevel: 1, maxLevel: 3, baseCost: 160, color: "#94a3b8" },
  { id: "regen", name: "Нанохирургия", desc: "+0.05 ОЗ/с регенерации", stat: "regen", perLevel: 0.05, maxLevel: 5, baseCost: 120, color: "#f472b6" },
  { id: "cooldown", name: "Разгон процессора", desc: "−2.5% перезарядки", stat: "cooldown", perLevel: -0.025, maxLevel: 4, baseCost: 180, color: "#38bdf8" },
  { id: "area", name: "Фокусирующие линзы", desc: "+5% площади атак", stat: "area", perLevel: 0.05, maxLevel: 4, baseCost: 150, color: "#fbbf24" },
  { id: "speed", name: "Сервомоторы", desc: "+5% скорости движения", stat: "speed", perLevel: 0.05, maxLevel: 4, baseCost: 100, color: "#4ade80" },
  { id: "projSpeed", name: "Магнитные ускорители", desc: "+5% скорости снарядов", stat: "projSpeed", perLevel: 0.05, maxLevel: 3, baseCost: 90, color: "#2dd4bf" },
  { id: "duration", name: "Стабилизатор поля", desc: "+5% длительности", stat: "duration", perLevel: 0.05, maxLevel: 3, baseCost: 120, color: "#818cf8" },
  { id: "magnet", name: "Сборщик данных", desc: "+15% радиуса сбора", stat: "magnet", perLevel: 0.15, maxLevel: 4, baseCost: 80, color: "#a78bfa" },
  { id: "growth", name: "Нейросеть", desc: "+4% опыта", stat: "growth", perLevel: 0.04, maxLevel: 5, baseCost: 150, color: "#a3e635" },
  { id: "greed", name: "Торговый протокол", desc: "+10% кредитов", stat: "greed", perLevel: 0.1, maxLevel: 5, baseCost: 100, color: "#facc15" },
  { id: "luck", name: "Квантовая удача", desc: "+8% удачи (дроп, криты)", stat: "luck", perLevel: 0.08, maxLevel: 3, baseCost: 200, color: "#34d399" },
  { id: "rerolls", name: "Перепрошивка", desc: "+1 переброс улучшений", stat: "rerolls", perLevel: 1, maxLevel: 4, baseCost: 120, color: "#22d3ee", noOverload: true },
  { id: "amount", name: "Дублирующий контур", desc: "+1 снаряд для всего оружия", stat: "amount", perLevel: 1, maxLevel: 1, baseCost: 1500, color: "#e879f9", noOverload: true },
  { id: "revival", name: "Резервный клон", desc: "+1 воскрешение за забег", stat: "revival", perLevel: 1, maxLevel: 1, baseCost: 1200, color: "#fde047", noOverload: true },
];

export function metaCost(def: MetaUpgradeDef, level: number) {
  return Math.round(def.baseCost * (1 + level * 0.9));
}

// «Перегрузка»: бесконечные уровни после максимума — эффект вдвое слабее, цена растёт на 22% за уровень
export const OVERLOAD_FACTOR = 0.5;
export function overloadCost(def: MetaUpgradeDef, n: number) {
  return Math.round(metaCost(def, def.maxLevel - 1) * 1.3 * Math.pow(1.22, n));
}

// Сверхулучшения: появляются в забеге, когда всё оружие и модули прокачаны до предела; берутся бесконечно
export interface SuperDef {
  id: string;
  name: string;
  desc: string;
  color: string;
  stat: StatKey;
  amount: number;
}
// «Расширитель поля» (+площадь) убран: площадь бьёт квадратично по числу целей и разгоняла петлю «зачистка → опыт → площадь».
export const SUPERS: Record<string, SuperDef> = {
  super_dmg: { id: "super_dmg", name: "Перегрев ядра", desc: "к урону", color: "#f97316", stat: "might", amount: 0.08 },
  super_cd: { id: "super_cd", name: "Сверхпроводник", desc: "перезарядки", color: "#38bdf8", stat: "cooldown", amount: -0.04 },
  super_armor: { id: "super_armor", name: "Бронеплиты", desc: "к броне", color: "#94a3b8", stat: "armor", amount: 1 },
  super_hp: { id: "super_hp", name: "Энергокапсула", desc: "к макс. здоровью", color: "#fb7185", stat: "maxHp", amount: 25 },
};

// ------------------------------------------------------------
//  Баланс поздней игры (см. docs/HISTORY.md, п. 15)
// ------------------------------------------------------------
// Каждое следующее взятие одного и того же сверхулучшения слабее предыдущего (×SUPER_DECAY).
// Сумма ограничена: урон до +80%, перезарядка до −40%, броня до +10, здоровье до +250.
export const SUPER_DECAY = 0.9;
export function superValue(def: SuperDef, taken: number): number {
  // прибавка за (taken+1)-е взятие
  return def.amount * Math.pow(SUPER_DECAY, taken);
}
export function superTotal(def: SuperDef, taken: number): number {
  return (def.amount * (1 - Math.pow(SUPER_DECAY, taken))) / (1 - SUPER_DECAY);
}
// После полной прокачки опыт до следующего уровня растёт на SUPER_XP_GROWTH за каждый такой уровень
export const SUPER_XP_GROWTH = 1.12;

// Площадь: до AREA_SOFT работает полностью, выше — вполовину, жёсткий предел AREA_HARD
export const AREA_SOFT = 1.5;
export const AREA_SOFT_RATE = 0.5;
export const AREA_HARD = 2.2;
export function effectiveArea(raw: number): number {
  if (raw <= AREA_SOFT) return raw;
  return Math.min(AREA_HARD, AREA_SOFT + (raw - AREA_SOFT) * AREA_SOFT_RATE);
}

// Спавн: недостающих до минимума волны врагов досыпаем не мгновенно, а не быстрее min/REFILL_TIME в секунду.
// Раньше досыпалось до 8 за кадр (~480/с) — доход опыта был ограничен только скоростью зачистки.
export const REFILL_TIME = 6;
export const REFILL_MIN_RATE = 3;
export const REFILL_BURST = 8;

// Лут с обычных врагов: аптечки и бомбы/хроностазис ограничены по времени, а не только шансом
export const MAGNET_SCHEDULE = [30, 60, 90, 120]; // первые 2 минуты магнит гарантированно падает рядом с пилотом
export const MEDKIT_EVERY = 25; // с на одну «квоту» аптечки
export const MEDKIT_MAX_STOCK = 2;
export const RARE_DROP_EVERY = 45; // бомба/хроностазис

// Босс входит с края за экраном и первые BOSS_ENTRY_SHIELD с неуязвим
export const BOSS_ENTRY_SHIELD = 3;
export const BOSS_SPAWN_EXTRA = 240;

// «Горизонт событий»: урон взрыва при коллапсе = урон колодца × множитель (было ×18)
export const SINGULARITY_COLLAPSE_MUL = 10;

// ------------------------------------------------------------
//  Угрозы без буллет-хелла (столп 03)
// ------------------------------------------------------------
// Пули остаются, но их мало и они медленные: множители к скорости и частоте
export const BULLET_SPEED_MUL = 0.7;
export const BULLET_COUNT_MUL = 0.3; // доля пуль в кольцах боссов (было 1, потом 0.5)
export const BULLET_DMG_MUL = 2.2; // пуль мало — каждая должна быть больно (HISTORY п. 18)
export const GUNNER_FIRE_EVERY: [number, number] = [7, 10]; // было 2.4–3.4 с, потом 4.5–6.5
// Войд-зоны: предупреждение на земле → медленно дрейфующая зона урона
export const VOID_WARN = 1.2; // с предупреждения до активации
export const VOID_TICK = 0.5; // как часто бьёт стоящего внутри
export const VOID_ELITE_CHANCE = 0.5; // доля элиток с аффиксом «Пустотный»
export const VOID_BOSS_DMG = 0.2; // урон тика войд-зоны босса = урон босса × множитель
export const VOID_ELITE_DMG = 0.25;
export const BOSS_CONTACT_MUL = 0.6; // урон босса при касании (рывок — полный)

// ------------------------------------------------------------
//  Бесконечный режим (столп 09)
// ------------------------------------------------------------
// Бесконечный режим — испытание, а не ферма: угроза растёт ступенями, и любой билд рано или поздно ломается.
// Новичок должен чувствовать, что ещё 30 секунд — и конец; сильный билд держится пару минут.
export const ENDLESS_STEP = 10; // каждые 10 с — новая ступень угрозы
export const ENDLESS_START_LEVEL = 2; // вход сразу со 2-й ступени: «ещё 30 секунд — и конец» должно читаться сразу
export const ENDLESS_HP_STEP = 1.35; // здоровье новых врагов ×1.35 за ступень
export const ENDLESS_DMG_STEP = 1.25; // урон ×1.25 за ступень
export const ENDLESS_SPAWN_STEP = 0.2; // +20% к минимуму врагов за ступень
export const ENDLESS_REWARD_STEP = 0.15; // +15% к наградам за ступень
export const ENDLESS_BOSS_EVERY = 60; // босс каждую минуту
export const ENDLESS_SURGE = 40; // всплеск врагов в момент входа
// Броня вычитается из удара, но не гасит больше 75% — иначе стопка брони делает пилота бессмертным
export const ARMOR_FLOOR = 0.25;

export const STAT_LABELS: Partial<Record<StatKey, string>> = {
  maxHp: "Здоровье",
  speed: "Скорость",
  armor: "Броня",
  regen: "Регенерация",
  might: "Урон",
  area: "Площадь",
  cooldown: "Перезарядка",
  amount: "Снаряды",
  projSpeed: "Скор. снарядов",
  duration: "Длительность",
  magnet: "Сбор",
  growth: "Опыт",
  luck: "Удача",
  greed: "Кредиты",
  revival: "Воскрешения",
  bossDmg: "Урон по боссам",
  crit: "Шанс крита",
  armorPen: "Бронебой",
  lowHpMight: "Урон при ранении",
  stillMight: "Урон стоя",
};
