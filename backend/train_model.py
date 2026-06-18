"""
train_model.py
==============
Run ONCE before starting the server.

    python train_model.py

Expects:  data/Fake.csv  and  data/True.csv  (from Kaggle)
Produces: models/model.pkl  and  models/vectorizer.pkl
"""

import os, pickle, re
import pandas as pd
import nltk

nltk.download("stopwords", quiet=True)
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

STOP_WORDS = set(stopwords.words("english"))
stemmer    = PorterStemmer()

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


# ── Load ──────────────────────────────────────────────────────
def load_dataset():
    fake_p = os.path.join(DATA_DIR, "Fake.csv")
    real_p = os.path.join(DATA_DIR, "True.csv")
    single = os.path.join(DATA_DIR, "fake_or_real_news.csv")

    if os.path.exists(fake_p) and os.path.exists(real_p):
        print("[INFO] Loading Fake.csv + True.csv ...")
        fake_df = pd.read_csv(fake_p)
        real_df = pd.read_csv(real_p)
        fake_df["label"] = "FAKE"
        real_df["label"] = "REAL"
        df = pd.concat([fake_df, real_df], ignore_index=True)
    elif os.path.exists(single):
        print(f"[INFO] Loading {single} ...")
        df = pd.read_csv(single)
        df["label"] = df["label"].str.upper().str.strip()
    else:
        raise FileNotFoundError(
            "\n[ERROR] No dataset found!\n"
            "Put  Fake.csv  and  True.csv  inside the  data/  folder.\n"
            "Download from: https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset\n"
        )

    if "title" in df.columns and "text" in df.columns:
        df["content"] = df["title"].fillna("") + " " + df["text"].fillna("")
    elif "text" in df.columns:
        df["content"] = df["text"].fillna("")
    else:
        raise ValueError("Dataset must have a 'text' column.")

    df = df.dropna(subset=["content", "label"])
    df = df[df["content"].str.strip() != ""]
    print(f"[INFO] Loaded {len(df)} rows — FAKE={sum(df['label']=='FAKE')} REAL={sum(df['label']=='REAL')}")
    return df


# ── Clean (must match preprocessor.py) ───────────────────────
def clean_text(text: str) -> str:
    text   = text.lower()
    text   = re.sub(r"http\S+|www\S+", "", text)
    text   = re.sub(r"[^a-z\s]", " ", text)
    tokens = text.split()
    tokens = [t for t in tokens if t not in STOP_WORDS and len(t) > 2]
    tokens = [stemmer.stem(t) for t in tokens]
    return " ".join(tokens)


# ── Train ─────────────────────────────────────────────────────
def train():
    df = load_dataset()

    print("[INFO] Cleaning text (1–3 min on a normal laptop)...")
    df["clean"] = df["content"].apply(clean_text)

    X_train, X_test, y_train, y_test = train_test_split(
        df["clean"], df["label"], test_size=0.2, random_state=42, stratify=df["label"]
    )

    print("[INFO] Fitting CountVectorizer ...")
    vectorizer  = CountVectorizer(max_features=50000, ngram_range=(1, 2))
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec  = vectorizer.transform(X_test)

    print("[INFO] Training Logistic Regression ...")
    model = LogisticRegression(max_iter=1000, solver="lbfgs", C=1.0, random_state=42, n_jobs=-1)
    model.fit(X_train_vec, y_train)

    y_pred = model.predict(X_test_vec)
    print("\n" + "="*55)
    print(f"  Accuracy : {accuracy_score(y_test, y_pred)*100:.2f}%")
    print("="*55)
    print(classification_report(y_test, y_pred))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("="*55 + "\n")

    os.makedirs("models", exist_ok=True)
    with open("models/model.pkl",      "wb") as f: pickle.dump(model, f)
    with open("models/vectorizer.pkl", "wb") as f: pickle.dump(vectorizer, f)

    print("[✓] models/model.pkl saved")
    print("[✓] models/vectorizer.pkl saved")
    print("\n✅ Training complete! Now run:  uvicorn main:app --reload --port 8000\n")


if __name__ == "__main__":
    train()
