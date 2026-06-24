"use client";

import { motion } from "framer-motion";
import { Wallet, LogOut } from "lucide-react";
import { shortAddress } from "@/lib/contract";

interface Props {
  address: string | null;
  busy?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function WalletButton({ address, busy, onConnect, onDisconnect }: Props) {
  if (address) {
    return (
      <button
        onClick={onDisconnect}
        className="glass group flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:border-white/20"
        title="Disconnect"
      >
        <span className="h-2 w-2 rounded-full bg-teal" />
        <span className="tabular-nums">{shortAddress(address)}</span>
        <LogOut className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      disabled={busy}
      onClick={onConnect}
      className="flex items-center gap-2 rounded-full bg-violet px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet/30 transition disabled:opacity-60"
    >
      <Wallet className="h-4 w-4" />
      {busy ? "Connecting…" : "Connect wallet"}
    </motion.button>
  );
}
