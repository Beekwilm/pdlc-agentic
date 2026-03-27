#!/usr/bin/env python3
"""
Simple script to run the Signal-to-Opportunity Analysis server.
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)