"""Train the phishing text classifier and save it to backend/phishing_model.pkl.

Run:  python train_model.py
"""

from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline

BACKEND_DIR = Path(__file__).resolve().parent
DATA_PATH = BACKEND_DIR.parent / "data" / "phishingdata.csv"
MODEL_PATH = BACKEND_DIR / "phishing_model.pkl"

LABELS = {"legitimate": 0, "safe": 0, "ham": 0, "phishing": 1, "spam": 1}


def load_dataset(path=DATA_PATH):
    if not Path(path).exists():
        raise FileNotFoundError(f"Dataset not found: {path}")

    df = pd.read_csv(path)
    if not {"text", "label"}.issubset(df.columns):
        raise ValueError("Dataset must have 'text' and 'label' columns.")

    df = df[["text", "label"]].dropna()
    df["label"] = df["label"].str.strip().str.lower().map(LABELS)
    df = df.dropna()
    return df["text"], df["label"].astype(int)


def build_model():
    return Pipeline([
        ("tfidf", TfidfVectorizer(stop_words="english", ngram_range=(1, 2), sublinear_tf=True)),
        ("clf", LogisticRegression(C=10, max_iter=1000, class_weight="balanced")),
    ])


def train_and_save(verbose=True):
    X, y = load_dataset()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    model = build_model().fit(X_train, y_train)

    if verbose:
        preds = model.predict(X_test)
        cv = cross_val_score(build_model(), X, y, cv=5)
        print(f"Samples: {len(X)}  (phishing: {int(y.sum())}, legitimate: {int((y == 0).sum())})")
        print(f"Hold-out accuracy: {accuracy_score(y_test, preds):.2%}")
        print(f"5-fold CV accuracy: {cv.mean():.2%} ± {cv.std():.2%}")
        print(classification_report(y_test, preds, target_names=["legitimate", "phishing"], zero_division=0))

    # Refit on all data for the saved model.
    model = build_model().fit(X, y)
    joblib.dump(model, MODEL_PATH)
    if verbose:
        print(f"Model saved to {MODEL_PATH}")
    return model


if __name__ == "__main__":
    train_and_save()
