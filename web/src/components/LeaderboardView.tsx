"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { fetchLeaderboard, type LeaderboardEntry } from "@/lib/leaderboard";
import { addressUrl, contractUrl, shortAddress } from "@/lib/contract";
import { cn } from "@/lib/cn";

function signed(n: number): string {
  const v = Number(n.toFixed(6));
  if (v === 0) return "0";
  return (v > 0 ? "+" : "") + v + " STX";
}

export default function LeaderboardView({ me, onHome }: { me: string | null; onHome: () => void }) {
  const [rows, setRows] = useState<LeaderboardEntry[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      setRows(await fetchLeaderboard());
    } catch {
      setErr("Could not read the chain. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-5 pb-10">
      <div className="flex items-center justify-between">
        <button
          onClick={onHome}
          className="surface surface-hover inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-dim transition-colors hover:text-bone"
        >
          <ArrowLeft className="h-4 w-4" /> Lobby
        </button>
        <button
          onClick={load}
          className="surface surface-hover inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-teal"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      <div className="mono mt-7 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-faint">
        <span className="h-px w-7 bg-[var(--hair)]" /> Hall of fame
      </div>
      <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight">
        Top of the <span className="text-teal">board</span>
      </h1>
      <p className="mt-2 flex items-center gap-1 text-[13px] text-dim">
        Live, on-chain results from
        <a href={contractUrl()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium text-teal">
          the escrow <ExternalLink className="h-3 w-3" />
        </a>
      </p>

      <div className="mt-6 flex flex-col gap-1.5">
        {loading && !rows && (
          <div className="mono flex items-center justify-center gap-2 py-12 text-[12px] uppercase tracking-wider text-faint">
            <Loader2 className="h-4 w-4 animate-spin" /> Reading the chain…
          </div>
        )}

        {err && <p className="py-10 text-center text-sm text-violet">{err}</p>}

        {rows && rows.length === 0 && (
          <div className="surface rounded-3xl p-8 text-center">
            <p className="font-display text-lg font-bold">No games yet</p>
            <p className="mt-1 text-sm text-dim">Be the first to stake, beat the bot, and top the board.</p>
          </div>
        )}

        {rows?.map((r, i) => {
          const rank = i + 1;
          const isMe = !!me && r.address === me;
          const podium = rank <= 3;
          return (
            <motion.a
              key={r.address}
              href={addressUrl(r.address)}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.035, 0.4) }}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors",
                isMe ? "surface ring-1 ring-violet/40" : "border border-transparent hover:border-[var(--hair)] hover:bg-[rgba(243,241,233,0.03)]"
              )}
            >
              <span
                className={cn(
                  "mono grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold",
                  rank === 1 && "bg-teal/15 text-teal",
                  rank === 2 && "bg-white/10 text-bone",
                  rank === 3 && "bg-amber/15 text-amber",
                  rank > 3 && "bg-white/5 text-faint"
                )}
              >
                {podium ? <Crown className="h-3.5 w-3.5" /> : rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("mono truncate text-sm font-semibold", isMe ? "text-violet" : "text-bone")}>
                  {shortAddress(r.address)} {isMe && <span className="text-faint">(you)</span>}
                </p>
                <p className="mono text-[11px] text-faint">
                  {r.wins}W · {r.losses}L · {r.draws}D
                </p>
              </div>
              <span
                className={cn(
                  "mono shrink-0 text-sm font-bold",
                  r.net > 0 ? "text-teal" : r.net < 0 ? "text-violet" : "text-dim"
                )}
              >
                {signed(r.net)}
              </span>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
