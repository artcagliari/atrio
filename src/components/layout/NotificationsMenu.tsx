import { Bell, BellRing } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUrgentAlerts } from "@/hooks/useUrgentAlerts";
import { tempoRelativo } from "@/lib/utils";

/** Sino: alertas urgentes recebidos nesta sessão. */
export function NotificationsMenu() {
  const { alertas, naoLidos, marcarTodosLidos, abrirAtendimento, permissao, pedirPermissao } = useUrgentAlerts();

  return (
    <DropdownMenu onOpenChange={(aberto) => !aberto && naoLidos > 0 && marcarTodosLidos()}>
      <DropdownMenuTrigger
        className="vidro vidro-clicavel relative flex size-11 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
        aria-label={naoLidos > 0 ? `Notificações: ${naoLidos} não lidas` : "Notificações"}
      >
        <Bell className="size-[18px]" strokeWidth={1.5} aria-hidden="true" />
        {naoLidos > 0 && <span className="absolute right-[11px] top-[11px] size-2 rounded-full bg-urgente ring-2 ring-[#05141a]/60" aria-hidden="true" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem]">
        <DropdownMenuLabel>Alertas</DropdownMenuLabel>
        {alertas.length === 0 ? (
          <p className="px-3 pb-5 pt-1 text-apoio text-muted-foreground">Nenhum alerta por enquanto.</p>
        ) : (
          <div className="scrollbar-fina max-h-80 overflow-y-auto">
            {alertas.map((a) => (
              <DropdownMenuItem key={a.id} onSelect={() => abrirAtendimento(a.atendimentoId)} className="items-start">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-urgente" aria-hidden="true" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate">{a.nome}</span>
                    <span className="shrink-0 font-mono text-micro text-muted-foreground">{tempoRelativo(a.em)}</span>
                  </span>
                  <span className="text-micro text-muted-foreground">
                    <span className="sr-only">Urgente: </span>
                    {a.motivo}
                  </span>
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        {permissao === "default" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void pedirPermissao()}>
              <BellRing strokeWidth={1.5} aria-hidden="true" /> Ativar notificações do navegador
            </DropdownMenuItem>
          </>
        )}
        {permissao === "denied" && (
          <>
            <DropdownMenuSeparator />
            <p className="px-3 py-2.5 text-micro leading-relaxed text-muted-foreground">
              Notificações do navegador bloqueadas. Libere nas configurações do site para receber avisos fora da aba.
            </p>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
