@echo off
echo ============================================
echo  TruthLens — Starting FastAPI Backend
echo  URL: http://localhost:8000
echo  Docs: http://localhost:8000/docs
echo ============================================
call venv\Scripts\activate
uvicorn main:app --reload --port 8000
