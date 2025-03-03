import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateSpeechContent, SpeechGenerationParams } from '@/lib/groq-utils';
import { cn } from '@/lib/utils';

interface SpeechGeneratorProps {
  onSpeechGenerated: (speech: string) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

export const SpeechGenerator = ({
  onSpeechGenerated,
  isGenerating,
  setIsGenerating
}: SpeechGeneratorProps) => {
  const [title, setTitle] = useState('');
  const [length, setLength] = useState(300);
  const [tone, setTone] = useState<'formal' | 'casual' | 'professional'>('professional');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title for the speech');
      return;
    }

    try {
      setIsGenerating(true);
      const params: SpeechGenerationParams = {
        title,
        length,
        tone
      };

      const generatedSpeech = await generateSpeechContent(params);
      onSpeechGenerated(generatedSpeech);
      toast.success('Speech generated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate speech. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 rounded-lg border border-border bg-card"
    >
      <h2 className="text-lg font-medium mb-4">AI Speech Generator</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Speech Title/Topic
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter the topic or title of your speech"
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
            disabled={isGenerating}
          />
        </div>

        <div>
          <label htmlFor="length" className="block text-sm font-medium mb-1">
            Approximate Length (words)
          </label>
          <input
            id="length"
            type="number"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            min={20}
            max={1000}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
            disabled={isGenerating}
          />
        </div>

        <div>
          <label htmlFor="tone" className="block text-sm font-medium mb-1">
            Tone
          </label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value as typeof tone)}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
            disabled={isGenerating}
          >
            <option value="professional">Professional</option>
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !title.trim()}
          className={cn(
            "w-full flex items-center justify-center gap-2 h-10 px-4 rounded-lg transition-all duration-300",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            isGenerating || !title.trim()
              ? "bg-primary/30 text-primary-foreground/50 cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5" />
              <span>Generate Speech</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}; 