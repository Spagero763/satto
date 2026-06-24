"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Coins, Bitcoin } from "lucide-react";
import { MODE_LIST, type ModeConfig } from "@/lib/modes";
import ModeCard from "./ModeCard";

interface Props {
  connected: boolean;
  onSelect: (mode: ModeConfig) => void;
}

export default function Home({ connected, onSelect }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-5 pb-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <span className="glass mb-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-teal">
          <Bitcoin className="h-3.5 w-3.5" /> Settled on Stacks
        </span>
        <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">
          Outplay the machine.
          <br />
          <span className="bg-gradient-to-r from-violet to-teal bg-clip-text text-transparent">
            Keep the winnings.
          </span>
        </h1>
        <p className="mt-4 max-w-md text-balance text-white/55">
          Stake STX on a game of noughts &amp; crosses. The bot is sharp but beatable —
          win and double or triple your stake, settled trustlessly on-chain.
        </p>
      </motion.div>

      <div className="mt-9 grid w-full gap-4 sm:grid-cols-2">
        {MODE_LIST.map((mode) => (
          <ModeCard key={mode.id} mode={mode} disabled={!connected} onSelect={() => onSelect(mode)} />
        ))}
      </div>

      {!connected && (
        <p className="mt-5 text-sm text-white/40">Connect a Stacks wallet to stake and play.</p>
      )}

      <div className="mt-9 grid w-full grid-cols-3 gap-3 text-left">
        {[
          { icon: Coins, title: "Real stake", body: "Your STX is escrowed while you play." },
          { icon: ShieldCheck, title: "Never frozen", body: "Reclaim your stake if it isn't settled." },
          { icon: Bitcoin, title: "Bitcoin-secured", body: "Final on Stacks, anchored to Bitcoin." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="glass rounded-2xl p-3.5">
            <Icon className="h-4 w-4 text-violet" />
            <p className="mt-2 text-sm font-semibold">{title}</p>
            <p className="mt-0.5 text-xs text-white/45">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
