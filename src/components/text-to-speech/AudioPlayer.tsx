import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { formatTime } from "@/lib/tts-utils";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
}

export const AudioPlayer = ({
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onSeek
}: AudioPlayerProps) => {
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = x / width;
    const newTime = percentage * duration;
    
    onSeek(newTime);
  };

  return (
    <motion.div 
      className="mt-6 glass-card rounded-lg p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-transform hover:scale-105"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <div className="text-sm">
            {formatTime(currentTime)} / {formatTime(duration || 0)}
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <div 
          className="h-1 w-full bg-secondary rounded-full overflow-hidden cursor-pointer"
          onClick={handleProgressBarClick}
        >
          <div 
            className="h-full bg-primary transition-all duration-100"
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}; 