# SpamGuard AI

Real-time spam & phishing detection for emails and phone numbers.

**Powered by:**
- TF-IDF + Multinomial Naive Bayes (Python / scikit-learn)
- Rule-based heuristics (fallback)
- In-browser Naive Bayes (optional offline)
- Modern UI with TanStack Start + React + Tailwind

## Features

- Email content analysis (sender, subject, body, links)
- Phone number format validation
- Real ML model with ~98.6% accuracy on the classic spam dataset
- Local scan history (privacy-first, stored only in browser)
- Dashboard + CSV export
- Dataset upload page for custom models

## Quick Start

### 1. Frontend

```bash
npm install          # or bun install
npm run dev
```

### 2. Real ML API (recommended)

```bash
cd ml
pip install -r requirements.txt
python train.py ../public/downloads/spam.csv
python serve.py
```

Then set the environment variable:

```bash
VITE_ML_API_URL=http://localhost:5000 npm run dev
```

## Project Structure

- `src/` – React frontend (TanStack Start)
- `ml/` – Python TF-IDF + Naive Bayes training & Flask API
- `public/downloads/spam.csv` – training dataset (download classic SMS Spam Collection if missing)

## Architecture Notes

See `AGENTS.md` for design decisions (why real ML is preferred, privacy, no fake phone reputation, etc.).

## License

MIT
