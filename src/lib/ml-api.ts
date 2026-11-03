// Connects to the Python Naive Bayes API in /ml (serve.py).
// Set VITE_ML_API_URL (e.g. http://localhost:5000) to enable real ML predictions.

export interface MlPrediction { label: "spam" | "ham"; spam_probability: number }
export interface MlMetrics { accuracy: number; precision: number; recall: number; f1: number; dataset_size: number; categories: number }

export const ML_API_URL: string | undefined = import.meta.env['VITE_ML_API_URL'] || undefined;

export async function predictSpam(text: string): Promise<MlPrediction> {
  if (!ML_API_URL) throw new Error("ML model not connected");
  const res = await fetch(`${ML_API_URL}/predict`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`ML API error ${res.status}`);
  return res.json();
}

export async function fetchMetrics(): Promise<MlMetrics | null> {
  if (!ML_API_URL) return null;
  try {
    const res = await fetch(`${ML_API_URL}/metrics`);
    return res.ok ? await res.json() : null;
  } catch { return null; }
}
