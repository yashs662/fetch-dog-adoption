import { cn } from "../../lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-orange-100/50 dark:bg-gray-700/50", className)}
      {...props}
    />
  )
}

export { Skeleton }