import { useState, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { ChatArea } from "./ChatArea";
import { MatchesPanel } from "./MatchesPanel";
import { MatchDetailModal } from "./MatchDetailModal";
import { SaveMemoryModal } from "./SaveMemoryModal";
import { FileUploadDropzone } from "./FileUploadDropzone";
import { ChatMessage, Match, DemoUser } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { 
  callMatchingWebhook, 
  callSaveMemoryWebhook, 
  callSendIntroWebhook,
  callMatchDetailWebhook 
} from "@/services/webhooks";


export function SonderApp() {
  console.log('SonderApp component loaded');
  const { toast } = useToast();
  
  // State
  const [demoUser, setDemoUser] = useState<DemoUser>('recruiter_demo');
  const [activeRole, setActiveRole] = useState('Senior Associate — London');
  const [candidateText, setCandidateText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadDropzone, setShowUploadDropzone] = useState(false);
  
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
      
      // Normalize and clean webhook response data
      const normalizeMatches = (rawResp: any) => {
        const resp = Array.isArray(rawResp) ? (rawResp[0] || {}) : (rawResp || {});
        const rawMatches = resp.all_matches || [];

        const parseScore = (s: any): number => {
          if (s === null || s === undefined) return 0;
          if (typeof s === 'number') {
            if (s <= 1) return Math.round(s * 100); // 0.09 -> 9%
            return Math.round(s); // 9 -> 9%
          }
          const str = String(s).trim();
          if (/^[0]\.\d+/.test(str)) return Math.round(parseFloat(str) * 100);
          if (str.endsWith('%')) return Math.round(parseFloat(str.replace('%','')));
          const n = parseFloat(str);
          if (!isNaN(n)) {
            if (n <= 1) return Math.round(n * 100);
            return Math.round(n);
          }
          return 0;
        };

        const normalized = rawMatches.map((m: any) => ({
          role_id: m.role_id || m.id || m.role_title,
          role_title: m.role_title || m.title || 'Untitled Role',
          description: (m.description || m.role_description || ''),
          match_score_num: parseScore(m.match_score || m.score),
          match_score: `${parseScore(m.match_score || m.score)}%`,
          match_category: m.match_category,
          match_reason: m.match_reason || m.reason || '',
          matched_at: m.matched_at || new Date().toISOString(),
          firm_name: m.firm_name,
          firm_location: m.firm_location,
          firm_website: m.firm_website,
          display_title: m.display_title
        }));

        // Dedupe by role_id keeping the highest score
        const map = new Map();
        normalized.forEach((item: any) => {
          const key = item.role_id || item.role_title;
          if (!map.has(key) || item.match_score_num > map.get(key).match_score_num) {
            map.set(key, item);
          }
        });

        return Array.from(map.values())
          .sort((a: any, b: any) => b.match_score_num - a.match_score_num)
          .slice(0, 10);
      };
      
      // Parse response and display friendly message
      if (webhookResponse.success && webhookResponse.all_matches) {
        const totalMatches = webhookResponse.total_matches || webhookResponse.all_matches.length;
        const topMatches = normalizeMatches(webhookResponse);
        
        setMatches(topMatches);
        // Display the main message from webhook response
        addMessage(
          webhookResponse.message || `I found ${totalMatches} matching roles for your CV! Here are the top ${Math.min(10, topMatches.length)} matches:`,
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
    setShowUploadDropzone(true);
  };

  const handleFilesProcessed = async (processedFiles: { file: File; text?: string; fileData?: string }[]) => {
    setIsLoading(true);
    
    // Normalize matches function (extracted to avoid duplication)
    const normalizeMatches = (rawResp: any) => {
      const resp = Array.isArray(rawResp) ? (rawResp[0] || {}) : (rawResp || {});
      const rawMatches = resp.all_matches || [];

      const parseScore = (s: any): number => {
        if (s === null || s === undefined) return 0;
        if (typeof s === 'number') {
          if (s <= 1) return Math.round(s * 100);
          return Math.round(s);
        }
        const str = String(s).trim();
        if (/^[0]\.\d+/.test(str)) return Math.round(parseFloat(str) * 100);
        if (str.endsWith('%')) return Math.round(parseFloat(str.replace('%','')));
        const n = parseFloat(str);
        if (!isNaN(n)) {
          if (n <= 1) return Math.round(n * 100);
          return Math.round(n);
        }
        return 0;
      };

      const normalized = rawMatches.map((m: any) => ({
        role_id: m.role_id || m.id || m.role_title,
        role_title: m.role_title || m.title || 'Untitled Role',
        description: (m.description || m.role_description || ''),
        match_score_num: parseScore(m.match_score || m.score),
        match_score: `${parseScore(m.match_score || m.score)}%`,
        match_category: m.match_category,
        match_reason: m.match_reason || m.reason || '',
        matched_at: m.matched_at || new Date().toISOString(),
        firm_name: m.firm_name,
        firm_location: m.firm_location,
        firm_website: m.firm_website,
        display_title: m.display_title
      }));

      const map = new Map();
      normalized.forEach((item: any) => {
        const key = item.role_id || item.role_title;
        if (!map.has(key) || item.match_score_num > map.get(key).match_score_num) {
          map.set(key, item);
        }
      });

      return Array.from(map.values())
        .sort((a: any, b: any) => b.match_score_num - a.match_score_num)
        .slice(0, 10);
    };

    // Process each successfully uploaded file
    for (const { file, text, fileData } of processedFiles) {
      try {
        // Add user message showing file name
        addMessage(`Uploaded CV: ${file.name}`, 'user');
        
        // Create matching request based on file type
        const matchingRequest = fileData 
          ? {
              // PDF file: send base64 data for backend processing
              file_data: fileData,
              file_name: file.name,
              user_id: "recruiter_demo"
            }
          : {
              // Text file: send extracted text
              candidate_text: text,
              user_id: "recruiter_demo"
            };

        const webhookResponse = await callMatchingWebhook(matchingRequest);
        
        if (webhookResponse.success && webhookResponse.all_matches) {
          const totalMatches = webhookResponse.total_matches || webhookResponse.all_matches.length;
          const topMatches = normalizeMatches(webhookResponse);
          
          setMatches(topMatches);
          // Display the main message from webhook response
          addMessage(
            webhookResponse.message || `I found ${totalMatches} matching roles for ${file.name}! Here are the top ${Math.min(10, topMatches.length)} matches:`,
            'bot'
          );
        } else {
          addMessage(webhookResponse.message || `No matches found for ${file.name}.`, 'bot');
        }

      } catch (error) {
        console.error('Webhook error for file:', file.name, error);
        addMessage(`Error processing ${file.name}: ${error.message}`, 'bot');
      }
    }
    
    setIsLoading(false);
  };


  return (
    <div className="h-screen flex bg-background">
      {/* Upload Dropzone Overlay */}
      {showUploadDropzone && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Upload CV Files</h2>
                <button
                  onClick={() => setShowUploadDropzone(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <FileUploadDropzone
                onFilesProcessed={handleFilesProcessed}
                onUploadComplete={() => setShowUploadDropzone(false)}
                maxFiles={10}
                maxSize={10}
              />
            </div>
          </div>
        </div>
      )}

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