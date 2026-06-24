"use client";

import { motion } from "framer-motion";
import { Zap, Flame } from "lucide-react";
import type { ModeConfig } from "@/lib/modes";
import { formatStx } from "@/lib/contract";
import { cn } from "@/lib/cn";

interface Props {
  mode: ModeConfig;
  disabled?: boolean;
  onSelect: () => void;
}

export default function ModeCard({ mode, disabled, onSelect }: Props) {
  const isHard = mode.id === "hard";

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      whileHover={disabled ? undefined : { y: -4 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={cn(
        "glass group relative flex w-full flex-col gap-3 rounded-3xl p-6 text-left transition-all",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        !disabled && (isHard ? "hover:glow-teal" : "hover:glow-violet")
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-2xl",
            isHard ? "bg-teal/15 text-teal" : "bg-violet/15 text-violet"
          )}
        >
          {isHard ? <Flame className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-bold",
            isHard ? "bg-teal/15 text-teal" : "bg-violet/15 text-violet"
          )}
        >
          {mode.payout}× payout
        </span>
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl font-bold">{mode.name}</h3>
          <span className="text-xs uppercase tracking-wider text-white/40">{mode.tagline}</span>
        </div>
        <p className="mt-1 text-sm text-white/55">{mode.blurb}</p>
      </div>

      <div className="mt-1 flex items-center justify-between border-t border-white/5 pt-3 text-sm">
        <span className="text-white/45">
          Stake <span className="font-semibold text-white/80">{formatStx(mode.stakeMicro)} STX</span>
        </span>
        <span className={cn("font-medium", isHard ? "text-teal" : "text-violet")}>{mode.blunderHint}</span>
      </div>
    </motion.button>
  );
}
