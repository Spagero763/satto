"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Board as BoardT } from "@/lib/engine";
import type { ModeConfig } from "@/lib/modes";
import {
  connectWallet,
  disconnectWallet,
  getStxAddress,
  newGameId,
  stakeOnChain,
} from "@/lib/stacks";
import { SATTO_NETWORK } from "@/lib/contract";
import Background from "./Background";
import TopBar from "./TopBar";
import Footer from "./Footer";
import Home from "./Home";
import GameScreen from "./GameScreen";
import ResultOverlay, { type GameResult } from "./ResultOverlay";

type Screen = "home" | "game";
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

export default function SattoApp() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<ModeConfig | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [gameId, setGameId] = useState<string | null>(null);
  const [stakeTxid, setStakeTxid] = useState<string | null>(null);
  const [stakeConfirmed, setStakeConfirmed] = useState(false);

  const [result, setResult] = useState<GameResult | null>(null);
  const [settleStatus, setSettleStatus] = useState<SettleStatus>("idle");
  const [settleTxid, setSettleTxid] = useState<string | null>(null);
  const [settleError, setSettleError] = useState<string | null>(null);

  useEffect(() => {
    setAddress(getStxAddress());
  }, []);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  async function handleConnect() {
    setConnecting(true);
    try {
      const addr = await connectWallet();
      setAddress(addr);
    } catch {
      flash("Could not connect a wallet.");
    } finally {
      setConnecting(false);
    }
  }

  function handleDisconnect() {
    disconnectWallet();
    setAddress(null);
    setScreen("home");
  }

  async function handleSelect(m: ModeConfig) {
    if (!address) {
      flash("Connect a wallet first.");
      return;
    }
    const id = newGameId();
    try {
      const txid = await stakeOnChain({
        gameId: id,
        modeIndex: m.modeIndex,
        amountMicro: m.stakeMicro,
        sender: address,
      });
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
          body: JSON.stringify({
            gameId,
            mode: mode.id,
            board,
            outcome: res,
            player: address,
          }),
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
    setScreen("home");
    setMode(null);
    setGameId(null);
    setStakeTxid(null);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Background />
      <TopBar
        address={address}
        connecting={connecting}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <main className="flex flex-1 items-center justify-center py-6">
        <AnimatePresence mode="wait">
          {screen === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <Home connected={!!address} onSelect={handleSelect} />
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
      </main>

      <Footer />

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
            className="glass fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full px-4 py-2 text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
