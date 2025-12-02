import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:shadow-glow hover:scale-105 active:scale-95 transition-all duration-300",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95",
        outline: "border border-border bg-transparent text-foreground hover:bg-secondary hover:text-secondary-foreground active:scale-95",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-95",
        link: "text-primary underline-offset-4 hover:underline",
        gaming: "bg-gradient-primary text-primary-foreground hover:shadow-glow hover:scale-105 active:scale-95 border border-primary/20 font-bold tracking-wide transition-all duration-300",
        gold: "bg-gradient-gold text-accent-foreground hover:shadow-gold hover:scale-105 active:scale-95 border border-accent/20 font-bold tracking-wide transition-all duration-300",
        diamond: "bg-gradient-diamond text-diamond-foreground hover:shadow-diamond hover:scale-105 active:scale-95 border border-diamond/20 font-bold tracking-wide transition-all duration-300",
        hero: "bg-gradient-primary text-primary-foreground hover:shadow-glow hover:scale-110 active:scale-95 border border-primary/30 font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 tracking-wide transition-all duration-500 animate-pulse-glow",
      },
      size: {
        default: "h-10 sm:h-11 px-4 sm:px-5 py-2 text-sm sm:text-base min-w-[44px] touch-manipulation",
        sm: "h-9 sm:h-10 rounded-md px-3 sm:px-4 text-sm min-w-[40px] touch-manipulation",
        lg: "h-12 sm:h-14 rounded-lg px-6 sm:px-8 text-base sm:text-lg min-w-[48px] touch-manipulation",
        xl: "h-14 sm:h-16 rounded-lg px-8 sm:px-12 text-lg sm:text-xl min-w-[52px] touch-manipulation",
        icon: "h-10 w-10 sm:h-11 sm:w-11 min-w-[44px] touch-manipulation",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
