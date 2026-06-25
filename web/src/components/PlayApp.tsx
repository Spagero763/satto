"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Trophy, ArrowUpRight } from "lucide-react";
import type { Board as BoardT } from "@/lib/engine";
import { MODE_LIST, type ModeConfig } from "@/lib/modes";
import { newGameId, stakeOnChain } from "@/lib/stacks";
import { SATTO_NETWORK } from "@/lib/contract";
import { useWallet } from "@/components/WalletProvider";
import { sfx } from "@/lib/audio";
import ModeCard from "./ModeCard";
import GameScreen from "./GameScreen";
import ResultOverlay, { type GameResult } from "./ResultOverlay";

type Screen = "lobby" | "game";
type SettleStatus = "idle" | "pending" | "done" | "error";

const API_BASE = `https://api.${SATTO_NETWORK}.hiro.so`;

async function waitForTx(txid: string, tries = 40): Promise<boolean> {
  const id = txid.startsWith("0x") ? txid : `0x${txid}`;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(`${API_BASE}/extended/v1/tx/${id}`);
      if (r.ok) {
        const j = await r.json();
        if (j.tx_status === "success") return true;
        if (j.tx_status?.startsWith("abort")) return false;
      }
    } catch {}
    await new Promise((res) => setTimeout(res, 4000));
  }
  return false;
}

export default function PlayApp() {
  const { address, connecting, connect } = useWallet();
  const [screen, setScreen] = useState<Screen>("lobby");
  const [mode, setMode] = useState<ModeConfig | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [gameId, setGameId] = useState<string | null>(null);
  const [stakeTxid, setStakeTxid] = useState<string | null>(null);
  const [stakeConfirmed, setStakeConfirmed] = useState(false);

  const [result, setResult] = useState<GameResult | null>(null);
  const [settleStatus, setSettleStatus] = useState<SettleStatus>("idle");
  const [settleTxid, setSettleTxid] = useState<string | null>(null);
  const [settleError, setSettleError] = useState<string | null>(null);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSelect(m: ModeConfig) {
    if (!address) {
      flash("Connect a wallet first.");
      connect();
      return;
    }
    sfx.click();
    const id = newGameId();
    try {
      const txid = await stakeOnChain({ gameId: id, modeIndex: m.modeIndex, amountMicro: m.stakeMicro, sender: address });
      setMode(m);
      setGameId(id);
      setStakeTxid(txid);
      setStakeConfirmed(false);
      setResult(null);
      setSettleStatus("idle");
      setSettleTxid(null);
      setSettleError(null);
      setScreen("game");
      waitForTx(txid).then((ok) => {
        setStakeConfirmed(ok);
        if (!ok) flash("Your stake transaction failed on-chain.");
      });
    } catch (e) {
      const msg = (e as Error)?.message ?? "";
      if (/reject|cancel|denied/i.test(msg)) flash("Stake cancelled.");
      else flash("Could not submit the stake.");
    }
  }

  async function settle(res: GameResult, board: BoardT) {
    if (!gameId || !mode || !address) return;
    setSettleStatus("pending");
    for (let attempt = 0; attempt < 30; attempt++) {
      try {
        const r = await fetch("/api/settle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId, mode: mode.id, board, outcome: res, player: address }),
        });
        const j = await r.json();
        if (r.ok) {
          setSettleTxid(j.txid);
          setSettleStatus("done");
          return;
        }
        if (r.status === 404) {
          await new Promise((s) => setTimeout(s, 5000));
          continue;
        }
        setSettleError(j.error ?? "Settlement failed");
        setSettleStatus("error");
        return;
      } catch {
        await new Promise((s) => setTimeout(s, 5000));
      }
    }
    setSettleError("Settlement timed out. Your stake is reclaimable on-chain.");
    setSettleStatus("error");
  }

  function handleResult(res: GameResult, board: BoardT) {
    setResult(res);
    settle(res, board);
  }

  function playAgain() {
    setResult(null);
    setScreen("lobby");
    setMode(null);
    setGameId(null);
    setStakeTxid(null);
  }

  return (
    <div className="flex flex-col items-center py-10">
      <AnimatePresence mode="wait">
        {screen === "lobby" ? (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto w-full max-w-3xl px-5 sm:px-8"
          >
            <div className="mono flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-faint">
              <span className="h-px w-7 bg-[var(--hair)]" /> Choose your mode
            </div>
            <h1 className="font-display mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Pick a stake. <span className="text-teal">Beat the bot.</span>
            </h1>
            <p className="mt-3 max-w-md text-[15px] text-dim">
              Your STX is escrowed the moment you stake. Win and the house pays you out.
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {MODE_LIST.map((m, i) => (
                <ModeCard key={m.id} mode={m} index={i} disabled={connecting} onSelect={() => handleSelect(m)} />
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <Link
                href="/leaderboard"
                className="surface surface-hover group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-dim transition-colors hover:text-bone"
              >
                <Trophy className="h-4 w-4 text-teal" /> Leaderboard
                <ArrowUpRight className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              {!address && <p className="mono text-[11px] uppercase tracking-wider text-faint">Connect to play</p>}
            </div>
          </motion.div>
        ) : (
          mode && (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <GameScreen
                mode={mode}
                stakeTxid={stakeTxid}
                stakeConfirmed={stakeConfirmed}
                onResult={handleResult}
                onExit={playAgain}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <ResultOverlay
            result={result}
            payoutMicro={mode ? mode.stakeMicro * mode.payout : 0}
            settleStatus={settleStatus}
            settleTxid={settleTxid}
            settleError={settleError}
            onPlayAgain={playAgain}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="surface mono fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full px-4 py-2 text-[13px]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
