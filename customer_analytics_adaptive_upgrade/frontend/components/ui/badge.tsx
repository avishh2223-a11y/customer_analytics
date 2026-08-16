import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  `
  inline-flex
  items-center
  justify-center
  rounded-full
  px-3
  py-1
  text-xs
  font-semibold
  transition-all
  duration-300
  border
  backdrop-blur-md
  shadow-sm
  `,
  {
    variants: {
      variant: {
        default: `
          border-pink-200
          bg-pink-100
          text-pink-700
          hover:bg-pink-200
          hover:shadow-md
        `,

        secondary: `
          border-cyan-200
          bg-cyan-100
          text-cyan-700
          hover:bg-cyan-200
          hover:shadow-md
        `,

        success: `
          border-emerald-200
          bg-emerald-100
          text-emerald-700
          hover:bg-emerald-200
          hover:shadow-md
        `,

        warning: `
          border-yellow-200
          bg-yellow-100
          text-yellow-700
          hover:bg-yellow-200
          hover:shadow-md
        `,

        destructive: `
          border-red-200
          bg-red-100
          text-red-700
          hover:bg-red-200
          hover:shadow-md
        `,

        purple: `
          border-violet-200
          bg-violet-100
          text-violet-700
          hover:bg-violet-200
          hover:shadow-md
        `,

        outline: `
          border-slate-300
          bg-white/70
          text-slate-700
          hover:bg-slate-100
          dark:border-slate-700
          dark:bg-slate-800/60
          dark:text-slate-200
        `,
      },
    },

    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({
  className,
  variant,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant }),
        className
      )}
      {...props}
    />
  )
}

export {
  Badge,
  badgeVariants,
}