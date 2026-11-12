import { RadioCard, RadioGroup } from "@/components/ui/radio-group";
import { modelosSegmento } from "@/lib/mock-data";

export function SegmentoPicker({ valor, onChange }: { valor: string; onChange: (id: string) => void }) {
  return (
    <RadioGroup value={valor} onValueChange={onChange} aria-label="Modelo de segmento" className="sm:grid-cols-2">
      {modelosSegmento.map((m) => (
        <div key={m.id} className="relative">
          <RadioCard value={m.id} titulo={m.nome} descricao={m.descricao} disabled={!m.disponivel} className="h-full pr-24" />
          {!m.disponivel && <span className="absolute right-5 top-5 text-micro text-muted-foreground">Em breve</span>}
        </div>
      ))}
    </RadioGroup>
  );
}
