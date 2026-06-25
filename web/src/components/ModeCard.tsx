"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ModeConfig } from "@/lib/modes";
import { formatStx } from "@/lib/contract";
import { cn } from "@/lib/cn";

interface Props {
  mode: ModeConfig;
  index: number;
  disabled?: boolean;
  onSelect: () => void;
}

export default function ModeCard({ mode, index, disabled, onSelect }: Props) {
  const isHard = mode.id === "hard";

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      whileHover={disabled ? undefined : { y: -3 }}
      whileTap={disabled ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "surface group relative flex flex-col overflow-hidden rounded-2xl p-6 text-left",
        disabled ? "cursor-not-allowed opacity-45" : "surface-hover cursor-pointer"
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-6 -top-8 text-[7rem] font-extrabold leading-none opacity-[0.07] transition-opacity group-hover:opacity-[0.12]",
          "font-display",
          isHard ? "text-teal" : "text-violet"
        )}
      >
        {isHard ? "○" : "✕"}
      </div>

      <div className="flex items-center justify-between">
        <span className="mono text-[11px] uppercase tracking-[0.2em] text-faint">
          0{index + 1} / {mode.name}
        </span>
        <span
          className={cn(
            "mono rounded-full px-2.5 py-1 text-xs font-bold",
            isHard ? "bg-teal/12 text-teal" : "bg-violet/12 text-violet"
          )}
        >
          {mode.payout}×
        </span>
      </div>

      <h3 className="font-display mt-5 text-2xl font-bold">{mode.tagline}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-dim">{mode.blurb}</p>

      <div className="mt-5 flex items-end justify-between border-t border-[var(--hair)] pt-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-wider text-faint">Stake</p>
          <p className="mono mt-0.5 text-sm font-semibold text-bone">{formatStx(mode.stakeMicro)} STX</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-semibold",
            isHard ? "text-teal" : "text-violet"
          )}
        >
          {mode.blunderHint}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </motion.button>
  );
}
