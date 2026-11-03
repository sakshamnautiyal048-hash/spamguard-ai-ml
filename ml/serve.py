"""Serve the trained model. Run: python serve.py  (after train.py)
Then set VITE_ML_API_URL=http://localhost:5000 for the website."""
import json
import os
import joblib
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
model = joblib.load("model.joblib")
metrics = json.load(open("metrics.json"))

@app.get("/metrics")
def get_metrics():
    return jsonify(metrics)

@app.post("/predict")
def predict():
    text = (request.get_json(silent=True) or {}).get("text", "")
    if not isinstance(text, str) or not text.strip() or len(text) > 20000:
        return jsonify(error="text must be a non-empty string under 20000 chars"), 400
    p = float(model.predict_proba([text.lower()])[0][1])
    return jsonify(label="spam" if p >= 0.5 else "ham", spam_probability=p)

@app.get("/health")
def health():
    return jsonify(status="ok")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
