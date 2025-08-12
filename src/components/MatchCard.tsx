import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/types";
import { Eye, Send, Bookmark, Star } from "lucide-react";

interface MatchCardProps {
  match: Match;
  onView: (match: Match) => void;
  onSendIntro: (match: Match) => void;
  onSave: (match: Match) => void;
}

export function MatchCard({ match, onView, onSendIntro, onSave }: MatchCardProps) {
  const percentage = Math.round(match.score * 100);
  
  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground">JD</span>
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {percentage}%
              </Badge>
            </div>
            <h3 className="font-medium text-foreground leading-tight">
              {match.title}
            </h3>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {match.reason}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView(match)}
            className="flex-1"
          >
            <Eye className="w-3 h-3" />
            View
          </Button>
          <Button 
            variant="action" 
            size="sm" 
            onClick={() => onSendIntro(match)}
            className="flex-1"
          >
            <Send className="w-3 h-3" />
            Send intro
          </Button>
          <Button 
            variant="action" 
            size="sm" 
            onClick={() => onSave(match)}
            className="flex-1"
          >
            <Bookmark className="w-3 h-3" />
            Save
          </Button>
        </div>
      </div>
    </Card>
  );
}