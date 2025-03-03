import Groq from 'groq-sdk';

export interface SpeechGenerationParams {
  title: string;
  length: number; // target word count
  tone?: 'formal' | 'casual' | 'professional';
}

export async function generateSpeechContent(params: SpeechGenerationParams): Promise<string> {
  const groq = new Groq({
   
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const prompt = `Generate a ${params.tone || 'professional'} speech about "${params.title}" that is approximately ${params.length} words long. 
  The speech should be well-structured, engaging, and suitable for text-to-speech conversion.
  Focus on natural flow and clear articulation.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 1,
      stream: false,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating speech content:', error);
    throw new Error('Failed to generate speech content');
  }
} 