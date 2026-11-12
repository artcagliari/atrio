import type { ComponentType } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/components/layout/RequireAuth";

/** Carrega cada página sob demanda para manter o pacote inicial leve. */
const pagina = (carregar: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await carregar()).default,
});

export const router = createBrowserRouter([
  { path: "/login", lazy: pagina(() => import("@/pages/Login")) },
  { path: "/onboarding", lazy: pagina(() => import("@/pages/Onboarding")) },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { path: "/atendimentos", lazy: pagina(() => import("@/pages/Atendimentos")) },
      { path: "/agenda", lazy: pagina(() => import("@/pages/Agenda")) },
      { path: "/configuracoes", element: <Navigate to="/configuracoes/empresa" replace /> },
      { path: "/configuracoes/:secao", lazy: pagina(() => import("@/pages/Configuracoes")) },
    ],
  },
  { path: "*", element: <Navigate to="/atendimentos" replace /> },
]);
