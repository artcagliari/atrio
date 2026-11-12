import { useCallback } from "react";
import { toast } from "sonner";
import { ConfigSection } from "@/components/config/ConfigSection";
import { WhatsappConnect } from "@/components/config/WhatsappConnect";
import { useAppStore } from "@/lib/store";

export default function WhatsApp() {
  const { empresa, salvarEmpresa } = useAppStore();
  const conectar = useCallback(() => salvarEmpresa({ statusConexao: "conectado" }), [salvarEmpresa]);

  return (
    <ConfigSection
      titulo="WhatsApp"
      descricao="Número em que o assistente faz o primeiro atendimento. Ele só responde quem iniciar a conversa."
    >
      <WhatsappConnect
        status={empresa.statusConexao}
        numero={empresa.numeroWhatsapp}
        onConectado={conectar}
        onDesconectar={() => {
          salvarEmpresa({ statusConexao: "desconectado" });
          toast.warning("WhatsApp desconectado", { description: "Novos contatos não serão atendidos até reconectar." });
        }}
      />
    </ConfigSection>
  );
}
