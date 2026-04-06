import * as React from "react"

import { badgeVariants, type BadgeVariantProps } from "@/core/ui/badge.variants"
import { cn } from "@/core/utils/cn"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    BadgeVariantProps {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge }
