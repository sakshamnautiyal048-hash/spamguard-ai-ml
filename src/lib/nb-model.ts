// In-browser Naive Bayes fallback. Trained from user-uploaded CSV and stored in localStorage.
// Real production model lives in /ml (Python).

export type NbLabel = "spam" | "ham";

export interface NbModel {
  vocabulary: string[];
  logPrior: { spam: number; ham: number };
  logLik: { spam: Record<string, number>; ham: Record<string, number> };
  trainedAt: string;
  sampleCount: number;
}

const STORAGE_KEY = "spamguard-nb-model";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export function trainNb(rows: { label: string; text: string }[]): NbModel {
  const spamDocs: string[][] = [];
  const hamDocs: string[][] = [];
  for (const r of rows) {
    const tokens = tokenize(r.text);
    if (r.label.toLowerCase() === "spam") spamDocs.push(tokens);
    else hamDocs.push(tokens);
  }
  const vocab = new Set<string>();
  for (const d of [...spamDocs, ...hamDocs]) d.forEach((t) => vocab.add(t));
  const vocabulary = Array.from(vocab);

  const total = spamDocs.length + hamDocs.length || 1;
  const logPrior = {
    spam: Math.log((spamDocs.length + 1) / (total + 2)),
    ham: Math.log((hamDocs.length + 1) / (total + 2)),
  };

  function counts(docs: string[][]) {
    const c: Record<string, number> = {};
    let totalTokens = 0;
    for (const d of docs) {
      for (const t of d) {
        c[t] = (c[t] || 0) + 1;
        totalTokens++;
      }
    }
    return { c, totalTokens };
  }

  const spamC = counts(spamDocs);
  const hamC = counts(hamDocs);
  const V = vocabulary.length;

  const logLik = { spam: {} as Record<string, number>, ham: {} as Record<string, number> };
  for (const t of vocabulary) {
    logLik.spam[t] = Math.log(((spamC.c[t] || 0) + 1) / (spamC.totalTokens + V));
    logLik.ham[t] = Math.log(((hamC.c[t] || 0) + 1) / (hamC.totalTokens + V));
  }

  return {
    vocabulary,
    logPrior,
    logLik,
    trainedAt: new Date().toISOString(),
    sampleCount: rows.length,
  };
}

export function predictNb(model: NbModel, text: string): { label: NbLabel; spamProbability: number } {
  const tokens = tokenize(text);
  let logSpam = model.logPrior.spam;
  let logHam = model.logPrior.ham;
  for (const t of tokens) {
    if (model.logLik.spam[t] !== undefined) logSpam += model.logLik.spam[t];
    if (model.logLik.ham[t] !== undefined) logHam += model.logLik.ham[t];
  }
  // softmax-ish
  const maxLog = Math.max(logSpam, logHam);
  const expSpam = Math.exp(logSpam - maxLog);
  const expHam = Math.exp(logHam - maxLog);
  const spamProbability = expSpam / (expSpam + expHam);
  return { label: spamProbability >= 0.5 ? "spam" : "ham", spamProbability };
}

export function saveNbModel(model: NbModel) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
}
export function loadNbModel(): NbModel | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function clearNbModel() {
  localStorage.removeItem(STORAGE_KEY);
}
