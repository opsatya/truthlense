# 🛡️ TruthLens — AI Fake News Detection System
MCA Final Year Project · Savitribai Phule Pune University

---

## NEW FEATURES & FIXES
- **Optional Authentication**: Added user registration and login.
- **Personal Dashboard**: When logged in, your analysis history is saved to your account and visible on your dashboard. When not logged in, history is not saved.
- **Improved Live News Search**: Fixed a bug where text pasted from trusted sources (like BBC) was incorrectly flagged as "Not found". The keyword extractor now extracts valid un-stemmed words, and the NewsAPI `pageSize` was increased to improve hit rates.

---

## FOLDER STRUCTURE

```
fakenews-complete/
├── backend/
│   ├── main.py                  ← FastAPI server (run this)
│   ├── database.py              ← SQLite auto-setup
│   ├── train_model.py           ← Run ONCE to train model
│   ├── requirements.txt
│   ├── setup_and_train.bat      ← Windows: first-time setup
│   ├── setup_and_train.sh       ← Mac/Linux: first-time setup
│   ├── start_backend.bat        ← Windows: start server
│   ├── start_backend.sh         ← Mac/Linux: start server
│   ├── data/                    ← PUT Fake.csv + True.csv HERE
│   ├── models/                  ← model.pkl + vectorizer.pkl go here
│   └── ml/
│       ├── predictor.py         ← ML pipeline
│       ├── preprocessor.py      ← NLP text cleaning
│       ├── url_fetcher.py       ← BeautifulSoup article scraper
│       └── news_checker.py      ← NewsAPI live cross-check
└── frontend/
    ├── src/
    │   ├── App.js
    │   ├── services/api.js      ← All HTTP calls
    │   ├── components/          ← Navbar, ResultCard, Loader
    │   └── pages/               ← Home, Analyze, URL, Dashboard
    ├── start_frontend.bat       ← Windows: start React
    └── start_frontend.sh        ← Mac/Linux: start React
```

---

## HOW TO RUN — STEP BY STEP

### Prerequisites
- Python 3.9+ installed
- Node.js 18+ installed
- Your Fake.csv and True.csv files

---

### STEP 1 — Put your dataset files in place

Copy your Fake.csv and True.csv into:
```
backend/data/Fake.csv
backend/data/True.csv
```

---

### STEP 2 — Setup backend (FIRST TIME ONLY — do this once)

**Windows:**
```
cd backend
Double-click setup_and_train.bat
```

**Mac/Linux:**
```bash
cd backend
chmod +x setup_and_train.sh
./setup_and_train.sh
```

This will:
- Create a Python virtual environment
- Install all packages from requirements.txt
- Download NLTK stopwords
- Train Logistic Regression on your dataset (~2-3 min)
- Save model.pkl + vectorizer.pkl in models/

You will see: "Training complete!" when done.

---

### STEP 3 — Start the backend server

**Windows:**
```
Double-click start_backend.bat
```

**Mac/Linux:**
```bash
./start_backend.sh
```

You should see:
```
[✓] Database ready.
[✓] Model and vectorizer loaded.
INFO: Uvicorn running on http://127.0.0.1:8000
```

Test it: open http://localhost:8000/health in your browser.

---

### STEP 4 — Start the frontend (new terminal window)

**Windows:**
```
cd frontend
Double-click start_frontend.bat
```

**Mac/Linux:**
```bash
cd frontend
./start_frontend.sh
```

Opens automatically at http://localhost:3000

---

### STEP 5 (Optional) — Enable live news cross-checking

1. Go to https://newsapi.org and sign up for FREE (100 req/day)
2. Copy your API key
3. Open backend/ml/news_checker.py
4. Replace: NEWSAPI_KEY = "YOUR_NEWSAPI_KEY_HERE"
5. With:    NEWSAPI_KEY = "your_actual_key"
6. Restart the backend

Without this key, the ML model still works — only the live cross-check is skipped.

---

## HOW IT WORKS BEHIND THE SCENES

```
User types text
       ↓
React (api.js) → POST http://localhost:8000/predict
       ↓
FastAPI (main.py) receives request
       ↓
ml/preprocessor.py → lowercase, remove URLs, remove stopwords, stem
       ↓
vectorizer.pkl → CountVectorizer.transform() → 50,000-feature vector
       ↓
model.pkl → LogisticRegression.predict() → FAKE or REAL
           LogisticRegression.predict_proba() → confidence %
       ↓
VADER sentiment analysis on raw text
       ↓
ml/news_checker.py → NewsAPI search → trusted source count → verdict
       ↓
database.py → save_prediction() → SQLite row inserted
       ↓
JSON response → React → ResultCard renders result
       ↓
Dashboard page → GET /dashboard → get_dashboard_stats() → live counts
```

---

## COMMON ERRORS

| Error | Fix |
|-------|-----|
| `model.pkl not found` | Run setup_and_train first |
| `No dataset found` | Put Fake.csv + True.csv in backend/data/ |
| `Cannot connect to backend` | Start the backend server first |
| `npm: command not found` | Install Node.js from nodejs.org |
| `python: command not found` | Install Python from python.org |
| Port 8000 already in use | Kill the old process or change port |

---

## API ENDPOINTS

| Method | URL | What it does |
|--------|-----|-------------|
| GET | /health | Check if server is running |
| POST | /register | Create a new user account |
| POST | /login | Authenticate user and return JWT |
| POST | /predict | Analyze text → prediction |
| POST | /analyze-url | Fetch URL → analyze → prediction |
| GET | /dashboard | Live stats from SQLite |

Interactive docs: http://localhost:8000/docs
