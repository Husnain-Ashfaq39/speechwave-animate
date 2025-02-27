import { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, Play, Pause, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceAccent, VoiceGender, VoiceAge, TTSVoice } from "@/lib/tts-utils";
import { fetchVoices, ElevenLabsVoice } from "@/lib/elevenlabs-api";


interface VoiceSelectorProps {
  selectedVoice: TTSVoice;
  onSelect: (voice: TTSVoice) => void;
  className?: string;
}

export const VoiceSelector = ({ selectedVoice, onSelect, className }: VoiceSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<string>("");
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadVoices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const elevenLabsVoices = await fetchVoices();
        
        // Convert ElevenLabs voices to our TTSVoice format
        const convertedVoices: TTSVoice[] = elevenLabsVoices.map(voice => ({
          id: voice.voice_id,
          name: voice.name,
          gender: (voice.labels.gender as VoiceGender) || "Neutral",
          accent: (voice.labels.accent as VoiceAccent),
          age: (voice.labels.age as VoiceAge),
          description: voice.labels.description,
          previewUrl: voice.preview_url,
          category: voice.category,
          useCase: voice.labels.use_case
        }));

        setVoices(convertedVoices);
      } catch (err) {
        console.error('Error loading voices:', err);
        setError('Failed to load voices. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadVoices();
  }, []);

  useEffect(() => {
    // Cleanup function for audio
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const handleSelect = (voice: TTSVoice) => {
    onSelect(voice);
    setIsOpen(false);
  };

  const handlePreviewPlay = async (voice: TTSVoice, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent voice selection when clicking play button
    
    try {
      if (playingPreviewId === voice.id) {
        // Stop playing current audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        }
        setPlayingPreviewId(null);
      } else {
        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        }
        
        // Create and play new audio
        if (voice.previewUrl) {
          const audio = new Audio(voice.previewUrl);
          audio.addEventListener('ended', () => {
            setPlayingPreviewId(null);
            audioRef.current = null;
          });
          
          audioRef.current = audio;
          await audio.play();
          setPlayingPreviewId(voice.id);
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingPreviewId(null);
      if (audioRef.current) {
        audioRef.current = null;
      }
    }
  };

  // Filter voices based on search input
  const filteredVoices = filter.trim() 
    ? voices.filter(voice => 
        voice.name.toLowerCase().includes(filter.toLowerCase()) ||
        voice.gender.toLowerCase().includes(filter.toLowerCase()) ||
        (voice.accent && voice.accent.toLowerCase().includes(filter.toLowerCase())) ||
        (voice.description && voice.description.toLowerCase().includes(filter.toLowerCase())) ||
        (voice.category && voice.category.toLowerCase().includes(filter.toLowerCase())) ||
        (voice.useCase && voice.useCase.toLowerCase().includes(filter.toLowerCase()))
      )
    : voices;

  // Group voices by category
  const groupedVoices = filteredVoices.reduce((acc, voice) => {
    const category = voice.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(voice);
    return acc;
  }, {} as Record<string, TTSVoice[]>);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-4 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className={cn("relative z-[100]", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <span>{selectedVoice.name}</span>
          <span className="ml-2 text-xs text-muted-foreground">
            {selectedVoice.category} · {selectedVoice.gender}
            {selectedVoice.accent ? ` · ${selectedVoice.accent}` : ""}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-1 w-full z-[999] animate-fade-in">
          <div className="bg-background border border-input shadow-lg rounded-md overflow-hidden flex flex-col" style={{ maxHeight: 'min(70vh, 400px)' }}>
            {/* Search filter */}
            <div className="p-2 border-b border-input sticky top-0 bg-background z-10">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search voices..."
                  className="w-full pl-8 pr-8 py-1 text-sm bg-background rounded border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {filter && (
                  <button
                    onClick={() => setFilter("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-accent/50"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent">
              {/* Render each category group */}
              {Object.entries(groupedVoices).map(([category, categoryVoices]) => {
                if (categoryVoices.length === 0) return null;
                
                return (
                  <div key={category} className="py-1">
                    <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {category}
                    </div>
                    
                    <ul className="py-1" role="listbox">
                      {categoryVoices.map((voice) => (
                        <li
                          key={voice.id}
                          role="option"
                          aria-selected={selectedVoice.id === voice.id}
                          onClick={() => handleSelect(voice)}
                          className={cn(
                            "relative flex flex-col cursor-pointer select-none py-1.5 px-3 hover:bg-accent hover:text-accent-foreground",
                            selectedVoice.id === voice.id && "bg-accent/50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{voice.name}</span>
                              <div className="flex gap-2 items-center mt-1 text-xs text-muted-foreground">
                                {voice.gender && <span>{voice.gender}</span>}
                                {voice.accent && <span>{voice.accent}</span>}
                                {voice.useCase && <span className="opacity-70">· {voice.useCase}</span>}
                              </div>
                              {voice.description && (
                                <p className="text-xs text-muted-foreground mt-1">{voice.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {voice.previewUrl && (
                                <button
                                  onClick={(e) => handlePreviewPlay(voice, e)}
                                  className="p-1.5 rounded-full hover:bg-accent/50"
                                >
                                  {playingPreviewId === voice.id ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                              {selectedVoice.id === voice.id && (
                                <Check className="h-4 w-4 ml-2" />
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              
              {filteredVoices.length === 0 && (
                <div className="py-4 px-3 text-center text-sm text-muted-foreground">
                  No voices found matching "{filter}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
