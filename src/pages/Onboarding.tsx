import { ArrowLeft, ArrowRight, Pencil, Plus } from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Campo } from "@/components/config/ConfigSection";
import { HorariosForm } from "@/components/config/HorariosForm";
import { SegmentoPicker } from "@/components/config/SegmentoPicker";
import { ConexaoBadge, WhatsappConnect } from "@/components/config/WhatsappConnect";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { modelosSegmento } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import type { Area, ConfigHorarios, StatusConexao } from "@/lib/types";
import { cn, DIAS_SEMANA, uid } from "@/lib/utils";

const ETAPAS = ["Segmento", "Empresa", "Áreas", "Horários", "WhatsApp", "Revisão"] as const;

export default function Onboarding() {
  const store = useAppStore();
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(0);

  const [segmento, setSegmento] = useState(store.empresa.segmento);
  const [empresa, setEmpresa] = useState({
    nome: store.empresa.nome,
    cidade: store.empresa.cidade ?? "",
    numeroWhatsapp: store.empresa.numeroWhatsapp,
  });
  const [areas, setAreas] = useState<Area[]>(store.areas);
  const [novaArea, setNovaArea] = useState("");
  const [horarios, setHorarios] = useState<ConfigHorarios>(store.horarios);
  const [conexao, setConexao] = useState<StatusConexao>("desconectado");
  const conectar = useCallback(() => setConexao("conectado"), []);

  const ativas = areas.filter((a) => a.ativa);
  const podeAvancar = [
    !!segmento,
    empresa.nome.trim().length > 1 && empresa.numeroWhatsapp.replace(/\D/g, "").length >= 10,
    ativas.length > 0,
    horarios.faixas.some((f) => f.ativo),
    true,
    true,
  ][etapa];

  function concluir() {
    store.salvarEmpresa({ ...empresa, segmento, statusConexao: conexao });
    store.salvarAreas(areas);
    store.salvarHorarios(horarios);
    if (!store.logado) store.entrar("");
    toast.success("Tudo pronto", { description: "O assistente já pode receber o primeiro cliente." });
    navigate("/atendimentos");
  }

  function adicionarArea() {
    const nome = novaArea.trim();
    if (!nome) return;
    setAreas([...areas, { id: uid("area"), nome, ativa: true, perguntas: [] }]);
    setNovaArea("");
  }

  return (
    <div className="flex min-h-dvh flex-col items-center px-4 py-10 sm:py-14">
      <Logo className="mb-10 animate-in fade-in-0 duration-700" />

      <div className="vidro-leitura w-full max-w-2xl rounded-3xl animate-in fade-in-0 slide-in-from-bottom-3 duration-700 ease-suave">
        {/* Progresso em arcos que se preenchem com latão */}
        <div className="flex flex-col items-center gap-4 px-6 pt-9 sm:px-10">
          <ol className="flex items-end gap-2.5" aria-label="Etapas">
            {ETAPAS.map((nome, i) => (
              <li key={nome} aria-current={i === etapa ? "step" : undefined}>
                <span
                  className={cn(
                    "arco block h-8 w-7 border transition-all duration-500 ease-suave",
                    i < etapa && "border-latao bg-latao",
                    i === etapa && "border-latao bg-gradient-to-t from-latao/70 to-latao/0",
                    i > etapa && "border-white/25 bg-white/[0.04]",
                  )}
                  aria-hidden="true"
                />
                <span className="sr-only">
                  {nome}: {i < etapa ? "concluída" : i === etapa ? "etapa atual" : "pendente"}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-apoio text-muted-foreground">
            <span className="font-mono">
              {etapa + 1}/{ETAPAS.length}
            </span>{" "}
            · {ETAPAS[etapa]}
          </p>
        </div>

        <div key={etapa} className="px-6 py-10 animate-in fade-in-0 slide-in-from-right-2 duration-300 sm:px-10">
          {etapa === 0 && (
            <Etapa titulo="Qual é o seu segmento?" descricao="Cada modelo já vem com roteiro, regras de urgência e limites prontos.">
              <SegmentoPicker valor={segmento} onChange={setSegmento} />
            </Etapa>
          )}

          {etapa === 1 && (
            <Etapa titulo="Dados da empresa" descricao="O nome aparece na saudação do assistente.">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Campo id="ob-nome" rotulo="Nome da empresa">
                    <Input id="ob-nome" value={empresa.nome} onChange={(e) => setEmpresa({ ...empresa, nome: e.target.value })} autoFocus />
                  </Campo>
                </div>
                <Campo id="ob-cidade" rotulo="Cidade">
                  <Input id="ob-cidade" value={empresa.cidade} onChange={(e) => setEmpresa({ ...empresa, cidade: e.target.value })} />
                </Campo>
                <Campo id="ob-whats" rotulo="Número do WhatsApp" ajuda="Com DDD. Ex.: +55 41 99999-0000">
                  <Input
                    id="ob-whats"
                    inputMode="tel"
                    className="font-mono"
                    value={empresa.numeroWhatsapp}
                    onChange={(e) => setEmpresa({ ...empresa, numeroWhatsapp: e.target.value })}
                    aria-describedby="ob-whats-ajuda"
                  />
                </Campo>
              </div>
            </Etapa>
          )}

          {etapa === 2 && (
            <Etapa titulo="Quais áreas vocês atendem?" descricao="Assuntos fora dessas áreas recebem a mensagem de encerramento.">
              <ul className="grid gap-3 sm:grid-cols-2">
                {areas.map((a) => (
                  <li key={a.id}>
                    <label className="vidro-leve vidro-clicavel flex cursor-pointer items-center gap-3 rounded-2xl px-5 py-4 text-corpo has-[[data-state=checked]]:!border-white/50">
                      <Checkbox checked={a.ativa} onCheckedChange={(v) => setAreas(areas.map((x) => (x.id === a.id ? { ...x, ativa: v === true } : x)))} />
                      <span className="flex-1">{a.nome}</span>
                      <span className="font-mono text-micro text-muted-foreground">{a.perguntas.length} perg.</span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                <label htmlFor="ob-nova-area" className="sr-only">
                  Outra área
                </label>
                <Input
                  id="ob-nova-area"
                  placeholder="Outra área (ex.: Tributário)"
                  value={novaArea}
                  onChange={(e) => setNovaArea(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      adicionarArea();
                    }
                  }}
                />
                <Button variant="vidro" onClick={adicionarArea} disabled={!novaArea.trim()}>
                  <Plus className="!text-muted-foreground" strokeWidth={1.5} aria-hidden="true" /> Adicionar
                </Button>
              </div>
            </Etapa>
          )}

          {etapa === 3 && (
            <Etapa titulo="Horários de consulta" descricao="O assistente só oferece horários dentro do expediente.">
              <HorariosForm valor={horarios} onChange={setHorarios} />
            </Etapa>
          )}

          {etapa === 4 && (
            <Etapa titulo="Conectar o WhatsApp" descricao="Você também pode fazer isso depois, em Configurações › WhatsApp.">
              <WhatsappConnect status={conexao} numero={empresa.numeroWhatsapp} onConectado={conectar} />
            </Etapa>
          )}

          {etapa === 5 && (
            <Etapa titulo="Tudo certo?" descricao="Tudo pode ser ajustado depois nas Configurações.">
              <dl className="flex flex-col gap-5">
                <Revisao rotulo="Segmento" onEditar={() => setEtapa(0)}>
                  {modelosSegmento.find((m) => m.id === segmento)?.nome}
                </Revisao>
                <Revisao rotulo="Empresa" onEditar={() => setEtapa(1)}>
                  {empresa.nome}
                  {empresa.cidade && <span className="text-muted-foreground"> · {empresa.cidade}</span>}
                </Revisao>
                <Revisao rotulo="Áreas" onEditar={() => setEtapa(2)}>
                  {ativas.map((a) => a.nome).join(", ")}
                </Revisao>
                <Revisao rotulo="Horários" onEditar={() => setEtapa(3)}>
                  <span className="font-mono text-apoio">
                    {horarios.faixas
                      .filter((f) => f.ativo)
                      .map((f) => `${DIAS_SEMANA[f.dia].curto} ${f.inicio}–${f.fim}`)
                      .join(" · ")}
                  </span>
                  <span className="block text-apoio text-muted-foreground">
                    {horarios.duracaoMinutos} min · {horarios.modo === "pre_agendar" ? "pré-agendar para aprovação" : "confirmar direto"}
                  </span>
                </Revisao>
                <Revisao rotulo="WhatsApp" onEditar={() => setEtapa(4)}>
                  <span className="mr-3 font-mono">{empresa.numeroWhatsapp}</span>
                  <ConexaoBadge status={conexao} />
                </Revisao>
              </dl>
            </Etapa>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-6 pb-9 sm:px-10">
          <Button variant="texto" onClick={() => (etapa === 0 ? navigate(-1) : setEtapa(etapa - 1))}>
            <ArrowLeft strokeWidth={1.5} aria-hidden="true" />
            Voltar
          </Button>
          {etapa < ETAPAS.length - 1 ? (
            <Button variant="latao" onClick={() => setEtapa(etapa + 1)} disabled={!podeAvancar}>
              {etapa === 4 && conexao !== "conectado" ? "Pular por enquanto" : "Continuar"}
              <ArrowRight strokeWidth={1.5} aria-hidden="true" />
            </Button>
          ) : (
            <Button variant="latao" onClick={concluir}>
              Abrir o Átrio
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Etapa({ titulo, descricao, children }: { titulo: string; descricao: string; children: ReactNode }) {
  return (
    <section aria-labelledby="titulo-etapa" className="flex flex-col gap-8">
      <div className="text-center">
        <h1 id="titulo-etapa" className="font-serif text-display-2">
          {titulo}
        </h1>
        <p className="mt-3 text-apoio leading-relaxed text-muted-foreground">{descricao}</p>
      </div>
      {children}
    </section>
  );
}

function Revisao({ rotulo, children, onEditar }: { rotulo: string; children: ReactNode; onEditar: () => void }) {
  return (
    <div className="flex items-start gap-4">
      <dt className="w-24 shrink-0 pt-0.5 text-apoio text-muted-foreground">{rotulo}</dt>
      <dd className="flex-1 text-corpo">{children}</dd>
      <Button variant="texto" size="icon-sm" onClick={onEditar} aria-label={`Editar ${rotulo.toLowerCase()}`}>
        <Pencil strokeWidth={1.5} aria-hidden="true" />
      </Button>
    </div>
  );
}
