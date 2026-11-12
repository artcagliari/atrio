/**
 * Tipos de domínio do Átrio.
 * Mantidos independentes da fonte de dados para que o mock possa ser trocado por API.
 */

export type StatusConexao = "conectado" | "desconectado" | "conectando";

export interface Empresa {
  id: string;
  nome: string;
  segmento: string;
  numeroWhatsapp: string;
  statusConexao: StatusConexao;
  /** Dados básicos opcionais exibidos em Configurações → Empresa */
  documento?: string;
  email?: string;
  cidade?: string;
}

export interface Pergunta {
  id: string;
  texto: string;
  obrigatoria: boolean;
  ordem: number;
}

export interface Area {
  id: string;
  nome: string;
  perguntas: Pergunta[];
  ativa: boolean;
}

export interface RegraUrgencia {
  id: string;
  descricao: string;
  palavrasChave: string[];
}

export type StatusAtendimento =
  | "novo"
  | "aguardando_analise"
  | "consulta_agendada"
  | "contratou"
  | "nao_contratou"
  | "fora_de_escopo";

export type AutorMensagem = "cliente" | "assistente" | "equipe";

export interface Mensagem {
  id: string;
  autor: AutorMensagem;
  texto: string;
  /** ISO 8601 */
  enviadaEm: string;
}

export interface Documento {
  id: string;
  nome: string;
  tipo: "imagem" | "pdf";
  tamanhoKb: number;
  /** URL da miniatura (opcional; sem ela o card mostra um ícone) */
  miniaturaUrl?: string;
}

export interface RespostaRoteiro {
  pergunta: string;
  resposta: string;
}

export interface Atendimento {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  /** Nome da área (ex.: "Trabalhista"). "Fora de escopo" quando não se aplica. */
  area: string;
  resumoIA: string;
  respostas: RespostaRoteiro[];
  urgente: boolean;
  motivoUrgencia?: string;
  status: StatusAtendimento;
  documentos: Documento[];
  mensagens: Mensagem[];
  /** ISO 8601 */
  criadoEm: string;
  /** ISO 8601 */
  ultimoContatoHumano?: string;
}

export type StatusConsulta = "pre_agendada" | "confirmada" | "realizada" | "cancelada";

export interface Consulta {
  id: string;
  atendimentoId: string;
  /** ISO 8601 */
  inicio: string;
  /** ISO 8601 */
  fim: string;
  status: StatusConsulta;
}

/* ---------- Configuração do assistente ---------- */

export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = domingo

export interface FaixaHorario {
  dia: DiaSemana;
  ativo: boolean;
  /** "HH:mm" */
  inicio: string;
  /** "HH:mm" */
  fim: string;
}

export interface ConfigHorarios {
  faixas: FaixaHorario[];
  duracaoMinutos: number;
  modo: "confirmar_direto" | "pre_agendar";
}

export interface ConfigAssistente {
  nome: string;
  saudacao: string;
  tom: "formal" | "cordial";
  encerramentoForaEscopo: string;
}

export interface LimiteAssistente {
  id: string;
  texto: string;
  /** Itens obrigatórios do modelo de segmento não podem ser removidos */
  bloqueado: boolean;
}

export interface ModeloSegmento {
  id: string;
  nome: string;
  descricao: string;
  disponivel: boolean;
}

export interface Usuario {
  nome: string;
  email: string;
  cargo: string;
  /** Como a pessoa é chamada na saudação (ex.: "Dra. Helena") */
  tratamento?: string;
}
