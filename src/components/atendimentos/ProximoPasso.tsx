import { ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { consultaDe, proximoPasso } from "@/lib/funil";
import { useAppStore } from "@/lib/store";
import type { Atendimento } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AgendarConsultaDialog } from "./AgendarConsultaDialog";
import { ConsultaDialog } from "./ConsultaDialog";
import { Digitando } from "./Digitando";

/** Diz o que fazer agora com o cliente e oferece o botão certo para isso. */
export function ProximoPasso({ atendimento: a, compacto = false, className }: { atendimento: Atendimento; compacto?: boolean; className?: string }) {
  const { consultas, confirmarConsulta } = useAppStore();
  const navigate = useNavigate();
  const [agendando, setAgendando] = useState(false);
  const [resultado, setResultado] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  const passo = proximoPasso(a, consultas);
  const c = consultaDe(a, consultas);

  function executar() {
    switch (passo.acao) {
      case "agendar":
        setAgendando(true);
        break;
      case "confirmar":
        if (c) {
          confirmarConsulta(c.id);
          toast.success("Consulta confirmada", { description: a.nome });
        }
        break;
      case "relatorio":
        navigate(`/relatorio/${a.id}`);
        break;
      case "resultado":
        setResultado(true);
        break;
    }
  }

  // Versão compacta (cards do funil): só o botão — a etapa já está descrita no card.
  if (compacto && !passo.acao) return null;

  return (
    <div className={cn(compacto ? "flex flex-col gap-2" : "vidro-interno flex flex-col gap-3 rounded-2xl p-4 [--vidro-a:0.05] sm:flex-row sm:items-center", className)}>
      {!compacto && (
        <div className="min-w-0 flex-1">
          <p className="text-micro text-muted-foreground">Próximo passo</p>
          <p className="mt-0.5 text-apoio">
            {a.status === "em_triagem" && a.assistenteDigitando ? <Digitando rotulo="O assistente está escrevendo" /> : passo.texto}
          </p>
        </div>
      )}
      {passo.acao && (
        <Button ref={botao} variant={compacto ? "vidro" : "latao"} size="sm" onClick={executar} className={cn(compacto && "self-start")}>
          {passo.rotuloAcao}
          <ArrowRight strokeWidth={1.5} aria-hidden="true" className={cn(compacto && "!text-muted-foreground")} />
        </Button>
      )}
      <AgendarConsultaDialog atendimento={a} aberto={agendando} onOpenChange={setAgendando} retornarFocoPara={botao} />
      <ConsultaDialog consulta={resultado ? (c ?? null) : null} onOpenChange={setResultado} retornarFocoPara={botao} />
    </div>
  );
}
