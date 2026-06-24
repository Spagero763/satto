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
        <Image src="/logo.svg" alt="Satto" width={36} height={36} priority />
        <span className="text-lg font-bold tracking-tight">Satto</span>
        <span className="glass ml-1 hidden rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-teal sm:inline">
          Stacks {SATTO_NETWORK}
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <SoundToggle />
        <WalletButton address={address} busy={connecting} onConnect={onConnect} onDisconnect={onDisconnect} />
      </div>
    </header>
  );
}
