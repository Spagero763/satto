import type { Metadata } from "next";
import FaqAccordion from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ — Satto",
  description: "Answers about staking, the bot, settlement, and keeping your funds safe.",
};

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-16 sm:px-8">
      <div className="mono flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-faint">
        <span className="h-px w-7 bg-[var(--hair)]" /> Questions
      </div>
      <h1 className="font-display mt-4 text-5xl font-extrabold tracking-tight">
        Good to <span className="text-teal">know.</span>
      </h1>
      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-dim">
        The short version of how Satto works and why your stake is always safe.
      </p>
      <div className="mt-10">
        <FaqAccordion />
      </div>
    </div>
  );
}
