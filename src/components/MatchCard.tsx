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
  const scoreValue = parseInt(match.match_score.replace('%', ''));
  
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`text-xs font-medium ${getScoreColor(scoreValue)}`}>
              {match.match_score} match
            </Badge>
          </div>
          <h3 className="font-semibold text-foreground line-clamp-2 text-sm">
            {match.display_title || match.role_title}
          </h3>
          {match.firm_name && (
            <p className="text-xs text-muted-foreground mt-1">
              {match.firm_website ? (
                <a 
                  href={match.firm_website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {match.firm_name}
                </a>
              ) : (
                match.firm_name
              )}
              {match.firm_location && ` • ${match.firm_location}`}
            </p>
          )}
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Star className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {match.description}
      </p>

      <p className="text-xs text-muted-foreground mb-4 line-clamp-1 italic">
        Match reason: {match.match_reason}
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => onView(match)}
        >
          View Details
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => onSendIntro(match)}
        >
          Send intro
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => onSave(match)}
        >
          Save
        </Button>
      </div>
    </Card>
  );
}