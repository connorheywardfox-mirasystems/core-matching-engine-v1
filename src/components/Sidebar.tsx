import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DemoUser } from "@/types";
import { Settings, User, Upload, FileText } from "lucide-react";
import { useState, useRef } from "react";
import { extractTextFromPDF } from "@/utils/pdfUtils";

interface SidebarProps {
  activeRole: string;
  demoUser: DemoUser;
  onDemoUserChange: (user: DemoUser) => void;
  onActiveRoleChange: (role: string) => void;
  onCreatePitch: () => void;
  onSaveMemory: () => void;
  onFilesProcessed: (files: { file: File; text: string }[]) => void;
}

const mockRoles = [
  'Senior Associate — London',
  'Software Engineer — San Francisco',
  'Product Manager — New York',
  'Data Scientist — Berlin',
  'UX Designer — Amsterdam',
  'Marketing Director — Toronto',
  'Sales Executive — Sydney',
  'DevOps Engineer — Singapore'
];

export function Sidebar({
  activeRole,
  demoUser,
  onDemoUserChange,
  onActiveRoleChange,
  onCreatePitch,
  onSaveMemory,
  onFilesProcessed
}: SidebarProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'application/pdf'
    );
    
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    const processedFiles: { file: File; text: string }[] = [];

    for (const file of files) {
      try {
        const text = await extractTextFromPDF(file);
        processedFiles.push({ file, text });
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
      }
    }

    if (processedFiles.length > 0) {
      onFilesProcessed(processedFiles);
    }
    
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  return (
    <div className="w-80 bg-background border-r border-border flex flex-col">
      {/* Header */}
      <div className="h-24 p-6 border-b border-border flex items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">S</span>
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Sonder</h1>
            <p className="text-sm text-muted-foreground">Recruiter console</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto">
          <Settings className="w-4 h-4" />
        </Button>
      </div>


      {/* Demo User Selector */}
      <div className="p-6 border-b border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Demo user</h3>
        <Select value={demoUser} onValueChange={onDemoUserChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recruiter_demo">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Recruiter (Demo)
              </div>
            </SelectItem>
            <SelectItem value="admin_demo">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Admin (Demo)
              </div>
            </SelectItem>
            <SelectItem value="viewer_demo">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Viewer (Demo)
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Actions */}
      <div className="p-6 flex-1">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Quick actions</h3>
        <div className="space-y-3">
          <Button 
            variant="primary" 
            className="w-full justify-start" 
            onClick={onCreatePitch}
          >
            Create pitch
          </Button>
          <Button 
            variant="secondary" 
            className="w-full justify-start" 
            onClick={onSaveMemory}
          >
            Save memory
          </Button>
          
          {/* Drag & Drop Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-4 transition-all duration-200 cursor-pointer ${
              isDragOver 
                ? 'border-primary bg-primary/5 scale-105' 
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex flex-col items-center gap-2 text-center">
              {isProcessing ? (
                <>
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <div className="text-xs text-muted-foreground">Processing...</div>
                </>
              ) : (
                <>
                  <Upload className={`w-5 h-5 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="text-xs font-medium text-foreground">
                    {isDragOver ? 'Drop files here' : 'Import candidates'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Drag PDFs or click to browse
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}