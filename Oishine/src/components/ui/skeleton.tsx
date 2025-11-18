import { cn } from "@/lib/utils"
import { motion } from 'framer-motion';

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

// Enhanced product card skeleton
function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-lg border border-border">
      <Skeleton className="h-48 w-full mb-4 rounded-xl" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
}

// Product grid skeleton
function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export { Skeleton, ProductCardSkeleton, ProductGridSkeleton }
