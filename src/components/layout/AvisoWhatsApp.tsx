import { WifiOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppStore } from "@/lib/store";

/** Faixa fixa quando o WhatsApp está desconectado: o assistente não atende ninguém nesse estado. */
export function AvisoWhatsApp() {
  const { empresa } = useAppStore();
  if (empresa.statusConexao === "conectado") return null;
  return (
    <div role="status" className="vidro flex flex-col gap-3 rounded-2xl px-5 py-4 sm:flex-row sm:items-center">
      <WifiOff className="hidden size-[18px] shrink-0 text-muted-foreground sm:block" strokeWidth={1.5} aria-hidden="true" />
      <p className="flex-1 text-apoio">
        <span className="font-medium">Assistente pausado.</span>{" "}
        <span className="text-muted-foreground">O WhatsApp está desconectado e novos clientes não estão sendo atendidos.</span>
      </p>
      <Link to="/configuracoes/whatsapp" className="rounded-full bg-latao px-4 py-2 text-center text-apoio font-medium text-tinta transition-colors hover:bg-[#d4b27c]">
        Conectar WhatsApp
      </Link>
    </div>
  );
}
