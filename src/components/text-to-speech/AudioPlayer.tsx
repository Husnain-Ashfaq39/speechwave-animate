import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Pause, Play, Repeat, SkipBack } from "lucide-react";
import { formatTime } from "@/lib/tts-utils";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useEffect } from "react";

// Waveform animation constants
const BAR_COUNT = 28;
const MIN_BAR_HEIGHT = 2;
const MAX_BAR_HEIGHT = 16;

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

const WaveformBars = ({ isPlaying }: { isPlaying: boolean }) => {
  const generateRandomHeight = () => Math.random() * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) + MIN_BAR_HEIGHT;
  const [heights, setHeights] = useState<number[]>(Array(BAR_COUNT).fill(0).map(generateRandomHeight));

  useEffect(() => {
    if (!isPlaying) {
      setHeights(Array(BAR_COUNT).fill(0).map(() => MIN_BAR_HEIGHT));
      return;
    }

    const interval = setInterval(() => {
      setHeights(prev => prev.map(generateRandomHeight));
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex items-center justify-center gap-1 h-8 my-2 px-4">
      {heights.map((height, index) => (
        <motion.div
          key={index}
          className="w-1 bg-primary rounded-full"
          animate={{
            height: isPlaying ? height : MIN_BAR_HEIGHT,
            opacity: isPlaying ? 0.8 : 0.3
          }}
          transition={{
            duration: 0.2,
            ease: "easeInOut"
          }}
          initial={false}
        />
      ))}
    </div>
  );
};

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
  const [showReplayButton, setShowReplayButton] = useState(false);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowReplayButton(currentTime >= duration);
  }, [currentTime, duration]);

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

  const handleReplay = () => {
    onSeek(0);
    onPlay();
  };

  return (
    <motion.div 
      className="mt-4 glass-morphism rounded-xl p-4 space-y-3 border border-primary/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={showReplayButton ? handleReplay : isPlaying ? onPause : onPlay}
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-transform hover:shadow-lg"
            aria-label={showReplayButton ? "Replay" : isPlaying ? "Pause" : "Play"}
          >
            {showReplayButton ? (
              <Repeat className="h-4 w-4" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSeek(0)}
            className="h-7 w-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center transition-transform hover:bg-secondary/80"
            aria-label="Restart"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </motion.button>

          <div className="text-xs font-medium">
            {formatTime(currentTime)} / {formatTime(duration || 0)}
          </div>
        </div>

        <div 
          className="relative flex items-center gap-2"
          onMouseEnter={() => setIsVolumeVisible(true)}
          onMouseLeave={() => !isDraggingVolume && setIsVolumeVisible(false)}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleMute}
            className="h-7 w-7 rounded-full hover:bg-secondary flex items-center justify-center"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </motion.button>
          
          {/* Volume Slider */}
          <motion.div
            className="absolute right-0 bottom-full mb-2 bg-background border rounded-lg p-3 shadow-lg"
            initial={false}
            animate={{ 
              opacity: isVolumeVisible ? 1 : 0,
              scale: isVolumeVisible ? 1 : 0.95,
              pointerEvents: isVolumeVisible ? "auto" : "none"
            }}
          >
            <div 
              ref={volumeBarRef}
              className="h-1.5 w-20 bg-secondary rounded-full cursor-pointer relative group"
              onMouseDown={handleVolumeMouseDown}
            >
              <div 
                className="absolute inset-0 rounded-full bg-primary origin-left transition-transform"
                style={{ transform: `scaleX(${isMuted ? 0 : volume})` }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg transform -translate-x-1/2 group-hover:scale-110 transition-transform"
                style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
              />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Waveform Visualization */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <WaveformBars isPlaying={isPlaying} />
        </motion.div>
      </AnimatePresence>
      
      {/* Progress Bar */}
      <div className="space-y-1">
        <div 
          className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden cursor-pointer relative group"
          onClick={handleProgressBarClick}
          onMouseEnter={() => setIsHoveringProgress(true)}
          onMouseLeave={() => setIsHoveringProgress(false)}
          onMouseMove={handleProgressBarHover}
        >
          {/* Background Pulse Animation */}
          <div 
            className={cn(
              "absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse",
              isPlaying ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Playback Progress */}
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 transform-gpu will-change-transform"
            style={{ 
              width: '100%',
              transform: `scaleX(${currentTime / (duration || 1)})`,
              transformOrigin: 'left',
              transition: 'transform 0.1s linear'
            }}
          />
          
          {/* Progress Handle */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
          />
          
          {/* Hover Time Indicator */}
          {isHoveringProgress && (
            <>
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary/50 pointer-events-none transform-gpu"
                style={{ left: `${hoverPosition * 100}%` }}
              />
              <div 
                className="absolute top-0 transform -translate-x-1/2 -translate-y-full bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-md pointer-events-none"
                style={{ left: `${hoverPosition * 100}%` }}
              >
                {formatTime(hoverPosition * duration)}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}; 