import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Nav() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <Shield className="h-6 w-6 text-primary" />
          SpamGuard AI
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link to="/email" className="text-muted-foreground hover:text-foreground transition">Email</Link>
          <Link to="/phone" className="text-muted-foreground hover:text-foreground transition">Phone</Link>
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition">Dashboard</Link>
          <Link to="/dataset" className="text-muted-foreground hover:text-foreground transition">Dataset</Link>
        </nav>
        <Button asChild size="sm" variant="default">
          <Link to="/email">Scan now</Link>
        </Button>
      </div>
    </header>
  );
}
