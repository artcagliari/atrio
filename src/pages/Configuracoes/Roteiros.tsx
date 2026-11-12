import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfigSection } from "@/components/config/ConfigSection";
import { RoteiroEditor } from "@/components/config/RoteiroEditor";
import { useRascunho } from "@/components/config/useRascunho";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store";
import { cn, uid } from "@/lib/utils";

export default function Roteiros() {
  const { areas, salvarAreas } = useAppStore();
  const { rascunho, setRascunho, alterado, descartar } = useRascunho(areas);
  const [selecionadaId, setSelecionadaId] = useState(areas[0]?.id);
  const [novaArea, setNovaArea] = useState("");
  const selecionada = rascunho.find((a) => a.id === selecionadaId) ?? rascunho[0];

  function adicionarArea() {
    const nome = novaArea.trim();
    if (!nome) return;
    const nova = { id: uid("area"), nome, ativa: true, perguntas: [] };
    setRascunho([...rascunho, nova]);
    setSelecionadaId(nova.id);
    setNovaArea("");
  }

  return (
    <ConfigSection
      titulo="Roteiros"
      descricao="Áreas atendidas e as perguntas de cada uma. Arraste pela alça para reordenar."
      alterado={alterado}
      onDescartar={descartar}
      onSalvar={() => {
        salvarAreas(rascunho.map((a) => ({ ...a, perguntas: a.perguntas.filter((p) => p.texto.trim()) })));
        toast.success("Roteiros salvos");
      }}
    >
      <div className="grid gap-8 md:grid-cols-[14rem_1fr]">
        <div className="flex flex-col gap-1">
          <ul className="flex flex-col gap-1">
            {rascunho.map((a) => {
              const ativa = a.id === selecionada?.id;
              return (
                <li
                  key={a.id}
                  className={cn("flex items-center gap-3 rounded-2xl py-1 pl-1 pr-2 transition-colors", ativa ? "bg-white/[0.07] ring-1 ring-inset ring-white/20" : "hover:bg-white/[0.05]")}
                >
                  <button
                    type="button"
                    onClick={() => setSelecionadaId(a.id)}
                    aria-pressed={ativa}
                    className="flex min-w-0 flex-1 flex-col items-start rounded-lg px-2.5 py-1.5 text-left"
                  >
                    <span className={cn("truncate text-apoio", !a.ativa && "text-muted-foreground")}>{a.nome}</span>
                    <span className="text-micro text-muted-foreground">
                      {a.perguntas.length} {a.perguntas.length === 1 ? "pergunta" : "perguntas"}
                      {!a.ativa && " · desativada"}
                    </span>
                  </button>
                  <Switch
                    checked={a.ativa}
                    onCheckedChange={(v) => setRascunho(rascunho.map((x) => (x.id === a.id ? { ...x, ativa: v } : x)))}
                    aria-label={`Atender a área ${a.nome}`}
                  />
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex gap-2">
            <label htmlFor="nova-area" className="sr-only">
              Nova área
            </label>
            <Input
              id="nova-area"
              value={novaArea}
              onChange={(e) => setNovaArea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  adicionarArea();
                }
              }}
              placeholder="Nova área"
            />
            <Button type="button" variant="vidro" size="icon" onClick={adicionarArea} aria-label="Adicionar área" disabled={!novaArea.trim()}>
              <Plus strokeWidth={1.5} aria-hidden="true" />
            </Button>
          </div>
        </div>

        {selecionada && (
          <div className="flex min-w-0 flex-col gap-4">
            <h3 className="text-corpo font-medium">{selecionada.nome}</h3>
            <RoteiroEditor
              key={selecionada.id}
              perguntas={selecionada.perguntas}
              onChange={(perguntas) => setRascunho(rascunho.map((a) => (a.id === selecionada.id ? { ...a, perguntas } : a)))}
            />
          </div>
        )}
      </div>
    </ConfigSection>
  );
}
