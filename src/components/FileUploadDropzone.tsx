import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { extractTextFromPDF } from '@/utils/pdfUtils';

interface FileUploadDropzoneProps {
  onFilesProcessed: (files: { file: File; text: string }[]) => void;
  className?: string;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
}

interface FileWithStatus {
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error';
  text?: string;
  error?: string;
  progress?: number;
}

export function FileUploadDropzone({ 
  onFilesProcessed, 
  className,
  accept = '.pdf,application/pdf',
  maxFiles = 10,
  maxSize = 10 // 10MB default
}: FileUploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return 'File must be a PDF';
    }
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    return null;
  };

  const processFiles = useCallback(async (fileList: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate files
    for (const file of fileList) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    // Show validation errors
    if (errors.length > 0) {
      toast({
        title: "File validation failed",
        description: errors.join(', '),
        variant: "destructive",
      });
    }

    // Check max files limit
    if (files.length + validFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    if (validFiles.length === 0) return;

    // Add files to state with pending status
    const newFiles: FileWithStatus[] = validFiles.map(file => ({
      file,
      status: 'pending',
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(true);

    // Process files one by one
    const processedFiles: { file: File; text: string }[] = [];
    
    for (let i = 0; i < newFiles.length; i++) {
      const fileWithStatus = newFiles[i];
      
      try {
        // Update status to processing
        setFiles(prev => prev.map(f => 
          f.file === fileWithStatus.file 
            ? { ...f, status: 'processing', progress: 0 }
            : f
        ));

        // Extract text from PDF with progress simulation
        const text = await extractTextFromPDF(fileWithStatus.file);
        
        if (!text.trim()) {
          throw new Error('No readable text found in PDF');
        }

        // Update status to success
        setFiles(prev => prev.map(f => 
          f.file === fileWithStatus.file 
            ? { ...f, status: 'success', text, progress: 100 }
            : f
        ));

        processedFiles.push({ file: fileWithStatus.file, text });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
        
        // Update status to error
        setFiles(prev => prev.map(f => 
          f.file === fileWithStatus.file 
            ? { ...f, status: 'error', error: errorMessage }
            : f
        ));

        toast({
          title: "File processing failed",
          description: `${fileWithStatus.file.name}: ${errorMessage}`,
          variant: "destructive",
        });
      }
    }

    setIsProcessing(false);

    // Call callback with successfully processed files
    if (processedFiles.length > 0) {
      onFilesProcessed(processedFiles);
    }
  }, [files.length, maxFiles, maxSize, onFilesProcessed, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
    // Reset input
    e.target.value = '';
  }, [processFiles]);

  const removeFile = (fileToRemove: File) => {
    setFiles(prev => prev.filter(f => f.file !== fileToRemove));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const getFileIcon = (status: FileWithStatus['status']) => {
    switch (status) {
      case 'processing':
        return <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver 
            ? "border-primary bg-primary-muted" 
            : "border-border hover:border-primary/50 bg-card"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className={cn(
            "mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            isDragOver ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            <Upload className="w-6 h-6" />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isDragOver ? "Drop files here" : "Drag & drop PDF files here"}
            </p>
            <p className="text-xs text-muted-foreground">
              or click to browse • Max {maxFiles} files • Up to {maxSize}MB each
            </p>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Files
          </Button>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Files ({files.length})
            </h4>
            {files.length > 1 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAll}
                disabled={isProcessing}
              >
                Clear all
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            {files.map((fileWithStatus, index) => (
              <div 
                key={`${fileWithStatus.file.name}-${index}`}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
              >
                {getFileIcon(fileWithStatus.status)}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {fileWithStatus.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(fileWithStatus.file.size / 1024 / 1024).toFixed(1)} MB
                    {fileWithStatus.status === 'processing' && " • Processing..."}
                    {fileWithStatus.status === 'success' && " • Ready"}
                    {fileWithStatus.status === 'error' && ` • ${fileWithStatus.error}`}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(fileWithStatus.file)}
                  disabled={fileWithStatus.status === 'processing'}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
            Processing files...
          </div>
        </div>
      )}
    </div>
  );
}