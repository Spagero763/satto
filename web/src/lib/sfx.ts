"use client";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("satto:muted") === "1";
}

export function setMuted(v: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("satto:muted", v ? "1" : "0");
}

function blip(freq: number, durMs: number, type: OscillatorType = "sine", gain = 0.05) {
  if (isMuted()) return;
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g).connect(a.destination);
  const now = a.currentTime;
  osc.start(now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + durMs / 1000);
  osc.stop(now + durMs / 1000);
}

export const sfx = {
  place: () => blip(420, 90, "triangle"),
  bot: () => blip(280, 90, "sine"),
  win: () => {
    blip(523, 120, "triangle");
    setTimeout(() => blip(659, 120, "triangle"), 110);
    setTimeout(() => blip(784, 200, "triangle"), 230);
  },
  lose: () => blip(160, 320, "sawtooth", 0.04),
  draw: () => blip(330, 200, "sine"),
};
