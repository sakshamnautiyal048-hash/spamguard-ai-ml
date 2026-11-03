import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BarChart3, Brain, Database, FileSearch, Link2, Lock, Mail, Phone, ShieldAlert, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrbitShield } from "@/components/site/OrbitShield";
import { Reveal } from "@/components/site/effects";
import { fetchMetrics } from "@/lib/ml-api";
import { toast } from "sonner";
import { BASELINE } from "@/lib/baseline-metrics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SpamGuard AI — Your Digital Shield Against Spam" },
      { name: "description", content: "Detect suspicious emails and phone numbers before they become a threat, powered by TF-IDF and Naive Bayes." },
      { property: "og:title", content: "SpamGuard AI — Your Digital Shield Against Spam" },
      { property: "og:description", content: "Detect suspicious emails and phone numbers before they become a threat." },
    ],
  }),
  component: Index,
});

function Counter({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (t: number) => { const p = Math.min(1, (t - start) / 1600); setV(value * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{v.toFixed(decimals)}{suffix}</>;
}

function Stat({ label, value }: { label: string; value: React.ReactNode | null }) {
  return (
    <div className="glass rounded-2xl px-4 py-3">
      <div className="font-display text-2xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

const FEATURES = [
  { icon: Mail, title: "Email Content Analysis", text: "Sender, subject and body scanned for phishing language, urgency tactics and spam patterns." },
  { icon: Link2, title: "Link Inspection", text: "Flags raw-IP links, URL shorteners, look-alike punycode and high-risk domains." },
  { icon: Brain, title: "Naive Bayes Model", text: "TF-IDF + Multinomial Naive Bayes classifier served by a Python API." },
  { icon: Phone, title: "Phone Number Check", text: "Country-aware format validation, with reputation lookups only from real APIs when connected." },
  { icon: Database, title: "Local History", text: "Scan history stays in your browser. Targets are masked; message bodies are never stored." },
  { icon: Lock, title: "Privacy First", text: "No accounts, no cloud storage of your messages. Everything runs locally or on your own ML server." },
];

function Index() {
  const { data: metrics } = useQuery({ queryKey: ["ml-metrics"], queryFn: fetchMetrics, staleTime: 60_000 });
  const m = metrics || BASELINE;

  return (
    <div className="relative overflow-hidden">
      <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-32 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Real TF-IDF + Naive Bayes
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Your digital shield<br />
            <span className="text-primary">against spam</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Detect suspicious emails and phone numbers before they become a threat. Powered by a real machine-learning model with transparent heuristics as fallback.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/email"><Mail className="mr-2 h-4 w-4" /> Check an email</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/phone"><Phone className="mr-2 h-4 w-4" /> Check a phone</Link>
            </Button>
          </div>
        </Reveal>

        <div className="mt-16 flex justify-center">
          <OrbitShield />
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Accuracy" value={<Counter value={m.accuracy * 100} suffix="%" decimals={1} />} />
          <Stat label="Precision" value={<Counter value={(m.precision || 0) * 100} suffix="%" decimals={1} />} />
          <Stat label="Dataset size" value={<Counter value={m.dataset_size || 5572} />} />
          <Stat label="F1 score" value={<Counter value={(m.f1 || 0) * 100} suffix="%" decimals={1} />} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center font-display text-3xl font-bold">How it works</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 transition hover:shadow-glow">
              <f.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 text-center">
        <div className="glass rounded-3xl p-10">
          <ShieldAlert className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 font-display text-2xl font-bold">Ready to scan?</h2>
          <p className="mt-2 text-muted-foreground">Paste an email or number and get an instant risk assessment.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild><Link to="/email">Email scanner</Link></Button>
            <Button asChild variant="outline"><Link to="/dashboard">View dashboard</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
