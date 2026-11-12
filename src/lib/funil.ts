/**
 * Funil de triagem: do primeiro contato no WhatsApp à contratação.
 * Tudo é derivado do status do atendimento e das consultas — nada é guardado à parte.
 */
import type { Atendimento, Consulta } from "./types";

export type EtapaFunil = "triagem" | "aguardando" | "agendado" | "decisao" | "contratou" | "nao_contratou" | "fora";

export const COLUNAS_FUNIL: { id: EtapaFunil; titulo: string; descricao: string }[] = [
  { id: "triagem", titulo: "Em triagem", descricao: "O assistente está conversando no WhatsApp" },
  { id: "aguardando", titulo: "Aguardando a equipe", descricao: "Triagem concluída, sem consulta marcada" },
  { id: "agendado", titulo: "Consulta marcada", descricao: "Relatório pronto para a consulta" },
  { id: "decisao", titulo: "Pós-consulta", descricao: "Consulta feita, falta registrar o resultado" },
  { id: "contratou", titulo: "Contratou", descricao: "Virou cliente do escritório" },
];

/** Consulta mais recente (não cancelada) do atendimento. */
export function consultaDe(a: Atendimento, consultas: Consulta[]) {
  return consultas
    .filter((c) => c.atendimentoId === a.id && c.status !== "cancelada")
    .sort((x, y) => new Date(y.inicio).getTime() - new Date(x.inicio).getTime())[0];
}

export const consultaJaAconteceu = (c: Consulta, agora = Date.now()) => c.status === "realizada" || new Date(c.fim).getTime() < agora;

export function etapaDe(a: Atendimento, consultas: Consulta[], agora = Date.now()): EtapaFunil {
  switch (a.status) {
    case "em_triagem":
      return "triagem";
    case "fora_de_escopo":
      return "fora";
    case "contratou":
      return "contratou";
    case "nao_contratou":
      return "nao_contratou";
    case "consulta_agendada": {
      const c = consultaDe(a, consultas);
      if (!c) return "aguardando";
      return consultaJaAconteceu(c, agora) ? "decisao" : "agendado";
    }
    default:
      return "aguardando";
  }
}

export type AcaoProximoPasso = "agendar" | "confirmar" | "relatorio" | "resultado" | null;

/** O que a equipe deve fazer agora com este cliente — em linguagem simples. */
export function proximoPasso(a: Atendimento, consultas: Consulta[], agora = Date.now()): { texto: string; acao: AcaoProximoPasso; rotuloAcao?: string } {
  const c = consultaDe(a, consultas);
  switch (etapaDe(a, consultas, agora)) {
    case "triagem":
      return { texto: "O assistente ainda está conversando com o cliente.", acao: null };
    case "aguardando":
      return { texto: "Triagem concluída. Marque a consulta inicial.", acao: "agendar", rotuloAcao: "Agendar consulta" };
    case "agendado":
      if (c?.status === "pre_agendada")
        return { texto: `Consulta pré-agendada${c.agendadaPor === "assistente" ? " pelo assistente" : ""}. Confirme o horário.`, acao: "confirmar", rotuloAcao: "Confirmar consulta" };
      return { texto: "Consulta confirmada. O relatório do cliente está pronto.", acao: "relatorio", rotuloAcao: "Abrir relatório" };
    case "decisao":
      return { texto: "A consulta já aconteceu. Registre se o cliente contratou.", acao: "resultado", rotuloAcao: "Registrar resultado" };
    case "contratou":
      return { texto: "Cliente contratou o escritório.", acao: null };
    case "nao_contratou":
      return { texto: "Cliente não contratou.", acao: null };
    case "fora":
      return { texto: "Assunto fora das áreas atendidas — o assistente encerrou a conversa.", acao: null };
  }
}

/** Funil acumulado: quantos passaram por cada etapa. */
export function conversao(atendimentos: Atendimento[], consultas: Consulta[], agora = Date.now()) {
  const etapas = atendimentos.map((a) => ({ a, e: etapaDe(a, consultas, agora) }));
  const triados = etapas.filter((x) => x.e !== "triagem");
  const qualificados = triados.filter((x) => x.e !== "fora");
  const agendados = qualificados.filter((x) => ["agendado", "decisao", "contratou", "nao_contratou"].includes(x.e));
  const realizados = agendados.filter((x) => ["decisao", "contratou", "nao_contratou"].includes(x.e));
  const contrataram = realizados.filter((x) => x.e === "contratou");
  return [
    { id: "chegaram", titulo: "Chegaram no WhatsApp", total: atendimentos.length },
    { id: "triados", titulo: "Triagem concluída", total: triados.length },
    { id: "qualificados", titulo: "Dentro das áreas", total: qualificados.length },
    { id: "agendados", titulo: "Consulta marcada", total: agendados.length },
    { id: "realizados", titulo: "Consulta realizada", total: realizados.length },
    { id: "contrataram", titulo: "Contrataram", total: contrataram.length },
  ];
}
