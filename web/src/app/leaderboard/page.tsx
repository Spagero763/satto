"use client";

import { useRouter } from "next/navigation";
import { useWallet } from "@/components/WalletProvider";
import LeaderboardView from "@/components/LeaderboardView";

export default function LeaderboardPage() {
  const router = useRouter();
  const { address } = useWallet();
  return (
    <div className="py-10">
      <LeaderboardView me={address} onHome={() => router.push("/play")} />
    </div>
  );
}
