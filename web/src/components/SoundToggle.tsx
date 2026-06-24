"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isMuted, setMuted } from "@/lib/sfx";

export default function SoundToggle() {
  const [muted, set] = useState(false);
  useEffect(() => set(isMuted()), []);

  return (
    <button
      onClick={() => {
        const next = !muted;
        set(next);
        setMuted(next);
      }}
      className="glass flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:border-white/20"
      title={muted ? "Unmute" : "Mute"}
    >
      {muted ? <VolumeX className="h-4 w-4 opacity-70" /> : <Volume2 className="h-4 w-4 opacity-70" />}
    </button>
  );
}
