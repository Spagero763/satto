"use client";

import { motion } from "framer-motion";
import { Trophy, Frown, Equal, ExternalLink, Loader2 } from "lucide-react";
import { txUrl, formatStx } from "@/lib/contract";
import { cn } from "@/lib/cn";

export type GameResult = "win" | "lose" | "draw";

interface Props {
  result: GameResult;
  payoutMicro: number;
  settleStatus: "idle" | "pending" | "done" | "error";
  settleTxid: string | null;
  settleError: string | null;
  onPlayAgain: () => void;
}

const COPY: Record<GameResult, { title: string; sub: string; icon: typeof Trophy; tone: string }> = {
  win: { title: "You won", sub: "The house pays out.", icon: Trophy, tone: "text-teal" },
  lose: { title: "Beaten", sub: "Your stake joins the house.", icon: Frown, tone: "text-violet" },
  draw: { title: "Stalemate", sub: "Your stake is refunded.", icon: Equal, tone: "text-white/70" },
};

export default function ResultOverlay({
  result,
  payoutMicro,
  settleStatus,
  settleTxid,
  settleError,
  onPlayAgain,
}: Props) {
  const c = COPY[result];
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="glass w-full max-w-sm rounded-3xl p-7 text-center"
      >
        <div className={cn("mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5", c.tone)}>
          <Icon className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-black">{c.title}</h2>
        <p className="mt-1 text-sm text-white/55">{c.sub}</p>

        {result === "win" && (
          <p className="mt-4 text-3xl font-black text-teal">+{formatStx(payoutMicro)} STX</p>
        )}

        <div className="mt-5 min-h-[2.5rem] text-sm">
          {settleStatus === "pending" && (
            <span className="inline-flex items-center gap-2 text-white/55">
              <Loader2 className="h-4 w-4 animate-spin" /> Settling on-chain…
            </span>
          )}
          {settleStatus === "done" && settleTxid && (
            <a
              href={txUrl(settleTxid)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-teal underline decoration-teal/30 underline-offset-2"
            >
              View settlement <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {settleStatus === "error" && (
            <span className="text-violet">{settleError ?? "Settlement failed"}</span>
          )}
        </div>

        <button
          onClick={onPlayAgain}
          className="mt-3 w-full rounded-2xl bg-violet py-3 font-semibold text-white shadow-lg shadow-violet/30 transition hover:brightness-110"
        >
          Play again
        </button>
      </motion.div>
    </motion.div>
  );
}
