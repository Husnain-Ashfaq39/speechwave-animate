/* eslint-disable @typescript-eslint/no-explicit-any */
import { TTSSettings } from './tts-utils';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Add your API key here or load it from environment variables
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '';

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  preview_url: string;
  labels: {
    accent?: string;
    age?: string;
    gender?: string;
    description?: string;
    use_case?: string;
    [key: string]: string | undefined;
  };
  fine_tuning: {
    is_allowed_to_fine_tune: boolean;
    finetuning_state: string;
    [key: string]: any;
  };
  available_for_tiers: string[];
  is_legacy: boolean;
  is_mixed: boolean;
  created_at_unix: number;
}

export const fetchVoices = async (): Promise<ElevenLabsVoice[]> => {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch voices');
    }

    const data = await response.json();
    return data.voices;
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw error;
  }
};

export const elevenLabsGenerateSpeech = async (
  text: string,
  settings: TTSSettings
): Promise<{
  audioUrl: string;
  audioBlob: Blob;
}> => {
  try {
    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${settings.voice.id}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: settings.stability,
            similarity_boost: settings.similarityBoost,
            style: settings.style,
            use_speaker_boost: settings.useSpeakerBoost,
            speaking_rate: settings.rate,
            pitch: settings.pitch
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || 'Failed to generate speech');
    }

    // Get the audio data as a blob
    const audioBlob = await response.blob();
    
    // Create a new blob with explicit MIME type
    const properAudioBlob = new Blob([audioBlob], { type: 'audio/mpeg' });
    
    // Create an object URL for the audio blob
    const audioUrl = URL.createObjectURL(properAudioBlob);
    
    return { audioUrl, audioBlob: properAudioBlob };
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}; 