import { Download, FileText, ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Documento } from "@/lib/types";

function tamanho(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1).replace(".", ",")} MB` : `${kb} KB`;
}

export function DocumentThumbs({ documentos }: { documentos: Documento[] }) {
  const [aberto, setAberto] = useState<Documento | null>(null);

  if (documentos.length === 0) {
    return <p className="py-12 text-center text-apoio text-muted-foreground">O cliente não enviou documentos pelo WhatsApp.</p>;
  }
  return (
    <>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {documentos.map((d) => {
          const Icone = d.tipo === "imagem" ? ImageIcon : FileText;
          return (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => setAberto(d)}
                aria-label={`Abrir ${d.nome}`}
                className="vidro vidro-clicavel flex w-full flex-col overflow-hidden rounded-2xl text-left"
              >
                <span className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-b from-white/[0.06] to-transparent">
                  {d.miniaturaUrl ? (
                    <img src={d.miniaturaUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <Icone className="size-7 text-muted-foreground" strokeWidth={1.25} aria-hidden="true" />
                  )}
                </span>
                <span className="flex w-full flex-col gap-0.5 px-4 py-3">
                  <span className="truncate text-apoio" title={d.nome}>
                    {d.nome}
                  </span>
                  <span className="text-micro text-muted-foreground">
                    {d.tipo === "pdf" ? "PDF" : "Imagem"} · {tamanho(d.tamanhoKb)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Dialog open={!!aberto} onOpenChange={(v) => !v && setAberto(null)}>
        <DialogContent className="max-w-2xl">
          {aberto && (
            <>
              <DialogHeader>
                <DialogTitle className="truncate">{aberto.nome}</DialogTitle>
                <DialogDescription>
                  {aberto.tipo === "pdf" ? "PDF" : "Imagem"} · {tamanho(aberto.tamanhoKb)} · enviado pelo cliente no WhatsApp
                </DialogDescription>
              </DialogHeader>
              <div className="vidro-interno flex aspect-[4/3] items-center justify-center rounded-2xl [--vidro-a:0.04]">
                {aberto.miniaturaUrl ? (
                  <img src={aberto.miniaturaUrl} alt={aberto.nome} className="size-full rounded-2xl object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-3 px-6 text-center">
                    {aberto.tipo === "pdf" ? (
                      <FileText className="size-12 text-muted-foreground" strokeWidth={1} aria-hidden="true" />
                    ) : (
                      <ImageIcon className="size-12 text-muted-foreground" strokeWidth={1} aria-hidden="true" />
                    )}
                    <p className="max-w-xs text-apoio text-muted-foreground">A pré-visualização aparece aqui quando o armazenamento de arquivos estiver conectado.</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  variant="vidro"
                  onClick={() => toast("Download indisponível na demonstração", { description: "Os arquivos ficam disponíveis quando o armazenamento estiver conectado." })}
                >
                  <Download className="!text-muted-foreground" strokeWidth={1.5} aria-hidden="true" /> Baixar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
