import { Building2, Clock, Gauge, LayoutTemplate, ListChecks, MessageCircle, ShieldBan, Siren, type LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import { Navigate, NavLink, useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import Assistente from "./Assistente";
import Empresa from "./Empresa";
import Horarios from "./Horarios";
import Limites from "./Limites";
import Modelo from "./Modelo";
import Roteiros from "./Roteiros";
import Urgencia from "./Urgencia";
import WhatsApp from "./WhatsApp";

interface Secao {
  id: string;
  rotulo: string;
  icone: LucideIcon;
  Componente: ComponentType;
}

export const SECOES: Secao[] = [
  { id: "empresa", rotulo: "Empresa", icone: Building2, Componente: Empresa },
  { id: "modelo", rotulo: "Modelo", icone: LayoutTemplate, Componente: Modelo },
  { id: "roteiros", rotulo: "Roteiros", icone: ListChecks, Componente: Roteiros },
  { id: "urgencia", rotulo: "Urgência", icone: Siren, Componente: Urgencia },
  { id: "horarios", rotulo: "Horários", icone: Clock, Componente: Horarios },
  { id: "assistente", rotulo: "Assistente", icone: Gauge, Componente: Assistente },
  { id: "limites", rotulo: "Limites", icone: ShieldBan, Componente: Limites },
  { id: "whatsapp", rotulo: "WhatsApp", icone: MessageCircle, Componente: WhatsApp },
];

export default function Configuracoes() {
  const { secao } = useParams();
  const atual = SECOES.find((s) => s.id === secao);
  if (!atual) return <Navigate to="/configuracoes/empresa" replace />;
  const { Componente } = atual;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader titulo="Configurações" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <nav aria-label="Seções de configuração" className="lg:sticky lg:top-6 lg:w-60 lg:shrink-0">
          <ul className="vidro scrollbar-fina flex gap-1 overflow-x-auto rounded-3xl p-2 lg:flex-col lg:overflow-visible">
            {SECOES.map((s) => {
              const Icone = s.icone;
              const ativo = s.id === atual.id;
              return (
                <li key={s.id} className="shrink-0">
                  <NavLink
                    to={`/configuracoes/${s.id}`}
                    aria-current={ativo ? "page" : undefined}
                    className={cn(
                      "relative flex h-11 items-center gap-3 rounded-2xl px-4 text-apoio transition-colors duration-200",
                      ativo ? "bg-white/[0.15] text-foreground" : "text-muted-foreground hover:bg-white/[0.07] hover:text-foreground",
                    )}
                  >
                    {ativo && <span aria-hidden="true" className="absolute inset-y-3 left-0 hidden w-0.5 rounded-full bg-latao lg:block" />}
                    <Icone className="size-[18px]" strokeWidth={1.5} aria-hidden="true" />
                    {s.rotulo}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div key={atual.id} className="min-w-0 flex-1 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
          <Componente />
        </div>
      </div>
    </div>
  );
}
