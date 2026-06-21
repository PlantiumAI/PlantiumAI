export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display font-700 ${className}`}>
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-white shadow-glass"
      >
        🌱
      </span>
      <span className="text-lg tracking-tight">
        Plantium<span className="text-brand">AI</span>
      </span>
    </span>
  );
}
