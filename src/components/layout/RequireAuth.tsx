import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppStore } from "@/lib/store";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { logado } = useAppStore();
  const location = useLocation();
  if (!logado) return <Navigate to="/login" replace state={{ de: location.pathname + location.search }} />;
  return <>{children}</>;
}
