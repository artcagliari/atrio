import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-full text-apoio font-medium transition-[background-color,transform,box-shadow,color] duration-200 ease-out [&_svg]:pointer-events-none [&_svg]:size-[18px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Latão com texto escuro — ação principal (uso raro) */
        latao:
          "bg-latao text-tinta shadow-[0_10px_30px_-12px_rgb(201_164_106/0.7),inset_0_1px_0_rgb(255_255_255/0.45)] hover:-translate-y-0.5 hover:bg-[#d4b27c] active:translate-y-0 disabled:pointer-events-none disabled:bg-white/[0.08] disabled:text-terciario disabled:shadow-none",
        /** Vidro */
        vidro:
          "vidro vidro-clicavel text-foreground disabled:pointer-events-none disabled:text-terciario disabled:hover:translate-y-0",
        /** Só texto */
        texto:
          "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground disabled:pointer-events-none disabled:text-terciario",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4",
        lg: "h-12 px-7 text-corpo",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: { variant: "vidro", size: "default" },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
Button.displayName = "Button";

export { buttonVariants };
