#!/bin/bash
echo "============================================"
echo " TruthLens — Starting FastAPI Backend"
echo " URL: http://localhost:8000"
echo " Docs: http://localhost:8000/docs"
echo "============================================"
source venv/bin/activate
uvicorn main:app --reload --port 8000
