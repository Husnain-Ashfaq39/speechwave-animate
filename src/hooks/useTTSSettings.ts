import { useState } from 'react';
import { TTSSettings, TTSVoice } from '@/lib/tts-utils';

const DEFAULT_VOICE: TTSVoice = { 
  id: "21m00Tcm4TlvDq8ikWAM", // Rachel voice ID from ElevenLabs
  name: "Rachel",
  gender: "Female",
  accent: "American",
  age: "Adult",
  description: "Clear and professional",
  category: "premade"
};

export const useTTSSettings = () => {
  const [settings, setSettings] = useState<TTSSettings>({
    voice: DEFAULT_VOICE,
    rate: 1,
    pitch: 1,
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.0,
    useSpeakerBoost: true,
  });

  const updateSetting = <K extends keyof TTSSettings>(
    key: K,
    value: TTSSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateVoice = (voice: TTSVoice) => {
    updateSetting('voice', voice);
  };

  return {
    settings,
    updateSetting,
    updateVoice,
    DEFAULT_VOICE
  };
}; 