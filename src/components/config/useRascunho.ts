import { useEffect, useMemo, useState } from "react";

/**
 * Cópia editável de um valor do store. `alterado` indica mudanças não salvas.
 * Quando o valor original muda (ex.: após salvar), o rascunho é reiniciado.
 */
export function useRascunho<T>(original: T) {
  const [rascunho, setRascunho] = useState<T>(original);
  useEffect(() => setRascunho(original), [original]);
  const alterado = useMemo(() => JSON.stringify(rascunho) !== JSON.stringify(original), [rascunho, original]);
  return { rascunho, setRascunho, alterado, descartar: () => setRascunho(original) };
}
