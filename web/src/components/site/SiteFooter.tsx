import Image from "next/image";
import Link from "next/link";
import { SATTO_CONTRACT, contractUrl, shortContract } from "@/lib/contract";

const COLS = [
  {
    title: "Play",
    links: [
      { href: "/play", label: "Stake & play" },
      { href: "/demo", label: "Free demo" },
      { href: "/leaderboard", label: "Leaderboard" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/faq", label: "FAQ" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--hair)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-2">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="Satto" width={32} height={32} />
            <span className="font-display text-lg font-bold tracking-tight">Satto</span>
          </Link>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-dim">
            A noughts &amp; crosses skill bet on Stacks. Stake, outplay the bot, and keep the winnings —
            settled on-chain, funds never freeze.
          </p>
          <a
            href={contractUrl()}
            target="_blank"
            rel="noreferrer"
            className="mono mt-5 inline-block text-[11px] uppercase tracking-[0.14em] text-faint hover:text-bone"
          >
            {shortContract(SATTO_CONTRACT)}
          </a>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <p className="mono text-[11px] uppercase tracking-[0.2em] text-faint">{col.title}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-dim transition-colors hover:text-bone">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--hair)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 sm:flex-row sm:px-8">
          <p className="mono text-[11px] text-faint">© 2026 Satto · Built on Stacks</p>
          <p className="mono text-[11px] text-faint">Lose, the house keeps it · Win, the house pays out</p>
        </div>
      </div>
    </footer>
  );
}
