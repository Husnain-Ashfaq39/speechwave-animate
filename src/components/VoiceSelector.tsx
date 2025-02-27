
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Voice = {
  id: string;
  name: string;
  preview?: string;
};

const VOICES: Voice[] = [
  { id: "aria", name: "Aria" },
  { id: "roger", name: "Roger" },
  { id: "sarah", name: "Sarah" },
  { id: "laura", name: "Laura" },
  { id: "charlie", name: "Charlie" },
  { id: "george", name: "George" },
  { id: "callum", name: "Callum" },
  { id: "river", name: "River" }
];

interface VoiceSelectorProps {
  selectedVoice: Voice;
  onSelect: (voice: Voice) => void;
  className?: string;
}

export const VoiceSelector = ({ selectedVoice, onSelect, className }: VoiceSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (voice: Voice) => {
    onSelect(voice);
    setIsOpen(false);
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
        <span>{selectedVoice.name}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-1 w-full z-10 animate-fade-in">
          <ul
            className="glass-card max-h-60 rounded-md py-1 overflow-auto focus:outline-none text-sm"
            tabIndex={-1}
            role="listbox"
          >
            {VOICES.map((voice) => (
              <li
                key={voice.id}
                role="option"
                aria-selected={selectedVoice.id === voice.id}
                onClick={() => handleSelect(voice)}
                className={cn(
                  "relative flex cursor-pointer select-none items-center py-1.5 px-3 hover:bg-accent hover:text-accent-foreground",
                  selectedVoice.id === voice.id && "bg-accent/50"
                )}
              >
                <span className="truncate">{voice.name}</span>
                {selectedVoice.id === voice.id && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
