export interface Match {
  role_title: string;
  match_score: string;
  description: string;
  match_reason: string;
  matched_at: string;
  firm_name?: string;
  firm_location?: string;
  firm_website?: string;
  display_title?: string;
}

export interface MatchingRequest {
  candidate_text?: string;
  file_data?: string;
  file_name?: string;
  role_id?: string | null;
  user_id: string;
}

export interface MatchingResponse extends Match {}

export interface SaveMemoryRequest {
  user_id: string;
  type: string;
  content: string;
  source: string;
}

export interface SaveMemoryResponse {
  success: boolean;
  id: string;
}

export interface SendIntroRequest {
  candidate_id: string;
  role_id: string;
  user_id: string;
}

export interface SendIntroResponse {
  success: boolean;
  status: string;
  message: string;
}

export interface MatchDetailRequest {
  role_id: string;
}

export interface MatchDetailResponse extends Match {
  long_description: string;
}

export type DemoUser = 'recruiter_demo' | 'admin_demo' | 'viewer_demo';

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}