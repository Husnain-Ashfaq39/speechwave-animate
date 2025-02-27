import { useState, useRef, useEffect } from "react";
import { VoiceSelector } from "./VoiceSelector";
import { Waveform } from "./ui/waveform";
import { synthesizeSpeech, TTSSettings, formatTime, saveTextAsFile } from "@/lib/tts-utils";
import { ThemeToggle } from "./ThemeToggle";
import { Download, Pause, Play, Settings, Volume2, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DEFAULT_VOICE = { id: "aria", name: "Aria" };

type HistoryItem = {
  id: string;
  text: string;
  timestamp: number;
  voice: { id: string; name: string };
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
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [highlightedText, setHighlightedText] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useRef<string | null>(null);
  const textRef = useRef<HTMLDivElement>(null);

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

  // Split text into words when it changes
  useEffect(() => {
    if (text) {
      // Split by spaces but keep punctuation with words
      const words = text.match(/[\w]+[.,!?;:']?|\S/g) || [];
      setHighlightedText(words);
    } else {
      setHighlightedText([]);
    }
    setCurrentWordIndex(-1);
  }, [text]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    
    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      
      // Update highlighted word based on current time
      // This is a simplified approach. In a real implementation,
      // we would have precise timing data for each word from the TTS service
      if (isPlaying && highlightedText.length > 0) {
        const wordDuration = audio.duration / highlightedText.length;
        const currentWordIdx = Math.min(
          Math.floor(audio.currentTime / wordDuration),
          highlightedText.length - 1
        );
        setCurrentWordIndex(currentWordIdx);
        
        // Auto-scroll to keep the current word visible
        if (textRef.current && currentWordIdx >= 0) {
          const wordElements = textRef.current.querySelectorAll('.word');
          if (wordElements[currentWordIdx]) {
            wordElements[currentWordIdx].scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          }
        }
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentWordIndex(-1);
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
  }, [isPlaying, highlightedText]);

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

  const addToHistory = (text: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      text,
      timestamp: Date.now(),
      voice: settings.voice,
    };
    
    setHistory(prev => {
      // Add to beginning of array, limit to 10 most recent items
      const updated = [newItem, ...prev].slice(0, 10);
      return updated;
    });
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
        
        // Add to history
        addToHistory(text);
        
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

  const loadFromHistory = (item: HistoryItem) => {
    setText(item.text);
    setSettings(prev => ({ ...prev, voice: item.voice }));
    setSelectedVoice(item.voice);
    setShowHistory(false);
  };

  const removeFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
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
      
      {/* Settings Panel */}
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
        {/* Text Input - hidden when playing with word highlighting */}
        <div className={cn(
          "glass-card rounded-lg overflow-hidden transition-all duration-300 border border-input/30",
          isPlaying ? "hidden" : "block"
        )}>
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Enter text to convert to speech..."
            className="w-full h-40 p-4 bg-transparent focus:outline-none resize-none"
            required
          />
        </div>
        
        {/* Word highlighting view - shown during playback */}
        <div 
          ref={textRef}
          className={cn(
            "glass-card rounded-lg overflow-auto transition-all duration-300 border border-input/30 p-4 h-40",
            !isPlaying ? "hidden" : "block"
          )}
        >
          <div className="space-x-1 leading-relaxed">
            {highlightedText.map((word, index) => (
              <span 
                key={index}
                className={cn(
                  "word transition-all duration-150 inline-block",
                  index === currentWordIndex && "bg-primary/20 text-primary font-medium rounded px-1 py-0.5 transform scale-105"
                )}
              >
                {word}
              </span>
            ))}
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
