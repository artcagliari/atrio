import { Toaster as Sonner } from "sonner";

/** Toasts em vidro, canto superior direito. */
export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      closeButton
      offset={24}
      gap={12}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "vidro-leitura flex w-[372px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl p-4 pr-11 font-sans text-foreground",
          title: "text-apoio font-medium",
          description: "mt-0.5 text-apoio text-muted-foreground",
          icon: "mt-[3px] flex size-4 items-center justify-center",
          actionButton:
            "ml-auto shrink-0 self-center rounded-full bg-white/[0.14] px-4 py-2 text-micro font-medium text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] transition-colors hover:bg-white/[0.22]",
          cancelButton: "shrink-0 self-center rounded-full px-3 py-2 text-micro text-muted-foreground hover:text-foreground",
          closeButton:
            "!absolute !left-auto !right-3 !top-3 !size-6 !transform-none !rounded-full !border-0 !bg-transparent !text-muted-foreground hover:!bg-white/10 hover:!text-foreground",
        },
      }}
    />
  );
}
