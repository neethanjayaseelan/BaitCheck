# Baitcheck: Phishing Message Detector

Baitcheck is a full-stack web app that checks emails and messages for phishing and tracks real phishing scams in the news. Paste a suspicious message and it returns:

- a **phishing probability** from a machine-learning text classifier
- a **risk level** (Low / Medium / High)
- the **red flags** it found (urgent language, credential requests, suspicious links, brand impersonation)
- **recommended next steps**

It also shows a live feed of recent phishing and scam stories from news outlets in six countries (US, UK, Canada, India, Australia, Singapore) and from security news sites.

<!-- Add a screenshot: save one as docs/screenshot.png and uncomment the line below -->
<!-- ![Baitcheck screenshot](docs/screenshot.png) -->

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Python, Flask REST API, RSS aggregation (standard library), unittest |
| Machine learning | scikit-learn (TF-IDF + logistic regression), pandas, joblib |
| Alternative UI | Streamlit |

## How it works

```
React UI  ──POST /analyze──▶  Flask API  ──▶  TF-IDF + Logistic Regression
   │                              │                (phishing probability)
   │                              └──▶  Rule-based checks (why it was flagged)
   └── falls back to keyword rules in the browser if the API is offline

React UI  ──GET /news──▶  Flask API  ──▶  Google News RSS (6 countries) + security news RSS
                                           (filtered, de-duplicated, cached for 30 minutes)
```

1. **Training** (`backend/train_model.py`): loads labelled messages from `data/phishingdata.csv`, turns the text into TF-IDF features (single words and two-word phrases), trains a logistic regression classifier, reports hold-out and 5-fold cross-validation accuracy, and saves the model.
2. **Inference** (`backend/server.py`): a Flask API loads the model and exposes `POST /analyze`. It combines the model's probability with regex-based indicators that explain the result.
3. **Frontend** (`frontend/`): a React app sends the message to the API, shows the score on a risk meter, and highlights the suspicious phrases inside the message itself. If the API can't be reached, it falls back to an in-browser rule-based check and labels the result accordingly.
4. **Scam news** (`backend/news.py`): fetches public RSS feeds in parallel, keeps only phishing and scam stories, removes duplicates, sorts newest first, and limits how many stories one country or site can contribute so the list stays international. Results are cached for 30 minutes, and the last good list is kept if the feeds are unreachable.

## Getting started

**Requirements:** Python 3.10+ and Node.js 18+

```bash
git clone https://github.com/neethanjayaseelan/Baitcheck.git
cd Baitcheck
```

### Quick start (Windows)

Double-click `start.bat`. On the first run it installs everything, then it opens the API and the website in two windows. Visit the URL Vite prints (usually http://localhost:5173).

### Manual setup

```bash
# 1. Backend
cd backend
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python train_model.py           # optional; the server trains automatically if no model exists
python server.py                # http://localhost:5000

# 2. Frontend (in a second terminal)
cd frontend
npm install
npm run dev                     # http://localhost:5173
```

Optional Streamlit UI: `cd backend && streamlit run streamlit_app.py`

## No-install version

`docs/index.html` is a single-page version of Baitcheck that runs entirely in the browser, with no backend. Open the file directly, or serve the `docs/` folder with GitHub Pages. It has three parts:

- **Email checker**: paste a sender, subject and message to get a 0–100 risk score and the warning signs found.
- **Check links**: paste a link to see the real website behind it and the tricks used to disguise it (lookalike spellings, a brand name in front of another site, shorteners, `@` tricks).
- **Scam news**: short write-ups of recent phishing scams, each linked to its source.

This version uses rule-based checks only (no machine-learning model), and its scam articles are written into the page rather than fetched live.

## API

`POST /analyze`

```json
{ "text": "Security alert: confirm your account now at http://account-review.test" }
```

Response:

```json
{
  "prediction": "phishing",
  "score": "92%",
  "probability": 0.9158,
  "riskLevel": "High",
  "indicators": ["Urgent language", "Password request", "Suspicious links", "Impersonation"],
  "summary": "The model rates this message as likely phishing. Treat it as malicious until verified.",
  "nextSteps": ["Do not click any suspicious links.", "..."],
  "source": "model"
}
```

`GET /news?limit=9` returns recent stories:

```json
{
  "stories": [
    {
      "title": "Police warn of fake parking fine texts",
      "source": "BBC",
      "region": "United Kingdom",
      "published": "2026-11-16T09:00:00+00:00",
      "url": "https://news.google.com/..."
    }
  ]
}
```

`GET /health` returns `{ "status": "ok" }`.

## Tests

```bash
cd backend
python -m unittest discover tests
```

## Project structure

```
├── backend/
│   ├── server.py          # Flask REST API
│   ├── analyzer.py        # model loading, scoring and red-flag detection
│   ├── news.py            # live phishing/scam news from RSS feeds
│   ├── tests/             # unit tests for the news feed
│   ├── train_model.py     # training and evaluation script
│   ├── streamlit_app.py   # optional Streamlit interface
│   └── requirements.txt
├── data/
│   └── phishingdata.csv   # labelled training messages
├── docs/
│   └── index.html         # no-install single-page version (GitHub Pages ready)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/    # Header, MessageSheet, Verdict, Findings, Examples, ScamNews, HowItWorks
│   │   └── lib/analysis.js  # highlighting and offline fallback rules
└── start.bat              # one-click launcher for Windows
```

## Limitations and next steps

- The training set is small (78 hand-written, balanced examples), so the model's perfect score on it doesn't mean it will do as well on real-world messages. The next step is training on a larger public phishing email corpus.
- Add URL analysis (domain age, lookalike domains, URL features) alongside the text model.
- Deploy the API (e.g. Render) and the frontend (e.g. Vercel) for a live demo.
- Add unit tests for the analyzer and API.

## License

[MIT](LICENSE)
