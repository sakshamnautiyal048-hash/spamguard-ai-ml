import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { AlertTriangle, Brain, CheckCircle2, Info, Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeEmail, type EmailAnalysis, type RiskLevel } from "@/lib/email-analysis";
import { predictSpam, ML_API_URL } from "@/lib/ml-api";
import { addScan, maskEmail, hashTarget } from "@/lib/history";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [{ title: "Email Scanner — SpamGuard AI" }],
  }),
  component: EmailPage,
});

function levelColor(level: RiskLevel | string) {
  if (level === "HIGH RISK") return "text-red-500";
  if (level === "SUSPICIOUS") return "text-amber-500";
  return "text-green-500";
}

function EmailPage() {
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    analysis: EmailAnalysis;
    ml?: { label: string; spam_probability: number };
    source: string;
  }>(null);

  const scan = useCallback(async () => {
    if (!body.trim() && !subject.trim()) {
      toast.error("Enter at least a subject or body");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const analysis = analyzeEmail({ sender, subject, body });
      let ml: { label: string; spam_probability: number } | undefined;
      let source: "ml" | "heuristic" = "heuristic";

      if (ML_API_URL) {
        try {
          const text = `${subject}\n${body}`;
          ml = await predictSpam(text);
          source = "ml";
        } catch (e) {
          console.warn("ML API unavailable, using heuristics", e);
          toast.message("ML API offline — using heuristics");
        }
      }

      // Combine: if ML says spam with high confidence, boost score
      let finalAnalysis = { ...analysis };
      if (ml && ml.spam_probability >= 0.5) {
        finalAnalysis.score = Math.max(finalAnalysis.score, Math.round(ml.spam_probability * 100));
        if (finalAnalysis.score >= 60) finalAnalysis.level = "HIGH RISK";
        else if (finalAnalysis.score >= 25) finalAnalysis.level = "SUSPICIOUS";
      }

      setResult({ analysis: finalAnalysis, ml, source });

      const h = await hashTarget(sender || subject || body.slice(0, 50));
      addScan({
        type: "email",
        target: maskEmail(sender) || "(no sender)",
        level: finalAnalysis.level,
        score: finalAnalysis.score,
        source,
        hash: h,
      });
      toast.success("Scan complete");
    } catch (e) {
      toast.error("Scan failed");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [sender, subject, body]);

  const reset = () => {
    setSender("");
    setSubject("");
    setBody("");
    setResult(null);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-28">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        Email <span className="text-primary">Scanner</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {ML_API_URL
          ? "Connected to real TF-IDF + Naive Bayes model."
          : "Using local heuristics (set VITE_ML_API_URL for real ML)."}
      </p>

      <div className="mt-8 space-y-4 glass rounded-2xl p-6">
        <div>
          <label className="text-sm font-medium">Sender</label>
          <input
            className="mt-1 w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
            placeholder="sender@example.com"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Subject</label>
          <input
            className="mt-1 w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
            placeholder="Email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Body</label>
          <textarea
            className="mt-1 w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary min-h-[160px]"
            placeholder="Paste the email body here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={scan} disabled={loading}>
            <Mail className="mr-2 h-4 w-4" />
            {loading ? "Scanning..." : "Scan email"}
          </Button>
          <Button variant="ghost" onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
      </div>

      {result && (
        <div className="mt-8 glass rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className={`text-2xl font-bold ${levelColor(result.analysis.level)}`}>
              {result.analysis.level}
            </div>
            <div className="text-sm text-muted-foreground">
              Score: {result.analysis.score}/100 · Source: {result.source}
            </div>
          </div>

          {result.ml && (
            <div className="rounded-xl bg-primary/10 px-4 py-3 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <Brain className="h-4 w-4" /> ML Model
              </div>
              <p className="mt-1">
                Label: <strong>{result.ml.label}</strong> · Probability:{" "}
                {(result.ml.spam_probability * 100).toFixed(1)}%
              </p>
            </div>
          )}

          {result.analysis.findings.length > 0 ? (
            <div>
              <h3 className="font-semibold mb-2">Findings</h3>
              <ul className="space-y-2">
                {result.analysis.findings.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    {f.severity === "high" ? (
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    ) : f.severity === "medium" ? (
                      <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    )}
                    <span>
                      <span className="font-medium">{f.category}:</span> {f.message}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No strong risk signals detected by heuristics.</p>
          )}

          <p className="text-xs text-muted-foreground">
            SpamGuard AI never guarantees safety. Don't click links or share OTPs if unsure.
          </p>
        </div>
      )}
    </main>
  );
}
