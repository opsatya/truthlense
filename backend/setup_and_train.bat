@echo off
echo ============================================
echo  TruthLens Backend — First Time Setup
echo ============================================
echo.

echo [1/4] Creating virtual environment...
python -m venv venv
call venv\Scripts\activate

echo [2/4] Installing Python packages...
pip install -r requirements.txt

echo [3/4] Downloading NLTK stopwords...
python -c "import nltk; nltk.download('stopwords')"

echo [4/4] Training the ML model...
echo       (This takes 2-3 minutes — please wait)
python train_model.py

echo.
echo ============================================
echo  Setup complete!
echo  Now run:  start_backend.bat
echo ============================================
pause
