"use client";

import { hexToCV, cvToJSON } from "@stacks/transactions";
import { SATTO_CONTRACT, SATTO_NETWORK } from "./contract";

const API = SATTO_NETWORK === "mainnet" ? "https://api.hiro.so" : "https://api.testnet.hiro.so";
const PAGE = 50;
const MAX_PAGES = 30;

export interface LeaderboardEntry {
  address: string;
  wins: number;
  losses: number;
  draws: number;
  games: number;
  net: number;
}

interface PrintFields {
  event: { value: string };
  "game-id": { value: string };
  player: { value: string };
  stake?: { value: string };
  outcome?: { value: string };
  payout?: { value: string };
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const stakeByGame = new Map<string, bigint>();
  const settled: { gameId: string; player: string; outcome: number; payout: bigint }[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = `${API}/extended/v1/contract/${SATTO_CONTRACT}/events?limit=${PAGE}&offset=${page * PAGE}`;
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) break;
    const json = await r.json();
    const results: unknown[] = json.results ?? [];

    for (const ev of results) {
      const e = ev as { event_type?: string; contract_log?: { topic?: string; value?: { hex?: string } } };
      if (e.event_type !== "smart_contract_log") continue;
      if (e.contract_log?.topic !== "print" || !e.contract_log.value?.hex) continue;

      const fields = cvToJSON(hexToCV(e.contract_log.value.hex)).value as PrintFields;
      const kind = fields?.event?.value;
      if (kind === "staked" && fields.stake) {
        stakeByGame.set(fields["game-id"].value, BigInt(fields.stake.value));
      } else if (kind === "settled" && fields.outcome && fields.payout) {
        settled.push({
          gameId: fields["game-id"].value,
          player: fields.player.value,
          outcome: Number(fields.outcome.value),
          payout: BigInt(fields.payout.value),
        });
      }
    }

    if (results.length < PAGE) break;
  }

  const byPlayer = new Map<string, LeaderboardEntry & { netMicro: bigint }>();
  for (const s of settled) {
    const e =
      byPlayer.get(s.player) ??
      { address: s.player, wins: 0, losses: 0, draws: 0, games: 0, net: 0, netMicro: 0n };
    const stake = stakeByGame.get(s.gameId) ?? 0n;
    e.games += 1;
    e.netMicro += s.payout - stake;
    if (s.outcome === 2) e.wins += 1;
    else if (s.outcome === 1) e.draws += 1;
    else e.losses += 1;
    byPlayer.set(s.player, e);
  }

  return Array.from(byPlayer.values())
    .map((e) => ({ address: e.address, wins: e.wins, losses: e.losses, draws: e.draws, games: e.games, net: Number(e.netMicro) / 1_000_000 }))
    .sort((a, b) => b.net - a.net || b.wins - a.wins);
}
