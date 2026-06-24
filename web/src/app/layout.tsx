import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Satto — stake, outplay, win",
  description:
    "Satto is a noughts & crosses skill bet on Stacks. Stake STX, beat the bot, double or triple your stake. Settled on-chain, funds never freeze.",
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "Satto — stake, outplay, win",
    description: "A noughts & crosses skill bet on Stacks. Beat the bot, win your stake back over.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07070b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
