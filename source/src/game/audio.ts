// Синтезированный звук на WebAudio: эффекты + процедурная синтвейв-музыка (без аудиофайлов)

export type SfxName =
  | "shoot"
  | "laser"
  | "hit"
  | "explode"
  | "zap"
  | "rail"
  | "gem"
  | "levelup"
  | "hurt"
  | "chest"
  | "boss"
  | "pickup"
  | "click"
  | "death"
  | "missile"
  | "strike"
  | "evolve"
  | "warp"
  | "chestCharge"
  | "chestBurst"
  | "reveal";

const THROTTLE: Partial<Record<SfxName, number>> = {
  shoot: 0.06,
  laser: 0.08,
  hit: 0.045,
  explode: 0.07,
  zap: 0.08,
  rail: 0.1,
  gem: 0.028,
  hurt: 0.15,
  missile: 0.1,
  strike: 0.08,
  click: 0.03,
};

const midi = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

class AudioEngine {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  private musicBus!: GainNode;
  private noise!: AudioBuffer;
  private last: Partial<Record<SfxName, number>> = {};
  private musicTimer: number | null = null;
  private nextNoteTime = 0;
  private step = 0;
  private gemPitch = 0;
  private gemTime = 0;
  sfxVol = 0.6;
  musicVol = 0.35;
  intensity = 1;

  init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const AC: typeof AudioContext | undefined =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 6;
    comp.connect(ctx.destination);
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(comp);
    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = this.sfxVol;
    this.sfxBus.connect(this.master);
    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = this.musicVol;
    this.musicBus.connect(this.master);
    const len = ctx.sampleRate;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }

  setVolumes(sfx: number, music: number) {
    this.sfxVol = sfx;
    this.musicVol = music;
    if (this.ctx) {
      this.sfxBus.gain.setTargetAtTime(sfx, this.ctx.currentTime, 0.05);
      this.musicBus.gain.setTargetAtTime(music, this.ctx.currentTime, 0.05);
    }
  }

  // на время рекламы игра молчит
  setMuted(m: boolean) {
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.05);
  }

  private tone(type: OscillatorType, f0: number, f1: number, dur: number, vol: number, delay = 0, dest?: AudioNode) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(dest || this.sfxBus);
    o.start(t);
    o.stop(t + dur + 0.03);
  }

  private noiseBurst(dur: number, vol: number, type: BiquadFilterType, f0: number, f1: number, delay = 0, dest?: AudioNode) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(dest || this.sfxBus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.03);
  }

  play(name: SfxName) {
    const ctx = this.ctx;
    if (!ctx || this.sfxVol <= 0.001 || ctx.state !== "running") return;
    const now = ctx.currentTime;
    const th = THROTTLE[name] ?? 0;
    if (th > 0 && now - (this.last[name] ?? -10) < th) return;
    this.last[name] = now;

    switch (name) {
      case "shoot":
        this.tone("square", 950, 280, 0.07, 0.035);
        break;
      case "laser":
        this.tone("sawtooth", 180, 1500, 0.12, 0.045);
        this.noiseBurst(0.1, 0.05, "highpass", 3000, 6000);
        break;
      case "hit":
        this.noiseBurst(0.04, 0.05, "bandpass", 2200, 700);
        break;
      case "explode":
        this.noiseBurst(0.45, 0.22, "lowpass", 1400, 70);
        this.tone("sine", 130, 38, 0.3, 0.2);
        break;
      case "zap":
        this.tone("sawtooth", 1400 + Math.random() * 400, 180, 0.14, 0.045);
        this.tone("square", 600, 2000, 0.06, 0.025);
        break;
      case "rail":
        this.tone("sine", 2600, 60, 0.38, 0.12);
        this.noiseBurst(0.22, 0.09, "highpass", 2500, 600);
        break;
      case "gem": {
        if (now - this.gemTime < 0.35) this.gemPitch = Math.min(this.gemPitch + 1, 24);
        else this.gemPitch = 0;
        this.gemTime = now;
        const f = 880 * Math.pow(2, this.gemPitch / 24);
        this.tone("sine", f, f * 1.5, 0.06, 0.05);
        break;
      }
      case "levelup":
        [72, 76, 79, 84].forEach((m, i) => this.tone("square", midi(m), midi(m), 0.12, 0.06, i * 0.07));
        [84, 88].forEach((m, i) => this.tone("triangle", midi(m), midi(m + 12), 0.25, 0.05, 0.3 + i * 0.05));
        break;
      case "hurt":
        this.tone("sawtooth", 240, 70, 0.22, 0.1);
        this.noiseBurst(0.12, 0.08, "lowpass", 1800, 300);
        break;
      case "chest":
        [67, 71, 74, 79, 83, 86].forEach((m, i) => this.tone("triangle", midi(m), midi(m), 0.18, 0.06, i * 0.08));
        this.noiseBurst(0.6, 0.04, "highpass", 5000, 9000, 0.1);
        break;
      case "evolve":
        [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => this.tone("square", midi(m), midi(m), 0.14, 0.05, i * 0.06));
        [72, 76, 79].forEach((m) => this.tone("sawtooth", midi(m), midi(m), 0.9, 0.035, 0.45));
        break;
      case "boss":
        for (let i = 0; i < 3; i++) {
          this.tone("sawtooth", 220, 440, 0.35, 0.09, i * 0.7);
          this.tone("sawtooth", 440, 220, 0.35, 0.09, i * 0.7 + 0.35);
        }
        this.tone("sine", 55, 40, 2, 0.2);
        break;
      case "pickup":
        this.tone("sine", 600, 1300, 0.16, 0.09);
        this.tone("triangle", 900, 1800, 0.16, 0.04, 0.05);
        break;
      case "click":
        this.tone("square", 1300, 1100, 0.035, 0.03);
        break;
      case "death":
        this.tone("sawtooth", 420, 35, 1.2, 0.16);
        this.noiseBurst(0.9, 0.15, "lowpass", 2000, 60);
        break;
      case "missile":
        this.noiseBurst(0.18, 0.05, "bandpass", 900, 2400);
        break;
      case "strike":
        this.tone("sine", 1900, 180, 0.25, 0.08);
        this.noiseBurst(0.3, 0.12, "lowpass", 2500, 120);
        break;
      case "warp":
        this.noiseBurst(0.7, 0.2, "lowpass", 150, 5000);
        this.tone("sine", 80, 30, 0.8, 0.25);
        break;
      // контейнер коллеги: зарядка, взрыв, появление предмета
      case "chestCharge":
        this.tone("sawtooth", 70, 260, 1.3, 0.07);
        this.tone("sine", 140, 620, 1.3, 0.06);
        this.noiseBurst(1.3, 0.05, "bandpass", 300, 4000);
        [0, 0.35, 0.65, 0.9, 1.1].forEach((d, i) => this.tone("square", midi(60 + i * 3), midi(60 + i * 3), 0.05, 0.03, d));
        break;
      case "chestBurst":
        this.noiseBurst(0.8, 0.22, "lowpass", 6000, 90);
        this.tone("sine", 160, 38, 0.7, 0.3);
        [72, 76, 79, 84].forEach((m) => this.tone("triangle", midi(m), midi(m), 1.1, 0.04, 0.04));
        this.noiseBurst(1.2, 0.05, "highpass", 6000, 11000, 0.1);
        break;
      case "reveal":
        this.tone("triangle", 1200, 2400, 0.12, 0.06);
        this.tone("sine", 1800, 3600, 0.2, 0.03, 0.04);
        break;
    }
  }

  // ------------------- Музыка -------------------
  startMusic() {
    if (!this.ctx || this.musicTimer !== null) return;
    this.step = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.08;
    this.musicTimer = window.setInterval(() => this.schedule(), 25);
  }

  stopMusic() {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx) return;
    const spb = 60 / 120 / 4;
    // после сворачивания вкладки не проигрываем пропущенные ноты пачкой
    if (this.nextNoteTime < ctx.currentTime - 0.2) this.nextNoteTime = ctx.currentTime + 0.05;
    while (this.nextNoteTime < ctx.currentTime + 0.12) {
      this.playStep(this.step, this.nextNoteTime);
      this.nextNoteTime += spb;
      this.step = (this.step + 1) % 128;
    }
  }

  private playStep(step: number, t: number) {
    const ctx = this.ctx!;
    const bar = Math.floor(step / 16) % 8;
    const s = step % 16;
    const prog = [45, 41, 43, 40, 45, 41, 38, 40]; // Am F G Em Am F Dm Em
    const minor = [true, false, false, true, true, false, true, true];
    const root = prog[bar];
    const chord = minor[bar] ? [0, 3, 7, 12] : [0, 4, 7, 12];
    const dest = this.musicBus;
    const delay = Math.max(0, t - ctx.currentTime);

    // бочка
    if (s % 4 === 0) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      g.gain.setValueAtTime(0.55, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g);
      g.connect(dest);
      o.start(t);
      o.stop(t + 0.2);
    }
    // хэт
    if (s % 2 === 1 && this.intensity > 0) this.noiseBurst(0.035, s % 4 === 3 ? 0.07 : 0.035, "highpass", 7000, 9000, delay, dest);
    // клэп
    if ((s === 4 || s === 12) && this.intensity > 0) this.noiseBurst(0.12, 0.12, "bandpass", 1800, 900, delay, dest);

    // бас
    if (s % 2 === 0) {
      const o = ctx.createOscillator();
      const f = ctx.createBiquadFilter();
      const g = ctx.createGain();
      o.type = "sawtooth";
      o.frequency.value = midi(root - 12 + (s % 8 === 6 ? 12 : 0));
      f.type = "lowpass";
      f.frequency.setValueAtTime(900, t);
      f.frequency.exponentialRampToValueAtTime(180, t + 0.2);
      f.Q.value = 6;
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(f);
      f.connect(g);
      g.connect(dest);
      o.start(t);
      o.stop(t + 0.25);
    }

    // арпеджио
    const pattern = [0, 1, 2, 3, 2, 1, 0, 2, 1, 3, 2, 1, 0, 1, 2, 3];
    const note = root + 24 + chord[pattern[s]];
    const o = ctx.createOscillator();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.value = midi(note);
    f.type = "lowpass";
    f.frequency.value = this.intensity > 1 ? 3200 : 1800;
    g.gain.setValueAtTime(0.045, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    o.connect(f);
    f.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + 0.15);

    // пэд на сильную долю такта
    if (s === 0) {
      for (const iv of [0, chord[1], 7]) {
        const p = ctx.createOscillator();
        const pg = ctx.createGain();
        p.type = "triangle";
        p.frequency.value = midi(root + 12 + iv);
        pg.gain.setValueAtTime(0.0001, t);
        pg.gain.linearRampToValueAtTime(0.035, t + 0.3);
        pg.gain.exponentialRampToValueAtTime(0.0001, t + 1.9);
        p.connect(pg);
        pg.connect(dest);
        p.start(t);
        p.stop(t + 2);
      }
    }
  }
}

export const audio = new AudioEngine();
