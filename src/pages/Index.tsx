
import { TextToSpeech } from "@/components/TextToSpeech";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <TextToSpeech />
      
      <footer className="mt-auto pt-8 pb-4 text-center text-sm text-muted-foreground">
        <p>Premium Text-to-Speech Converter</p>
      </footer>
    </div>
  );
};

export default Index;
