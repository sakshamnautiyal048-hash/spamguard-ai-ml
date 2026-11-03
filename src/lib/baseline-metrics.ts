// Offline baseline from the Python run (ml/train.py) on Kaggle spam.csv, as reported in the AI Lab presentation.
export const BASELINE = {
  accuracy: 0.9686, precision: 1.0, recall: 0.7651, f1: 0.8669,
  dataset_size: 5572, ham: 4825, spam: 747, duplicates: 403, test_size: 1115,
  confusion: { tn: 966, fp: 0, fn: 35, tp: 114 },
};
