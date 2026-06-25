"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { sfx } from "@/lib/audio";
import { cn } from "@/lib/cn";

const FAQ = [
  { q: "Is the bot beatable?", a: "Yes. A perfect tic-tac-toe bot can never lose, so that would be a rigged bet. Satto's bot blunders at a tuned rate — often on Normal, rarely on Hard — so a win is always reachable with real play." },
  { q: "What happens to my stake?", a: "It is escrowed in the contract while you play. Win and you receive 2x or 3x, with the extra paid from the house pool. Draw refunds your stake. Lose and the stake joins the house." },
  { q: "Can my funds get stuck?", a: "No. If a game is never settled by the relayer, you can reclaim your full stake on-chain after the stale timeout. Funds can never be frozen." },
  { q: "What wallet do I need?", a: "Any Stacks wallet — Leather or Xverse. Connect it, make sure it is on the right network, and you are ready to stake." },
  { q: "Why is settlement done by a relayer?", a: "The opponent is a bot, so there is no second on-chain party to enforce the result. A trusted relayer reports each outcome and the contract pays out. The trust model is documented and your stake is always reclaimable." },
  { q: "Can I try it without staking?", a: "Yes — the free demo is the exact same game with no wallet and no STX. Practice there, then play for real." },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="flex flex-col gap-2.5">
      {FAQ.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="surface overflow-hidden rounded-2xl">
            <button
              onClick={() => { setOpen(isOpen ? null : i); sfx.click(); }}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-display text-[15px] font-semibold">{item.q}</span>
              <Plus className={cn("h-4 w-4 shrink-0 text-teal transition-transform", isOpen && "rotate-45")} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-[14px] leading-relaxed text-dim">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
