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
  callMatchDetailWebhook,
  callPitchGeneratorWebhook
} from "@/services/webhooks";
import { generateMatchesPDF } from "@/lib/pdfGenerator";


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
  const [isPitchLoading, setIsPitchLoading] = useState(false);

  // Generate unique message ID
  const generateMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Helper function to get score color based on match score
  const getScoreColor = (score: string | number) => {
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    if (numScore >= 75) return 'text-green-600';
    if (numScore >= 60) return 'text-blue-600';
    return 'text-orange-600';
  };

  // Shared function to display matches from webhook response
  const displayMatches = (webhookResponse: any, candidateIdentifier?: string) => {
    console.log('🔍 displayMatches called with:', { 
      success: webhookResponse?.success,
      total_matches: webhookResponse?.total_matches,
      candidate_name: webhookResponse?.candidate_name,
      all_matches_count: webhookResponse?.all_matches?.length || 0,
      message: webhookResponse?.message
    });

    // Handle consistent JSON object structure
    if (!webhookResponse?.success) {
      console.log('❌ Webhook response indicates failure');
      const candidateName = webhookResponse?.candidate_name || candidateIdentifier || 'candidate';
      addMessage(`Error processing matches for ${candidateName}.`, 'bot');
      setMatches([]);
      return;
    }

    const matchesArray = webhookResponse?.all_matches || [];
    console.log('📊 Processing matches:', { 
      total_matches: webhookResponse?.total_matches,
      all_matches_length: matchesArray.length,
      candidate_name: webhookResponse?.candidate_name
    });
    
    // Normalize and clean webhook response data
    const normalizeMatches = (rawResp: any) => {
      const rawMatches = rawResp.all_matches || [];
      
      if (!Array.isArray(rawMatches) || rawMatches.length === 0) {
        return [];
      }
      
      // Dedupe by role_title + firm_name + firm_location combination
      const uniqueMatches = new Map();
      
      rawMatches.forEach(match => {
        // Use role_id for deduplication if available
        const roleId = match.role_id ?? match.match_id ?? match.id;
        const key = roleId || `${match.role_title || ''}-${match.firm_name || ''}-${match.firm_location || ''}`;
        
        if (!uniqueMatches.has(key)) {
          // Ensure all required fields exist with defaults
          const cleanMatch = {
            role_id: roleId, // Preserve role_id
            role_title: match.role_title || 'Untitled Role',
            match_score: match.match_score || '0',
            match_category: match.match_category || 'General',
            description: match.description || 'No description available',
            match_reason: match.match_reason || 'No reason provided',
            matched_at: match.matched_at || new Date().toISOString(),
            firm_name: match.firm_name || 'Unknown Company',
            firm_location: match.firm_location || 'Location not specified',
            firm_website: match.firm_website || '',
            display_title: match.display_title || match.role_title || 'Untitled Role'
          };
          
          console.log('🔑 Normalized match with role_id:', cleanMatch.role_id, 'for role:', cleanMatch.role_title);
          uniqueMatches.set(key, cleanMatch);
        }
      });
      
      // Convert back to array, sort by score, and take top 10
      return Array.from(uniqueMatches.values())
        .sort((a, b) => {
          const scoreA = parseFloat(a.match_score) || 0;
          const scoreB = parseFloat(b.match_score) || 0;
          return scoreB - scoreA;
        })
        .slice(0, 10);
    };
    
    // Display matches based on webhook response
    try {
      if (matchesArray.length > 0) {
        const totalMatches = webhookResponse?.total_matches ?? matchesArray.length;
        const topMatches = normalizeMatches({ all_matches: matchesArray });
        const candidateName = webhookResponse?.candidate_name || candidateIdentifier || 'this candidate';
        
        console.log('✅ Setting matches:', { 
          totalMatches, 
          topMatchesCount: topMatches.length, 
          candidateName,
          message: webhookResponse?.message
        });
        
        setMatches(topMatches);
        
        // Show only the standardized message format
        addMessage(
          `Found ${totalMatches} potential roles for ${candidateName} - Showing recommended matches:`,
          'bot'
        );
      } else {
        const candidateName = webhookResponse?.candidate_name || candidateIdentifier || 'this candidate';
        console.log('❌ No matches found for:', candidateName);
        addMessage(`No suitable matches found for ${candidateName}.`, 'bot');
        setMatches([]);
      }
    } catch (error) {
      console.error('❌ Error in displayMatches:', error, { webhookResponse });
      const candidateName = candidateIdentifier || 'candidate';
      addMessage(`Error processing matches for ${candidateName}. Please try again.`, 'bot');
      setMatches([]);
    }
  };

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
      console.log('📝 Text input webhook response:', webhookResponse);
      
      // Always display whatever matches are in the response
      displayMatches(webhookResponse);

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
    console.log('🔍 Viewing match with role_id:', match.role_id);
    try {
      const detailRequest = { role_id: match.role_id };
      const detailResponse = await callMatchDetailWebhook(detailRequest);
      
      // Preserve role_id from the original match
      const roleId = match.role_id ?? detailResponse.role_id;
      const enrichedMatch = { ...match, ...detailResponse, role_id: roleId };
      console.log('✅ Setting selectedMatch with role_id:', enrichedMatch.role_id);
      setSelectedMatch(enrichedMatch);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching match details:', error);
      // Fallback to basic match info
      console.log('⚠️ Fallback - using original match with role_id:', match.role_id);
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

  // Handle create pitch
  const handleCreatePitch = async (match: Match) => {
    if (!match.role_id) {
      toast({
        title: "Error",
        description: "Match ID is required to generate pitches.",
        variant: "destructive",
      });
      return;
    }

    setIsPitchLoading(true);
    
    // Add loading message to chat
    const loadingMsg: ChatMessage = {
      id: generateMessageId(),
      type: 'bot',
      content: 'Generating pitches... ⏳',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMsg]);
    
    // Close the modal
    setIsDetailModalOpen(false);

    try {
      const pitchRequest = {
        match_id: match.role_id,
        pitch_type: "all" as const
      };

      const response = await callPitchGeneratorWebhook(pitchRequest);
      
      if (response.success) {
        // Remove loading message and add pitch message
        setMessages(prev => {
          const withoutLoading = prev.filter(m => m.id !== loadingMsg.id);
          return [
            ...withoutLoading,
            {
              id: generateMessageId(),
              type: 'bot',
              content: response.formatted_text,
              timestamp: new Date(),
              pitchData: {
                formattedText: response.formatted_text,
                pitches: response.pitches || [],
                matchId: match.role_id!,
                suggestedActions: response.suggested_actions || []
              }
            }
          ];
        });

        toast({
          title: "Pitches generated",
          description: `Generated ${response.generated} pitch variations successfully.`,
        });
      } else {
        // Remove loading and show error
        setMessages(prev => {
          const withoutLoading = prev.filter(m => m.id !== loadingMsg.id);
          return [
            ...withoutLoading,
            {
              id: generateMessageId(),
              type: 'bot',
              content: 'Failed to generate pitches. Please try again.',
              timestamp: new Date()
            }
          ];
        });
      }
    } catch (error) {
      console.error('Error generating pitches:', error);
      
      // Remove loading and show error
      setMessages(prev => {
        const withoutLoading = prev.filter(m => m.id !== loadingMsg.id);
        return [
          ...withoutLoading,
          {
            id: generateMessageId(),
            type: 'bot',
            content: 'Failed to generate pitches. Please try again.',
            timestamp: new Date()
          }
        ];
      });

      toast({
        title: "Error",
        description: "Failed to generate pitches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPitchLoading(false);
    }
  };

  const handleCopyPitch = (pitchType: string, content: string) => {
    navigator.clipboard.writeText(content);
    
    const pitchTypeLabel = pitchType.charAt(0).toUpperCase() + pitchType.slice(1);
    toast({
      title: "Copied to clipboard!",
      description: `${pitchTypeLabel} pitch copied successfully.`,
    });
  };

  const handleRegeneratePitch = (matchId: string) => {
    // Find the match and trigger pitch generation again
    const match = matches.find(m => m.role_id === matchId);
    if (match) {
      handleCreatePitch(match);
    }
  };

  // Quick actions
  const handleQuickCreatePitch = () => {
    toast({
      title: "Create pitch",
      description: "Please select a match first to create pitches.",
    });
  };

  const handleQuickSaveMemory = () => {
    setSelectedMatch(null);
    setIsSaveModalOpen(true);
  };

  const handleImportCandidates = () => {
    setShowUploadDropzone(true);
  };

  // Handle download PDF
  const handleDownloadPDF = () => {
    if (matches.length === 0) return;
    
    try {
      generateMatchesPDF(matches);
      toast({
        title: "PDF Downloaded",
        description: `Downloaded ${matches.length} matches as PDF.`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFilesProcessed = async (processedFiles: { file: File; text?: string; fileData?: string }[]) => {
    setIsLoading(true);
    
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
        console.log('📄 File upload webhook response for', file.name, ':', webhookResponse);
        
        // Always display whatever matches are in the response
        displayMatches(webhookResponse, file.name);

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
        onCreatePitch={handleQuickCreatePitch}
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
        onCopyPitch={handleCopyPitch}
        onRegeneratePitch={handleRegeneratePitch}
      />

      {/* Matches Panel */}
      <MatchesPanel
        matches={matches}
        isLoading={isLoading}
        onViewMatch={handleViewMatch}
        onSendIntro={handleSendIntro}
        onSaveMatch={handleSaveMatch}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* Match Detail Modal */}
      <MatchDetailModal
        match={selectedMatch}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onCreatePitch={handleCreatePitch}
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