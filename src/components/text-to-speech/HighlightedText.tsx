import { cn } from "@/lib/utils";

interface HighlightedTextProps {
  words: string[];
  currentWordIndex: number;
  onTextChange: (text: string) => void;
  placeholder?: string;
  value: string;
}

export const HighlightedText = ({
  words,
  currentWordIndex,
  onTextChange,
  placeholder = "Enter text to convert to speech...",
  value
}: HighlightedTextProps) => {
  return (
    <div className="glass-card rounded-lg overflow-hidden transition-all duration-300 border border-input relative">
      <div className="w-full h-40 p-4 bg-transparent focus:outline-none resize-none pr-10 overflow-y-auto whitespace-pre-wrap">
        {words.map((word, index) => (
          <span
            key={index}
            className={cn(
              "transition-colors duration-150",
              currentWordIndex === index && "bg-green-500/20 text-green-700 dark:text-green-400 rounded px-1"
            )}
          >
            {word}{' '}
          </span>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-40 p-4 bg-transparent focus:outline-none resize-none pr-10 absolute inset-0 text-transparent caret-primary selection:bg-primary/20"
        required
      />
    </div>
  );
}; 