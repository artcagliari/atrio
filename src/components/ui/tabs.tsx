import * as TabsPrimitive from "@radix-ui/react-tabs";
import { forwardRef, useCallback, useLayoutEffect, useRef, useState, type ComponentPropsWithoutRef, type ElementRef } from "react";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

/** Controle segmentado de vidro com indicador deslizante. */
export const TabsList = forwardRef<ElementRef<typeof TabsPrimitive.List>, ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
  ({ className, children, ...props }, ref) => {
    const interno = useRef<HTMLDivElement | null>(null);
    const [indicador, setIndicador] = useState<{ left: number; width: number } | null>(null);

    const setRefs = useCallback(
      (el: HTMLDivElement | null) => {
        interno.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      },
      [ref],
    );

    useLayoutEffect(() => {
      const el = interno.current;
      if (!el) return;
      const medir = () => {
        const ativo = el.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
        setIndicador(ativo ? { left: ativo.offsetLeft, width: ativo.offsetWidth } : null);
      };
      medir();
      const mo = new MutationObserver(medir);
      mo.observe(el, { subtree: true, attributes: true, attributeFilter: ["data-state"] });
      const ro = new ResizeObserver(medir);
      ro.observe(el);
      return () => {
        mo.disconnect();
        ro.disconnect();
      };
    }, []);

    return (
      <TabsPrimitive.List ref={setRefs} className={cn("vidro-leve inline-flex items-center rounded-full p-1", className)} {...props}>
        {indicador && (
          <span
            aria-hidden="true"
            className="absolute bottom-1 top-1 rounded-full border border-white/20 bg-white/[0.08] shadow-[inset_0_1px_0_rgb(255_255_255/0.3)] transition-[left,width] duration-300 ease-suave"
            style={{ left: indicador.left, width: indicador.width }}
          />
        )}
        {children}
      </TabsPrimitive.List>
    );
  },
);
TabsList.displayName = "TabsList";

export const TabsTrigger = forwardRef<ElementRef<typeof TabsPrimitive.Trigger>, ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "relative z-10 inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 text-apoio text-muted-foreground transition-colors duration-200 hover:text-foreground disabled:pointer-events-none data-[state=active]:text-foreground",
        className,
      )}
      {...props}
    />
  ),
);
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = forwardRef<ElementRef<typeof TabsPrimitive.Content>, ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      className={cn("focus-visible:outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-300", className)}
      {...props}
    />
  ),
);
TabsContent.displayName = "TabsContent";
