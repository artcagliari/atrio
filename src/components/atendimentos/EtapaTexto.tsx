import { consultaDe, etapaDe } from "@/lib/funil";
import { useAppStore } from "@/lib/store";
import type { Atendimento } from "@/lib/types";
import { DIAS_SEMANA, formatarDataCurta, formatarHora } from "@/lib/utils";
import type { DiaSemana } from "@/lib/types";
import { Digitando } from "./Digitando";

/** Onde o cliente está no funil, em uma linha curta. */
export function EtapaTexto({ atendimento: a }: { atendimento: Atendimento }) {
  const { consultas } = useAppStore();
  const etapa = etapaDe(a, consultas);
  const c = consultaDe(a, consultas);
  switch (etapa) {
    case "triagem":
      return a.assistenteDigitando ? <Digitando rotulo="Assistente em triagem" /> : <>Assistente em triagem</>;
    case "aguardando":
      return <>Aguardando a equipe</>;
    case "agendado": {
      if (!c) return <>Consulta marcada</>;
      const d = new Date(c.inicio);
      return (
        <>
          Consulta {DIAS_SEMANA[d.getDay() as DiaSemana].curto.toLowerCase()} {formatarDataCurta(d)}, {formatarHora(d)}
          {c.status === "pre_agendada" && " · a confirmar"}
        </>
      );
    }
    case "decisao":
      return <>Pós-consulta · registrar resultado</>;
    case "contratou":
      return <>Contratou</>;
    case "nao_contratou":
      return <>Não contratou</>;
    case "fora":
      return <>Fora das áreas atendidas</>;
  }
}
