import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { ITENS_NAV } from "./navegacao";
import { UrgentCounter } from "./UrgentCounter";
import { UserMenu } from "./UserMenu";

/** Rótulos sempre visíveis em telas largas; em telas médias, só ícones (expande no hover/foco). */
const rotulo =
  "whitespace-nowrap opacity-0 transition-opacity duration-200 ease-out group-hover/lateral:opacity-100 group-focus-within/lateral:opacity-100 lg:opacity-100";

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="vidro group/lateral fixed bottom-4 left-4 top-4 z-30 hidden w-[72px] flex-col overflow-hidden rounded-3xl transition-[width] duration-300 ease-suave hover:w-[240px] focus-within:w-[240px] md:flex lg:w-[232px] lg:hover:w-[232px] lg:focus-within:w-[232px]">
      <div className="flex h-[84px] items-center gap-3 pl-5">
        <Logo variant="mark" />
        <span className={cn("font-serif text-[22px] leading-none", rotulo)} aria-hidden="true">
          Átrio
        </span>
      </div>

      <nav aria-label="Principal" className="flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {ITENS_NAV.map((item) => {
            const ativo = pathname.startsWith(item.base);
            const Icone = item.icone;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  aria-current={ativo ? "page" : undefined}
                  className={cn(
                    "relative flex h-11 items-center gap-4 rounded-2xl px-[15px] text-apoio transition-colors duration-200",
                    ativo ? "bg-white/[0.15] font-medium text-foreground" : "text-muted-foreground hover:bg-white/[0.07] hover:text-foreground",
                  )}
                >
                  {ativo && <span aria-hidden="true" className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-latao" />}
                  <span className="relative flex shrink-0">
                    <Icone className="size-[18px]" strokeWidth={1.5} aria-hidden="true" />
                    {item.contadorUrgentes && <UrgentCounter className="absolute -right-4 -top-3 lg:hidden" />}
                  </span>
                  <span className={cn("flex-1", rotulo)}>{item.rotulo}</span>
                  {item.contadorUrgentes && <UrgentCounter className="hidden lg:inline-flex" />}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3">
        <UserMenu
          comNome
          className="w-full [&>span:last-child]:opacity-0 [&>span:last-child]:transition-opacity group-hover/lateral:[&>span:last-child]:opacity-100 group-focus-within/lateral:[&>span:last-child]:opacity-100 lg:[&>span:last-child]:opacity-100"
        />
      </div>
    </aside>
  );
}
