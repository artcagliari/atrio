import { Bot, CalendarClock, CalendarX, Check, FileText, Inbox, UserCheck, UserX, Users } from "lucide-react";
import { useState, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { devolverFoco } from "@/lib/foco";
import { consultaJaAconteceu } from "@/lib/funil";
import { useAppStore } from "@/lib/store";
import type { Consulta } from "@/lib/types";
import { formatarDataLonga, formatarHora, STATUS_CONSULTA_LABEL } from "@/lib/utils";
import { AgendarConsultaDialog } from "./AgendarConsultaDialog";

interface Props {
  consulta: Consulta | null;
  onOpenChange: (v: boolean) => void;
  /** Mostrar o atalho "Abrir atendimento" (fora da tela de atendimentos) */
  comAtalhoAtendimento?: boolean;
  retornarFocoPara?: RefObject<HTMLElement>;
}

/** Detalhes e ações de uma consulta: confirmar, remarcar, cancelar, registrar resultado, relatório. */
export function ConsultaDialog({ consulta, onOpenChange, comAtalhoAtendimento = true, retornarFocoPara }: Props) {
  const { atendimentos, consultas, confirmarConsulta, cancelarConsulta, marcarConsultaRealizada, registrarResultado } = useAppStore();
  const navigate = useNavigate();
  const [remarcando, setRemarcando] = useState(false);
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);

  // Sempre a versão atual da consulta (pode mudar enquanto o diálogo está aberto)
  const c = consulta ? (consultas.find((x) => x.id === consulta.id) ?? consulta) : null;
  const a = c ? atendimentos.find((x) => x.id === c.atendimentoId) : undefined;
  const passou = c ? consultaJaAconteceu(c) : false;
  const ativa = c && c.status !== "cancelada";
  const aguardandoResultado = !!a && a.status === "consulta_agendada" && passou && ativa;

  function fechar(v: boolean) {
    if (!v) setConfirmandoCancelamento(false);
    onOpenChange(v);
  }

  return (
    <>
      <Dialog open={!!consulta && !remarcando} onOpenChange={fechar}>
        <DialogContent className="max-w-lg" onCloseAutoFocus={(e) => devolverFoco(e, retornarFocoPara)}>
          {c && (
            <>
              <DialogHeader>
                <DialogTitle>{a?.nome ?? "Consulta"}</DialogTitle>
                <DialogDescription>
                  <span className="first-letter:uppercase">{formatarDataLonga(c.inicio)}</span>, <span className="font-mono">{formatarHora(c.inicio)}–{formatarHora(c.fim)}</span>
                  {a && ` · ${a.area}`}
                </DialogDescription>
              </DialogHeader>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-apoio">
                <div>
                  <dt className="text-micro text-muted-foreground">Situação</dt>
                  <dd className="mt-1">{STATUS_CONSULTA_LABEL[c.status]}</dd>
                </div>
                <div>
                  <dt className="text-micro text-muted-foreground">Marcada por</dt>
                  <dd className="mt-1 flex items-center gap-1.5">
                    {c.agendadaPor === "assistente" ? <Bot className="size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" /> : <Users className="size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />}
                    {c.agendadaPor === "assistente" ? "Assistente, no WhatsApp" : "Equipe"}
                  </dd>
                </div>
              </dl>

              {c.status === "pre_agendada" && !passou && (
                <p className="text-apoio leading-relaxed text-muted-foreground">
                  O assistente pré-agendou este horário com o cliente. Confirme para ele ficar valendo na agenda.
                </p>
              )}

              <div className="flex flex-col gap-2">
                {c.status === "pre_agendada" && !passou && (
                  <Button
                    variant="latao"
                    onClick={() => {
                      confirmarConsulta(c.id);
                      toast.success("Consulta confirmada", { description: `${a?.nome} · ${formatarDataLonga(c.inicio)}, ${formatarHora(c.inicio)}` });
                    }}
                  >
                    <Check strokeWidth={1.5} aria-hidden="true" /> Confirmar consulta
                  </Button>
                )}

                {aguardandoResultado && a && (
                  <div className="vidro-interno flex flex-col gap-3 rounded-2xl p-4 [--vidro-a:0.04]">
                    <p className="text-apoio">A consulta já aconteceu. O cliente contratou o escritório?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="latao"
                        onClick={() => {
                          registrarResultado(a.id, "contratou");
                          toast.success("Resultado registrado", { description: `${a.nome} contratou o escritório.` });
                          fechar(false);
                        }}
                      >
                        <UserCheck strokeWidth={1.5} aria-hidden="true" /> Contratou
                      </Button>
                      <Button
                        variant="vidro"
                        onClick={() => {
                          registrarResultado(a.id, "nao_contratou");
                          toast.success("Resultado registrado", { description: `${a.nome} não contratou.` });
                          fechar(false);
                        }}
                      >
                        <UserX className="!text-muted-foreground" strokeWidth={1.5} aria-hidden="true" /> Não contratou
                      </Button>
                    </div>
                  </div>
                )}

                <Button variant="vidro" onClick={() => navigate(`/relatorio/${c.atendimentoId}`)}>
                  <FileText className="!text-muted-foreground" strokeWidth={1.5} aria-hidden="true" /> Relatório para a consulta
                </Button>

                {comAtalhoAtendimento && (
                  <Button variant="vidro" onClick={() => navigate(`/atendimentos?id=${encodeURIComponent(c.atendimentoId)}`)}>
                    <Inbox className="!text-muted-foreground" strokeWidth={1.5} aria-hidden="true" /> Abrir atendimento
                  </Button>
                )}

                {ativa && !passou && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Button variant="texto" onClick={() => setRemarcando(true)}>
                      <CalendarClock strokeWidth={1.5} aria-hidden="true" /> Remarcar
                    </Button>
                    {confirmandoCancelamento ? (
                      <Button
                        variant="vidro"
                        onClick={() => {
                          cancelarConsulta(c.id);
                          toast("Consulta cancelada", { description: `${a?.nome} voltou para "Aguardando a equipe".` });
                          fechar(false);
                        }}
                      >
                        Confirmar cancelamento
                      </Button>
                    ) : (
                      <Button variant="texto" onClick={() => setConfirmandoCancelamento(true)}>
                        <CalendarX strokeWidth={1.5} aria-hidden="true" /> Cancelar consulta
                      </Button>
                    )}
                  </div>
                )}

                {ativa && passou && c.status !== "realizada" && !aguardandoResultado && (
                  <Button variant="texto" onClick={() => marcarConsultaRealizada(c.id)}>
                    <Check strokeWidth={1.5} aria-hidden="true" /> Marcar como realizada
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {a && c && (
        <AgendarConsultaDialog
          atendimento={a}
          remarcar={c}
          aberto={remarcando}
          onOpenChange={(v) => {
            setRemarcando(v);
            if (!v) onOpenChange(false);
          }}
        />
      )}
    </>
  );
}
