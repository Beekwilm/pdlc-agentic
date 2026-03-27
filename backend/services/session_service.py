"""
Session service for managing workflow sessions and state.
Handles session lifecycle, state management, and data persistence.
"""

import uuid
import logging
from typing import Dict, List, Optional
from datetime import datetime

from ..models import WorkflowSession, Signal, Opportunity, Assessment, Decision

logger = logging.getLogger(__name__)


class SessionService:
    """Service for managing workflow sessions and state."""
    
    def __init__(self):
        # Simple in-memory session storage (use Redis in production)
        self.sessions: Dict[str, WorkflowSession] = {}
    
    def create_session(self, signals: List[Signal]) -> WorkflowSession:
        """Create a new workflow session with loaded signals."""
        session_id = str(uuid.uuid4())
        
        session = WorkflowSession(
            session_id=session_id,
            current_step="loaded" if signals else "no_signals",
            signals=signals
        )
        
        # Update step status
        if signals:
            session.update_step_status("load_signals", "completed")
        else:
            session.update_step_status("load_signals", "failed")
        
        self.sessions[session_id] = session
        logger.info(f"Created session {session_id} with {len(signals)} signals")
        
        return session
    
    def get_session(self, session_id: str) -> Optional[WorkflowSession]:
        """Get session by ID."""
        return self.sessions.get(session_id)
    
    def update_session_opportunities(self, session_id: str, opportunities: List[Opportunity]) -> None:
        """Update session with generated opportunities."""
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        session.opportunities = opportunities
        session.current_step = "opportunities_ready"
        session.update_step_status("generate_opportunities", "completed")
        session.update_step_status("select_opportunities", "pending")
        
        logger.info(f"Updated session {session_id} with {len(opportunities)} opportunities")
    
    def update_session_selection(self, session_id: str, selected_ids: List[str]) -> None:
        """Update session with selected opportunity IDs."""
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        # Validate selection
        if len(selected_ids) > 10:
            raise ValueError("Maximum 10 opportunities can be selected")
        
        if len(selected_ids) == 0:
            raise ValueError("At least one opportunity must be selected")
        
        # Validate that all selected IDs exist
        opportunity_ids = {opp.id for opp in session.opportunities}
        invalid_ids = set(selected_ids) - opportunity_ids
        if invalid_ids:
            raise ValueError(f"Invalid opportunity IDs: {list(invalid_ids)}")
        
        session.selected_opportunity_ids = selected_ids
        session.current_step = "opportunities_selected"
        session.update_step_status("select_opportunities", "completed")
        session.update_step_status("assess_opportunities", "pending")
        
        logger.info(f"Updated session {session_id} with {len(selected_ids)} selected opportunities")
    
    def update_session_assessments(self, session_id: str, assessments: List[Assessment]) -> None:
        """Update session with opportunity assessments."""
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        session.assessments = assessments
        session.current_step = "assessments_ready"
        session.update_step_status("assess_opportunities", "completed")
        session.update_step_status("make_decisions", "pending")
        
        logger.info(f"Updated session {session_id} with {len(assessments)} assessments")
    
    def update_session_decisions(self, session_id: str, decisions: List[Decision]) -> None:
        """Update session with user decisions."""
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        session.decisions = decisions
        session.current_step = "decisions_ready"
        session.update_step_status("make_decisions", "completed")
        session.update_step_status("generate_portfolio", "pending")
        
        logger.info(f"Updated session {session_id} with {len(decisions)} decisions")
    
    def update_session_portfolio(self, session_id: str, portfolio_data: dict) -> None:
        """Update session with final portfolio."""
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        session.final_portfolio = portfolio_data
        session.current_step = "portfolio_ready"
        session.update_step_status("generate_portfolio", "completed")
        session.update_step_status("validate_portfolio", "pending")
        
        logger.info(f"Updated session {session_id} with final portfolio")
    
    def update_session_step_status(self, session_id: str, step: str, status: str) -> None:
        """Update a specific step status in the session."""
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        session.update_step_status(step, status)
        logger.debug(f"Updated session {session_id} step {step} to {status}")
    
    def get_session_summary(self, session_id: str) -> dict:
        """Get a summary of session data for API responses."""
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        return {
            "session_id": session.session_id,
            "current_step": session.current_step,
            "signals": [signal.model_dump() for signal in session.signals],
            "opportunities": [opp.model_dump() for opp in session.opportunities],
            "selected_opportunity_ids": session.selected_opportunity_ids,
            "assessments": [assessment.model_dump() for assessment in session.assessments],
            "decisions": [decision.model_dump() for decision in session.decisions],
            "final_portfolio": session.final_portfolio,
            "step_status": session.step_status,
            "created_at": session.created_at.isoformat(),
            "updated_at": session.updated_at.isoformat()
        }
    
    def cleanup_old_sessions(self, max_age_hours: int = 24) -> int:
        """Clean up sessions older than specified hours."""
        cutoff_time = datetime.now().timestamp() - (max_age_hours * 3600)
        old_sessions = []
        
        for session_id, session in self.sessions.items():
            if session.created_at.timestamp() < cutoff_time:
                old_sessions.append(session_id)
        
        for session_id in old_sessions:
            del self.sessions[session_id]
        
        if old_sessions:
            logger.info(f"Cleaned up {len(old_sessions)} old sessions")
        
        return len(old_sessions)
    
    def get_session_count(self) -> int:
        """Get the current number of active sessions."""
        return len(self.sessions)


# Global service instance
session_service = SessionService()