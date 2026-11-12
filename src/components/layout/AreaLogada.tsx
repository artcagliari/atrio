import { Outlet } from "react-router-dom";
import { TriagemAoVivoProvider } from "@/hooks/useTriagemAoVivo";
import { UrgentAlertsProvider } from "@/hooks/useUrgentAlerts";
import { CommandPaletteProvider } from "./CommandPalette";
import { RequireAuth } from "./RequireAuth";

/**
 * Serviços da área logada (alertas, triagem ao vivo, paleta de comandos).
 * Ficam acima das telas para continuarem rodando ao abrir o relatório, que não usa a barra lateral.
 */
export function AreaLogada() {
  return (
    <RequireAuth>
      <UrgentAlertsProvider>
        <TriagemAoVivoProvider>
          <CommandPaletteProvider>
            <Outlet />
          </CommandPaletteProvider>
        </TriagemAoVivoProvider>
      </UrgentAlertsProvider>
    </RequireAuth>
  );
}
