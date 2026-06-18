import os
import pickle

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from ml.preprocessor import preprocess

BASE_DIR   = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "model.pkl")
VEC_PATH   = os.path.join(BASE_DIR, "models", "vectorizer.pkl")

_model      = None
_vectorizer = None
_vader      = SentimentIntensityAnalyzer()


def load_model():
    global _model, _vectorizer
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VEC_PATH):
        raise FileNotFoundError(
            "model.pkl or vectorizer.pkl not found.\n"
            "Run:  python train_model.py   first."
        )
    with open(MODEL_PATH, "rb") as f:
        _model = pickle.load(f)
    with open(VEC_PATH, "rb") as f:
        _vectorizer = pickle.load(f)
    print("[✓] Model and vectorizer loaded.")


def _get_sentiment(raw_text: str) -> str:
    c = _vader.polarity_scores(raw_text)["compound"]
    if c >= 0.5:   return "Positive"
    if c >= 0.05:  return "Slightly Positive"
    if c <= -0.5:  return "Highly Negative"
    if c <= -0.05: return "Negative"
    return "Neutral"


def _get_credibility(prediction: str, confidence: float) -> str:
    if prediction == "FAKE":
        return "Very Low" if confidence >= 0.90 else "Low" if confidence >= 0.75 else "Uncertain"
    return "High" if confidence >= 0.90 else "Medium-High" if confidence >= 0.75 else "Medium"


def _make_summary(raw_text: str, prediction: str) -> str:
    snippet = raw_text.strip()[:200].replace("\n", " ")
    if len(raw_text) > 200:
        snippet += "..."
    prefix = (
        "This article contains language patterns commonly associated with misinformation. "
        if prediction == "FAKE" else
        "This article appears to be written in a factual, measured tone consistent with credible reporting. "
    )
    return prefix + f'Article begins: "{snippet}"'


def predict(text: str) -> dict:
    if _model is None or _vectorizer is None:
        raise RuntimeError("Model not loaded. Call load_model() first.")
    if not text or not text.strip():
        raise ValueError("Input text cannot be empty.")

    clean      = preprocess(text)
    vec        = _vectorizer.transform([clean])
    label      = _model.predict(vec)[0]
    proba      = _model.predict_proba(vec)[0]
    classes    = list(_model.classes_)
    confidence = float(proba[classes.index(label)])

    return {
        "prediction":      "Fake News" if label == "FAKE" else "Real News",
        "confidence":      f"{confidence * 100:.1f}%",
        "confidence_raw":  round(confidence * 100, 1),
        "summary":         _make_summary(text, label),
        "sentiment":       _get_sentiment(text),
        "credibility":     _get_credibility(label, confidence),
        "label_raw":       label,
    }
