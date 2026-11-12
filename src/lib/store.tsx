/**
 * Estado da aplicação em memória.
 * Cada ação aqui corresponde a uma futura chamada de API — basta trocar a implementação.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  areasMock,
  assistenteMock,
  atendimentosMock,
  consultasMock,
  empresaMock,
  horariosMock,
  limitesMock,
  regrasUrgenciaMock,
  usuarioMock,
} from "./mock-data";
import type {
  Area,
  Atendimento,
  ConfigAssistente,
  ConfigHorarios,
  Consulta,
  Empresa,
  LimiteAssistente,
  Mensagem,
  RegraUrgencia,
  StatusAtendimento,
  Usuario,
} from "./types";
import { uid } from "./utils";

const CHAVE_SESSAO = "atrio:sessao";

interface AppStore {
  carregando: boolean;
  logado: boolean;
  usuario: Usuario;
  empresa: Empresa;
  areas: Area[];
  regrasUrgencia: RegraUrgencia[];
  horarios: ConfigHorarios;
  assistente: ConfigAssistente;
  limites: LimiteAssistente[];
  atendimentos: Atendimento[];
  consultas: Consulta[];

  entrar: (email: string) => void;
  sair: () => void;

  /* Atendimentos */
  adicionarAtendimento: (a: Atendimento) => void;
  atualizarAtendimento: (id: string, patch: Partial<Atendimento>) => void;
  adicionarMensagem: (id: string, m: Mensagem) => void;
  marcarContatado: (id: string) => void;
  mudarStatus: (id: string, status: StatusAtendimento) => void;
  registrarResultado: (atendimentoId: string, resultado: "contratou" | "nao_contratou") => void;

  /* Consultas */
  agendarConsulta: (atendimentoId: string, inicio: Date, por?: "assistente" | "equipe") => Consulta;
  confirmarConsulta: (consultaId: string) => void;
  remarcarConsulta: (consultaId: string, inicio: Date) => void;
  cancelarConsulta: (consultaId: string) => void;
  marcarConsultaRealizada: (consultaId: string) => void;

  /* Configurações */
  salvarEmpresa: (e: Partial<Empresa>) => void;
  salvarAreas: (a: Area[]) => void;
  salvarRegrasUrgencia: (r: RegraUrgencia[]) => void;
  salvarHorarios: (h: ConfigHorarios) => void;
  salvarAssistente: (a: ConfigAssistente) => void;
  salvarLimites: (l: LimiteAssistente[]) => void;
}

const Ctx = createContext<AppStore | null>(null);

function lerSessao() {
  try {
    return localStorage.getItem(CHAVE_SESSAO) === "1";
  } catch {
    return false;
  }
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [logado, setLogado] = useState(lerSessao);
  const [usuario, setUsuario] = useState(usuarioMock);
  const [empresa, setEmpresa] = useState(empresaMock);
  const [areas, setAreas] = useState(areasMock);
  const [regrasUrgencia, setRegras] = useState(regrasUrgenciaMock);
  const [horarios, setHorarios] = useState(horariosMock);
  const [assistente, setAssistente] = useState(assistenteMock);
  const [limites, setLimites] = useState(limitesMock);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [consultas, setConsultas] = useState(consultasMock);

  // Simula a latência da primeira carga para exibir os esqueletos.
  useEffect(() => {
    const t = setTimeout(() => {
      setAtendimentos(atendimentosMock);
      setCarregando(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  const atualizarAtendimento = useCallback((id: string, patch: Partial<Atendimento>) => {
    setAtendimentos((lista) => lista.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const atualizarConsulta = useCallback((id: string, patch: Partial<Consulta>) => {
    setConsultas((lista) => lista.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const entrar = useCallback((email: string) => {
    try {
      localStorage.setItem(CHAVE_SESSAO, "1");
    } catch {
      /* ignora modo privado */
    }
    if (email) setUsuario((u) => ({ ...u, email }));
    setLogado(true);
  }, []);

  const sair = useCallback(() => {
    try {
      localStorage.removeItem(CHAVE_SESSAO);
    } catch {
      /* ignora */
    }
    setLogado(false);
  }, []);

  const adicionarAtendimento = useCallback((a: Atendimento) => setAtendimentos((lista) => [a, ...lista]), []);

  const adicionarMensagem = useCallback((id: string, m: Mensagem) => {
    setAtendimentos((lista) => lista.map((a) => (a.id === id ? { ...a, mensagens: [...a.mensagens, m] } : a)));
  }, []);

  const marcarContatado = useCallback((id: string) => {
    setAtendimentos((lista) =>
      lista.map((a) =>
        a.id === id
          ? { ...a, ultimoContatoHumano: new Date().toISOString(), status: a.status === "novo" ? "aguardando_analise" : a.status }
          : a,
      ),
    );
  }, []);

  const mudarStatus = useCallback((id: string, status: StatusAtendimento) => atualizarAtendimento(id, { status }), [atualizarAtendimento]);

  const registrarResultado = useCallback((atendimentoId: string, resultado: "contratou" | "nao_contratou") => {
    setAtendimentos((lista) => lista.map((a) => (a.id === atendimentoId ? { ...a, status: resultado } : a)));
    // A consulta mais recente que já passou passa a constar como realizada.
    setConsultas((lista) =>
      lista.map((c) =>
        c.atendimentoId === atendimentoId && c.status !== "cancelada" && new Date(c.inicio).getTime() <= Date.now() ? { ...c, status: "realizada" } : c,
      ),
    );
  }, []);

  const agendarConsulta = useCallback(
    (atendimentoId: string, inicio: Date, por: "assistente" | "equipe" = "equipe") => {
      const nova: Consulta = {
        id: uid("c"),
        atendimentoId,
        inicio: inicio.toISOString(),
        fim: new Date(inicio.getTime() + horarios.duracaoMinutos * 60_000).toISOString(),
        // Agendada pela equipe já nasce confirmada; pelo assistente segue a regra de Configurações › Horários.
        status: por === "equipe" || horarios.modo === "confirmar_direto" ? "confirmada" : "pre_agendada",
        agendadaPor: por,
      };
      setConsultas((l) => [...l.map((c) => (c.atendimentoId === atendimentoId && c.status !== "realizada" ? { ...c, status: "cancelada" as const } : c)), nova]);
      setAtendimentos((lista) =>
        lista.map((a) =>
          a.id === atendimentoId
            ? {
                ...a,
                status: "consulta_agendada",
                ultimoContatoHumano: por === "equipe" ? (a.ultimoContatoHumano ?? new Date().toISOString()) : a.ultimoContatoHumano,
              }
            : a,
        ),
      );
      return nova;
    },
    [horarios],
  );

  const confirmarConsulta = useCallback((id: string) => atualizarConsulta(id, { status: "confirmada" }), [atualizarConsulta]);

  const remarcarConsulta = useCallback(
    (id: string, inicio: Date) =>
      atualizarConsulta(id, {
        inicio: inicio.toISOString(),
        fim: new Date(inicio.getTime() + horarios.duracaoMinutos * 60_000).toISOString(),
        status: "confirmada",
      }),
    [atualizarConsulta, horarios],
  );

  const cancelarConsulta = useCallback((id: string) => {
    setConsultas((lista) => {
      const alvo = lista.find((c) => c.id === id);
      if (alvo) {
        // Sem consulta ativa, o cliente volta para "aguardando a equipe".
        const outras = lista.some((c) => c.id !== id && c.atendimentoId === alvo.atendimentoId && c.status !== "cancelada");
        if (!outras) setAtendimentos((l) => l.map((a) => (a.id === alvo.atendimentoId && a.status === "consulta_agendada" ? { ...a, status: "aguardando_analise" } : a)));
      }
      return lista.map((c) => (c.id === id ? { ...c, status: "cancelada" } : c));
    });
  }, []);

  const marcarConsultaRealizada = useCallback((id: string) => atualizarConsulta(id, { status: "realizada" }), [atualizarConsulta]);

  const salvarEmpresa = useCallback((e: Partial<Empresa>) => setEmpresa((atual) => ({ ...atual, ...e })), []);

  const value = useMemo<AppStore>(
    () => ({
      carregando,
      logado,
      usuario,
      empresa,
      areas,
      regrasUrgencia,
      horarios,
      assistente,
      limites,
      atendimentos,
      consultas,
      entrar,
      sair,
      adicionarAtendimento,
      atualizarAtendimento,
      adicionarMensagem,
      marcarContatado,
      mudarStatus,
      registrarResultado,
      agendarConsulta,
      confirmarConsulta,
      remarcarConsulta,
      cancelarConsulta,
      marcarConsultaRealizada,
      salvarEmpresa,
      salvarAreas: setAreas,
      salvarRegrasUrgencia: setRegras,
      salvarHorarios: setHorarios,
      salvarAssistente: setAssistente,
      salvarLimites: setLimites,
    }),
    [
      carregando,
      logado,
      usuario,
      empresa,
      areas,
      regrasUrgencia,
      horarios,
      assistente,
      limites,
      atendimentos,
      consultas,
      entrar,
      sair,
      adicionarAtendimento,
      atualizarAtendimento,
      adicionarMensagem,
      marcarContatado,
      mudarStatus,
      registrarResultado,
      agendarConsulta,
      confirmarConsulta,
      remarcarConsulta,
      cancelarConsulta,
      marcarConsultaRealizada,
      salvarEmpresa,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppStore precisa estar dentro de <AppStoreProvider>");
  return ctx;
}
