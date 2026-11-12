import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  titulo: string;
  descricao?: string;
  children: ReactNode;
  /** Exibe o rodapé com "Salvar" quando informado */
  onSalvar?: () => void;
  onDescartar?: () => void;
  alterado?: boolean;
  acoes?: ReactNode;
}

/** Conteúdo das Configurações em vidro nível leitura. */
export function ConfigSection({ titulo, descricao, children, onSalvar, onDescartar, alterado, acoes }: Props) {
  const conteudo = (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-display-3">{titulo}</h2>
          {descricao && <p className="mt-2 max-w-xl text-apoio leading-relaxed text-muted-foreground">{descricao}</p>}
        </div>
        {acoes}
      </div>
      <div className="mt-9">{children}</div>
      {onSalvar && (
        <div className="mt-10 flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
          {alterado && (
            <p className="mr-auto text-apoio text-muted-foreground" role="status">
              Alterações não salvas
            </p>
          )}
          {onDescartar && (
            <Button type="button" variant="texto" onClick={onDescartar} disabled={!alterado}>
              Descartar
            </Button>
          )}
          <Button type="submit" variant="latao" disabled={!alterado}>
            Salvar
          </Button>
        </div>
      )}
    </>
  );

  const classe = "vidro-leitura rounded-3xl p-6 sm:p-10";
  if (!onSalvar) return <section className={classe}>{conteudo}</section>;
  return (
    <form
      className={classe}
      onSubmit={(e) => {
        e.preventDefault();
        onSalvar();
      }}
    >
      {conteudo}
    </form>
  );
}

export function Campo({ id, rotulo, ajuda, children }: { id: string; rotulo: string; ajuda?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-apoio text-muted-foreground">
        {rotulo}
      </label>
      {children}
      {ajuda && (
        <p id={`${id}-ajuda`} className="text-micro text-muted-foreground">
          {ajuda}
        </p>
      )}
    </div>
  );
}
