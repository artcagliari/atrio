import { toast } from "sonner";
import { Campo, ConfigSection } from "@/components/config/ConfigSection";
import { useRascunho } from "@/components/config/useRascunho";
import { Input } from "@/components/ui/input";
import { RadioCard, RadioGroup } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import type { ConfigAssistente } from "@/lib/types";

export default function Assistente() {
  const { assistente, salvarAssistente } = useAppStore();
  const { rascunho, setRascunho, alterado, descartar } = useRascunho(assistente);
  const set = <K extends keyof ConfigAssistente>(k: K, v: ConfigAssistente[K]) => setRascunho({ ...rascunho, [k]: v });

  return (
    <div className="flex flex-col gap-6">
      <ConfigSection
        titulo="Assistente"
        descricao="Como o assistente se apresenta e conversa com os contatos."
        alterado={alterado}
        onDescartar={descartar}
        onSalvar={() => {
          salvarAssistente(rascunho);
          toast.success("Assistente atualizado");
        }}
      >
        <div className="flex flex-col gap-8">
          <div className="max-w-sm">
            <Campo id="ass-nome" rotulo="Nome do assistente">
              <Input id="ass-nome" value={rascunho.nome} onChange={(e) => set("nome", e.target.value)} />
            </Campo>
          </div>
          <Campo id="ass-saudacao" rotulo="Saudação" ajuda="Primeira mensagem enviada a quem chama no WhatsApp.">
            <Textarea
              id="ass-saudacao"
              value={rascunho.saudacao}
              onChange={(e) => set("saudacao", e.target.value)}
              aria-describedby="ass-saudacao-ajuda"
              rows={3}
            />
          </Campo>
          <fieldset>
            <legend className="mb-3 text-apoio text-muted-foreground">Tom da conversa</legend>
            <RadioGroup value={rascunho.tom} onValueChange={(v) => set("tom", v as ConfigAssistente["tom"])} className="sm:grid-cols-2">
              <RadioCard value="cordial" titulo="Cordial" descricao="Próximo e acolhedor, sem perder a seriedade." />
              <RadioCard value="formal" titulo="Formal" descricao="Linguagem mais protocolar, tratamento por senhor(a)." />
            </RadioGroup>
          </fieldset>
          <Campo
            id="ass-encerramento"
            rotulo="Encerramento para casos fora de escopo"
            ajuda="Enviado quando o assunto não está entre as áreas atendidas."
          >
            <Textarea
              id="ass-encerramento"
              value={rascunho.encerramentoForaEscopo}
              onChange={(e) => set("encerramentoForaEscopo", e.target.value)}
              aria-describedby="ass-encerramento-ajuda"
              rows={3}
            />
          </Campo>
        </div>
      </ConfigSection>

      <ConfigSection titulo="Prévia" descricao="Assim a saudação aparece no WhatsApp.">
        <div className="flex flex-col items-end gap-1.5">
          <span className="px-1 text-micro text-muted-foreground">{rascunho.nome || "Assistente"} · assistente (IA)</span>
          <p className="vidro-interno max-w-md rounded-[18px] rounded-br-md px-4 py-2.5 text-corpo [--vidro-a:0.12] leading-relaxed">
            {rascunho.saudacao || "…"}
          </p>
        </div>
      </ConfigSection>
    </div>
  );
}
