export const SATTO_CONTRACT =
  process.env.NEXT_PUBLIC_SATTO_CONTRACT ??
  "SPKWZPPWPXA1BXM40JQ8R42M86KM2FEXXRT00X12.satto-arcade";

export const [SATTO_ADDRESS, SATTO_NAME] = SATTO_CONTRACT.split(".") as [string, string];

export const SATTO_NETWORK = process.env.NEXT_PUBLIC_SATTO_NETWORK ?? "mainnet";

const EXPLORER = "https://explorer.hiro.so";

export function contractUrl(id: string = SATTO_CONTRACT): string {
  return `${EXPLORER}/txid/${id}?chain=${SATTO_NETWORK}`;
}

export function addressUrl(addr: string): string {
  return `${EXPLORER}/address/${addr}?chain=${SATTO_NETWORK}`;
}

export function txUrl(txid: string): string {
  const id = txid.startsWith("0x") ? txid : `0x${txid}`;
  return `${EXPLORER}/txid/${id}?chain=${SATTO_NETWORK}`;
}

export function shortContract(id: string = SATTO_CONTRACT): string {
  const [addr, name] = id.split(".");
  return `${addr.slice(0, 5)}…${addr.slice(-4)}.${name}`;
}

export function shortAddress(addr: string): string {
  return `${addr.slice(0, 5)}…${addr.slice(-4)}`;
}

export function formatStx(micro: number): string {
  const stx = (micro / 1_000_000).toFixed(6);
  return stx.replace(/\.?0+$/, "");
}
