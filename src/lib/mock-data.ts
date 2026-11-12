/**
 * Dados mockados. Todas as datas são relativas ao momento em que o app carrega,
 * para que tempos de espera e agenda façam sentido em qualquer dia.
 * Para trocar por API, substitua as exportações por chamadas equivalentes.
 */
import type {
  Area,
  Atendimento,
  AutorMensagem,
  ConfigAssistente,
  ConfigHorarios,
  Consulta,
  Empresa,
  LimiteAssistente,
  Mensagem,
  ModeloSegmento,
  RegraUrgencia,
  Usuario,
} from "./types";

const AGORA = Date.now();
const HORA = 60 * 60 * 1000;
const MIN = 60 * 1000;

const horasAtras = (h: number) => new Date(AGORA - h * HORA).toISOString();

/** Data em `dias` a partir de hoje, no horário indicado (hora local). */
function emDias(dias: number, hh: number, mm = 0) {
  const d = new Date(AGORA);
  d.setDate(d.getDate() + dias);
  d.setHours(hh, mm, 0, 0);
  return d;
}

const fmtHorario = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
/** Data/hora por extenso para as mensagens do assistente (ex.: "sexta-feira, 06/11, 15:00"). */
const quando = (dias: number, hh: number) => fmtHorario.format(emDias(dias, hh));

/** Monta uma conversa espaçando as mensagens em ~1–2 minutos a partir de `inicioIso`. */
function conversa(prefixo: string, inicioIso: string, linhas: [AutorMensagem, string][]): Mensagem[] {
  let t = new Date(inicioIso).getTime() - linhas.length * 1.5 * MIN;
  return linhas.map(([autor, texto], i) => {
    t += (autor === "cliente" ? 2 : 0.5) * MIN;
    return { id: `${prefixo}-m${i + 1}`, autor, texto, enviadaEm: new Date(t).toISOString() };
  });
}

/* ------------------------------------------------------------------ */
/* Empresa, usuário e configurações                                     */
/* ------------------------------------------------------------------ */

export const empresaMock: Empresa = {
  id: "emp-1",
  nome: "Silveira & Prado Advocacia",
  segmento: "advocacia-triagem",
  numeroWhatsapp: "+55 41 99812-4470",
  statusConexao: "conectado",
  documento: "12.345.678/0001-90",
  email: "contato@silveiraprado.adv.br",
  cidade: "Curitiba – PR",
};

export const usuarioMock: Usuario = {
  nome: "Helena Prado",
  email: "helena@silveiraprado.adv.br",
  cargo: "Sócia",
  tratamento: "Dra. Helena",
};

export const modelosSegmento: ModeloSegmento[] = [
  {
    id: "advocacia-triagem",
    nome: "Advocacia — triagem",
    descricao: "Faz a triagem de novos contatos por área do direito, identifica urgências e organiza os casos para a equipe.",
    disponivel: true,
  },
  {
    id: "saude-agendamento",
    nome: "Clínicas — agendamento",
    descricao: "Recebe pacientes, entende a necessidade e sugere horários disponíveis.",
    disponivel: false,
  },
  {
    id: "imobiliaria-qualificacao",
    nome: "Imobiliárias — qualificação",
    descricao: "Qualifica interessados em compra ou locação e agenda visitas.",
    disponivel: false,
  },
  {
    id: "contabilidade-atendimento",
    nome: "Contabilidade — primeiro atendimento",
    descricao: "Entende o porte e a necessidade da empresa antes do contato do contador.",
    disponivel: false,
  },
];

let seqPergunta = 0;
const p = (texto: string, obrigatoria = true) => ({
  id: `p-${++seqPergunta}`,
  texto,
  obrigatoria,
  ordem: seqPergunta,
});

export const areasMock: Area[] = [
  {
    id: "area-trabalhista",
    nome: "Trabalhista",
    ativa: true,
    perguntas: [
      p("Qual era a sua função na empresa?"),
      p("Por quanto tempo trabalhou lá?"),
      p("Ainda trabalha na empresa ou já saiu? Se saiu, qual foi o motivo?"),
      p("Tinha carteira assinada?"),
      p("Recebeu todas as verbas da rescisão?", false),
    ],
  },
  {
    id: "area-familia",
    nome: "Família",
    ativa: true,
    perguntas: [
      p("Qual é a situação: divórcio, pensão, guarda, inventário ou outra?"),
      p("Há filhos menores de idade envolvidos?"),
      p("Já existe algum processo em andamento?"),
      p("Recebeu algum documento da Justiça? Se sim, quando?", false),
    ],
  },
  {
    id: "area-bancario",
    nome: "Bancário",
    ativa: true,
    perguntas: [
      p("Qual é o banco ou a instituição financeira?"),
      p("Qual é o problema: cobrança, juros, bloqueio, fraude ou outro?"),
      p("Desde quando isso acontece?"),
      p("Você tem o contrato ou os extratos?", false),
    ],
  },
  {
    id: "area-previdenciario",
    nome: "Previdenciário",
    ativa: true,
    perguntas: [
      p("Qual benefício você busca ou recebia?"),
      p("Já fez o pedido no INSS? Qual foi a resposta?"),
      p("Qual é a sua idade e o tempo aproximado de contribuição?"),
      p("Tem laudos ou documentos médicos?", false),
    ],
  },
  {
    id: "area-consumidor",
    nome: "Consumidor",
    ativa: false,
    perguntas: [p("Qual empresa ou loja está envolvida?"), p("O que aconteceu e quando?")],
  },
];

export const regrasUrgenciaMock: RegraUrgencia[] = [
  {
    id: "ru-1",
    descricao: "Citação ou intimação recebida",
    palavrasChave: ["citação", "citado", "intimação", "oficial de justiça", "mandado"],
  },
  {
    id: "ru-2",
    descricao: "Audiência marcada para os próximos dias",
    palavrasChave: ["audiência", "audiencia", "semana que vem", "amanhã"],
  },
  {
    id: "ru-3",
    descricao: "Conta ou salário bloqueado",
    palavrasChave: ["conta bloqueada", "bloqueio", "sisbajud", "penhora"],
  },
  {
    id: "ru-4",
    descricao: "Prazo processual perto de vencer",
    palavrasChave: ["prazo", "vence", "15 dias"],
  },
  {
    id: "ru-5",
    descricao: "Risco de prisão por pensão",
    palavrasChave: ["prisão", "mandado de prisão", "preso"],
  },
];

export const horariosMock: ConfigHorarios = {
  faixas: [
    { dia: 0, ativo: false, inicio: "09:00", fim: "12:00" },
    { dia: 1, ativo: true, inicio: "09:00", fim: "18:00" },
    { dia: 2, ativo: true, inicio: "09:00", fim: "18:00" },
    { dia: 3, ativo: true, inicio: "09:00", fim: "18:00" },
    { dia: 4, ativo: true, inicio: "09:00", fim: "18:00" },
    { dia: 5, ativo: true, inicio: "09:00", fim: "17:00" },
    { dia: 6, ativo: false, inicio: "09:00", fim: "12:00" },
  ],
  duracaoMinutos: 60,
  modo: "pre_agendar",
};

export const assistenteMock: ConfigAssistente = {
  nome: "Clara",
  saudacao:
    "Olá! Eu sou a Clara, assistente virtual do Silveira & Prado Advocacia. Vou fazer algumas perguntas rápidas para entender a sua situação e passar tudo organizado para a nossa equipe. Pode ser?",
  tom: "cordial",
  encerramentoForaEscopo:
    "Obrigada por explicar! No momento o escritório não atua com esse tipo de caso, então não conseguiremos ajudar desta vez. Recomendamos procurar a Defensoria Pública ou a subseção da OAB da sua cidade para orientação.",
};

export const limitesObrigatoriosAdvocacia: LimiteAssistente[] = [
  { id: "lim-1", texto: "Não dá opinião jurídica sobre o caso", bloqueado: true },
  { id: "lim-2", texto: "Não avalia a chance de êxito", bloqueado: true },
  { id: "lim-3", texto: "Não informa valores a receber", bloqueado: true },
  { id: "lim-4", texto: "Não promete resultado", bloqueado: true },
  { id: "lim-5", texto: "Não envia mensagens a quem não iniciou contato", bloqueado: true },
];

export const limitesMock: LimiteAssistente[] = [
  ...limitesObrigatoriosAdvocacia,
  { id: "lim-6", texto: "Não comenta casos de outros clientes", bloqueado: false },
];

/* ------------------------------------------------------------------ */
/* Atendimentos                                                         */
/* ------------------------------------------------------------------ */

function atd(a: Omit<Atendimento, "mensagens"> & { conversa: [AutorMensagem, string][] }): Atendimento {
  const { conversa: linhas, ...resto } = a;
  return { ...resto, mensagens: conversa(a.id, a.criadoEm, linhas) };
}

export const atendimentosMock: Atendimento[] = [
  atd({
    id: "at-16",
    nome: "Paulo Henrique Matos",
    telefone: "(41) 99514-3086",
    cidade: "Curitiba – PR",
    area: "Trabalhista",
    urgente: false,
    status: "em_triagem",
    criadoEm: horasAtras(0.15),
    resumoIA: "Triagem em andamento — o assistente ainda está coletando as informações do cliente.",
    respostas: [
      { pergunta: "Qual era a sua função na empresa?", resposta: "Repositor em supermercado." },
      { pergunta: "Por quanto tempo trabalhou lá?", resposta: "Um ano e meio." },
    ],
    documentos: [],
    conversa: [
      ["cliente", "Oi, fui mandado embora e queria saber dos meus direitos"],
      ["assistente", "Olá! Eu sou a Clara, assistente virtual do Silveira & Prado Advocacia. Vou fazer algumas perguntas rápidas para entender a sua situação e passar tudo organizado para a nossa equipe. Pode ser?"],
      ["cliente", "Pode. Paulo Henrique Matos, de Curitiba"],
      ["assistente", "Obrigada, Paulo. Qual era a sua função na empresa?"],
      ["cliente", "Repositor em supermercado"],
      ["assistente", "Por quanto tempo trabalhou lá?"],
      ["cliente", "Um ano e meio"],
      ["assistente", "Ainda trabalha na empresa ou já saiu? Se saiu, qual foi o motivo?"],
    ],
  }),
  atd({
    id: "at-01",
    nome: "Marcos Vinícius Pereira",
    telefone: "(41) 99734-2210",
    cidade: "São José dos Pinhais – PR",
    area: "Família",
    urgente: true,
    motivoUrgencia: "Citação recebida — prazo de contestação correndo",
    status: "novo",
    criadoEm: horasAtras(0.6),
    resumoIA:
      "Recebeu ontem, por oficial de justiça, citação em ação de alimentos movida pela ex-companheira em favor da filha de 6 anos. Pede orientação sobre o prazo de defesa. Está desempregado há 3 meses e hoje paga R$ 400 por acordo informal. Enviou foto da citação.",
    respostas: [
      { pergunta: "Qual é a situação: divórcio, pensão, guarda, inventário ou outra?", resposta: "Pensão. Fui processado pela mãe da minha filha." },
      { pergunta: "Há filhos menores de idade envolvidos?", resposta: "Sim, uma filha de 6 anos." },
      { pergunta: "Já existe algum processo em andamento?", resposta: "Sim, esse que chegou agora." },
      { pergunta: "Recebeu algum documento da Justiça? Se sim, quando?", resposta: "Ontem à tarde, o oficial de justiça entregou em casa." },
    ],
    documentos: [
      { id: "d-01a", nome: "citacao-frente.jpg", tipo: "imagem", tamanhoKb: 812 },
      { id: "d-01b", nome: "citacao-verso.jpg", tipo: "imagem", tamanhoKb: 774 },
    ],
    conversa: [
      ["cliente", "Boa tarde, preciso de um advogado urgente"],
      ["assistente", "Olá! Eu sou a Clara, assistente virtual do Silveira & Prado Advocacia. Vou fazer algumas perguntas rápidas para entender a sua situação e passar tudo organizado para a nossa equipe. Pode ser?"],
      ["cliente", "Pode sim"],
      ["assistente", "Obrigada! Qual é o seu nome completo e de qual cidade você fala?"],
      ["cliente", "Marcos Vinícius Pereira, de São José dos Pinhais"],
      ["assistente", "Prazer, Marcos. A sua situação envolve divórcio, pensão, guarda, inventário ou outro assunto?"],
      ["cliente", "Pensão. A mãe da minha filha entrou com processo e ontem o oficial de justiça veio aqui em casa e me entregou uma citação"],
      ["assistente", "Entendi. Há filhos menores de idade envolvidos?"],
      ["cliente", "Minha filha de 6 anos"],
      ["assistente", "Certo. Se puder, envie uma foto da citação que recebeu. Isso ajuda a equipe a analisar com rapidez."],
      ["cliente", "[imagem] citacao-frente.jpg"],
      ["cliente", "[imagem] citacao-verso.jpg"],
      ["cliente", "Tenho prazo pra responder né? Estou desempregado faz 3 meses, pago 400 por fora"],
      ["assistente", "Recebi as fotos, obrigada. Não consigo orientar sobre prazos ou sobre o caso, mas marquei o seu atendimento como prioritário e um advogado da equipe vai falar com você o quanto antes."],
    ],
  }),
  atd({
    id: "at-02",
    nome: "Juliana Andrade Costa",
    telefone: "(41) 98811-5096",
    cidade: "Curitiba – PR",
    area: "Trabalhista",
    urgente: true,
    motivoUrgencia: "Audiência trabalhista nesta semana, sem advogado",
    status: "novo",
    criadoEm: horasAtras(1.8),
    resumoIA:
      "Reclamante em ação trabalhista contra rede de supermercados. A advogada anterior renunciou e a audiência de instrução está marcada para esta semana. Trabalhou 4 anos como operadora de caixa; pede horas extras e intervalo. Tem cópia da petição inicial e da notificação da audiência.",
    respostas: [
      { pergunta: "Qual era a sua função na empresa?", resposta: "Operadora de caixa." },
      { pergunta: "Por quanto tempo trabalhou lá?", resposta: "Quatro anos e dois meses." },
      { pergunta: "Ainda trabalha na empresa ou já saiu? Se saiu, qual foi o motivo?", resposta: "Saí, fui mandada embora sem justa causa." },
      { pergunta: "Tinha carteira assinada?", resposta: "Sim." },
      { pergunta: "Recebeu todas as verbas da rescisão?", resposta: "Recebi, mas o processo é pelas horas extras." },
    ],
    documentos: [
      { id: "d-02a", nome: "notificacao-audiencia.pdf", tipo: "pdf", tamanhoKb: 214 },
      { id: "d-02b", nome: "peticao-inicial.pdf", tipo: "pdf", tamanhoKb: 1630 },
    ],
    conversa: [
      ["cliente", "Oi, tenho uma audiência trabalhista essa semana e minha advogada largou o caso"],
      ["assistente", "Olá! Eu sou a Clara, assistente virtual do Silveira & Prado Advocacia. Sinto muito pela situação. Vou fazer algumas perguntas para passar tudo à equipe. Qual é o seu nome completo?"],
      ["cliente", "Juliana Andrade Costa"],
      ["assistente", "Obrigada, Juliana. Qual era a sua função na empresa e por quanto tempo trabalhou lá?"],
      ["cliente", "Operadora de caixa, 4 anos e 2 meses"],
      ["assistente", "Você ainda trabalha lá ou já saiu?"],
      ["cliente", "Fui mandada embora sem justa causa. O processo é das horas extras, nunca tive intervalo direito"],
      ["assistente", "Entendi. Você tem a notificação da audiência ou outros documentos do processo?"],
      ["cliente", "[pdf] notificacao-audiencia.pdf"],
      ["cliente", "[pdf] peticao-inicial.pdf"],
      ["assistente", "Recebi, obrigada. Como a audiência está próxima, seu atendimento foi marcado como prioritário e a equipe vai entrar em contato hoje."],
    ],
  }),
  atd({
    id: "at-03",
    nome: "Roberto Lima Santos",
    telefone: "(41) 99602-3381",
    cidade: "Colombo – PR",
    area: "Bancário",
    urgente: true,
    motivoUrgencia: "Conta bloqueada — salário retido",
    status: "aguardando_analise",
    criadoEm: horasAtras(5.2),
    resumoIA:
      "Teve a conta-salário bloqueada após ordem judicial ligada a uma dívida de cartão de crédito de 2021. O salário de outubro ficou retido e ele não consegue pagar o aluguel. Diz não ter recebido citação anterior. Enviou print do aplicativo do banco com o bloqueio.",
    respostas: [
      { pergunta: "Qual é o banco ou a instituição financeira?", resposta: "Banco onde recebo o salário; a dívida é de outro banco, do cartão." },
      { pergunta: "Qual é o problema: cobrança, juros, bloqueio, fraude ou outro?", resposta: "Bloqueio. Bloquearam minha conta inteira." },
      { pergunta: "Desde quando isso acontece?", resposta: "Desde segunda-feira." },
      { pergunta: "Você tem o contrato ou os extratos?", resposta: "Tenho o print do bloqueio e o extrato." },
    ],
    documentos: [
      { id: "d-03a", nome: "print-bloqueio.png", tipo: "imagem", tamanhoKb: 356 },
      { id: "d-03b", nome: "extrato-outubro.pdf", tipo: "pdf", tamanhoKb: 98 },
    ],
    conversa: [
      ["cliente", "Bloquearam minha conta, meu salário caiu e não consigo tirar nada"],
      ["assistente", "Olá! Eu sou a Clara, assistente virtual do Silveira & Prado Advocacia. Vou entender a sua situação para passar à equipe. Qual é o seu nome completo e cidade?"],
      ["cliente", "Roberto Lima Santos, Colombo"],
      ["assistente", "Obrigada, Roberto. O banco informou o motivo do bloqueio?"],
      ["cliente", "Falaram que é ordem judicial, por causa de uma dívida de cartão de 2021. Nunca recebi nada de processo"],
      ["assistente", "Entendi. Se tiver um print do bloqueio ou o extrato, pode enviar aqui."],
      ["cliente", "[imagem] print-bloqueio.png"],
      ["cliente", "[pdf] extrato-outubro.pdf"],
      ["cliente", "Tenho aluguel pra pagar dia 10"],
      ["assistente", "Recebi os arquivos. Marquei o seu caso como prioritário e a equipe vai retornar o mais rápido possível."],
    ],
  }),
  atd({
    id: "at-04",
    nome: "Ana Paula Ferreira",
    telefone: "(41) 98455-1702",
    cidade: "Curitiba – PR",
    area: "Trabalhista",
    urgente: false,
    status: "novo",
    criadoEm: horasAtras(1.1),
    resumoIA:
      "Demitida sem justa causa após 2 anos como auxiliar administrativa em uma transportadora. Não recebeu a multa de 40% do FGTS nem as férias proporcionais. Tem o termo de rescisão.",
    respostas: [
      { pergunta: "Qual era a sua função na empresa?", resposta: "Auxiliar administrativa." },
      { pergunta: "Por quanto tempo trabalhou lá?", resposta: "2 anos." },
      { pergunta: "Ainda trabalha na empresa ou já saiu? Se saiu, qual foi o motivo?", resposta: "Fui demitida sem justa causa mês passado." },
      { pergunta: "Tinha carteira assinada?", resposta: "Sim." },
      { pergunta: "Recebeu todas as verbas da rescisão?", resposta: "Não. Faltou a multa do FGTS e as férias." },
    ],
    documentos: [{ id: "d-04a", nome: "termo-rescisao.pdf", tipo: "pdf", tamanhoKb: 186 }],
    conversa: [
      ["cliente", "Olá, fui demitida e acho que não me pagaram tudo"],
      ["assistente", "Olá! Eu sou a Clara, assistente virtual do Silveira & Prado Advocacia. Vou fazer algumas perguntas rápidas. Qual é o seu nome e cidade?"],
      ["cliente", "Ana Paula Ferreira, Curitiba"],
      ["assistente", "Obrigada, Ana Paula. Qual era a sua função e por quanto tempo trabalhou lá?"],
      ["cliente", "Auxiliar administrativa, 2 anos numa transportadora"],
      ["assistente", "Tinha carteira assinada? E o que ficou faltando na rescisão, pelo que você percebeu?"],
      ["cliente", "Tinha sim. Não veio a multa do FGTS nem as férias"],
      ["cliente", "[pdf] termo-rescisao.pdf"],
      ["assistente", "Recebi o documento. Já organizei as informações e a equipe vai entrar em contato em breve."],
    ],
  }),
  atd({
    id: "at-05",
    nome: "Carlos Eduardo Souza",
    telefone: "(41) 99128-6643",
    cidade: "Araucária – PR",
    area: "Trabalhista",
    urgente: false,
    status: "consulta_agendada",
    criadoEm: horasAtras(50),
    resumoIA:
      "Motorista de caminhão há 6 anos na mesma empresa, ainda empregado. Relata jornada média de 12 horas sem pagamento de horas extras e controle de jornada apenas pelo rastreador. Quer saber se pode buscar os valores sem sair do emprego.",
    respostas: [
      { pergunta: "Qual era a sua função na empresa?", resposta: "Motorista carreteiro." },
      { pergunta: "Por quanto tempo trabalhou lá?", resposta: "6 anos, ainda estou lá." },
      { pergunta: "Ainda trabalha na empresa ou já saiu? Se saiu, qual foi o motivo?", resposta: "Ainda trabalho." },
      { pergunta: "Tinha carteira assinada?", resposta: "Sim." },
    ],
    documentos: [],
    conversa: [
      ["cliente", "Boa noite. Sou motorista e faço muita hora extra que não pagam"],
      ["assistente", "Boa noite! Eu sou a Clara, assistente virtual do Silveira & Prado Advocacia. Vou entender o seu caso. Qual é o seu nome e cidade?"],
      ["cliente", "Carlos Eduardo Souza, Araucária"],
      ["assistente", "Obrigada, Carlos. Há quanto tempo trabalha na empresa e qual é a sua jornada média?"],
      ["cliente", "6 anos. Faço umas 12 horas por dia, o controle é só pelo rastreador"],
      ["assistente", "Você ainda está trabalhando lá?"],
      ["cliente", "Sim, por isso fico com medo"],
      ["assistente", "Entendi, obrigada por explicar. Posso marcar uma consulta inicial com a advogada. Tenho estes horários: 1) " + quando(-1, 16) + "; 2) " + quando(0, 10) + ". Qual fica melhor?"],
      ["cliente", "A primeira"],
      ["assistente", "Pronto! Sua consulta ficou para " + quando(-1, 16) + ", no escritório. Se precisar remarcar, é só me avisar por aqui."],
    ],
  }),
  atd({
    id: "at-06",
    nome: "Fernanda Rocha Mendes",
    telefone: "(41) 98207-9918",
    cidade: "Curitiba – PR",
    area: "Trabalhista",
    urgente: false,
    status: "consulta_agendada",
    criadoEm: horasAtras(50),
    ultimoContatoHumano: horasAtras(30),
    resumoIA:
      "Analista de marketing que relata humilhações frequentes da gestora em reuniões, com mensagens guardadas. Está afastada pelo INSS por ansiedade há 20 dias. Busca orientação sobre assédio moral.",
    respostas: [
      { pergunta: "Qual era a sua função na empresa?", resposta: "Analista de marketing." },
      { pergunta: "Por quanto tempo trabalhou lá?", resposta: "3 anos." },
      { pergunta: "Ainda trabalha na empresa ou já saiu? Se saiu, qual foi o motivo?", resposta: "Ainda sou funcionária, mas estou afastada." },
      { pergunta: "Tinha carteira assinada?", resposta: "Sim." },
    ],
    documentos: [
      { id: "d-06a", nome: "prints-mensagens.pdf", tipo: "pdf", tamanhoKb: 2410 },
      { id: "d-06b", nome: "atestado.jpg", tipo: "imagem", tamanhoKb: 540 },
    ],
    conversa: [
      ["cliente", "Oi, queria falar sobre assédio moral no trabalho"],
      ["assistente", "Olá! Eu sou a Clara, assistente virtual do Silveira & Prado Advocacia. Sinto muito que esteja passando por isso. Qual é o seu nome e cidade?"],
      ["cliente", "Fernanda Rocha Mendes, Curitiba"],
      ["assistente", "Obrigada, Fernanda. Qual é a sua função e você ainda trabalha na empresa?"],
      ["cliente", "Analista de marketing, estou afastada por ansiedade"],
      ["cliente", "[pdf] prints-mensagens.pdf"],
      ["cliente", "[imagem] atestado.jpg"],
      ["assistente", "Recebi os arquivos. A equipe vai entrar em contato para conversar com você."],
      ["equipe", "Olá, Fernanda! Aqui é a Dra. Helena. Analisamos o material e gostaríamos de conversar com você pessoalmente. Agendamos para amanhã às 10h, tudo bem?"],
      ["cliente", "Perfeito, obrigada!"],
    ],
  }),
  atd({
    id: "at-07",
    nome: "Patrícia Gomes Duarte",
    telefone: "(41) 99973-4120",
    cidade: "Pinhais – PR",
    area: "Família",
    urgente: false,
    status: "consulta_agendada",
    criadoEm: horasAtras(72),
    ultimoContatoHumano: horasAtras(46),
    resumoIA:
      "Casada há 12 anos, quer divórcio consensual. Há um filho de 9 anos e um imóvel financiado. O marido concorda com o divórcio e com a guarda compartilhada.",
    respostas: [
      { pergunta: "Qual é a situação: divórcio, pensão, guarda, inventário ou outra?", resposta: "Divórcio, de comum acordo." },
      { pergunta: "Há filhos menores de idade envolvidos?", resposta: "Um filho de 9 anos." },
      { pergunta: "Já existe algum processo em andamento?", resposta: "Não." },
    ],
    documentos: [],
    conversa: [
      ["cliente", "Bom dia, eu e meu marido queremos nos divorciar, é de comum acordo"],
      ["assistente", "Bom dia! Eu sou a Clara, assistente virtual do Silveira & Prado Advocacia. Qual é o seu nome e cidade?"],
      ["cliente", "Patrícia Gomes Duarte, Pinhais"],
      ["assistente", "Obrigada, Patrícia. Há filhos menores de idade?"],
      ["cliente", "Um filho de 9 anos. Também temos um apartamento financiado"],
      ["assistente", "Anotado. A equipe vai entrar em contato para os próximos passos."],
      ["equipe", "Olá, Patrícia! Podemos conversar hoje às 14h no escritório? Se preferir, pode ser por vídeo."],
      ["cliente", "Pode ser presencial, obrigada"],
    ],
  }),
  atd({
    id: "at-08",
    nome: "Rafael Martins Oliveira",
    telefone: "(41) 98744-0367",
    cidade: "Curitiba – PR",
    area: "Família",
    urgente: false,
    status: "aguardando_analise",
    criadoEm: horasAtras(7.4),
    resumoIA:
      "Pai que deseja revisar a pensão do filho de 11 anos após redução de salário (mudou de emprego). Também quer ampliar o regime de convivência para fins de semana alternados. Há sentença de 2022.",
    respostas: [
      { pergunta: "Qual é a situação: divórcio, pensão, guarda, inventário ou outra?", resposta: "Revisão de pensão e visitas." },
      { pergunta: "Há filhos menores de idade envolvidos?", resposta: "Sim, 11 anos." },
      { pergunta: "Já existe algum processo em andamento?", resposta: "Já teve, terminou em 2022." },
    ],
    documentos: [{ id: "d-08a", nome: "sentenca-2022.pdf", tipo: "pdf", tamanhoKb: 412 }],
    conversa: [
      ["cliente", "Quero rever o valor da pensão do meu filho, meu salário caiu"],
      ["assistente", "Olá! Eu sou a Clara, assistente virtual do Silveira & Prado Advocacia. Qual é o seu nome e cidade?"],
      ["cliente", "Rafael Martins Oliveira, Curitiba"],
      ["assistente", "Obrigada, Rafael. Já existe uma decisão sobre a pensão?"],
      ["cliente", "Sim, de 2022. Também queria ver mais meu filho"],
      ["cliente", "[pdf] sentenca-2022.pdf"],
      ["assistente", "Recebi. Organizei as informações para a equipe, que vai retornar em breve."],
    ],
  }),
  atd({
    id: "at-09",
    nome: "Luciana Barbosa Reis",
    telefone: "(41) 99231-8854",
    cidade: "Campo Largo – PR",
    area: "Bancário",
    urgente: false,
    status: "consulta_agendada",
    criadoEm: horasAtras(3.1),
    resumoIA:
      "Financiou um carro em 48 parcelas e acha que os juros estão acima do contratado. Pagou 20 parcelas e está com 2 em atraso. Tem o contrato em PDF.",
    respostas: [
      { pergunta: "Qual é o banco ou a instituição financeira?", resposta: "Financeira do carro." },
      { pergunta: "Qual é o problema: cobrança, juros, bloqueio, fraude ou outro?", resposta: "Juros muito altos." },
      { pergunta: "Desde quando isso acontece?", resposta: "Desde o começo, mas agora atrasei." },
      { pergunta: "Você tem o contrato ou os extratos?", resposta: "Tenho o contrato." },
    ],
    documentos: [{ id: "d-09a", nome: "contrato-financiamento.pdf", tipo: "pdf", tamanhoKb: 920 }],
    conversa: [
      ["cliente", "Oi, acho que estou pagando juros abusivos no financiamento do carro"],
      ["assistente", "Olá! Eu sou a Clara, assistente virtual do Silveira & Prado Advocacia. Qual é o seu nome e cidade?"],
      ["cliente", "Luciana Barbosa Reis, Campo Largo"],
      ["assistente", "Obrigada, Luciana. Quantas parcelas já pagou e tem o contrato?"],
      ["cliente", "Paguei 20 de 48, tenho 2 atrasadas"],
      ["cliente", "[pdf] contrato-financiamento.pdf"],
      ["assistente", "Recebi o contrato, obrigada. Posso marcar uma consulta inicial com a advogada para olharem o contrato juntas. Tenho: 1) " + quando(1, 15) + "; 2) " + quando(2, 11) + "; 3) " + quando(2, 14) + ". Qual prefere?"],
      ["cliente", "Pode ser a 1"],
      ["assistente", "Combinado! Pré-agendei para " + quando(1, 15) + ". A equipe confirma com você em breve. Se puder, leve os comprovantes das parcelas pagas."],
    ],
  }),
  atd({
    id: "at-10",
    nome: "José Antônio Ribeiro",
    telefone: "(41) 98516-2049",
    cidade: "Curitiba – PR",
    area: "Bancário",
    urgente: false,
    status: "contratou",
    criadoEm: horasAtras(120),
    ultimoContatoHumano: horasAtras(52),
    resumoIA:
      "Aposentado de 71 anos com desconto de empréstimo consignado que diz não ter contratado. Descontos de R$ 312 por mês há 5 meses. Já registrou reclamação no banco, sem solução.",
    respostas: [
      { pergunta: "Qual é o banco ou a instituição financeira?", resposta: "Banco do consignado." },
      { pergunta: "Qual é o problema: cobrança, juros, bloqueio, fraude ou outro?", resposta: "Empréstimo que eu não fiz." },
      { pergunta: "Desde quando isso acontece?", resposta: "Há 5 meses." },
      { pergunta: "Você tem o contrato ou os extratos?", resposta: "Tenho os extratos do INSS." },
    ],
    documentos: [{ id: "d-10a", nome: "extrato-inss.pdf", tipo: "pdf", tamanhoKb: 144 }],
    conversa: [
      ["cliente", "Estão descontando um empréstimo da minha aposentadoria que eu não fiz"],
      ["assistente", "Olá! Eu sou a Clara, assistente virtual do Silveira & Prado Advocacia. Qual é o seu nome e cidade?"],
      ["cliente", "José Antônio Ribeiro, Curitiba"],
      ["assistente", "Obrigada, seu José. Desde quando acontece o desconto?"],
      ["cliente", "5 meses, 312 reais"],
      ["cliente", "[pdf] extrato-inss.pdf"],
      ["assistente", "Recebi. A equipe vai entrar em contato."],
      ["equipe", "Seu José, aqui é o Dr. André. Recebemos tudo. Podemos conversar na quinta às 15h?"],
      ["cliente", "Combinado doutor"],
    ],
  }),
  atd({
    id: "at-11",
    nome: "Maria das Graças Oliveira",
    telefone: "(41) 99087-5512",
    cidade: "Fazenda Rio Grande – PR",
    area: "Previdenciário",
    urgente: false,
    status: "aguardando_analise",
    criadoEm: horasAtras(30.2),
    resumoIA:
      "Tem 63 anos e teve a aposentadoria por idade negada pelo INSS por falta de carência. Trabalhou como diarista por anos sem contribuir e depois contribuiu 11 anos como autônoma. Tem a carta de indeferimento.",
    respostas: [
      { pergunta: "Qual benefício você busca ou recebia?", resposta: "Aposentadoria por idade." },
      { pergunta: "Já fez o pedido no INSS? Qual foi a resposta?", resposta: "Fiz, negaram por falta de carência." },
      { pergunta: "Qual é a sua idade e o tempo aproximado de contribuição?", resposta: "63 anos, uns 11 anos pagando." },
    ],
    documentos: [{ id: "d-11a", nome: "carta-indeferimento.jpg", tipo: "imagem", tamanhoKb: 620 }],
    conversa: [
      ["cliente", "Bom dia, o INSS negou minha aposentadoria"],
      ["assistente", "Bom dia! Eu sou a Clara, assistente virtual do Silveira & Prado Advocacia. Qual é o seu nome e cidade?"],
      ["cliente", "Maria das Graças Oliveira, Fazenda Rio Grande"],
      ["assistente", "Obrigada, dona Maria. Qual benefício a senhora pediu e qual foi o motivo da negativa?"],
      ["cliente", "Aposentadoria por idade, falaram que falta carência. Tenho 63 anos"],
      ["cliente", "[imagem] carta-indeferimento.jpg"],
      ["assistente", "Recebi a carta. A equipe vai analisar e retornar para a senhora."],
    ],
  }),
  atd({
    id: "at-12",
    nome: "Antônio Carlos Nunes",
    telefone: "(41) 98633-7781",
    cidade: "Curitiba – PR",
    area: "Previdenciário",
    urgente: false,
    status: "consulta_agendada",
    criadoEm: horasAtras(40),
    ultimoContatoHumano: horasAtras(20),
    resumoIA:
      "Pedreiro de 54 anos com hérnia de disco. O benefício por incapacidade foi cessado após perícia, mas segue sem condições de trabalhar segundo o médico. Tem laudos recentes.",
    respostas: [
      { pergunta: "Qual benefício você busca ou recebia?", resposta: "Auxílio-doença." },
      { pergunta: "Já fez o pedido no INSS? Qual foi a resposta?", resposta: "Recebia, cortaram depois da perícia." },
      { pergunta: "Qual é a sua idade e o tempo aproximado de contribuição?", resposta: "54 anos, 25 de contribuição." },
      { pergunta: "Tem laudos ou documentos médicos?", resposta: "Sim, de setembro." },
    ],
    documentos: [
      { id: "d-12a", nome: "laudo-ortopedista.pdf", tipo: "pdf", tamanhoKb: 330 },
      { id: "d-12b", nome: "ressonancia.jpg", tipo: "imagem", tamanhoKb: 1205 },
    ],
    conversa: [
      ["cliente", "Cortaram meu auxílio doença e eu não consigo trabalhar"],
      ["assistente", "Olá! Eu sou a Clara, assistente virtual do Silveira & Prado Advocacia. Qual é o seu nome e cidade?"],
      ["cliente", "Antônio Carlos Nunes, Curitiba"],
      ["assistente", "Obrigada, seu Antônio. O senhor tem laudos médicos recentes?"],
      ["cliente", "[pdf] laudo-ortopedista.pdf"],
      ["cliente", "[imagem] ressonancia.jpg"],
      ["assistente", "Recebi. A equipe vai entrar em contato."],
      ["equipe", "Seu Antônio, aqui é a Dra. Helena. Pré-agendamos uma conversa para depois de amanhã às 9h. Confirma?"],
    ],
  }),
  atd({
    id: "at-13",
    nome: "Sebastião Alves Moreira",
    telefone: "(41) 99470-1238",
    cidade: "Almirante Tamandaré – PR",
    area: "Previdenciário",
    urgente: false,
    status: "nao_contratou",
    criadoEm: horasAtras(160),
    ultimoContatoHumano: horasAtras(90),
    resumoIA:
      "Busca BPC/LOAS para o filho de 14 anos com deficiência. Renda familiar de 1,5 salário mínimo. Após a consulta, decidiu seguir com a Defensoria Pública.",
    respostas: [
      { pergunta: "Qual benefício você busca ou recebia?", resposta: "BPC para meu filho." },
      { pergunta: "Já fez o pedido no INSS? Qual foi a resposta?", resposta: "Ainda não." },
    ],
    documentos: [],
    conversa: [
      ["cliente", "Queria saber do BPC pro meu filho"],
      ["assistente", "Olá! Eu sou a Clara, assistente virtual do Silveira & Prado Advocacia. Qual é o seu nome e cidade?"],
      ["cliente", "Sebastião Alves Moreira, Almirante Tamandaré"],
      ["assistente", "Obrigada, seu Sebastião. A equipe vai entrar em contato."],
      ["equipe", "Seu Sebastião, obrigado pela conversa de hoje. Qualquer dúvida, estamos à disposição."],
    ],
  }),
  atd({
    id: "at-14",
    nome: "Bruno Cardoso Lopes",
    telefone: "(41) 98890-6612",
    cidade: "Curitiba – PR",
    area: "Fora de escopo",
    urgente: false,
    status: "fora_de_escopo",
    criadoEm: horasAtras(9),
    resumoIA:
      "Foi intimado a prestar depoimento em delegacia como investigado em um inquérito. Assunto de direito penal, área que o escritório não atende. Recebeu a mensagem de encerramento com indicação da Defensoria e da OAB.",
    respostas: [],
    documentos: [],
    conversa: [
      ["cliente", "Fui chamado pra depor na delegacia, preciso de advogado criminal"],
      ["assistente", "Olá! Eu sou a Clara, assistente virtual do Silveira & Prado Advocacia. Obrigada por explicar! No momento o escritório não atua com esse tipo de caso, então não conseguiremos ajudar desta vez. Recomendamos procurar a Defensoria Pública ou a subseção da OAB da sua cidade para orientação."],
      ["cliente", "Ok, obrigado"],
    ],
  }),
  atd({
    id: "at-15",
    nome: "Camila Teixeira Prado",
    telefone: "(41) 99355-4407",
    cidade: "Curitiba – PR",
    area: "Fora de escopo",
    urgente: false,
    status: "fora_de_escopo",
    criadoEm: horasAtras(14),
    resumoIA:
      "Quer registrar a marca da sua confeitaria no INPI. Propriedade intelectual não está entre as áreas atendidas. Recebeu a mensagem de encerramento padrão.",
    respostas: [],
    documentos: [],
    conversa: [
      ["cliente", "Oi! Vocês fazem registro de marca?"],
      ["assistente", "Olá! Eu sou a Clara, assistente virtual do Silveira & Prado Advocacia. Obrigada por explicar! No momento o escritório não atua com esse tipo de caso, então não conseguiremos ajudar desta vez. Recomendamos procurar a Defensoria Pública ou a subseção da OAB da sua cidade para orientação."],
      ["cliente", "Entendi, obrigada!"],
    ],
  }),
];

/* ------------------------------------------------------------------ */
/* Consultas                                                            */
/* ------------------------------------------------------------------ */

function consulta(
  id: string,
  atendimentoId: string,
  dias: number,
  hh: number,
  status: Consulta["status"],
  agendadaPor: Consulta["agendadaPor"],
  duracao = 60,
): Consulta {
  const inicio = emDias(dias, hh);
  return {
    id,
    atendimentoId,
    inicio: inicio.toISOString(),
    fim: new Date(inicio.getTime() + duracao * MIN).toISOString(),
    status,
    agendadaPor,
  };
}

export const consultasMock: Consulta[] = [
  consulta("c-1", "at-07", 0, 14, "confirmada", "equipe"),
  consulta("c-2", "at-06", 1, 10, "confirmada", "equipe"),
  consulta("c-3", "at-12", 2, 9, "pre_agendada", "equipe"),
  consulta("c-4", "at-10", -2, 15, "realizada", "equipe"),
  consulta("c-5", "at-13", -3, 11, "realizada", "equipe"),
  consulta("c-6", "at-09", 1, 15, "pre_agendada", "assistente"),
  consulta("c-7", "at-05", -1, 16, "realizada", "assistente"),
];

/* ------------------------------------------------------------------ */
/* Simulação de novo atendimento urgente (ferramenta de desenvolvimento) */
/* ------------------------------------------------------------------ */

const modelosUrgentes: Array<Pick<Atendimento, "area" | "motivoUrgencia" | "resumoIA"> & { primeira: string }> = [
  {
    area: "Família",
    motivoUrgencia: "Risco de prisão por pensão atrasada",
    resumoIA: "Recebeu mandado de pagamento de pensão alimentícia em atraso, com aviso de possível prisão em 3 dias. Quer negociar o débito.",
    primeira: "Recebi um papel dizendo que posso ser preso se não pagar a pensão em 3 dias",
  },
  {
    area: "Trabalhista",
    motivoUrgencia: "Audiência amanhã e sem advogado",
    resumoIA: "Empresa reclamada de pequeno porte (padaria) com audiência inicial amanhã. O sócio não tem advogado e quer orientação para comparecer.",
    primeira: "Tenho audiência amanhã num processo trabalhista e não tenho advogado",
  },
  {
    area: "Bancário",
    motivoUrgencia: "Bloqueio judicial em conta da empresa",
    resumoIA: "MEI teve a conta PJ bloqueada via SISBAJUD e não consegue pagar fornecedores nesta semana. Não sabe de qual processo se trata.",
    primeira: "Minha conta da empresa foi bloqueada pelo SISBAJUD hoje de manhã",
  },
  {
    area: "Previdenciário",
    motivoUrgencia: "Prazo de recurso ao INSS vencendo",
    resumoIA: "Teve o benefício por incapacidade negado e o prazo de recurso administrativo vence em 2 dias. Tem laudos e a carta do INSS.",
    primeira: "O prazo pra recorrer do INSS vence depois de amanhã",
  },
];

const nomesSimulados = [
  "Gabriela Fontes",
  "Thiago Albuquerque",
  "Renata Cavalcanti",
  "Eduardo Bittencourt",
  "Simone Vasconcelos",
  "Leandro Pacheco",
];

let seqSimulado = 0;

export function gerarAtendimentoUrgente(): Atendimento {
  seqSimulado += 1;
  const modelo = modelosUrgentes[Math.floor(Math.random() * modelosUrgentes.length)];
  const nome = nomesSimulados[Math.floor(Math.random() * nomesSimulados.length)];
  const id = `sim-${Date.now()}-${seqSimulado}`;
  const agora = new Date().toISOString();
  const tel = `(41) 9${Math.floor(1000 + Math.random() * 8999)}-${Math.floor(1000 + Math.random() * 8999)}`;
  return {
    id,
    nome,
    telefone: tel,
    cidade: "Curitiba – PR",
    area: modelo.area,
    urgente: true,
    motivoUrgencia: modelo.motivoUrgencia,
    resumoIA: modelo.resumoIA,
    status: "novo",
    respostas: [],
    documentos: [],
    criadoEm: agora,
    mensagens: [
      { id: `${id}-m1`, autor: "cliente", texto: modelo.primeira, enviadaEm: agora },
      {
        id: `${id}-m2`,
        autor: "assistente",
        texto: "Entendi. Marquei o seu atendimento como prioritário e a equipe vai falar com você o quanto antes.",
        enviadaEm: agora,
      },
    ],
  };
}
