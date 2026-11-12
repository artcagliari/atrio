import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfigSection } from "@/components/config/ConfigSection";
import { PalavrasChaveInput } from "@/components/config/PalavrasChaveInput";
import { useRascunho } from "@/components/config/useRascunho";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { uid } from "@/lib/utils";

export default function Urgencia() {
  const { regrasUrgencia, salvarRegrasUrgencia } = useAppStore();
  const { rascunho, setRascunho, alterado, descartar } = useRascunho(regrasUrgencia);
  const atualizar = (id: string, patch: Partial<(typeof rascunho)[number]>) =>
    setRascunho(rascunho.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <ConfigSection
      titulo="Urgência"
      descricao="Situações que disparam alerta imediato para a equipe. O assistente identifica pelas palavras-chave e pelo contexto."
      alterado={alterado}
      onDescartar={descartar}
      onSalvar={() => {
        salvarRegrasUrgencia(rascunho.filter((r) => r.descricao.trim()));
        toast.success("Regras de urgência salvas");
      }}
    >
      <ul className="flex flex-col gap-8">
        {rascunho.map((r, i) => (
          <li key={r.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor={`regra-${r.id}`} className="sr-only">
                Situação {i + 1}
              </label>
              <Input
                id={`regra-${r.id}`}
                value={r.descricao}
                onChange={(e) => atualizar(r.id, { descricao: e.target.value })}
                placeholder="Descreva a situação"
                className="h-11 text-corpo"
              />
              <Button
                type="button"
                variant="texto"
                size="icon"
                onClick={() => setRascunho(rascunho.filter((x) => x.id !== r.id))}
                aria-label={`Remover situação ${r.descricao || i + 1}`}
              >
                <Trash2 className="!text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              </Button>
            </div>
            <div className="pr-12">
              <PalavrasChaveInput
                id={`palavras-${r.id}`}
                rotulo={`Palavras-chave de ${r.descricao || `situação ${i + 1}`}`}
                valor={r.palavrasChave}
                onChange={(palavrasChave) => atualizar(r.id, { palavrasChave })}
              />
            </div>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="vidro"
        className="mt-8"
        onClick={() => setRascunho([...rascunho, { id: uid("ru"), descricao: "", palavrasChave: [] }])}
      >
        <Plus strokeWidth={1.5} aria-hidden="true" /> Adicionar situação
      </Button>
    </ConfigSection>
  );
}
