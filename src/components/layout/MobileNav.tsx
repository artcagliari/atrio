import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ITENS_NAV } from "./navegacao";
import { UrgentCounter } from "./UrgentCounter";

/** Navegação inferior flutuante (celular). */
export function MobileNav() {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Principal" className="fixed inset-x-0 bottom-4 z-30 flex justify-center pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="vidro flex gap-1 rounded-full p-1.5">
        {ITENS_NAV.map((item) => {
          const ativo = pathname.startsWith(item.base);
          const Icone = item.icone;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                aria-current={ativo ? "page" : undefined}
                aria-label={item.rotulo}
                className={cn(
                  "relative flex size-12 items-center justify-center rounded-full transition-colors",
                  ativo ? "bg-white/[0.15] text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icone className="size-[18px]" strokeWidth={1.5} aria-hidden="true" />
                {ativo && <span aria-hidden="true" className="absolute bottom-1.5 h-0.5 w-4 rounded-full bg-latao" />}
                {item.contadorUrgentes && <UrgentCounter className="absolute -right-0.5 top-0" />}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
