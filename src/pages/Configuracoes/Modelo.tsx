import { ConfigSection } from "@/components/config/ConfigSection";
import { SegmentoPicker } from "@/components/config/SegmentoPicker";
import { useAppStore } from "@/lib/store";

export default function Modelo() {
  const { empresa, salvarEmpresa } = useAppStore();
  return (
    <ConfigSection
      titulo="Modelo de segmento"
      descricao="O modelo define o roteiro inicial, as regras de urgência e os limites do assistente. Novos segmentos estão a caminho."
    >
      <SegmentoPicker valor={empresa.segmento} onChange={(id) => salvarEmpresa({ segmento: id })} />
    </ConfigSection>
  );
}
