import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        soft: "bg-olive-100 text-olive-800",
        neutral: "bg-silver-100 text-silver-800",
        outline: "border border-olive-200 bg-white text-olive-700",
        warning: "bg-amber-100 text-amber-800",
        destructive: "bg-red-100 text-red-800",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
