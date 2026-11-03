import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { Phone, ShieldCheck, AlertTriangle } from "lucide-react";
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js";
import { Button } from "@/components/ui/button";
import { addScan, maskPhone } from "@/lib/history";
import { toast } from "sonner";

export const Route = createFileRoute("/phone")({
  head: () => ({
    meta: [{ title: "Phone Check — SpamGuard AI" }],
  }),
  component: PhonePage,
});

function PhonePage() {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<null | {
    valid: boolean;
    e164?: string;
    country?: string;
    type?: string;
    national?: string;
  }>(null);

  const check = useCallback(() => {
    const cleaned = raw.trim();
    if (!cleaned) {
      toast.error("Enter a phone number");
      return;
    }
    const parsed = parsePhoneNumberFromString(cleaned, "US");
    if (!parsed || !parsed.isValid()) {
      setResult({ valid: false });
      addScan({
        type: "phone",
        target: maskPhone(cleaned),
        level: "INVALID",
        score: null,
        source: "format-only",
      });
      return;
    }
    const info = {
      valid: true,
      e164: parsed.format("E.164"),
      country: parsed.country || "Unknown",
      type: parsed.getType() || "UNKNOWN",
      national: parsed.formatNational(),
    };
    setResult(info);
    addScan({
      type: "phone",
      target: maskPhone(info.e164 || cleaned),
      level: "FORMAT-OK",
      score: null,
      source: "format-only",
    });
    toast.success("Number format looks valid");
  }, [raw]);

  return (
    <main className="mx-auto max-w-2xl px-4 pb-20 pt-28">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        Phone <span className="text-primary">Check</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Format validation only (libphonenumber). No reputation data is invented.
      </p>

      <div className="mt-8 glass rounded-2xl p-6 space-y-4">
        <label className="block text-sm font-medium">Phone number</label>
        <input
          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
          placeholder="+1 555 123 4567 or 5551234567"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
        />
        <Button onClick={check} className="w-full sm:w-auto">
          <Phone className="mr-2 h-4 w-4" /> Check number
        </Button>
      </div>

      {result && (
        <div className="mt-6 glass rounded-2xl p-6">
          {result.valid ? (
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-green-500 shrink-0" />
              <div>
                <div className="font-semibold text-green-500">Valid format</div>
                <dl className="mt-3 space-y-1 text-sm">
                  <div><dt className="inline text-muted-foreground">E.164:</dt> <dd className="inline ml-1">{result.e164}</dd></div>
                  <div><dt className="inline text-muted-foreground">National:</dt> <dd className="inline ml-1">{result.national}</dd></div>
                  <div><dt className="inline text-muted-foreground">Country:</dt> <dd className="inline ml-1">{result.country}</dd></div>
                  <div><dt className="inline text-muted-foreground">Type:</dt> <dd className="inline ml-1">{result.type}</dd></div>
                </dl>
                <p className="mt-3 text-xs text-muted-foreground">
                  This only checks format. Real spam/scam reputation requires an external API.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
              <div>
                <div className="font-semibold text-amber-500">Invalid or incomplete number</div>
                <p className="mt-1 text-sm text-muted-foreground">Could not parse a valid international number.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
