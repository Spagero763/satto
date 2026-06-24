"use client";

import {
  connect,
  disconnect,
  isConnected,
  getLocalStorage,
  request,
} from "@stacks/connect";
import { Cl, Pc } from "@stacks/transactions";
import { SATTO_CONTRACT, SATTO_NETWORK } from "./contract";

export type StxNetwork = "testnet" | "mainnet";
const NETWORK = SATTO_NETWORK as StxNetwork;

export function getStxAddress(): string | null {
  try {
    if (!isConnected()) return null;
    const data = getLocalStorage();
    return data?.addresses?.stx?.[0]?.address ?? null;
  } catch {
    return null;
  }
}

export function walletConnected(): boolean {
  return getStxAddress() !== null;
}

export async function connectWallet(): Promise<string | null> {
  await connect();
  return getStxAddress();
}

export function disconnectWallet(): void {
  disconnect();
}

export function newGameId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return "0x" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export interface StakeArgs {
  gameId: string;
  modeIndex: number;
  amountMicro: number;
  sender: string;
}

export async function stakeOnChain({
  gameId,
  modeIndex,
  amountMicro,
  sender,
}: StakeArgs): Promise<string> {
  const res = await request("stx_callContract", {
    contract: SATTO_CONTRACT as `${string}.${string}`,
    functionName: "stake",
    functionArgs: [
      Cl.bufferFromHex(gameId.replace(/^0x/, "")),
      Cl.uint(modeIndex),
      Cl.uint(amountMicro),
    ],
    network: NETWORK,
    postConditionMode: "deny",
    postConditions: [Pc.principal(sender).willSendEq(amountMicro).ustx()],
  });
  const txid = (res as { txid?: string }).txid;
  if (!txid) throw new Error("Wallet did not return a transaction id");
  return txid;
}
