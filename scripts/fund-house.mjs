import { generateWallet, getStxAddress } from "@stacks/wallet-sdk";
import { makeContractCall, broadcastTransaction, uintCV, PostConditionMode } from "@stacks/transactions";
import fs from "node:fs";

const TOML = fs.readFileSync(new URL("../settings/Mainnet.toml", import.meta.url), "utf8");
const mnemonic = TOML.match(/mnemonic\s*=\s*"([^"]+)"/)[1];
const CONTRACT_ADDRESS = "SPKWZPPWPXA1BXM40JQ8R42M86KM2FEXXRT00X12";
const CONTRACT_NAME = "satto-arcade";

const stx = Number(process.env.STX ?? "0.5");
const micro = BigInt(Math.round(stx * 1_000_000));

const wallet = await generateWallet({ secretKey: mnemonic, password: "" });
const account = wallet.accounts[0];
const sender = getStxAddress(account, "mainnet");
console.log(`Funding house with ${stx} STX from ${sender}`);

const tx = await makeContractCall({
  contractAddress: CONTRACT_ADDRESS,
  contractName: CONTRACT_NAME,
  functionName: "fund-house",
  functionArgs: [uintCV(micro)],
  senderKey: account.stxPrivateKey,
  network: "mainnet",
  postConditionMode: PostConditionMode.Allow,
  fee: 3000n,
});

const res = await broadcastTransaction({ transaction: tx, network: "mainnet" });
console.log("txid:", res.txid ?? res);
