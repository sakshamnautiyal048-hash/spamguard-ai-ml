import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHistory, clearHistory } from "@/lib/history";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — SpamGuard AI" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const list = useHistory();
  const [q, setQ] = useState("");

  const stats = useMemo(() => {
    const total = list.length;
    const spam = list.filter((s) => s.level === "HIGH RISK" || s.level === "spam").length;
    const suspicious = list.filter((s) => s.level === "SUSPICIOUS").length;
    const phone = list.filter((s) => s.type === "phone").length;
    return { total, spam, suspicious, phone };
  }, [list]);

  const filtered = list.filter((s) =>
    `${s.target} ${s.level} ${s.type} ${s.source}`.toLowerCase().includes(q.toLowerCase()),
  );

  const exportCsv = () => {
    const rows = [
      ["date", "type", "target", "level", "score", "source"],
      ...list.map((s) => [s.createdAt, s.type, s.target, s.level, s.score ?? "", s.source]),
    ];
    const blob = new Blob(
      [rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")],
      { type: "text/csv" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "spamguard-scans.csv";
    a.click();
    toast.success("CSV exported");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Scan <span className="text-primary">Dashboard</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Real data from scans on this device only. Nothing is uploaded.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={!list.length}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              clearHistory();
              toast("History cleared");
            }}
            disabled={!list.length}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Clear
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Total scans", stats.total],
          ["High risk", stats.spam],
          ["Suspicious", stats.suspicious],
          ["Phone checks", stats.phone],
        ].map(([l, v]) => (
          <div key={String(l)} className="glass rounded-2xl p-5">
            <div className="font-display text-3xl font-bold text-primary">{v}</div>
            <div className="text-sm text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="glass mt-8 rounded-2xl p-10 text-center text-muted-foreground">
          No scans yet.{" "}
          <Link to="/email" className="text-primary underline">
            Check an email
          </Link>{" "}
          or{" "}
          <Link to="/phone" className="text-primary underline">
            a phone number
          </Link>
          .
        </div>
      ) : (
        <>
          <div className="mt-8">
            <input
              className="w-full max-w-md rounded-xl border border-border bg-background/50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search scans..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="mt-4 overflow-x-auto glass rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-3">Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Level</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border/50">
                    <td className="p-3 whitespace-nowrap">{new Date(s.createdAt).toLocaleString()}</td>
                    <td className="p-3">{s.type}</td>
                    <td className="p-3 font-mono text-xs">{s.target}</td>
                    <td className="p-3">{s.level}</td>
                    <td className="p-3">{s.score ?? "—"}</td>
                    <td className="p-3">{s.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
