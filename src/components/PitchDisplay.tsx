import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCw, ClipboardCheck, Mail, Linkedin, Phone } from "lucide-react";
import { useState } from "react";
import { Pitch } from "@/types";

interface PitchDisplayProps {
  formattedText: string;
  pitches: Pitch[];
  suggestedActions?: string[];
  onCopy: (pitchType: string, content: string) => void;
  onRegenerate: () => void;
}

const PITCH_TYPES = [
  { type: "pitch_email" as const, icon: Mail, label: "Email Pitch", emoji: "📧" },
  { type: "pitch_linkedin" as const, icon: Linkedin, label: "LinkedIn Pitch", emoji: "💼" },
  { type: "pitch_phone" as const, icon: Phone, label: "Phone Script", emoji: "📞" }
];

const getQualityColor = (score: number) => {
  if (score >= 85) return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
  if (score >= 70) return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
  return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
};

const getStatusVariant = (status: string) => {
  if (status === "approved") return "default";
  if (status === "pending_review") return "secondary";
  return "outline";
};

export function PitchDisplay({ pitches, suggestedActions, onCopy, onRegenerate }: PitchDisplayProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopy = (type: string, content: string) => {
    onCopy(type, content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Find best pitch by quality score
  const bestPitch = pitches.reduce((best, current) => 
    (current.quality_score > (best?.quality_score || 0)) ? current : best
  , pitches[0]);

  return (
    <div className="space-y-6 w-full">
      {/* Pitch sections */}
      {PITCH_TYPES.map(({ type, icon: Icon, label, emoji }) => {
        const pitch = pitches.find(p => p.type === type);
        const isCopied = copiedType === type;
        
        return (
          <div key={type} className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">{emoji} {label}</h3>
                {pitch && (
                  <>
                    <Badge 
                      className={`${getQualityColor(pitch.quality_score)} border`}
                    >
                      Quality: {pitch.quality_score}/100
                    </Badge>
                    <Badge variant={getStatusVariant(pitch.status)}>
                      {pitch.status.replace(/_/g, ' ')}
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            {pitch ? (
              <div className="space-y-3">
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                    {pitch.content}
                  </pre>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(type, pitch.content)}
                  className="w-full sm:w-auto"
                >
                  {isCopied ? (
                    <>
                      <ClipboardCheck className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy {label}
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="bg-muted/20 rounded-lg p-4 border border-dashed border-border">
                <p className="text-sm text-muted-foreground italic">
                  No {label.toLowerCase()} generated
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Summary section */}
      {bestPitch && (
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            <strong className="text-foreground">Best pitch:</strong>{" "}
            {PITCH_TYPES.find(t => t.type === bestPitch.type)?.label} ({bestPitch.quality_score}/100)
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        {suggestedActions && suggestedActions.length > 0 && suggestedActions.map((action, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            disabled
          >
            {action}
          </Button>
        ))}
        
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
