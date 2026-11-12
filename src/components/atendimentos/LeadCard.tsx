import type { CSSProperties } from "react";
import { ArcoInicial } from "@/components/ui/arco";
import { Skeleton } from "@/components/ui/skeleton";
import type { Atendimento } from "@/lib/types";
import { cn, tempoRelativo } from "@/lib/utils";
import { EtapaTexto } from "./EtapaTexto";
import { UrgencyBadge } from "./UrgencyBadge";

interface LeadCardProps {
  atendimento: Atendimento;
  agora: number;
  selecionado?: boolean;
  onAbrir: (id: string) => void;
  style?: CSSProperties;
}

/** Inicial em arco, nome, área + etapa do funil, tempo. Urgente: ponto vermelho com pulso. */
export function LeadCard({ atendimento: a, agora, selecionado, onAbrir, style }: LeadCardProps) {
  const tempo = tempoRelativo(a.criadoEm, agora);
  const ha = tempo === "agora" ? "agora" : `há ${tempo}`;
  return (
    <button
      type="button"
      onClick={() => onAbrir(a.id)}
      aria-current={selecionado ? "true" : undefined}
      aria-label={`${a.nome}, ${a.area}${a.urgente ? ", urgente" : ""}, chegou ${ha}. Abrir detalhes`}
      style={style}
      className={cn(
        "vidro-leve vidro-clicavel flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left sm:px-5",
        "animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-300 ease-out",
        selecionado && "[--vidro-a:0.12]",
      )}
    >
      <ArcoInicial nome={a.nome} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-corpo font-medium">{a.nome}</span>
        <span className="flex min-w-0 items-center gap-1.5 text-apoio text-muted-foreground">
          <span className="shrink-0">{a.area}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">
            <EtapaTexto atendimento={a} />
          </span>
        </span>
      </span>
      {a.urgente && <UrgencyBadge className="hidden sm:inline-flex" />}
      {a.urgente && <span className="size-2 shrink-0 rounded-full bg-urgente motion-safe:animate-pulso sm:hidden" aria-hidden="true" />}
      <span className="w-20 shrink-0 text-right text-micro text-terciario tabular">{ha}</span>
    </button>
  );
}

export function LeadCardSkeleton() {
  return (
    <div className="vidro-leve flex items-center gap-4 rounded-2xl px-5 py-3.5" aria-hidden="true">
      <Skeleton className="arco h-11 w-10" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-3 w-12" />
    </div>
  );
}
