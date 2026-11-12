import { X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  valor: string[];
  onChange: (v: string[]) => void;
  rotulo: string;
}

/** Palavras-chave em "chips". Enter ou vírgula adiciona; Backspace no campo vazio remove a última. */
export function PalavrasChaveInput({ id, valor, onChange, rotulo }: Props) {
  const [texto, setTexto] = useState("");

  function adicionar() {
    const novas = texto
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t && !valor.includes(t));
    if (novas.length) onChange([...valor, ...novas]);
    setTexto("");
  }

  function aoTeclar(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      adicionar();
    } else if (e.key === "Backspace" && !texto && valor.length) {
      onChange(valor.slice(0, -1));
    }
  }

  return (
    <div className={cn("campo flex min-h-11 flex-wrap items-center gap-1.5 px-2 py-1.5")}>
      {valor.map((p) => (
        <span key={p} className="vidro-interno inline-flex items-center gap-1 rounded-full py-1 pl-3 pr-1 text-apoio [--vidro-a:0.05]">
          {p}
          <button
            type="button"
            onClick={() => onChange(valor.filter((x) => x !== p))}
            className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-white/[0.14] hover:text-foreground"
            aria-label={`Remover palavra-chave ${p}`}
          >
            <X className="size-3" strokeWidth={2} aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={aoTeclar}
        onBlur={adicionar}
        aria-label={rotulo}
        placeholder={valor.length ? "Adicionar…" : "Digite e pressione Enter"}
        className="min-w-24 flex-1 bg-transparent px-1.5 text-apoio outline-none placeholder:text-terciario focus-visible:outline-none"
      />
    </div>
  );
}
