import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Database, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trainNb, saveNbModel, loadNbModel, clearNbModel, type NbModel } from "@/lib/nb-model";
import { toast } from "sonner";

export const Route = createFileRoute("/dataset")({
  head: () => ({
    meta: [{ title: "Dataset — SpamGuard AI" }],
  }),
  component: DatasetPage,
});

function DatasetPage() {
  const [model, setModel] = useState<NbModel | null>(() =>
    typeof window !== "undefined" ? loadNbModel() : null,
  );
  const [training, setTraining] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTraining(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      // very simple CSV parse: assume header label,text or v1,v2
      const rows: { label: string; text: string }[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",");
        if (parts.length < 2) continue;
        const label = parts[0].replace(/^"|"$/g, "").trim();
        const body = parts.slice(1).join(",").replace(/^"|"$/g, "").trim();
        if (label && body) rows.push({ label, text: body });
      }
      if (rows.length < 10) {
        toast.error("Need at least 10 labeled rows");
        return;
      }
      const m = trainNb(rows);
      saveNbModel(m);
      setModel(m);
      toast.success(`Trained on ${m.sampleCount} samples`);
    } catch (err) {
      toast.error("Failed to train");
      console.error(err);
    } finally {
      setTraining(false);
      e.target.value = "";
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 pb-20 pt-28">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        Dataset <span className="text-primary">& Model</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload a CSV with columns <code>label</code> (spam/ham) and <code>text</code> to train an
        in-browser Naive Bayes model. The Python ML API is preferred when available.
      </p>

      <div className="mt-8 glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-primary" />
          <div>
            <div className="font-semibold">In-browser model</div>
            <div className="text-sm text-muted-foreground">
              {model
                ? `Trained on ${model.sampleCount} samples · ${new Date(model.trainedAt).toLocaleString()}`
                : "No model trained yet"}
            </div>
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 hover:bg-white/5">
          <Upload className="h-5 w-5" />
          <span>{training ? "Training..." : "Upload CSV to train"}</span>
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} disabled={training} />
        </label>

        {model && (
          <Button
            variant="ghost"
            onClick={() => {
              clearNbModel();
              setModel(null);
              toast("Model cleared");
            }}
          >
            Clear model
          </Button>
        )}
      </div>
    </main>
  );
}
