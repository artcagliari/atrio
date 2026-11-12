import { useMemo, useState, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { horariosLivres, proximosDiasDisponiveis } from "@/lib/agenda";
import { devolverFoco } from "@/lib/foco";
import { useAppStore } from "@/lib/store";
import type { Atendimento, Consulta, DiaSemana } from "@/lib/types";
import { cn, DIAS_SEMANA, formatarDataCurta, formatarDataLonga, formatarHora, mesmoDia } from "@/lib/utils";

interface Props {
  atendimento: Atendimento;
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  /** Quando informado, remarca esta consulta em vez de criar outra */
  remarcar?: Consulta;
  /** Elemento que recebe o foco ao fechar (o diálogo é aberto de dentro de outros painéis) */
  retornarFocoPara?: RefObject<HTMLElement>;
}

const opcao = "vidro-interno rounded-xl text-apoio transition-[background-color,transform] duration-200 ease-out hover:-translate-y-0.5";
const opcaoInativa = "text-foreground [--vidro-a:0.04] hover:[--vidro-a:0.08]";
const opcaoAtiva = "!border-white/70 text-foreground [--vidro-a:0.1] [--brilho:0.8] [&_*]:!text-foreground";

export function AgendarConsultaDialog({ atendimento, aberto, onOpenChange, remarcar, retornarFocoPara }: Props) {
  const { horarios, consultas, agendarConsulta, remarcarConsulta } = useAppStore();
  const navigate = useNavigate();
  const dias = useMemo(() => proximosDiasDisponiveis(horarios, 10), [horarios]);
  const [dia, setDia] = useState<Date | null>(null);
  const [hora, setHora] = useState<Date | null>(null);

  const diaAtivo = dia ?? dias.find((d) => horariosLivres(d, horarios, consultas).length > 0) ?? dias[0];
  const livres = diaAtivo ? horariosLivres(diaAtivo, horarios, consultas) : [];

  function fechar(v: boolean) {
    if (!v) {
      setHora(null);
      setDia(null);
    }
    onOpenChange(v);
  }

  function confirmar() {
    if (!hora) return;
    if (remarcar) remarcarConsulta(remarcar.id, hora);
    else agendarConsulta(atendimento.id, hora, "equipe");
    toast.success(remarcar ? "Consulta remarcada" : "Consulta agendada", {
      description: `${atendimento.nome} · ${formatarDataLonga(hora)}, às ${formatarHora(hora)}. O relatório para a consulta está pronto.`,
      action: { label: "Ver relatório", onClick: () => navigate(`/relatorio/${atendimento.id}`) },
    });
    fechar(false);
  }

  return (
    <Dialog open={aberto} onOpenChange={fechar}>
      <DialogContent
        className="max-w-xl"
        onCloseAutoFocus={(e) => devolverFoco(e, retornarFocoPara)}
      >
        <DialogHeader>
          <DialogTitle>{remarcar ? "Remarcar consulta" : "Agendar consulta"}</DialogTitle>
          <DialogDescription>
            {atendimento.nome} · <span className="font-mono">{horarios.duracaoMinutos} min</span>
            {remarcar && ` · atual: ${formatarDataLonga(remarcar.inicio)}, ${formatarHora(remarcar.inicio)}`}
          </DialogDescription>
        </DialogHeader>

        <fieldset>
          <legend className="mb-3 text-apoio text-muted-foreground">Dia</legend>
          <div className="scrollbar-fina -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {dias.map((d) => {
              const ativo = !!diaAtivo && mesmoDia(d, diaAtivo);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => {
                    setDia(d);
                    setHora(null);
                  }}
                  className={cn(opcao, "flex min-w-[4.5rem] flex-col items-center gap-0.5 px-3 py-2.5", ativo ? opcaoAtiva : opcaoInativa)}
                >
                  <span className="text-micro text-muted-foreground">{DIAS_SEMANA[d.getDay() as DiaSemana].curto}</span>
                  <span className="font-mono">{formatarDataCurta(d)}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-apoio text-muted-foreground">Horário</legend>
          {livres.length === 0 ? (
            <p className="text-apoio text-muted-foreground">Sem horários livres neste dia.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {livres.map((h) => {
                const ativo = hora?.getTime() === h.getTime();
                return (
                  <button
                    key={h.toISOString()}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setHora(h)}
                    className={cn(opcao, "h-10 font-mono", ativo ? opcaoAtiva : opcaoInativa)}
                  >
                    {formatarHora(h)}
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>

        <DialogFooter>
          <Button variant="texto" onClick={() => fechar(false)}>
            Cancelar
          </Button>
          <Button variant="latao" onClick={confirmar} disabled={!hora}>
            {remarcar ? "Remarcar" : "Agendar consulta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
