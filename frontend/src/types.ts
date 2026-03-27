/**
 * TypeScript type definitions for the Signal-to-Opportunity Analysis system.
 */

export interface Signal {
  id: string;
  content: string;
  category: string;
  source: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  source_signals: string[];
  created_at: string;
}

export interface Assessment {
  opportunity_id: string;
  desirability_score: number;
  feasibility_score: number;
  viability_score: number;
  desirability_reasoning: string;
  feasibility_reasoning: string;
  viability_reasoning: string;
  created_at: string;
}

export type DecisionType = 'go' | 'hold' | 'drop';

export interface Decision {
  opportunity_id: string;
  decision: DecisionType;
  reasoning: string;
  timestamp: string;
}

export interface WorkflowSession {
  session_id: string;
  current_step: string;
  signals: Signal[];
  opportunities: Opportunity[];
  selected_opportunity_ids: string[];
  assessments: Assessment[];
  decisions: Decision[];
  final_portfolio: Record<string, any> | null;
  step_status: Record<string, StepStatus>;
  created_at: string;
  updated_at: string;
}

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface WorkflowStep {
  key: string;
  label: string;
  description: string;
  status: StepStatus;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface SessionCreateResponse {
  session_id: string;
  signals_count: number;
  message: string;
}

export interface OpportunityGenerationResponse {
  opportunities: Opportunity[];
  count: number;
  message: string;
}

export interface OpportunitySelectionRequest {
  selected_ids: string[];
}

export interface OpportunitySelectionResponse {
  selected_count: number;
  message: string;
}