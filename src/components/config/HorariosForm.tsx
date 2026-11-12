import { CircleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RadioCard, RadioGroup } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { ConfigHorarios, DiaSemana, FaixaHorario } from "@/lib/types";
import { cn, DIAS_SEMANA, minutosDe } from "@/lib/utils";

const ORDEM_DIAS: DiaSemana[] = [1, 2, 3, 4, 5, 6, 0];
const DURACOES = [30, 45, 60, 90];

interface Props {
  valor: ConfigHorarios;
  onChange: (v: ConfigHorarios) => void;
}

export function HorariosForm({ valor, onChange }: Props) {
  const setFaixa = (dia: DiaSemana, patch: Partial<FaixaHorario>) =>
    onChange({ ...valor, faixas: valor.faixas.map((f) => (f.dia === dia ? { ...f, ...patch } : f)) });

  return (
    <div className="flex flex-col gap-10">
      <fieldset>
        <legend className="mb-4 text-apoio text-muted-foreground">Dias e horários de consulta</legend>
        <ul className="flex flex-col gap-1">
          {ORDEM_DIAS.map((dia) => {
            const f = valor.faixas.find((x) => x.dia === dia)!;
            const invalido = f.ativo && minutosDe(f.fim) <= minutosDe(f.inicio);
            const nome = DIAS_SEMANA[dia].longo;
            return (
              <li key={dia} className="flex min-h-12 flex-wrap items-center gap-3 py-1">
                <label className="flex w-44 cursor-pointer items-center gap-3 text-apoio">
                  <Switch checked={f.ativo} onCheckedChange={(v) => setFaixa(dia, { ativo: v })} aria-label={`Atender na ${nome}`} />
                  <span className={cn(!f.ativo && "text-muted-foreground")}>{nome}</span>
                </label>
                {f.ativo ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={f.inicio}
                      onChange={(e) => setFaixa(dia, { inicio: e.target.value })}
                      aria-label={`Início — ${nome}`}
                      className="w-28 font-mono"
                    />
                    <span className="text-apoio text-muted-foreground">às</span>
                    <Input
                      type="time"
                      value={f.fim}
                      onChange={(e) => setFaixa(dia, { fim: e.target.value })}
                      aria-label={`Fim — ${nome}`}
                      aria-invalid={invalido}
                      className={cn("w-28 font-mono", invalido && "!border-white/60")}
                    />
                    {invalido && (
                      <span className="flex items-center gap-1.5 text-micro text-foreground" role="alert">
                        <CircleAlert className="size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                        O fim deve ser depois do início
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-apoio text-muted-foreground">Sem consultas</span>
                )}
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="flex max-w-xs flex-col gap-1.5">
        <label htmlFor="duracao" className="text-apoio text-muted-foreground">
          Duração de cada consulta
        </label>
        <Select value={String(valor.duracaoMinutos)} onValueChange={(v) => onChange({ ...valor, duracaoMinutos: Number(v) })}>
          <SelectTrigger id="duracao">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURACOES.map((d) => (
              <SelectItem key={d} value={String(d)}>
                {d} minutos
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <fieldset>
        <legend className="mb-4 text-apoio text-muted-foreground">Quando o contato escolhe um horário</legend>
        <RadioGroup
          value={valor.modo}
          onValueChange={(v) => onChange({ ...valor, modo: v as ConfigHorarios["modo"] })}
          className="sm:grid-cols-2"
        >
          <RadioCard value="pre_agendar" titulo="Pré-agendar para aprovação" descricao="A equipe revisa e confirma cada consulta antes de avisar o contato." />
          <RadioCard value="confirmar_direto" titulo="Confirmar direto" descricao="O assistente confirma o horário na hora, sem revisão." />
        </RadioGroup>
      </fieldset>
    </div>
  );
}
