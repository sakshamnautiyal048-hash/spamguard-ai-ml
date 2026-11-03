// Rule-based heuristic email analysis. This is NOT a machine-learning model —
// the real TF-IDF + Multinomial Naive Bayes model lives in /ml and is reached via ml-api.ts.

export type RiskLevel = "SAFE-LOOKING" | "SUSPICIOUS" | "HIGH RISK";

export interface Finding {
  category: "Sender" | "Subject" | "Links" | "Phishing" | "Urgency" | "Spam pattern";
  severity: "low" | "medium" | "high";
  message: string;
}

export interface EmailAnalysis {
  score: number; // 0-100
  level: RiskLevel;
  formatValid: boolean | null;
  findings: Finding[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const FREE_PROVIDERS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "proton.me", "aol.com"];
const BRANDS = ["paypal", "amazon", "apple", "microsoft", "netflix", "bank", "google", "sbi", "hdfc", "icici"];
const SUSPICIOUS_TLDS = [".xyz", ".top", ".click", ".zip", ".tk", ".gq", ".ml", ".cf", ".work", ".loan"];
const SHORTENERS = ["bit.ly", "tinyurl", "goo.gl", "t.co", "ow.ly", "is.gd", "cutt.ly"];

const PHISHING = [
  "verify your account", "confirm your identity", "update your payment", "login to your account",
  "your account has been suspended", "unusual activity", "reset your password", "enter your otp",
  "share your otp", "bank details", "social security", "kyc",
];
const URGENCY = ["urgent", "immediately", "within 24 hours", "act now", "final notice", "expires today", "last chance", "asap", "limited time"];
const SPAM = [
  "congratulations", "you have won", "winner", "lottery", "free gift", "claim your prize", "100% free",
  "cash prize", "risk-free", "no cost", "click here", "buy now", "earn money", "work from home",
  "crypto", "investment opportunity", "double your", "inheritance", "dear friend",
];

export function scoreToLevel(score: number): RiskLevel {
  if (score >= 60) return "HIGH RISK";
  if (score >= 25) return "SUSPICIOUS";
  return "SAFE-LOOKING";
}

export function analyzeEmail(input: { sender: string; subject: string; body: string }): EmailAnalysis {
  const findings: Finding[] = [];
  let score = 0;
  const add = (f: Finding, pts: number) => { findings.push(f); score += pts; };

  const sender = input.sender.trim().toLowerCase();
  let formatValid: boolean | null = null;
  if (sender) {
    formatValid = EMAIL_RE.test(sender);
    if (!formatValid) add({ category: "Sender", severity: "high", message: "Sender address is not a valid email format." }, 20);
    else {
      const [local = "", domain = ""] = sender.split("@");
      if (FREE_PROVIDERS.some(p => domain === p) && BRANDS.some(b => local.includes(b) || domain.includes(b))) {
        add({ category: "Sender", severity: "high", message: "Brand name used with a free email provider — possible spoofing." }, 25);
      }
      if (SUSPICIOUS_TLDS.some(t => domain.endsWith(t))) {
        add({ category: "Sender", severity: "medium", message: `Suspicious TLD on sender domain (${domain}).` }, 15);
      }
    }
  }

  const subject = input.subject.toLowerCase();
  const body = input.body.toLowerCase();
  const text = subject + " " + body;

  for (const p of PHISHING) if (text.includes(p)) add({ category: "Phishing", severity: "high", message: `Phishing phrase detected: "${p}".` }, 18);
  for (const u of URGENCY) if (text.includes(u)) add({ category: "Urgency", severity: "medium", message: `Urgency language: "${u}".` }, 10);
  for (const s of SPAM) if (text.includes(s)) add({ category: "Spam pattern", severity: "medium", message: `Spam pattern: "${s}".` }, 12);

  // simple link checks
  const urlRe = /https?:\/\/[^\s]+/gi;
  const urls = input.body.match(urlRe) || [];
  for (const u of urls) {
    const low = u.toLowerCase();
    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(low)) add({ category: "Links", severity: "high", message: "Link uses a raw IP address." }, 20);
    if (SHORTENERS.some(s => low.includes(s))) add({ category: "Links", severity: "medium", message: "URL shortener detected." }, 12);
    if (SUSPICIOUS_TLDS.some(t => low.includes(t))) add({ category: "Links", severity: "medium", message: "Suspicious TLD in link." }, 12);
  }

  score = Math.min(100, score);
  return { score, level: scoreToLevel(score), formatValid, findings };
}
