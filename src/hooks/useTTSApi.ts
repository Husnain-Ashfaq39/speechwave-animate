import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TTSSettings, TTSVoice, synthesizeSpeech } from '@/lib/tts-utils';
import { toast } from 'sonner';

interface SynthesisResult {
  audioUrl: string;
  audioBlob: Blob;
}

export const useTTSApi = () => {
  const queryClient = useQueryClient();

  // Mutation for text-to-speech conversion
  const synthesizeMutation = useMutation({
    mutationFn: async ({ text, settings }: { text: string; settings: TTSSettings }): Promise<SynthesisResult> => {
      try {
        const result = await synthesizeSpeech(text, settings);
        return result;
      } catch (error) {
        console.error('Error in synthesizeSpeech:', error);
        throw error;
      }
    },
    onError: (error) => {
      console.error('Synthesis error:', error);
      toast.error('Failed to convert text to speech. Please try again.');
    }
  });

  // Query for available voices (assuming you have this API)
  const { data: voices, isLoading: isLoadingVoices } = useQuery({
    queryKey: ['voices'],
    queryFn: async (): Promise<TTSVoice[]> => {
      // Replace this with your actual API call to fetch voices
      return [];
    },
    staleTime: Infinity, // Voices list rarely changes, so we can cache it indefinitely
  });

  // Prefetch voices
  const prefetchVoices = async () => {
    await queryClient.prefetchQuery({
      queryKey: ['voices'],
      queryFn: async (): Promise<TTSVoice[]> => {
        // Replace this with your actual API call to fetch voices
        return [];
      },
    });
  };

  // Cache audio blobs
  const cacheAudioBlob = (key: string, blob: Blob) => {
    queryClient.setQueryData(['audio', key], blob);
  };

  const getCachedAudioBlob = (key: string): Blob | undefined => {
    return queryClient.getQueryData(['audio', key]);
  };

  return {
    synthesizeSpeech: synthesizeMutation.mutateAsync,
    isProcessing: synthesizeMutation.isPending,
    voices,
    isLoadingVoices,
    prefetchVoices,
    cacheAudioBlob,
    getCachedAudioBlob,
  };
}; 