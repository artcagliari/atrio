import { useAppStore } from "@/lib/store";
import { cn, urgentePendente } from "@/lib/utils";

export function useContagemUrgentes() {
  const { atendimentos } = useAppStore();
  return atendimentos.filter(urgentePendente).length;
}

/**
 * Ponto vermelho com número. O número fica sobre uma cápsula escura (não sobre o vermelho)
 * para manter contraste AA; o vermelho é só o ponto.
 */
export function UrgentCounter({ className }: { className?: string }) {
  const total = useContagemUrgentes();
  if (total === 0) return null;
  return (
    <span
      className={cn(
        "inline-flex h-[18px] items-center gap-1 rounded-full border border-white/15 bg-[#05141a]/85 pl-1.5 pr-1.5 font-mono text-[10px] leading-none text-foreground animate-in zoom-in-50",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-urgente" aria-hidden="true" />
      {total}
      <span className="sr-only">{total === 1 ? " urgente aguardando retorno" : " urgentes aguardando retorno"}</span>
    </span>
  );
}
