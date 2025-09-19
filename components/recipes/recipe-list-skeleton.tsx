import { RecipeCardSkeleton } from "./recipe-card-skeleton";
import { Skeleton } from "./ui/skeleton";

interface RecipeListSkeletonProps {
  count?: number;
}

export function RecipeListSkeleton({ count = 6 }: RecipeListSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Search and Filter Bar Skeleton */}
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          {/* Quick Filter Buttons Skeleton */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-18" />
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-6 w-22" />
          </div>
        </div>
      </div>

      {/* Results Summary Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-lg p-4 border shadow-sm">
        <div className="flex items-center gap-2">
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>

      {/* Recipe Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
