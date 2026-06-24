import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const player = accounts.get("wallet_1")!;
const stranger = accounts.get("wallet_2")!;

const CONTRACT = "satto-arcade";

const MODE_NORMAL = 0;
const MODE_HARD = 1;
const OUT_LOSE = 0;
const OUT_DRAW = 1;
const OUT_WIN = 2;

const STAKE = 1_000_000;
const HOUSE_FUND = 100_000_000;

const gid = (n: number) => Cl.bufferFromHex(n.toString(16).padStart(64, "0"));

function fundHouse(amount = HOUSE_FUND) {
  return simnet.callPublicFn(CONTRACT, "fund-house", [Cl.uint(amount)], deployer);
}

describe("satto-arcade escrow", () => {
  beforeEach(() => {
    fundHouse();
  });

  it("owner and relayer default to the deployer", () => {
    expect(simnet.callReadOnlyFn(CONTRACT, "get-owner", [], deployer).result).toBePrincipal(deployer);
    expect(simnet.callReadOnlyFn(CONTRACT, "get-relayer", [], deployer).result).toBePrincipal(deployer);
  });

  it("fund-house increases the house balance", () => {
    const bal = simnet.callReadOnlyFn(CONTRACT, "get-house-balance", [], deployer).result;
    expect(bal).toBeUint(HOUSE_FUND);
  });

  it("lets a player stake and stores the game", () => {
    const createdAt = simnet.burnBlockHeight;
    const { result } = simnet.callPublicFn(CONTRACT, "stake", [gid(1), Cl.uint(MODE_NORMAL), Cl.uint(STAKE)], player);
    expect(result).toBeOk(Cl.bool(true));

    const game = simnet.callReadOnlyFn(CONTRACT, "get-game", [gid(1)], player).result;
    expect(game).toBeSome(
      Cl.tuple({
        player: Cl.principal(player),
        stake: Cl.uint(STAKE),
        "created-at": Cl.uint(createdAt),
        mode: Cl.uint(MODE_NORMAL),
        settled: Cl.bool(false),
      })
    );
  });

  it("rejects a stake below the minimum", () => {
    const { result } = simnet.callPublicFn(CONTRACT, "stake", [gid(2), Cl.uint(MODE_NORMAL), Cl.uint(0)], player);
    expect(result).toBeErr(Cl.uint(102));
  });

  it("accepts the 1 micro-STX network-floor stake", () => {
    const { result } = simnet.callPublicFn(CONTRACT, "stake", [gid(5), Cl.uint(MODE_NORMAL), Cl.uint(1)], player);
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects a duplicate game id", () => {
    simnet.callPublicFn(CONTRACT, "stake", [gid(3), Cl.uint(MODE_NORMAL), Cl.uint(STAKE)], player);
    const { result } = simnet.callPublicFn(CONTRACT, "stake", [gid(3), Cl.uint(MODE_NORMAL), Cl.uint(STAKE)], player);
    expect(result).toBeErr(Cl.uint(103));
  });

  it("rejects an unknown mode", () => {
    const { result } = simnet.callPublicFn(CONTRACT, "stake", [gid(4), Cl.uint(9), Cl.uint(STAKE)], player);
    expect(result).toBeErr(Cl.uint(108));
  });

  it("pays 2x on a Normal win from the house pool", () => {
    simnet.callPublicFn(CONTRACT, "stake", [gid(10), Cl.uint(MODE_NORMAL), Cl.uint(STAKE)], player);
    const before = simnet.getAssetsMap().get("STX")?.get(player) ?? 0n;

    const { result } = simnet.callPublicFn(CONTRACT, "settle", [gid(10), Cl.uint(OUT_WIN)], deployer);
    expect(result).toBeOk(Cl.uint(STAKE * 2));

    const after = simnet.getAssetsMap().get("STX")?.get(player) ?? 0n;
    expect(after - before).toBe(BigInt(STAKE * 2));

    const house = simnet.callReadOnlyFn(CONTRACT, "get-house-balance", [], deployer).result;
    expect(house).toBeUint(HOUSE_FUND - STAKE);
  });

  it("pays 3x on a Hard win", () => {
    simnet.callPublicFn(CONTRACT, "stake", [gid(11), Cl.uint(MODE_HARD), Cl.uint(STAKE)], player);
    const { result } = simnet.callPublicFn(CONTRACT, "settle", [gid(11), Cl.uint(OUT_WIN)], deployer);
    expect(result).toBeOk(Cl.uint(STAKE * 3));
  });

  it("refunds the stake on a draw", () => {
    simnet.callPublicFn(CONTRACT, "stake", [gid(12), Cl.uint(MODE_NORMAL), Cl.uint(STAKE)], player);
    const before = simnet.getAssetsMap().get("STX")?.get(player) ?? 0n;
    const { result } = simnet.callPublicFn(CONTRACT, "settle", [gid(12), Cl.uint(OUT_DRAW)], deployer);
    expect(result).toBeOk(Cl.uint(STAKE));
    const after = simnet.getAssetsMap().get("STX")?.get(player) ?? 0n;
    expect(after - before).toBe(BigInt(STAKE));
  });

  it("forfeits the stake to the house on a loss", () => {
    simnet.callPublicFn(CONTRACT, "stake", [gid(13), Cl.uint(MODE_NORMAL), Cl.uint(STAKE)], player);
    const { result } = simnet.callPublicFn(CONTRACT, "settle", [gid(13), Cl.uint(OUT_LOSE)], deployer);
    expect(result).toBeOk(Cl.uint(0));
    const house = simnet.callReadOnlyFn(CONTRACT, "get-house-balance", [], deployer).result;
    expect(house).toBeUint(HOUSE_FUND + STAKE);
  });

  it("only the relayer can settle", () => {
    simnet.callPublicFn(CONTRACT, "stake", [gid(14), Cl.uint(MODE_NORMAL), Cl.uint(STAKE)], player);
    const { result } = simnet.callPublicFn(CONTRACT, "settle", [gid(14), Cl.uint(OUT_WIN)], stranger);
    expect(result).toBeErr(Cl.uint(101));
  });

  it("cannot settle the same game twice", () => {
    simnet.callPublicFn(CONTRACT, "stake", [gid(15), Cl.uint(MODE_NORMAL), Cl.uint(STAKE)], player);
    simnet.callPublicFn(CONTRACT, "settle", [gid(15), Cl.uint(OUT_DRAW)], deployer);
    const { result } = simnet.callPublicFn(CONTRACT, "settle", [gid(15), Cl.uint(OUT_WIN)], deployer);
    expect(result).toBeErr(Cl.uint(105));
  });

  it("blocks a stale refund before the timeout", () => {
    simnet.callPublicFn(CONTRACT, "stake", [gid(20), Cl.uint(MODE_NORMAL), Cl.uint(STAKE)], player);
    const { result } = simnet.callPublicFn(CONTRACT, "claim-stale-refund", [gid(20)], player);
    expect(result).toBeErr(Cl.uint(106));
  });

  it("allows a stale refund after the timeout", () => {
    simnet.callPublicFn(CONTRACT, "stake", [gid(21), Cl.uint(MODE_NORMAL), Cl.uint(STAKE)], player);
    const before = simnet.getAssetsMap().get("STX")?.get(player) ?? 0n;
    simnet.mineEmptyBurnBlocks(7);
    const { result } = simnet.callPublicFn(CONTRACT, "claim-stale-refund", [gid(21)], player);
    expect(result).toBeOk(Cl.bool(true));
    const after = simnet.getAssetsMap().get("STX")?.get(player) ?? 0n;
    expect(after - before).toBe(BigInt(STAKE));
  });

  it("rejects a stake the house cannot cover", () => {
    const huge = HOUSE_FUND + STAKE;
    const { result } = simnet.callPublicFn(CONTRACT, "stake", [gid(30), Cl.uint(MODE_NORMAL), Cl.uint(huge)], player);
    expect(result).toBeErr(Cl.uint(109));
  });

  it("only the owner can withdraw the house", () => {
    const { result } = simnet.callPublicFn(CONTRACT, "withdraw-house", [Cl.uint(1000)], stranger);
    expect(result).toBeErr(Cl.uint(100));
  });
});
