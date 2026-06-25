import type { Metadata } from "next";
import PlayApp from "@/components/PlayApp";

export const metadata: Metadata = {
  title: "Play — Satto",
  description: "Stake STX, beat the bot, and win. Settled on-chain.",
};

export default function PlayPage() {
  return <PlayApp />;
}
