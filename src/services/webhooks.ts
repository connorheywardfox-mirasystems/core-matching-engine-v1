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

// Webhook URLs - replace with real n8n endpoints when ready
const WEBHOOK_BASE = 'https://<n8n-host>/webhook';

const ENDPOINTS = {
  matching: `${WEBHOOK_BASE}/matching`,
  memory: `${WEBHOOK_BASE}/memory-ingest`,
  sendIntro: `${WEBHOOK_BASE}/send-intro`,
  matchDetail: `${WEBHOOK_BASE}/match-detail`
};

// Console logger for debugging
const logWebhookCall = (endpoint: string, payload: any, response: any, isMock = false) => {
  console.group(`🔗 Webhook Call ${isMock ? '(MOCK)' : ''}`);
  console.log('Endpoint:', endpoint);
  console.log('Payload:', payload);
  console.log('Response:', response);
  console.groupEnd();
};

export async function callMatchingWebhook(request: MatchingRequest): Promise<MatchingResponse[]> {
  try {
    const response = await fetch(ENDPOINTS.matching, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    logWebhookCall(ENDPOINTS.matching, request, data);
    return data;
  } catch (error) {
    console.warn('Webhook failed, using mock data:', error);
    
    // Simulate network delay for realistic demo
    await simulateNetworkDelay();
    
    // Return top 5 mock matches
    const mockResponse = mockMatches.slice(0, 5);
    logWebhookCall(ENDPOINTS.matching, request, mockResponse, true);
    
    return mockResponse;
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
    console.warn('Match detail webhook failed, using mock response:', error);
    
    // Find match in mock data
    const match = mockMatches.find(m => m.role_id === request.role_id);
    if (!match) throw new Error('Match not found');
    
    // Simulate network delay
    await simulateNetworkDelay(200, 400);
    
    const mockResponse: MatchDetailResponse = {
      ...match,
      long_description: match.long_description || match.reason
    };
    
    logWebhookCall(ENDPOINTS.matchDetail, request, mockResponse, true);
    return mockResponse;
  }
}