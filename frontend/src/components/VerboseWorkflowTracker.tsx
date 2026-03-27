import React from 'react';
import { CheckCircle, Circle, Loader2, AlertCircle, Clock, Zap, Brain, Target, Users, FileText, CheckSquare } from 'lucide-react';
import { WorkflowSession } from '../types';

interface VerboseWorkflowTrackerProps {
  session: WorkflowSession;
}

const VerboseWorkflowTracker: React.FC<VerboseWorkflowTrackerProps> = ({
  session
}) => {
  const getStepIcon = (stepKey: string, status: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'load_signals': <FileText className="h-5 w-5" />,
      'generate_opportunities': <Brain className="h-5 w-5" />,
      'select_opportunities': <Target className="h-5 w-5" />,
      'assess_opportunities': <Zap className="h-5 w-5" />,
      'make_decisions': <Users className="h-5 w-5" />,
      'generate_portfolio': <CheckSquare className="h-5 w-5" />,
      'validate_portfolio': <CheckCircle className="h-5 w-5" />
    };

    if (status === 'in_progress') {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    } else if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status === 'failed') {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    } else {
      return <div className="text-gray-400">{iconMap[stepKey] || <Circle className="h-5 w-5" />}</div>;
    }
  };

  const getVerboseDescription = (stepKey: string, status: string) => {
    const descriptions: Record<string, Record<string, string>> = {
      'load_signals': {
        'pending': 'Waiting to load organizational signals from CSV file. This step reads and validates signal data including content, categories, and sources.',
        'in_progress': 'Loading and validating organizational signals from CSV file. Checking data integrity, parsing content, and preparing signals for analysis...',
        'completed': `Successfully loaded ${session.signals.length} organizational signals. Data validated and ready for AI analysis.`,
        'failed': 'Failed to load organizational signals from CSV file. Please check file format and data integrity.'
      },
      'generate_opportunities': {
        'pending': 'Ready to transform organizational signals into actionable opportunities. AI will analyze patterns, identify operational themes, and generate strategic improvements.',
        'in_progress': 'AI is analyzing organizational signals to identify patterns and generate actionable improvement opportunities. This involves natural language processing, pattern recognition, and domain expertise...',
        'completed': `Generated ${session.opportunities.length} strategic opportunities from signal analysis. Each opportunity includes clear descriptions, operational impact, and source signal references.`,
        'failed': 'Failed to generate opportunities. This may be due to AI service unavailability or insufficient signal data.'
      },
      'select_opportunities': {
        'pending': 'Waiting for user to select the most promising opportunities for detailed assessment. You can choose up to 10 opportunities.',
        'in_progress': 'User is reviewing and selecting opportunities for detailed assessment. Consider operational alignment, potential impact, and strategic priorities...',
        'completed': `Selected ${session.selected_opportunity_ids.length} opportunities for detailed assessment. These represent the most promising improvement initiatives.`,
        'failed': 'Opportunity selection failed. Please try selecting opportunities again.'
      },
      'assess_opportunities': {
        'pending': 'Ready to conduct detailed assessment of selected opportunities. AI will evaluate each across desirability, feasibility, and viability dimensions.',
        'in_progress': 'AI is conducting comprehensive assessment of selected opportunities. Analyzing stakeholder desirability, technical feasibility, and operational viability for each opportunity...',
        'completed': `Completed detailed assessment of ${session.assessments.length} opportunities. Each has been scored across desirability, feasibility, and viability with detailed reasoning.`,
        'failed': 'Assessment failed. This may be due to AI service issues or data processing errors.'
      },
      'make_decisions': {
        'pending': 'Waiting for strategic decisions on assessed opportunities. Review assessments and decide whether to Go, Hold, or Drop each opportunity.',
        'in_progress': 'User is making strategic decisions based on AI assessments. Consider operational capacity, strategic fit, and resource allocation...',
        'completed': `Strategic decisions made for ${session.decisions.length} opportunities. Portfolio direction established with clear go/hold/drop classifications.`,
        'failed': 'Decision recording failed. Please try submitting decisions again.'
      },
      'generate_portfolio': {
        'pending': 'Ready to generate comprehensive portfolio specification. AI will create detailed implementation roadmap, resource requirements, and success metrics.',
        'in_progress': 'AI is generating comprehensive portfolio specification including implementation roadmap, resource requirements, risk assessment, and success metrics...',
        'completed': 'Generated complete portfolio specification with implementation roadmap, resource requirements, success metrics, and monitoring plan.',
        'failed': 'Portfolio generation failed. This may be due to AI service issues or insufficient decision data.'
      },
      'validate_portfolio': {
        'pending': 'Portfolio ready for final review and validation. Examine the complete specification and approve for implementation.',
        'in_progress': 'User is reviewing and validating the final portfolio specification...',
        'completed': 'Portfolio validated and approved for implementation. Strategic transformation roadmap is complete.',
        'failed': 'Portfolio validation failed.'
      }
    };

    return descriptions[stepKey]?.[status] || `${stepKey} - ${status}`;
  };

  const getCurrentStepDetails = () => {
    const currentStep = session.current_step;
    
    switch (currentStep) {
      case 'loaded':
        return {
          title: 'Organizational Signals Loaded Successfully',
          description: `${session.signals.length} organizational signals are loaded and ready for analysis. The system has validated all signal data including content quality, categorization, and source attribution.`,
          nextAction: 'Click "Start Analysis" to begin AI-powered opportunity generation.'
        };
      case 'generating_opportunities':
        return {
          title: 'AI Generating Opportunities',
          description: 'The AI is analyzing signal patterns, identifying strategic themes, and generating actionable business opportunities. This process involves advanced natural language processing and strategic reasoning.',
          nextAction: 'Please wait while the AI completes the analysis...'
        };
      case 'opportunities_ready':
        return {
          title: 'Opportunities Generated',
          description: `${session.opportunities.length} strategic opportunities have been generated from your organizational signals. Each opportunity includes detailed descriptions, business impact analysis, and clear connections to source signals.`,
          nextAction: 'Review and select up to 10 opportunities for detailed assessment.'
        };
      case 'opportunities_selected':
        return {
          title: 'Opportunities Selected',
          description: `${session.selected_opportunity_ids.length} opportunities selected for detailed assessment. The AI will now evaluate each across three critical dimensions.`,
          nextAction: 'Assessment will begin automatically...'
        };
      case 'assessing_opportunities':
        return {
          title: 'AI Assessing Opportunities',
          description: 'Conducting comprehensive assessment of selected opportunities across desirability (market demand), feasibility (technical/operational achievability), and viability (business sustainability).',
          nextAction: 'Please wait while the AI completes detailed assessments...'
        };
      case 'assessments_ready':
        return {
          title: 'Assessments Complete',
          description: `All ${session.assessments.length} opportunities have been thoroughly assessed with detailed scoring and reasoning across desirability, feasibility, and viability dimensions.`,
          nextAction: 'Review assessments and make strategic Go/Hold/Drop decisions.'
        };
      case 'decisions_ready':
        return {
          title: 'Strategic Decisions Made',
          description: `Strategic decisions completed for ${session.decisions.length} opportunities. Portfolio direction is established with clear prioritization.`,
          nextAction: 'Portfolio generation will begin automatically...'
        };
      case 'generating_portfolio':
        return {
          title: 'AI Generating Portfolio',
          description: 'Creating comprehensive portfolio specification including implementation roadmap, resource requirements, success metrics, risk assessment, and monitoring plans.',
          nextAction: 'Please wait while the AI generates your complete portfolio...'
        };
      case 'portfolio_ready':
        return {
          title: 'Portfolio Complete',
          description: 'Your comprehensive portfolio specification is ready, including detailed implementation roadmap, resource requirements, and success metrics.',
          nextAction: 'Review and validate the final portfolio specification.'
        };
      default:
        return {
          title: 'Workflow Status',
          description: 'Current workflow status information.',
          nextAction: 'Follow the workflow steps to proceed.'
        };
    }
  };

  const steps = [
    { key: 'load_signals', label: 'Load Signals', status: session.step_status.load_signals || 'pending' },
    { key: 'generate_opportunities', label: 'Generate Opportunities', status: session.step_status.generate_opportunities || 'pending' },
    { key: 'select_opportunities', label: 'Select Opportunities', status: session.step_status.select_opportunities || 'pending' },
    { key: 'assess_opportunities', label: 'Assess Opportunities', status: session.step_status.assess_opportunities || 'pending' },
    { key: 'make_decisions', label: 'Make Decisions', status: session.step_status.make_decisions || 'pending' },
    { key: 'generate_portfolio', label: 'Generate Portfolio', status: session.step_status.generate_portfolio || 'pending' },
    { key: 'validate_portfolio', label: 'Validate Portfolio', status: session.step_status.validate_portfolio || 'pending' }
  ];

  const currentStepDetails = getCurrentStepDetails();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Workflow Progress</h2>
        <p className="text-sm text-gray-600">
          Signal-to-Opportunity Analysis Pipeline
        </p>
      </div>

      {/* Current Step Highlight */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center mb-2">
          <Clock className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-blue-900">{currentStepDetails.title}</h3>
        </div>
        <p className="text-sm text-blue-800 mb-3">{currentStepDetails.description}</p>
        <p className="text-xs text-blue-600 font-medium">{currentStepDetails.nextAction}</p>
      </div>

      {/* Workflow Steps */}
      <div className="flex-1 space-y-4">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-start space-x-3">
            {/* Step Icon */}
            <div className="flex-shrink-0 mt-1">
              {getStepIcon(step.key, step.status)}
            </div>
            
            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`text-sm font-medium ${
                  step.status === 'completed' ? 'text-green-700' :
                  step.status === 'in_progress' ? 'text-blue-700' :
                  step.status === 'failed' ? 'text-red-700' :
                  'text-gray-700'
                }`}>
                  {index + 1}. {step.label}
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  step.status === 'completed' ? 'bg-green-100 text-green-700' :
                  step.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  step.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {step.status === 'in_progress' ? 'Processing' :
                   step.status === 'completed' ? 'Complete' :
                   step.status === 'failed' ? 'Failed' : 'Pending'}
                </span>
              </div>
              
              <p className="text-xs text-gray-600 leading-relaxed">
                {getVerboseDescription(step.key, step.status)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Session Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Session Statistics</h4>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Signals Loaded:</span>
            <span className="font-medium">{session.signals.length}</span>
          </div>
          {session.signals.length > 0 && (
            <>
              <div className="flex justify-between">
                <span>Signal Categories:</span>
                <span className="font-medium">{new Set(session.signals.map(s => s.category)).size}</span>
              </div>
              <div className="flex justify-between">
                <span>Signal Sources:</span>
                <span className="font-medium">{new Set(session.signals.map(s => s.source)).size}</span>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <span>Opportunities Generated:</span>
            <span className="font-medium">{session.opportunities.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Selected for Assessment:</span>
            <span className="font-medium">{session.selected_opportunity_ids.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Assessments Complete:</span>
            <span className="font-medium">{session.assessments.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Decisions Made:</span>
            <span className="font-medium">{session.decisions.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Session ID:</span>
            <span className="font-mono text-xs">{session.session_id.slice(0, 8)}...</span>
          </div>
        </div>

        {/* Signal Categories Detail */}
        {session.signals.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <h5 className="text-xs font-medium text-gray-900 mb-2">Signal Categories</h5>
            <div className="space-y-1">
              {Array.from(new Set(session.signals.map(s => s.category)))
                .map(category => ({
                  category,
                  count: session.signals.filter(s => s.category === category).length
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 6)
                .map(({ category, count }) => (
                  <div key={category} className="flex justify-between text-xs">
                    <span className="text-gray-600 truncate" title={category}>
                      {category.length > 15 ? `${category.substring(0, 15)}...` : category}:
                    </span>
                    <span className="font-medium ml-2">{count}</span>
                  </div>
                ))}
              {new Set(session.signals.map(s => s.category)).size > 6 && (
                <div className="text-xs text-gray-500">
                  +{new Set(session.signals.map(s => s.category)).size - 6} more categories
                </div>
              )}
            </div>
          </div>
        )}

        {/* Signal Sources Detail */}
        {session.signals.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <h5 className="text-xs font-medium text-gray-900 mb-2">Signal Sources</h5>
            <div className="space-y-1">
              {Array.from(new Set(session.signals.map(s => s.source)))
                .map(source => ({
                  source,
                  count: session.signals.filter(s => s.source === source).length
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map(({ source, count }) => (
                  <div key={source} className="flex justify-between text-xs">
                    <span className="text-gray-600 truncate" title={source}>
                      {source.length > 12 ? `${source.substring(0, 12)}...` : source}:
                    </span>
                    <span className="font-medium ml-2">{count}</span>
                  </div>
                ))}
              {new Set(session.signals.map(s => s.source)).size > 5 && (
                <div className="text-xs text-gray-500">
                  +{new Set(session.signals.map(s => s.source)).size - 5} more sources
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerboseWorkflowTracker;