import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { Pitch } from "@/types";

interface PitchDisplayProps {
  formattedText: string;
  pitches: Pitch[];
  onCopy: (pitchType: string, content: string) => void;
  onRegenerate: () => void;
}

export function PitchDisplay({ formattedText, pitches, onCopy, onRegenerate }: PitchDisplayProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopy = (type: string, content: string) => {
    onCopy(type, content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const emailPitch = pitches.find(p => p.type === "pitch_email");
  const linkedinPitch = pitches.find(p => p.type === "pitch_linkedin");
  const phonePitch = pitches.find(p => p.type === "pitch_phone");

  return (
    <div className="space-y-4">
      {/* Formatted text display */}
      <div className="bg-muted/50 rounded-lg p-4 border border-border">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {formattedText}
        </pre>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {emailPitch && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy("email", emailPitch.content)}
          >
            {copiedType === "email" ? (
              <>
                <ClipboardCheck className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Email Pitch
              </>
            )}
          </Button>
        )}
        
        {linkedinPitch && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy("linkedin", linkedinPitch.content)}
          >
            {copiedType === "linkedin" ? (
              <>
                <ClipboardCheck className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy LinkedIn Pitch
              </>
            )}
          </Button>
        )}
        
        {phonePitch && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy("phone", phonePitch.content)}
          >
            {copiedType === "phone" ? (
              <>
                <ClipboardCheck className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Phone Script
              </>
            )}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled
        >
          Generate Interview Prep
        </Button>
      </div>
    </div>
  );
}
