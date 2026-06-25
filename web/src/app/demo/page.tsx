import type { Metadata } from "next";
import DemoApp from "@/components/DemoApp";

export const metadata: Metadata = {
  title: "Demo — Satto",
  description: "Play Satto for free. No wallet, no stake — just you against the bot.",
};

export default function DemoPage() {
  return <DemoApp />;
}
