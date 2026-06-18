import re
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

_NOISE_TAGS = [
    "script","style","noscript","nav","header","footer",
    "aside","form","figure","figcaption","iframe",
]

MIN_TEXT_LENGTH = 150


def fetch_article(url: str) -> dict:
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            raise ValueError("URL must start with http:// or https://")
        domain = parsed.netloc
    except Exception:
        raise ValueError(f"Invalid URL: {url}")

    try:
        resp = requests.get(url, headers=_HEADERS, timeout=12)
        resp.raise_for_status()
    except requests.exceptions.Timeout:
        raise ValueError("Request timed out. The website took too long to respond.")
    except requests.exceptions.ConnectionError:
        raise ValueError("Could not connect to the website. Check the URL.")
    except requests.exceptions.HTTPError as e:
        raise ValueError(f"Website returned error {e.response.status_code}.")

    soup = BeautifulSoup(resp.text, "html.parser")
    for tag in soup(_NOISE_TAGS):
        tag.decompose()

    title = ""
    if soup.title and soup.title.string:
        title = soup.title.string.strip()
    elif soup.find("h1"):
        title = soup.find("h1").get_text(strip=True)

    text = _try_article_tag(soup)
    if not text or len(text) < MIN_TEXT_LENGTH:
        text = _try_main_tag(soup)
    if not text or len(text) < MIN_TEXT_LENGTH:
        text = _try_paragraphs(soup)
    if not text or len(text) < MIN_TEXT_LENGTH:
        text = _try_biggest_div(soup)
    if not text or len(text) < MIN_TEXT_LENGTH:
        raise ValueError(
            "Could not extract enough text from this URL. "
            "Try the Text Analyzer instead."
        )

    return {"text": _clean(text), "title": title, "domain": domain}


def _try_article_tag(soup):
    a = soup.find("article")
    return a.get_text(separator=" ", strip=True) if a else ""

def _try_main_tag(soup):
    m = soup.find("main")
    return m.get_text(separator=" ", strip=True) if m else ""

def _try_paragraphs(soup):
    return " ".join(p.get_text(strip=True) for p in soup.find_all("p") if len(p.get_text(strip=True)) > 60)

def _try_biggest_div(soup):
    best, best_n = None, 0
    for div in soup.find_all("div"):
        n = len(div.find_all("p"))
        if n > best_n:
            best_n, best = n, div
    return best.get_text(separator=" ", strip=True) if best else ""

def _clean(text):
    return re.sub(r"\s+", " ", text).strip()[:8000]
