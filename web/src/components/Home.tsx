"use client";

import { motion } from "framer-motion";
import { Trophy, ArrowUpRight } from "lucide-react";
import { MODE_LIST, type ModeConfig } from "@/lib/modes";
import ModeCard from "./ModeCard";

interface Props {
  connected: boolean;
  onSelect: (mode: ModeConfig) => void;
  onLeaderboard: () => void;
}

const GUARANTEES = [
  ["01", "Real stake", "Your STX sits in escrow while you play."],
  ["02", "Never frozen", "Unsettled? Reclaim your stake on-chain."],
  ["03", "Bitcoin-secured", "Final on Stacks, anchored to Bitcoin."],
];

export default function Home({ connected, onSelect, onLeaderboard }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-5 pb-12 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mono flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-faint">
          <span className="h-px w-7 bg-[var(--hair)]" />
          Noughts &amp; Crosses · Stacks
        </div>

        <h1 className="font-display mt-5 text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
          Outplay the
          <br />
          machine. <span className="text-teal">Keep</span>
          <br />
          <span className="text-stroke">the winnings.</span>
        </h1>

        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-dim">
          Stake STX on a round of noughts &amp; crosses. The bot is sharp but beatable —
          win and double or triple your stake, settled trustlessly on-chain.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10 grid gap-4 sm:grid-cols-2"
      >
        {MODE_LIST.map((mode, i) => (
          <ModeCard key={mode.id} mode={mode} index={i} disabled={!connected} onSelect={() => onSelect(mode)} />
        ))}
      </motion.div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          onClick={onLeaderboard}
          className="surface surface-hover group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-dim transition-colors hover:text-bone"
        >
          <Trophy className="h-4 w-4 text-teal" /> Leaderboard
          <ArrowUpRight className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
        {!connected && (
          <p className="mono text-[11px] uppercase tracking-wider text-faint">Connect to play</p>
        )}
      </div>

      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[var(--hair)] bg-[var(--hair)] sm:grid-cols-3">
        {GUARANTEES.map(([n, title, body]) => (
          <div key={n} className="bg-bg p-5">
            <span className="mono text-[11px] text-teal">{n}</span>
            <p className="font-display mt-2 text-base font-semibold">{title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-faint">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
