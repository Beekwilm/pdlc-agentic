"""
Tests for API endpoints without LLM calls.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from backend.main import app
from backend.models import Opportunity, Assessment
from datetime import datetime


class TestAPIEndpoints:
    """Test API endpoints functionality."""
    
    @pytest.fixture
    def client(self):
        """Create a test client for FastAPI app."""
        return TestClient(app)
    
    def test_root_endpoint(self, client):
        """Test root API endpoint."""
        response = client.get("/api/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Signal-to-Opportunity Analysis API"
        assert data["version"] == "0.1.0"
        assert data["docs"] == "/docs"
    
    def test_health_endpoint(self, client):
        """Test health check endpoint."""
        response = client.get("/api/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "llm_status" in data
        assert "active_sessions" in data
        assert "timestamp" in data
    
    def test_create_session_endpoint(self, client):
        """Test session creation endpoint."""
        response = client.post("/api/sessions")
        
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert "signals_count" in data
        assert "message" in data
        
        # Should load organizational signals
        assert data["signals_count"] == 30
        assert "Successfully loaded" in data["message"]
    
    def test_get_session_endpoint(self, client):
        """Test getting session data."""
        # First create a session
        create_response = client.post("/api/sessions")
        session_id = create_response.json()["session_id"]
        
        # Then get the session
        response = client.get(f"/api/sessions/{session_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == session_id
        assert data["current_step"] == "loaded"
        assert len(data["signals"]) == 30
        assert "step_status" in data
    
    def test_get_nonexistent_session(self, client):
        """Test getting a non-existent session."""
        response = client.get("/api/sessions/nonexistent_id")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_validate_csv_endpoint(self, client):
        """Test CSV validation endpoint."""
        response = client.get("/api/validate-csv?csv_path=data/signals.csv")
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["total_signals"] == 30
        assert "categories" in data
        assert "sources" in data
    
    @patch('backend.services.lcel_service.lcel_service.generate_opportunities')
    def test_generate_opportunities_endpoint_mocked(self, mock_generate, client):
        """Test opportunity generation endpoint with mocked LLM."""
        # Create a session first
        create_response = client.post("/api/sessions")
        session_id = create_response.json()["session_id"]
        
        # Mock the LLM response
        mock_opportunities = [
            Opportunity(
                id="opp_1",
                title="Test Opportunity 1",
                description="Test description 1",
                source_signals=["sig_1"],
                created_at=datetime.now()
            ),
            Opportunity(
                id="opp_2", 
                title="Test Opportunity 2",
                description="Test description 2",
                source_signals=["sig_2"],
                created_at=datetime.now()
            )
        ]
        mock_generate.return_value = mock_opportunities
        
        # Generate opportunities
        response = client.post(f"/api/sessions/{session_id}/generate-opportunities")
        
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 2
        assert len(data["opportunities"]) == 2
        assert "successfully" in data["message"].lower()
    
    def test_generate_opportunities_no_session(self, client):
        """Test opportunity generation with non-existent session."""
        response = client.post("/api/sessions/nonexistent_id/generate-opportunities")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_select_opportunities_endpoint(self, client):
        """Test opportunity selection endpoint."""
        # Create session and mock opportunities
        create_response = client.post("/api/sessions")
        session_id = create_response.json()["session_id"]
        
        with patch('backend.services.lcel_service.lcel_service.generate_opportunities') as mock_generate:
            mock_opportunities = [
                Opportunity(
                    id="opp_1",
                    title="Test Opportunity",
                    description="Test description",
                    source_signals=["sig_1"],
                    created_at=datetime.now()
                )
            ]
            mock_generate.return_value = mock_opportunities
            
            # Generate opportunities first
            client.post(f"/api/sessions/{session_id}/generate-opportunities")
            
            # Select opportunities
            selection_data = {"selected_ids": ["opp_1"]}
            response = client.post(f"/api/sessions/{session_id}/select-opportunities", json=selection_data)
            
            assert response.status_code == 200
            data = response.json()
            assert data["selected_count"] == 1
            assert "selected" in data["message"].lower()
    
    def test_select_opportunities_validation(self, client):
        """Test opportunity selection validation."""
        # Create session
        create_response = client.post("/api/sessions")
        session_id = create_response.json()["session_id"]
        
        # Try to select without any opportunities generated
        selection_data = {"selected_ids": ["nonexistent_id"]}
        response = client.post(f"/api/sessions/{session_id}/select-opportunities", json=selection_data)
        
        assert response.status_code == 400
        assert "invalid" in response.json()["detail"].lower()
    
    @patch('backend.services.lcel_service.lcel_service.assess_opportunity')
    def test_assess_opportunities_endpoint_mocked(self, mock_assess, client):
        """Test opportunity assessment endpoint with mocked LLM."""
        # Create session and setup opportunities
        create_response = client.post("/api/sessions")
        session_id = create_response.json()["session_id"]
        
        with patch('backend.services.lcel_service.lcel_service.generate_opportunities') as mock_generate:
            mock_opportunities = [
                Opportunity(
                    id="opp_1",
                    title="Test Opportunity",
                    description="Test description",
                    source_signals=["sig_1"],
                    created_at=datetime.now()
                )
            ]
            mock_generate.return_value = mock_opportunities
            
            # Generate and select opportunities
            client.post(f"/api/sessions/{session_id}/generate-opportunities")
            client.post(f"/api/sessions/{session_id}/select-opportunities", json={"selected_ids": ["opp_1"]})
            
            # Mock assessment response
            mock_assessment = Assessment(
                opportunity_id="opp_1",
                desirability_score=8.5,
                feasibility_score=7.2,
                viability_score=6.8,
                desirability_reasoning="High passenger demand",
                feasibility_reasoning="Technically achievable",
                viability_reasoning="Financially sustainable",
                created_at=datetime.now()
            )
            mock_assess.return_value = mock_assessment
            
            # Assess opportunities
            response = client.post(f"/api/sessions/{session_id}/assess-opportunities")
            
            assert response.status_code == 200
            data = response.json()
            assert data["count"] == 1
            assert len(data["assessments"]) == 1
    
    def test_assess_opportunities_no_selection(self, client):
        """Test assessment without opportunity selection."""
        # Create session
        create_response = client.post("/api/sessions")
        session_id = create_response.json()["session_id"]
        
        # Try to assess without selecting opportunities
        response = client.post(f"/api/sessions/{session_id}/assess-opportunities")
        
        assert response.status_code == 400
        assert "no opportunities selected" in response.json()["detail"].lower()
    
    def test_make_decisions_endpoint(self, client):
        """Test making decisions endpoint."""
        # Create session
        create_response = client.post("/api/sessions")
        session_id = create_response.json()["session_id"]
        
        # Make decisions
        decisions_data = [
            {
                "opportunity_id": "opp_1",
                "decision": "go",
                "reasoning": "High strategic value"
            }
        ]
        response = client.post(f"/api/sessions/{session_id}/make-decisions", json=decisions_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 1
        assert len(data["decisions"]) == 1
    
    def test_make_decisions_invalid_data(self, client):
        """Test making decisions with invalid data."""
        # Create session
        create_response = client.post("/api/sessions")
        session_id = create_response.json()["session_id"]
        
        # Invalid decision data (missing required fields)
        invalid_decisions = [{"invalid": "data"}]
        response = client.post(f"/api/sessions/{session_id}/make-decisions", json=invalid_decisions)
        
        assert response.status_code == 400
        assert "missing required field" in response.json()["detail"].lower()