import { CalendarPlus, ChevronDown, PhoneCall, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
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
import { useAppStore } from "@/lib/store";
import type { Atendimento, StatusAtendimento } from "@/lib/types";
import { aguardaRetorno, formatarDataHora, STATUS_LABEL, STATUS_ORDEM, tempoRelativo } from "@/lib/utils";
import { AgendarConsultaDialog } from "./AgendarConsultaDialog";
import { ChatView } from "./ChatView";
import { DocumentThumbs } from "./DocumentThumbs";
import { WaitingTime } from "./WaitingTime";

interface LeadSheetProps {
  atendimento: Atendimento | null;
  onClose: () => void;
}

/** Painel de detalhe: abas Resumo · Conversa · Documentos, ações fixas no rodapé. */
export function LeadSheet({ atendimento, onClose }: LeadSheetProps) {
  return (
    <Sheet open={!!atendimento} onOpenChange={(v) => !v && onClose()}>
      <SheetContent>{atendimento && <Conteudo a={atendimento} />}</SheetContent>
    </Sheet>
  );
}

const rolagem = "scrollbar-fina min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-7 sm:px-9 [mask-image:linear-gradient(to_bottom,black_calc(100%-32px),transparent)]";

function Conteudo({ a }: { a: Atendimento }) {
  const { assistente, usuario, marcarContatado, mudarStatus } = useAppStore();
  const agora = useAgora();
  const [agendando, setAgendando] = useState(false);
  const botaoAgendar = useRef<HTMLButtonElement>(null);
  const telefoneLimpo = a.telefone.replace(/\D/g, "");
  const tempo = tempoRelativo(a.criadoEm, agora);

  return (
    <>
      <header className="flex items-start justify-between gap-4 px-6 pb-6 pt-7 sm:px-9 sm:pt-9">
        <div className="min-w-0">
          <SheetTitle className="font-serif text-[34px] leading-[1.08] tracking-[-0.015em] sm:text-display-2">{a.nome}</SheetTitle>
          <SheetDescription className="mt-2 flex flex-wrap items-center gap-x-2 text-apoio text-muted-foreground">
            <span>{a.area}</span>
            <span aria-hidden="true">·</span>
            <span>chegou {tempo === "agora" ? "agora" : `há ${tempo}`}</span>
            <span aria-hidden="true">·</span>
            <span>{STATUS_LABEL[a.status]}</span>
          </SheetDescription>
        </div>
        <SheetClose asChild>
          <Button variant="vidro" size="icon" aria-label="Fechar painel" className="shrink-0 text-muted-foreground hover:text-foreground">
            <X strokeWidth={1.5} aria-hidden="true" />
          </Button>
        </SheetClose>
      </header>

      <Tabs defaultValue="resumo" className="flex min-h-0 flex-1 flex-col">
        <div className="px-6 sm:px-9">
          <TabsList aria-label="Detalhes do atendimento">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="conversa">Conversa</TabsTrigger>
            <TabsTrigger value="documentos">
              Documentos{a.documentos.length > 0 && <span className="font-mono text-micro text-muted-foreground">{a.documentos.length}</span>}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="resumo" className={rolagem}>
          <div className="flex flex-col gap-10">
            {a.urgente && (
              <p className="flex items-start gap-2.5 text-apoio">
                <span className="mt-[5px] size-2 shrink-0 rounded-full bg-urgente motion-safe:animate-pulso" aria-hidden="true" />
                <span>
                  <span className="sr-only">Urgente: </span>
                  {a.motivoUrgencia ?? "Marcado como urgente"}
                </span>
              </p>
            )}

            <section aria-labelledby="titulo-resumo" className="border-l border-latao/80 pl-5">
              <h3 id="titulo-resumo" className="mb-3 text-micro text-muted-foreground">
                Resumo do Átrio
              </h3>
              <p className="text-corpo leading-[1.7]">{a.resumoIA}</p>
            </section>

            {a.respostas.length > 0 && (
              <section aria-labelledby="titulo-respostas">
                <h3 id="titulo-respostas" className="mb-4 text-micro text-muted-foreground">
                  Roteiro
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
                <a href={`https://wa.me/55${telefoneLimpo}`} target="_blank" rel="noreferrer" className="font-mono underline decoration-white/30 underline-offset-4 hover:decoration-white">
                  {a.telefone}
                </a>
              </Campo>
              <Campo rotulo="Cidade">{a.cidade}</Campo>
              <Campo rotulo="Chegou em">
                <span className="font-mono text-apoio">{formatarDataHora(a.criadoEm)}</span>
              </Campo>
              <Campo rotulo="Retorno da equipe">
                {aguardaRetorno(a) || a.ultimoContatoHumano ? <WaitingTime atendimento={a} agora={agora} className="text-corpo text-foreground" /> : "—"}
              </Campo>
            </dl>
          </div>
        </TabsContent>

        <TabsContent value="conversa" className={rolagem}>
          <ChatView mensagens={a.mensagens} nomeCliente={a.nome} nomeAssistente={assistente.nome} nomeEquipe={usuario.nome} />
          <p className="mt-8 text-center text-micro text-muted-foreground">Somente leitura — a conversa continua pelo WhatsApp.</p>
        </TabsContent>

        <TabsContent value="documentos" className={rolagem}>
          <DocumentThumbs documentos={a.documentos} />
        </TabsContent>
      </Tabs>

      {/* Ações fixas no rodapé do painel */}
      <footer className="flex flex-wrap items-center gap-2 border-t border-white/[0.08] px-6 py-5 sm:px-9">
        <Button ref={botaoAgendar} variant="latao" onClick={() => setAgendando(true)}>
          <CalendarPlus strokeWidth={1.5} aria-hidden="true" />
          Agendar consulta
        </Button>
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
