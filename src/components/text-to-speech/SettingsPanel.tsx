import { motion } from "framer-motion";
import { AlertCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { TTSSettings, TTSVoice } from "@/lib/tts-utils";
import { VoiceSelector } from "../VoiceSelector";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  show: boolean;
  settings: TTSSettings;
  onSettingChange: <K extends keyof TTSSettings>(key: K, value: TTSSettings[K]) => void;
  onVoiceSelect: (voice: TTSVoice) => void;
}

export const SettingsPanel = ({
  show,
  settings,
  onSettingChange,
  onVoiceSelect
}: SettingsPanelProps) => {
  const navigate = useNavigate();

  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/pricing');
  };

  return (
    <div className={cn(
      "mb-6 glass-card rounded-lg p-4 transition-all",
      show ? "h-auto opacity-100" : "h-0 opacity-0 overflow-hidden p-0"
    )}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-scale-in">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Voice</label>
          <VoiceSelector 
            selectedVoice={settings.voice} 
            onSelect={onVoiceSelect}
          />
        </div>

        <div className="md:col-span-2 border-t border-input/20 pt-4 mt-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium">Voice Cloning</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Create your own custom voice by uploading a voice sample
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                toast('Pro Feature Required', {
                  description: (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Voice cloning is available in our Pro and Enterprise plans.{" "}
                          <button
                            onClick={handleUpgradeClick}
                            className="text-primary hover:underline bg-transparent border-none p-0 cursor-pointer"
                          >
                            Upgrade your subscription
                          </button>{" "}
                          to access this feature.
                        </p>
                      </div>
                    </div>
                  ),
                  duration: 4000,
                });
              }}
              type="button"
              className="flex items-center gap-2 py-2 px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span className="text-sm">Clone Voice</span>
            </motion.button>
          </div>
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
            onChange={(e) => onSettingChange('rate', parseFloat(e.target.value))}
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
            onChange={(e) => onSettingChange('pitch', parseFloat(e.target.value))}
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
            onChange={(e) => onSettingChange('stability', parseFloat(e.target.value))}
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
            onChange={(e) => onSettingChange('similarityBoost', parseFloat(e.target.value))}
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
            onChange={(e) => onSettingChange('style', parseFloat(e.target.value))}
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
            onChange={(e) => onSettingChange('useSpeakerBoost', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="speakerBoost" className="text-sm font-medium">
            Use Speaker Boost
          </label>
        </div>
      </div>
    </div>
  );
}; 