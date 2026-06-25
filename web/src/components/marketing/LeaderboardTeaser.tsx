"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, ArrowUpRight } from "lucide-react";
import { fetchLeaderboard, type LeaderboardEntry } from "@/lib/leaderboard";
import { shortAddress } from "@/lib/contract";
import { cn } from "@/lib/cn";

export default function LeaderboardTeaser() {
  const [rows, setRows] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    fetchLeaderboard().then((r) => setRows(r.slice(0, 3))).catch(() => setRows([]));
  }, []);

  return (
    <div className="surface rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="mono text-[11px] uppercase tracking-[0.2em] text-faint">On-chain</p>
          <h3 className="font-display mt-1 text-2xl font-bold">Top players</h3>
        </div>
        <Link href="/leaderboard" className="group inline-flex items-center gap-1.5 text-sm font-medium text-teal">
          Full board
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <div className="mt-5 flex flex-col gap-1.5">
        {!rows && <p className="mono py-6 text-center text-[12px] uppercase tracking-wider text-faint">Reading the chain…</p>}
        {rows && rows.length === 0 && (
          <p className="py-6 text-center text-sm text-dim">No games yet — be the first.</p>
        )}
        {rows?.map((r, i) => (
          <div key={r.address} className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span
              className={cn(
                "mono grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold",
                i === 0 && "bg-teal/15 text-teal",
                i === 1 && "bg-white/10 text-bone",
                i === 2 && "bg-amber/15 text-amber"
              )}
            >
              <Crown className="h-3.5 w-3.5" />
            </span>
            <span className="mono flex-1 truncate text-sm font-semibold">{shortAddress(r.address)}</span>
            <span className="mono text-[11px] text-faint">{r.wins}W · {r.losses}L · {r.draws}D</span>
          </div>
        ))}
      </div>
    </div>
  );
}
