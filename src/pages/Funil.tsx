import { MessageCircle } from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { EtapaTexto } from "@/components/atendimentos/EtapaTexto";
import { LeadSheet } from "@/components/atendimentos/LeadSheet";
import { ProximoPasso } from "@/components/atendimentos/ProximoPasso";
import { PageHeader } from "@/components/layout/PageHeader";
import { MOSTRAR_FERRAMENTAS_DEV } from "@/components/layout/UserMenu";
import { ArcoInicial } from "@/components/ui/arco";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgora } from "@/hooks/useAgora";
import { useTriagemAoVivo } from "@/hooks/useTriagemAoVivo";
import { COLUNAS_FUNIL, conversao, etapaDe, type EtapaFunil } from "@/lib/funil";
import { useAppStore } from "@/lib/store";
import type { Atendimento } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Funil de triagem: do primeiro contato no WhatsApp à consulta com relatório e à contratação. */
export default function Funil() {
  const { atendimentos, consultas, carregando } = useAppStore();
  const { simularCliente, triagensAtivas } = useTriagemAoVivo();
  const agora = useAgora(15_000);
  const [params, setParams] = useSearchParams();
  const selecionado = atendimentos.find((a) => a.id === params.get("id")) ?? null;
  const abrir = (id: string | null) =>
    setParams((p) => {
      const n = new URLSearchParams(p);
      if (id) n.set("id", id);
      else n.delete("id");
      return n;
    });

  const etapas = useMemo(() => conversao(atendimentos, consultas, agora), [atendimentos, consultas, agora]);
  const porEtapa = useMemo(() => {
    const m = new Map<EtapaFunil, Atendimento[]>();
    for (const a of atendimentos) {
      const e = etapaDe(a, consultas, agora);
      m.set(e, [...(m.get(e) ?? []), a]);
    }
    // Urgentes primeiro, depois os mais recentes
    m.forEach((l) => l.sort((x, y) => Number(y.urgente) - Number(x.urgente) || new Date(y.criadoEm).getTime() - new Date(x.criadoEm).getTime()));
    return m;
  }, [atendimentos, consultas, agora]);

  const total = etapas[0].total || 1;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <PageHeader titulo="Funil de triagem" descricao="Do primeiro “oi” no WhatsApp à consulta com o relatório pronto para o advogado." />
        {MOSTRAR_FERRAMENTAS_DEV && (
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="vidro" onClick={simularCliente}>
              <MessageCircle className="!text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              Simular cliente no WhatsApp
            </Button>
            <p className="text-apoio text-muted-foreground" aria-live="polite">
              {triagensAtivas > 0
                ? `${triagensAtivas} ${triagensAtivas === 1 ? "triagem acontecendo" : "triagens acontecendo"} agora — acompanhe na coluna “Em triagem”.`
                : "Demonstração: um cliente fictício chama no WhatsApp e o assistente faz a triagem e agenda."}
            </p>
          </div>
        )}
      </div>

      {/* Conversão etapa a etapa */}
      <section aria-labelledby="titulo-conversao">
        <h2 id="titulo-conversao" className="sr-only">
          Conversão do funil
        </h2>
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {etapas.map((e, i) => {
            const anterior = i > 0 ? etapas[i - 1].total : 0;
            const pct = i > 0 && anterior > 0 ? Math.round((e.total / anterior) * 100) : null;
            return (
              <li key={e.id}>
                <GlassCard nivel="leve" forma="painel" className="flex h-full flex-col gap-3 p-5">
                  <p className="text-apoio text-muted-foreground">{e.titulo}</p>
                  {carregando ? (
                    <Skeleton className="h-9 w-12" />
                  ) : (
                    <p className={cn("font-serif text-[32px] leading-none", e.id === "contrataram" && "text-latao")}>{e.total}</p>
                  )}
                  <div className="mt-auto flex flex-col gap-2">
                    <div className="h-1 overflow-hidden rounded-full bg-white/[0.1]" aria-hidden="true">
                      <div className="h-full rounded-full bg-foreground/70 transition-[width] duration-700 ease-suave" style={{ width: `${(e.total / total) * 100}%` }} />
                    </div>
                    <p className="text-micro text-muted-foreground">{pct === null ? "Total do período" : `${pct}% da etapa anterior`}</p>
                  </div>
                </GlassCard>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Quadro por etapa */}
      <section aria-labelledby="titulo-quadro" className="flex flex-col gap-4">
        <h2 id="titulo-quadro" className="font-serif text-display-3">
          Onde cada cliente está
        </h2>
        <div className="scrollbar-fina -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <div className="grid min-w-[1100px] grid-cols-5 gap-3">
            {COLUNAS_FUNIL.map((col) => {
              const lista = porEtapa.get(col.id) ?? [];
              return (
                <section key={col.id} aria-labelledby={`col-${col.id}`} className="vidro-leve flex min-h-[320px] flex-col gap-3 rounded-3xl p-3">
                  <header className="px-2 pb-1 pt-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 id={`col-${col.id}`} className="text-apoio font-medium">
                        {col.titulo}
                      </h3>
                      <span className="text-apoio text-muted-foreground tabular">{lista.length}</span>
                    </div>
                    <p className="mt-0.5 text-micro text-foreground/85">{col.descricao}</p>
                  </header>
                  {carregando ? (
                    <Skeleton className="h-24 w-full rounded-2xl" />
                  ) : lista.length === 0 ? (
                    <p className="px-2 py-6 text-center text-micro text-muted-foreground">Nenhum cliente nesta etapa.</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {lista.map((a, i) => (
                        <li key={a.id} className="animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both duration-300" style={{ animationDelay: `${i * 30}ms` }}>
                          <CartaoFunil a={a} onAbrir={() => abrir(a.id)} />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </div>

        <SaidasDoFunil naoContratou={porEtapa.get("nao_contratou") ?? []} fora={porEtapa.get("fora") ?? []} onAbrir={abrir} />
      </section>

      <LeadSheet atendimento={selecionado} onClose={() => abrir(null)} />
    </div>
  );
}

function CartaoFunil({ a, onAbrir }: { a: Atendimento; onAbrir: () => void }) {
  return (
    <div className="vidro-interno flex flex-col gap-3 rounded-2xl p-3 [--vidro-a:0.03]">
      <button type="button" onClick={onAbrir} className="flex items-start gap-3 rounded-xl text-left" aria-label={`Abrir ${a.nome}`}>
        <ArcoInicial nome={a.nome} tamanho="sm" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-apoio font-medium">{a.nome}</span>
            {a.urgente && <span className="size-2 shrink-0 rounded-full bg-urgente motion-safe:animate-pulso" aria-label="urgente" />}
          </span>
          <span className="block truncate text-micro text-foreground/85">{a.area}</span>
          <span className="block text-micro text-foreground/85">
            <EtapaTexto atendimento={a} />
          </span>
        </span>
      </button>
      <ProximoPasso atendimento={a} compacto />
    </div>
  );
}

function SaidasDoFunil({ naoContratou, fora, onAbrir }: { naoContratou: Atendimento[]; fora: Atendimento[]; onAbrir: (id: string) => void }) {
  if (naoContratou.length + fora.length === 0) return null;
  const grupo = (titulo: string, lista: Atendimento[]) =>
    lista.length > 0 && (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-apoio text-muted-foreground">
          {titulo} <span className="tabular">({lista.length})</span>:
        </span>
        {lista.map((a) => (
          <button key={a.id} type="button" onClick={() => onAbrir(a.id)} className="vidro-interno rounded-full px-3 py-1.5 text-micro transition-colors [--vidro-a:0.05] hover:[--vidro-a:0.1]">
            {a.nome}
          </button>
        ))}
      </div>
    );
  return (
    <GlassCard nivel="leve" forma="painel" className="flex flex-col gap-3 px-5 py-4">
      <p className="text-apoio font-medium">Saíram do funil</p>
      {grupo("Não contrataram", naoContratou)}
      {grupo("Fora das áreas atendidas", fora)}
    </GlassCard>
  );
}
