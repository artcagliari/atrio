/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "false" esconde o botão "Simular atendimento urgente" no build */
  readonly VITE_DEV_TOOLS?: string;
}
