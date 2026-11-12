import { ChevronDown, Search, X } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgora } from "@/hooks/useAgora";
import { useAppStore } from "@/lib/store";
import type { Atendimento, StatusAtendimento } from "@/lib/types";
import { cn, mesmoDia, normalizar, urgentePendente } from "@/lib/utils";

const GRUPOS = {
  todos: { rotulo: "Todos", filtro: () => true },
  triagem: { rotulo: "Em triagem", filtro: (a: Atendimento) => a.status === "em_triagem" },
  aguardando: { rotulo: "Aguardando a equipe", filtro: (a: Atendimento) => (["novo", "aguardando_analise"] as StatusAtendimento[]).includes(a.status) },
  agendados: { rotulo: "Com consulta", filtro: (a: Atendimento) => a.status === "consulta_agendada" },
  encerrados: { rotulo: "Encerrados", filtro: (a: Atendimento) => (["contratou", "nao_contratou", "fora_de_escopo"] as StatusAtendimento[]).includes(a.status) },
  urgentes: { rotulo: "Urgentes", filtro: urgentePendente },
} satisfies Record<string, { rotulo: string; filtro: (a: Atendimento) => boolean }>;

type Grupo = keyof typeof GRUPOS;
const ABAS: Grupo[] = ["todos", "triagem", "aguardando", "agendados", "encerrados"];
const TODAS_AREAS = "todas";

function saudacao(hora: number) {
  if (hora >= 5 && hora < 12) return "Bom dia";
  if (hora >= 12 && hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Atendimentos() {
  const { atendimentos, consultas, areas, usuario, carregando } = useAppStore();
  const agora = useAgora(30_000);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

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
  const marcadasPeloAssistente = consultas.filter((c) => c.agendadaPor === "assistente" && c.status !== "cancelada").length;
  const urgentes = atendimentos.filter(urgentePendente).length;
  const consultasHoje = consultas.filter((c) => c.status !== "cancelada" && mesmoDia(new Date(c.inicio), hoje)).length;

  const frase = [
    chegaramHoje === 0 ? "Nenhum contato novo hoje até agora" : `Hoje ${chegaramHoje === 1 ? "chegou 1 contato" : `chegaram ${chegaramHoje} contatos`} pelo WhatsApp`,
    marcadasPeloAssistente > 0 && `o assistente já marcou ${marcadasPeloAssistente} ${marcadasPeloAssistente === 1 ? "consulta" : "consultas"}`,
  ]
    .filter(Boolean)
    .join(" e ");

  const numeros: { rotulo: string; valor: number; destaque?: boolean; acao: () => void; dica: string }[] = [
    { rotulo: "Em triagem agora", valor: atendimentos.filter(GRUPOS.triagem.filtro).length, acao: () => setParam("grupo", "triagem"), dica: "Ver quem está conversando com o assistente" },
    { rotulo: "Aguardando a equipe", valor: atendimentos.filter(GRUPOS.aguardando.filtro).length, acao: () => setParam("grupo", "aguardando"), dica: "Ver quem precisa de consulta marcada" },
    { rotulo: "Urgentes", valor: urgentes, destaque: true, acao: () => setParam("grupo", "urgentes"), dica: "Ver urgentes sem contato da equipe" },
    { rotulo: "Consultas hoje", valor: consultasHoje, acao: () => navigate("/agenda"), dica: "Abrir a agenda" },
  ];

  const opcoesArea = useMemo(() => {
    const nomes = new Set(areas.filter((a) => a.ativa).map((a) => a.nome));
    atendimentos.forEach((a) => nomes.add(a.area));
    return [...nomes];
  }, [areas, atendimentos]);

  const lista = useMemo(() => {
    const termo = normalizar(busca.trim());
    return atendimentos
      .filter((a) => {
        if (!GRUPOS[grupo].filtro(a)) return false;
        if (area !== TODAS_AREAS && a.area !== area) return false;
        if (!termo) return true;
        return normalizar(`${a.nome} ${a.telefone} ${a.cidade} ${a.area} ${a.resumoIA} ${a.motivoUrgencia ?? ""}`).includes(termo);
      })
      .sort((x, y) => {
        // Urgentes pendentes no topo; depois quem está em triagem ao vivo; depois os mais recentes.
        const peso = (a: Atendimento) => (urgentePendente(a) ? 2 : a.status === "em_triagem" ? 1 : 0);
        if (peso(x) !== peso(y)) return peso(y) - peso(x);
        return new Date(y.criadoEm).getTime() - new Date(x.criadoEm).getTime();
      });
  }, [atendimentos, grupo, area, busca]);

  const selecionado = atendimentos.find((a) => a.id === selecionadoId) ?? null;
  const temFiltro = busca !== "" || area !== TODAS_AREAS || grupo === "urgentes";
  const nome = usuario.tratamento ?? usuario.nome.split(" ")[0];

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="font-serif text-[30px] leading-tight animate-in fade-in-0 slide-in-from-bottom-2 duration-500 sm:text-display-1">
          {saudacao(hoje.getHours())}, {nome}
        </h1>
        <p className="mt-2 text-corpo text-muted-foreground" aria-live="polite">
          {carregando ? "Organizando os contatos…" : `${frase}.`}
        </p>
      </header>

      <section aria-label="Resumo do dia" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {numeros.map((n) => (
          <button
            key={n.rotulo}
            type="button"
            onClick={n.acao}
            title={n.dica}
            aria-label={`${n.rotulo}: ${n.valor}. ${n.dica}`}
            className="vidro-leve vidro-clicavel flex flex-col items-start rounded-3xl px-5 py-4 text-left sm:px-6 sm:py-5"
          >
            <span className="text-apoio text-muted-foreground">{n.rotulo}</span>
            {carregando ? (
              <Skeleton className="mt-3 h-8 w-12" />
            ) : (
              <span className={cn("mt-1.5 font-serif text-[32px] leading-none", n.destaque && n.valor > 0 && "text-latao")}>{n.valor}</span>
            )}
          </button>
        ))}
      </section>

      <section aria-label="Lista de atendimentos" className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <Tabs value={ABAS.includes(grupo) ? grupo : ""} onValueChange={(v) => setParam("grupo", v === "todos" ? null : v)}>
            <div className="scrollbar-fina -mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
              <TabsList aria-label="Filtrar por etapa">
                {ABAS.map((g) => (
                  <TabsTrigger key={g} value={g}>
                    {GRUPOS[g].rotulo}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>

          <div className="flex flex-1 items-center gap-2 xl:justify-end">
            <label className="campo flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full pl-4 pr-1.5 xl:max-w-xs">
              <Search className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">Buscar na lista</span>
              <input
                value={busca}
                onChange={(e) => setParam("q", e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setParam("q", null)}
                placeholder="Nome, telefone ou assunto"
                className="min-w-0 flex-1 bg-transparent text-apoio outline-none placeholder:text-terciario focus-visible:outline-none"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setParam("q", null)}
                  aria-label="Limpar busca"
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground"
                >
                  <X className="size-4" strokeWidth={1.5} aria-hidden="true" />
                </button>
              )}
            </label>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="vidro" aria-label={`Filtrar por área: ${area === TODAS_AREAS ? "todas" : area}`}>
                  {area === TODAS_AREAS ? "Todas as áreas" : area}
                  <ChevronDown className="!size-4 !text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
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

        {grupo === "urgentes" && (
          <p className="-mt-1 flex items-center gap-2 text-apoio text-muted-foreground">
            <span className="size-2 rounded-full bg-urgente" aria-hidden="true" />
            Mostrando só os urgentes que ainda não falaram com a equipe.
            <button type="button" onClick={() => setParam("grupo", null)} className="rounded text-foreground underline decoration-white/30 underline-offset-4 hover:decoration-white">
              Ver todos
            </button>
          </p>
        )}

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
              descricao="Nenhum atendimento combina com a busca ou com os filtros."
              acao={
                <Button
                  variant="vidro"
                  onClick={() =>
                    setParams((p) => {
                      const n = new URLSearchParams(p);
                      n.delete("q");
                      n.delete("area");
                      n.delete("grupo");
                      return n;
                    })
                  }
                >
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <EmptyState titulo="Nenhum cliente nesta etapa" descricao="Quando alguém chamar no WhatsApp, o assistente faz a triagem e o contato aparece aqui já organizado." />
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
