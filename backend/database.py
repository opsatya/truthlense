import sqlite3
import os
from datetime import datetime, timezone
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "predictions.db")


def _conn() -> sqlite3.Connection:
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    return c


def init_db():
    c = _conn()
    c.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id       INTEGER,
            input_text    TEXT,
            source_url    TEXT,
            source_domain TEXT,
            prediction    TEXT    NOT NULL,
            confidence    REAL    NOT NULL,
            sentiment     TEXT,
            credibility   TEXT,
            news_verdict  TEXT,
            created_at    TEXT    NOT NULL
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    try:
        c.execute("ALTER TABLE predictions ADD COLUMN user_id INTEGER")
    except sqlite3.OperationalError:
        pass
    c.commit()
    c.close()
    print("[✓] Database ready.")


def save_prediction(
    prediction: str, confidence: float, sentiment: str,
    credibility: str, input_text: str = "",
    source_url: Optional[str] = None,
    source_domain: Optional[str] = None,
    news_verdict: Optional[str] = None,
    user_id: Optional[int] = None,
):
    c = _conn()
    c.execute(
        """INSERT INTO predictions
           (user_id,input_text,source_url,source_domain,prediction,confidence,
            sentiment,credibility,news_verdict,created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?)""",
        (
            user_id, input_text[:300], source_url, source_domain,
            prediction, round(confidence, 1),
            sentiment, credibility, news_verdict,
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    c.commit()
    c.close()

def create_user(username: str, password_hash: str):
    c = _conn()
    try:
        c.execute("INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
                  (username, password_hash, datetime.now(timezone.utc).isoformat()))
        c.commit()
    except sqlite3.IntegrityError:
        return False
    finally:
        c.close()
    return True

def get_user_by_username(username: str):
    c = _conn()
    user = c.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    c.close()
    return dict(user) if user else None


def get_dashboard_stats(user_id: Optional[int] = None) -> dict:
    c    = _conn()
    if user_id:
        rows = c.execute("SELECT * FROM predictions WHERE user_id = ? ORDER BY id DESC", (user_id,)).fetchall()
    else:
        rows = []
    c.close()

    total = len(rows)
    if total == 0:
        return {
            "total_analyzed": 0, "fake_count": 0, "real_count": 0,
            "fake_percentage": 0.0, "recent_analyses": [],
        }

    fake_rows = [r for r in rows if r["prediction"] == "FAKE"]
    real_rows = [r for r in rows if r["prediction"] == "REAL"]

    recent = [
        {
            "id":          r["id"],
            "prediction":  "Fake News" if r["prediction"] == "FAKE" else "Real News",
            "confidence":  f"{r['confidence']}%",
            "sentiment":   r["sentiment"],
            "credibility": r["credibility"],
            "source":      r["source_domain"] or "Text input",
            "created_at":  r["created_at"],
        }
        for r in rows[:10]
    ]

    return {
        "total_analyzed":  total,
        "fake_count":      len(fake_rows),
        "real_count":      len(real_rows),
        "fake_percentage": round(len(fake_rows) / total * 100, 1),
        "recent_analyses": recent,
    }
