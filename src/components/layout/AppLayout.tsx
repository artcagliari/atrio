import { Outlet } from "react-router-dom";
import { AvisoWhatsApp } from "./AvisoWhatsApp";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

/** Moldura das telas principais: barra lateral, topo e conteúdo. */
export function AppLayout() {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-full bg-latao px-4 py-2 text-apoio text-tinta focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>
      <Sidebar />
      <div className="px-4 pb-32 sm:px-8 md:pb-16 md:pl-[104px] lg:pl-[272px] lg:pr-12">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-10">
          <TopBar />
          <AvisoWhatsApp />
          <main id="conteudo" tabIndex={-1} className="focus-visible:outline-none">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileNav />
    </>
  );
}
