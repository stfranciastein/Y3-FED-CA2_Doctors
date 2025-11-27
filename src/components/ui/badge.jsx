import * as React from "react"

// CVA is Class Variance Authority. 
// Basically, if you want to make a component that will have different appearances based on props (i.e. the use case of the button) cva helps with that.
import { cva } from "class-variance-authority"

// CN is a react utility for joining classNames conditionally. Instead of writing long namestrings with ternary operators, you can use cn to make it cleaner.
// For example, instead of writing: className={isActive ? 'active' : 'inactive'}, you can use cn and write: className={cn({ 'active': isActive, 'inactive': !isActive })}.
// Laravel uses a similar utility called classnames because by default that uses tailwindcss which encourages utility-first class names.
// The project for Anne's CA1 used this!!!
import { cn } from "@/lib/utils"

// The purpose of this badge is to provide a small, attention-grabbing element.
// I'm making this so I can reuse this for highlighting different things outside of just doctors, because otherwise I would be recreating the exact same thing multiple times.
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
