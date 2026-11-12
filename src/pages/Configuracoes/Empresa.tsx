import type { ChangeEvent } from "react";
import { toast } from "sonner";
import { Campo, ConfigSection } from "@/components/config/ConfigSection";
import { useRascunho } from "@/components/config/useRascunho";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";

export default function Empresa() {
  const { empresa, salvarEmpresa } = useAppStore();
  const { rascunho, setRascunho, alterado, descartar } = useRascunho(empresa);
  const set = (k: keyof typeof rascunho) => (e: ChangeEvent<HTMLInputElement>) =>
    setRascunho({ ...rascunho, [k]: e.target.value });

  return (
    <ConfigSection
      titulo="Empresa"
      descricao="Nome e dados básicos. O nome aparece na saudação do assistente e no painel."
      alterado={alterado}
      onDescartar={descartar}
      onSalvar={() => {
        if (!rascunho.nome.trim()) {
          toast.error("Informe o nome da empresa");
          return;
        }
        salvarEmpresa(rascunho);
        toast.success("Dados da empresa salvos");
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Campo id="emp-nome" rotulo="Nome da empresa">
            <Input id="emp-nome" value={rascunho.nome} onChange={set("nome")} required autoComplete="organization" />
          </Campo>
        </div>
        <Campo id="emp-doc" rotulo="CNPJ">
          <Input id="emp-doc" value={rascunho.documento ?? ""} onChange={set("documento")} inputMode="numeric" className="font-mono" />
        </Campo>
        <Campo id="emp-cidade" rotulo="Cidade">
          <Input id="emp-cidade" value={rascunho.cidade ?? ""} onChange={set("cidade")} />
        </Campo>
        <Campo id="emp-email" rotulo="E-mail de contato" ajuda="Recebe resumos diários e avisos importantes.">
          <Input id="emp-email" type="email" value={rascunho.email ?? ""} onChange={set("email")} autoComplete="email" />
        </Campo>
      </div>
    </ConfigSection>
  );
}
