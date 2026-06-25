"use client";

import Image from "next/image";
import WalletButton from "./WalletButton";
import SoundToggle from "./SoundToggle";
import { SATTO_NETWORK } from "@/lib/contract";

interface Props {
  address: string | null;
  connecting?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function TopBar({ address, connecting, onConnect, onDisconnect }: Props) {
  return (
    <header className="flex items-center justify-between gap-3 px-5 py-4 sm:px-8">
      <div className="flex items-center gap-2.5">
        <Image src="/logo.svg" alt="Satto" width={34} height={34} priority />
        <span className="font-display text-lg font-bold tracking-tight">Satto</span>
        <span className="mono ml-1 hidden rounded-full border border-[var(--hair)] px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-teal sm:inline">
          {SATTO_NETWORK}
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <SoundToggle />
        <WalletButton address={address} busy={connecting} onConnect={onConnect} onDisconnect={onDisconnect} />
      </div>
    </header>
  );
}
