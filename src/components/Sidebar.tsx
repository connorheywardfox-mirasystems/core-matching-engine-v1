import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DemoUser } from "@/types";
import { Settings, User } from "lucide-react";

interface SidebarProps {
  activeRole: string;
  demoUser: DemoUser;
  onDemoUserChange: (user: DemoUser) => void;
  onCreatePitch: () => void;
  onSaveMemory: () => void;
  onImportCandidates: () => void;
}

export function Sidebar({
  activeRole,
  demoUser,
  onDemoUserChange,
  onCreatePitch,
  onSaveMemory,
  onImportCandidates
}: SidebarProps) {
  return (
    <div className="w-80 bg-background border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">S</span>
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Sonder</h1>
            <p className="text-sm text-muted-foreground">Recruiter console</p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Active Role */}
      <div className="p-6 border-b border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Active role</h3>
        <Card className="p-4 bg-gradient-to-r from-primary-muted to-background border-primary/20">
          <p className="font-medium text-foreground">{activeRole}</p>
        </Card>
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
          <Button 
            variant="secondary" 
            className="w-full justify-start" 
            onClick={onImportCandidates}
          >
            Import candidates
          </Button>
        </div>
      </div>
    </div>
  );
}