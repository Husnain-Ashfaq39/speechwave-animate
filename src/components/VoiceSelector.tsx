
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceAccent, VoiceGender, VoiceAge, TTSVoice } from "@/lib/tts-utils";

// Extended voices with more diversity
const VOICES: TTSVoice[] = [
  // Female voices
  { id: "aria", name: "Aria", gender: "Female", accent: "American", age: "Adult", description: "Clear and professional" },
  { id: "sarah", name: "Sarah", gender: "Female", accent: "British", age: "Adult", description: "Warm and friendly" },
  { id: "laura", name: "Laura", gender: "Female", accent: "American", age: "Young", description: "Energetic and upbeat" },
  { id: "emma", name: "Emma", gender: "Female", accent: "British", age: "Young", description: "Soft and gentle" },
  { id: "sophia", name: "Sophia", gender: "Female", accent: "Australian", age: "Adult", description: "Confident and clear" },
  { id: "priya", name: "Priya", gender: "Female", accent: "Indian", age: "Adult", description: "Articulate and precise" },
  { id: "maria", name: "Maria", gender: "Female", accent: "Spanish", age: "Adult", description: "Warm with subtle accent" },
  { id: "isabelle", name: "Isabelle", gender: "Female", accent: "French", age: "Adult", description: "Elegant and refined" },
  
  // Male voices
  { id: "roger", name: "Roger", gender: "Male", accent: "British", age: "Adult", description: "Authoritative and clear" },
  { id: "charlie", name: "Charlie", gender: "Male", accent: "American", age: "Young", description: "Friendly and approachable" },
  { id: "george", name: "George", gender: "Male", accent: "British", age: "Senior", description: "Deep and distinguished" },
  { id: "callum", name: "Callum", gender: "Male", accent: "Scottish", age: "Adult", description: "Strong regional accent" },
  { id: "river", name: "River", gender: "Male", accent: "American", age: "Adult", description: "Smooth and calming" },
  { id: "miguel", name: "Miguel", gender: "Male", accent: "Spanish", age: "Adult", description: "Rich with subtle accent" },
  { id: "hans", name: "Hans", gender: "Male", accent: "German", age: "Adult", description: "Clear with subtle accent" },
  { id: "takumi", name: "Takumi", gender: "Male", accent: "Japanese", age: "Adult", description: "Precise pronunciation" },
  
  // Neutral voices
  { id: "alex", name: "Alex", gender: "Neutral", accent: "American", age: "Adult", description: "Balanced and clear" },
  { id: "sam", name: "Sam", gender: "Neutral", accent: "British", age: "Adult", description: "Neutral and professional" }
];

interface VoiceSelectorProps {
  selectedVoice: TTSVoice;
  onSelect: (voice: TTSVoice) => void;
  className?: string;
}

export const VoiceSelector = ({ selectedVoice, onSelect, className }: VoiceSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<string>("");

  const handleSelect = (voice: TTSVoice) => {
    onSelect(voice);
    setIsOpen(false);
  };

  // Filter voices based on search input
  const filteredVoices = filter.trim() 
    ? VOICES.filter(voice => 
        voice.name.toLowerCase().includes(filter.toLowerCase()) ||
        voice.gender.toLowerCase().includes(filter.toLowerCase()) ||
        (voice.accent && voice.accent.toLowerCase().includes(filter.toLowerCase())) ||
        (voice.description && voice.description.toLowerCase().includes(filter.toLowerCase()))
      )
    : VOICES;

  // Group voices by gender for better organization
  const groupedVoices: Record<VoiceGender, TTSVoice[]> = {
    Female: filteredVoices.filter(v => v.gender === "Female"),
    Male: filteredVoices.filter(v => v.gender === "Male"),
    Neutral: filteredVoices.filter(v => v.gender === "Neutral")
  };

  return (
    <div className={cn("relative", className)}>
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
            {selectedVoice.gender}{selectedVoice.accent ? ` · ${selectedVoice.accent}` : ""}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-1 w-full z-10 animate-fade-in">
          <div className="glass-card max-h-80 rounded-md overflow-hidden">
            {/* Search filter */}
            <div className="p-2 border-b border-input/10">
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search voices..."
                className="w-full px-2 py-1 text-sm bg-background/50 rounded border border-input/20 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            
            <div className="max-h-72 overflow-auto">
              {/* Render each gender group */}
              {(Object.keys(groupedVoices) as VoiceGender[]).map(gender => {
                const voices = groupedVoices[gender];
                if (voices.length === 0) return null;
                
                return (
                  <div key={gender} className="py-1">
                    <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {gender} Voices
                    </div>
                    
                    <ul className="py-1" role="listbox">
                      {voices.map((voice) => (
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
                            <span className="font-medium">{voice.name}</span>
                            {selectedVoice.id === voice.id && (
                              <Check className="h-4 w-4 ml-2" />
                            )}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>{voice.accent}</span>
                            {voice.description && (
                              <span className="ml-1 opacity-70">· {voice.description}</span>
                            )}
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
