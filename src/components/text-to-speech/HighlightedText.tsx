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
  const MAX_WORDS = 1000;
  
  // Calculate counts
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const isAtLimit = wordCount >= MAX_WORDS;
  
  const handleTextChange = (newValue: string) => {
    const newWordCount = newValue.trim() ? newValue.trim().split(/\s+/).length : 0;
    if (newWordCount <= MAX_WORDS) {
      onTextChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className={cn(
        "glass-card rounded-lg overflow-hidden transition-all duration-300 border border-input relative",
        isAtLimit && "border-yellow-500/50"
      )}>
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
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-40 p-4 bg-transparent focus:outline-none resize-none pr-10 absolute inset-0 text-transparent caret-primary selection:bg-primary/20"
          required
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className={cn(
          "transition-colors",
          isAtLimit ? "text-yellow-500" : "text-muted-foreground"
        )}>
          {wordCount}/{MAX_WORDS} words
        </span>
        <span className="text-muted-foreground">
          {charCount} characters
        </span>
      </div>
    </div>
  );
}; 