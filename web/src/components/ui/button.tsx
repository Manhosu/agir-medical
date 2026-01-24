import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border border-border bg-transparent hover:bg-muted hover:border-primary/50 text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Hero CTA button with glow effect
        hero: "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        // Secondary hero button
        heroOutline: "border-2 border-primary/50 bg-transparent text-foreground hover:bg-primary/10 hover:border-primary shadow-lg shadow-primary/10",
        // CTA button - checkout/plans
        cta: "bg-gradient-to-r from-[hsl(175,80%,50%)] to-[hsl(175,80%,60%)] text-[hsl(220,30%,6%)] font-bold shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300",
        // Premium CTA button with gold gradient
        ctaPremium: "bg-gradient-to-r from-[hsl(45,93%,58%)] to-[hsl(35,93%,55%)] text-[hsl(220,30%,6%)] font-bold shadow-lg shadow-[hsl(45,93%,58%)]/40 hover:shadow-[hsl(45,93%,58%)]/60 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-lg px-8 text-base has-[>svg]:px-6",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
