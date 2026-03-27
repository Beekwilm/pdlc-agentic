"""
Pydantic data models for the Signal-to-Opportunity Analysis system.

This module defines all the core data structures used throughout the application,
including signals, opportunities, assessments, decisions, and workflow sessions.
"""

from typing import List, Literal, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
import uuid


class Signal(BaseModel):
    """Represents an organizational signal loaded from CSV data."""
    
    id: str
    content: str
    category: str
    source: str
    timestamp: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @classmethod
    def create_from_csv_row(cls, row_index: int, row_data: Dict[str, Any]) -> "Signal":
        """Create a Signal instance from CSV row data."""
        return cls(
            id=f"sig_{row_index}",
            content=str(row_data.get('content', '')),
            category=str(row_data.get('category', 'unknown')),
            source=str(row_data.get('source', 'csv')),
            timestamp=datetime.now(),
            metadata=row_data
        )


class Opportunity(BaseModel):
    """Represents a business opportunity generated from signals."""
    
    id: str
    title: str
    description: str
    source_signals: List[str] = Field(description="List of Signal IDs that contributed to this opportunity")
    created_at: datetime
    
    @classmethod
    def create_from_llm_output(cls, llm_data: Dict[str, Any]) -> "Opportunity":
        """Create an Opportunity instance from LLM output data."""
        return cls(
            id=llm_data.get('id', f"opp_{uuid.uuid4().hex[:8]}"),
            title=str(llm_data.get('title', '')),
            description=str(llm_data.get('description', '')),
            source_signals=llm_data.get('source_signals', []),
            created_at=datetime.now()
        )


class Assessment(BaseModel):
    """Represents an assessment of an opportunity across three dimensions."""
    
    opportunity_id: str
    desirability_score: float = Field(ge=0, le=10, description="How much users/stakeholders want this (0-10)")
    feasibility_score: float = Field(ge=0, le=10, description="How technically/operationally achievable this is (0-10)")
    viability_score: float = Field(ge=0, le=10, description="How sustainable/profitable this is (0-10)")
    desirability_reasoning: str
    feasibility_reasoning: str
    viability_reasoning: str
    created_at: datetime = Field(default_factory=datetime.now)
    
    @classmethod
    def create_from_llm_output(cls, opportunity_id: str, llm_data: Dict[str, Any]) -> "Assessment":
        """Create an Assessment instance from LLM output data with validation."""
        # Validate required fields are present
        required_fields = [
            'desirability_score', 'feasibility_score', 'viability_score',
            'desirability_reasoning', 'feasibility_reasoning', 'viability_reasoning'
        ]
        
        missing_fields = [field for field in required_fields if field not in llm_data]
        if missing_fields:
            raise ValueError(f"Missing required fields in LLM output: {missing_fields}")
        
        # Validate score types and ranges
        for score_field in ['desirability_score', 'feasibility_score', 'viability_score']:
            score_value = llm_data[score_field]
            if not isinstance(score_value, (int, float)):
                raise ValueError(f"{score_field} must be a number, got {type(score_value).__name__}")
            if not (0 <= score_value <= 10):
                raise ValueError(f"{score_field} must be between 0 and 10, got {score_value}")
        
        # Validate reasoning fields are not empty
        for reasoning_field in ['desirability_reasoning', 'feasibility_reasoning', 'viability_reasoning']:
            reasoning_value = llm_data[reasoning_field]
            if not isinstance(reasoning_value, str):
                raise ValueError(f"{reasoning_field} must be a string, got {type(reasoning_value).__name__}")
            if len(reasoning_value.strip()) < 5:
                raise ValueError(f"{reasoning_field} must be at least 5 characters long")
        
        return cls(
            opportunity_id=opportunity_id,
            desirability_score=float(llm_data['desirability_score']),
            feasibility_score=float(llm_data['feasibility_score']),
            viability_score=float(llm_data['viability_score']),
            desirability_reasoning=str(llm_data['desirability_reasoning']),
            feasibility_reasoning=str(llm_data['feasibility_reasoning']),
            viability_reasoning=str(llm_data['viability_reasoning'])
        )


# Decision type literal for type safety
DecisionType = Literal["go", "hold", "drop"]


class Decision(BaseModel):
    """Represents a user's decision for an assessed opportunity."""
    
    opportunity_id: str
    decision: DecisionType
    reasoning: str = Field(default="", description="Optional reasoning for the decision")
    timestamp: datetime = Field(default_factory=datetime.now)


class WorkflowSession(BaseModel):
    """Represents a complete workflow session with all data and state."""
    
    session_id: str
    current_step: str = Field(default="initialized", description="Current workflow step")
    signals: List[Signal] = Field(default_factory=list)
    opportunities: List[Opportunity] = Field(default_factory=list)
    selected_opportunity_ids: List[str] = Field(default_factory=list)
    assessments: List[Assessment] = Field(default_factory=list)
    decisions: List[Decision] = Field(default_factory=list)
    final_portfolio: Optional[Dict[str, Any]] = None
    step_status: Dict[str, str] = Field(default_factory=lambda: {
        "load_signals": "pending",
        "generate_opportunities": "pending",
        "select_opportunities": "pending",
        "assess_opportunities": "pending",
        "make_decisions": "pending",
        "generate_portfolio": "pending",
        "validate_portfolio": "pending"
    })
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    def update_step_status(self, step: str, status: str) -> None:
        """Update the status of a workflow step."""
        self.step_status[step] = status
        self.updated_at = datetime.now()
    
    def get_selected_opportunities(self) -> List[Opportunity]:
        """Get the list of selected opportunities."""
        return [opp for opp in self.opportunities if opp.id in self.selected_opportunity_ids]
    
    def get_assessment_for_opportunity(self, opportunity_id: str) -> Optional[Assessment]:
        """Get the assessment for a specific opportunity."""
        return next((assessment for assessment in self.assessments 
                    if assessment.opportunity_id == opportunity_id), None)
    
    def get_decision_for_opportunity(self, opportunity_id: str) -> Optional[Decision]:
        """Get the decision for a specific opportunity."""
        return next((decision for decision in self.decisions 
                    if decision.opportunity_id == opportunity_id), None)


class SessionCreateResponse(BaseModel):
    """Response model for session creation."""
    
    session_id: str
    signals_count: int
    message: str = "Session created successfully"


class OpportunityGenerationResponse(BaseModel):
    """Response model for opportunity generation."""
    
    opportunities: List[Dict[str, Any]]
    count: int
    message: str = "Opportunities generated successfully"


class OpportunitySelectionRequest(BaseModel):
    """Request model for opportunity selection."""
    
    selected_ids: List[str] = Field(max_length=10, description="Maximum 10 opportunity IDs")


class OpportunitySelectionResponse(BaseModel):
    """Response model for opportunity selection."""
    
    selected_count: int
    message: str = "Opportunities selected successfully"


class DecisionRequest(BaseModel):
    """Request model for making decisions."""
    
    decisions: List[Decision]


class DecisionResponse(BaseModel):
    """Response model for decision making."""
    
    decisions_count: int
    message: str = "Decisions recorded successfully"


class PortfolioGenerationResponse(BaseModel):
    """Response model for portfolio generation."""
    
    portfolio: Dict[str, Any]
    message: str = "Portfolio generated successfully"


class ErrorResponse(BaseModel):
    """Standard error response model."""
    
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None