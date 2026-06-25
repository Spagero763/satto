"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { emptyBoard, evaluate, botMove, type Board as BoardT } from "@/lib/engine";
import type { ModeConfig } from "@/lib/modes";
import { sfx } from "@/lib/sfx";
import { txUrl, formatStx } from "@/lib/contract";
import type { GameResult } from "./ResultOverlay";
import Board from "./Board";

interface Props {
  mode: ModeConfig;
  stakeTxid: string | null;
  stakeConfirmed: boolean;
  onResult: (result: GameResult, board: BoardT) => void;
  onExit: () => void;
}

export default function GameScreen({ mode, stakeTxid, stakeConfirmed, onResult, onExit }: Props) {
  const [board, setBoard] = useState<BoardT>(emptyBoard);
  const [turn, setTurn] = useState<"human" | "bot">("human");
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const finished = useRef(false);

  const finish = useCallback(
    (result: GameResult, b: BoardT, line: number[] | null) => {
      if (finished.current) return;
      finished.current = true;
      setWinningLine(line);
      if (result === "win") sfx.win();
      else if (result === "lose") sfx.lose();
      else sfx.draw();
      setTimeout(() => onResult(result, b), 650);
    },
    [onResult]
  );

  useEffect(() => {
    if (turn !== "bot" || finished.current) return;
    const t = setTimeout(() => {
      setBoard((prev) => {
        const move = botMove(prev, mode.id);
        if (move < 0) return prev;
        const next = [...prev];
        next[move] = "O";
        sfx.bot();
        const ev = evaluate(next);
        if (ev.winner === "O") finish("lose", next, ev.line);
        else if (ev.draw) finish("draw", next, null);
        else setTurn("human");
        return next;
      });
    }, 420);
    return () => clearTimeout(t);
  }, [turn, mode.id, finish]);

  function play(i: number) {
    if (turn !== "human" || board[i] || finished.current) return;
    const next = [...board];
    next[i] = "X";
    sfx.place();
    setBoard(next);
    const ev = evaluate(next);
    if (ev.winner === "X") finish("win", next, ev.line);
    else if (ev.draw) finish("draw", next, null);
    else setTurn("bot");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 pb-10">
      <div className="flex w-full items-center justify-between">
        <button
          onClick={onExit}
          className="surface surface-hover flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-dim transition-colors hover:text-bone"
        >
          <ArrowLeft className="h-4 w-4" /> Forfeit
        </button>
        <div className="text-right">
          <p className="font-display text-sm font-semibold">{mode.name}</p>
          <p className="mono text-[11px] text-faint">
            {formatStx(mode.stakeMicro)} STX · {mode.payout}× win
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Board board={board} winningLine={winningLine} disabled={turn !== "human" || finished.current} onPlay={play} />
      </div>

      <motion.p
        key={turn}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mono mt-7 text-[12px] uppercase tracking-[0.18em] text-dim"
      >
        {finished.current ? "Game over" : turn === "human" ? "Your move — you are ✕" : "Machine thinking…"}
      </motion.p>

      {stakeTxid && (
        <a
          href={txUrl(stakeTxid)}
          target="_blank"
          rel="noreferrer"
          className="mono mt-3 inline-flex items-center gap-1.5 text-[11px] text-faint hover:text-dim"
        >
          {stakeConfirmed ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-teal" /> Stake confirmed
            </>
          ) : (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Stake confirming…
            </>
          )}
        </a>
      )}
    </div>
  );
}
