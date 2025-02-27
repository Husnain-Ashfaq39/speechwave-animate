import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { HistoryItem } from "@/hooks/useTTSHistory";

interface HistoryPanelProps {
  show: boolean;
  history: HistoryItem[];
  onClear: () => void;
  onSelect: (item: HistoryItem) => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
}

export const HistoryPanel = ({
  show,
  history,
  onClear,
  onSelect,
  onRemove
}: HistoryPanelProps) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className="mb-6 glass-card rounded-lg p-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="animate-scale-in">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium">Recent Conversions</h2>
              {history.length > 0 && (
                <button
                  onClick={onClear}
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
                    onClick={() => onSelect(item)}
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
                      onClick={(e) => onRemove(item.id, e)}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 