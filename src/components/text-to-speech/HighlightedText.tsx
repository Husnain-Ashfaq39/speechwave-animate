import { cn } from "@/lib/utils";
import { TextFormatToolbar } from "./TextFormatToolbar";
import { useRef } from "react";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleTextChange = (newValue: string) => {
    const newWordCount = newValue.trim() ? newValue.trim().split(/\s+/).length : 0;
    if (newWordCount <= MAX_WORDS) {
      onTextChange(newValue);
    }
  };

  const handleFormatInsert = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newText = value;
    let newCursorPos = start;

    if (format === "[pause]") {
      // Insert pause at cursor position
      newText = value.slice(0, start) + format + value.slice(end);
      newCursorPos = start + format.length;
    } else {
      // Handle formats that wrap selected text
      const formatParts = format.split("text");
      if (formatParts.length === 2) {
        // Format with placeholder "text"
        const prefix = formatParts[0];
        const suffix = formatParts[1];
        newText = value.slice(0, start) + prefix + (selectedText || "text") + suffix + value.slice(end);
        newCursorPos = start + prefix.length + (selectedText || "text").length;
      } else if (format.includes("|")) {
        // Pronunciation guide
        const [placeholder] = format.split("|");
        const guide = format.replace("word", selectedText || "word");
        newText = value.slice(0, start) + guide + value.slice(end);
        newCursorPos = start + guide.length;
      }
    }

    onTextChange(newText);
    
    // Restore focus and selection after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="space-y-2">
      <TextFormatToolbar 
        onInsertFormat={handleFormatInsert}
        className="mb-2"
      />
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
          ref={textareaRef}
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