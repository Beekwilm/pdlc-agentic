"""
Tests for session service functionality.
"""

import pytest
from datetime import datetime
from backend.services.session_service import session_service
from backend.models import Signal, Opportunity, Assessment, Decision


class TestSessionService:
    """Test session service functionality."""
    
    def setup_method(self):
        """Clear sessions before each test."""
        session_service.sessions.clear()
    
    def test_create_session_with_signals(self):
        """Test creating a session with signals."""
        signals = [
            Signal(
                id="sig_1",
                content="Test signal content",
                category="Test Category",
                source="Test Source",
                timestamp=datetime.now()
            )
        ]
        
        session = session_service.create_session(signals)
        
        assert session.session_id is not None
        assert len(session.signals) == 1
        assert session.current_step == "loaded"
        assert session.step_status["load_signals"] == "completed"
    
    def test_create_session_empty_signals(self):
        """Test creating a session with no signals."""
        session = session_service.create_session([])
        
        assert session.session_id is not None
        assert len(session.signals) == 0
        assert session.current_step == "no_signals"
        assert session.step_status["load_signals"] == "failed"
    
    def test_get_session(self):
        """Test retrieving a session."""
        signals = [
            Signal(
                id="sig_1",
                content="Test signal",
                category="Test",
                source="Test",
                timestamp=datetime.now()
            )
        ]
        
        session = session_service.create_session(signals)
        retrieved_session = session_service.get_session(session.session_id)
        
        assert retrieved_session is not None
        assert retrieved_session.session_id == session.session_id
        assert len(retrieved_session.signals) == 1
    
    def test_get_nonexistent_session(self):
        """Test retrieving a non-existent session."""
        result = session_service.get_session("nonexistent_id")
        assert result is None
    
    def test_update_session_opportunities(self):
        """Test updating session with opportunities."""
        # Create session
        signals = [Signal(id="sig_1", content="Test", category="Test", source="Test", timestamp=datetime.now())]
        session = session_service.create_session(signals)
        
        # Create opportunities
        opportunities = [
            Opportunity(
                id="opp_1",
                title="Test Opportunity",
                description="Test description",
                source_signals=["sig_1"],
                created_at=datetime.now()
            )
        ]
        
        # Update session
        session_service.update_session_opportunities(session.session_id, opportunities)
        
        # Verify update
        updated_session = session_service.get_session(session.session_id)
        assert len(updated_session.opportunities) == 1
        assert updated_session.current_step == "opportunities_ready"
        assert updated_session.step_status["generate_opportunities"] == "completed"
    
    def test_update_session_selection(self):
        """Test updating session with opportunity selection."""
        # Create session with opportunities
        signals = [Signal(id="sig_1", content="Test", category="Test", source="Test", timestamp=datetime.now())]
        session = session_service.create_session(signals)
        
        opportunities = [
            Opportunity(id="opp_1", title="Test", description="Test", source_signals=["sig_1"], created_at=datetime.now()),
            Opportunity(id="opp_2", title="Test2", description="Test2", source_signals=["sig_1"], created_at=datetime.now())
        ]
        session_service.update_session_opportunities(session.session_id, opportunities)
        
        # Update selection
        selected_ids = ["opp_1"]
        session_service.update_session_selection(session.session_id, selected_ids)
        
        # Verify update
        updated_session = session_service.get_session(session.session_id)
        assert updated_session.selected_opportunity_ids == selected_ids
        assert updated_session.current_step == "opportunities_selected"
        assert updated_session.step_status["select_opportunities"] == "completed"
    
    def test_update_session_selection_validation(self):
        """Test validation of opportunity selection."""
        # Create session
        signals = [Signal(id="sig_1", content="Test", category="Test", source="Test", timestamp=datetime.now())]
        session = session_service.create_session(signals)
        
        # Test empty selection
        with pytest.raises(ValueError, match="At least one opportunity must be selected"):
            session_service.update_session_selection(session.session_id, [])
        
        # Test too many selections
        too_many_ids = [f"opp_{i}" for i in range(11)]  # 11 opportunities
        with pytest.raises(ValueError, match="Maximum 10 opportunities can be selected"):
            session_service.update_session_selection(session.session_id, too_many_ids)
    
    def test_session_count(self):
        """Test getting session count."""
        initial_count = session_service.get_session_count()
        
        # Create a session
        signals = [Signal(id="sig_1", content="Test", category="Test", source="Test", timestamp=datetime.now())]
        session_service.create_session(signals)
        
        assert session_service.get_session_count() == initial_count + 1
    
    def test_get_session_summary(self):
        """Test getting session summary."""
        # Create session
        signals = [Signal(id="sig_1", content="Test", category="Test", source="Test", timestamp=datetime.now())]
        session = session_service.create_session(signals)
        
        # Get summary
        summary = session_service.get_session_summary(session.session_id)
        
        assert summary["session_id"] == session.session_id
        assert summary["current_step"] == "loaded"
        assert len(summary["signals"]) == 1
        assert "step_status" in summary
        assert "created_at" in summary
        assert "updated_at" in summary