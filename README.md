# Átrio — front-end

Plataforma SaaS multiempresa: cada empresa configura um assistente de IA no WhatsApp que faz o primeiro atendimento e entrega os contatos organizados num painel. Primeiro modelo de segmento: **Advocacia — triagem de leads**.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de produção
```

Login de demonstração já vem preenchido (qualquer e-mail válido e senha com 6+ caracteres).

## Stack

React 18 + Vite + TypeScript · Tailwind CSS 3 + tailwindcss-animate · componentes no padrão shadcn/ui (Radix) · lucide-react · sonner · react-router-dom · @dnd-kit (reordenar perguntas com mouse, toque e teclado) · fontes Instrument Serif, Geist e Geist Mono.

## Estrutura

```
src/
  pages/            Login, Atendimentos, Agenda, Onboarding, Configuracoes/* (uma seção por arquivo)
  components/ui     Componentes base (shadcn) + GlassCard (variantes "leve" e "opaco")
  components/layout Sidebar, MobileNav, TopBar, AppLayout, fundo com luzes difusas
  components/atendimentos  LeadCard, LeadSheet, ChatView, StatusBadge, UrgencyBadge, agenda
  components/config RoteiroEditor, HorariosForm, PalavrasChaveInput, WhatsappConnect…
  hooks/            useUrgentAlerts, useTheme, useAgora
  lib/              types.ts, mock-data.ts, store.tsx (estado + ações), utils.ts, agenda.ts
  router.tsx        /login, /atendimentos, /agenda, /configuracoes/:secao, /onboarding
public/sounds/      alerta-urgente.wav (gerado por scripts/gerar-som.mjs)
```

## Trocando o mock por API

- `src/lib/mock-data.ts` concentra os dados; `src/lib/store.tsx` expõe as ações (`marcarContatado`, `agendarConsulta`, `salvarAreas`…). Cada ação corresponde a uma chamada de API — troque a implementação mantendo a assinatura.
- Alertas de urgência (`useUrgentAlerts`) observam a lista de atendimentos: qualquer atendimento urgente novo que entrar no store (ex.: via WebSocket) dispara toast, som, contador e notificação do navegador.

## Identidade visual

**Conceito:** o átrio romano, aberto no teto, por onde a luz entra. A identidade junta luz entrando, arco/portal, vidro e calma.

- **Fundo** (`BackgroundLights`): base em azul petróleo profundo, com quatro luzes intensas e desfocadas: ciano no topo, petróleo à esquerda, âmbar embaixo à direita e azul-esverdeado embaixo à esquerda. As luzes derivam devagar e têm um grão fino por cima. Com `prefers-reduced-motion`, ficam paradas.
- **Vidro** (`GlassCard`): três níveis, `leve` (`.vidro-leve`), `medio` (`.vidro`) e `leitura` (`.vidro-leitura`). Todos têm borda com brilho no topo, reflexo diagonal e sombra grande. O hover usa `.vidro-clicavel`. O vidro dentro de outro vidro não aplica um segundo `backdrop-filter`, porque isso clareia a camada em vez de refratar.
- **Cores:** latão `#C9A46A` é a cor da marca e aparece pouco (logo, item ativo, botão principal, um número de destaque). O vermelho `#E5484D` é exclusivo do ponto de urgência. Não há nenhuma outra cor.
- **Tipografia:** Instrument Serif nos títulos, na saudação, no nome do cliente e nos números. Geist no restante da interface. Geist Mono em horários, telefones e contadores.
- **Contraste:** o AA foi medido no navegador sobre o vidro com as luzes acesas, em todos os estados. Para passar, foi preciso:
  - subir o texto secundário para 82% e o terciário para 66% (o pedido era 65% e 45%);
  - deixar o vidro levemente fumê com `brightness()` no `backdrop-filter`: 0,85 nos níveis leve e médio, 0,72 no nível leitura;
  - colocar as luzes no piso da faixa pedida (45–55%).
- **Tema único:** não há mais tema claro.

## Paleta de comandos

Use **Ctrl/Cmd+K**, ou a pílula "Buscar", para procurar clientes, telas e ações (silenciar o som, ativar notificações, simular atendimento urgente, refazer o onboarding, sair). As setas navegam e o Enter executa.

## Alertas de urgência

1. Toast no canto superior direito com botão **Abrir**.
2. Som discreto. Os navegadores só tocam áudio após a primeira interação com a página. O **silenciar** fica na pílula de som do topo, e a preferência é salva.
3. Contador vermelho no ícone de **Atendimentos** (urgentes ainda sem retorno da equipe).
4. Notificação do navegador. A permissão é pedida por um toast discreto, que aparece uma única vez, e a API só é chamada ao clicar em "Ativar". Se for negada, o sino mostra como liberar.

Para testar sem back-end, use **Simular atendimento urgente** no menu do avatar (rodapé da barra lateral) ou na paleta de comandos. A opção aparece em desenvolvimento e, enquanto não houver back-end, também no build; defina `VITE_DEV_TOOLS=false` para escondê-la.
