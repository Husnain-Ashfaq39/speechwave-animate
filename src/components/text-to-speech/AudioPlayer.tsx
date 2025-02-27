import { motion } from "framer-motion";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";
import { formatTime } from "@/lib/tts-utils";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useEffect } from "react";

interface AudioPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export const AudioPlayer = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onToggleMute
}: AudioPlayerProps) => {
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [isVolumeVisible, setIsVolumeVisible] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const volumeBarRef = useRef<HTMLDivElement>(null);

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

  const handleProgressBarHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = x / width;
    setHoverPosition(percentage);
  };

  const calculateVolumeFromEvent = useCallback((clientX: number) => {
    if (!volumeBarRef.current) return;
    
    const rect = volumeBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return Math.max(0, Math.min(1, x / rect.width));
  }, []);

  const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingVolume(true);
    const newVolume = calculateVolumeFromEvent(e.clientX);
    if (newVolume !== undefined) onVolumeChange(newVolume);
  };

  const handleVolumeMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingVolume) return;
    
    const newVolume = calculateVolumeFromEvent(e.clientX);
    if (newVolume !== undefined) onVolumeChange(newVolume);
  }, [isDraggingVolume, calculateVolumeFromEvent, onVolumeChange]);

  const handleVolumeMouseUp = useCallback(() => {
    setIsDraggingVolume(false);
  }, []);

  // Add and remove event listeners for volume dragging
  useEffect(() => {
    if (isDraggingVolume) {
      window.addEventListener('mousemove', handleVolumeMouseMove);
      window.addEventListener('mouseup', handleVolumeMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleVolumeMouseMove);
      window.removeEventListener('mouseup', handleVolumeMouseUp);
    };
  }, [isDraggingVolume, handleVolumeMouseMove, handleVolumeMouseUp]);

  return (
    <motion.div 
      className="mt-6 glass-card rounded-lg p-4 space-y-4"
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

        <div 
          className="relative flex items-center gap-2"
          onMouseEnter={() => setIsVolumeVisible(true)}
          onMouseLeave={() => !isDraggingVolume && setIsVolumeVisible(false)}
        >
          <button
            onClick={onToggleMute}
            className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          
          {/* Volume Slider */}
          <motion.div
            className="absolute right-0 bottom-full mb-2 bg-background border rounded-lg p-4 shadow-lg"
            initial={false}
            animate={{ 
              opacity: isVolumeVisible ? 1 : 0,
              scale: isVolumeVisible ? 1 : 0.95,
              pointerEvents: isVolumeVisible ? "auto" : "none"
            }}
          >
            <div 
              ref={volumeBarRef}
              className="h-2 w-24 bg-secondary rounded-full cursor-pointer relative group"
              onMouseDown={handleVolumeMouseDown}
            >
              <div 
                className="absolute inset-0 rounded-full bg-primary origin-left transition-transform"
                style={{ transform: `scaleX(${isMuted ? 0 : volume})` }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-sm transform -translate-x-1/2 group-hover:scale-110 transition-transform"
                style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
              />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-1">
        <div 
          className="h-1 w-full bg-secondary rounded-full overflow-hidden cursor-pointer relative"
          onClick={handleProgressBarClick}
          onMouseEnter={() => setIsHoveringProgress(true)}
          onMouseLeave={() => setIsHoveringProgress(false)}
          onMouseMove={handleProgressBarHover}
        >
          {/* Playback Progress */}
          <div 
            className="absolute top-0 left-0 h-full bg-primary transform-gpu will-change-transform"
            style={{ 
              width: '100%',
              transform: `scaleX(${currentTime / (duration || 1)})`,
              transformOrigin: 'left',
              transition: 'transform 0.1s linear'
            }}
          />
          
          {/* Hover Time Indicator */}
          {isHoveringProgress && (
            <>
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-primary/50 pointer-events-none transform-gpu"
                style={{ left: `${hoverPosition * 100}%` }}
              />
              <div 
                className="absolute top-0 transform -translate-x-1/2 -translate-y-full bg-primary text-primary-foreground text-xs px-2 py-1 rounded pointer-events-none"
                style={{ left: `${hoverPosition * 100}%` }}
              >
                {formatTime(hoverPosition * duration)}
              </div>
            </>
          )}
        </div>
        
        {/* Time Markers */}
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>0:00</span>
          <span>{formatTime(duration || 0)}</span>
        </div>
      </div>
    </motion.div>
  );
}; 