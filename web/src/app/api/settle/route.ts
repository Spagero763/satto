import { NextRequest, NextResponse } from "next/server";
import {
  Cl,
  ClarityType,
  makeContractCall,
  broadcastTransaction,
  fetchCallReadOnlyFunction,
  PostConditionMode,
} from "@stacks/transactions";
import { evaluate, type Cell } from "@/lib/engine";
import { SATTO_ADDRESS, SATTO_NAME, SATTO_NETWORK } from "@/lib/contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Outcome = "win" | "lose" | "draw";
const OUTCOME_CODE: Record<Outcome, number> = { lose: 0, draw: 1, win: 2 };
const MODE_INDEX: Record<"normal" | "hard", number> = { normal: 0, hard: 1 };

const NETWORK = (SATTO_NETWORK as "testnet" | "mainnet") ?? "mainnet";

function boardIsConsistent(board: Cell[], outcome: Outcome): boolean {
  if (!Array.isArray(board) || board.length !== 9) return false;
  if (!board.every((c) => c === "X" || c === "O" || c === null)) return false;
  const x = board.filter((c) => c === "X").length;
  const o = board.filter((c) => c === "O").length;
  if (!(x === o || x === o + 1)) return false;
  const ev = evaluate(board);
  if (outcome === "win") return ev.winner === "X";
  if (outcome === "lose") return ev.winner === "O";
  return ev.winner === null && board.every((c) => c !== null);
}

export async function POST(req: NextRequest) {
  const key = process.env.RELAYER_PRIVATE_KEY;
  if (!key) {
    return NextResponse.json({ error: "On-chain settlement is not configured" }, { status: 503 });
  }

  let body: { gameId?: string; mode?: "normal" | "hard"; board?: Cell[]; outcome?: Outcome; player?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { gameId, mode, board, outcome, player } = body;
  if (!gameId || !mode || !board || !outcome || !player) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!boardIsConsistent(board, outcome)) {
    return NextResponse.json({ error: "Board does not match the claimed result" }, { status: 400 });
  }

  try {
    const game = await fetchCallReadOnlyFunction({
      contractAddress: SATTO_ADDRESS,
      contractName: SATTO_NAME,
      functionName: "get-game",
      functionArgs: [Cl.bufferFromHex(gameId.replace(/^0x/, ""))],
      senderAddress: SATTO_ADDRESS,
      network: NETWORK,
    });

    if (game.type !== ClarityType.OptionalSome) {
      return NextResponse.json({ error: "Game not found on-chain" }, { status: 404 });
    }
    const data = (game.value as { value: Record<string, { value: unknown }> }).value;
    const onchainPlayer = String(data.player.value);
    const onchainMode = Number(data.mode.value);
    const settled = Boolean(data.settled.value);

    if (onchainPlayer.toLowerCase() !== player.toLowerCase()) {
      return NextResponse.json({ error: "Player mismatch" }, { status: 403 });
    }
    if (settled) {
      return NextResponse.json({ error: "Already settled" }, { status: 409 });
    }
    if (onchainMode !== MODE_INDEX[mode]) {
      return NextResponse.json({ error: "Mode mismatch" }, { status: 400 });
    }

    const tx = await makeContractCall({
      contractAddress: SATTO_ADDRESS,
      contractName: SATTO_NAME,
      functionName: "settle",
      functionArgs: [Cl.bufferFromHex(gameId.replace(/^0x/, "")), Cl.uint(OUTCOME_CODE[outcome])],
      senderKey: key,
      network: NETWORK,
      postConditionMode: PostConditionMode.Allow,
      fee: 3000n,
    });

    const res = (await broadcastTransaction({ transaction: tx, network: NETWORK })) as {
      txid?: string;
      error?: string;
      reason?: string;
    };
    if (res.error) {
      return NextResponse.json({ error: res.reason ?? res.error ?? "Broadcast failed" }, { status: 500 });
    }
    return NextResponse.json({ txid: res.txid });
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? "Settlement failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
