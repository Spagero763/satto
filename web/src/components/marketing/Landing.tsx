"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bitcoin, ShieldCheck, Coins, Zap, Flame } from "lucide-react";
import { MODES } from "@/lib/modes";
import { formatStx, SATTO_CONTRACT, contractUrl, shortContract } from "@/lib/contract";
import { sfx } from "@/lib/audio";
import HeroBoard from "./HeroBoard";
import LeaderboardTeaser from "./LeaderboardTeaser";

const ease = [0.22, 1, 0.36, 1] as const;

const STATS = [
  ["2–3×", "Payout on a win"],
  ["On-chain", "Every game settled"],
  ["Never", "Funds frozen"],
  ["Bitcoin", "Secured via Stacks"],
];

const STEPS = [
  ["01", "Stake", "Lock STX into the escrow to open a game."],
  ["02", "Outplay", "Beat a sharp but beatable bot. You move first."],
  ["03", "Cash out", "Win pays 2–3×. Settled trustlessly on-chain."],
];

export default function Landing() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-14 pb-20 sm:px-8 lg:grid-cols-2 lg:pt-20">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="mono inline-flex items-center gap-2 rounded-full border border-[var(--hair)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-teal"
          >
            <Bitcoin className="h-3.5 w-3.5" /> Live on Stacks
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="font-display mt-6 text-6xl font-extrabold leading-[0.92] tracking-tight sm:text-7xl"
          >
            Outplay the
            <br />
            machine. <span className="text-teal">Keep</span>
            <br />
            <span className="text-stroke">the winnings.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease }}
            className="mt-6 max-w-md text-[15px] leading-relaxed text-dim"
          >
            Satto is a noughts &amp; crosses skill bet. Stake STX, beat the bot, and double or triple your
            stake — escrowed and settled on-chain, with funds that can never freeze.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/play"
              onMouseEnter={() => sfx.hover()}
              onClick={() => sfx.click()}
              className="group inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-bold text-bg transition hover:brightness-110"
            >
              Play for real <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/demo"
              onMouseEnter={() => sfx.hover()}
              className="surface surface-hover inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-bone"
            >
              Try the free demo
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="flex justify-center lg:justify-end"
        >
          <HeroBoard />
        </motion.div>
      </section>

      <section className="border-y border-[var(--hair)]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-[var(--hair)] px-5 sm:px-8 md:grid-cols-4">
          {STATS.map(([big, small], i) => (
            <div key={i} className="px-4 py-7 text-center first:pl-0">
              <p className="font-display text-2xl font-extrabold sm:text-3xl">{big}</p>
              <p className="mono mt-1 text-[11px] uppercase tracking-wider text-faint">{small}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="mono flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-faint">
          <span className="h-px w-7 bg-[var(--hair)]" /> Three steps
        </div>
        <h2 className="font-display mt-4 max-w-xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          Stake, outplay, <span className="text-teal">cash out.</span>
        </h2>

        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-[var(--hair)] bg-[var(--hair)] md:grid-cols-3">
          {STEPS.map(([n, t, b]) => (
            <div key={n} className="bg-bg p-7">
              <span className="mono text-sm text-teal">{n}</span>
              <h3 className="font-display mt-3 text-xl font-bold">{t}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-dim">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mono flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-faint">
              <span className="h-px w-7 bg-[var(--hair)]" /> Two ways to play
            </div>
            <h2 className="font-display mt-4 text-4xl font-extrabold tracking-tight">
              Warm up, or <span className="text-violet">prove it.</span>
            </h2>
            <p className="mt-3 max-w-md text-[15px] text-dim">
              Normal slips often and pays 2×. Hard defends near-perfectly and pays 3×. Same stake, your call
              on the risk.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {[MODES.normal, MODES.hard].map((m) => {
                const isHard = m.id === "hard";
                const Icon = isHard ? Flame : Zap;
                return (
                  <div key={m.id} className="surface flex items-center justify-between rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${isHard ? "bg-teal/12 text-teal" : "bg-violet/12 text-violet"}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-display text-sm font-bold">{m.name}</p>
                        <p className="mono text-[11px] text-faint">{formatStx(m.stakeMicro)} STX stake</p>
                      </div>
                    </div>
                    <span className={`mono rounded-full px-2.5 py-1 text-xs font-bold ${isHard ? "bg-teal/12 text-teal" : "bg-violet/12 text-violet"}`}>
                      {m.payout}×
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <LeaderboardTeaser />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [Coins, "Real stake", "Your STX sits in escrow while the round plays out."],
            [ShieldCheck, "Never frozen", "Reclaim your stake on-chain if a game is never settled."],
            [Bitcoin, "Bitcoin-secured", "Final on Stacks, anchored to the Bitcoin chain."],
          ].map(([Icon, t, b], i) => {
            const I = Icon as typeof Coins;
            return (
              <div key={i} className="surface rounded-2xl p-6">
                <I className="h-5 w-5 text-teal" />
                <p className="font-display mt-3 text-base font-semibold">{t as string}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-faint">{b as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
        <div className="surface relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--teal), transparent 60%)" }}
          />
          <h2 className="font-display relative text-4xl font-extrabold tracking-tight sm:text-5xl">
            Think you can beat it?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-[15px] text-dim">
            Connect a Stacks wallet, stake, and find out. Or warm up on the free demo first.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/play" className="group inline-flex items-center gap-2 rounded-full bg-bone px-6 py-3 text-sm font-bold text-bg transition hover:bg-white">
              Start playing <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/how-it-works" className="surface surface-hover inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-bone">
              How it works
            </Link>
          </div>
          <a href={contractUrl()} target="_blank" rel="noreferrer" className="mono relative mt-8 inline-block text-[11px] uppercase tracking-[0.14em] text-faint hover:text-bone">
            {shortContract(SATTO_CONTRACT)}
          </a>
        </div>
      </section>
    </div>
  );
}
