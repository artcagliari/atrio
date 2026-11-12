import { useEffect, useState } from "react";

/** Retorna o horário atual, atualizado a cada `intervaloMs` (padrão: 1 minuto). */
export function useAgora(intervaloMs = 60_000) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);
  return agora;
}
