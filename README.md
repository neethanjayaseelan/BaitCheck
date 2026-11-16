# Baitcheck: Phishing Message Detector

Baitcheck is a full-stack web app with three tools in one page:

- **Email checker**: paste a sender, subject and message. It returns a 0–100 risk score, the warning signs it found (a sender that doesn't match the company, pressure to act fast, requests for passwords or card numbers, disguised links) and a **phishing probability** from a machine-learning text classifier.
- **Check links**: paste a link to see the real website behind it and the tricks used to disguise it (lookalike spellings, a brand name in front of another site, shorteners, `@` tricks).
- **Scam news**: six major phishing attacks from 2016 to 2024 (including the Arup deepfake call, the MGM help-desk call and the Podesta email), each with the lesson it teaches and a link to a source.

When a checked email or link uses the same trick as one of the six attacks, that story is shown with the result.

<!-- Add a screenshot: save one as docs/screenshot.png and uncomment the line below -->
<!-- ![Baitcheck screenshot](docs/screenshot.png) -->

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS (base styles) with custom CSS |
| Backend | Python, Flask REST API |
| Machine learning | scikit-learn (TF-IDF + logistic regression), pandas, joblib |
| Alternative UI | Streamlit |

## How it works

```
Email checker ──▶ warning-sign rules in the browser (sender, links, wording)
      │
      └──POST /analyze──▶ Flask API ──▶ TF-IDF + Logistic Regression (phishing probability)
                           (if the API is offline, the rules score is used on its own)

Link checker  ──▶ link rules in the browser (no backend needed)
Scam news     ──▶ six fixed stories in the page (no backend needed)
```

1. **Training** (`backend/train_model.py`): loads labelled messages from `data/phishingdata.csv`, turns the text into TF-IDF features (single words and two-word phrases), trains a logistic regression classifier, reports hold-out and 5-fold cross-validation accuracy, and saves the model.
2. **Inference** (`backend/server.py`): a Flask API loads the model and exposes `POST /analyze`. It combines the model's probability with regex-based indicators that explain the result.
3. **Frontend** (`frontend/`): a React app with three tabs. The email checker runs warning-sign rules in the browser (`src/lib/checks.js`), then asks the API for the model's probability. The final score is the higher of the rules score and the average of the two, so the model can raise the score but never hides what the rules found. If the API can't be reached, the rules score is used alone and the result says so. The link checker uses rules only.
4. **Scam news** (`frontend/src/lib/stories.js`): six fixed stories of major phishing attacks, written into the page. This section needs no backend or internet connection.

## Getting started

**Requirements:** Python 3.10+ and Node.js 18+

```bash
git clone https://github.com/neethanjayaseelan/BaitCheck.git
cd BaitCheck
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

`docs/index.html` is a single-file version of Baitcheck that runs entirely in the browser, with no backend. Open the file directly, or serve the `docs/` folder with GitHub Pages. It has the same three tools and the same design as the full app, but uses the rule-based checks only (no machine-learning model).

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

`GET /health` returns `{ "status": "ok" }`.

## Project structure

```
├── backend/
│   ├── server.py          # Flask REST API
│   ├── analyzer.py        # model loading, scoring and red-flag detection
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
│   │   ├── components/    # Header, EmailChecker, LinkChecker, ScamNews, Result, StoryCard
│   │   └── lib/           # checks.js (email and link rules), stories.js (six stories), api.js (model call)
└── start.bat              # one-click launcher for Windows
```

## Limitations and next steps

- The training set is small (78 hand-written, balanced examples), so the model's perfect score on it doesn't mean it will do as well on real-world messages. The next step is training on a larger public phishing email corpus.
- Extend the link checker with live lookups (domain age, known-phishing lists). It currently reads the address only.
- Deploy the API (e.g. Render) and the frontend (e.g. Vercel) for a live demo.
- Add unit tests for the analyzer and API.
- Refresh the six scam stories as newer major cases come out.

## License

[MIT](LICENSE)
