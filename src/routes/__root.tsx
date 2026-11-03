import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet, ScrollRestoration } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import "@/styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
});

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Nav />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <Toaster position="top-right" richColors closeButton />
        <ScrollRestoration />
      </div>
    </QueryClientProvider>
  );
}
