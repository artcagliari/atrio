import { toast } from "sonner";
import { ConfigSection } from "@/components/config/ConfigSection";
import { HorariosForm } from "@/components/config/HorariosForm";
import { useRascunho } from "@/components/config/useRascunho";
import { useAppStore } from "@/lib/store";
import { minutosDe } from "@/lib/utils";

export default function Horarios() {
  const { horarios, salvarHorarios } = useAppStore();
  const { rascunho, setRascunho, alterado, descartar } = useRascunho(horarios);

  return (
    <ConfigSection
      titulo="Horários"
      descricao="Dias e horários em que o assistente pode oferecer consultas."
      alterado={alterado}
      onDescartar={descartar}
      onSalvar={() => {
        if (rascunho.faixas.some((f) => f.ativo && minutosDe(f.fim) <= minutosDe(f.inicio))) {
          toast.error("Corrija os horários", { description: "O fim do expediente deve ser depois do início." });
          return;
        }
        salvarHorarios(rascunho);
        toast.success("Horários salvos");
      }}
    >
      <HorariosForm valor={rascunho} onChange={setRascunho} />
    </ConfigSection>
  );
}
