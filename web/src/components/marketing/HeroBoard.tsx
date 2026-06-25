"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { emptyBoard, evaluate, bestMove, botMove, type Board as BoardT } from "@/lib/engine";
import Mark from "@/components/Mark";
import { cn } from "@/lib/cn";

export default function HeroBoard() {
  const [board, setBoard] = useState<BoardT>(emptyBoard);
  const [line, setLine] = useState<number[] | null>(null);

  useEffect(() => {
    let b = emptyBoard();
    let player: "X" | "O" = "X";
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const step = () => {
      if (!alive) return;
      const ev = evaluate(b);
      if (ev.winner || ev.draw) {
        setLine(ev.line);
        timers.push(setTimeout(() => {
          b = emptyBoard();
          player = "X";
          setLine(null);
          setBoard([...b]);
          timers.push(setTimeout(step, 900));
        }, 1800));
        return;
      }
      const move = player === "X" ? botMove(b, "normal") : bestMove(b, "O");
      if (move >= 0) {
        b[move] = player;
        setBoard([...b]);
        player = player === "X" ? "O" : "X";
      }
      timers.push(setTimeout(step, 820));
    };

    timers.push(setTimeout(step, 600));
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {board.map((cell, i) => {
        const inLine = line?.includes(i) ?? false;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              "surface flex aspect-square w-20 items-center justify-center rounded-2xl sm:w-24",
              inLine && "border-teal/60 bg-teal/10 shadow-[0_0_30px_-6px_var(--teal)]"
            )}
          >
            <Mark value={cell} />
          </motion.div>
        );
      })}
    </div>
  );
}
