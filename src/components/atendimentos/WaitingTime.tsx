import type { Atendimento } from "@/lib/types";
import { aguardaRetorno, cn, tempoRelativo } from "@/lib/utils";

/** Tempo de espera em texto neutro. */
export function WaitingTime({ atendimento, agora, className }: { atendimento: Atendimento; agora: number; className?: string }) {
  const classe = cn("text-apoio text-muted-foreground", className);
  if (aguardaRetorno(atendimento)) return <span className={classe}>Aguardando há {tempoRelativo(atendimento.criadoEm, agora)}</span>;
  if (atendimento.ultimoContatoHumano) return <span className={classe}>Contatado há {tempoRelativo(atendimento.ultimoContatoHumano, agora)}</span>;
  return null;
}
