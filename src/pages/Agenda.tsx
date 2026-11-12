import { Bot, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { ConsultaDialog } from "@/components/atendimentos/ConsultaDialog";
import { EmptyState } from "@/components/atendimentos/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgora } from "@/hooks/useAgora";
import { useAppStore } from "@/lib/store";
import type { Atendimento, Consulta, DiaSemana } from "@/lib/types";
import {
  adicionarDias,
  cn,
  DIAS_SEMANA,
  formatarDataCurta,
  formatarDataLonga,
  formatarHora,
  formatarMesAno,
  inicioDaSemana,
  mesmoDia,
  minutosDe,
  STATUS_CONSULTA_LABEL,
} from "@/lib/utils";

type Modo = "semana" | "dia";
const HORA_PX = 64;

export default function Agenda() {
  const { consultas, atendimentos, horarios } = useAppStore();
  const agora = useAgora();
  const [modo, setModo] = useState<Modo>("semana");
  const [referencia, setReferencia] = useState(() => new Date());
  const [aberta, setAberta] = useState<Consulta | null>(null);

  const abrir = (c: Consulta) => setAberta(c);
  const porId = useMemo(() => new Map(atendimentos.map((a) => [a.id, a])), [atendimentos]);
  const ativas = consultas.filter((c) => c.status !== "cancelada");

  const dias = modo === "semana" ? Array.from({ length: 7 }, (_, i) => adicionarDias(inicioDaSemana(referencia), i)) : [referencia];
  const mover = (dir: 1 | -1) => setReferencia((r) => adicionarDias(r, dir * (modo === "semana" ? 7 : 1)));

  // Faixa de horas exibida: do início mais cedo ao fim mais tarde do expediente (e das consultas do período).
  const { horaIni, horaFim } = useMemo(() => {
    let ini = 24 * 60;
    let fim = 0;
    horarios.faixas.filter((f) => f.ativo).forEach((f) => {
      ini = Math.min(ini, minutosDe(f.inicio));
      fim = Math.max(fim, minutosDe(f.fim));
    });
    ativas
      .filter((c) => dias.some((d) => mesmoDia(new Date(c.inicio), d)))
      .forEach((c) => {
        const i = new Date(c.inicio);
        const f = new Date(c.fim);
        ini = Math.min(ini, i.getHours() * 60 + i.getMinutes());
        fim = Math.max(fim, f.getHours() * 60 + f.getMinutes());
      });
    if (ini >= fim) return { horaIni: 8, horaFim: 18 };
    return { horaIni: Math.floor(ini / 60), horaFim: Math.ceil(fim / 60) };
  }, [horarios, ativas, dias]);

  const rotuloPeriodo =
    modo === "semana" ? `${formatarDataCurta(dias[0])} – ${formatarDataCurta(dias[6])}, ${formatarMesAno(dias[0])}` : formatarDataLonga(referencia);
  const doDia = (d: Date) => ativas.filter((c) => mesmoDia(new Date(c.inicio), d));
  const vazio = modo === "dia" && doDia(referencia).length === 0 && !horarios.faixas.find((f) => f.dia === referencia.getDay())?.ativo;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        titulo="Agenda"
        acoes={
          <Tabs value={modo} onValueChange={(v) => setModo(v as Modo)}>
            <TabsList aria-label="Visualização">
              <TabsTrigger value="dia">Dia</TabsTrigger>
              <TabsTrigger value="semana">Semana</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="flex items-center gap-2">
        <Button variant="vidro" size="icon" onClick={() => mover(-1)} aria-label={modo === "semana" ? "Semana anterior" : "Dia anterior"} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft strokeWidth={1.5} aria-hidden="true" />
        </Button>
        <Button variant="vidro" onClick={() => setReferencia(new Date())}>
          Hoje
        </Button>
        <Button variant="vidro" size="icon" onClick={() => mover(1)} aria-label={modo === "semana" ? "Próxima semana" : "Próximo dia"} className="text-muted-foreground hover:text-foreground">
          <ChevronRight strokeWidth={1.5} aria-hidden="true" />
        </Button>
        <p className="ml-3 text-corpo first-letter:uppercase" aria-live="polite">
          {rotuloPeriodo}
        </p>
        <p className="ml-auto hidden items-center gap-4 text-micro text-muted-foreground lg:flex">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-5 rounded border border-dashed border-white/60" aria-hidden="true" /> a confirmar
          </span>
          <span className="flex items-center gap-1.5">
            <Bot className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> marcada pelo assistente
          </span>
        </p>
      </div>

      <div key={modo + dias[0].toDateString()} className="animate-in fade-in-0 duration-300">
        {vazio ? (
          <EmptyState titulo="Sem expediente" descricao="Este dia não tem horário de consulta. Ajuste em Configurações › Horários." />
        ) : (
          <Grade dias={dias} horaIni={horaIni} horaFim={horaFim} agora={agora} consultasDoDia={doDia} porId={porId} onAbrir={abrir} />
        )}
      </div>

      <ConsultaDialog consulta={aberta} onOpenChange={(v) => !v && setAberta(null)} />
    </div>
  );
}

interface GradeProps {
  dias: Date[];
  horaIni: number;
  horaFim: number;
  agora: number;
  consultasDoDia: (d: Date) => Consulta[];
  porId: Map<string, Atendimento>;
  onAbrir: (c: Consulta) => void;
}

/** Grade de horários: colunas de vidro leve, consultas em vidro médio e linha de latão na hora atual. */
function Grade({ dias, horaIni, horaFim, agora, consultasDoDia, porId, onAbrir }: GradeProps) {
  const { horarios } = useAppStore();
  const horas = Array.from({ length: horaFim - horaIni }, (_, i) => horaIni + i);
  const altura = horas.length * HORA_PX;
  const hoje = new Date(agora);
  const minutoAgora = hoje.getHours() * 60 + hoje.getMinutes();
  const linhaAgora = minutoAgora >= horaIni * 60 && minutoAgora <= horaFim * 60 ? ((minutoAgora - horaIni * 60) / 60) * HORA_PX : null;
  const semana = dias.length > 1;

  return (
    <div className="scrollbar-fina -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      <div
        className={cn("grid gap-2", semana && "min-w-[860px]")}
        style={{ gridTemplateColumns: `52px repeat(${dias.length}, minmax(0, 1fr))` }}
      >
        {/* Cabeçalho */}
        <div />
        {dias.map((d) => {
          const ehHoje = mesmoDia(d, hoje);
          return (
            <div key={d.toISOString()} className="flex items-baseline justify-between px-3 pb-2">
              <span className={cn("text-apoio", ehHoje ? "text-foreground" : "text-muted-foreground")}>
                {semana ? DIAS_SEMANA[d.getDay() as DiaSemana].curto : DIAS_SEMANA[d.getDay() as DiaSemana].longo}
              </span>
              <span className={cn("font-mono text-micro", ehHoje ? "text-foreground" : "text-muted-foreground")}>{ehHoje ? "hoje" : formatarDataCurta(d)}</span>
            </div>
          );
        })}

        {/* Rótulos das horas */}
        <div className="relative" style={{ height: altura }} aria-hidden="true">
          {horas.map((h, i) => (
            <span key={h} className="absolute right-2 -translate-y-1/2 font-mono text-micro text-muted-foreground" style={{ top: i * HORA_PX }}>
              {String(h).padStart(2, "0")}:00
            </span>
          ))}
        </div>

        {/* Colunas */}
        {dias.map((d) => {
          const lista = consultasDoDia(d);
          const ehHoje = mesmoDia(d, hoje);
          const expediente = horarios.faixas.find((f) => f.dia === (d.getDay() as DiaSemana))?.ativo;
          return (
            <section
              key={d.toISOString()}
              aria-label={`${formatarDataLonga(d)}${lista.length ? `, ${lista.length} consulta(s)` : ", sem consultas"}`}
              className={cn("vidro-leve relative rounded-2xl", !expediente && "[--vidro-a:0.04]", ehHoje && "!border-white/30")}
              style={{ height: altura }}
            >
              {horas.slice(1).map((h, i) => (
                <div key={h} aria-hidden="true" className="absolute inset-x-0 h-px bg-white/[0.06]" style={{ top: (i + 1) * HORA_PX }} />
              ))}
              {!expediente && lista.length === 0 && <p className="absolute inset-x-0 top-4 text-center text-micro text-muted-foreground">Sem expediente</p>}

              {lista.map((c) => {
                const ini = new Date(c.inicio);
                const fim = new Date(c.fim);
                const top = ((ini.getHours() * 60 + ini.getMinutes() - horaIni * 60) / 60) * HORA_PX;
                const alt = Math.max(44, ((fim.getTime() - ini.getTime()) / 3_600_000) * HORA_PX - 6);
                const a = porId.get(c.atendimentoId);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onAbrir(c)}
                    aria-label={`${formatarHora(c.inicio)}, ${a?.nome ?? "contato"}, ${STATUS_CONSULTA_LABEL[c.status]}${c.agendadaPor === "assistente" ? ", marcada pelo assistente" : ""}. Ver consulta`}
                    className={cn(
                      "vidro vidro-clicavel absolute inset-x-1.5 z-[1] flex flex-col justify-start gap-0.5 overflow-hidden rounded-xl px-3 py-2 text-left [--vidro-a:0.03]",
                      c.status === "pre_agendada" && "!border-dashed !border-white/45",
                    )}
                    style={{ top: top + 3, height: alt }}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-apoio font-medium">{a?.nome ?? "Contato removido"}</span>
                      {c.agendadaPor === "assistente" && <Bot className="size-3.5 shrink-0 text-foreground/80" strokeWidth={1.5} aria-hidden="true" />}
                    </span>
                    <span className="truncate font-mono text-micro text-foreground/90">
                      {formatarHora(c.inicio)} · {STATUS_CONSULTA_LABEL[c.status].toLowerCase()}
                    </span>
                  </button>
                );
              })}

              {ehHoje && linhaAgora !== null && (
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 z-0 flex items-center" style={{ top: linhaAgora }}>
                  <span className="-ml-1 size-2 rounded-full bg-latao" />
                  <span className="h-px flex-1 bg-latao" />
                </div>
              )}
            </section>
          );
        })}
      </div>
      {linhaAgora !== null && dias.some((d) => mesmoDia(d, hoje)) && (
        <p className="sr-only">
          Agora são {formatarHora(hoje)}.
        </p>
      )}
    </div>
  );
}
