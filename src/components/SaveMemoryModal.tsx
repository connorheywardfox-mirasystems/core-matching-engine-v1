import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Match } from "@/types";
import { Save, Loader2 } from "lucide-react";

interface SaveMemoryModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string; tags: string }) => void;
  isLoading?: boolean;
}

export function SaveMemoryModal({
  match,
  isOpen,
  onClose,
  onSave,
  isLoading = false
}: SaveMemoryModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  // Pre-fill form when match changes
  useEffect(() => {
    if (match && isOpen) {
      setTitle(`Note: ${match.role_title}`);
      setContent(`Match reason: ${match.match_reason}\n\nAdditional notes:`);
      setTags("candidate,match,recruitment");
    }
  }, [match, isOpen]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    
    onSave({
      title: title.trim(),
      content: content.trim(),
      tags: tags.trim()
    });
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setTags("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save Memory
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter a title for this memory"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Enter your notes or observations"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <Input
              id="tags"
              placeholder="e.g., candidate, urgent, follow-up"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSave}
              disabled={!title.trim() || !content.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Confirm
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}