/**
 * Alertas de atendimentos urgentes.
 *
 * Observa a lista de atendimentos e, quando surge um novo urgente, dispara:
 *  1. toast no canto superior direito com botão "Abrir";
 *  2. som curto (respeitando o botão de silenciar e a política de autoplay);
 *  3. o contador vermelho na barra lateral (derivado do estado — ver `urgentePendente`);
 *  4. notificação do navegador, se o usuário tiver permitido.
 *
 * Quando houver back-end, basta que novos atendimentos entrem no store (ex.: via WebSocket).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import type { Atendimento } from "@/lib/types";

const CHAVE_MUDO = "atrio:som-mudo";
const CHAVE_AVISO_DISPENSADO = "atrio:aviso-notificacao-dispensado";
const SOM_URL = "/sounds/alerta-urgente.wav";

export type PermissaoNotificacao = NotificationPermission | "indisponivel";

export interface AlertaRegistrado {
  id: string;
  atendimentoId: string;
  nome: string;
  motivo: string;
  em: string;
  lido: boolean;
}

interface UrgentAlertsCtx {
  mudo: boolean;
  alternarMudo: () => void;
  /** O navegador ainda não permitiu tocar som (falta a primeira interação). */
  somAguardandoInteracao: boolean;
  permissao: PermissaoNotificacao;
  pedirPermissao: () => Promise<void>;
  avisoDispensado: boolean;
  dispensarAviso: () => void;
  alertas: AlertaRegistrado[];
  naoLidos: number;
  marcarTodosLidos: () => void;
  abrirAtendimento: (id: string) => void;
}

const Ctx = createContext<UrgentAlertsCtx | null>(null);

const ler = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const gravar = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignora */
  }
};

const permissaoAtual = (): PermissaoNotificacao =>
  typeof window !== "undefined" && "Notification" in window ? Notification.permission : "indisponivel";

export function UrgentAlertsProvider({ children }: { children: ReactNode }) {
  const { atendimentos, carregando } = useAppStore();
  const navigate = useNavigate();

  const [mudo, setMudo] = useState(() => ler(CHAVE_MUDO) === "1");
  const [permissao, setPermissao] = useState<PermissaoNotificacao>(permissaoAtual);
  const [avisoDispensado, setAvisoDispensado] = useState(() => ler(CHAVE_AVISO_DISPENSADO) === "1");
  const [alertas, setAlertas] = useState<AlertaRegistrado[]>([]);
  const [interagiu, setInteragiu] = useState(
    () => (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive ?? false,
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const vistos = useRef<Set<string> | null>(null);
  const mudoRef = useRef(mudo);
  mudoRef.current = mudo;

  // Pré-carrega o som e registra a primeira interação (exigência dos navegadores para tocar áudio).
  useEffect(() => {
    const audio = new Audio(SOM_URL);
    audio.preload = "auto";
    audio.volume = 0.45;
    audioRef.current = audio;

    if (interagiu) return;
    const marcar = () => setInteragiu(true);
    window.addEventListener("pointerdown", marcar, { once: true });
    window.addEventListener("keydown", marcar, { once: true });
    return () => {
      window.removeEventListener("pointerdown", marcar);
      window.removeEventListener("keydown", marcar);
    };
  }, []);

  // Sincroniza caso o usuário altere a permissão nas configurações do navegador.
  useEffect(() => {
    const sync = () => setPermissao(permissaoAtual());
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const abrirAtendimento = useCallback(
    (id: string) => {
      navigate(`/atendimentos?id=${encodeURIComponent(id)}`);
      setAlertas((l) => l.map((a) => (a.atendimentoId === id ? { ...a, lido: true } : a)));
    },
    [navigate],
  );

  const tocarSom = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || mudoRef.current) return;
    audio.currentTime = 0;
    audio.play().catch(() => {
      /* bloqueado por autoplay: o toast e o contador continuam funcionando */
    });
  }, []);

  const notificarNavegador = useCallback(
    (a: Atendimento) => {
      if (permissaoAtual() !== "granted") return;
      try {
        const n = new Notification(`Atendimento urgente: ${a.nome}`, {
          body: a.motivoUrgencia ?? a.resumoIA,
          tag: a.id,
          icon: "/favicon.svg",
        });
        n.onclick = () => {
          window.focus();
          abrirAtendimento(a.id);
          n.close();
        };
      } catch {
        /* alguns navegadores móveis exigem Service Worker para notificações */
      }
    },
    [abrirAtendimento],
  );

  const disparar = useCallback(
    (a: Atendimento) => {
      const motivo = a.motivoUrgencia ?? "Atendimento marcado como urgente";
      setAlertas((l) => [
        { id: `al-${a.id}`, atendimentoId: a.id, nome: a.nome, motivo, em: new Date().toISOString(), lido: false },
        ...l,
      ]);
      toast(`Urgente: ${a.nome}`, {
        id: `urgente-${a.id}`,
        description: motivo,
        icon: <span className="block size-2 rounded-full bg-urgente animate-pulso" aria-hidden="true" />,
        duration: 15000,
        action: { label: "Abrir", onClick: () => abrirAtendimento(a.id) },
      });
      tocarSom();
      notificarNavegador(a);
    },
    [abrirAtendimento, notificarNavegador, tocarSom],
  );

  // Avisa uma vez por atendimento que chega urgente ou que se torna urgente durante a triagem
  // (ex.: o cliente menciona "intimação" no meio da conversa). Os urgentes da carga inicial não tocam.
  useEffect(() => {
    if (carregando) return;
    if (!vistos.current) {
      vistos.current = new Set(atendimentos.filter((a) => a.urgente).map((a) => a.id));
      return;
    }
    for (const a of atendimentos) {
      if (!a.urgente || vistos.current.has(a.id)) continue;
      vistos.current.add(a.id);
      disparar(a);
    }
  }, [atendimentos, carregando, disparar]);

  const pedirPermissao = useCallback(async () => {
    if (permissaoAtual() === "indisponivel") return;
    const resultado = await Notification.requestPermission();
    setPermissao(resultado);
    if (resultado === "granted") {
      toast.success("Notificações ativadas", {
        description: "Você será avisado de casos urgentes mesmo com a aba em segundo plano.",
      });
    } else if (resultado === "denied") {
      toast.warning("Notificações bloqueadas", {
        description:
          "Os alertas continuam aparecendo aqui no painel. Para receber avisos fora da aba, libere as notificações nas configurações do navegador.",
        duration: 10000,
      });
    }
  }, []);

  // Pedido de permissão: um toast discreto, exibido uma única vez (nunca uma faixa fixa).
  const pedidoMostrado = useRef(false);
  useEffect(() => {
    if (carregando || pedidoMostrado.current || avisoDispensado || permissaoAtual() !== "default") return;
    const t = setTimeout(() => {
      pedidoMostrado.current = true;
      gravar(CHAVE_AVISO_DISPENSADO, "1");
      setAvisoDispensado(true);
      toast("Avisos de casos urgentes", {
        id: "pedido-notificacao",
        description: "Ative as notificações do navegador para ser avisado mesmo com esta aba em segundo plano.",
        duration: 14000,
        action: { label: "Ativar", onClick: () => void pedirPermissao() },
        cancel: { label: "Agora não", onClick: () => {} },
      });
    }, 1200);
    return () => clearTimeout(t);
  }, [carregando, avisoDispensado, pedirPermissao]);

  const value = useMemo<UrgentAlertsCtx>(
    () => ({
      mudo,
      alternarMudo: () =>
        setMudo((m) => {
          gravar(CHAVE_MUDO, m ? "0" : "1");
          return !m;
        }),
      somAguardandoInteracao: !interagiu,
      permissao,
      pedirPermissao,
      avisoDispensado,
      dispensarAviso: () => {
        gravar(CHAVE_AVISO_DISPENSADO, "1");
        setAvisoDispensado(true);
      },
      alertas,
      naoLidos: alertas.filter((a) => !a.lido).length,
      marcarTodosLidos: () => setAlertas((l) => l.map((a) => ({ ...a, lido: true }))),
      abrirAtendimento,
    }),
    [mudo, interagiu, permissao, pedirPermissao, avisoDispensado, alertas, abrirAtendimento],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUrgentAlerts() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUrgentAlerts precisa estar dentro de <UrgentAlertsProvider>");
  return ctx;
}
