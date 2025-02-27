import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

export const useAudioPlayer = (audioUrl: string | null) => {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };
    
    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false, currentTime: audio.duration }));
    };
    
    const handleLoadedMetadata = () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
    };

    const handleError = (e: ErrorEvent) => {
      console.error('Audio playback error:', e);
      setState(prev => ({ ...prev, isPlaying: false }));
      toast.error('Error playing audio. Please try again.');
    };

    const handleVolumeChange = () => {
      setState(prev => ({ 
        ...prev, 
        volume: audio.volume,
        isMuted: audio.muted
      }));
    };
    
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);
    audio.addEventListener("volumechange", handleVolumeChange);
    
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("volumechange", handleVolumeChange);
      audio.pause();
    };
  }, []);

  const handlePlay = async () => {
    if (!audioRef.current || !audioUrl) return;

    try {
      if (audioRef.current.paused) {
        await audioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true }));
      } else {
        audioRef.current.pause();
        setState(prev => ({ ...prev, isPlaying: false }));
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      toast.error("Failed to play audio. Please try again.");
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  };

  const handleVolumeChange = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
      audioRef.current.muted = volume === 0;
    }
  };

  const handleToggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
    }
  };

  return {
    audioRef,
    ...state,
    controls: {
      play: handlePlay,
      pause: handlePause,
      seek: handleSeek,
      setVolume: handleVolumeChange,
      toggleMute: handleToggleMute,
    }
  };
}; 