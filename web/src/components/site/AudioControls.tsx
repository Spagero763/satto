"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX, Music, Music2 } from "lucide-react";
import { isMuted, setMuted, musicEnabled, startMusic, stopMusic, sfx } from "@/lib/audio";
import { cn } from "@/lib/cn";

function IconBtn({
  active,
  title,
  onClick,
  children,
}: {
  active: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "surface surface-hover flex h-9 w-9 items-center justify-center rounded-full transition-colors",
        active ? "text-teal" : "text-faint"
      )}
    >
      {children}
    </button>
  );
}

export default function AudioControls() {
  const [muted, setM] = useState(false);
  const [music, setMu] = useState(false);

  useEffect(() => {
    setM(isMuted());
    setMu(musicEnabled());
    if (musicEnabled()) {
      const resume = () => {
        startMusic();
        setMu(true);
        window.removeEventListener("pointerdown", resume);
      };
      window.addEventListener("pointerdown", resume, { once: true });
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      <IconBtn
        active={music}
        title={music ? "Music off" : "Music on"}
        onClick={() => {
          if (music) {
            stopMusic();
            setMu(false);
          } else {
            startMusic();
            setMu(true);
            sfx.success();
          }
        }}
      >
        {music ? <Music className="h-4 w-4" /> : <Music2 className="h-4 w-4" />}
      </IconBtn>
      <IconBtn
        active={!muted}
        title={muted ? "Unmute effects" : "Mute effects"}
        onClick={() => {
          const next = !muted;
          setM(next);
          setMuted(next);
          if (!next) sfx.click();
        }}
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </IconBtn>
    </div>
  );
}
