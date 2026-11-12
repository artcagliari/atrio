import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import { cn } from "@/lib/utils";

export const RadioGroup = forwardRef<ElementRef<typeof RadioGroupPrimitive.Root>, ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>>(
  ({ className, ...props }, ref) => <RadioGroupPrimitive.Root ref={ref} className={cn("grid gap-3", className)} {...props} />,
);
RadioGroup.displayName = "RadioGroup";

/** Opção em cartão de vidro selecionável. Selecionado = vidro mais claro + borda acesa (sem cor). */
export const RadioCard = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & { titulo: string; descricao?: string }
>(({ className, titulo, descricao, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "vidro-leve vidro-clicavel group flex w-full items-start gap-3.5 rounded-2xl p-5 text-left disabled:cursor-not-allowed disabled:hover:translate-y-0 data-[state=checked]:!border-white/50",
      className,
    )}
    {...props}
  >
    <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border border-white/40 group-data-[state=checked]:border-foreground">
      <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-foreground" />
    </span>
    <span className="flex flex-col gap-1">
      <span className="text-corpo font-medium">{titulo}</span>
      {descricao && <span className="text-apoio leading-relaxed text-muted-foreground">{descricao}</span>}
    </span>
  </RadioGroupPrimitive.Item>
));
RadioCard.displayName = "RadioCard";
