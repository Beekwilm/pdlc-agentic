import React, { useState } from 'react';
import { CheckSquare, Square, ArrowRight, Lightbulb } from 'lucide-react';
import { WorkflowSession } from '../types';

interface OpportunitySelectionProps {
  session: WorkflowSession;
  onSelectionComplete: (selectedIds: string[]) => void;
  onGoBack: () => void;
  loading: boolean;
}

const OpportunitySelection: React.FC<OpportunitySelectionProps> = ({
  session,
  onSelectionComplete,
  onGoBack,
  loading
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggleSelection = (opportunityId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(opportunityId)) {
        // Remove from selection
        return prev.filter(id => id !== opportunityId);
      } else if (prev.length < 10) {
        // Add to selection (max 10)
        return [...prev, opportunityId];
      } else {
        // Already at max, don't add
        return prev;
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === Math.min(session.opportunities.length, 10)) {
      // Deselect all
      setSelectedIds([]);
    } else {
      // Select up to 10
      setSelectedIds(session.opportunities.slice(0, 10).map(opp => opp.id));
    }
  };

  const handleContinue = () => {
    if (selectedIds.length > 0) {
      onSelectionComplete(selectedIds);
    }
  };

  const isSelected = (opportunityId: string) => selectedIds.includes(opportunityId);
  const canSelectMore = selectedIds.length < 10;
  const remainingSelections = 10 - selectedIds.length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Lightbulb className="h-7 w-7 text-yellow-500 mr-3" />
            Select Top Opportunities
          </h2>
          <p className="text-gray-600 mt-2">
            Choose up to 10 opportunities for detailed assessment based on their strategic value and alignment with your organizational goals.
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-900">
            {selectedIds.length} / 10
          </div>
          <div className="text-sm text-gray-500">
            Selected
          </div>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <button
          onClick={handleSelectAll}
          className="btn-secondary text-sm"
          disabled={loading}
        >
          {selectedIds.length === Math.min(session.opportunities.length, 10) 
            ? 'Deselect All' 
            : `Select Top ${Math.min(session.opportunities.length, 10)}`
          }
        </button>
        
        <div className="text-sm text-gray-600">
          {session.opportunities.length} opportunities generated
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto">
        {session.opportunities.map((opportunity, index) => (
          <div
            key={opportunity.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              isSelected(opportunity.id)
                ? 'border-primary-300 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            } ${!canSelectMore && !isSelected(opportunity.id) ? 'opacity-50' : ''}`}
            onClick={() => handleToggleSelection(opportunity.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {isSelected(opportunity.id) ? (
                  <CheckSquare className="h-5 w-5 text-primary-600" />
                ) : (
                  <Square className={`h-5 w-5 ${
                    canSelectMore ? 'text-gray-400 hover:text-primary-600' : 'text-gray-300'
                  }`} />
                )}
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate">
                    {opportunity.title}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2">
                    #{index + 1}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {opportunity.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div>
                    <span className="font-medium">Source Signals:</span>
                    <span className="ml-1">{opportunity.source_signals.length}</span>
                  </div>
                  <div>
                    {new Date(opportunity.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selection Summary */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-900 mb-2">Selected Opportunities</h4>
          <div className="text-sm text-blue-800">
            {selectedIds.map((id, index) => {
              const opportunity = session.opportunities.find(opp => opp.id === id);
              return opportunity ? (
                <div key={id} className="truncate">
                  {index + 1}. {opportunity.title}
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selectedIds.length === 0 && 'Select at least one opportunity to continue'}
          {selectedIds.length > 0 && selectedIds.length < 10 && 
            `${selectedIds.length} selected. You can select ${remainingSelections} more.`}
          {selectedIds.length === 10 && 'Maximum 10 opportunities selected.'}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onGoBack}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>← Back to Opportunities</span>
          </button>
          
          <button
            onClick={handleContinue}
            disabled={loading || selectedIds.length === 0}
            className="btn-primary flex items-center space-x-2"
          >
            <span>Continue to Assessment</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Tip:</strong> Select opportunities that seem most promising based on their descriptions 
          and alignment with your organizational goals. The AI will provide detailed assessments for 
          your selected opportunities in the next step.
        </p>
      </div>
    </div>
  );
};

export default OpportunitySelection;