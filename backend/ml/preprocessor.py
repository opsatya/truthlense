import re
import nltk

nltk.download("stopwords", quiet=True)
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

_STOP_WORDS = set(stopwords.words("english"))
_stemmer    = PorterStemmer()


def preprocess(text: str) -> str:
    """
    Full NLP preprocessing pipeline — must stay identical to train_model.py:
      1. Lowercase
      2. Remove URLs
      3. Remove punctuation / digits / special chars
      4. Tokenise
      5. Remove stopwords + short tokens
      6. Porter stemming
    """
    if not text or not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"[^a-z\s]", " ", text)
    tokens = text.split()
    tokens = [t for t in tokens if t not in _STOP_WORDS and len(t) > 2]
    tokens = [_stemmer.stem(t) for t in tokens]
    return " ".join(tokens)
