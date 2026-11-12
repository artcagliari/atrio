import { CalendarDays, Filter, Inbox, Settings, type LucideIcon } from "lucide-react";

export interface ItemNav {
  to: string;
  rotulo: string;
  icone: LucideIcon;
  /** Prefixo usado para marcar o item como ativo */
  base: string;
  contadorUrgentes?: boolean;
}

export const ITENS_NAV: ItemNav[] = [
  { to: "/atendimentos", base: "/atendimentos", rotulo: "Atendimentos", icone: Inbox, contadorUrgentes: true },
  { to: "/funil", base: "/funil", rotulo: "Funil de triagem", icone: Filter },
  { to: "/agenda", base: "/agenda", rotulo: "Agenda", icone: CalendarDays },
  { to: "/configuracoes/empresa", base: "/configuracoes", rotulo: "Configurações", icone: Settings },
];
