"""
Tests for CSV service functionality.
"""

import pytest
import tempfile
import os
from backend.services.csv_service import csv_service


class TestCSVService:
    """Test CSV service functionality."""
    
    def test_load_signals_from_valid_csv(self):
        """Test loading signals from a valid CSV file."""
        # Create a temporary CSV file
        csv_content = """content,category,source
"Test signal 1","Category A","Source 1"
"Test signal 2","Category B","Source 2"
"Test signal 3","Category A","Source 3"
"""
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write(csv_content)
            temp_path = f.name
        
        try:
            signals = csv_service.load_signals_from_csv(temp_path)
            
            assert len(signals) == 3
            assert signals[0].content == "Test signal 1"
            assert signals[0].category == "Category A"
            assert signals[0].source == "Source 1"
            assert signals[1].content == "Test signal 2"
            assert signals[2].content == "Test signal 3"
            
            # Check that IDs are generated
            assert all(signal.id.startswith("sig_") for signal in signals)
            
        finally:
            os.unlink(temp_path)
    
    def test_load_signals_from_nonexistent_file(self):
        """Test loading signals from a non-existent file."""
        with pytest.raises(FileNotFoundError):
            csv_service.load_signals_from_csv("nonexistent_file.csv")
    
    def test_load_signals_from_invalid_csv(self):
        """Test loading signals from an invalid CSV file."""
        # Create a CSV with missing required columns
        csv_content = """title,description
"Test title","Test description"
"""
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write(csv_content)
            temp_path = f.name
        
        try:
            with pytest.raises(ValueError, match="CSV missing required columns"):
                csv_service.load_signals_from_csv(temp_path)
        finally:
            os.unlink(temp_path)
    
    def test_load_signals_with_empty_rows(self):
        """Test loading signals with some empty/invalid rows."""
        csv_content = """content,category,source
"Valid signal 1","Category A","Source 1"
"","Category B","Source 2"
"Valid signal 2","","Source 3"
"Valid signal 3","Category C","Source 4"
"""
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write(csv_content)
            temp_path = f.name
        
        try:
            signals = csv_service.load_signals_from_csv(temp_path)
            
            # Should only load valid signals (rows with all required fields)
            assert len(signals) == 2  # Only "Valid signal 1" and "Valid signal 3"
            assert signals[0].content == "Valid signal 1"
            assert signals[1].content == "Valid signal 3"
            
        finally:
            os.unlink(temp_path)
    
    def test_validate_csv_file_valid(self):
        """Test validating a valid CSV file."""
        csv_content = """content,category,source
"Test signal 1","Category A","Source 1"
"Test signal 2","Category B","Source 2"
"""
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write(csv_content)
            temp_path = f.name
        
        try:
            result = csv_service.validate_csv_file(temp_path)
            
            assert result["valid"] is True
            assert result["total_signals"] == 2
            assert "categories" in result
            assert "sources" in result
            assert "message" in result
            
        finally:
            os.unlink(temp_path)
    
    def test_validate_csv_file_invalid(self):
        """Test validating an invalid CSV file."""
        csv_content = """title,description
"Test title","Test description"
"""
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write(csv_content)
            temp_path = f.name
        
        try:
            result = csv_service.validate_csv_file(temp_path)
            
            assert result["valid"] is False
            assert result["error"] == "Validation error"
            assert "CSV missing required columns" in result["message"]
            
        finally:
            os.unlink(temp_path)
    
    def test_validate_csv_file_nonexistent(self):
        """Test validating a non-existent CSV file."""
        result = csv_service.validate_csv_file("nonexistent_file.csv")
        
        assert result["valid"] is False
        assert result["error"] == "CSV file not found"
    
    def test_load_actual_signals_csv(self):
        """Test loading the actual signals.csv file if it exists."""
        try:
            signals = csv_service.load_signals_from_csv("data/signals.csv")
            
            # Should load Belgian railway signals
            assert len(signals) > 0
            assert all(signal.content for signal in signals)
            assert all(signal.category for signal in signals)
            assert all(signal.source for signal in signals)
            
            # Check for railway-specific content
            signal_contents = [signal.content.lower() for signal in signals]
            railway_terms = ['railway', 'train', 'passenger', 'station', 'brussels', 'antwerp']
            
            # At least some signals should contain railway terms
            assert any(any(term in content for term in railway_terms) for content in signal_contents)
            
        except FileNotFoundError:
            pytest.skip("data/signals.csv not found - skipping actual file test")
    
    def test_validate_actual_signals_csv(self):
        """Test validating the actual signals.csv file if it exists."""
        result = csv_service.validate_csv_file("data/signals.csv")
        
        if result["valid"]:
            assert result["total_signals"] > 0
            assert "categories" in result
            assert "sources" in result
        else:
            # If file doesn't exist, that's expected in some test environments
            assert result["error"] == "CSV file not found"