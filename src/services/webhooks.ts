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

    // Parse response regardless of status code
    const data = await response.json();
    const result = Array.isArray(data) ? data[0] : data;
    
    console.log('📋 Parsed response data:', result);
    
    // If we have valid match data, it's a success regardless of HTTP status
    if (result && result.success && result.all_matches) {
      console.log('✅ Matching webhook success - valid data structure found');
      logWebhookCall(ENDPOINTS.matching, request, result);
      return result;
    }
    
    // Only treat as error if data is truly invalid
    if (!result || (!result.all_matches && !result.error)) {
      console.error('❌ Invalid response structure:', result);
      throw new Error('Invalid response structure');
    }
    
    // If we get here, we have some data but it might be an error response
    console.log('⚠️ Webhook returned error response:', result);
    logWebhookCall(ENDPOINTS.matching, request, result);
    return result;
    
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