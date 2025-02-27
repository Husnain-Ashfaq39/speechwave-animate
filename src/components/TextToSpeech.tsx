import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Settings, Volume2, Clock, X, ChevronDown } from "lucide-react";
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
import { TextAreaSkeleton, AudioPlayerSkeleton, SettingsSkeleton } from "./ui/skeleton";

const MAX_WORDS = 1000;

export const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [currentAudioBlob, setCurrentAudioBlob] = useState<Blob | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'mp3' | 'wav' | 'flac'>('mp3');
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  const { settings, updateSetting, updateVoice } = useTTSSettings();
  const { history, addToHistory, removeFromHistory, clearHistory } = useTTSHistory();
  const { audioRef, isPlaying, currentTime, duration, controls } = useAudioPlayer(currentAudioUrl);
  const { words, currentWordIndex, updateHighlightOnSeek, resetHighlight } = useTextHighlight({
    text,
    isPlaying,
    currentTime,
    duration
  });

  // Simulate settings loading on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSettingsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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

  const handleDownload = async () => {
    if (!text.trim()) {
      toast.error("Please generate speech first before downloading");
      return;
    }
    
    if (currentAudioBlob) {
      try {
        const filename = `speech_${settings.voice.name}_${Date.now()}.${selectedFormat}`;
        
        // Convert to selected format if needed
        let downloadBlob = currentAudioBlob;
        if (selectedFormat !== 'mp3') {
          const audioContext = new AudioContext();
          const arrayBuffer = await currentAudioBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const format = selectedFormat === 'wav' ? 'audio/wav' : 'audio/flac';
          const offlineContext = new OfflineAudioContext(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
          );
          
          const source = offlineContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(offlineContext.destination);
          source.start();
          
          const renderedBuffer = await offlineContext.startRendering();
          const wavBlob = await new Promise<Blob>((resolve) => {
            const chunks: Float32Array[] = [];
            const channels = [];
            for (let i = 0; i < renderedBuffer.numberOfChannels; i++) {
              channels.push(renderedBuffer.getChannelData(i));
            }
            resolve(new Blob([channels[0]], { type: format }));
          });
          
          downloadBlob = wavBlob;
        }
        
        const downloadUrl = URL.createObjectURL(downloadBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        toast.success(`Audio downloaded as ${filename}`);
        setShowExportOptions(false);
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
      {/* Header Section */}
      <motion.div 
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <span className="text-sm uppercase tracking-wider text-muted-foreground/70 block mb-1">
            Premium Text-to-Speech
          </span>
          <h1 className="text-2xl md:text-3xl font-semibold text-gradient">
            Convert Text to Natural Speech
          </h1>
        </div>
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
      
      {/* Settings & History Panels */}
      <HistoryPanel
        show={showHistory}
        history={history}
        onClear={clearHistory}
        onSelect={loadFromHistory}
        onRemove={removeFromHistory}
      />
      
      <AnimatePresence mode="wait">
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isSettingsLoading ? (
              <SettingsSkeleton />
            ) : (
              <SettingsPanel
                show={showSettings}
                settings={settings}
                onSettingChange={updateSetting}
                onVoiceSelect={updateVoice}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content Section */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Text Input Section */}
        <section>
          <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
            <span>Input Text</span>
            <span className="text-xs text-muted-foreground font-normal">
              (Max {MAX_WORDS} words)
            </span>
          </h2>
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TextAreaSkeleton />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HighlightedText
                  words={words}
                  currentWordIndex={currentWordIndex}
                  onTextChange={setText}
                  value={text}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
        
        {/* Action Buttons Section */}
        <section className="flex flex-col md:flex-row gap-4">
          <button
            type="submit"
            disabled={isProcessing || !text.trim() || isPlaying}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
              onClick={() => setShowExportOptions(!showExportOptions)}
              disabled={!currentAudioBlob}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <Download className="h-5 w-5" />
              <span>Download Audio</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", showExportOptions && "rotate-180")} />
            </button>
          </div>
        </section>
      </motion.form>
      
      {/* Audio Player Section */}
      <audio ref={audioRef} onEnded={resetHighlight} />
      
      <AnimatePresence mode="wait">
        {currentAudioUrl && (
          <motion.section
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-medium mb-3">Audio Preview</h2>
            {isProcessing ? (
              <AudioPlayerSkeleton />
            ) : (
              <div className="relative">
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

                {/* Export Options Panel */}
                {showExportOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 mt-2 rounded-lg shadow-lg bg-popover border border-border overflow-hidden"
                  >
                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-medium mb-2">Export Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            setSelectedFormat('mp3');
                            handleDownload();
                          }}
                          className="flex items-center justify-center gap-2 p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span>MP3 Format</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFormat('wav');
                            handleDownload();
                          }}
                          className="flex items-center justify-center gap-2 p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span>WAV Format</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFormat('flac');
                            handleDownload();
                          }}
                          className="flex items-center justify-center gap-2 p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span>FLAC Format</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}; 