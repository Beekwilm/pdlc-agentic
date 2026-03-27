import { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { WorkflowSession } from './types';
import { ApiClient } from './api';
import AnimatedWorkflowProgress from './components/AnimatedWorkflowProgress';
import MainContent from './components/MainContent';

// Resizable pane hook
const useResizable = (initialWidth: number) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = () => setIsResizing(true);
  const stopResizing = () => setIsResizing(false);

  const resize = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = (e.clientX / window.innerWidth) * 100;
      // Responsive constraints based on screen size
      const minWidth = window.innerWidth < 768 ? 25 : 20; // 25% on mobile, 20% on desktop
      const maxWidth = window.innerWidth < 768 ? 60 : 50; // 60% on mobile, 50% on desktop
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    }
  };

  // Handle window resize to maintain proportions
  const handleWindowResize = () => {
    // Ensure width constraints are still valid on window resize
    const minWidth = window.innerWidth < 768 ? 25 : 20;
    const maxWidth = window.innerWidth < 768 ? 60 : 50;
    
    if (width < minWidth) {
      setWidth(minWidth);
    } else if (width > maxWidth) {
      setWidth(maxWidth);
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResizing);
    window.addEventListener('resize', handleWindowResize);
    
    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResizing);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [isResizing, width]);

  return { width, startResizing, isResizing };
};

function App() {
  const [session, setSession] = useState<WorkflowSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiHealth, setApiHealth] = useState<{ status: string; llm_status: string } | null>(null);
  
  // Resizable pane
  const { width: leftPaneWidth, startResizing, isResizing } = useResizable(33); // Start at 33%

  // Initialize session on component mount
  useEffect(() => {
    initializeSession();
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const health = await ApiClient.healthCheck();
      setApiHealth(health);
    } catch (error) {
      console.error('Health check failed:', error);
      setApiHealth({ status: 'unhealthy', llm_status: 'unavailable' });
    }
  };

  const initializeSession = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create new session
      const sessionResponse = await ApiClient.createSession();
      console.log('Session created:', sessionResponse);
      
      // Get full session data
      const sessionData = await ApiClient.getSession(sessionResponse.session_id);
      setSession(sessionData);
      
    } catch (error) {
      console.error('Failed to initialize session:', error);
      setError('Failed to initialize session. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    if (!session) return;
    
    let pollInterval: number | null = null;
    
    try {
      setLoading(true);
      setError(null);
      
      // Start polling for session updates (less aggressive)
      pollInterval = setInterval(async () => {
        try {
          const updatedSession = await ApiClient.getSession(session.session_id);
          setSession(updatedSession);
        } catch (error) {
          console.error('Polling error:', error);
          // Don't stop polling on individual errors
        }
      }, 2000); // Poll every 2 seconds instead of 1
      
      // Generate opportunities
      await ApiClient.generateOpportunities(session.session_id);
      
      // Stop polling and get final session data
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      const updatedSession = await ApiClient.pollSessionUpdates(session.session_id);
      setSession(updatedSession);
      
    } catch (error: any) {
      console.error('Failed to run analysis:', error);
      
      // More specific error messages
      if (error.code === 'ECONNABORTED') {
        setError('Request timed out. The AI analysis is taking longer than expected. Please try again.');
      } else if (error.response?.status === 503) {
        setError('AI service is temporarily unavailable. Please check your API key and try again.');
      } else if (error.response?.data?.detail) {
        setError(`Failed to generate opportunities: ${error.response.data.detail}`);
      } else {
        setError('Failed to generate opportunities. Please try again.');
      }
    } finally {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      setLoading(false);
    }
  };

  const handleOpportunitySelection = async (selectedIds: string[]) => {
    if (!session) return;
    
    let pollInterval: number | null = null;
    
    try {
      setLoading(true);
      setError(null);
      
      // Start polling for session updates
      pollInterval = setInterval(async () => {
        try {
          const updatedSession = await ApiClient.getSession(session.session_id);
          setSession(updatedSession);
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 1000);
      
      await ApiClient.selectOpportunities(session.session_id, selectedIds);
      
      // Start assessment automatically
      await ApiClient.assessOpportunities(session.session_id);
      
      // Stop polling and get final session data
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      const updatedSession = await ApiClient.pollSessionUpdates(session.session_id);
      setSession(updatedSession);
      
    } catch (error) {
      console.error('Failed to select opportunities:', error);
      setError('Failed to select opportunities. Please try again.');
    } finally {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      setLoading(false);
    }
  };

  const handleGoBack = async () => {
    if (!session) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Determine which step to go back to based on current step
      let targetStep = '';
      
      switch (session.current_step) {
        case 'opportunities_ready':
          // Go back to loaded state (regenerate opportunities)
          targetStep = 'loaded';
          break;
        case 'assessments_ready':
          // Go back to opportunity selection
          targetStep = 'opportunities_ready';
          break;
        case 'portfolio_ready':
          // Go back to decision making
          targetStep = 'assessments_ready';
          break;
        default:
          // For other states, just reload
          window.location.reload();
          return;
      }
      
      // Create a new session to go back
      const sessionResponse = await ApiClient.createSession();
      const sessionData = await ApiClient.getSession(sessionResponse.session_id);
      
      if (targetStep === 'opportunities_ready' && session.opportunities.length > 0) {
        // If going back to opportunity selection, regenerate opportunities first
        await ApiClient.generateOpportunities(sessionData.session_id);
        const updatedSession = await ApiClient.getSession(sessionData.session_id);
        setSession(updatedSession);
      } else {
        setSession(sessionData);
      }
      
    } catch (error) {
      console.error('Failed to go back:', error);
      setError('Failed to go back. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecisions = async (decisions: any[]) => {
    if (!session) return;
    
    console.log('=== MAKING DECISIONS ===');
    console.log('Session ID:', session.session_id);
    console.log('Decisions:', decisions);
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Making decisions API call...');
      // Make decisions only - don't generate portfolio yet
      const decisionsResult = await ApiClient.makeDecisions(session.session_id, decisions);
      console.log('Decisions result:', decisionsResult);
      
      // Get updated session to show decisions_ready state
      const updatedSession = await ApiClient.getSession(session.session_id);
      console.log('Updated session after decisions:', updatedSession.current_step);
      setSession(updatedSession);
      
    } catch (error) {
      console.error('=== DECISIONS FAILED ===');
      console.error('Failed to make decisions:', error);
      setError('Failed to make decisions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePortfolio = async () => {
    if (!session) return;
    
    console.log('=== STARTING PORTFOLIO GENERATION ===');
    console.log('Session ID:', session.session_id);
    
    try {
      setLoading(true);
      setError(null);
      
      // First, update the session state to show generating_portfolio
      const updatedSession = { ...session, current_step: 'generating_portfolio' };
      setSession(updatedSession);
      
      // Small delay to ensure the UI updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Making portfolio generation API call...');
      // Generate portfolio
      const portfolioResult = await ApiClient.generatePortfolio(session.session_id);
      console.log('Portfolio result:', portfolioResult);
      
      // Simple polling until portfolio is ready
      let attempts = 0;
      const maxAttempts = 60; // 1 minute max
      
      console.log('Starting polling for portfolio completion...');
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        try {
          const polledSession = await ApiClient.getSession(session.session_id);
          console.log(`Poll attempt ${attempts + 1}:`, {
            current_step: polledSession.current_step,
            has_portfolio: !!polledSession.final_portfolio,
            portfolio_keys: polledSession.final_portfolio ? Object.keys(polledSession.final_portfolio) : []
          });
          
          setSession(polledSession);
          
          if (polledSession.current_step === 'portfolio_ready' && polledSession.final_portfolio) {
            console.log('=== PORTFOLIO GENERATION COMPLETE ===');
            console.log('Final portfolio:', polledSession.final_portfolio);
            setLoading(false);
            return;
          }
        } catch (pollError) {
          console.error('Polling error:', pollError);
        }
        
        attempts++;
      }
      
      // If we get here, it timed out
      console.error('=== PORTFOLIO GENERATION TIMED OUT ===');
      setError('Portfolio generation timed out. Please try again.');
      setLoading(false);
      
    } catch (error) {
      console.error('=== PORTFOLIO GENERATION FAILED ===');
      console.error('Failed to generate portfolio:', error);
      setError('Failed to generate portfolio. Please try again.');
      setLoading(false);
    }
  };

  if (loading && !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Initializing Agentic PDLC Signal to Portfolio Decisioning...</p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={initializeSession}
            className="btn-primary"
          >
            Retry Connection
          </button>
          {apiHealth && (
            <div className="mt-4 text-sm text-gray-500">
              <p>API Status: {apiHealth.status}</p>
              <p>LLM Status: {apiHealth.llm_status}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Left Sidebar - Workflow Tracker (Resizable) */}
      <div 
        className="bg-white border-r border-gray-200 flex flex-col shrink-0"
        style={{ 
          width: `${leftPaneWidth}%`,
          minWidth: '280px',
          maxWidth: '50vw'
        }}
      >
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <h1 className="text-lg lg:text-xl font-bold text-gray-900 mb-1">
            Agentic PDLC Signal to Portfolio Decisioning
          </h1>
          <p className="text-xs lg:text-sm text-gray-600">
            AI-powered organizational optimization
          </p>
          
          {/* API Status Indicator */}
          {apiHealth && (
            <div className="mt-3 flex items-center space-x-2 lg:space-x-4 text-xs">
              <div className={`flex items-center space-x-1 ${
                apiHealth.status === 'healthy' ? 'text-green-600' : 'text-red-600'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  apiHealth.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span>API: {apiHealth.status}</span>
              </div>
              <div className={`flex items-center space-x-1 ${
                apiHealth.llm_status === 'available' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  apiHealth.llm_status === 'available' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span>AI: {apiHealth.llm_status}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {session && (
            <AnimatedWorkflowProgress
              session={session}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Resizer */}
      <div
        className={`w-1 bg-gray-300 hover:bg-blue-400 cursor-col-resize transition-colors shrink-0 ${
          isResizing ? 'bg-blue-500' : ''
        }`}
        onMouseDown={startResizing}
      />

      {/* Right Main Content Area (Flexible) */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Error Display */}
        {error && (
          <div className="m-4 lg:m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 shrink-0" />
              <p className="text-red-700 text-sm lg:text-base">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6 w-full min-w-0">
          {session && (
            <MainContent
              session={session}
              loading={loading}
              error={error}
              onRunAnalysis={runAnalysis}
              onOpportunitySelection={handleOpportunitySelection}
              onDecisions={handleDecisions}
              onGeneratePortfolio={handleGeneratePortfolio}
              onGoBack={handleGoBack}
              apiHealth={apiHealth}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;