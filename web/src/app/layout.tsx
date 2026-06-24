import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Satto — stake, outplay, win",
  description:
    "Satto is a noughts & crosses skill bet on Stacks. Stake STX, beat the bot, double or triple your stake. Settled on-chain, funds never freeze.",
  icons: { icon: "/logo.svg" },
  other: {
    "talentapp:project_verification":
      "0a7234204908ee42fc58d33e687c299dc171f1914bc968c564e8e4d251b59408d57e915c9f62628e4f73e788c3743ea56a2dbed5554c7e38272a31eec7438a9f",
  },
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
