import { motion } from "framer-motion";
import { AlertCircle, Upload, Info } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { TTSSettings, TTSVoice } from "@/lib/tts-utils";
import { VoiceSelector } from "../VoiceSelector";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SettingsPanelProps {
  show: boolean;
  settings: TTSSettings;
  onSettingChange: (key: keyof TTSSettings, value: number | boolean) => void;
  onVoiceSelect: (voice: TTSVoice) => void;
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip = ({ content, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-popover border rounded-lg shadow-lg whitespace-nowrap z-50 max-w-xs text-center"
        >
          {content}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-popover border-b border-r border-border rotate-45" />
        </motion.div>
      )}
    </div>
  );
};

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

  if (!show) return null;

  const tooltips = {
    stability: "Controls how stable and consistent the voice remains throughout the speech. Higher values result in more consistent tone but may sound less natural.",
    similarityBoost: "Determines how closely the output matches the original voice. Higher values increase similarity but may affect naturalness.",
    style: "Adjusts the expressiveness and emotion in the voice. Higher values create more dramatic and varied speech.",
    rate: "Controls the speed of speech. Higher values make the speech faster, lower values make it slower.",
    pitch: "Adjusts the pitch of the voice. Higher values make the voice higher, lower values make it deeper.",
    useSpeakerBoost: "Enhances voice clarity and reduces background noise. May slightly affect naturalness."
  };

  return (
    <motion.div
      className="mb-6 glass-morphism rounded-xl border border-primary/10 overflow-hidden"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold">Voice Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Stability</Label>
                <Tooltip content={tooltips.stability}>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <span className="text-xs text-muted-foreground">
                {(settings.stability * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={[settings.stability]}
              onValueChange={([value]) => onSettingChange("stability", value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Natural</span>
              <span>Stable</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Similarity Boost</Label>
                <Tooltip content={tooltips.similarityBoost}>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <span className="text-xs text-muted-foreground">
                {(settings.similarityBoost * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={[settings.similarityBoost]}
              onValueChange={([value]) => onSettingChange("similarityBoost", value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Unique</span>
              <span>Similar</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Style</Label>
                <Tooltip content={tooltips.style}>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <span className="text-xs text-muted-foreground">
                {(settings.style * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={[settings.style]}
              onValueChange={([value]) => onSettingChange("style", value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Neutral</span>
              <span>Expressive</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Speech Rate</Label>
                <Tooltip content={tooltips.rate}>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <span className="text-xs text-muted-foreground">
                {settings.rate}x
              </span>
            </div>
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={[settings.rate]}
              onValueChange={([value]) => onSettingChange("rate", value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Pitch</Label>
                <Tooltip content={tooltips.pitch}>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <span className="text-xs text-muted-foreground">
                {settings.pitch}x
              </span>
            </div>
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={[settings.pitch]}
              onValueChange={([value]) => onSettingChange("pitch", value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Lower</span>
              <span>Higher</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="speaker-boost" className="text-sm font-medium">Speaker Boost</Label>
            <Tooltip content={tooltips.useSpeakerBoost}>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <Switch
            id="speaker-boost"
            checked={settings.useSpeakerBoost}
            onCheckedChange={(checked) => onSettingChange("useSpeakerBoost", checked)}
          />
        </div>
      </div>
    </motion.div>
  );
}; 