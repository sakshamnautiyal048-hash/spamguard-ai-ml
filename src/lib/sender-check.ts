// Additional sender / domain heuristics used by the email analyzer.

const FREE = new Set(["gmail.com","yahoo.com","outlook.com","hotmail.com","proton.me","aol.com","icloud.com","mail.com"]);
const BRANDS = ["paypal","amazon","apple","microsoft","netflix","google","facebook","instagram","bank","sbi","hdfc","icici","axis"] ;

export function checkSender(sender: string): { risk: number; notes: string[] } {
  const notes: string[] = [];
  let risk = 0;
  const s = sender.trim().toLowerCase();
  if (!s) return { risk: 0, notes };

  const at = s.indexOf("@");
  if (at < 0) {
    notes.push("Invalid email format");
    return { risk: 30, notes };
  }
  const local = s.slice(0, at);
  const domain = s.slice(at + 1);

  if (FREE.has(domain)) {
    for (const b of BRANDS) {
      if (local.includes(b) || domain.includes(b)) {
        notes.push(`Free provider + brand keyword "${b}" — possible spoof`);
        risk += 25;
        break;
      }
    }
  }

  if (/\d{5,}/.test(local)) {
    notes.push("Long digit sequence in local part");
    risk += 8;
  }
  if (local.length > 30) {
    notes.push("Unusually long local part");
    risk += 5;
  }
  if (domain.split(".").length > 3) {
    notes.push("Deep subdomain structure");
    risk += 10;
  }

  return { risk: Math.min(risk, 40), notes };
}
