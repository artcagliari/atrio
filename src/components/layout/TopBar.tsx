import { Search, Volume2, VolumeX } from "lucide-react";
import { Dica } from "@/components/ui/tooltip";
import { useUrgentAlerts } from "@/hooks/useUrgentAlerts";
import { usePaletaDeComandos } from "./CommandPalette";
import { NotificationsMenu } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";

const ehMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** Sem barra cheia: pílulas de vidro flutuando à direita — busca (abre a paleta), sino e som. */
export function TopBar() {
  const { abrir } = usePaletaDeComandos();
  const { mudo, alternarMudo, somAguardandoInteracao } = useUrgentAlerts();
  const rotuloSom = mudo
    ? "Ativar som dos alertas"
    : somAguardandoInteracao
      ? "Silenciar alertas (o som é liberado após o primeiro clique)"
      : "Silenciar som dos alertas";

  return (
    <header className="flex items-center justify-end gap-3 pt-6">
      <button
        type="button"
        onClick={abrir}
        className="vidro vidro-clicavel mr-auto flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full pl-4 pr-2 text-apoio text-muted-foreground hover:text-foreground sm:mr-0 sm:w-72 sm:flex-none"
        aria-label="Buscar clientes, telas e ações"
        aria-keyshortcuts={ehMac ? "Meta+K" : "Control+K"}
      >
        <Search className="size-[18px] shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <span className="flex-1 truncate text-left">Buscar</span>
        <kbd className="hidden rounded-lg border border-white/15 bg-white/[0.06] px-2 py-1 font-mono text-micro text-muted-foreground sm:block">
          {ehMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>
      <NotificationsMenu />
      <Dica texto={rotuloSom}>
        <button
          type="button"
          onClick={alternarMudo}
          aria-label={rotuloSom}
          aria-pressed={mudo}
          className="vidro vidro-clicavel flex size-11 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
        >
          {mudo ? <VolumeX className="size-[18px]" strokeWidth={1.5} aria-hidden="true" /> : <Volume2 className="size-[18px]" strokeWidth={1.5} aria-hidden="true" />}
        </button>
      </Dica>
      <div className="md:hidden">
        <UserMenu />
      </div>
    </header>
  );
}
