import { FileUp } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import * as mammoth from "mammoth";

interface FileImportProps {
  onImport: (text: string) => void;
  className?: string;
}

export const FileImport = ({ onImport, className }: FileImportProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      let text = '';

      if (file.type === 'text/plain') {
        text = await file.text();
      } 
      else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } 
      else {
        toast.error('Unsupported file type. Please use .txt or .docx files.');
        return;
      }

      if (text.trim()) {
        onImport(text);
        toast.success(`Successfully imported text from ${file.name}`);
      } else {
        toast.error('The file appears to be empty.');
      }
    } catch (error) {
      console.error('Error importing file:', error);
      toast.error('Failed to import file. Please try again.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  return (
    <div
      className={className}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <button
        type="button"
        onClick={handleClick}
        className="relative group flex items-center gap-2 py-2 px-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
      >
        <FileUp className="h-5 w-5" />
        <span>Import Text</span>
        
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
            <span className="text-primary font-medium">Drop file here</span>
          </div>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.docx"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}; 