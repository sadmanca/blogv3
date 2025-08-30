import * as React from 'react'
import { Slot as SlotPrimitive } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 
          'bg-primary text-primary-foreground hover:bg-primary/90',
          // 'bg-gradient-to-r from-tertiary to-primary text-primary-foreground hover:from-tertiary/90 hover:to-primary/90 shadow-colored hover:shadow-glow transition-all duration-0',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border border-border/50 bg-background hover:bg-gradient-to-r hover:from-tertiary/10 hover:to-primary/10 hover:border-tertiary/30 hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 transition-all duration-0',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          // 'bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/90 hover:to-secondary/70 shadow-sm hover:shadow-md transition-all duration-0',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
          // 'hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 hover:text-accent-foreground dark:hover:bg-accent/50 transition-all duration-0',
        link: 
          'text-primary underline-offset-4 hover:underline',
          // 'text-primary underline-offset-4 hover:underline bg-gradient-to-r from-tertiary to-primary bg-clip-text text-transparent hover:text-primary transition-all duration-0',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? SlotPrimitive.Root : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
