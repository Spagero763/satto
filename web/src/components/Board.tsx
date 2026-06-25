"use client";

import { motion } from "framer-motion";
import type { Board as BoardT } from "@/lib/engine";
import { cn } from "@/lib/cn";
import Mark from "./Mark";

interface Props {
  board: BoardT;
  winningLine: number[] | null;
  disabled: boolean;
  onPlay: (i: number) => void;
}

export default function Board({ board, winningLine, disabled, onPlay }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      {board.map((cell, i) => {
        const inLine = winningLine?.includes(i) ?? false;
        const playable = !disabled && !cell;
        return (
          <motion.button
            key={i}
            type="button"
            disabled={!playable}
            onClick={() => onPlay(i)}
            whileTap={playable ? { scale: 0.9 } : undefined}
            whileHover={playable ? { scale: 1.03 } : undefined}
            className={cn(
              "surface relative flex aspect-square w-[5.4rem] items-center justify-center rounded-2xl sm:w-24",
              playable ? "surface-hover cursor-pointer" : "cursor-default",
              inLine && "border-teal/60 bg-teal/10 shadow-[0_0_30px_-6px_var(--teal)]"
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <Mark value={cell} />
          </motion.button>
        );
      })}
    </div>
  );
}
