import * as DialogPrimitive from "@radix-ui/react-dialog";
import { BellRing, CalendarDays, CornerDownLeft, Filter, FlaskConical, Inbox, LogOut, MessageCircle, Rocket, Search, Settings, Volume2, VolumeX, type LucideIcon } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArcoInicial } from "@/components/ui/arco";
import { useTriagemAoVivo } from "@/hooks/useTriagemAoVivo";
import { useUrgentAlerts } from "@/hooks/useUrgentAlerts";
import { gerarAtendimentoUrgente } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { aguardaRetorno, cn, normalizar } from "@/lib/utils";
import { MOSTRAR_FERRAMENTAS_DEV } from "./UserMenu";

interface Ctx {
  abrir: () => void;
}
const PaletaCtx = createContext<Ctx>({ abrir: () => {} });
export const usePaletaDeComandos = () => useContext(PaletaCtx);

interface Item {
  id: string;
  grupo: "Clientes" | "Telas" | "Ações";
  rotulo: string;
  detalhe?: string;
  icone?: LucideIcon;
  nomeArco?: string;
  urgente?: boolean;
  termos: string;
  executar: () => void;
}

const SECOES_CONFIG = [
  ["empresa", "Empresa"],
  ["modelo", "Modelo"],
  ["roteiros", "Roteiros"],
  ["urgencia", "Urgência"],
  ["horarios", "Horários"],
  ["assistente", "Assistente"],
  ["limites", "Limites"],
  ["whatsapp", "WhatsApp"],
] as const;

/** Paleta de comandos (Ctrl/Cmd+K): busca clientes, telas e ações. */
export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [aberta, setAberta] = useState(false);
  const abrir = useCallback(() => setAberta(true), []);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAberta((v) => !v);
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, []);

  return (
    <PaletaCtx.Provider value={{ abrir }}>
      {children}
      <DialogPrimitive.Root open={aberta} onOpenChange={setAberta}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#05141a]/35 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="vidro-leitura fixed left-1/2 top-[14vh] z-50 flex max-h-[70vh] w-[calc(100%-2rem)] max-w-[620px] -translate-x-1/2 flex-col overflow-hidden rounded-3xl text-foreground duration-200 ease-suave data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98] data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          >
            <DialogPrimitive.Title className="sr-only">Paleta de comandos</DialogPrimitive.Title>
            {aberta && <Conteudo fechar={() => setAberta(false)} />}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </PaletaCtx.Provider>
  );
}

function Conteudo({ fechar }: { fechar: () => void }) {
  const { atendimentos, sair, adicionarAtendimento } = useAppStore();
  const { mudo, alternarMudo, permissao, pedirPermissao } = useUrgentAlerts();
  const { simularCliente } = useTriagemAoVivo();
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [ativo, setAtivo] = useState(0);
  const listaRef = useRef<HTMLUListElement>(null);

  const ir = useCallback(
    (fn: () => void) => () => {
      fechar();
      fn();
    },
    [fechar],
  );

  const itens = useMemo<Item[]>(() => {
    const clientes: Item[] = [...atendimentos]
      .sort((a, b) => Number(b.urgente && aguardaRetorno(b)) - Number(a.urgente && aguardaRetorno(a)))
      .map((a) => ({
        id: `cli-${a.id}`,
        grupo: "Clientes",
        rotulo: a.nome,
        detalhe: a.area,
        nomeArco: a.nome,
        urgente: a.urgente && aguardaRetorno(a),
        termos: `${a.nome} ${a.area} ${a.telefone} ${a.cidade}`,
        executar: ir(() => navigate(`/atendimentos?id=${encodeURIComponent(a.id)}`)),
      }));
    const telas: Item[] = [
      { id: "t-at", grupo: "Telas", rotulo: "Atendimentos", icone: Inbox, termos: "atendimentos lista contatos", executar: ir(() => navigate("/atendimentos")) },
      { id: "t-fu", grupo: "Telas", rotulo: "Funil de triagem", icone: Filter, termos: "funil triagem etapas conversao", executar: ir(() => navigate("/funil")) },
      { id: "t-ag", grupo: "Telas", rotulo: "Agenda", icone: CalendarDays, termos: "agenda consultas calendario", executar: ir(() => navigate("/agenda")) },
      ...SECOES_CONFIG.map(([id, nome]) => ({
        id: `t-cfg-${id}`,
        grupo: "Telas" as const,
        rotulo: `Configurações › ${nome}`,
        icone: Settings,
        termos: `configuracoes ${nome}`,
        executar: ir(() => navigate(`/configuracoes/${id}`)),
      })),
    ];
    const acoes: Item[] = [
      {
        id: "a-som",
        grupo: "Ações",
        rotulo: mudo ? "Ativar som dos alertas" : "Silenciar som dos alertas",
        icone: mudo ? Volume2 : VolumeX,
        termos: "som silenciar mudo audio alerta",
        executar: ir(alternarMudo),
      },
      ...(permissao === "default"
        ? [{ id: "a-notif", grupo: "Ações" as const, rotulo: "Ativar notificações do navegador", icone: BellRing, termos: "notificacoes permissao avisos", executar: ir(() => void pedirPermissao()) }]
        : []),
      ...(MOSTRAR_FERRAMENTAS_DEV
        ? [{ id: "a-cli", grupo: "Ações" as const, rotulo: "Simular cliente no WhatsApp", icone: MessageCircle, termos: "simular cliente whatsapp triagem demonstracao", executar: ir(simularCliente) }, { id: "a-sim", grupo: "Ações" as const, rotulo: "Simular atendimento urgente", icone: FlaskConical, termos: "simular teste urgente desenvolvimento", executar: ir(() => adicionarAtendimento(gerarAtendimentoUrgente())) }]
        : []),
      { id: "a-onb", grupo: "Ações", rotulo: "Refazer configuração inicial", icone: Rocket, termos: "onboarding configuracao inicial", executar: ir(() => navigate("/onboarding")) },
      {
        id: "a-sair",
        grupo: "Ações",
        rotulo: "Sair",
        icone: LogOut,
        termos: "sair logout",
        executar: ir(() => {
          sair();
          navigate("/login");
        }),
      },
    ];

    const termo = normalizar(busca.trim());
    const filtrar = (l: Item[]) => (termo ? l.filter((i) => normalizar(`${i.rotulo} ${i.termos}`).includes(termo)) : l);
    return [...filtrar(clientes).slice(0, termo ? 8 : 5), ...filtrar(telas).slice(0, termo ? 10 : 3), ...filtrar(acoes)];
  }, [atendimentos, busca, mudo, permissao, ir, navigate, alternarMudo, pedirPermissao, adicionarAtendimento, sair, simularCliente]);

  useEffect(() => setAtivo(0), [busca]);
  useEffect(() => {
    listaRef.current?.querySelector(`[data-indice="${ativo}"]`)?.scrollIntoView({ block: "nearest" });
  }, [ativo]);

  function aoTeclar(e: ReactKeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAtivo((i) => Math.min(itens.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAtivo((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      itens[ativo]?.executar();
    }
  }

  let grupoAnterior = "";
  return (
    <>
      <div className="flex items-center gap-3 px-5 py-4">
        <Search className="size-[18px] shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
        <input
          autoFocus
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={aoTeclar}
          placeholder="Buscar clientes, telas e ações"
          role="combobox"
          aria-expanded="true"
          aria-controls="paleta-lista"
          aria-activedescendant={itens[ativo] ? `paleta-${itens[ativo].id}` : undefined}
          aria-label="Buscar clientes, telas e ações"
          className="h-8 flex-1 bg-transparent text-corpo text-foreground outline-none placeholder:text-terciario focus-visible:outline-none"
        />
        <kbd className="rounded-lg border border-white/15 bg-white/[0.06] px-2 py-1 font-mono text-micro text-muted-foreground">Esc</kbd>
      </div>
      <div className="mx-5 h-px bg-white/[0.08]" />
      {itens.length === 0 ? (
        <p className="px-5 py-10 text-center text-apoio text-muted-foreground">Nada encontrado para “{busca}”.</p>
      ) : (
        <ul ref={listaRef} id="paleta-lista" role="listbox" aria-label="Resultados" className="scrollbar-fina flex-1 overflow-y-auto p-2">
          {itens.map((item, i) => {
            const cabecalho = item.grupo !== grupoAnterior ? item.grupo : null;
            grupoAnterior = item.grupo;
            const Icone = item.icone;
            return (
              <li key={item.id} role="presentation">
                {cabecalho && <p className="px-3 pb-1.5 pt-3 text-micro text-terciario" aria-hidden="true">{cabecalho}</p>}
                <div
                  id={`paleta-${item.id}`}
                  role="option"
                  aria-selected={i === ativo}
                  data-indice={i}
                  onMouseMove={() => setAtivo(i)}
                  onClick={item.executar}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-apoio transition-colors duration-150",
                    i === ativo ? "bg-white/[0.12] text-foreground" : "text-foreground/90",
                  )}
                >
                  {item.nomeArco ? (
                    <ArcoInicial nome={item.nomeArco} tamanho="sm" />
                  ) : (
                    Icone && <Icone className="size-[18px] text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                  )}
                  <span className="flex-1 truncate">{item.rotulo}</span>
                  {item.urgente && (
                    <span className="flex items-center gap-1.5 text-micro text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-urgente" aria-hidden="true" /> Urgente
                    </span>
                  )}
                  {item.detalhe && <span className="text-micro text-muted-foreground">{item.detalhe}</span>}
                  {i === ativo && <CornerDownLeft className="size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
