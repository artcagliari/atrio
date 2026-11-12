/** Três pontos animados — o assistente está escrevendo. */
export function Digitando({ rotulo = "Digitando" }: { rotulo?: string }) {
  return (
    <span className="inline-flex items-center gap-2" role="status">
      <span className="inline-flex gap-1" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 rounded-full bg-foreground/70 motion-safe:animate-bounce" style={{ animationDelay: `${i * 140}ms`, animationDuration: "1s" }} />
        ))}
      </span>
      <span className="text-muted-foreground">{rotulo}…</span>
    </span>
  );
}
