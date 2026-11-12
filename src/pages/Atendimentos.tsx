import { ListFilter, Search, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/atendimentos/EmptyState";
import { LeadCard, LeadCardSkeleton } from "@/components/atendimentos/LeadCard";
import { LeadSheet } from "@/components/atendimentos/LeadSheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgora } from "@/hooks/useAgora";
import { useAppStore } from "@/lib/store";
import type { StatusAtendimento } from "@/lib/types";
import { aguardaRetorno, cn, mesmoDia, normalizar, urgentePendente } from "@/lib/utils";

const GRUPOS = {
  todos: { rotulo: "Todos", status: null },
  novos: { rotulo: "Novos", status: ["novo", "aguardando_analise"] },
  agendados: { rotulo: "Agendados", status: ["consulta_agendada"] },
  encerrados: { rotulo: "Encerrados", status: ["contratou", "nao_contratou", "fora_de_escopo"] },
} satisfies Record<string, { rotulo: string; status: StatusAtendimento[] | null }>;

type Grupo = keyof typeof GRUPOS;
const TODAS_AREAS = "todas";

function saudacao(hora: number) {
  if (hora >= 5 && hora < 12) return "Bom dia";
  if (hora >= 12 && hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Atendimentos() {
  const { atendimentos, consultas, areas, usuario, carregando } = useAppStore();
  const agora = useAgora();
  const [params, setParams] = useSearchParams();
  const [buscaAberta, setBuscaAberta] = useState(false);
  const campoBusca = useRef<HTMLInputElement>(null);

  const grupo: Grupo = (params.get("grupo") as Grupo) in GRUPOS ? (params.get("grupo") as Grupo) : "todos";
  const area = params.get("area") ?? TODAS_AREAS;
  const busca = params.get("q") ?? "";
  const selecionadoId = params.get("id");

  function setParam(chave: string, valor: string | null) {
    setParams(
      (atual) => {
        const p = new URLSearchParams(atual);
        if (!valor) p.delete(chave);
        else p.set(chave, valor);
        return p;
      },
      { replace: chave !== "id" },
    );
  }

  const hoje = new Date(agora);
  const chegaramHoje = atendimentos.filter((a) => mesmoDia(new Date(a.criadoEm), hoje)).length;
  const urgentes = atendimentos.filter(urgentePendente).length;
  const novos = atendimentos.filter((a) => (GRUPOS.novos.status as readonly string[]).includes(a.status)).length;
  const agendadosHoje = consultas.filter((c) => c.status !== "cancelada" && mesmoDia(new Date(c.inicio), hoje)).length;

  const frase =
    (chegaramHoje === 0 ? "Nenhum contato novo hoje até agora" : `Hoje ${chegaramHoje === 1 ? "chegou 1 contato" : `chegaram ${chegaramHoje} contatos`}`) +
    (urgentes === 0 ? " — nenhum urgente aguardando." : urgentes === 1 ? " — 1 urgente aguarda você." : ` — ${urgentes} urgentes aguardam você.`);

  const opcoesArea = useMemo(() => {
    const nomes = new Set(areas.filter((a) => a.ativa).map((a) => a.nome));
    atendimentos.forEach((a) => nomes.add(a.area));
    return [...nomes];
  }, [areas, atendimentos]);

  const lista = useMemo(() => {
    const termo = normalizar(busca.trim());
    const status: readonly StatusAtendimento[] | null = GRUPOS[grupo].status;
    return atendimentos
      .filter((a) => {
        if (status && !status.includes(a.status)) return false;
        if (area !== TODAS_AREAS && a.area !== area) return false;
        if (!termo) return true;
        return normalizar(`${a.nome} ${a.telefone} ${a.cidade} ${a.area} ${a.resumoIA} ${a.motivoUrgencia ?? ""}`).includes(termo);
      })
      .sort((x, y) => {
        const ux = Number(x.urgente && aguardaRetorno(x));
        const uy = Number(y.urgente && aguardaRetorno(y));
        if (ux !== uy) return uy - ux;
        return new Date(y.criadoEm).getTime() - new Date(x.criadoEm).getTime();
      });
  }, [atendimentos, grupo, area, busca]);

  const selecionado = atendimentos.find((a) => a.id === selecionadoId) ?? null;
  const temFiltro = busca !== "" || area !== TODAS_AREAS;
  const nome = usuario.tratamento ?? usuario.nome.split(" ")[0];

  return (
    <div className="flex flex-col gap-12">
      <header>
        <h1 className="font-serif text-[44px] leading-[1.02] tracking-[-0.02em] animate-in fade-in-0 slide-in-from-bottom-2 duration-500 sm:text-display-1">
          {saudacao(hoje.getHours())}, {nome}.
        </h1>
        <p className="mt-4 text-corpo text-muted-foreground" aria-live="polite">
          {carregando ? "Organizando os contatos…" : frase}
        </p>
      </header>

      <section aria-label="Resumo do dia" className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { rotulo: "Novos", valor: novos },
          { rotulo: "Urgentes", valor: urgentes, destaque: true },
          { rotulo: "Agendados hoje", valor: agendadosHoje },
        ].map((n) => (
          <GlassCard key={n.rotulo} nivel="leve" forma="painel" className="px-4 py-5 sm:px-7 sm:py-6">
            <p className="text-micro text-muted-foreground sm:text-apoio">{n.rotulo}</p>
            {carregando ? (
              <Skeleton className="mt-3 h-12 w-14" />
            ) : (
              <p className={cn("mt-2 font-serif text-[44px] leading-none tracking-[-0.02em] sm:text-display-1", n.destaque && "text-latao")}>{n.valor}</p>
            )}
          </GlassCard>
        ))}
      </section>

      <section aria-label="Lista de atendimentos" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={grupo} onValueChange={(v) => setParam("grupo", v === "todos" ? null : v)}>
            <TabsList aria-label="Filtrar por etapa">
              {(Object.keys(GRUPOS) as Grupo[]).map((g) => (
                <TabsTrigger key={g} value={g}>
                  {GRUPOS[g].rotulo}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="ml-auto flex items-center gap-2">
            {buscaAberta || busca ? (
              <div className="campo flex h-11 w-56 items-center gap-2 rounded-full pl-4 pr-1.5 animate-in fade-in-0 slide-in-from-right-2 duration-200 sm:w-64">
                <Search className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                <input
                  ref={campoBusca}
                  autoFocus
                  value={busca}
                  onChange={(e) => setParam("q", e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && (setParam("q", null), setBuscaAberta(false))}
                  placeholder="Buscar na lista"
                  aria-label="Buscar na lista"
                  className="min-w-0 flex-1 bg-transparent text-apoio outline-none placeholder:text-terciario focus-visible:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setParam("q", null);
                    setBuscaAberta(false);
                  }}
                  aria-label="Fechar busca"
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground"
                >
                  <X className="size-4" strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <Button variant="vidro" size="icon" aria-label="Buscar na lista" className="text-muted-foreground hover:text-foreground" onClick={() => setBuscaAberta(true)}>
                <Search strokeWidth={1.5} aria-hidden="true" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="vidro"
                  size={area === TODAS_AREAS ? "icon" : "default"}
                  aria-label={area === TODAS_AREAS ? "Filtrar por área" : `Filtrar por área: ${area}`}
                  className={cn(area === TODAS_AREAS && "text-muted-foreground hover:text-foreground")}
                >
                  <ListFilter className="!text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                  {area !== TODAS_AREAS && <span>{area}</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Área</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={area} onValueChange={(v) => setParam("area", v === TODAS_AREAS ? null : v)}>
                  <DropdownMenuRadioItem value={TODAS_AREAS}>Todas as áreas</DropdownMenuRadioItem>
                  {opcoesArea.map((n) => (
                    <DropdownMenuRadioItem key={n} value={n}>
                      {n}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {carregando ? (
          <div className="flex flex-col gap-2.5" aria-busy="true" aria-label="Carregando atendimentos">
            {Array.from({ length: 6 }, (_, i) => (
              <LeadCardSkeleton key={i} />
            ))}
          </div>
        ) : lista.length === 0 ? (
          temFiltro ? (
            <EmptyState
              titulo="Nada por aqui"
              descricao="Nenhum atendimento combina com a busca ou o filtro de área."
              acao={
                <Button
                  variant="vidro"
                  onClick={() =>
                    setParams((p) => {
                      const n = new URLSearchParams(p);
                      n.delete("q");
                      n.delete("area");
                      return n;
                    })
                  }
                >
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <EmptyState titulo="A entrada está calma" descricao="Quando alguém chamar no WhatsApp, o contato aparece aqui já organizado." />
          )
        ) : (
          <ul key={grupo + area} className="flex flex-col gap-2.5">
            {lista.map((a, i) => (
              <li key={a.id}>
                <LeadCard
                  atendimento={a}
                  agora={agora}
                  selecionado={a.id === selecionadoId}
                  onAbrir={(id) => setParam("id", id)}
                  style={{ animationDelay: `${Math.min(i, 20) * 30}ms` }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <LeadSheet atendimento={selecionado} onClose={() => setParam("id", null)} />
    </div>
  );
}
