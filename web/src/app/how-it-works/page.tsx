import type { Metadata } from "next";
import Link from "next/link";
import { Wallet, Gamepad2, Coins, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "How it works — Satto",
  description: "How Satto escrows your stake, runs a fair beatable bot, and settles every game on-chain.",
};

const STEPS = [
  { icon: Wallet, n: "01", t: "Stake to open a game", b: "You stake STX into the satto-arcade contract. The funds are held in escrow for the duration of the game — nobody can touch them mid-round." },
  { icon: Gamepad2, n: "02", t: "Play the bot", b: "You are X and move first against a minimax bot. It plays well but blunders at a tuned rate, so it is genuinely beatable — Normal slips often, Hard rarely." },
  { icon: Coins, n: "03", t: "Settle on-chain", b: "A relayer reports the result to the contract. Win and you receive 2x (Normal) or 3x (Hard), with the extra paid from the house pool. Draw refunds your stake. Lose and the stake joins the house." },
  { icon: ShieldCheck, n: "04", t: "Never frozen", b: "If a game is never settled, you reclaim your full stake on-chain after the stale timeout. Your funds can never be locked away." },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
      <div className="mono flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-faint">
        <span className="h-px w-7 bg-[var(--hair)]" /> Mechanics
      </div>
      <h1 className="font-display mt-4 text-5xl font-extrabold tracking-tight">
        Provably fair, <span className="text-teal">by design.</span>
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-dim">
        Satto is a skill bet, not a casino game. The bot can be beaten, the stake is real, and every
        outcome is recorded on Stacks. Here is the full loop.
      </p>

      <div className="mt-12 flex flex-col gap-4">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.n} className="surface flex gap-5 rounded-2xl p-6">
              <div className="flex flex-col items-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--hair)] text-teal">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div>
                <span className="mono text-[11px] text-faint">{s.n}</span>
                <h3 className="font-display mt-1 text-xl font-bold">{s.t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-dim">{s.b}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="surface mt-10 rounded-2xl p-6">
        <h3 className="font-display text-lg font-bold">Why a bot that blunders?</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-dim">
          Tic-tac-toe is a solved game — perfect play always draws, and a perfect bot could never be beaten.
          Staking against an unbeatable opponent would be a rigged trap. So each difficulty blunders at a
          deliberate, tuned rate. Hard is genuinely tough, but the win is always reachable with real play.
        </p>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/play" className="group inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-bold text-bg transition hover:brightness-110">
          Play for real <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link href="/demo" className="surface surface-hover inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-bone">
          Try the free demo
        </Link>
      </div>
    </div>
  );
}
