import { Lock, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfigSection } from "@/components/config/ConfigSection";
import { useRascunho } from "@/components/config/useRascunho";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { uid } from "@/lib/utils";

export default function Limites() {
  const { limites, salvarLimites } = useAppStore();
  const { rascunho, setRascunho, alterado, descartar } = useRascunho(limites);
  const [novo, setNovo] = useState("");

  function adicionar() {
    const texto = novo.trim();
    if (!texto) return;
    setRascunho([...rascunho, { id: uid("lim"), texto, bloqueado: false }]);
    setNovo("");
  }

  return (
    <ConfigSection
      titulo="Limites"
      descricao="O que o assistente nunca faz. Itens com cadeado são obrigatórios no modelo de advocacia e não podem ser removidos."
      alterado={alterado}
      onDescartar={descartar}
      onSalvar={() => {
        salvarLimites(rascunho);
        toast.success("Limites salvos");
      }}
    >
      <ul className="flex flex-col gap-1">
        {rascunho.map((l) => (
          <li key={l.id} className="flex min-h-12 items-center gap-4 rounded-2xl px-3 transition-colors hover:bg-white/[0.06]">
            <span className="flex-1 text-corpo">{l.texto}</span>
            {l.bloqueado ? (
              <span className="flex size-8 items-center justify-center" title="Obrigatório no modelo de segmento">
                <Lock className="size-[18px] text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                <span className="sr-only">Obrigatório, não pode ser removido</span>
              </span>
            ) : (
              <Button
                type="button"
                variant="texto"
                size="icon-sm"
                onClick={() => setRascunho(rascunho.filter((x) => x.id !== l.id))}
                aria-label={`Remover limite: ${l.texto}`}
              >
                <Trash2 className="!text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              </Button>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex gap-2">
        <label htmlFor="novo-limite" className="sr-only">
          Novo limite
        </label>
        <Input
          id="novo-limite"
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar();
            }
          }}
          placeholder="Ex.: Não fala sobre honorários"
        />
        <Button type="button" variant="vidro" onClick={adicionar} disabled={!novo.trim()}>
          <Plus strokeWidth={1.5} aria-hidden="true" /> Adicionar
        </Button>
      </div>
    </ConfigSection>
  );
}
