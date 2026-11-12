/**
 * Roteiros de clientes fictícios para demonstrar a triagem ao vivo no WhatsApp.
 * As respostas seguem a ordem das perguntas configuradas em Configurações › Roteiros.
 */
import type { Documento } from "./types";

export interface ClienteSimulado {
  nome: string;
  cidade: string;
  telefone: string;
  area: string;
  abertura: string;
  respostas: string[];
  resumo: string;
  documentos?: Documento[];
}

export const CLIENTES_SIMULADOS: ClienteSimulado[] = [
  {
    nome: "Gabriela Fontes",
    cidade: "São José dos Pinhais – PR",
    telefone: "(41) 99702-3315",
    area: "Trabalhista",
    abertura: "Boa tarde! Trabalhei três anos numa loja e fui demitida sem receber as férias",
    respostas: ["Vendedora", "Três anos e dois meses", "Já saí. Fui demitida sem justa causa no mês passado", "Sim, carteira assinada", "Não. Faltaram as férias vencidas e a multa do FGTS"],
    resumo:
      "Vendedora por 3 anos e 2 meses, demitida sem justa causa no mês passado, com carteira assinada. Relata que não recebeu as férias vencidas nem a multa de 40% do FGTS na rescisão.",
  },
  {
    nome: "Thiago Albuquerque",
    cidade: "Curitiba – PR",
    telefone: "(41) 98820-4471",
    area: "Família",
    abertura: "Recebi uma intimação e tenho audiência semana que vem sobre a guarda do meu filho",
    respostas: ["Guarda do meu filho", "Sim, ele tem 7 anos", "Sim, a mãe dele entrou com o processo", "A intimação chegou ontem, a audiência é na semana que vem"],
    resumo:
      "Pai de um menino de 7 anos, réu em ação de guarda proposta pela mãe. Recebeu intimação ontem e a audiência está marcada para a próxima semana; ainda não tem advogado.",
  },
  {
    nome: "Renata Cavalcanti",
    cidade: "Colombo – PR",
    telefone: "(41) 99134-8820",
    area: "Bancário",
    abertura: "Estão me cobrando um cartão de crédito que eu nunca pedi",
    respostas: ["Um banco digital", "Fraude. Cobrança de um cartão que eu não pedi", "Faz uns dois meses", "Tenho os prints das cobranças e do protocolo"],
    resumo:
      "Recebe há cerca de dois meses cobranças de um cartão de crédito de banco digital que afirma nunca ter solicitado. Já abriu protocolo de reclamação e guardou prints das cobranças.",
  },
  {
    nome: "Eduardo Bittencourt",
    cidade: "Araucária – PR",
    telefone: "(41) 98477-1093",
    area: "Previdenciário",
    abertura: "O INSS negou minha aposentadoria especial",
    respostas: ["Aposentadoria especial", "Fiz o pedido. Negaram faz uns 20 dias", "58 anos, uns 27 de contribuição, sempre com ruído na metalúrgica", "Tenho o PPP da empresa e exames de audiometria"],
    resumo:
      "Metalúrgico de 58 anos com cerca de 27 anos de contribuição exposto a ruído. Teve a aposentadoria especial negada há 20 dias. Possui PPP e exames de audiometria.",
  },
  {
    nome: "Simone Vasconcelos",
    cidade: "Pinhais – PR",
    telefone: "(41) 99655-2087",
    area: "Consumidor",
    abertura: "Comprei uma geladeira que veio com defeito e a loja não quer trocar",
    respostas: [],
    resumo: "Problema com produto com defeito (direito do consumidor). A área está desativada nas configurações, então o assistente encerrou a conversa com a mensagem padrão.",
  },
];
