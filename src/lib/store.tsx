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

  adicionarAtendimento: (a: Atendimento) => void;
  marcarContatado: (id: string) => void;
  mudarStatus: (id: string, status: StatusAtendimento) => void;
  agendarConsulta: (atendimentoId: string, inicio: Date) => Consulta;

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

  // Simula a latência da primeira carga para exibir os skeletons.
  useEffect(() => {
    const t = setTimeout(() => {
      setAtendimentos(atendimentosMock);
      setCarregando(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  const atualizar = useCallback((id: string, patch: Partial<Atendimento>) => {
    setAtendimentos((lista) => lista.map((a) => (a.id === id ? { ...a, ...patch } : a)));
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

  const adicionarAtendimento = useCallback((a: Atendimento) => {
    setAtendimentos((lista) => [a, ...lista]);
  }, []);

  const marcarContatado = useCallback(
    (id: string) => {
      setAtendimentos((lista) =>
        lista.map((a) =>
          a.id === id
            ? {
                ...a,
                ultimoContatoHumano: new Date().toISOString(),
                status: a.status === "novo" ? "aguardando_analise" : a.status,
              }
            : a,
        ),
      );
    },
    [],
  );

  const mudarStatus = useCallback((id: string, status: StatusAtendimento) => atualizar(id, { status }), [atualizar]);

  const agendarConsulta = useCallback(
    (atendimentoId: string, inicio: Date) => {
      const nova: Consulta = {
        id: uid("c"),
        atendimentoId,
        inicio: inicio.toISOString(),
        fim: new Date(inicio.getTime() + horarios.duracaoMinutos * 60_000).toISOString(),
        status: horarios.modo === "confirmar_direto" ? "confirmada" : "pre_agendada",
      };
      setConsultas((l) => [...l, nova]);
      setAtendimentos((lista) =>
        lista.map((a) =>
          a.id === atendimentoId
            ? { ...a, status: "consulta_agendada", ultimoContatoHumano: a.ultimoContatoHumano ?? new Date().toISOString() }
            : a,
        ),
      );
      return nova;
    },
    [horarios],
  );

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
      marcarContatado,
      mudarStatus,
      agendarConsulta,
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
      marcarContatado,
      mudarStatus,
      agendarConsulta,
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
