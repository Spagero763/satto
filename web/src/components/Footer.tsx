import { SATTO_CONTRACT, contractUrl, shortContract } from "@/lib/contract";

export default function Footer() {
  return (
    <footer className="px-5 py-6 text-center text-xs text-white/40 sm:px-8">
      <p>
        Escrow settled on-chain ·{" "}
        <a href={contractUrl()} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-white/70">
          {shortContract(SATTO_CONTRACT)}
        </a>
      </p>
      <p className="mt-1.5 text-white/30">
        Lose and your stake joins the house. Win and the house pays you out. Funds never freeze.
      </p>
    </footer>
  );
}
