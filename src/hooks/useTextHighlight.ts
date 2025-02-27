import { useState, useEffect } from 'react';

interface UseTextHighlightProps {
  text: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

export const useTextHighlight = ({ text, isPlaying, currentTime, duration }: UseTextHighlightProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [words, setWords] = useState<string[]>([]);

  // Split text into words when it changes
  useEffect(() => {
    const splitWords = text.trim().split(/\s+/);
    setWords(splitWords.filter(word => word.length > 0));
  }, [text]);

  // Update current word based on audio progress
  useEffect(() => {
    if (!isPlaying || !duration) {
      setCurrentWordIndex(-1);
      return;
    }

    const wordsCount = words.length;
    if (wordsCount === 0) return;

    // Calculate which word should be highlighted based on current time
    const wordDuration = duration / wordsCount;
    const currentIndex = Math.floor(currentTime / wordDuration);
    setCurrentWordIndex(Math.min(currentIndex, wordsCount - 1));
  }, [currentTime, duration, isPlaying, words]);

  // Reset word highlighting when audio stops
  useEffect(() => {
    if (!isPlaying) {
      setCurrentWordIndex(-1);
    }
  }, [isPlaying]);

  const updateHighlightOnSeek = (time: number) => {
    if (words.length > 0 && duration) {
      const wordDuration = duration / words.length;
      const newIndex = Math.floor(time / wordDuration);
      setCurrentWordIndex(Math.min(newIndex, words.length - 1));
    }
  };

  return {
    words,
    currentWordIndex,
    updateHighlightOnSeek,
    resetHighlight: () => setCurrentWordIndex(-1)
  };
}; 