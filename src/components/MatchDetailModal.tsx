import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/types";
import { X, Send, Bookmark, Building } from "lucide-react";

interface MatchDetailModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  onSendIntro: (match: Match) => void;
  onSave: (match: Match) => void;
}

export function MatchDetailModal({
  match,
  isOpen,
  onClose,
  onSendIntro,
  onSave
}: MatchDetailModalProps) {
  if (!match) return null;

  const scoreValue = parseInt(match.match_score.replace('%', ''));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building className="w-4 h-4 text-primary" />
                </div>
                <Badge variant="secondary" className="px-3 py-1">
                  {match.match_score} match
                </Badge>
              </div>
              <DialogTitle className="text-xl leading-tight">
                {match.display_title || match.role_title}
              </DialogTitle>
              {match.firm_name && (
                <div className="text-muted-foreground mt-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span className="font-medium">{match.firm_name}</span>
                    {match.firm_location && <span>• {match.firm_location}</span>}
                  </div>
                  {match.firm_website && (
                    <div className="flex items-center gap-2 ml-6">
                      <a 
                        href={match.firm_website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm hover:text-foreground transition-colors underline"
                      >
                        Visit website
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Salary Information */}
          {(() => {
            const salaryMatch = match.description.match(/(?:salary|compensation|pay|package|earning)[:\s]*[£$€]?([\d,]+(?:\.\d+)?)\s*(?:k|K|000)?(?:\s*-\s*[£$€]?([\d,]+(?:\.\d+)?)?\s*(?:k|K|000)?)?/i);
            if (salaryMatch) {
              const fullMatch = salaryMatch[0];
              const formatSalary = (text: string) => {
                return text.replace(/(\d+)k?/gi, (match, num) => {
                  const number = parseInt(num);
                  return number < 1000 ? `${number}k` : number.toLocaleString();
                });
              };
              
              return (
                <div>
                  <h3 className="font-medium text-foreground mb-3">Compensation</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-800">
                      {formatSalary(fullMatch)}
                    </p>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Job Description */}
          <div>
            <h3 className="font-medium text-foreground mb-3">Role Description</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {match.description}
              </div>
            </div>
          </div>

          {/* Match Details */}
          <div>
            <h3 className="font-medium text-foreground mb-3">Why this matches</h3>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="text-sm text-foreground leading-relaxed space-y-3">
                {match.match_reason.split(/(?=Key strengths:|Points to address:|Placement likelihood:|Recommended next step:)/i).map((section, index) => {
                  const trimmed = section.trim();
                  if (!trimmed) return null;
                  
                  // Check if this is a labeled section
                  const isLabeledSection = /^(Key strengths:|Points to address:|Placement likelihood:|Recommended next step:)/i.test(trimmed);
                  
                  if (isLabeledSection) {
                    const [label, ...content] = trimmed.split(':');
                    return (
                      <div key={index} className="space-y-2">
                        <div className="font-medium text-foreground">{label}:</div>
                        <div className="pl-3">{content.join(':').trim()}</div>
                      </div>
                    );
                  } else {
                    // First summary section or other content
                    return (
                      <div key={index}>
                        {trimmed}
                      </div>
                    );
                  }
                }).filter(Boolean)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button 
              variant="primary" 
              onClick={() => onSendIntro(match)}
              className="flex-1"
            >
              <Send className="w-4 h-4" />
              Send Introduction
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => onSave(match)}
              className="flex-1"
            >
              <Bookmark className="w-4 h-4" />
              Save for Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}