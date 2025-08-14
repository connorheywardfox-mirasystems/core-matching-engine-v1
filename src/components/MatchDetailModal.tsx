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
                {match.role_title}
              </DialogTitle>
              <p className="text-muted-foreground mt-1">{match.match_reason}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Description */}
          <div>
            <h3 className="font-medium text-foreground mb-3">Role Description</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {match.description}
              </p>
            </div>
          </div>

          {/* Match Details */}
          <div>
            <h3 className="font-medium text-foreground mb-3">Why this matches</h3>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-foreground leading-relaxed">
                {match.match_reason}
              </p>
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