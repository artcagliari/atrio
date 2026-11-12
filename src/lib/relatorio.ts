/**
 * Relatório do cliente para o advogado usar na consulta.
 * Montado a partir do que o cliente declarou na triagem — em produção, esta parte vem da IA no back-end.
 * Não contém opinião jurídica nem avaliação de chance de êxito.
 */
import type { Area, Atendimento, Consulta, Mensagem } from "./types";
import { formatarDataHora, normalizar } from "./utils";

const DOCUMENTOS_POR_AREA: Record<string, string[]> = {
  trabalhista: [
    "Carteira de trabalho (física ou digital)",
    "Contrato de trabalho e aditivos",
    "Holerites dos últimos 12 meses",
    "Termo de rescisão (TRCT) e guias, se houver",
    "Extrato do FGTS",
    "Registros de ponto ou escalas",
    "Mensagens e e-mails relacionados",
  ],
  familia: [
    "Documentos pessoais e certidões (casamento/nascimento)",
    "Comprovantes de renda das partes",
    "Comprovantes de despesas dos filhos",
    "Documentos de bens (imóveis, veículos, financiamentos)",
    "Decisões ou acordos anteriores",
  ],
  bancario: [
    "Contrato com a instituição financeira",
    "Extratos e comprovantes de pagamento",
    "Prints do aplicativo e protocolos de reclamação",
    "Notificações ou documentos judiciais recebidos",
  ],
  previdenciario: [
    "Extrato do CNIS",
    "Carta de indeferimento ou de cessação do benefício",
    "Laudos, exames e receitas recentes",
    "Carteiras de trabalho e carnês de contribuição",
    "Número do benefício e do requerimento",
  ],
};

const PONTOS_POR_AREA: Record<string, string[]> = {
  trabalhista: [
    "Datas exatas de admissão e de saída",
    "Salário, benefícios e forma de pagamento",
    "Jornada praticada x jornada registrada",
    "Existência de testemunhas",
  ],
  familia: [
    "Renda atual de cada parte",
    "Rotina e despesas dos filhos",
    "Bens a partilhar e dívidas do casal",
    "Existência de acordo informal ou processo anterior",
  ],
  bancario: [
    "Valores, datas e origem da dívida",
    "Se houve citação ou processo judicial",
    "Impacto sobre salário ou verba de natureza alimentar",
  ],
  previdenciario: [
    "Histórico de contribuições e períodos sem registro",
    "Data do requerimento e da decisão do INSS",
    "Condição de saúde atual e capacidade de trabalho",
  ],
};

const chave = (area: string) => normalizar(area).replace(/[^a-z]/g, "");

export interface ItemLinhaDoTempo {
  quando: string;
  texto: string;
}

export interface Relatorio {
  pontosAEsclarecer: string[];
  documentosASolicitar: string[];
  linhaDoTempo: ItemLinhaDoTempo[];
  falasDoCliente: Mensagem[];
}

export function gerarRelatorio(a: Atendimento, consulta: Consulta | undefined, areas: Area[]): Relatorio {
  const k = chave(a.area);
  const area = areas.find((x) => chave(x.nome) === k);

  // Perguntas obrigatórias do roteiro que ficaram sem resposta
  const respondidas = new Set(a.respostas.map((r) => normalizar(r.pergunta)));
  const pendentes = (area?.perguntas ?? [])
    .filter((p) => p.obrigatoria && !respondidas.has(normalizar(p.texto)))
    .map((p) => `Confirmar: ${p.texto.replace(/\?$/, "")}`);

  const pontos = [
    ...(a.urgente ? [`Prioridade: ${a.motivoUrgencia ?? "caso marcado como urgente"} — conferir prazos nos documentos recebidos`] : []),
    ...pendentes,
    ...(PONTOS_POR_AREA[k] ?? ["Detalhar os fatos e as datas principais", "Entender o que o cliente espera do escritório"]),
  ];

  const recebidos = new Set(a.documentos.map((d) => normalizar(d.nome)));
  const documentos = (DOCUMENTOS_POR_AREA[k] ?? ["Documento de identidade e CPF", "Comprovante de residência", "Documentos relacionados ao caso"]).filter(
    (d) => !recebidos.has(normalizar(d)),
  );

  const linha: ItemLinhaDoTempo[] = [{ quando: a.criadoEm, texto: "Primeiro contato pelo WhatsApp" }];
  const ultimaDoAssistente = [...a.mensagens].reverse().find((m) => m.autor === "assistente");
  if (a.status !== "em_triagem" && ultimaDoAssistente) linha.push({ quando: ultimaDoAssistente.enviadaEm, texto: "Triagem concluída pelo assistente" });
  if (a.urgente) linha.push({ quando: a.criadoEm, texto: `Marcado como urgente: ${a.motivoUrgencia ?? "—"}` });
  if (a.ultimoContatoHumano) linha.push({ quando: a.ultimoContatoHumano, texto: "Contato da equipe com o cliente" });
  if (consulta) {
    const quem = consulta.agendadaPor === "assistente" ? "pelo assistente no WhatsApp" : "pela equipe";
    const como = consulta.status === "pre_agendada" ? "pré-agendada" : consulta.status === "realizada" ? "realizada" : "confirmada";
    linha.push({ quando: consulta.inicio, texto: `Consulta ${como}, marcada ${quem}` });
  }
  linha.sort((x, y) => new Date(x.quando).getTime() - new Date(y.quando).getTime());

  // Falas sobre o caso: sem anexos, sem frases muito curtas e sem a mensagem de identificação (nome/cidade).
  const primeiroNome = normalizar(a.nome.split(" ")[0]);
  const falas = a.mensagens
    .filter((m) => m.autor === "cliente" && !/^\[(imagem|pdf)\]/.test(m.texto) && m.texto.length > 18 && !normalizar(m.texto).includes(primeiroNome))
    .slice(0, 6);

  return { pontosAEsclarecer: pontos, documentosASolicitar: documentos, linhaDoTempo: linha, falasDoCliente: falas };
}

/** Texto corrido para copiar e colar (e-mail, sistema do escritório). */
export function relatorioEmTexto(a: Atendimento, consulta: Consulta | undefined, r: Relatorio) {
  const linhas = [
    `RELATÓRIO DE TRIAGEM — ${a.nome}`,
    `Área: ${a.area} · Telefone: ${a.telefone} · Cidade: ${a.cidade}`,
    consulta ? `Consulta: ${formatarDataHora(consulta.inicio)}` : "Consulta: ainda não marcada",
    "",
    "RESUMO",
    a.resumoIA,
    "",
    "RESPOSTAS DA TRIAGEM",
    ...a.respostas.map((x) => `- ${x.pergunta} ${x.resposta}`),
    "",
    "PONTOS A ESCLARECER NA CONSULTA",
    ...r.pontosAEsclarecer.map((p) => `- ${p}`),
    "",
    "DOCUMENTOS A SOLICITAR",
    ...r.documentosASolicitar.map((d) => `- ${d}`),
  ];
  return linhas.join("\n");
}
