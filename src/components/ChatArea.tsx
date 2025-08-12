import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/types";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  messages: ChatMessage[];
  candidateText: string;
  onCandidateTextChange: (text: string) => void;
  onFindMatches: () => void;
  isLoading: boolean;
}

export function ChatArea({
  messages,
  candidateText,
  onCandidateTextChange,
  onFindMatches,
  isLoading
}: ChatAreaProps) {
  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Chat</h2>
            <p className="text-sm text-muted-foreground">
              Ask the assistant to find matches, create pitches or save notes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">Find matches</Button>
            <Button variant="ghost" size="sm">Staging</Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-primary-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Hi — paste a CV or describe the candidate and click "Find matches".
            </h3>
            <p className="text-muted-foreground">
              I'll help you find the best role matches for your candidate.
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.type === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-[80%] p-4 rounded-lg",
                message.type === 'user'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-border">
        <div className="flex gap-4">
          <div className="flex-1">
            <Textarea
              placeholder="Paste CV or type candidate summary..."
              value={candidateText}
              onChange={(e) => onCandidateTextChange(e.target.value)}
              className="min-h-[60px] resize-none"
            />
          </div>
          <Button
            variant="primary"
            onClick={onFindMatches}
            disabled={!candidateText.trim() || isLoading}
            className="self-end"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Finding...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Find matches
              </>
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <div className="flex gap-4">
            <button className="hover:text-foreground transition-colors">
              Quick: Request referrals
            </button>
            <button className="hover:text-foreground transition-colors">
              Save candidate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}