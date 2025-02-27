import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Settings, Volume2, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { synthesizeSpeech, processFormattedText } from "@/lib/tts-utils";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { AudioPlayer } from "./text-to-speech/AudioPlayer";
import { HistoryPanel } from "./text-to-speech/HistoryPanel";
import { SettingsPanel } from "./text-to-speech/SettingsPanel";
import { HighlightedText } from "./text-to-speech/HighlightedText";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useTTSHistory } from "@/hooks/useTTSHistory";
import { useTTSSettings } from "@/hooks/useTTSSettings";
import { useTextHighlight } from "@/hooks/useTextHighlight";
import { FileImport } from "./text-to-speech/FileImport";

export const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [currentAudioBlob, setCurrentAudioBlob] = useState<Blob | null>(null);

  const { settings, updateSetting, updateVoice } = useTTSSettings();
  const { history, addToHistory, removeFromHistory, clearHistory } = useTTSHistory();
  const { audioRef, isPlaying, currentTime, duration, controls } = useAudioPlayer(currentAudioUrl);
  const { words, currentWordIndex, updateHighlightOnSeek, resetHighlight } = useTextHighlight({
    text,
    isPlaying,
    currentTime,
    duration
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast.error("Please enter some text to convert to speech");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Stop any currently playing audio first
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Process formatted text into segments
      const segments = processFormattedText(text, settings);
      
      // Convert each segment and combine the audio
      const audioBlobs: Blob[] = [];
      
      for (const segment of segments) {
        const result = await synthesizeSpeech(segment.text, {
          ...settings,
          ...segment.settings
        });
        audioBlobs.push(result.audioBlob);
      }
      
      // Combine all audio blobs
      const combinedBlob = new Blob(audioBlobs, { type: 'audio/mpeg' });
      
      // Clean up previous audio URL
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
      
      // Create a new audio URL from the combined blob
      const newAudioUrl = URL.createObjectURL(combinedBlob);
      
      // Store both the blob and URL
      setCurrentAudioBlob(combinedBlob);
      setCurrentAudioUrl(newAudioUrl);
      
      if (audioRef.current) {
        audioRef.current.src = newAudioUrl;
        audioRef.current.load();
        addToHistory(text, newAudioUrl, combinedBlob, settings.voice);
      }
      
      toast.success("Text converted to speech successfully");
    } catch (error) {
      console.error("Error synthesizing speech:", error);
      toast.error("Failed to convert text to speech. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!text.trim()) {
      toast.error("Please generate speech first before downloading");
      return;
    }
    
    if (currentAudioBlob) {
      try {
        const filename = `speech_${settings.voice.name}_${Date.now()}.mp3`;
        const downloadUrl = URL.createObjectURL(currentAudioBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        toast.success(`Audio downloaded as ${filename}`);
      } catch (error) {
        console.error('Error downloading audio:', error);
        toast.error('Failed to download audio. Please try again.');
      }
    } else {
      toast.error("No audio available to download");
    }
  };

  const loadFromHistory = (item: typeof history[0]) => {
    setText(item.text);
    updateVoice(item.voice);
    
    // Clean up current audio URL
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
    }
    
    // Create new audio URL from stored blob
    if (item.audioBlob) {
      const newAudioUrl = URL.createObjectURL(
        new Blob([item.audioBlob], { type: 'audio/mpeg' })
      );
      setCurrentAudioUrl(newAudioUrl);
      setCurrentAudioBlob(item.audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = newAudioUrl;
        audioRef.current.load();
      }
    }
    
    setShowHistory(false);
  };

  const handleImport = (importedText: string) => {
    setText(importedText);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
      <motion.div 
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-semibold text-gradient">
          <span className="text-sm uppercase tracking-wider text-muted-foreground/70 block mb-1">Starter</span>
          Text to Speech
        </h1>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowHistory(!showHistory);
              setShowSettings(false);
            }}
            className="relative h-10 w-10 rounded-full bg-secondary p-2 transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="History"
          >
            <Clock className="h-full w-full" />
            {history.length > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground"
              >
                {history.length}
              </motion.span>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowSettings(!showSettings);
              setShowHistory(false);
            }}
            className="relative h-10 w-10 rounded-full bg-secondary p-2 transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Settings"
          >
            <Settings className="h-full w-full" />
          </motion.button>
          <ThemeToggle />
        </div>
      </motion.div>
      
      <HistoryPanel
        show={showHistory}
        history={history}
        onClear={clearHistory}
        onSelect={loadFromHistory}
        onRemove={removeFromHistory}
      />
      
      <SettingsPanel
        show={showSettings}
        settings={settings}
        onSettingChange={updateSetting}
        onVoiceSelect={updateVoice}
      />
      
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <HighlightedText
          words={words}
          currentWordIndex={currentWordIndex}
          onTextChange={setText}
          value={text}
        />
        
        <div className="flex flex-col md:flex-row gap-4">
          <button
            type="submit"
            disabled={isProcessing || !text.trim() || isPlaying}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              (isProcessing || !text.trim() || isPlaying)
                ? "bg-primary/30 text-primary-foreground/50 cursor-not-allowed" 
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                <span>Converting...</span>
              </>
            ) : (
              <>
                <Volume2 className="h-5 w-5" />
                <span>Convert to Speech</span>
              </>
            )}
          </button>
          
          <div className="flex gap-2">
            <FileImport onImport={handleImport} />
            <button
              type="button"
              onClick={handleDownload}
              disabled={!currentAudioBlob}
              className="flex items-center justify-center gap-2 py-2 px-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <Download className="h-5 w-5" />
              Download Audio
            </button>
          </div>
        </div>
      </motion.form>
      
      {/* Audio element */}
      <audio ref={audioRef} onEnded={resetHighlight} />
      
      {/* Audio Player */}
      {currentAudioUrl && (
        <AudioPlayer
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={audioRef.current?.volume || 1}
          isMuted={audioRef.current?.muted || false}
          onPlay={controls.play}
          onPause={controls.pause}
          onSeek={(time) => {
            controls.seek(time);
            updateHighlightOnSeek(time);
          }}
          onVolumeChange={controls.setVolume}
          onToggleMute={controls.toggleMute}
        />
      )}
    </div>
  );
}; 