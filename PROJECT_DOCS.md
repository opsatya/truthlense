# TruthLens AI — Complete Project Documentation

## Table of Contents

1. [What Is TruthLens AI?](#1-what-is-truthlens-ai)
2. [How It Works — The Big Picture](#2-how-it-works--the-big-picture)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [Architecture Overview](#5-architecture-overview)
6. [Core Features](#6-core-features)
7. [API Reference](#7-api-reference)
8. [Frontend Pages & Components](#8-frontend-pages--components)
9. [Backend Services & ML Pipeline](#9-backend-services--ml-pipeline)
10. [Database Models](#10-database-models)
11. [Environment Variables & Configuration](#11-environment-variables--configuration)
12. [Installation & Running Locally](#12-installation--running-locally)
13. [User Flow — Step by Step](#13-user-flow--step-by-step)
14. [Key Algorithms & Logic](#14-key-algorithms--logic)
15. [Security Notes & Known Risks](#15-security-notes--known-risks)
16. [Training Data](#16-training-data)

---

## 1. What Is TruthLens AI?

**TruthLens AI** ek full-stack web application hai jo kisi bhi news article ko analyze karke batata hai ki woh **Fake hai ya Real**. Ye ek MCA Final Year Project (SPPU) hai.

In simple terms:
- Tum ek news article ka text paste karo **ya** uska URL do.
- AI us article ko analyze karta hai — pehle apne trained ML model se, phir live news sources se cross-check karke.
- Result mein batata hai: **Fake News** ya **Real News**, kitni confidence hai, sentiment kya hai, aur trusted news sites ne is topic ko cover kiya hai ya nahi.
- Agar tum logged in ho, toh tera analysis history save hota hai aur dashboard mein charts ke saath dikhta hai.

**Target audience:** Students, journalists, aur koi bhi jo news ki authenticity verify karna chahta hai.

---

## 2. How It Works — The Big Picture

```
                    ┌──────────────────────────────────────┐
                    │          USER BROWSER (React)         │
                    │                                      │
                    │  User pastes article text / URL      │
                    │  Click "Analyze for Fake News"       │
                    └──────────────┬───────────────────────┘
                                   │ POST /predict  OR  POST /analyze-url
                                   │ (JSON body + JWT token in header)
                                   ▼
                    ┌──────────────────────────────────────┐
                    │         FastAPI Backend               │
                    │                                      │
                    │  1. Validate JWT token               │
                    │  2. If URL: fetch article with       │
                    │     BeautifulSoup (web scraping)     │
                    │  3. Clean text (NLP preprocessing)   │
                    │  4. ML model predicts FAKE / REAL    │
                    │     (Logistic Regression)            │
                    │  5. VADER sentiment analysis         │
                    │  6. Live cross-check via NewsAPI     │
                    │  7. Maybe override ML result based   │
                    │     on trusted source verdict        │
                    │  8. Save to DB (if user logged in)   │
                    │  9. Return full result               │
                    └──────────┬───────────────────────────┘
                               │
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼
          SQLite DB        NewsAPI         ML Models
          (history,       (live news      (model.pkl +
           users)          cross-check)    vectorizer.pkl)
```

---

## 3. Tech Stack

### Frontend

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18.2.0 | UI framework |
| React Router DOM | 6.22.0 | Client-side routing (page navigation) |
| Axios | 1.6.7 | HTTP requests to backend |
| Recharts | 2.12.0 | Pie chart + bar chart on dashboard |
| Custom CSS | — | Styling (no Tailwind/Bootstrap used) |

### Backend

| Tool | Version | Purpose |
|------|---------|---------|
| FastAPI | 0.111.0 | REST API framework (Python) |
| Uvicorn | 0.30.1 | ASGI server — runs FastAPI |
| scikit-learn | 1.5.0 | Logistic Regression ML model |
| pandas + numpy | — | Data manipulation during training |
| NLTK | 3.8.1 | NLP — stopwords, stemming |
| VADER Sentiment | 3.3.2 | Sentiment scoring (Positive/Negative/Neutral) |
| BeautifulSoup4 | 4.12.3 | Scraping article text from URLs |
| Requests | 2.32.2 | HTTP calls to NewsAPI |
| PyJWT | 2.8.0 | JWT token creation & verification |
| Passlib + bcrypt | 1.7.4 | Password hashing |
| python-multipart | 0.0.9 | Parsing form data |

### Database

- **SQLite** — simple file-based database (`predictions.db`)
- Auto-created on first backend startup
- Good for development; for production switch to PostgreSQL

### ML Models (Pre-trained)

| File | Framework | Purpose |
|------|-----------|---------|
| `backend/models/model.pkl` | scikit-learn | Logistic Regression classifier (FAKE vs REAL) |
| `backend/models/vectorizer.pkl` | scikit-learn | CountVectorizer (text → numbers) |

> **Ek important baat:** Ye model files git mein nahi hain (too large). Pehle `train_model.py` run karna hoga.

---

## 4. Project Structure

```
ai-fake-news-main/
│
├── backend/                         # Python FastAPI server
│   ├── main.py                     # Server entry point, all 6 endpoints
│   ├── auth.py                     # JWT creation, password hashing/verify
│   ├── database.py                 # SQLite setup + all DB queries
│   ├── train_model.py              # Script to train ML model from CSV data
│   ├── requirements.txt            # All Python dependencies
│   │
│   ├── ml/                         # Machine Learning pipeline
│   │   ├── __init__.py
│   │   ├── predictor.py           # Main prediction logic (loads models)
│   │   ├── preprocessor.py        # Text cleaning (NLP pipeline)
│   │   ├── url_fetcher.py         # Scrapes article text from URL
│   │   └── news_checker.py        # NewsAPI live cross-check
│   │
│   ├── models/                     # Trained model files (generated, not in git)
│   │   ├── model.pkl              # Trained LogisticRegression
│   │   └── vectorizer.pkl         # Fitted CountVectorizer
│   │
│   └── data/                       # Training datasets (not in git)
│       ├── Fake.csv               # ~23,000 fake news articles
│       └── True.csv               # ~21,000 real news articles
│
└── frontend/                        # React SPA
    ├── src/
    │   ├── index.js               # React entry point (ReactDOM.createRoot)
    │   ├── App.js                 # Route definitions + AuthProvider wrapper
    │   ├── App.css                # Global styles
    │   │
    │   ├── pages/
    │   │   ├── HomePage.js        # Landing page with hero + features
    │   │   ├── LoginPage.js       # Login form (styled, toggle password)
    │   │   ├── RegisterPage.js    # Register form + password strength meter
    │   │   ├── AnalyzePage.js     # Text paste + analysis form
    │   │   ├── UrlAnalyzePage.js  # URL input + analysis form
    │   │   └── DashboardPage.js   # Stats + charts + history table
    │   │
    │   ├── components/
    │   │   ├── Navbar.js          # Fixed top navigation
    │   │   ├── ResultCard.js      # Displays analysis results
    │   │   └── Loader.js          # Spinning loader animation
    │   │
    │   ├── context/
    │   │   └── AuthContext.js     # Global auth state (token management)
    │   │
    │   └── services/
    │       └── api.js             # Axios client + all API call functions
    │
    ├── package.json
    └── build/                      # Production build output (npm run build)
```

---

## 5. Architecture Overview

### Request Lifecycle (Text Analysis)

```
Browser
  │
  ├─ 1. User pastes article text in AnalyzePage
  ├─ 2. Form validates: min 100 chars (frontend) / min 30 chars (backend)
  ├─ 3. axios.post('/predict', { text: '...' })
  │      with header: Authorization: Bearer <jwt_token>
  │
FastAPI (main.py)
  ├─ 4. HTTPBearer extracts JWT from Authorization header
  ├─ 5. decode_access_token(token) → returns user_id (or None if invalid)
  ├─ 6. Pydantic validates TextRequest body
  │
ML Pipeline (ml/predictor.py)
  ├─ 7. preprocessor.preprocess(text) → lowercase, strip URLs, stem words
  ├─ 8. vectorizer.transform([cleaned]) → 50,000-dim sparse vector
  ├─ 9. model.predict() → "FAKE" or "REAL"
  ├─ 10. model.predict_proba() → confidence float (e.g. 0.873)
  ├─ 11. VADER sentiment → "Negative", "Neutral", "Positive", etc.
  ├─ 12. credibility scoring → "Low", "Medium", "High", etc.
  │
Live News Check (ml/news_checker.py)
  ├─ 13. extract_keywords(text) → 5-8 important words
  ├─ 14. NewsAPI query with those keywords
  ├─ 15. Check matched articles against TRUSTED_DOMAINS list
  ├─ 16. verdict → CONFIRMED / PARTIALLY_CONFIRMED / NOT_FOUND / UNVERIFIED
  │
Override Logic (main.py)
  ├─ 17. If CONFIRMED → override to "Real News" at ≥88% confidence
  ├─ 18. If high-credibility domain → override to "Real News" at ≥90%
  ├─ 19. If fake/spam domain → override to "Fake News" at 95%
  │
Database (database.py)
  ├─ 20. If user is logged in → save_prediction(..., user_id)
  └─ 21. If anonymous → skip saving (no history)
  │
Response
  └─ 22. Return { prediction, confidence, sentiment, credibility, news_check, summary }
```

---

## 6. Core Features

### 1. User Authentication

- **Register:** Username + password → stored in `users` table (password bcrypt-hashed, never plaintext)
- **Login:** Username + password → verify against hash → generate JWT token (7-day expiry)
- **Session:** JWT token stored in browser `localStorage`, auto-attached to every API call
- **Logout:** Token removed from `localStorage` (frontend-only, backend is stateless)

> **Simple mein:** Token ek digital key hai. Login karne pe milti hai, 7 din tak kaam karti hai, logout pe delete hoti hai. Koi bhi iske bina dashboard access nahi kar sakta.

### 2. Text-Based Analysis

- User pastes any news article text (minimum 100 characters)
- Backend cleans the text with NLP (removes stopwords, stems words)
- Logistic Regression model classifies it as Fake or Real
- Confidence percentage shown (e.g. 87.3%)
- AI-written summary explains the decision

### 3. URL-Based Analysis

- User enters any news article URL (must start with `http://` or `https://`)
- Backend fetches the webpage using BeautifulSoup (web scraping)
- Extracts article title and main text from HTML
- Same ML analysis pipeline runs on extracted text
- Source domain shown in result

### 4. Live News Cross-Check

> **Yeh feature sabse interesting hai.** Sirf ML predict karna enough nahi tha, toh real-time verification bhi add kiya hai.

- Extracts 5–8 keywords from the article
- Queries **NewsAPI** (`/v2/everything`) with those keywords
- Checks if matched articles come from a **trusted news domain** list
- Trusted domains include: BBC, Reuters, NDTV, The Hindu, Times of India, AP News, The Guardian, etc.
- Returns one of these verdicts:

| Verdict | Meaning |
|---------|---------|
| `CONFIRMED` | 3+ trusted sources reported this |
| `PARTIALLY_CONFIRMED` | 1–2 trusted sources found |
| `UNVERIFIED` | Articles exist but none from trusted sites |
| `NOT_FOUND` | No news articles found — strong fake signal |
| `API_UNAVAILABLE` | NewsAPI key missing or network error |

### 5. Sentiment Analysis

- Uses VADER (Valence Aware Dictionary and Sentiment Reasoner)
- Runs on the raw original article text
- Returns one of: `Highly Negative`, `Negative`, `Neutral`, `Slightly Positive`, `Positive`
- Fake news tends to use emotionally charged negative language

### 6. Credibility Scoring

- Combines ML confidence + prediction result
- Maps to: `Very Low`, `Low`, `Uncertain`, `Medium`, `Medium-High`, `High`
- This is what the UI shows as the colored badge

### 7. User Dashboard

- Only accessible when logged in
- Shows personal analysis history
- **Stat cards:** Total analyzed, Fake count, Real count, Fake percentage
- **Pie chart:** Fake vs Real distribution (Recharts)
- **Bar chart:** Confidence scores of recent analyses
- **Table:** Last 10 analyses with prediction, confidence, sentiment, source, timestamp

### 8. Anonymous Analysis

- You can analyze news **without logging in**
- Result is shown but **not saved to database**
- Log in to get history tracking and dashboard access

---

## 7. API Reference

Base URL (development): `http://localhost:8000`

Auto-generated API docs: `http://localhost:8000/docs`

---

### GET `/health`

Health check — is the server running?

**Response (200)**
```json
{ "status": "ok", "message": "TruthLens API is running" }
```

---

### POST `/register`

Create a new user account.

**Request Body (JSON)**
```json
{
  "username": "john_doe",
  "password": "mypassword123"
}
```

**Response (201)**
```json
{ "message": "User created successfully" }
```

**Errors**
- `400` — Username already exists

---

### POST `/login`

Authenticate and get a JWT token.

**Request Body (JSON)**
```json
{
  "username": "john_doe",
  "password": "mypassword123"
}
```

**Response (200)**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

**Errors**
- `401` — Invalid username or password

---

### POST `/predict`

Analyze a news article text. Auth is optional — saves history only if logged in.

**Headers** *(optional)*
```
Authorization: Bearer <token>
```

**Request Body (JSON)**
```json
{
  "text": "Full news article text here... (min 30 chars)"
}
```

**Response (200)**
```json
{
  "prediction": "Fake News",
  "confidence": "87.3%",
  "confidence_raw": 87.3,
  "summary": "This article contains language patterns commonly found in fake news...",
  "sentiment": "Negative",
  "credibility": "Low",
  "news_check": {
    "found": false,
    "total_results": 0,
    "trusted_match_count": 0,
    "matched_articles": [],
    "verdict": "NOT_FOUND",
    "search_query": "election fraud voting machines rigged"
  },
  "source_domain": null,
  "extracted_title": null
}
```

**Errors**
- `422` — Text too short (< 30 chars)
- `500` — Model not loaded

---

### POST `/analyze-url`

Fetch and analyze an article from a URL. Auth optional.

**Request Body (JSON)**
```json
{
  "url": "https://www.bbc.com/news/some-article"
}
```

**Response (200)** — Same as `/predict` plus:
```json
{
  "source_domain": "bbc.com",
  "extracted_title": "Article Headline From The Page"
}
```

**Errors**
- `400` — URL must start with http:// or https://
- `422` — Could not extract article text (page blocked or too short)
- `500` — Network error fetching URL

---

### GET `/dashboard`

Get the logged-in user's analysis history and stats. **Requires JWT.**

**Headers**
```
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "total_analyzed": 42,
  "fake_count": 15,
  "real_count": 27,
  "fake_percentage": 35.7,
  "recent_analyses": [
    {
      "id": 42,
      "prediction": "Real News",
      "confidence": "92.1%",
      "sentiment": "Neutral",
      "credibility": "High",
      "source": "bbc.com",
      "created_at": "2025-06-18T14:30:25.123456"
    }
  ]
}
```

**Errors**
- `401` — Not logged in / invalid token

---

## 8. Frontend Pages & Components

### Pages

#### `HomePage.js` — `/`
Landing page. No auth required.
- Hero section: project name, tagline, CTA buttons
- Feature cards: Text Analysis, URL Analysis, Live Cross-Check, History Dashboard
- Statistics banner (98% Accuracy, 44K training articles, etc.)

#### `LoginPage.js` — `/login`
- Username + password form with password visibility toggle
- Calls `POST /login` via `api.js`
- On success: calls `login(token)` from AuthContext → stores JWT in localStorage → redirects to `/dashboard`
- Shows error message if credentials are wrong

#### `RegisterPage.js` — `/register`
- Username + password form
- Real-time **password strength indicator** (shows when length is enough and if it contains numbers)
- Calls `POST /register`
- On success: redirects to `/login`
- Shows error if username is already taken

#### `AnalyzePage.js` — `/analyze`
- Large textarea for pasting article text
- Character count display
- "Load Sample Article" button (for testing)
- Min 100 chars validation on frontend
- On submit → calls `analyzeNewsText(text)` from `api.js`
- Shows `<Loader />` while waiting
- Shows `<ResultCard />` when result arrives

#### `UrlAnalyzePage.js` — `/analyze-url`
- URL input with example URLs pre-filled (BBC, NDTV, Times of India)
- Validates URL starts with `http://` or `https://`
- On submit → calls `analyzeNewsUrl(url)` from `api.js`
- Same result display as AnalyzePage

#### `DashboardPage.js` — `/dashboard`
Auth-protected page.
- Calls `getDashboardStats()` on mount → `GET /dashboard`
- If 401 returned → shows "Please log in" message
- If success → renders:
  - **4 stat cards:** Total, Fake, Real, Fake %
  - **Pie chart** (Recharts): Fake vs Real ratio
  - **Bar chart** (Recharts): Confidence scores of last 10 analyses
  - **Table:** Last 10 analyses with all details

---

### Components

#### `Navbar.js`
- Fixed position, always visible
- Shows different links based on auth state:
  - Not logged in: Home, Analyze Text, Analyze URL, Login
  - Logged in: Home, Analyze Text, Analyze URL, Dashboard, Logout
- Active route highlighted
- Mobile: hamburger menu

#### `ResultCard.js`
Displays analysis result. Props: the full response JSON.
- **Prediction badge** — big "FAKE NEWS" (red) or "REAL NEWS" (green)
- **Confidence bar** — progress bar with gradient color
- **Sentiment chip** — colored label
- **Credibility chip** — colored label
- **AI Summary** — text explanation
- **Live News Cross-Check section:**
  - Verdict badge
  - List of matched articles with source name, title, link
- **"Analyze Another" button** — resets the page

#### `Loader.js`
- Animated spinning rings
- Shows message: "AI is processing your request..."

---

### Auth Context (`context/AuthContext.js`)

> **Yeh React ka global state management hai** — seedha kaho toh ek shared storage jo sab components access kar sakein.

```javascript
// Kya store karta hai:
{ token: "eyJ...", isAuthenticated: true }

// Functions exposed:
login(token)   // localStorage mein save karo + state update karo
logout()       // localStorage se hato + state clear karo
```

Poori app `<AuthProvider>` se wrapped hai (App.js mein), toh koi bhi component `useAuth()` hook se token aur auth state access kar sakta hai.

---

### API Client (`services/api.js`)

```javascript
// Base config
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 25000,
});

// Request interceptor — auto JWT attachment
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Exported functions:
analyzeNewsText(newsText)          // POST /predict
analyzeNewsUrl(url)                // POST /analyze-url
getDashboardStats()                // GET /dashboard
```

---

## 9. Backend Services & ML Pipeline

### `ml/preprocessor.py`

```
Input: "The GOVERNMENT is RIGGING election!!! Visit http://spam.com"
   ↓ lowercase:       "the government is rigging election!!! visit http://spam.com"
   ↓ remove URLs:     "the government is rigging election!!!"
   ↓ remove punctuation/digits: "the government is rigging election"
   ↓ tokenize:        ["the", "government", "is", "rigging", "election"]
   ↓ remove stopwords: ["government", "rigging", "election"]
   ↓ remove short tokens (< 3 chars): (none removed here)
   ↓ Porter stemming: ["govern", "rig", "elect"]
Output: "govern rig elect"
```

> **Stemming kya hai?** "Running", "runs", "runner" sab ko "run" kar deta hai. Taaki model ko same cheez alag-alag forms mein na dikhni pade.

---

### `ml/predictor.py`

Main prediction function. Called on every `/predict` and `/analyze-url` request.

**Steps:**
1. `preprocess(text)` → clean the text
2. `vectorizer.transform([cleaned])` → convert text to a 50,000-number vector using CountVectorizer (each number = how many times a word appears)
3. `model.predict()` → Logistic Regression gives "FAKE" or "REAL"
4. `model.predict_proba()` → gives probability (confidence)
5. VADER sentiment analysis on the **original** (unprocessed) text
6. Credibility mapping based on prediction + confidence

---

### `ml/url_fetcher.py`

> **Yeh ek mini web scraper hai.** URL dene par ye automatically article ka text extract karta hai.

```
fetch_article("https://bbc.com/news/article-123")
  ↓
requests.get(url, headers={'User-Agent': ...}, timeout=12)
  ↓
BeautifulSoup parse HTML
  ↓ Try in order:
  1. <article> tag → extract all <p> text
  2. <main> tag → extract all <p> text
  3. All <p> tags on page → filter by length (> 50 chars)
  4. Find biggest <div> by text length
  ↓
Join paragraphs, clean whitespace
  ↓ Validate:
  - Must be at least 150 characters
  - Must not be a login/paywall page
  ↓
Return { title, text, domain }
```

---

### `ml/news_checker.py`

Live fact-checking against real news sources via NewsAPI.

**Trusted Domains List (partial):**
```
bbc.com, reuters.com, ndtv.com, thehindu.com, 
timesofindia.indiatimes.com, apnews.com, 
theguardian.com, hindustantimes.com, indianexpress.com,
aljazeera.com, bloomberg.com, economist.com ...
```

**Fake/Spam Domains List (partial):**
```
beforeitsnews.com, naturalnews.com, infowars.com,
worldnewsdailyreport.com, empirenews.net ...
```

**Process:**
```python
search_live_news("The government rigged the 2024 election by...")
  ↓
extract_keywords(text) → ["government", "rigged", "election", "2024"]
  ↓
NewsAPI query: q="government rigged election 2024"
              language="en", pageSize=10
  ↓
For each article → check if domain in TRUSTED_DOMAINS
  ↓
trusted_count = 0 → NOT_FOUND
trusted_count = 1-2 → PARTIALLY_CONFIRMED
trusted_count = 3+ → CONFIRMED
trusted_count = 0 but articles exist → UNVERIFIED
```

---

### `auth.py`

```python
# JWT Creation
create_access_token(user_id) → token string
  └─ payload = {"sub": user_id, "exp": now + 7 days}
  └─ jwt.encode(payload, SECRET_KEY, algorithm="HS256")

# JWT Verification
decode_access_token(token) → user_id (int) or None
  └─ jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
  └─ Returns None if expired or invalid

# Password Hashing
hash_password("mypassword123") → "$2b$12$..."  (bcrypt hash)
verify_password("mypassword123", "$2b$12$...") → True/False
```

---

### `database.py`

All SQLite operations. Uses raw SQL with parameterized queries (no ORM).

```python
init_db()                            # Create tables if not exist
create_user(username, password_hash) # INSERT into users
get_user_by_username(username)       # SELECT from users WHERE username = ?

save_prediction(                     # INSERT into predictions
    user_id, input_text, source_url,
    source_domain, prediction,
    confidence, sentiment, credibility,
    news_verdict, created_at
)

get_dashboard_stats(user_id)         # Aggregate stats + last 10 records
                                     # Returns total, fake_count, real_count,
                                     # fake_percentage, recent_analyses
```

---

### Override Logic (`main.py`)

> **Yeh ek interesting part hai.** Kabhi kabhi ML model galat hota hai (especially naye topics par). Agar NewsAPI confirm kar de ki khabar real hai, toh hum ML ka result override kar dete hain.

```
ML prediction: "Fake News" at 65% confidence
  + Live check: CONFIRMED (3 BBC/Reuters articles found)
  → OVERRIDE → "Real News" at 88% confidence

ML prediction: "Real News" at 72%
  + Domain check: domain is in FAKE_DOMAINS list
  → OVERRIDE → "Fake News" at 95% confidence

ML prediction: "Fake News" at 80%
  + Domain: bbc.com (HIGH credibility domain)
  → OVERRIDE → "Real News" at 90% confidence
```

---

## 10. Database Models

> **SQLite ek file-based database hai** — koi server install nahi, koi configuration nahi. Bas ek `.db` file create hoti hai.

Database file location: `backend/predictions.db`

---

### `users` Table

| Column | Type | Details |
|--------|------|---------|
| `id` | INTEGER | Primary Key, auto-increment |
| `username` | TEXT | Unique, not null |
| `password_hash` | TEXT | bcrypt hash, never plaintext |
| `created_at` | TEXT | ISO datetime string (UTC) |

---

### `predictions` Table

| Column | Type | Details |
|--------|------|---------|
| `id` | INTEGER | Primary Key, auto-increment |
| `user_id` | INTEGER | Nullable — NULL means anonymous user |
| `input_text` | TEXT | First 300 chars of article text |
| `source_url` | TEXT | URL if URL analysis, else NULL |
| `source_domain` | TEXT | e.g. "bbc.com", else NULL |
| `prediction` | TEXT | "Fake News" or "Real News" |
| `confidence` | REAL | Float, e.g. 87.3 |
| `sentiment` | TEXT | e.g. "Negative" |
| `credibility` | TEXT | e.g. "Low", "High" |
| `news_verdict` | TEXT | e.g. "CONFIRMED", "NOT_FOUND" |
| `created_at` | TEXT | ISO datetime string |

**Important notes:**
- `user_id = NULL` → anonymous analysis, still stored? No — anonymous analyses are **NOT saved**. Only authenticated users' analyses are saved.
- Input text is truncated to 300 characters to save space

---

## 11. Environment Variables & Configuration

### Backend (`backend/auth.py` and `backend/ml/news_checker.py`)

> **Warning:** Currently these are hardcoded in the source code. Ye production ke liye security risk hai. Inhe environment variables mein shift karna chahiye.

| Variable | Current Value | Description |
|----------|--------------|-------------|
| `SECRET_KEY` | `"super_secret_fake_news_key_change_in_prod"` | JWT signing key — must be changed in production |
| `ALGORITHM` | `"HS256"` | JWT algorithm |
| `NEWSAPI_KEY` | `"c2df4f5683f34f11bc1bc6e97326f5e3"` | NewsAPI key — exposed in code (risk!) |

### Frontend (`frontend/`)

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:8000` | Backend URL for API calls |

Create a `frontend/.env` file:
```bash
REACT_APP_API_URL=http://localhost:8000
```

### Recommended `.env` file for backend (create as `backend/.env`):
```bash
SECRET_KEY=your_very_long_random_secret_key_here_at_least_32_chars
NEWSAPI_KEY=your_newsapi_key_here
DATABASE_PATH=./predictions.db
```

---

## 12. Installation & Running Locally

### Prerequisites

- Python 3.9 or later
- Node.js 18 LTS or later
- A NewsAPI key (free at [newsapi.org](https://newsapi.org))
- The training datasets: `Fake.csv` and `True.csv` (place in `backend/data/`)

---

### Step 1 — Set Up & Train the Backend

```bash
cd ai-fake-news-main/backend

# Create Python virtual environment
python -m venv venv

# Activate it
source venv/bin/activate          # Linux/macOS
# venv\Scripts\activate           # Windows

# Install all Python dependencies
pip install -r requirements.txt
# Note: This installs scikit-learn, NLTK, FastAPI, etc. — takes a few minutes

# Download NLTK data (one-time)
python -c "import nltk; nltk.download('stopwords'); nltk.download('punkt')"

# Train the ML model (needs Fake.csv and True.csv in backend/data/)
python train_model.py
# This creates: backend/models/model.pkl and backend/models/vectorizer.pkl
# Training takes 2-5 minutes on a typical laptop

# Start the backend server
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

---

### Step 2 — Set Up the Frontend

```bash
cd ai-fake-news-main/frontend

# Install Node dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Start dev server
npm start
```

Frontend runs at: `http://localhost:3000`

---

### Step 3 — Build for Production

```bash
# Frontend build
cd frontend
npm run build
# Output: frontend/build/ — serve this with nginx or any static server

# Backend for production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
```

---

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `ModuleNotFoundError: nltk` | NLTK not installed | `pip install nltk` then download data |
| `FileNotFoundError: model.pkl` | Model not trained yet | Run `python train_model.py` first |
| `[SSL: CERTIFICATE_VERIFY_FAILED]` | URL fetcher SSL error | Backend handles this with `verify=False` fallback |
| `401 Unauthorized` on dashboard | Token expired or missing | Log out and log in again |
| `CORS error` in browser | Frontend URL not allowed | Backend has `allow_origins=["*"]` — should work in dev |
| `NewsAPI 429 Too Many Requests` | Rate limit hit (100/day) | Wait 24 hours or use a different API key |
| `ValueError: X has n features, expected m` | Vectorizer mismatch | Retrain model → `python train_model.py` |

---

## 13. User Flow — Step by Step

```
1. Open http://localhost:3000
   → Lands on HomePage

2. Click "Analyze News Text" button
   → Goes to /analyze
   → No login required

3. Paste a suspicious article (min 100 chars)
   Click "Analyze for Fake News"
   → Loader animation shows

4. Backend Processing (~3-8 seconds):
   a. Text cleaned with NLP
   b. ML model predicts Fake/Real
   c. VADER sentiment analyzed
   d. NewsAPI searched for keywords
   e. Override logic applied
   f. Result prepared

5. ResultCard displayed:
   → FAKE NEWS badge (red) or REAL NEWS badge (green)
   → Confidence: 87.3%
   → Sentiment: Negative
   → Credibility: Low
   → AI Summary text
   → Live News Cross-Check: NOT_FOUND (or matching articles)

   (Not logged in? Result shown but NOT saved to history)

6. Register (optional, for history)
   → Go to /register
   → Enter username + password
   → Account created in SQLite
   → Redirect to /login

7. Login
   → POST /login → get JWT token
   → Token saved in localStorage
   → Redirect to /dashboard

8. Analyze again (now logged in)
   → Same flow as step 3-5
   → BUT now prediction saved to DB

9. Dashboard → /dashboard
   → Total Analyzed: 5
   → Fake: 3 (60%)
   → Real: 2 (40%)
   → Pie chart shows ratio
   → Table shows last 10 with timestamps

10. Logout
    → JWT removed from localStorage
    → Redirected to /login
    → Dashboard inaccessible again
```

---

## 14. Key Algorithms & Logic

### Text Preprocessing Pipeline

```python
# Example: Fake news headline
raw = "BREAKING: Government SECRETLY poisoning water supply!! Share before deleted!! http://fakespace.info"

step1_lower = "breaking: government secretly poisoning water supply!! share before deleted!! http://fakespace.info"
step2_no_urls = "breaking: government secretly poisoning water supply!! share before deleted!!"
step3_no_punct = "breaking government secretly poisoning water supply share before deleted"
step4_tokenize = ["breaking", "government", "secretly", "poisoning", "water", "supply", "share", "before", "deleted"]
step5_no_stopwords = ["breaking", "government", "secretly", "poisoning", "water", "supply", "share", "deleted"]
step6_no_short = (same — all are 4+ chars)
step7_stemmed = ["break", "govern", "secret", "poison", "water", "suppli", "share", "delet"]

final = "break govern secret poison water suppli share delet"
```

### CountVectorizer (Text → Numbers)

> **CountVectorizer kya karta hai?** Ye ek vocabulary banata hai training ke time — e.g. 50,000 sabse common words. Phir har article ke liye ek vector banata hai: `[0, 1, 0, 3, ...]` jahan number = us word ki count.

```
Vocabulary (partial): [..., "govern": 1234, "poison": 5678, "elect": 2345, ...]

Article vector: [0, 0, ..., 1 (at index 1234), ..., 2 (at index 5678), ..., 0]
Shape: (1, 50000) sparse matrix
```

### Logistic Regression

> **Logistic Regression kya hai?** Ek simple math formula jo input numbers (word counts) ko leke 0–1 probability deta hai. 0.5 se zyada = Real, 0.5 se kam = Fake. Training mein 44,000 articles dekhe the.

- Input: 50,000-dimensional vector
- Output: probability score between 0.0 and 1.0
- > 0.5 → "Real News"
- < 0.5 → "Fake News"
- Distance from 0.5 = confidence (0.9 means 90% confident)

### Credibility Mapping

```python
if prediction == "FAKE":
    if confidence >= 0.90:  credibility = "Very Low"
    elif confidence >= 0.75: credibility = "Low"
    else:                    credibility = "Uncertain"
else:  # REAL
    if confidence >= 0.90:  credibility = "High"
    elif confidence >= 0.75: credibility = "Medium-High"
    else:                    credibility = "Medium"
```

### Favorite Artist Personalization *(Not applicable here)*

*(This was a MoodTune feature. TruthLens does not have this.)*

### VADER Sentiment

VADER (Valence Aware Dictionary and sEntiment Reasoner) is a rule-based sentiment tool built for social media and news text. It returns a `compound` score between -1.0 and +1.0.

```python
# TruthLens mapping:
compound >= 0.5   → "Positive"
compound >= 0.1   → "Slightly Positive"
compound > -0.1   → "Neutral"
compound > -0.5   → "Negative"
compound <= -0.5  → "Highly Negative"
```

---

## 15. Security Notes & Known Risks

Ye issues abhi code mein hain. Production deploy karne se pehle inhe fix karna zaruri hai.

| Risk | Severity | Problem | Fix |
|------|----------|---------|-----|
| Hardcoded JWT secret | **High** | `SECRET_KEY = "super_secret_..."` in `auth.py` | Move to environment variable, use 256-bit random key |
| Exposed NewsAPI key | **High** | API key visible in `news_checker.py` source code | Move to `.env` file, never commit keys |
| CORS allows all | **Medium** | `allow_origins=["*"]` in `main.py` | Restrict to frontend domain in production |
| No rate limiting | **Medium** | `/predict` does ML + NewsAPI call — open to abuse | Add `slowapi` rate limiting middleware |
| No HTTPS | **High** (prod) | All tokens sent over plain HTTP | Add Nginx with SSL/TLS in production |
| Token in localStorage | **Medium** | XSS attacks can steal token from localStorage | Use `httpOnly` cookies instead (requires backend change) |
| No input sanitization | **Low** | Text stored in DB (SQL injection risk low — parameterized queries used) | Still worth sanitizing for XSS in frontend display |
| SQLite in production | **Medium** | SQLite has no concurrent write support | Switch to PostgreSQL via `DATABASE_URL` config |
| No test suite | **Low** | Zero unit/integration tests | Add pytest for backend, Jest for frontend |
| `passlib` version | **Low** | passlib 1.7.4 is old | Update to latest or use bcrypt directly |

---

## 16. Training Data

The ML model was trained on two publicly available datasets (kaggle):

### Dataset Overview

| File | Articles | Label |
|------|----------|-------|
| `backend/data/Fake.csv` | ~23,500 | Fake News |
| `backend/data/True.csv` | ~21,400 | Real News |
| **Total** | **~44,900** | — |

> **Note:** These CSV files are **not in the git repository** (they're large). You need to download them separately from Kaggle: *"Fake and real news dataset"* by Climent Casals.

### Dataset Columns

Each CSV has 4 columns:
```
title       - Headline of the article
text        - Full article body
subject     - Category (politics, world news, etc.)
date        - Publication date
```

### Training Process (`train_model.py`)

```
Load Fake.csv + True.csv
  ↓
Add label column: Fake=0, Real=1
  ↓
Combine title + text into single string per article
  ↓
Apply preprocessor.preprocess() on each article
  ↓
CountVectorizer.fit_transform(all_cleaned_text)
→ Creates vocabulary of 50,000 most common words
→ Transforms each article to a 50,000-dim sparse vector
  ↓
Train/test split: 80% train, 20% test
  ↓
LogisticRegression.fit(X_train, y_train)
  ↓
Evaluate: model.score(X_test, y_test) → ~98-99% accuracy
  ↓
Save:
  pickle.dump(model, "backend/models/model.pkl")
  pickle.dump(vectorizer, "backend/models/vectorizer.pkl")
```

> **Accuracy 98% kaise? Simple hai:** Training data mostly political news tha (US elections, Trump/Clinton era articles). In-domain pe accuracy high hai. Lekin real-world mein naye types ke fake news (WhatsApp forwards, health misinformation) pe accuracy kam ho sakti hai kyunki training data mein woh patterns nahi the. This is called **domain shift**.

---

*Documentation for TruthLens AI — MCA Final Year Project (SPPU)*
