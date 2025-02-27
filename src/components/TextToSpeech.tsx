
import { useState, useRef, useEffect } from "react";
import { VoiceSelector } from "./VoiceSelector";
import { Waveform } from "./ui/waveform";
import { synthesizeSpeech, TTSSettings, formatTime, saveTextAsFile } from "@/lib/tts-utils";
import { ThemeToggle } from "./ThemeToggle";
import { Download, Pause, Play, Settings, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DEFAULT_VOICE = { id: "aria", name: "Aria" };

export const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VOICE);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<TTSSettings>({
    voice: DEFAULT_VOICE,
    rate: 1,
    pitch: 1,
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useRef<string | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    
    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.pause();
      if (audioUrl.current) {
        URL.revokeObjectURL(audioUrl.current);
      }
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleVoiceChange = (voice: { id: string; name: string }) => {
    setSelectedVoice(voice);
    setSettings(prev => ({ ...prev, voice }));
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(e.target.value);
    setSettings(prev => ({ ...prev, rate }));
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pitch = parseFloat(e.target.value);
    setSettings(prev => ({ ...prev, pitch }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast.error("Please enter some text to convert to speech");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const result = await synthesizeSpeech(text, settings);
      
      if (audioRef.current) {
        if (audioUrl.current) {
          URL.revokeObjectURL(audioUrl.current);
        }
        
        // In a real implementation, we'd use the actual audio URL from the API
        // For this demo, we'll just assume we have an audio file
        audioRef.current.src = result.audioUrl;
        audioUrl.current = result.audioUrl;
        
        handlePlay();
      }
      
      toast.success("Text converted to speech successfully");
    } catch (error) {
      console.error("Error synthesizing speech:", error);
      toast.error("Failed to convert text to speech. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleDownload = () => {
    if (!text.trim()) {
      toast.error("Please generate speech first before downloading");
      return;
    }
    
    saveTextAsFile(text, "speech-text.txt");
    toast.success("Text file downloaded successfully");
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gradient">
          <span className="text-sm uppercase tracking-wider text-muted-foreground/70 block mb-1">Premium</span>
          Text to Speech
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="relative h-10 w-10 rounded-full bg-secondary p-2 transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Settings"
          >
            <Settings className="h-full w-full" />
          </button>
          <ThemeToggle />
        </div>
      </div>
      
      <div className={cn(
        "mb-6 glass-card rounded-lg p-4 transition-all",
        showSettings ? "h-auto opacity-100" : "h-0 opacity-0 overflow-hidden p-0"
      )}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-scale-in">
          <div>
            <label className="block text-sm font-medium mb-2">Voice</label>
            <VoiceSelector 
              selectedVoice={selectedVoice} 
              onSelect={handleVoiceChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Speech Rate: {settings.rate.toFixed(1)}x</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.rate}
              onChange={handleRateChange}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Pitch: {settings.pitch.toFixed(1)}</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.pitch}
              onChange={handlePitchChange}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="glass-card rounded-lg overflow-hidden transition-all duration-300 border border-input/30">
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Enter text to convert to speech..."
            className="w-full h-40 p-4 bg-transparent focus:outline-none resize-none"
            required
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <button
            type="submit"
            disabled={isProcessing || !text.trim()}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              isProcessing || !text.trim() 
                ? "bg-primary/30 text-primary-foreground/50 cursor-not-allowed" 
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            <Volume2 className="h-5 w-5" />
            {isProcessing ? "Converting..." : "Convert to Speech"}
          </button>
          
          <button
            type="button"
            onClick={handleDownload}
            disabled={!text.trim()}
            className="flex items-center justify-center gap-2 py-2 px-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <Download className="h-5 w-5" />
            Download Text
          </button>
        </div>
      </form>
      
      {/* Audio Player */}
      <div className={cn(
        "mt-6 glass-card rounded-lg p-4 transition-all duration-300 transform",
        (isPlaying || currentTime > 0) ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-transform hover:scale-105"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <div className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration || 0)}
            </div>
          </div>
          
          <Waveform isPlaying={isPlaying} />
        </div>
        
        <div className="mt-3">
          <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-100"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
