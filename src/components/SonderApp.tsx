import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { ChatArea } from "./ChatArea";
import { MatchesPanel } from "./MatchesPanel";
import { MatchDetailModal } from "./MatchDetailModal";
import { SaveMemoryModal } from "./SaveMemoryModal";
import { ChatMessage, Match, DemoUser } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { 
  callMatchingWebhook, 
  callSaveMemoryWebhook, 
  callSendIntroWebhook,
  callMatchDetailWebhook 
} from "@/services/webhooks";


export function SonderApp() {
  const { toast } = useToast();
  
  // State
  const [demoUser, setDemoUser] = useState<DemoUser>('recruiter_demo');
  const [activeRole, setActiveRole] = useState('Senior Associate — London');
  const [candidateText, setCandidateText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal state
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaveMemoryLoading, setIsSaveMemoryLoading] = useState(false);

  // Generate unique message ID
  const generateMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add message to chat
  const addMessage = (content: string, type: 'user' | 'bot') => {
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Handle find matches
  const handleFindMatches = async () => {
    if (!candidateText.trim()) return;

    setIsLoading(true);
    
    // Add user message
    addMessage(candidateText, 'user');
    
    try {
      const matchingRequest = {
        candidate_text: candidateText,
        user_id: "recruiter_demo"
      };

      const webhookResponse = await callMatchingWebhook(matchingRequest);
      
      // Parse response and display friendly message
      if (webhookResponse.success && webhookResponse.all_matches) {
        const totalMatches = webhookResponse.total_matches || webhookResponse.all_matches.length;
        const topMatches = webhookResponse.all_matches
          .sort((a: any, b: any) => {
            const scoreA = parseInt(a.match_score.replace('%', ''));
            const scoreB = parseInt(b.match_score.replace('%', ''));
            return scoreB - scoreA;
          })
          .slice(0, 10);
        
        setMatches(topMatches);
        addMessage(
          `I found ${totalMatches} matching roles for your CV! Here are the top ${Math.min(10, topMatches.length)} matches:`,
          'bot'
        );
      } else {
        addMessage(webhookResponse.message || 'No matches found for your CV.', 'bot');
        setMatches([]);
      }

      // Clear input
      setCandidateText('');
      
    } catch (error) {
      console.error('Webhook error:', error);
      addMessage(`Error: ${error.message}`, 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view match
  const handleViewMatch = async (match: Match) => {
    try {
      const detailRequest = { role_id: match.role_title };
      const detailResponse = await callMatchDetailWebhook(detailRequest);
      
      // Update match with detailed info
      setSelectedMatch({ ...match, ...detailResponse });
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching match details:', error);
      // Fallback to basic match info
      setSelectedMatch(match);
      setIsDetailModalOpen(true);
    }
  };

  // Handle send intro
  const handleSendIntro = async (match: Match) => {
    try {
      const introRequest = {
        candidate_id: `candidate-${Date.now()}`, // Generate candidate ID
        role_id: match.role_title,
        user_id: demoUser
      };

      const response = await callSendIntroWebhook(introRequest);
      
      toast({
        title: "Introduction sent",
        description: response.message || "Intro queued to send.",
      });
    } catch (error) {
      console.error('Error sending intro:', error);
      toast({
        title: "Error", 
        description: "Failed to send introduction. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle save match
  const handleSaveMatch = (match: Match) => {
    setSelectedMatch(match);
    setIsSaveModalOpen(true);
  };

  // Handle save memory
  const handleSaveMemory = async (data: { title: string; content: string; tags: string }) => {
    setIsSaveMemoryLoading(true);
    
    try {
      const memoryRequest = {
        user_id: demoUser,
        type: 'candidate_note',
        content: data.content,
        source: 'lovable_ui'
      };

      const response = await callSaveMemoryWebhook(memoryRequest);
      
      toast({
        title: "Memory saved",
        description: "Your note has been saved successfully.",
      });
      
      setIsSaveModalOpen(false);
    } catch (error) {
      console.error('Error saving memory:', error);
      toast({
        title: "Error",
        description: "Failed to save memory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaveMemoryLoading(false);
    }
  };

  // Quick actions
  const handleCreatePitch = () => {
    toast({
      title: "Create pitch",
      description: "Pitch creation feature coming soon.",
    });
  };

  const handleQuickSaveMemory = () => {
    setSelectedMatch(null);
    setIsSaveModalOpen(true);
  };

  const handleImportCandidates = () => {
    toast({
      title: "Import candidates",
      description: "Candidate import feature coming soon.",
    });
  };


  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <Sidebar
        activeRole={activeRole}
        demoUser={demoUser}
        onDemoUserChange={setDemoUser}
        onActiveRoleChange={setActiveRole}
        onCreatePitch={handleCreatePitch}
        onSaveMemory={handleQuickSaveMemory}
        onImportCandidates={handleImportCandidates}
      />

      {/* Chat Area */}
      <ChatArea
        messages={messages}
        candidateText={candidateText}
        onCandidateTextChange={setCandidateText}
        onFindMatches={handleFindMatches}
        isLoading={isLoading}
      />

      {/* Matches Panel */}
      <MatchesPanel
        matches={matches}
        isLoading={isLoading}
        onViewMatch={handleViewMatch}
        onSendIntro={handleSendIntro}
        onSaveMatch={handleSaveMatch}
      />

      {/* Match Detail Modal */}
      <MatchDetailModal
        match={selectedMatch}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onSendIntro={handleSendIntro}
        onSave={handleSaveMatch}
      />

      {/* Save Memory Modal */}
      <SaveMemoryModal
        match={selectedMatch}
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveMemory}
        isLoading={isSaveMemoryLoading}
      />

    </div>
  );
}