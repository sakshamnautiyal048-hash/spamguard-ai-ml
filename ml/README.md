# SpamGuard ML API

TF-IDF + Multinomial Naive Bayes spam classifier.

## Train

```bash
pip install -r requirements.txt
python train.py ../public/downloads/spam.csv
```

## Serve

```bash
python serve.py
# or production:
gunicorn -b 0.0.0.0:$PORT serve:app
```

Set `VITE_ML_API_URL` on the frontend to the API URL.
