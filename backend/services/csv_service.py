"""
CSV service for loading and validating signal data.
Handles all CSV file operations and data validation.
"""

import os
import logging
from typing import List
import pandas as pd
from pydantic import ValidationError

from ..models import Signal

logger = logging.getLogger(__name__)


class CSVService:
    """Service for CSV file operations and signal data loading."""
    
    @staticmethod
    def load_signals_from_csv(csv_file_path: str = "data/signals.csv") -> List[Signal]:
        """
        Load and validate signals from CSV file with comprehensive error handling.
        
        Args:
            csv_file_path: Path to the CSV file containing signal data
            
        Returns:
            List of validated Signal objects
            
        Raises:
            FileNotFoundError: If CSV file doesn't exist
            ValueError: If CSV data is malformed or invalid
            ValidationError: If signal data doesn't pass Pydantic validation
        """
        if not os.path.exists(csv_file_path):
            raise FileNotFoundError(f"CSV file not found: {csv_file_path}")
        
        try:
            # Read CSV with pandas, handling various encoding issues
            df = pd.read_csv(csv_file_path, encoding='utf-8')
            logger.info(f"Successfully read CSV file: {csv_file_path}")
            
        except UnicodeDecodeError:
            try:
                # Try alternative encoding if UTF-8 fails
                df = pd.read_csv(csv_file_path, encoding='latin-1')
                logger.warning(f"CSV file read with latin-1 encoding: {csv_file_path}")
            except Exception as e:
                raise ValueError(f"Failed to read CSV file with multiple encodings: {str(e)}")
        except pd.errors.EmptyDataError:
            raise ValueError("CSV file is empty or contains no data")
        except pd.errors.ParserError as e:
            raise ValueError(f"CSV parsing error: {str(e)}")
        except Exception as e:
            raise ValueError(f"Unexpected error reading CSV: {str(e)}")
        
        # Validate required columns
        required_columns = {'content', 'category', 'source'}
        missing_columns = required_columns - set(df.columns)
        if missing_columns:
            raise ValueError(f"CSV missing required columns: {missing_columns}")
        
        # Check for empty DataFrame
        if df.empty:
            raise ValueError("CSV file contains no data rows")
        
        # Process and validate each row
        signals = []
        validation_errors = []
        
        for index, row in df.iterrows():
            try:
                # Check for missing required values
                if pd.isna(row['content']) or str(row['content']).strip() == '':
                    validation_errors.append(f"Row {index}: 'content' is empty or missing")
                    continue
                    
                if pd.isna(row['category']) or str(row['category']).strip() == '':
                    validation_errors.append(f"Row {index}: 'category' is empty or missing")
                    continue
                    
                if pd.isna(row['source']) or str(row['source']).strip() == '':
                    validation_errors.append(f"Row {index}: 'source' is empty or missing")
                    continue
                
                # Create signal with validation
                signal = Signal.create_from_csv_row(index, row.to_dict())
                signals.append(signal)
                
            except ValidationError as e:
                validation_errors.append(f"Row {index}: Validation error - {str(e)}")
            except Exception as e:
                validation_errors.append(f"Row {index}: Unexpected error - {str(e)}")
        
        # Report validation issues
        if validation_errors:
            error_summary = f"Found {len(validation_errors)} validation errors in CSV data"
            logger.warning(f"{error_summary}: {validation_errors[:5]}")  # Log first 5 errors
            
            # If more than 50% of rows failed, raise an error
            if len(validation_errors) > len(df) * 0.5:
                raise ValueError(f"{error_summary}. Too many invalid rows to proceed.")
        
        if not signals:
            raise ValueError("No valid signals could be loaded from CSV file")
        
        logger.info(f"Successfully loaded {len(signals)} signals from CSV (skipped {len(validation_errors)} invalid rows)")
        return signals
    
    @staticmethod
    def validate_csv_file(csv_path: str = "data/signals.csv") -> dict:
        """
        Validate CSV file structure and content without creating a session.
        Useful for debugging and validation purposes.
        
        Returns:
            Dictionary with validation results and statistics
        """
        try:
            # Attempt to load signals
            signals = CSVService.load_signals_from_csv(csv_path)
            
            # Generate summary statistics
            categories = {}
            sources = {}
            content_lengths = []
            
            for signal in signals:
                # Count categories
                categories[signal.category] = categories.get(signal.category, 0) + 1
                
                # Count sources
                sources[signal.source] = sources.get(signal.source, 0) + 1
                
                # Track content lengths
                content_lengths.append(len(signal.content))
            
            avg_content_length = sum(content_lengths) / len(content_lengths) if content_lengths else 0
            
            return {
                "valid": True,
                "total_signals": len(signals),
                "categories": categories,
                "sources": sources,
                "content_stats": {
                    "average_length": round(avg_content_length, 2),
                    "min_length": min(content_lengths) if content_lengths else 0,
                    "max_length": max(content_lengths) if content_lengths else 0
                },
                "sample_signals": [signal.model_dump() for signal in signals[:3]],  # First 3 as examples
                "message": f"CSV file is valid with {len(signals)} signals"
            }
            
        except FileNotFoundError:
            return {
                "valid": False,
                "error": "CSV file not found",
                "message": f"File '{csv_path}' does not exist"
            }
        except ValueError as e:
            return {
                "valid": False,
                "error": "Validation error",
                "message": str(e)
            }
        except Exception as e:
            return {
                "valid": False,
                "error": "Unexpected error",
                "message": str(e)
            }


# Global service instance
csv_service = CSVService()