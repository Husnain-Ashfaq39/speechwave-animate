import { Bold, Pause as PauseIcon, Volume1, Type } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextFormatToolbarProps {
  onInsertFormat: (format: string) => void;
  className?: string;
}

interface FormatButton {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  format: string;
  tooltip: string;
}

const formatButtons: FormatButton[] = [
  {
    icon: Bold,
    label: "Emphasis",
    format: "*text*",
    tooltip: "Add emphasis (speak with more force)"
  },
  {
    icon: PauseIcon,
    label: "Break",
    format: "[pause]",
    tooltip: "Add a pause/break"
  },
  {
    icon: Volume1,
    label: "Soft",
    format: "~text~",
    tooltip: "Speak softly"
  },
  {
    icon: Type,
    label: "Pronounce",
    format: "{word|pronunciation}",
    tooltip: "Guide pronunciation (e.g. {read|reed})"
  }
];

export const TextFormatToolbar = ({
  onInsertFormat,
  className
}: TextFormatToolbarProps) => {
  return (
    <div className={cn("flex items-center gap-1 p-1 bg-secondary/20 rounded-lg", className)}>
      {formatButtons.map((button) => (
        <button
          key={button.label}
          onClick={() => onInsertFormat(button.format)}
          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative group"
          title={button.tooltip}
        >
          <button.icon className="w-4 h-4" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {button.tooltip}
          </div>
        </button>
      ))}
    </div>
  );
}; 