import requests
from ml.preprocessor import preprocess

# -------------------------------------------------------
# Get your FREE API key at https://newsapi.org (100 req/day)
# Paste it below:
# -------------------------------------------------------
NEWSAPI_KEY = "c2df4f5683f34f11bc1bc6e97326f5e3"

TRUSTED_DOMAINS = {
    "bbc.com", "reuters.com", "ndtv.com", "thehindu.com",
    "timesofindia.com", "apnews.com", "theguardian.com",
    "hindustantimes.com", "indianexpress.com", "ani.in",
    "aljazeera.com", "bloomberg.com", "cnn.com", "nytimes.com",
}

FAKE_DOMAINS = {
    "theonion.com", "babylonbee.com", "clickhole.com",
    "worldnewsdailyreport.com", "empirenews.net",
}


import re

def extract_keywords(text: str) -> str:
    """Pull 5-8 meaningful words for the search query without stemming."""
    if not text: return ""
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    tokens = text.split()
    stops = {"the","and","this","that","with","from","your","what","when","where","how","why","who","will","would","could","should","have","been","they"}
    words = [t for t in tokens if len(t) > 3 and t.lower() not in stops]
    return " ".join(words[:8])


def search_live_news(claim: str) -> dict:
    """
    Searches NewsAPI for the claim.
    Returns how many trusted sources reported it + matched articles.

    Verdict codes:
      CONFIRMED            – 3+ trusted sources found
      PARTIALLY_CONFIRMED  – 1-2 trusted sources
      UNVERIFIED           – articles exist but none from trusted list
      NOT_FOUND            – nothing found → strong fake signal
      API_UNAVAILABLE      – key not set or network error
    """
    if NEWSAPI_KEY == "YOUR_NEWSAPI_KEY_HERE":
        return {
            "found": False, "trusted_match_count": 0,
            "matched_articles": [], "verdict": "API_UNAVAILABLE",
            "search_query": "", "note": "Add your NewsAPI key in ml/news_checker.py"
        }

    query = extract_keywords(claim)
    if not query:
        return {
            "found": False, "trusted_match_count": 0,
            "matched_articles": [], "verdict": "NOT_FOUND",
            "search_query": query,
        }

    try:
        resp = requests.get(
            "https://newsapi.org/v2/everything",
            params={
                "q":        query,
                "language": "en",
                "pageSize": 50,
                "sortBy":   "relevancy",
                "apiKey":   NEWSAPI_KEY,
            },
            timeout=8,
        )
        data = resp.json()
    except Exception as e:
        return {
            "found": False, "trusted_match_count": 0,
            "matched_articles": [], "verdict": "API_UNAVAILABLE",
            "search_query": query, "note": str(e),
        }

    articles     = data.get("articles", [])
    trusted_hits = []

    for article in articles:
        url = article.get("url", "").lower()
        for td in TRUSTED_DOMAINS:
            if td in url:
                trusted_hits.append({
                    "title":     article.get("title", ""),
                    "source":    article.get("source", {}).get("name", ""),
                    "url":       article.get("url", ""),
                    "published": article.get("publishedAt", ""),
                })
                break

    count = len(trusted_hits)

    if count >= 3:
        verdict = "CONFIRMED"
    elif count >= 1:
        verdict = "PARTIALLY_CONFIRMED"
    elif len(articles) >= 3:
        verdict = "UNVERIFIED"
    else:
        verdict = "NOT_FOUND"

    return {
        "found":               count > 0,
        "total_results":       data.get("totalResults", 0),
        "trusted_match_count": count,
        "matched_articles":    trusted_hits[:3],
        "verdict":             verdict,
        "search_query":        query,
    }


def check_domain_credibility(url: str) -> dict:
    url_lower = url.lower()
    for domain in TRUSTED_DOMAINS:
        if domain in url_lower:
            return {"credibility": "High", "reason": f"Known trusted source: {domain}"}
    for domain in FAKE_DOMAINS:
        if domain in url_lower:
            return {"credibility": "Very Low", "reason": f"Known satire/fake site: {domain}"}
    return {"credibility": "Unknown", "reason": "Domain not in known list"}
