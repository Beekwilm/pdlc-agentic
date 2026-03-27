import React, { useState } from 'react';
import { Play, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { WorkflowSession } from '../types';
import OpportunitySelection from './OpportunitySelection';
import DecisionMaking from './DecisionMaking';
import BackgroundActivityIndicator from './BackgroundActivityIndicator';
import InteractiveSignalSummary from './InteractiveSignalSummary';

// IndividualPortfolioDisplay component for showing portfolio details for each opportunity
interface IndividualPortfolioDisplayProps {
  portfolio: any;
}

const IndividualPortfolioDisplay: React.FC<IndividualPortfolioDisplayProps> = ({ portfolio }) => {
  if (!portfolio) return null;

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Implementation Plan
      </h4>

      {/* Executive Summary */}
      {portfolio.executive_summary && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-3">Executive Summary</h5>
          <div className="space-y-2 text-sm text-blue-800">
            {typeof portfolio.executive_summary === 'object' ? (
              Object.entries(portfolio.executive_summary).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium capitalize">{key.replace('_', ' ')}: </span>
                  <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                </div>
              ))
            ) : (
              <p>{portfolio.executive_summary}</p>
            )}
          </div>
        </div>
      )}

      {/* Implementation Roadmap */}
      {portfolio.implementation_roadmap && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h5 className="font-medium text-green-900 mb-3">Implementation Roadmap</h5>
          <div className="space-y-3 text-sm">
            {typeof portfolio.implementation_roadmap === 'object' && !Array.isArray(portfolio.implementation_roadmap) ? (
              Object.entries(portfolio.implementation_roadmap).map(([phase, details]: [string, any]) => (
                <div key={phase} className="bg-white p-3 rounded border">
                  <h6 className="font-medium text-green-800 capitalize mb-2">{phase.replace('_', ' ')}</h6>
                  {typeof details === 'object' ? (
                    <div className="space-y-1 text-xs text-green-700">
                      {Object.entries(details).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium capitalize">{key.replace('_', ' ')}: </span>
                          <span>{Array.isArray(value) ? value.join(', ') : (typeof value === 'string' ? value : JSON.stringify(value))}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-green-700">{details}</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-green-800">{JSON.stringify(portfolio.implementation_roadmap)}</p>
            )}
          </div>
        </div>
      )}

      {/* Resource Requirements */}
      {portfolio.resource_requirements && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <h5 className="font-medium text-purple-900 mb-3">Resource Requirements</h5>
          <div className="text-sm text-purple-800">
            {typeof portfolio.resource_requirements === 'object' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(portfolio.resource_requirements).map(([key, value]) => (
                  <div key={key} className="bg-white p-3 rounded border">
                    <span className="font-medium capitalize block">{key.replace('_', ' ')}</span>
                    <span className="text-xs">{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>{portfolio.resource_requirements}</p>
            )}
          </div>
        </div>
      )}

      {/* Success Metrics */}
      {portfolio.success_metrics && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h5 className="font-medium text-yellow-900 mb-3">Success Metrics</h5>
          <div className="text-sm text-yellow-800">
            {typeof portfolio.success_metrics === 'object' && !Array.isArray(portfolio.success_metrics) ? (
              <div className="space-y-3">
                {Object.entries(portfolio.success_metrics).map(([category, metrics]: [string, any]) => (
                  <div key={category} className="bg-white p-3 rounded border">
                    <h6 className="font-medium capitalize mb-2">{category.replace('_', ' ')}</h6>
                    {Array.isArray(metrics) ? (
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        {metrics.map((metric: any, index: number) => (
                          <li key={index}>{typeof metric === 'string' ? metric : JSON.stringify(metric)}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs">{typeof metrics === 'string' ? metrics : JSON.stringify(metrics)}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>{JSON.stringify(portfolio.success_metrics)}</p>
            )}
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      {portfolio.risk_assessment && (
        <div className="bg-red-50 p-4 rounded-lg">
          <h5 className="font-medium text-red-900 mb-3">Risk Assessment</h5>
          <div className="text-sm text-red-800">
            {typeof portfolio.risk_assessment === 'object' ? (
              <div className="space-y-3">
                {Object.entries(portfolio.risk_assessment).map(([key, value]) => (
                  <div key={key} className="bg-white p-3 rounded border">
                    <span className="font-medium capitalize block">{key.replace('_', ' ')}</span>
                    <div className="text-xs mt-1">
                      {Array.isArray(value) ? (
                        <ul className="list-disc list-inside space-y-1">
                          {value.map((item: any, index: number) => (
                            <li key={index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                          ))}
                        </ul>
                      ) : (
                        <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>{portfolio.risk_assessment}</p>
            )}
          </div>
        </div>
      )}

      {/* Monitoring Plan */}
      {portfolio.monitoring_plan && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-3">Monitoring Plan</h5>
          <div className="text-sm text-gray-700">
            {typeof portfolio.monitoring_plan === 'object' ? (
              <div className="space-y-2">
                {Object.entries(portfolio.monitoring_plan).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium capitalize">{key.replace('_', ' ')}: </span>
                    <span>{Array.isArray(value) ? value.join(', ') : (typeof value === 'string' ? value : JSON.stringify(value))}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>{portfolio.monitoring_plan}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// OpportunityTabs component for displaying selected opportunities
interface OpportunityTabsProps {
  session: WorkflowSession;
}

const OpportunityTabs: React.FC<OpportunityTabsProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<string>(session.selected_opportunity_ids[0] || '');

  const getOpportunity = (opportunityId: string) => {
    return session.opportunities.find(o => o.id === opportunityId);
  };

  const getAssessment = (opportunityId: string) => {
    return session.assessments.find(a => a.opportunity_id === opportunityId);
  };

  const getDecision = (opportunityId: string) => {
    return session.decisions.find(d => d.opportunity_id === opportunityId);
  };

  if (session.selected_opportunity_ids.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Opportunities</h3>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {session.selected_opportunity_ids.map((oppId, index) => {
            const opportunity = getOpportunity(oppId);
            const decision = getDecision(oppId);
            
            if (!opportunity) return null;
            
            return (
              <button
                key={oppId}
                onClick={() => setActiveTab(oppId)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === oppId
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>Opportunity {index + 1}</span>
                {decision && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    decision.decision === 'go' ? 'bg-green-100 text-green-700' :
                    decision.decision === 'hold' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {decision.decision.toUpperCase()}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab && (() => {
        const opportunity = getOpportunity(activeTab);
        const assessment = getAssessment(activeTab);
        const decision = getDecision(activeTab);
        
        if (!opportunity || !assessment) return null;

        const avgScore = (assessment.desirability_score + assessment.feasibility_score + assessment.viability_score) / 3;

        return (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {/* Opportunity Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-grow">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {opportunity.title}
                </h4>
                <p className="text-gray-600 mb-3">
                  {opportunity.description}
                </p>
                {decision && (
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm font-medium text-gray-700">Decision:</span>
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                      decision.decision === 'go' ? 'bg-green-100 text-green-700' :
                      decision.decision === 'hold' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {decision.decision.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-4 text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {avgScore.toFixed(1)}/10
                </div>
                <div className="text-sm text-gray-500">Average Score</div>
              </div>
            </div>

            {/* Show individual portfolio for GO opportunities */}
            {decision?.decision === 'go' && session.final_portfolio?.individual_portfolios?.[activeTab] && (
              <div className="mb-6">
                <IndividualPortfolioDisplay 
                  portfolio={session.final_portfolio.individual_portfolios[activeTab]}
                />
              </div>
            )}

            {/* Assessment Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-blue-900">Desirability</h5>
                  <span className="text-2xl font-bold text-blue-600">
                    {assessment.desirability_score}/10
                  </span>
                </div>
                <p className="text-sm text-blue-800">
                  {assessment.desirability_reasoning}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-green-900">Feasibility</h5>
                  <span className="text-2xl font-bold text-green-600">
                    {assessment.feasibility_score}/10
                  </span>
                </div>
                <p className="text-sm text-green-800">
                  {assessment.feasibility_reasoning}
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-purple-900">Viability</h5>
                  <span className="text-2xl font-bold text-purple-600">
                    {assessment.viability_score}/10
                  </span>
                </div>
                <p className="text-sm text-purple-800">
                  {assessment.viability_reasoning}
                </p>
              </div>
            </div>

            {/* Source Signals */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h5 className="font-medium text-gray-900 mb-2">Source Signals</h5>
              <div className="space-y-2">
                {opportunity.source_signals.map((signalId) => {
                  const signal = session.signals.find(s => s.id === signalId);
                  return signal ? (
                    <div key={signalId} className="text-sm">
                      <span className="font-medium text-gray-700">{signal.id}:</span>
                      <span className="text-gray-600 ml-2">{signal.content}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            {/* Decision Reasoning */}
            {decision && decision.reasoning && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Decision Reasoning</h5>
                <p className="text-sm text-gray-700">{decision.reasoning}</p>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

interface MainContentProps {
  session: WorkflowSession;
  loading: boolean;
  error: string | null;
  onRunAnalysis: () => void;
  onOpportunitySelection: (selectedIds: string[]) => void;
  onDecisions: (decisions: any[]) => void;
  onGeneratePortfolio: () => void;
  onGoBack: () => void;
  apiHealth: { status: string; llm_status: string } | null;
}

const MainContent: React.FC<MainContentProps> = ({
  session,
  loading,
  error,
  onRunAnalysis,
  onOpportunitySelection,
  onDecisions,
  onGeneratePortfolio,
  onGoBack,
  apiHealth
}) => {
  // Debug logging
  console.log('=== MAIN CONTENT RENDER ===');
  console.log('Current step:', session.current_step);
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Has decisions:', session.decisions?.length > 0);
  console.log('Has portfolio:', !!session.final_portfolio);
  console.log('Step status:', session.step_status);
  // Simplified state handling - single decision tree
  
  // 1. Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // 2. Processing states (any generating/assessing step)
  if (session.current_step === 'generating_opportunities' || 
      session.current_step === 'assessing_opportunities' || 
      session.current_step === 'generating_portfolio' ||
      session.current_step === 'opportunities_selected') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <BackgroundActivityIndicator
            currentStep={session.current_step}
            isLoading={true}
            signalsCount={session.signals.length}
            selectedCount={session.selected_opportunity_ids.length}
          />
        </div>
      </div>
    );
  }

  // 3. Ready to start
  if (session.current_step === 'loaded') {
    return (
      <div className="h-full flex flex-col">
        {/* Start Button at Top */}
        <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                Ready to Start Analysis
              </h2>
              <p className="text-sm lg:text-base text-gray-600">
                {session.signals.length} organizational signals have been loaded and validated. 
                The AI will analyze these signals to identify patterns, operational themes, and generate 
                actionable improvement opportunities.
              </p>
            </div>
            
            {/* Start Button */}
            <div className="flex flex-col items-center lg:items-end space-y-2 shrink-0">
              {/* API Status Check */}
              {apiHealth && (
                <div>
                  {apiHealth.llm_status === 'available' ? (
                    <div className="flex items-center text-green-600 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      AI Analysis Ready
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600 text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      LLM Service Unavailable
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={onRunAnalysis}
                disabled={loading || session.signals.length === 0 || apiHealth?.llm_status !== 'available'}
                className="btn-primary btn-lg flex items-center space-x-3 w-full lg:w-auto"
              >
                <Play className="h-5 w-5" />
                <span>Start Analysis</span>
              </button>
            </div>
          </div>
          
          {session.signals.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>No signals loaded.</strong> Make sure the signals.csv file exists 
                and contains valid signal data.
              </p>
            </div>
          )}
        </div>

        {/* Interactive Signal Summary */}
        <div className="flex-1 overflow-auto">
          <InteractiveSignalSummary session={session} />
        </div>
      </div>
    );
  }

  // 4. Opportunity selection
  if (session.current_step === 'opportunities_ready') {
    return (
      <div className="h-full flex flex-col w-full">
        <div className="flex-1 overflow-auto p-2 lg:p-4 w-full">
          <OpportunitySelection
            session={session}
            onSelectionComplete={onOpportunitySelection}
            onGoBack={onGoBack}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  // 5. Decision making
  if (session.current_step === 'assessments_ready') {
    return (
      <div className="h-full flex flex-col w-full">
        <div className="flex-1 overflow-auto p-2 lg:p-4 w-full">
          <DecisionMaking
            session={session}
            onDecisionsComplete={onDecisions}
            onGoBack={onGoBack}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  // 6. Decisions made - ready to generate portfolio
  if (session.current_step === 'decisions_ready') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Decisions Complete
          </h3>
          <p className="text-gray-600 mb-6">
            Strategic decisions have been made for all opportunities. 
            Ready to generate individual implementation portfolios.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={onGoBack}
              className="btn-secondary"
            >
              ← Back to Decisions
            </button>
            <button
              onClick={onGeneratePortfolio}
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              <span>Generate Portfolios</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 7. Portfolio complete
  if (session.current_step === 'portfolio_ready') {
    console.log('Rendering portfolio_ready state');
    console.log('Final portfolio data:', session.final_portfolio);
    
    // Safety check for portfolio data
    if (!session.final_portfolio) {
      console.error('Portfolio ready but no final_portfolio data!');
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Portfolio Generation Issue
            </h3>
            <p className="text-gray-600 mb-4">
              Portfolio is marked as ready but no data was found.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary text-sm"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    try {
    return (
      <div className="h-full flex flex-col w-full">
        <div className="flex-1 overflow-auto w-full">
          <div className="max-w-full mx-auto px-2 lg:px-4">
          <div className="mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
              Portfolio Generated Successfully
            </h2>
            <p className="text-sm lg:text-base text-gray-600">
              Your comprehensive portfolio specification is ready for review and implementation.
            </p>
          </div>

          {/* Portfolio Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 lg:p-6 mb-6">
            <h3 className="font-semibold text-green-900 mb-3">Portfolio Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-xl font-bold text-green-700">
                  {session.decisions.filter(d => d.decision === 'go').length}
                </div>
                <div className="text-green-600">GO Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-700">
                  {session.decisions.filter(d => d.decision === 'hold').length}
                </div>
                <div className="text-yellow-600">HOLD Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-700">
                  {session.decisions.filter(d => d.decision === 'drop').length}
                </div>
                <div className="text-red-600">DROP Opportunities</div>
              </div>
            </div>
          </div>

          {/* Selected Opportunities Tabs */}
          <OpportunityTabs 
            session={session}
          />

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                const dataStr = JSON.stringify(session.final_portfolio, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `portfolio-${session.session_id.slice(0, 8)}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="btn-primary w-full sm:w-auto"
            >
              Download Portfolio Data
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary w-full sm:w-auto"
            >
              Start New Analysis
            </button>
          </div>
          </div>
        </div>
      </div>
    );
    } catch (portfolioError) {
      console.error('Error rendering portfolio:', portfolioError);
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Portfolio Display Error
            </h3>
            <p className="text-gray-600 mb-4">
              There was an error displaying the portfolio. Check the console for details.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary text-sm"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
  }

  // 8. Fallback - unknown state (with debug info)
  console.log('MainContent fallback case:', {
    current_step: session.current_step,
    loading,
    has_decisions: session.decisions?.length > 0,
    has_final_portfolio: !!session.final_portfolio,
    step_status: session.step_status
  });
  
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Workflow in Progress
        </h3>
        <p className="text-gray-600 mb-4">
          Current step: {session.current_step.replace('_', ' ')}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Loading: {loading ? 'true' : 'false'}
        </p>
        <div className="text-xs text-gray-400 mb-4 text-left">
          <p>Decisions: {session.decisions?.length || 0}</p>
          <p>Portfolio: {session.final_portfolio ? 'Yes' : 'No'}</p>
          <p>Step Status: {JSON.stringify(session.step_status, null, 2)}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary text-sm"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};

export default MainContent;