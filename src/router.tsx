import type { ComponentType } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AreaLogada } from "@/components/layout/AreaLogada";

/** Carrega cada página sob demanda para manter o pacote inicial leve. */
const pagina = (carregar: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await carregar()).default,
});

export const router = createBrowserRouter([
  { path: "/login", lazy: pagina(() => import("@/pages/Login")) },
  { path: "/onboarding", lazy: pagina(() => import("@/pages/Onboarding")) },
  {
    element: <AreaLogada />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/atendimentos", lazy: pagina(() => import("@/pages/Atendimentos")) },
          { path: "/funil", lazy: pagina(() => import("@/pages/Funil")) },
          { path: "/agenda", lazy: pagina(() => import("@/pages/Agenda")) },
          { path: "/configuracoes", element: <Navigate to="/configuracoes/empresa" replace /> },
          { path: "/configuracoes/:secao", lazy: pagina(() => import("@/pages/Configuracoes")) },
        ],
      },
      // Relatório sem barra lateral, para ler e imprimir como documento
      { path: "/relatorio/:id", lazy: pagina(() => import("@/pages/Relatorio")) },
    ],
  },
  { path: "*", element: <Navigate to="/atendimentos" replace /> },
]);
