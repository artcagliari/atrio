import { FileText, ImageIcon } from "lucide-react";
import type { Documento } from "@/lib/types";

function tamanho(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1).replace(".", ",")} MB` : `${kb} KB`;
}

export function DocumentThumbs({ documentos }: { documentos: Documento[] }) {
  if (documentos.length === 0) {
    return <p className="py-12 text-center text-apoio text-muted-foreground">Nenhum documento enviado.</p>;
  }
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {documentos.map((d) => {
        const Icone = d.tipo === "imagem" ? ImageIcon : FileText;
        return (
          <li key={d.id}>
            <figure className="vidro vidro-clicavel flex flex-col overflow-hidden rounded-2xl">
              <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-b from-white/[0.06] to-transparent">
                {d.miniaturaUrl ? (
                  <img src={d.miniaturaUrl} alt={`Miniatura de ${d.nome}`} className="size-full object-cover" />
                ) : (
                  <Icone className="size-7 text-muted-foreground" strokeWidth={1.25} aria-hidden="true" />
                )}
              </div>
              <figcaption className="flex flex-col gap-0.5 px-4 py-3">
                <span className="truncate text-apoio" title={d.nome}>
                  {d.nome}
                </span>
                <span className="font-mono text-micro text-muted-foreground">
                  {d.tipo === "pdf" ? "PDF" : "IMG"} · {tamanho(d.tamanhoKb)}
                </span>
              </figcaption>
            </figure>
          </li>
        );
      })}
    </ul>
  );
}
