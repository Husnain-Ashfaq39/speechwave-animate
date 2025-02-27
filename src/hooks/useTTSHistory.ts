import { useState, useEffect } from 'react';
import { TTSVoice } from '@/lib/tts-utils';
import { toast } from 'sonner';

export interface HistoryItem {
  id: string;
  text: string;
  timestamp: number;
  voice: TTSVoice;
  audioUrl?: string;
  audioBlob?: Blob;
}

export const useTTSHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("tts-history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to parse history from localStorage:", error);
      }
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("tts-history", JSON.stringify(history));
  }, [history]);

  const addToHistory = (text: string, audioUrl: string, audioBlob: Blob, voice: TTSVoice) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      text,
      timestamp: Date.now(),
      voice,
      audioUrl,
      audioBlob
    };
    
    setHistory(prev => {
      // Add to beginning of array, limit to 10 most recent items
      const updated = [newItem, ...prev].slice(0, 10);
      return updated;
    });
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item.id !== id);
      // Clean up audio URLs for removed items
      prev.forEach(item => {
        if (item.id === id && item.audioUrl) {
          URL.revokeObjectURL(item.audioUrl);
        }
      });
      return newHistory;
    });
  };

  const clearHistory = () => {
    // Clean up all audio URLs
    history.forEach(item => {
      if (item.audioUrl) {
        URL.revokeObjectURL(item.audioUrl);
      }
    });
    setHistory([]);
    toast.success("History cleared");
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory
  };
}; 