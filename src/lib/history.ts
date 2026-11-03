// First scan history: stored only in this browser, never the message body.
import { useEffect, useState } from "react";

export interface ScanRecord {
  id: string;
  type: "email" | "phone";
  target: string; // masked sender / masked number
  level: string;
  score: number | null;
  source: "heuristic" | "ml" | "format-only";
  createdAt: string;
  hash?: string | undefined;
}

export async function hashTarget(v: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v.trim().toLowerCase()));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
export function findByHash(hash: string) {
  return readHistory().filter((r) => r.hash === hash);
}

const KEY = "spamguard-history";
const EVT = "spamguard-history-change";

export function maskEmail(e: string) {
  const [l = "", d] = e.split("@");
  if (!d) return e ? "•••" : "(no sender)";
  return `${l.slice(0, 2)}•••@${d}`;
}
export function maskPhone(p: string) {
  return p.length > 4 ? `${p.slice(0, p.length - 4).replace(/\d/g, "•")}${p.slice(-4)}` : p;
}

export function readHistory(): ScanRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function addScan(r: Omit<ScanRecord, "id" | "createdAt">) {
  const list = [{ ...r, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...readHistory()].slice(0, 500);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVT));
}
export function clearHistory() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVT));
}
export function useHistory() {
  const [list, setList] = useState<ScanRecord[]>([]);
  useEffect(() => {
    const sync = () => setList(readHistory());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener("storage", sync); };
  }, []);
  return list;
}
