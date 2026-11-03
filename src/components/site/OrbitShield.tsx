export function OrbitShield() {
  return (
    <div className="relative mx-auto h-48 w-48 sm:h-64 sm:w-64">
      <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse" />
      <div className="absolute inset-4 rounded-full border border-primary/30" />
      <div className="absolute inset-8 rounded-full border border-primary/40" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-20 w-20 rounded-full bg-primary/20 blur-xl" />
        <svg className="absolute h-16 w-16 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
    </div>
  );
}
