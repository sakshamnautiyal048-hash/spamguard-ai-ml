"""Train TF-IDF + Multinomial Naive Bayes spam classifier.
Dataset: CSV with columns `label` (spam/ham) and `text`, e.g. the SMS Spam Collection
or Kaggle "spam.csv" (columns v1, v2 are auto-renamed).
Usage: python train.py data/spam.csv
"""
import json, sys
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

path = sys.argv[1] if len(sys.argv) > 1 else "data/spam.csv"
df = pd.read_csv(path, encoding="latin-1")
df = df.rename(columns={"v1": "label", "v2": "text"})[["label", "text"]].dropna()
df["text"] = df["text"].str.lower().str.replace(r"\s+", " ", regex=True)
y = (df["label"].str.lower() == "spam").astype(int).to_numpy()

X_train, X_test, y_train, y_test = train_test_split(df["text"], y, test_size=0.2, random_state=42, stratify=y)
model = Pipeline([("tfidf", TfidfVectorizer(stop_words="english", ngram_range=(1, 2), min_df=2)), ("nb", MultinomialNB(alpha=0.1))])
model.fit(X_train, y_train)
pred = model.predict(X_test)

metrics = {
    "accuracy": float(accuracy_score(y_test, pred)),
    "precision": float(precision_score(y_test, pred)),
    "recall": float(recall_score(y_test, pred)),
    "f1": float(f1_score(y_test, pred)),
    "dataset_size": int(len(df)),
    "categories": int(np.unique(y).size),
}
joblib.dump(model, "model.joblib")
json.dump(metrics, open("metrics.json", "w"), indent=2)
print(json.dumps(metrics, indent=2))
