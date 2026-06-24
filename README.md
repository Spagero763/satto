# Satto

A noughts & crosses skill bet on Stacks. Stake STX, beat the bot, double or triple your stake. Every game is escrowed and settled on-chain, and a stake can always be reclaimed if it is never settled.

## How it works

1. The player stakes STX into the `satto-arcade` contract to open a game.
2. The game is played in the browser against a minimax bot that blunders at a tuned rate, so it is genuinely beatable.
3. A relayer reports the result to the contract:
   - **Win** pays the stake back multiplied by the mode payout (2x Normal, 3x Hard), with the extra coming from the house pool.
   - **Draw** refunds the stake.
   - **Loss** sends the stake to the house pool.
4. If a game is never settled, the player can reclaim their stake after the stale timeout.

## Project layout

```
contracts/satto-arcade.clar   Clarity escrow contract
tests/                        Contract test suite (Clarinet JS SDK)
scripts/                      House funding helper
web/                          Next.js front end
```

## Contract

Built and tested with Clarinet.

```
clarinet check
npm install
npm test
```

## Web

```
cd web
npm install
npm run dev
```

Set the front end environment in `web/.env.local`:

```
NEXT_PUBLIC_SATTO_CONTRACT=<address>.satto-arcade
NEXT_PUBLIC_SATTO_NETWORK=mainnet
RELAYER_PRIVATE_KEY=<relayer key for settlement>
```

## Stack

- Clarity smart contract on Stacks
- Clarinet for build and tests
- Next.js, React, Tailwind, Framer Motion
- `@stacks/connect` for Leather and Xverse wallets
