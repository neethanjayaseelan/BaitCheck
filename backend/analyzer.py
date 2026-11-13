"""Shared phishing analysis logic used by the Flask API and the Streamlit demo.

Combines a trained scikit-learn text classifier (TF-IDF + logistic regression)
with a few rule-based checks that explain *why* a message looks suspicious.
"""

from pathlib import Path
import re

import joblib

BACKEND_DIR = Path(__file__).resolve().parent
MODEL_PATH = BACKEND_DIR / "phishing_model.pkl"
DATA_PATH = BACKEND_DIR.parent / "data" / "phishingdata.csv"

HIGH_RISK = 0.7
MEDIUM_RISK = 0.4

INDICATOR_PATTERNS = {
    "Urgent language": re.compile(
        r"\b(urgent|act now|immediately|asap|limited time|final notice|now or never)\b", re.I
    ),
    "Password request": re.compile(
        r"\b(password|login|code|verify|confirm|security question|account details|credentials)\b", re.I
    ),
    "Suspicious links": re.compile(
        r"https?://|hxxps?://|www\.|click here|verify your|update your|confirm your", re.I
    ),
    "Impersonation": re.compile(
        r"\b(bank|paypal|amazon|apple|microsoft|verification|security alert|account suspended|billing)\b", re.I
    ),
}

NEXT_STEPS = [
    "Do not click any suspicious links.",
    "Avoid opening attachments from unknown senders.",
    "Verify through the official company website or app.",
    "Report the message if it appears malicious.",
]


def load_model():
    """Load the trained model, training it first if it doesn't exist yet."""
    if not MODEL_PATH.exists():
        from train_model import train_and_save

        train_and_save()
    return joblib.load(MODEL_PATH)


def find_indicators(text):
    return [name for name, pattern in INDICATOR_PATTERNS.items() if pattern.search(text)]


def risk_level(score):
    if score > HIGH_RISK:
        return "High"
    if score > MEDIUM_RISK:
        return "Medium"
    return "Low"


def analyze(text, model):
    """Return a JSON-serialisable analysis of a message."""
    score = float(model.predict_proba([text])[0][1])
    indicators = find_indicators(text)
    level = risk_level(score)

    if level == "High":
        summary = "The model rates this message as likely phishing. Treat it as malicious until verified."
    elif level == "Medium":
        summary = "Some suspicious content was found. Verify the sender and context before acting."
    else:
        summary = "No strong phishing patterns were detected, but always stay cautious with unexpected requests."

    return {
        "prediction": "phishing" if score >= 0.5 else "legitimate",
        "score": f"{round(score * 100)}%",
        "probability": round(score, 4),
        "riskLevel": level,
        "indicators": indicators or ["No common red flags found"],
        "summary": summary,
        "nextSteps": NEXT_STEPS,
        "source": "model",
    }
