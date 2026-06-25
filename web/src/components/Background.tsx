export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute left-1/2 top-[-10%] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full opacity-[0.16] blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--teal), transparent 65%)" }}
      />

      <svg
        className="absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"
        viewBox="0 0 300 300"
        fill="none"
        aria-hidden
      >
        <g stroke="var(--bone)" strokeWidth="0.6">
          <line x1="100" y1="20" x2="100" y2="280" />
          <line x1="200" y1="20" x2="200" y2="280" />
          <line x1="20" y1="100" x2="280" y2="100" />
          <line x1="20" y1="200" x2="280" y2="200" />
        </g>
      </svg>

      <svg
        className="absolute -left-16 top-24 h-64 w-64 opacity-[0.06]"
        viewBox="0 0 100 100"
        style={{ animation: "drift 16s ease-in-out infinite" }}
        aria-hidden
      >
        <line x1="22" y1="22" x2="78" y2="78" stroke="var(--violet)" strokeWidth="6" strokeLinecap="round" />
        <line x1="78" y1="22" x2="22" y2="78" stroke="var(--violet)" strokeWidth="6" strokeLinecap="round" />
      </svg>

      <svg
        className="absolute -right-16 bottom-24 h-64 w-64 opacity-[0.06]"
        viewBox="0 0 100 100"
        style={{ animation: "drift 20s ease-in-out infinite reverse" }}
        aria-hidden
      >
        <circle cx="50" cy="50" r="28" stroke="var(--teal)" strokeWidth="6" fill="none" />
      </svg>
    </div>
  );
}
