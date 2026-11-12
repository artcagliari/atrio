/**
 * Triagem ao vivo (demonstração): simula um cliente chegando no WhatsApp e o assistente
 * conduzindo a conversa — perguntas do roteiro, detecção de urgência, encerramento de
 * assuntos fora das áreas e oferta de horários com agendamento automático.
 *
 * Em produção, estes eventos chegam do back-end (webhook do WhatsApp + IA); a interface
 * já reage a eles porque tudo passa pelas mesmas ações do store.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { horariosLivres, proximosDiasDisponiveis } from "@/lib/agenda";
import { CLIENTES_SIMULADOS } from "@/lib/simulacao";
import { useAppStore } from "@/lib/store";
import type { AutorMensagem } from "@/lib/types";
import { formatarDataLonga, formatarHora, mesmoDia, normalizar, uid } from "@/lib/utils";

interface Ctx {
  simularCliente: () => void;
  triagensAtivas: number;
}

const TriagemCtx = createContext<Ctx>({ simularCliente: () => {}, triagensAtivas: 0 });
export const useTriagemAoVivo = () => useContext(TriagemCtx);

const PAUSA_CLIENTE = 1500;
const DIGITANDO = 1100;

export function TriagemAoVivoProvider({ children }: { children: ReactNode }) {
  const store = useAppStore();
  const ref = useRef(store);
  ref.current = store;
  const navigate = useNavigate();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sequencia = useRef(0);
  const [triagensAtivas, setTriagensAtivas] = useState(0);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const simularCliente = useCallback(() => {
    const cliente = CLIENTES_SIMULADOS[sequencia.current++ % CLIENTES_SIMULADOS.length];
    const id = `tri-${Date.now()}`;
    const primeiroNome = cliente.nome.split(" ")[0];
    const s = () => ref.current;
    const agora = () => new Date().toISOString();
    const enviar = (autor: AutorMensagem, texto: string) => s().adicionarMensagem(id, { id: uid("m"), autor, texto, enviadaEm: agora() });

    const verificarUrgencia = (texto: string) => {
      const atual = s().atendimentos.find((a) => a.id === id);
      if (atual?.urgente) return;
      const regra = s().regrasUrgencia.find((r) => r.palavrasChave.some((k) => k && normalizar(texto).includes(normalizar(k))));
      if (regra) s().atualizarAtendimento(id, { urgente: true, motivoUrgencia: regra.descricao });
    };

    // Linha do tempo da conversa
    let t = 0;
    const agendar = (fn: () => void) => timers.current.push(setTimeout(fn, t));
    const cli = (texto: () => string, depois?: (texto: string) => void) => {
      t += PAUSA_CLIENTE;
      agendar(() => {
        const txt = texto();
        if (!txt) return;
        enviar("cliente", txt);
        verificarUrgencia(txt);
        depois?.(txt);
      });
    };
    const ass = (texto: () => string, depois?: () => void) => {
      t += 500;
      agendar(() => s().atualizarAtendimento(id, { assistenteDigitando: true }));
      t += DIGITANDO;
      agendar(() => {
        const txt = texto();
        s().atualizarAtendimento(id, { assistenteDigitando: false });
        if (txt) enviar("assistente", txt);
        depois?.();
      });
    };

    // 1. Cliente chama no WhatsApp
    setTriagensAtivas((n) => n + 1);
    s().adicionarAtendimento({
      id,
      nome: cliente.nome,
      telefone: cliente.telefone,
      cidade: cliente.cidade,
      area: cliente.area,
      resumoIA: "Triagem em andamento — o assistente ainda está coletando as informações.",
      respostas: [],
      urgente: false,
      status: "em_triagem",
      documentos: [],
      mensagens: [{ id: uid("m"), autor: "cliente", texto: cliente.abertura, enviadaEm: agora() }],
      criadoEm: agora(),
    });
    timers.current.push(setTimeout(() => verificarUrgencia(cliente.abertura), 50));
    toast("Novo cliente no WhatsApp", {
      id: `chegou-${id}`,
      description: `${cliente.nome} iniciou uma conversa. O assistente está fazendo a triagem.`,
      action: { label: "Acompanhar", onClick: () => navigate(`/atendimentos?id=${id}`) },
    });

    // 2. Saudação e identificação
    ass(() => s().assistente.saudacao);
    cli(() => `Pode sim. Sou ${cliente.nome}, de ${cliente.cidade.split(" –")[0]}.`);

    const area = s().areas.find((a) => a.ativa && normalizar(a.nome) === normalizar(cliente.area));
    const terminar = () => setTriagensAtivas((n) => Math.max(0, n - 1));

    // 3a. Fora das áreas atendidas: encerra com a mensagem configurada
    if (!area) {
      ass(
        () => s().assistente.encerramentoForaEscopo,
        () => {
          s().atualizarAtendimento(id, { status: "fora_de_escopo", area: "Fora de escopo", resumoIA: cliente.resumo });
          terminar();
        },
      );
      return;
    }

    // 3b. Perguntas do roteiro configurado
    const perguntas = [...area.perguntas].sort((a, b) => a.ordem - b.ordem).slice(0, 5);
    perguntas.forEach((p, i) => {
      ass(() => (i === 0 ? `Obrigada, ${primeiroNome}. ${p.texto}` : p.texto));
      cli(
        () => cliente.respostas[i] ?? "Não sei dizer agora.",
        (resposta) => {
          const atual = s().atendimentos.find((a) => a.id === id);
          if (atual) s().atualizarAtendimento(id, { respostas: [...atual.respostas, { pergunta: p.texto, resposta }] });
        },
      );
    });

    // 4. Triagem concluída: resumo pronto e oferta de horários livres
    let oferecidos: Date[] = [];
    ass(
      () => {
        s().atualizarAtendimento(id, { status: "novo", resumoIA: cliente.resumo });
        const { horarios, consultas } = s();
        const dias = proximosDiasDisponiveis(horarios, 10);
        oferecidos = [];
        for (const d of dias) {
          const livre = horariosLivres(d, horarios, consultas)[0];
          if (livre && !oferecidos.some((o) => mesmoDia(o, livre))) oferecidos.push(livre);
          if (oferecidos.length === 3) break;
        }
        if (oferecidos.length === 0) return "Obrigada! Já organizei tudo para a equipe, que vai entrar em contato para combinar o horário da consulta.";
        const lista = oferecidos.map((d, i) => `${i + 1}) ${formatarDataLonga(d)}, às ${formatarHora(d)}`).join("; ");
        return `Obrigada, ${primeiroNome}! Já organizei tudo para a equipe. Posso marcar uma consulta inicial com a advogada. Tenho estes horários: ${lista}. Qual fica melhor para você?`;
      },
      () => {
        if (oferecidos.length === 0) {
          s().atualizarAtendimento(id, { status: "aguardando_analise" });
          terminar();
        }
      },
    );

    // 5. Cliente escolhe; o assistente agenda e o relatório fica pronto
    const escolha = () => (s().atendimentos.find((a) => a.id === id)?.urgente ? 0 : Math.min(1, oferecidos.length - 1));
    cli(() => (oferecidos.length ? `Pode ser a opção ${escolha() + 1}.` : ""));
    ass(
      () => {
        if (!oferecidos.length) return "";
        const d = oferecidos[escolha()];
        const pre = s().horarios.modo === "pre_agendar";
        return pre
          ? `Combinado! Pré-agendei sua consulta para ${formatarDataLonga(d)}, às ${formatarHora(d)}. A equipe confirma com você em breve.`
          : `Pronto! Sua consulta está marcada para ${formatarDataLonga(d)}, às ${formatarHora(d)}. Até lá!`;
      },
      () => {
        if (!oferecidos.length) return;
        const d = oferecidos[escolha()];
        s().agendarConsulta(id, d, "assistente");
        terminar();
        toast.success("Consulta marcada pelo assistente", {
          id: `agendou-${id}`,
          description: `${cliente.nome} · ${formatarDataLonga(d)}, ${formatarHora(d)}. O relatório para a consulta está pronto.`,
          action: { label: "Ver relatório", onClick: () => navigate(`/relatorio/${id}`) },
          duration: 12000,
        });
      },
    );
  }, [navigate]);

  return <TriagemCtx.Provider value={{ simularCliente, triagensAtivas }}>{children}</TriagemCtx.Provider>;
}
