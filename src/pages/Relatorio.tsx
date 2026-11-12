import { ArrowLeft, Copy, Printer } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { EmptyState } from "@/components/atendimentos/EmptyState";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { consultaDe } from "@/lib/funil";
import { gerarRelatorio, relatorioEmTexto } from "@/lib/relatorio";
import { useAppStore } from "@/lib/store";
import { formatarDataHora, formatarDataLonga, formatarHora, STATUS_CONSULTA_LABEL } from "@/lib/utils";

/** Relatório do cliente para o advogado usar na consulta — pronto para imprimir ou salvar em PDF. */
export default function Relatorio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { atendimentos, consultas, areas, empresa, usuario, carregando } = useAppStore();
  const a = atendimentos.find((x) => x.id === id);
  const c = a ? consultaDe(a, consultas) : undefined;
  const r = useMemo(() => (a ? gerarRelatorio(a, c, areas) : null), [a, c, areas]);
  const voltar = () => navigate(a ? `/atendimentos?id=${encodeURIComponent(a.id)}` : "/atendimentos");

  if (carregando) {
    return (
      <div className="mx-auto max-w-[880px] px-4 py-12">
        <Skeleton className="h-[70vh] w-full rounded-3xl" />
      </div>
    );
  }

  if (!a || !r) {
    return (
      <div className="mx-auto max-w-[880px] px-4 py-12">
        <EmptyState titulo="Relatório não encontrado" descricao="Este atendimento não existe ou foi removido." acao={<Button variant="vidro" onClick={() => navigate("/atendimentos")}>Ir para atendimentos</Button>} />
      </div>
    );
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(relatorioEmTexto(a!, c, r!));
      toast.success("Relatório copiado", { description: "Cole no e-mail ou no sistema do escritório." });
    } catch {
      toast.error("Não foi possível copiar", { description: "Use Imprimir › Salvar como PDF." });
    }
  }

  return (
    <div className="mx-auto max-w-[880px] px-4 py-8 sm:py-12">
      <div className="nao-imprimir mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="vidro" onClick={voltar}>
          <ArrowLeft className="!text-muted-foreground" strokeWidth={1.5} aria-hidden="true" /> Voltar ao atendimento
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="vidro" onClick={copiar}>
            <Copy className="!text-muted-foreground" strokeWidth={1.5} aria-hidden="true" /> Copiar texto
          </Button>
          <Button variant="latao" onClick={() => window.print()}>
            <Printer strokeWidth={1.5} aria-hidden="true" /> Imprimir ou salvar PDF
          </Button>
        </div>
      </div>

      <article className="relatorio vidro-leitura rounded-3xl px-6 py-9 sm:px-12 sm:py-12" aria-labelledby="titulo-relatorio">
        <header className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <Logo variant="full" tamanho={26} />
            <p className="text-right text-micro text-muted-foreground">
              {empresa.nome}
              <br />
              Gerado em {formatarDataHora(new Date())}
            </p>
          </div>
          <div>
            <p className="text-micro font-medium uppercase tracking-[0.12em] text-muted-foreground">Relatório de triagem · consulta inicial</p>
            <h1 id="titulo-relatorio" className="mt-2 font-serif text-display-1">
              {a.nome}
            </h1>
            <p className="mt-2 text-corpo text-muted-foreground">
              {c ? (
                <>
                  Consulta de <span className="first-letter:uppercase">{formatarDataLonga(c.inicio)}</span>, às {formatarHora(c.inicio)} · {STATUS_CONSULTA_LABEL[c.status].toLowerCase()}
                </>
              ) : (
                "Consulta ainda não marcada"
              )}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 border-y border-white/[0.1] py-5 sm:grid-cols-3">
            <Dado rotulo="Área">{a.area}</Dado>
            <Dado rotulo="Telefone (WhatsApp)">
              <span className="font-mono">{a.telefone}</span>
            </Dado>
            <Dado rotulo="Cidade">{a.cidade}</Dado>
            <Dado rotulo="Primeiro contato">{formatarDataHora(a.criadoEm)}</Dado>
            <Dado rotulo="Consulta marcada por">{c ? (c.agendadaPor === "assistente" ? "Assistente, no WhatsApp" : "Equipe") : "—"}</Dado>
            <Dado rotulo="Responsável">{usuario.tratamento ?? usuario.nome}</Dado>
          </dl>

          {a.urgente && (
            <p className="vidro-interno flex items-start gap-3 rounded-2xl p-4 text-corpo [--vidro-a:0.05]">
              <span className="mt-[7px] size-2 shrink-0 rounded-full bg-urgente" aria-hidden="true" />
              <span>
                <strong className="font-semibold">Caso urgente.</strong> {a.motivoUrgencia}. Verifique prazos antes ou logo no início da consulta.
              </span>
            </p>
          )}
        </header>

        <div className="mt-10 flex flex-col gap-10">
          <Secao numero={1} titulo="Resumo do caso">
            <p className="text-corpo leading-[1.75]">{a.resumoIA}</p>
          </Secao>

          <Secao numero={2} titulo="Respostas da triagem">
            {a.respostas.length === 0 ? (
              <p className="text-apoio text-muted-foreground">Sem respostas registradas.</p>
            ) : (
              <dl className="flex flex-col gap-4">
                {a.respostas.map((x) => (
                  <div key={x.pergunta} className="grid gap-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-6">
                    <dt className="text-apoio text-muted-foreground">{x.pergunta}</dt>
                    <dd className="text-corpo">{x.resposta}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Secao>

          <Secao numero={3} titulo="Pontos a esclarecer na consulta">
            <ol className="flex list-decimal flex-col gap-2 pl-5 text-corpo marker:text-muted-foreground">
              {r.pontosAEsclarecer.map((p) => (
                <li key={p} className="pl-1">
                  {p}
                </li>
              ))}
            </ol>
          </Secao>

          <Secao numero={4} titulo="Documentos">
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <h4 className="mb-3 text-apoio font-medium">Recebidos pelo WhatsApp</h4>
                {a.documentos.length === 0 ? (
                  <p className="text-apoio text-muted-foreground">Nenhum documento enviado.</p>
                ) : (
                  <ul className="flex flex-col gap-1.5 text-apoio">
                    {a.documentos.map((d) => (
                      <li key={d.id} className="flex items-center gap-2">
                        <span className="size-1 rounded-full bg-foreground/60" aria-hidden="true" />
                        {d.nome}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="mb-3 text-apoio font-medium">Pedir ao cliente</h4>
                <ul className="flex flex-col gap-1.5 text-apoio">
                  {r.documentosASolicitar.map((d) => (
                    <li key={d} className="flex items-start gap-2">
                      <span className="mt-[3px] inline-block size-3.5 shrink-0 rounded-[4px] border border-foreground/50" aria-hidden="true" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Secao>

          <Secao numero={5} titulo="Linha do tempo">
            <ol className="flex flex-col gap-3 border-l border-white/[0.15] pl-5">
              {r.linhaDoTempo.map((i) => (
                <li key={i.texto} className="relative text-apoio">
                  <span className="absolute -left-[23.5px] top-[7px] size-2 rounded-full bg-foreground/70" aria-hidden="true" />
                  <span className="text-muted-foreground">{formatarDataHora(i.quando)}</span> — {i.texto}
                </li>
              ))}
            </ol>
          </Secao>

          {r.falasDoCliente.length > 0 && (
            <Secao numero={6} titulo="Nas palavras do cliente">
              <ul className="flex flex-col gap-3">
                {r.falasDoCliente.map((m) => (
                  <li key={m.id} className="border-l-2 border-white/20 pl-4 text-corpo italic">
                    “{m.texto}”
                  </li>
                ))}
              </ul>
            </Secao>
          )}
        </div>

        <footer className="mt-12 border-t border-white/[0.1] pt-5 text-micro leading-relaxed text-muted-foreground">
          Documento interno do escritório. As informações foram declaradas pelo cliente ao assistente virtual e ainda não foram verificadas. O assistente não emite
          opinião jurídica, não avalia chance de êxito e não informa valores.
        </footer>
      </article>
    </div>
  );
}

function Secao({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`secao-${numero}`}>
      <h2 id={`secao-${numero}`} className="mb-4 flex items-baseline gap-3 font-serif text-display-3">
        <span className="text-apoio font-sans font-medium text-muted-foreground tabular">{String(numero).padStart(2, "0")}</span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Dado({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-micro text-muted-foreground">{rotulo}</dt>
      <dd className="mt-1 text-apoio">{children}</dd>
    </div>
  );
}
