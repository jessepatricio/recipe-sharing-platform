import { Skeleton } from "./ui/skeleton";

export function RecipeViewSkeleton() {
  return (
    <div className="space-y-8">
      {/* Back Button Skeleton */}
      <div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Recipe Header Skeleton */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Recipe Meta Skeleton */}
        <div className="flex flex-wrap items-center gap-6 text-sm py-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-18" />
        </div>

        {/* Category Badge Skeleton */}
        <div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* Recipe Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ingredients Skeleton */}
        <div className="p-6 border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <Skeleton className="w-2 h-2 rounded-full mt-1" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Instructions Skeleton */}
        <div className="p-6 border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-28" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Footer Skeleton */}
      <div className="pt-6 border-t border-foreground/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}
