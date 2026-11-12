import { Loader2, QrCode, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { StatusConexao } from "@/lib/types";

interface Props {
  status: StatusConexao;
  numero: string;
  onConectado: () => void;
  onDesconectar?: () => void;
}

/** Status da conexão: ponto (cheio = conectado, vazado = desconectado) + texto. Sem cor. */
export function ConexaoBadge({ status }: { status: StatusConexao }) {
  const config = {
    conectado: { ponto: "bg-foreground shadow-[0_0_10px_rgb(255_255_255/0.6)]", texto: "Conectado" },
    conectando: { ponto: "bg-foreground/60 animate-pulse", texto: "Conectando" },
    desconectado: { ponto: "border border-white/60", texto: "Desconectado" },
  }[status];
  return (
    <span className="inline-flex items-center gap-2 text-apoio">
      <span className={`size-2 rounded-full ${config.ponto}`} aria-hidden="true" />
      {config.texto}
    </span>
  );
}

/** Status do número e fluxo (simulado) de conexão por QR Code. */
export function WhatsappConnect({ status, numero, onConectado, onDesconectar }: Props) {
  const [aberto, setAberto] = useState(false);
  const [lendo, setLendo] = useState(false);

  useEffect(() => {
    if (!lendo) return;
    const t = setTimeout(() => {
      setLendo(false);
      setAberto(false);
      onConectado();
      toast.success("WhatsApp conectado", { description: "O assistente já pode responder novos contatos." });
    }, 1600);
    return () => clearTimeout(t);
  }, [lendo, onConectado]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Smartphone className="hidden size-6 shrink-0 text-muted-foreground sm:block" strokeWidth={1.5} aria-hidden="true" />
        <div className="flex flex-1 flex-col gap-1">
          <p className="font-mono text-corpo">{numero || "Nenhum número"}</p>
          <ConexaoBadge status={status} />
        </div>
        {status === "conectado" ? (
          onDesconectar && (
            <Button variant="vidro" onClick={onDesconectar}>
              Desconectar
            </Button>
          )
        ) : (
          <Button variant="latao" onClick={() => setAberto(true)}>
            <QrCode strokeWidth={1.5} aria-hidden="true" /> Conectar número
          </Button>
        )}
      </div>

      <Dialog open={aberto} onOpenChange={(v) => !lendo && setAberto(v)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              No celular do escritório, abra o WhatsApp Business → Aparelhos conectados → Conectar um aparelho e aponte a câmera para o código.
            </DialogDescription>
          </DialogHeader>
          <div className="mx-auto rounded-2xl bg-white p-5">
            <QrFicticio />
          </div>
          <DialogFooter>
            <Button variant="texto" onClick={() => setAberto(false)} disabled={lendo}>
              Cancelar
            </Button>
            <Button variant="latao" onClick={() => setLendo(true)} disabled={lendo}>
              {lendo && <Loader2 className="animate-spin" aria-hidden="true" />}
              {lendo ? "Conectando…" : "Simular leitura do código"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Padrão visual de QR apenas ilustrativo (não é um QR válido). */
function QrFicticio() {
  const celulas = useMemo(() => {
    const n = 25;
    const r: [number, number][] = [];
    let s = 7;
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        s = (s * 9301 + 49297) % 233280;
        const marcador = (x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17);
        if (!marcador && s / 233280 > 0.52) r.push([x, y]);
      }
    return r;
  }, []);
  const Marcador = ({ x, y }: { x: number; y: number }) => (
    <>
      <rect x={x} y={y} width={7} height={7} fill="#0B1215" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="#0B1215" />
    </>
  );
  return (
    <svg viewBox="0 0 25 25" className="size-48" role="img" aria-label="Código QR para conectar o WhatsApp (ilustrativo)" shapeRendering="crispEdges">
      {celulas.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0B1215" />
      ))}
      <Marcador x={0} y={0} />
      <Marcador x={18} y={0} />
      <Marcador x={0} y={18} />
    </svg>
  );
}
