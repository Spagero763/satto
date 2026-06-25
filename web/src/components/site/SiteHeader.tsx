"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useWallet } from "@/components/WalletProvider";
import WalletButton from "@/components/WalletButton";
import { sfx } from "@/lib/audio";
import { cn } from "@/lib/cn";
import AudioControls from "./AudioControls";

const LINKS = [
  { href: "/play", label: "Play" },
  { href: "/demo", label: "Demo" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/faq", label: "FAQ" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { address, connecting, connect, disconnect } = useWallet();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--hair)] bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" onMouseEnter={() => sfx.hover()}>
          <Image src="/logo.svg" alt="Satto" width={32} height={32} priority />
          <span className="font-display text-lg font-bold tracking-tight">Satto</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onMouseEnter={() => sfx.hover()}
                onClick={() => sfx.nav()}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "bg-[var(--hair)] text-bone" : "text-dim hover:text-bone"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:block">
            <AudioControls />
          </div>
          <div className="hidden md:block">
            <WalletButton address={address} busy={connecting} onConnect={connect} onDisconnect={disconnect} />
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="surface surface-hover flex h-9 w-9 items-center justify-center rounded-full md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-[var(--hair)] md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => { sfx.nav(); setOpen(false); }}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === l.href ? "bg-[var(--hair)] text-bone" : "text-dim"
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 flex items-center justify-between">
                <WalletButton address={address} busy={connecting} onConnect={connect} onDisconnect={disconnect} />
                <AudioControls />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
