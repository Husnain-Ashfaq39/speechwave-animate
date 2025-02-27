import { useState, useRef, useEffect } from "react";
import { VoiceSelector } from "./VoiceSelector";
import { Waveform } from "./ui/waveform";
import { synthesizeSpeech, TTSSettings, formatTime, saveTextAsFile, TTSVoice } from "@/lib/tts-utils";
import { ThemeToggle } from "./ThemeToggle";
import { Download, Pause, Play, Settings, Volume2, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DEFAULT_VOICE: TTSVoice = { 
  id: "21m00Tcm4TlvDq8ikWAM", // Rachel voice ID from ElevenLabs
  name: "Rachel",
  gender: "Female",
  accent: "American",
  age: "Adult",
  description: "Clear and professional",
  category: "premade"
};

type HistoryItem = {
  id: string;
  text: string;
  timestamp: number;
  voice: TTSVoice;
  audioUrl?: string;
  audioBlob?: Blob;
};

export const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VOICE);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<TTSSettings>({
    voice: DEFAULT_VOICE,
    rate: 1,
    pitch: 1,
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.0,
    useSpeakerBoost: true,
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [currentAudioBlob, setCurrentAudioBlob] = useState<Blob | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("tts-history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to parse history from localStorage:", error);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("tts-history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(audio.duration);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleError = (e: ErrorEvent) => {
      console.error('Audio playback error:', e);
      setIsPlaying(false);
      toast.error('Error playing audio. Please try again.');
    };
    
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);
    
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
      audio.pause();
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
    };
  }, [currentAudioUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast.error("Please enter some text to convert to speech");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Stop any currently playing audio first
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
      
      const result = await synthesizeSpeech(text, settings);
      
      // Clean up previous audio URL
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
      
      // Create a new audio URL from the blob
      const newAudioUrl = URL.createObjectURL(
        new Blob([result.audioBlob], { type: 'audio/mpeg' })
      );
      
      // Store both the blob and URL
      setCurrentAudioBlob(result.audioBlob);
      setCurrentAudioUrl(newAudioUrl);
      
      if (audioRef.current) {
        audioRef.current.src = newAudioUrl;
        audioRef.current.load();
        addToHistory(text, newAudioUrl, result.audioBlob);
      }
      
      toast.success("Text converted to speech successfully");
    } catch (error) {
      console.error("Error synthesizing speech:", error);
      toast.error("Failed to convert text to speech. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlay = async () => {
    if (!audioRef.current || !currentAudioUrl || !currentAudioBlob) return;

    try {
      if (audioRef.current.paused) {
        await audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      toast.error("Failed to play audio. Please try again.");
      setIsPlaying(false);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Add progress bar click handler
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = x / width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleDownload = () => {
    if (!text.trim()) {
      toast.error("Please generate speech first before downloading");
      return;
    }
    
    if (currentAudioBlob) {
      try {
        const filename = `speech_${selectedVoice.name}_${Date.now()}.mp3`;
        const downloadUrl = URL.createObjectURL(currentAudioBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl); // Clean up the temporary download URL
        toast.success(`Audio downloaded as ${filename}`);
      } catch (error) {
        console.error('Error downloading audio:', error);
        toast.error('Failed to download audio. Please try again.');
      }
    } else {
      toast.error("No audio available to download");
    }
  };

  const addToHistory = (text: string, audioUrl: string, audioBlob: Blob) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      text,
      timestamp: Date.now(),
      voice: settings.voice,
      audioUrl,
      audioBlob
    };
    
    setHistory(prev => {
      // Add to beginning of array, limit to 10 most recent items
      const updated = [newItem, ...prev].slice(0, 10);
      return updated;
    });
  };

  const loadFromHistory = (item: HistoryItem) => {
    setText(item.text);
    setSelectedVoice(item.voice);
    setSettings(prev => ({
      ...prev,
      voice: item.voice
    }));
    
    // Clean up current audio URL
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
    }
    
    // Create new audio URL from stored blob
    if (item.audioBlob) {
      const newAudioUrl = URL.createObjectURL(
        new Blob([item.audioBlob], { type: 'audio/mpeg' })
      );
      setCurrentAudioUrl(newAudioUrl);
      setCurrentAudioBlob(item.audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = newAudioUrl;
        audioRef.current.load();
      }
    }
    
    setShowHistory(false);
  };

  const removeFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => {
      const newHistory = prev.filter(item => item.id !== id);
      // Clean up audio URLs for removed items
      prev.forEach(item => {
        if (item.id === id && item.audioUrl) {
          URL.revokeObjectURL(item.audioUrl);
        }
      });
      return newHistory;
    });
  };

  const clearHistory = () => {
    // Clean up all audio URLs
    history.forEach(item => {
      if (item.audioUrl) {
        URL.revokeObjectURL(item.audioUrl);
      }
    });
    setHistory([]);
    toast.success("History cleared");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  // Update this to handle voice selection
  const handleVoiceSelect = (voice: TTSVoice) => {
    setSelectedVoice(voice);
    setSettings(prev => ({ ...prev, voice }));
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
            onClick={() => {
              setShowHistory(!showHistory);
              setShowSettings(false);
            }}
            className="relative h-10 w-10 rounded-full bg-secondary p-2 transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="History"
          >
            <Clock className="h-full w-full" />
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                {history.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setShowSettings(!showSettings);
              setShowHistory(false);
            }}
            className="relative h-10 w-10 rounded-full bg-secondary p-2 transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Settings"
          >
            <Settings className="h-full w-full" />
          </button>
          <ThemeToggle />
        </div>
      </div>
      
      {/* History Panel */}
      <div className={cn(
        "mb-6 glass-card rounded-lg p-4 transition-all",
        showHistory ? "h-auto opacity-100" : "h-0 opacity-0 overflow-hidden p-0"
      )}>
        <div className="animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Recent Conversions</h2>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-destructive hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
          
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No history yet</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {history.map((item) => (
                <li 
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="text-sm p-3 rounded-md bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors flex justify-between items-start"
                >
                  <div>
                    <p className="line-clamp-2">{item.text}</p>
                    <div className="flex gap-2 items-center mt-1 text-xs text-muted-foreground">
                      <span>{formatDate(item.timestamp)}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-secondary/50 text-[10px]">
                        {item.voice.name}
                        {item.voice.accent && ` · ${item.voice.accent}`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => removeFromHistory(item.id, e)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    aria-label="Remove from history"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="glass-card rounded-lg overflow-hidden transition-all duration-300 border border-input relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            className="w-full h-40 p-4 bg-transparent focus:outline-none resize-none pr-10"
            required
          />
          {text && (
            <button
              type="button"
              onClick={() => setText("")}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-accent/50 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {/* Settings Panel */}
        <div className={cn(
          "mb-6 glass-card rounded-lg p-4 transition-all",
          showSettings ? "h-auto opacity-100" : "h-0 opacity-0 overflow-hidden p-0"
        )}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-scale-in">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Voice</label>
              <VoiceSelector 
                selectedVoice={selectedVoice} 
                onSelect={handleVoiceSelect}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Speech Rate: {settings.rate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.rate}
                onChange={(e) => setSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Pitch: {settings.pitch.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.pitch}
                onChange={(e) => setSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Stability: {settings.stability.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.stability}
                onChange={(e) => setSettings(prev => ({ ...prev, stability: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher values make voice more consistent but less expressive
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Similarity Boost: {settings.similarityBoost.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.similarityBoost}
                onChange={(e) => setSettings(prev => ({ ...prev, similarityBoost: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher values make voice more similar to original
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Style Influence: {settings.style.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.style}
                onChange={(e) => setSettings(prev => ({ ...prev, style: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher values enhance speaking style
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="speakerBoost"
                checked={settings.useSpeakerBoost}
                onChange={(e) => setSettings(prev => ({ ...prev, useSpeakerBoost: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="speakerBoost" className="text-sm font-medium">
                Use Speaker Boost
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <button
            type="submit"
            disabled={isProcessing || !text.trim() || isPlaying}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              (isProcessing || !text.trim() || isPlaying)
                ? "bg-primary/30 text-primary-foreground/50 cursor-not-allowed" 
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                <span>Converting...</span>
              </>
            ) : (
              <>
                <Volume2 className="h-5 w-5" />
                <span>Convert to Speech</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleDownload}
            disabled={!currentAudioBlob}
            className="flex items-center justify-center gap-2 py-2 px-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <Download className="h-5 w-5" />
            Download Audio
          </button>
        </div>
      </form>
      
      {/* Audio element */}
      <audio ref={audioRef} />
      
      {/* Audio Player */}
      {currentAudioUrl && (
        <div className="mt-6 glass-card rounded-lg p-4">
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
        </div>
      )}
    </div>
  );
};
