import { Building2, FlaskConical, LogOut, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArcoInicial } from "@/components/ui/arco";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { gerarAtendimentoUrgente } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Ferramentas de desenvolvimento ficam visíveis enquanto não houver back-end. */
export const MOSTRAR_FERRAMENTAS_DEV = import.meta.env.DEV || import.meta.env.VITE_DEV_TOOLS !== "false";

export function UserMenu({ comNome = false, className }: { comNome?: boolean; className?: string }) {
  const { usuario, empresa, sair, adicionarAtendimento } = useAppStore();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn("flex items-center gap-3 rounded-2xl p-1 text-left transition-colors hover:bg-white/[0.06]", className)}
        aria-label={`Menu de ${usuario.nome}`}
      >
        <ArcoInicial nome={usuario.nome} />
        {comNome && (
          <span className="flex min-w-0 flex-col whitespace-nowrap">
            <span className="truncate text-apoio">{usuario.nome}</span>
            <span className="truncate text-micro text-muted-foreground">{empresa.nome}</span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-64">
        <div className="px-3 pb-2 pt-3">
          <p className="text-apoio font-medium">{usuario.nome}</p>
          <p className="truncate text-micro text-muted-foreground">{usuario.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/configuracoes/empresa")}>
          <Building2 strokeWidth={1.5} aria-hidden="true" /> Dados da empresa
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate("/onboarding")}>
          <Rocket strokeWidth={1.5} aria-hidden="true" /> Refazer configuração inicial
        </DropdownMenuItem>
        {MOSTRAR_FERRAMENTAS_DEV && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Desenvolvimento</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => adicionarAtendimento(gerarAtendimentoUrgente())}>
              <FlaskConical strokeWidth={1.5} aria-hidden="true" /> Simular atendimento urgente
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            sair();
            navigate("/login");
          }}
        >
          <LogOut strokeWidth={1.5} aria-hidden="true" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
