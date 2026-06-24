export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-32 -left-24 h-[42rem] w-[42rem] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, #8b5cf6, transparent 60%)", animation: "float-slow 14s ease-in-out infinite" }}
      />
      <div
        className="absolute -bottom-40 -right-24 h-[40rem] w-[40rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #2dd4bf, transparent 60%)", animation: "float-slow 18s ease-in-out infinite reverse" }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
