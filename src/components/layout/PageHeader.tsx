import type { ReactNode } from "react";

/** Título de página em serifa 56px. */
export function PageHeader({ titulo, descricao, acoes }: { titulo: ReactNode; descricao?: ReactNode; acoes?: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-serif text-[30px] leading-tight sm:text-display-1">{titulo}</h1>
        {descricao && <p className="mt-4 text-corpo text-muted-foreground">{descricao}</p>}
      </div>
      {acoes && <div className="flex flex-wrap items-center gap-3">{acoes}</div>}
    </div>
  );
}
