"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { RotateCcw, ArrowRight } from "lucide-react";
import { emptyBoard, evaluate, botMove, type Board as BoardT, type Difficulty } from "@/lib/engine";
import { sfx } from "@/lib/audio";
import { cn } from "@/lib/cn";
import Board from "./Board";

type Res = "win" | "lose" | "draw" | null;

const RESULT_COPY: Record<Exclude<Res, null>, { title: string; tone: string }> = {
  win: { title: "You beat it", tone: "text-teal" },
  lose: { title: "Outplayed", tone: "text-violet" },
  draw: { title: "Stalemate", tone: "text-bone" },
};

export default function DemoApp() {
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [board, setBoard] = useState<BoardT>(emptyBoard);
  const [turn, setTurn] = useState<"human" | "bot">("human");
  const [line, setLine] = useState<number[] | null>(null);
  const [result, setResult] = useState<Res>(null);
  const [tally, setTally] = useState({ win: 0, lose: 0, draw: 0 });
  const finished = useRef(false);

  const reset = useCallback(() => {
    finished.current = false;
    setBoard(emptyBoard());
    setTurn("human");
    setLine(null);
    setResult(null);
  }, []);

  const finish = useCallback((r: Exclude<Res, null>, l: number[] | null) => {
    if (finished.current) return;
    finished.current = true;
    setLine(l);
    setResult(r);
    setTally((t) => ({ ...t, [r]: t[r] + 1 }));
    if (r === "win") sfx.win();
    else if (r === "lose") sfx.lose();
    else sfx.draw();
  }, []);

  useEffect(() => {
    if (turn !== "bot" || finished.current) return;
    const t = setTimeout(() => {
      setBoard((prev) => {
        const move = botMove(prev, difficulty);
        if (move < 0) return prev;
        const next = [...prev];
        next[move] = "O";
        sfx.bot();
        const ev = evaluate(next);
        if (ev.winner === "O") finish("lose", ev.line);
        else if (ev.draw) finish("draw", null);
        else setTurn("human");
        return next;
      });
    }, 380);
    return () => clearTimeout(t);
  }, [turn, difficulty, finish]);

  function play(i: number) {
    if (turn !== "human" || board[i] || finished.current) return;
    const next = [...board];
    next[i] = "X";
    sfx.place();
    setBoard(next);
    const ev = evaluate(next);
    if (ev.winner === "X") finish("win", ev.line);
    else if (ev.draw) finish("draw", null);
    else setTurn("bot");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 py-10">
      <div className="mono flex items-center gap-3 self-start text-[11px] uppercase tracking-[0.22em] text-faint">
        <span className="h-px w-7 bg-[var(--hair)]" /> Free practice
      </div>
      <h1 className="font-display mt-4 self-start text-4xl font-extrabold tracking-tight">
        Try it. <span className="text-teal">No stake.</span>
      </h1>
      <p className="mt-2 self-start text-[14px] text-dim">
        Same bot, same rules — just no wallet and no STX. Get a feel for it, then play for real.
      </p>

      <div className="surface mt-7 flex gap-1 self-start rounded-full p-1">
        {(["normal", "hard"] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => { setDifficulty(d); reset(); sfx.click(); }}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors",
              difficulty === d ? "bg-bone text-bg" : "text-dim hover:text-bone"
            )}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="relative mt-7">
        <Board board={board} winningLine={line} disabled={turn !== "human" || finished.current} onPlay={play} />
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-bg/80 backdrop-blur-sm"
            >
              <p className={cn("font-display text-3xl font-extrabold", RESULT_COPY[result].tone)}>
                {RESULT_COPY[result].title}
              </p>
              <button
                onClick={reset}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-bone px-5 py-2.5 text-sm font-semibold text-bg transition hover:bg-white"
              >
                <RotateCcw className="h-4 w-4" /> Play again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mono mt-7 flex items-center gap-5 text-sm">
        <span className="text-teal">{tally.win}W</span>
        <span className="text-violet">{tally.lose}L</span>
        <span className="text-dim">{tally.draw}D</span>
      </div>

      <Link
        href="/play"
        className="group mt-8 inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-bold text-bg transition hover:brightness-110"
      >
        Play for real STX
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
