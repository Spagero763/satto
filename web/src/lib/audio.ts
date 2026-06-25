"use client";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/* ---------- preferences ---------- */

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("satto:sfx") === "off";
}
export function setMuted(v: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("satto:sfx", v ? "off" : "on");
}
export function musicEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("satto:music") === "on";
}
function setMusicPref(v: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("satto:music", v ? "on" : "off");
}

/* ---------- sound effects ---------- */

function tone(
  freq: number,
  durMs: number,
  type: OscillatorType = "sine",
  gain = 0.05,
  when = 0,
  glideTo?: number
) {
  const a = ac();
  if (!a || !master) return;
  const t = a.currentTime + when;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + durMs / 1000);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durMs / 1000);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + durMs / 1000 + 0.02);
}

function guarded(fn: () => void) {
  if (isMuted()) return;
  fn();
}

export const sfx = {
  place: () => guarded(() => tone(440, 110, "triangle", 0.06)),
  bot: () => guarded(() => tone(294, 120, "sine", 0.05)),
  hover: () => guarded(() => tone(660, 40, "sine", 0.012)),
  click: () => guarded(() => tone(520, 60, "triangle", 0.03, 0, 380)),
  nav: () => guarded(() => { tone(523, 70, "sine", 0.03); tone(784, 90, "sine", 0.02, 0.05); }),
  win: () =>
    guarded(() => {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 220, "triangle", 0.06, i * 0.1));
    }),
  lose: () => guarded(() => tone(200, 360, "sawtooth", 0.05, 0, 90)),
  draw: () => guarded(() => { tone(392, 180, "sine", 0.045); tone(330, 220, "sine", 0.035, 0.06); }),
  error: () => guarded(() => { tone(180, 200, "square", 0.04); tone(140, 260, "square", 0.035, 0.08); }),
  success: () => guarded(() => { tone(659, 120, "triangle", 0.05); tone(988, 180, "triangle", 0.04, 0.1); }),
};

/* ---------- generative ambient music ---------- */

const SCALE = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33]; // A minor pentatonic, 2 oct
let musicOn = false;
let padNodes: { osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode }[] = [];
let arpTimer: number | null = null;
let delay: DelayNode | null = null;
let musicBus: GainNode | null = null;

function buildBus() {
  const a = ac();
  if (!a || !master) return null;
  if (musicBus) return musicBus;
  musicBus = a.createGain();
  musicBus.gain.value = 0.0;
  delay = a.createDelay(1.0);
  delay.delayTime.value = 0.38;
  const fb = a.createGain();
  fb.gain.value = 0.32;
  const wet = a.createGain();
  wet.gain.value = 0.28;
  delay.connect(fb).connect(delay);
  delay.connect(wet).connect(musicBus);
  musicBus.connect(master);
  return musicBus;
}

function startPad() {
  const a = ac();
  const bus = buildBus();
  if (!a || !bus) return;
  const roots = [110.0, 164.81]; // A2, E3
  roots.forEach((freq, idx) => {
    const osc = a.createOscillator();
    const gain = a.createGain();
    const filter = a.createBiquadFilter();
    const lfo = a.createOscillator();
    const lfoGain = a.createGain();
    osc.type = idx === 0 ? "sawtooth" : "triangle";
    osc.frequency.value = freq;
    osc.detune.value = idx * 4;
    filter.type = "lowpass";
    filter.frequency.value = 600;
    filter.Q.value = 6;
    lfo.frequency.value = 0.05 + idx * 0.03;
    lfoGain.gain.value = 240;
    lfo.connect(lfoGain).connect(filter.frequency);
    gain.gain.value = 0.0;
    osc.connect(filter).connect(gain).connect(bus);
    osc.start();
    lfo.start();
    gain.gain.linearRampToValueAtTime(idx === 0 ? 0.05 : 0.035, a.currentTime + 4);
    padNodes.push({ osc, gain, lfo });
  });
  bus.gain.linearRampToValueAtTime(0.7, a.currentTime + 3);
}

function scheduleArp() {
  const a = ac();
  if (!a || !musicBus || !delay) return;
  const note = SCALE[Math.floor(Math.random() * SCALE.length)] * (Math.random() < 0.3 ? 2 : 1);
  const t = a.currentTime;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = "sine";
  osc.frequency.value = note;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.04, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
  osc.connect(g);
  g.connect(delay);
  g.connect(musicBus);
  osc.start(t);
  osc.stop(t + 1.2);
  arpTimer = window.setTimeout(scheduleArp, 1400 + Math.random() * 2200);
}

export function startMusic() {
  if (musicOn) return;
  const a = ac();
  if (!a) return;
  musicOn = true;
  setMusicPref(true);
  startPad();
  arpTimer = window.setTimeout(scheduleArp, 800);
}

export function stopMusic() {
  setMusicPref(false);
  const a = ac();
  if (arpTimer) { clearTimeout(arpTimer); arpTimer = null; }
  if (a && musicBus) {
    musicBus.gain.linearRampToValueAtTime(0.0, a.currentTime + 1.2);
  }
  padNodes.forEach(({ osc, gain, lfo }) => {
    if (a) gain.gain.linearRampToValueAtTime(0.0, a.currentTime + 1.2);
    try { osc.stop((a?.currentTime ?? 0) + 1.4); lfo.stop((a?.currentTime ?? 0) + 1.4); } catch {}
  });
  padNodes = [];
  musicOn = false;
}

export function isMusicPlaying(): boolean {
  return musicOn;
}
