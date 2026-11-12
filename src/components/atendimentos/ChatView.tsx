import { Paperclip } from "lucide-react";
import { Fragment } from "react";
import { Logo } from "@/components/layout/Logo";
import { ArcoInicial } from "@/components/ui/arco";
import { Digitando } from "./Digitando";
import type { Mensagem } from "@/lib/types";
import { cn, formatarDataLonga, formatarHora, mesmoDia } from "@/lib/utils";

const ANEXO = /^\[(imagem|pdf)\]\s+(.+)$/;

interface ChatViewProps {
  mensagens: Mensagem[];
  nomeCliente: string;
  nomeAssistente: string;
  nomeEquipe: string;
  /** Mostra o balão "digitando…" do assistente (triagem ao vivo) */
  assistenteDigitando?: boolean;
}

/** Conversa em balões de vidro — somente leitura. Cliente à esquerda; assistente (arco) e equipe (avatar) à direita. */
export function ChatView({ mensagens, nomeCliente, nomeAssistente, nomeEquipe, assistenteDigitando }: ChatViewProps) {
  return (
    <section aria-label="Conversa completa">
      <ol className="flex flex-col gap-2">
        {mensagens.map((m, i) => {
          const anterior = mensagens[i - 1];
          const novoDia = !anterior || !mesmoDia(new Date(anterior.enviadaEm), new Date(m.enviadaEm));
          const primeiraDoBloco = !anterior || anterior.autor !== m.autor || novoDia;
          const doEscritorio = m.autor !== "cliente";
          const anexo = m.texto.match(ANEXO);
          const autor = m.autor === "assistente" ? `${nomeAssistente} · assistente` : m.autor === "equipe" ? "Equipe" : nomeCliente.split(" ")[0];

          return (
            <Fragment key={m.id}>
              {novoDia && <li className="my-3 self-center text-micro text-muted-foreground first-letter:uppercase">{formatarDataLonga(m.enviadaEm)}</li>}
              <li className={cn("flex max-w-[86%] items-end gap-2.5", doEscritorio ? "flex-row-reverse self-end" : "self-start", primeiraDoBloco && "mt-3")}>
                {doEscritorio && (
                  <span className="flex w-7 shrink-0 justify-center" aria-hidden="true">
                    {primeiraDoBloco &&
                      (m.autor === "assistente" ? <Logo variant="mark" tom="neutro" tamanho={22} /> : <ArcoInicial nome={nomeEquipe} tamanho="sm" />)}
                  </span>
                )}
                <div className={cn("flex min-w-0 flex-col gap-1", doEscritorio ? "items-end" : "items-start")}>
                  {primeiraDoBloco && <span className="px-1 text-micro text-muted-foreground">{autor}</span>}
                  <div
                    className={cn(
                      "vidro-interno rounded-[18px] px-4 py-2.5 text-corpo leading-relaxed",
                      m.autor === "cliente" && "rounded-bl-md [--vidro-a:0.07]",
                      m.autor === "assistente" && "rounded-br-md [--vidro-a:0.12]",
                      m.autor === "equipe" && "rounded-br-md [--vidro-a:0.18]",
                    )}
                  >
                    {m.autor === "assistente" && <span className="sr-only">Mensagem do assistente: </span>}
                    {anexo ? (
                      <span className="inline-flex items-center gap-2">
                        <Paperclip className="size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                        <span className="sr-only">Anexo:</span>
                        {anexo[2]}
                      </span>
                    ) : (
                      m.texto
                    )}
                    <time dateTime={m.enviadaEm} className="ml-3 inline-block font-mono text-[11px] text-muted-foreground tabular">
                      {formatarHora(m.enviadaEm)}
                    </time>
                  </div>
                </div>
              </li>
            </Fragment>
          );
        })}
        {assistenteDigitando && (
          <li className="mt-3 flex items-end gap-2.5 self-end">
            <div className="vidro-interno rounded-[18px] rounded-br-md px-4 py-3 text-apoio [--vidro-a:0.12]">
              <Digitando rotulo={`${nomeAssistente} está escrevendo`} />
            </div>
            <span className="flex w-7 justify-center" aria-hidden="true">
              <Logo variant="mark" tom="neutro" tamanho={22} />
            </span>
          </li>
        )}
      </ol>
    </section>
  );
}
