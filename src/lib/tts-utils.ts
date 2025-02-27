
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
};

export type TTSSettings = {
  voice: TTSVoice;
  rate: number;
  pitch: number;
};

// Mock function to simulate TTS service
export const synthesizeSpeech = async (
  text: string,
  settings: TTSSettings
): Promise<{ audioUrl: string }> => {
  console.log(`Synthesizing speech: "${text}" with voice ${settings.voice.name} (${settings.voice.gender}, ${settings.voice.accent || 'No accent'})`);
  console.log(`Speech settings: Rate ${settings.rate}x, Pitch ${settings.pitch}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real implementation, this would connect to an actual TTS service
  // For now, just return a success response
  return {
    audioUrl: "data:audio/mp3;base64,..."
  };
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
