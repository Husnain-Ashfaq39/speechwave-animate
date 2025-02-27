
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface WaveformProps {
  isPlaying: boolean;
  className?: string;
}

export const Waveform = ({ isPlaying, className }: WaveformProps) => {
  const [bars] = useState(Array.from({ length: 12 }, (_, i) => i));

  return (
    <div className={cn("flex items-center gap-[2px] h-6", className)}>
      {bars.map((index) => (
        <div
          key={index}
          style={{ "--index": index } as React.CSSProperties}
          className={cn(
            "w-1 h-1 rounded-full bg-primary/80 transition-all duration-300 ease-in-out",
            isPlaying && "animate-waveform"
          )}
        />
      ))}
    </div>
  );
};
