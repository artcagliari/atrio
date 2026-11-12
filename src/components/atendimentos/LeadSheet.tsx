import { CalendarClock, CalendarPlus, ChevronDown, ExternalLink, FileText, PhoneCall, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgora } from "@/hooks/useAgora";
import { consultaDe } from "@/lib/funil";
import { useAppStore } from "@/lib/store";
import type { Atendimento, StatusAtendimento } from "@/lib/types";
import { aguardaRetorno, formatarDataHora, formatarDataLonga, formatarHora, STATUS_CONSULTA_LABEL, STATUS_LABEL, STATUS_ORDEM, tempoRelativo } from "@/lib/utils";
import { AgendarConsultaDialog } from "./AgendarConsultaDialog";
import { ChatView } from "./ChatView";
import { ConsultaDialog } from "./ConsultaDialog";
import { DocumentThumbs } from "./DocumentThumbs";
import { ProximoPasso } from "./ProximoPasso";
import { WaitingTime } from "./WaitingTime";

interface LeadSheetProps {
  atendimento: Atendimento | null;
  onClose: () => void;
}

/** Painel de detalhe: próximo passo em destaque, abas Resumo · Conversa · Documentos, ações no rodapé. */
export function LeadSheet({ atendimento, onClose }: LeadSheetProps) {
  return (
    <Sheet open={!!atendimento} onOpenChange={(v) => !v && onClose()}>
      <SheetContent>{atendimento && <Conteudo key={atendimento.id} a={atendimento} />}</SheetContent>
    </Sheet>
  );
}

const rolagem = "scrollbar-fina min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-9 [mask-image:linear-gradient(to_bottom,black_calc(100%-32px),transparent)]";

function Conteudo({ a }: { a: Atendimento }) {
  const { assistente, usuario, consultas, marcarContatado, mudarStatus } = useAppStore();
  const navigate = useNavigate();
  const agora = useAgora();
  const [aba, setAba] = useState(a.status === "em_triagem" ? "conversa" : "resumo");
  const [agendando, setAgendando] = useState(false);
  const [vendoConsulta, setVendoConsulta] = useState(false);
  const botaoAgendar = useRef<HTMLButtonElement>(null);
  const fimDaConversa = useRef<HTMLDivElement>(null);
  const telefoneLimpo = a.telefone.replace(/\D/g, "");
  const tempo = tempoRelativo(a.criadoEm, agora);
  const c = consultaDe(a, consultas);
  const consultaAtiva = c && c.status !== "realizada";

  // Na triagem ao vivo, acompanha a última mensagem.
  useEffect(() => {
    if (aba === "conversa") fimDaConversa.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [a.mensagens.length, a.assistenteDigitando, aba]);

  return (
    <>
      <header className="flex flex-col gap-5 px-6 pb-5 pt-7 sm:px-9 sm:pt-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <SheetTitle className="font-serif text-[24px] leading-tight sm:text-display-2">{a.nome}</SheetTitle>
            <SheetDescription className="mt-1.5 flex flex-wrap items-center gap-x-2 text-apoio text-muted-foreground">
              <span>{a.area}</span>
              <span aria-hidden="true">·</span>
              <span>{STATUS_LABEL[a.status]}</span>
              <span aria-hidden="true">·</span>
              <span>chegou {tempo === "agora" ? "agora" : `há ${tempo}`}</span>
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button variant="vidro" size="icon" aria-label="Fechar painel" className="shrink-0 text-muted-foreground hover:text-foreground">
              <X strokeWidth={1.5} aria-hidden="true" />
            </Button>
          </SheetClose>
        </div>

        {a.urgente && (
          <p className="flex items-start gap-2.5 text-apoio">
            <span className="mt-[5px] size-2 shrink-0 rounded-full bg-urgente motion-safe:animate-pulso" aria-hidden="true" />
            <span>
              <span className="font-medium">Urgente:</span> {a.motivoUrgencia ?? "marcado como urgente"}
            </span>
          </p>
        )}

        <ProximoPasso atendimento={a} />
      </header>

      <Tabs value={aba} onValueChange={setAba} className="flex min-h-0 flex-1 flex-col">
        <div className="px-6 sm:px-9">
          <TabsList aria-label="Detalhes do atendimento">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="conversa">
              Conversa
              {a.status === "em_triagem" && <span className="size-1.5 rounded-full bg-foreground motion-safe:animate-pulse" aria-label="ao vivo" />}
            </TabsTrigger>
            <TabsTrigger value="documentos">
              Documentos{a.documentos.length > 0 && <span className="text-micro text-muted-foreground">{a.documentos.length}</span>}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="resumo" className={rolagem}>
          <div className="flex flex-col gap-9">
            {c && (
              <section aria-label="Consulta" className="vidro-interno flex flex-col gap-3 rounded-2xl p-4 [--vidro-a:0.05] sm:flex-row sm:items-center">
                <CalendarClock className="hidden size-[18px] shrink-0 text-muted-foreground sm:block" strokeWidth={1.5} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-apoio">
                    <span className="first-letter:uppercase">{formatarDataLonga(c.inicio)}</span>, <span className="font-mono">{formatarHora(c.inicio)}</span>
                  </p>
                  <p className="text-micro text-muted-foreground">
                    {STATUS_CONSULTA_LABEL[c.status]} · marcada {c.agendadaPor === "assistente" ? "pelo assistente no WhatsApp" : "pela equipe"}
                  </p>
                </div>
                <Button variant="vidro" size="sm" onClick={() => setVendoConsulta(true)}>
                  Ver consulta
                </Button>
              </section>
            )}

            <section aria-labelledby="titulo-resumo" className="border-l-2 border-latao/80 pl-5">
              <h3 id="titulo-resumo" className="mb-2.5 text-micro font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Resumo da triagem
              </h3>
              <p className="text-corpo leading-[1.7]">{a.resumoIA}</p>
            </section>

            {a.respostas.length > 0 && (
              <section aria-labelledby="titulo-respostas">
                <h3 id="titulo-respostas" className="mb-4 text-micro font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Respostas do roteiro
                </h3>
                <dl className="flex flex-col gap-4">
                  {a.respostas.map((r) => (
                    <div key={r.pergunta} className="flex flex-col gap-1">
                      <dt className="text-apoio text-muted-foreground">{r.pergunta}</dt>
                      <dd className="text-corpo">{r.resposta}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Campo rotulo="Telefone">
                <span className="font-mono">{a.telefone}</span>
              </Campo>
              <Campo rotulo="Cidade">{a.cidade}</Campo>
              <Campo rotulo="Chegou em">
                <span className="text-apoio">{formatarDataHora(a.criadoEm)}</span>
              </Campo>
              <Campo rotulo="Retorno da equipe">
                {aguardaRetorno(a) || a.ultimoContatoHumano ? <WaitingTime atendimento={a} agora={agora} className="text-corpo text-foreground" /> : "—"}
              </Campo>
            </dl>
          </div>
        </TabsContent>

        <TabsContent value="conversa" className={rolagem}>
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-micro text-muted-foreground">
              {a.status === "em_triagem" ? "Conversa ao vivo — o assistente está fazendo a triagem." : "Histórico do WhatsApp (somente leitura)."}
            </p>
            <Button asChild variant="vidro" size="sm">
              <a href={`https://wa.me/55${telefoneLimpo}`} target="_blank" rel="noreferrer">
                Responder no WhatsApp
                <ExternalLink className="!size-4 !text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              </a>
            </Button>
          </div>
          <ChatView mensagens={a.mensagens} nomeCliente={a.nome} nomeAssistente={assistente.nome} nomeEquipe={usuario.nome} assistenteDigitando={a.assistenteDigitando} />
          <div ref={fimDaConversa} />
        </TabsContent>

        <TabsContent value="documentos" className={rolagem}>
          <DocumentThumbs documentos={a.documentos} />
        </TabsContent>
      </Tabs>

      {/* Ações no rodapé */}
      <footer className="flex flex-wrap items-center gap-2 border-t border-white/[0.08] px-6 py-5 sm:px-9">
        {consultaAtiva ? (
          <Button variant="vidro" onClick={() => navigate(`/relatorio/${a.id}`)}>
            <FileText className="!text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
            Relatório para a consulta
          </Button>
        ) : (
          a.status !== "em_triagem" &&
          a.status !== "fora_de_escopo" && (
            <Button ref={botaoAgendar} variant="vidro" onClick={() => setAgendando(true)}>
              <CalendarPlus className="!text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              Agendar consulta
            </Button>
          )
        )}
        <Button
          variant="vidro"
          onClick={() => {
            marcarContatado(a.id);
            toast.success("Marcado como contatado", { description: a.nome });
          }}
        >
          <PhoneCall className="!text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
          Marcar como contatado
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="vidro" aria-label={`Mudar status. Atual: ${STATUS_LABEL[a.status]}`}>
              Mudar status
              <ChevronDown className="!size-4 !text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end">
            <DropdownMenuLabel>Status do atendimento</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={a.status}
              onValueChange={(v) => {
                mudarStatus(a.id, v as StatusAtendimento);
                toast.success("Status atualizado", { description: `${a.nome} · ${STATUS_LABEL[v as StatusAtendimento]}` });
              }}
            >
              {STATUS_ORDEM.map((s) => (
                <DropdownMenuRadioItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </footer>

      <AgendarConsultaDialog atendimento={a} aberto={agendando} onOpenChange={setAgendando} retornarFocoPara={botaoAgendar} />
      <ConsultaDialog consulta={vendoConsulta ? (c ?? null) : null} onOpenChange={setVendoConsulta} comAtalhoAtendimento={false} />
    </>
  );
}

function Campo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-micro text-muted-foreground">{rotulo}</dt>
      <dd className="text-corpo">{children}</dd>
    </div>
  );
}
