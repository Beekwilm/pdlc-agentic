/**
 * API client for the Signal-to-Opportunity Analysis backend.
 */

import axios from 'axios';
import {
  WorkflowSession,
  SessionCreateResponse,
  OpportunityGenerationResponse,
  OpportunitySelectionRequest,
  OpportunitySelectionResponse,
} from './types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 minutes for LLM operations (increased from 30 seconds)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export class ApiClient {
  /**
   * Create a new workflow session
   */
  static async createSession(): Promise<SessionCreateResponse> {
    const response = await api.post<SessionCreateResponse>('/sessions');
    return response.data;
  }

  /**
   * Get session data and current status
   */
  static async getSession(sessionId: string): Promise<WorkflowSession> {
    const response = await api.get<WorkflowSession>(`/sessions/${sessionId}`);
    return response.data;
  }

  /**
   * Generate opportunities from signals
   */
  static async generateOpportunities(sessionId: string): Promise<OpportunityGenerationResponse> {
    const response = await api.post<OpportunityGenerationResponse>(
      `/sessions/${sessionId}/generate-opportunities`
    );
    return response.data;
  }

  /**
   * Select opportunities for assessment
   */
  static async selectOpportunities(
    sessionId: string,
    selectedIds: string[]
  ): Promise<OpportunitySelectionResponse> {
    const request: OpportunitySelectionRequest = { selected_ids: selectedIds };
    const response = await api.post<OpportunitySelectionResponse>(
      `/sessions/${sessionId}/select-opportunities`,
      request
    );
    return response.data;
  }

  /**
   * Assess selected opportunities
   */
  static async assessOpportunities(sessionId: string): Promise<any> {
    const response = await api.post(`/sessions/${sessionId}/assess-opportunities`);
    return response.data;
  }

  /**
   * Make decisions for assessed opportunities
   */
  static async makeDecisions(sessionId: string, decisions: any[]): Promise<any> {
    const response = await api.post(`/sessions/${sessionId}/make-decisions`, decisions);
    return response.data;
  }

  /**
   * Generate final portfolio
   */
  static async generatePortfolio(sessionId: string): Promise<any> {
    const response = await api.post(`/sessions/${sessionId}/generate-portfolio`);
    return response.data;
  }

  /**
   * Check API health
   */
  static async healthCheck(): Promise<{ status: string; llm_status: string }> {
    const response = await api.get('/health');
    return response.data;
  }

  /**
   * Poll for session updates with retry logic
   */
  static async pollSessionUpdates(
    sessionId: string,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<WorkflowSession> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.getSession(sessionId);
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }
    
    throw lastError || new Error('Failed to poll session updates');
  }
}

export default ApiClient;