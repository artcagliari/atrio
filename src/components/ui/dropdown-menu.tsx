import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuRadioGroup = DropdownPrimitive.RadioGroup;

export const DropdownMenuContent = forwardRef<ElementRef<typeof DropdownPrimitive.Content>, ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>>(
  ({ className, sideOffset = 10, ...props }, ref) => (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "vidro-leitura z-50 min-w-[15rem] overflow-hidden rounded-2xl p-1.5 text-foreground data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.97] data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          className,
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  ),
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const itemBase =
  "relative flex cursor-default select-none items-center gap-3 rounded-xl px-3 py-2.5 text-apoio outline-none transition-colors focus:bg-white/[0.12] data-[disabled]:pointer-events-none data-[disabled]:text-terciario [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:text-muted-foreground";

export const DropdownMenuItem = forwardRef<ElementRef<typeof DropdownPrimitive.Item>, ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>>(
  ({ className, ...props }, ref) => <DropdownPrimitive.Item ref={ref} className={cn(itemBase, className)} {...props} />,
);
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuRadioItem = forwardRef<ElementRef<typeof DropdownPrimitive.RadioItem>, ComponentPropsWithoutRef<typeof DropdownPrimitive.RadioItem>>(
  ({ className, children, ...props }, ref) => (
    <DropdownPrimitive.RadioItem ref={ref} className={cn(itemBase, "pl-9", className)} {...props}>
      <span className="absolute left-3 flex size-4 items-center justify-center">
        <DropdownPrimitive.ItemIndicator>
          <Check className="!text-foreground" strokeWidth={1.5} aria-hidden="true" />
        </DropdownPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownPrimitive.RadioItem>
  ),
);
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

export const DropdownMenuLabel = forwardRef<ElementRef<typeof DropdownPrimitive.Label>, ComponentPropsWithoutRef<typeof DropdownPrimitive.Label>>(
  ({ className, ...props }, ref) => <DropdownPrimitive.Label ref={ref} className={cn("px-3 pb-2 pt-2.5 text-micro text-muted-foreground", className)} {...props} />,
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export function DropdownMenuSeparator() {
  return <DropdownPrimitive.Separator className="mx-2 my-1.5 h-px bg-white/[0.08]" />;
}
