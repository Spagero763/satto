"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { connectWallet, disconnectWallet, getStxAddress } from "@/lib/stacks";

interface WalletCtx {
  address: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const Ctx = createContext<WalletCtx>({
  address: null,
  connecting: false,
  connect: async () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    setAddress(getStxAddress());
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      setAddress(await connectWallet());
    } catch {
      /* user closed the modal */
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectWallet();
    setAddress(null);
  }, []);

  return <Ctx.Provider value={{ address, connecting, connect, disconnect }}>{children}</Ctx.Provider>;
}

export function useWallet() {
  return useContext(Ctx);
}
