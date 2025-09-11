import { 
  MatchingRequest, 
  MatchingResponse, 
  SaveMemoryRequest, 
  SaveMemoryResponse,
  SendIntroRequest,
  SendIntroResponse,
  MatchDetailRequest,
  MatchDetailResponse
} from '@/types';
import { mockMatches, simulateNetworkDelay } from './mockData';

// Webhook URLs - using your n8n endpoint
const ENDPOINTS = {
  matching: 'https://connorheywardfox.app.n8n.cloud/webhook/52249d03-6351-4fff-903a-0fbb2def2d28',
  memory: `https://connorheywardfox.app.n8n.cloud/webhook/memory-ingest`,
  sendIntro: `https://connorheywardfox.app.n8n.cloud/webhook/send-intro`,
  matchDetail: `https://connorheywardfox.app.n8n.cloud/webhook/match-detail`
};

// Console logger for debugging
const logWebhookCall = (endpoint: string, payload: any, response: any, isMock = false) => {
  console.group(`🔗 Webhook Call ${isMock ? '(MOCK)' : ''}`);
  console.log('Endpoint:', endpoint);
  console.log('Payload:', payload);
  console.log('Response:', response);
  console.groupEnd();
};

export async function callMatchingWebhook(request: MatchingRequest): Promise<any> {
  console.log('🚀 Calling matching webhook:', ENDPOINTS.matching);
  console.log('📤 Request payload:', request);
  
  try {
    const response = await fetch(ENDPOINTS.matching, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('📡 Response status:', response.status, response.statusText);

    // Get raw text first for debugging
    const text = await response.text();
    console.log('📄 Raw response text:', text);
    
    try {
      // Parse JSON
      let data = JSON.parse(text);
      
      // CRITICAL: Always unwrap array
      if (Array.isArray(data) && data.length > 0) {
        data = data[0];
      }
      
      console.log('📋 Parsed response data:', data);
      
      // Validate structure - accept if it has all_matches property (even if empty)
      if (data && typeof data === 'object' && 'all_matches' in data) {
        console.log('✅ Valid response with', data.total_matches || data.all_matches?.length || 0, 'matches');
        logWebhookCall(ENDPOINTS.matching, request, data);
        return data;
      }
      
      // Check for error responses that are still valid
      if (data && typeof data === 'object' && data.error) {
        console.log('⚠️ Webhook returned error response:', data.error);
        logWebhookCall(ENDPOINTS.matching, request, data);
        return data;
      }
      
      // Unexpected structure but parseable - return empty matches instead of failing
      console.warn('⚠️ Unexpected response structure, returning empty matches:', data);
      const fallbackResponse = {
        success: true,
        total_matches: 0,
        all_matches: [],
        message: 'Could not parse response structure'
      };
      logWebhookCall(ENDPOINTS.matching, request, fallbackResponse, true);
      return fallbackResponse;
      
    } catch (parseError) {
      console.error('💥 JSON parse error:', parseError);
      // Return empty matches instead of failing completely
      const fallbackResponse = {
        success: true,
        total_matches: 0,
        all_matches: [],
        message: 'Could not parse JSON response'
      };
      logWebhookCall(ENDPOINTS.matching, request, fallbackResponse, true);
      return fallbackResponse;
    }
    
  } catch (error) {
    console.error('💥 Matching webhook error:', error);
    throw error;
  }
}

export async function callSaveMemoryWebhook(request: SaveMemoryRequest): Promise<SaveMemoryResponse> {
  try {
    const response = await fetch(ENDPOINTS.memory, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    logWebhookCall(ENDPOINTS.memory, request, data);
    return data;
  } catch (error) {
    console.warn('Save memory webhook failed, using mock response:', error);
    
    // Simulate network delay
    await simulateNetworkDelay(300, 600);
    
    const mockResponse = { 
      success: true, 
      id: `memory-${Date.now()}` 
    };
    
    logWebhookCall(ENDPOINTS.memory, request, mockResponse, true);
    return mockResponse;
  }
}

export async function callSendIntroWebhook(request: SendIntroRequest): Promise<SendIntroResponse> {
  try {
    const response = await fetch(ENDPOINTS.sendIntro, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    logWebhookCall(ENDPOINTS.sendIntro, request, data);
    return data;
  } catch (error) {
    console.warn('Send intro webhook failed, using mock response:', error);
    
    // Simulate network delay
    await simulateNetworkDelay(400, 800);
    
    const mockResponse = {
      success: true,
      status: 'queued',
      message: 'Intro queued to send.'
    };
    
    logWebhookCall(ENDPOINTS.sendIntro, request, mockResponse, true);
    return mockResponse;
  }
}

export async function callMatchDetailWebhook(request: MatchDetailRequest): Promise<MatchDetailResponse> {
  try {
    const response = await fetch(ENDPOINTS.matchDetail, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    logWebhookCall(ENDPOINTS.matchDetail, request, data);
    return data;
  } catch (error) {
    console.warn('Match detail webhook failed:', error);
    throw error;
  }
}