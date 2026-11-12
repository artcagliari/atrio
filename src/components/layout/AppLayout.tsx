import { Outlet } from "react-router-dom";
import { UrgentAlertsProvider } from "@/hooks/useUrgentAlerts";
import { CommandPaletteProvider } from "./CommandPalette";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppLayout() {
  return (
    <UrgentAlertsProvider>
      <CommandPaletteProvider>
        <a
          href="#conteudo"
          className="sr-only z-50 rounded-full bg-latao px-4 py-2 text-apoio text-tinta focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Pular para o conteúdo
        </a>
        <Sidebar />
        <div className="px-4 pb-32 sm:px-8 md:pb-16 md:pl-[104px] lg:px-12 lg:pl-[136px]">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-10">
            <TopBar />
            <main id="conteudo" tabIndex={-1} className="focus-visible:outline-none">
              <Outlet />
            </main>
          </div>
        </div>
        <MobileNav />
      </CommandPaletteProvider>
    </UrgentAlertsProvider>
  );
}
