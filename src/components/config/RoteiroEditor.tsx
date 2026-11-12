import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { Pergunta } from "@/lib/types";
import { cn, uid } from "@/lib/utils";

interface Props {
  perguntas: Pergunta[];
  onChange: (perguntas: Pergunta[]) => void;
}

const reordenar = (lista: Pergunta[]) => lista.map((p, i) => ({ ...p, ordem: i + 1 }));

/** Editor de perguntas do roteiro: arrastar para reordenar (mouse, toque ou teclado), obrigatória, adicionar e remover. */
export function RoteiroEditor({ perguntas, onChange }: Props) {
  const [nova, setNova] = useState("");
  const ordenadas = [...perguntas].sort((a, b) => a.ordem - b.ordem);
  const posicao = (id: unknown) => ordenadas.findIndex((p) => p.id === id) + 1;

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const anuncios: Announcements = {
    onDragStart: ({ active }) => `Pergunta ${posicao(active.id)} selecionada. Use as setas para mover e Espaço para soltar.`,
    onDragOver: ({ over }) => (over ? `Sobre a posição ${posicao(over.id)}.` : "Fora da lista."),
    onDragEnd: ({ over }) => (over ? `Pergunta movida para a posição ${posicao(over.id)}.` : "Pergunta solta."),
    onDragCancel: () => "Movimento cancelado.",
  };

  function aoSoltar({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const de = ordenadas.findIndex((p) => p.id === active.id);
    const para = ordenadas.findIndex((p) => p.id === over.id);
    onChange(reordenar(arrayMove(ordenadas, de, para)));
  }

  function atualizar(id: string, patch: Partial<Pergunta>) {
    onChange(ordenadas.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function adicionar(e?: { preventDefault: () => void }) {
    e?.preventDefault();
    const texto = nova.trim();
    if (!texto) return;
    onChange(reordenar([...ordenadas, { id: uid("p"), texto, obrigatoria: true, ordem: ordenadas.length + 1 }]));
    setNova("");
  }

  return (
    <div className="flex flex-col gap-3">
      {ordenadas.length === 0 ? (
        <p className="py-8 text-center text-apoio text-muted-foreground">
          Nenhuma pergunta ainda. Adicione a primeira abaixo.
        </p>
      ) : (
        <DndContext
          sensors={sensores}
          collisionDetection={closestCenter}
          onDragEnd={aoSoltar}
          accessibility={{
            announcements: anuncios,
            screenReaderInstructions: {
              draggable: "Para mover uma pergunta, pressione Espaço ou Enter, use as setas para cima e para baixo e pressione Espaço novamente para soltar. Esc cancela.",
            },
          }}
        >
          <SortableContext items={ordenadas.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <ol className="flex flex-col gap-2">
              {ordenadas.map((p, i) => (
                <ItemPergunta
                  key={p.id}
                  pergunta={p}
                  indice={i}
                  onTexto={(texto) => atualizar(p.id, { texto })}
                  onObrigatoria={(obrigatoria) => atualizar(p.id, { obrigatoria })}
                  onRemover={() => onChange(reordenar(ordenadas.filter((x) => x.id !== p.id)))}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}

      {/* div em vez de form para não aninhar formulários dentro da seção */}
      <div className="flex gap-2">
        <label htmlFor="nova-pergunta" className="sr-only">
          Nova pergunta
        </label>
        <Input
          id="nova-pergunta"
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") adicionar(e);
          }}
          placeholder="Escreva uma nova pergunta e pressione Enter"
        />
        <Button type="button" variant="vidro" onClick={() => adicionar()} disabled={!nova.trim()}>
          <Plus strokeWidth={1.5} aria-hidden="true" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}

interface ItemProps {
  pergunta: Pergunta;
  indice: number;
  onTexto: (v: string) => void;
  onObrigatoria: (v: boolean) => void;
  onRemover: () => void;
}

function ItemPergunta({ pergunta, indice, onTexto, onObrigatoria, onRemover }: ItemProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: pergunta.id,
  });
  const idCampo = `pergunta-${pergunta.id}`;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "vidro-interno flex flex-col gap-2 rounded-2xl p-2 transition-[background-color] duration-200 [--vidro-a:0.05] hover:[--vidro-a:0.09] sm:flex-row sm:items-center",
        isDragging && "vidro z-10 !rounded-2xl [--vidro-a:0.18]",
      )}
    >
      <div className="flex flex-1 items-center gap-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Arrastar para reordenar a pergunta ${indice + 1}`}
          className="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted-foreground hover:bg-white/[0.08] hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-[18px]" strokeWidth={1.5} aria-hidden="true" />
        </button>
        <span className="w-5 shrink-0 text-center font-mono text-micro text-muted-foreground" aria-hidden="true">
          {indice + 1}
        </span>
        <label htmlFor={idCampo} className="sr-only">
          Texto da pergunta {indice + 1}
        </label>
        <Input
          id={idCampo}
          value={pergunta.texto}
          onChange={(e) => onTexto(e.target.value)}
          className="h-10 border-transparent bg-transparent backdrop-blur-none hover:border-white/15"
        />
      </div>
      <div className="flex items-center justify-end gap-3 pl-12 sm:pl-0">
        <label className="flex cursor-pointer items-center gap-2 text-apoio text-muted-foreground">
          <Checkbox checked={pergunta.obrigatoria} onCheckedChange={(v) => onObrigatoria(v === true)} />
          Obrigatória
        </label>
        <Button type="button" variant="texto" size="icon-sm" className="[&_svg]:text-muted-foreground" onClick={onRemover} aria-label={`Remover pergunta ${indice + 1}`}>
          <Trash2 strokeWidth={1.5} aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}
