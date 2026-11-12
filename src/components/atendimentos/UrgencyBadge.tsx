import { cn } from "@/lib/utils";

/** Ponto vermelho com pulso suave + "Urgente" (e o motivo, se houver). Sem faixa ou fundo vermelho. */
export function UrgencyBadge({ motivo, className }: { motivo?: string; className?: string }) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2 text-apoio", className)}>
      <span className="size-2 shrink-0 rounded-full bg-urgente motion-safe:animate-pulso" aria-hidden="true" />
      <span className="shrink-0 text-foreground">Urgente</span>
      {motivo && <span className="truncate text-muted-foreground">· {motivo}</span>}
    </span>
  );
}
