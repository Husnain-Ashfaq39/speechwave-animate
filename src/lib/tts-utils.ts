// Types for TTS operations
export type VoiceAccent = "American" | "British" | "Australian" | "Indian" | "Spanish" | "French" | "German" | "Japanese" | "Scottish";
export type VoiceGender = "Male" | "Female" | "Neutral";
export type VoiceAge = "Young" | "Adult" | "Senior";

export type TTSVoice = {
  id: string;
  name: string;
  gender: VoiceGender;
  accent?: VoiceAccent;
  age?: VoiceAge;
  description?: string;
  previewUrl?: string;
  category?: string;
  useCase?: string;
};

export type TTSSettings = {
  voice: TTSVoice;
  rate: number;
  pitch: number;
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
};

// Import the generateSpeech function from elevenlabs-api
import { elevenLabsGenerateSpeech as elevenLabsGenerateSpeech } from './elevenlabs-api';

// Use the ElevenLabs API for speech synthesis
export const synthesizeSpeech = async (
  text: string,
  settings: TTSSettings
): Promise<{
  audioUrl: string;
  audioBlob: Blob;
}> => {
  try {
    const { audioBlob } = await elevenLabsGenerateSpeech(text, settings);
    return {
      audioUrl: URL.createObjectURL(audioBlob),
      audioBlob
    };
  } catch (error) {
    console.error('Error in synthesizeSpeech:', error);
    throw error;
  }
};

// Helper function to save text as a file
export const saveTextAsFile = (text: string, filename: string) => {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Helper to format time in MM:SS format
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};
