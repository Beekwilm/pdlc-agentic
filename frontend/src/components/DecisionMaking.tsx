import React, { useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface Assessment {
  opportunity_id: string;
  desirability_score: number;
  feasibility_score: number;
  viability_score: number;
  desirability_reasoning: string;
  feasibility_reasoning: string;
  viability_reasoning: string;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  source_signals: string[];
}

interface WorkflowSession {
  session_id: string;
  current_step: string;
  opportunities: Opportunity[];
  assessments: Assessment[];
  selected_opportunity_ids: string[];
}

interface DecisionMakingProps {
  session: WorkflowSession;
  onDecisionsComplete: (decisions: any[]) => void;
  onGoBack: () => void;
  loading: boolean;
}

const DecisionMaking: React.FC<DecisionMakingProps> = ({
  session,
  onDecisionsComplete,
  onGoBack,
  loading
}) => {
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [reasoning, setReasoning] = useState<Record<string, string>>({});

  const handleDecision = (opportunityId: string, decision: string) => {
    setDecisions(prev => ({ ...prev, [opportunityId]: decision }));
  };

  const handleMassApprove = (decision: 'go' | 'hold' | 'drop') => {
    const massDecisions: Record<string, string> = {};
    session.selected_opportunity_ids.forEach(id => {
      massDecisions[id] = decision;
    });
    setDecisions(massDecisions);
  };

  const getScoringSummary = (assessment: Assessment) => {
    const avgScore = (assessment.desirability_score + assessment.feasibility_score + assessment.viability_score) / 3;
    
    if (avgScore >= 8.5) return "Excellent opportunity with strong potential across all dimensions";
    if (avgScore >= 7.5) return "Strong opportunity with good alignment and feasibility";
    if (avgScore >= 6.5) return "Moderate opportunity with some challenges to address";
    if (avgScore >= 5.5) return "Marginal opportunity requiring significant improvements";
    if (avgScore >= 4.0) return "Weak opportunity with major concerns in multiple areas";
    return "Poor opportunity with fundamental issues across dimensions";
  };

  const handleReasoningChange = (opportunityId: string, text: string) => {
    setReasoning(prev => ({ ...prev, [opportunityId]: text }));
  };

  const handleSubmit = () => {
    const decisionList = Object.entries(decisions).map(([opportunityId, decision]) => ({
      opportunity_id: opportunityId,
      decision,
      reasoning: reasoning[opportunityId] || ''
    }));
    onDecisionsComplete(decisionList);
  };

  const getAssessment = (opportunityId: string) => {
    return session.assessments.find(a => a.opportunity_id === opportunityId);
  };

  const getOpportunity = (opportunityId: string) => {
    return session.opportunities.find(o => o.id === opportunityId);
  };

  const allDecisionsMade = session.selected_opportunity_ids.every(id => decisions[id]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <CheckCircle className="h-7 w-7 text-green-500 mr-3" />
            Make Strategic Decisions
          </h2>
          <p className="text-gray-600 mt-2">
            Review AI assessments and decide the strategic direction for each opportunity: Go (implement), Hold (defer), or Drop (reject).
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-900">
            {Object.keys(decisions).length} / {session.selected_opportunity_ids.length}
          </div>
          <div className="text-sm text-gray-500">
            Decisions Made
          </div>
        </div>
      </div>

      {/* Mass Approve Section */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Apply to all opportunities:</span>
          <button
            onClick={() => handleMassApprove('go')}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
          >
            Approve All (GO)
          </button>
          <button
            onClick={() => handleMassApprove('hold')}
            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-colors"
          >
            Hold All
          </button>
          <button
            onClick={() => handleMassApprove('drop')}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
          >
            Drop All
          </button>
          <button
            onClick={() => setDecisions({})}
            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {session.selected_opportunity_ids.map(oppId => {
          const opportunity = getOpportunity(oppId);
          const assessment = getAssessment(oppId);
          
          if (!opportunity || !assessment) return null;

          const avgScore = (assessment.desirability_score + assessment.feasibility_score + assessment.viability_score) / 3;

          return (
            <div key={oppId} className="border rounded-lg p-6 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-grow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {opportunity.title}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {opportunity.description}
                  </p>
                  <p className="text-sm text-blue-600 font-medium">
                    {getScoringSummary(assessment)}
                  </p>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {avgScore.toFixed(1)}/10
                  </div>
                  <div className="text-sm text-gray-500">Average Score</div>
                </div>
              </div>

              {/* Assessment Scores */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {assessment.desirability_score}/10
                  </div>
                  <div className="text-sm text-gray-600">Desirability</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {assessment.desirability_reasoning.substring(0, 60)}...
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {assessment.feasibility_score}/10
                  </div>
                  <div className="text-sm text-gray-600">Feasibility</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {assessment.feasibility_reasoning.substring(0, 60)}...
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">
                    {assessment.viability_score}/10
                  </div>
                  <div className="text-sm text-gray-600">Viability</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {assessment.viability_reasoning.substring(0, 60)}...
                  </p>
                </div>
              </div>

              {/* Decision Buttons */}
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-sm font-medium text-gray-700">Decision:</span>
                {['go', 'hold', 'drop'].map(decision => (
                  <button
                    key={decision}
                    onClick={() => handleDecision(oppId, decision)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      decisions[oppId] === decision
                        ? decision === 'go' ? 'bg-green-500 text-white' :
                          decision === 'hold' ? 'bg-yellow-500 text-white' :
                          'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {decision.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Reasoning Input */}
              {decisions[oppId] && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reasoning (optional):
                  </label>
                  <textarea
                    value={reasoning[oppId] || ''}
                    onChange={(e) => handleReasoningChange(oppId, e.target.value)}
                    placeholder={`Why did you choose to ${decisions[oppId]} this opportunity?`}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {!allDecisionsMade && 'Make decisions for all opportunities to continue'}
          {allDecisionsMade && 'All decisions made. Ready to save and proceed.'}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onGoBack}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>← Back to Selection</span>
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading || !allDecisionsMade}
            className="btn-primary flex items-center space-x-2"
          >
            <span>Save Decisions</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DecisionMaking;