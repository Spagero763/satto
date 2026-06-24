import type { Difficulty } from "./engine";

export interface ModeConfig {
  id: Difficulty;
  name: string;
  tagline: string;
  blurb: string;
  stake: number;
  stakeMicro: number;
  modeIndex: number;
  payout: number;
  accent: "violet" | "teal";
  blunderHint: string;
}

const STAKE_STX = 0.000001;
const STAKE_MICRO = 1;

export const MODES: Record<Difficulty, ModeConfig> = {
  normal: {
    id: "normal",
    name: "Normal",
    tagline: "Warm up",
    blurb: "The machine plays smart but slips. Stay sharp and the win is yours.",
    stake: STAKE_STX,
    stakeMicro: STAKE_MICRO,
    modeIndex: 0,
    payout: 2,
    accent: "violet",
    blunderHint: "Beatable",
  },
  hard: {
    id: "hard",
    name: "Hard",
    tagline: "Prove it",
    blurb: "Near-perfect defence. Force the mistake and triple your stake.",
    stake: STAKE_STX,
    stakeMicro: STAKE_MICRO,
    modeIndex: 1,
    payout: 3,
    accent: "teal",
    blunderHint: "Brutal but loseable",
  },
};

export const MODE_LIST: ModeConfig[] = [MODES.normal, MODES.hard];
