"""
Tests for Pydantic data models.
"""

import pytest
from datetime import datetime
from backend.models import Signal, Opportunity, Assessment, Decision, WorkflowSession


def test_signal_creation():
    """Test Signal model creation and validation."""
    signal = Signal(
        id="test_sig_1",
        content="Test signal content",
        category="Test Category",
        source="Test Source",
        timestamp=datetime.now()
    )
    
    assert signal.id == "test_sig_1"
    assert signal.content == "Test signal content"
    assert signal.category == "Test Category"
    assert signal.source == "Test Source"
    assert isinstance(signal.timestamp, datetime)


def test_signal_from_csv_row():
    """Test Signal creation from CSV row data."""
    csv_data = {
        'content': 'Customer complaints increased',
        'category': 'Customer Service',
        'source': 'Support Tickets'
    }
    
    signal = Signal.create_from_csv_row(0, csv_data)
    
    assert signal.id == "sig_0"
    assert signal.content == "Customer complaints increased"
    assert signal.category == "Customer Service"
    assert signal.source == "Support Tickets"


def test_opportunity_creation():
    """Test Opportunity model creation."""
    opportunity = Opportunity(
        id="opp_1",
        title="Test Opportunity",
        description="Test opportunity description",
        source_signals=["sig_1", "sig_2"],
        created_at=datetime.now()
    )
    
    assert opportunity.id == "opp_1"
    assert opportunity.title == "Test Opportunity"
    assert len(opportunity.source_signals) == 2


def test_opportunity_from_llm_output():
    """Test Opportunity creation from LLM output."""
    llm_data = {
        'id': 'opp_test',
        'title': 'LLM Generated Opportunity',
        'description': 'Description from LLM',
        'source_signals': ['sig_1']
    }
    
    opportunity = Opportunity.create_from_llm_output(llm_data)
    
    assert opportunity.id == "opp_test"
    assert opportunity.title == "LLM Generated Opportunity"
    assert opportunity.source_signals == ["sig_1"]


def test_assessment_creation():
    """Test Assessment model creation and validation."""
    assessment = Assessment(
        opportunity_id="opp_1",
        desirability_score=8.5,
        feasibility_score=7.0,
        viability_score=6.5,
        desirability_reasoning="High user demand",
        feasibility_reasoning="Technically achievable",
        viability_reasoning="Good business case"
    )
    
    assert assessment.opportunity_id == "opp_1"
    assert assessment.desirability_score == 8.5
    assert assessment.feasibility_score == 7.0
    assert assessment.viability_score == 6.5


def test_assessment_score_validation():
    """Test Assessment score validation (0-10 range)."""
    with pytest.raises(ValueError):
        Assessment(
            opportunity_id="opp_1",
            desirability_score=11.0,  # Invalid: > 10
            feasibility_score=7.0,
            viability_score=6.5,
            desirability_reasoning="Test",
            feasibility_reasoning="Test",
            viability_reasoning="Test"
        )


def test_decision_creation():
    """Test Decision model creation."""
    decision = Decision(
        opportunity_id="opp_1",
        decision="go",
        reasoning="Strong business case"
    )
    
    assert decision.opportunity_id == "opp_1"
    assert decision.decision == "go"
    assert decision.reasoning == "Strong business case"


def test_workflow_session_creation():
    """Test WorkflowSession model creation."""
    session = WorkflowSession(
        session_id="test_session_1",
        current_step="loaded"
    )
    
    assert session.session_id == "test_session_1"
    assert session.current_step == "loaded"
    assert len(session.signals) == 0
    assert len(session.opportunities) == 0
    assert "load_signals" in session.step_status


def test_workflow_session_step_update():
    """Test WorkflowSession step status updates."""
    session = WorkflowSession(
        session_id="test_session_1",
        current_step="loaded"
    )
    
    session.update_step_status("load_signals", "completed")
    
    assert session.step_status["load_signals"] == "completed"
    assert isinstance(session.updated_at, datetime)


def test_workflow_session_helper_methods():
    """Test WorkflowSession helper methods."""
    session = WorkflowSession(
        session_id="test_session_1",
        current_step="loaded"
    )
    
    # Add test data
    signal = Signal(
        id="sig_1",
        content="Test",
        category="Test",
        source="Test",
        timestamp=datetime.now()
    )
    session.signals.append(signal)
    
    opportunity = Opportunity(
        id="opp_1",
        title="Test Opp",
        description="Test",
        source_signals=["sig_1"],
        created_at=datetime.now()
    )
    session.opportunities.append(opportunity)
    session.selected_opportunity_ids.append("opp_1")
    
    # Test helper methods
    selected_opps = session.get_selected_opportunities()
    assert len(selected_opps) == 1
    assert selected_opps[0].id == "opp_1"