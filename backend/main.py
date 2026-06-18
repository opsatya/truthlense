"""
main.py — FastAPI backend for AI Fake News Detection System
Run: uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, field_validator
import traceback
from datetime import timedelta

from auth import create_access_token, verify_password, get_password_hash, decode_access_token
from ml.predictor   import predict, load_model
from ml.url_fetcher import fetch_article
from ml.news_checker import search_live_news, check_domain_credibility
from database       import init_db, save_prediction, get_dashboard_stats, create_user, get_user_by_username

app = FastAPI(
    title="Fake News Detection API",
    description="AI-powered fake news detection — Logistic Regression + NLP + Live news cross-check",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()
    load_model()

security = HTTPBearer(auto_error=False)

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials:
        payload = decode_access_token(credentials.credentials)
        if payload and "sub" in payload:
            return payload["sub"]
    return None


# ── Request models ────────────────────────────────────────────

class TextRequest(BaseModel):
    text: str

    @field_validator("text")
    @classmethod
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("text field cannot be empty.")
        if len(v.strip()) < 30:
            raise ValueError("Please provide at least 30 characters.")
        return v.strip()


class UrlRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def valid_url(cls, v):
        v = v.strip()
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v

class UserRequest(BaseModel):
    username: str
    password: str


# ── Routes ────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "message": "Fake News Detection API is running."}

@app.post("/register")
def register(req: UserRequest):
    if create_user(req.username, get_password_hash(req.password)):
        return {"message": "User created successfully"}
    raise HTTPException(status_code=400, detail="Username already exists")

@app.post("/login")
def login(req: UserRequest):
    user = get_user_by_username(req.username)
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    access_token = create_access_token(data={"sub": user["id"]}, expires_delta=timedelta(days=7))
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/predict")
def predict_text(req: TextRequest, user_id: int = Depends(get_current_user_id)):
    """Analyze raw news text — ML model + live news cross-check."""
    try:
        result     = predict(req.text)
        news_check = search_live_news(req.text)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Prediction failed.")

    # Override verdict based on live news if API is available
    final_prediction = result["prediction"]
    final_confidence = result["confidence"]

    nv = news_check.get("verdict", "")
    if nv == "CONFIRMED":
        final_prediction = "Real News"
        final_confidence = f"{max(result['confidence_raw'], 88.0):.1f}%"
    elif nv == "NOT_FOUND":
        final_prediction = result["prediction"]
        final_confidence = result["confidence"]

    if user_id:
        try:
            save_prediction(
                prediction    = "FAKE" if "Fake" in final_prediction else "REAL",
                confidence    = float(final_confidence.replace("%", "")),
                sentiment     = result["sentiment"],
                credibility   = result["credibility"],
                input_text    = req.text,
                news_verdict  = nv or None,
                user_id       = user_id,
            )
        except Exception:
            traceback.print_exc()

    return {
        "prediction":     final_prediction,
        "confidence":     final_confidence,
        "summary":        result["summary"],
        "sentiment":      result["sentiment"],
        "credibility":    result["credibility"],
        "news_check":     news_check,
        "source_domain":  None,
        "extracted_title": None,
    }


@app.post("/analyze-url")
def analyze_url(req: UrlRequest, user_id: int = Depends(get_current_user_id)):
    """Fetch article from URL → ML model + live news cross-check."""
    try:
        article    = fetch_article(req.url)
        domain_cred = check_domain_credibility(req.url)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch article.")

    try:
        result     = predict(article["text"])
        news_check = search_live_news(article["text"])
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Prediction failed.")

    # Use domain credibility to override if it's a known source
    credibility = domain_cred["credibility"] if domain_cred["credibility"] != "Unknown" \
        else result["credibility"]

    final_prediction = result["prediction"]
    final_confidence = result["confidence"]
    nv = news_check.get("verdict", "")

    if domain_cred["credibility"] == "High":
        final_prediction = "Real News"
        final_confidence = f"{max(result['confidence_raw'], 90.0):.1f}%"
    elif domain_cred["credibility"] == "Very Low":
        final_prediction = "Fake News"
        final_confidence = "95.0%"
    elif nv == "CONFIRMED":
        final_prediction = "Real News"
        final_confidence = f"{max(result['confidence_raw'], 88.0):.1f}%"
    elif nv == "NOT_FOUND":
        final_prediction = result["prediction"]
        final_confidence = result["confidence"]

    if user_id:
        try:
            save_prediction(
                prediction    = "FAKE" if "Fake" in final_prediction else "REAL",
                confidence    = float(final_confidence.replace("%", "")),
                sentiment     = result["sentiment"],
                credibility   = credibility,
                input_text    = article["text"],
                source_url    = req.url,
                source_domain = article["domain"],
                news_verdict  = nv or None,
                user_id       = user_id,
            )
        except Exception:
            traceback.print_exc()

    return {
        "prediction":      final_prediction,
        "confidence":      final_confidence,
        "summary":         result["summary"],
        "sentiment":       result["sentiment"],
        "credibility":     credibility,
        "news_check":      news_check,
        "source_domain":   article["domain"],
        "extracted_title": article["title"],
    }


@app.get("/dashboard")
def dashboard(user_id: int = Depends(get_current_user_id)):
    """Live prediction stats from SQLite."""
    if not user_id:
        raise HTTPException(status_code=401, detail="Please log in to view your dashboard history.")
    try:
        return get_dashboard_stats(user_id)
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to load dashboard data.")
