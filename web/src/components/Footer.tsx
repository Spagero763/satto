import { SATTO_CONTRACT, contractUrl, shortContract } from "@/lib/contract";

export default function Footer() {
  return (
    <footer className="px-5 py-6 text-center sm:px-8">
      <p className="mono text-[11px] uppercase tracking-[0.14em] text-faint">
        Escrow settled on-chain ·{" "}
        <a href={contractUrl()} target="_blank" rel="noreferrer" className="text-dim underline decoration-[var(--hair)] underline-offset-4 hover:text-bone">
          {shortContract(SATTO_CONTRACT)}
        </a>
      </p>
      <p className="mt-2 text-[12px] text-faint">
        Lose and your stake joins the house. Win and the house pays you out. Funds never freeze.
      </p>
    </footer>
  );
}
