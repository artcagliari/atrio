import type { RefObject } from "react";

/**
 * Ao fechar um diálogo aberto de dentro de outro painel: devolve o foco ao botão de origem;
 * se ele não existe mais (ex.: a ação mudou a etapa e o botão sumiu), foca o painel que segue aberto.
 */
export function devolverFoco(e: Event, origem?: RefObject<HTMLElement>) {
  const alvo = origem?.current;
  if (alvo?.isConnected) {
    e.preventDefault();
    alvo.focus();
    return;
  }
  const painel = document.querySelector<HTMLElement>('[role="dialog"][data-state="open"]');
  if (painel) {
    e.preventDefault();
    painel.focus();
  }
}
