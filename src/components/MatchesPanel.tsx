import { Match } from "@/types";
import { MatchCard } from "./MatchCard";
import { Skeleton } from "@/components/ui/skeleton";

interface MatchesPanelProps {
  matches: Match[];
  isLoading: boolean;
  onViewMatch: (match: Match) => void;
  onSendIntro: (match: Match) => void;
  onSaveMatch: (match: Match) => void;
}

function MatchSkeleton() {
  return (
    <div className="p-4 border border-border rounded-lg space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-5 w-3/4" />
        </div>
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </div>
  );
}

export function MatchesPanel({
  matches,
  isLoading,
  onViewMatch,
  onSendIntro,
  onSaveMatch
}: MatchesPanelProps) {
  return (
    <div className="w-96 bg-background border-l border-border flex flex-col">
      <div className="h-24 p-6 border-b border-border flex items-center">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Top Matches</h2>
          {matches.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {matches.length} results found
            </p>
          )}
          {matches.length === 0 && (
            <p className="text-sm text-muted-foreground">Role matching results</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <MatchSkeleton key={i} />
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((match, index) => (
              <MatchCard
                key={`${match.role_title}-${index}`}
                match={match}
                onView={onViewMatch}
                onSendIntro={onSendIntro}
                onSave={onSaveMatch}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-muted-foreground text-xl">🎯</span>
            </div>
            <h3 className="font-medium text-foreground mb-2">No matches yet</h3>
            <p className="text-sm text-muted-foreground">
              Enter a candidate CV and click "Find matches" to see results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}