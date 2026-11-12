import * as SwitchPrimitive from "@radix-ui/react-switch";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import { cn } from "@/lib/utils";

export const Switch = forwardRef<ElementRef<typeof SwitchPrimitive.Root>, ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        "peer inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-white/20 transition-colors duration-200 disabled:cursor-not-allowed data-[state=checked]:border-transparent data-[state=checked]:bg-foreground data-[state=unchecked]:bg-white/[0.08]",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-[18px] rounded-full bg-foreground/85 shadow transition-transform duration-200 ease-out data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-tinta data-[state=unchecked]:translate-x-0.5" />
    </SwitchPrimitive.Root>
  ),
);
Switch.displayName = "Switch";
