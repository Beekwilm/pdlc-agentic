import React from 'react';
import { CheckCircle, Circle, Loader2, RefreshCw, Play } from 'lucide-react';
import { WorkflowSession, WorkflowStep } from '../types';

interface WorkflowProgressProps {
  session: WorkflowSession;
  onRunAnalysis: () => void;
  onRefresh: () => void;
  loading: boolean;
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  session,
  onRunAnalysis,
  onRefresh,
  loading
}) => {
  const steps: WorkflowStep[] = [
    {
      key: 'load_signals',
      label: 'Load Signals',
      description: 'Load organizational signals from CSV file',
      status: session.step_status.load_signals || 'pending'
    },
    {
      key: 'generate_opportunities',
      label: 'Generate Opportunities',
      description: 'AI transforms signals into actionable opportunities',
      status: session.step_status.generate_opportunities || 'pending'
    },
    {
      key: 'select_opportunities',
      label: 'Select Top 10',
      description: 'User selects most promising opportunities',
      status: session.step_status.select_opportunities || 'pending'
    },
    {
      key: 'assess_opportunities',
      label: 'Assess Opportunities',
      description: 'AI evaluates feasibility, desirability, viability',
      status: session.step_status.assess_opportunities || 'pending'
    },
    {
      key: 'make_decisions',
      label: 'Make Decisions',
      description: 'User decides go/hold/drop for each opportunity',
      status: session.step_status.make_decisions || 'pending'
    },
    {
      key: 'generate_portfolio',
      label: 'Generate Portfolio',
      description: 'AI creates final portfolio specifications',
      status: session.step_status.generate_portfolio || 'pending'
    },
    {
      key: 'validate_portfolio',
      label: 'Validate & Approve',
      description: 'User reviews and approves final portfolio',
      status: session.step_status.validate_portfolio || 'pending'
    }
  ];

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
      case 'failed':
        return <Circle className="h-6 w-6 text-red-500" />;
      default:
        return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'step-indicator step-completed';
      case 'in_progress':
        return 'step-indicator step-in-progress';
      case 'failed':
        return 'step-indicator step-failed';
      default:
        return 'step-indicator step-pending';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'Processing...';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Workflow Progress</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="btn-secondary flex items-center space-x-2"
          title="Refresh session data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4 mb-6">
        {steps.map((step) => (
          <div key={step.key} className={getStepClasses(step.status)}>
            <div className="flex-shrink-0">
              {getStepIcon(step.status)}
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{step.label}</h3>
                <span className={`text-sm font-medium ${
                  step.status === 'completed' ? 'text-green-600' :
                  step.status === 'in_progress' ? 'text-blue-600' :
                  step.status === 'failed' ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {getStatusText(step.status)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Session Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-2">Session Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Signals Loaded:</span>
            <span className="ml-2 font-medium">{session.signals.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Opportunities:</span>
            <span className="ml-2 font-medium">{session.opportunities.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Selected:</span>
            <span className="ml-2 font-medium">{session.selected_opportunity_ids.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Current Step:</span>
            <span className="ml-2 font-medium capitalize">{session.current_step.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {session.current_step === 'loaded' && (
            <span>Ready to analyze {session.signals.length} signals from CSV file.</span>
          )}
          {session.current_step === 'generating_opportunities' && (
            <span>AI is analyzing signals and generating opportunities...</span>
          )}
          {session.current_step === 'opportunities_ready' && (
            <span>Generated {session.opportunities.length} opportunities. Select up to 10 for assessment.</span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {session.current_step === 'loaded' && (
            <button
              onClick={onRunAnalysis}
              disabled={loading || session.signals.length === 0}
              className="btn-primary flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>{loading ? 'Processing...' : 'Run Analysis'}</span>
            </button>
          )}
        </div>
      </div>

      {/* No Signals Warning */}
      {session.signals.length === 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <strong>No signals loaded.</strong> Make sure the signals.csv file exists in the project root 
            and contains valid signal data with 'content', 'category', and 'source' columns.
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkflowProgress;