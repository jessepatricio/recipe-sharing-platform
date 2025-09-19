import { Skeleton } from "./ui/skeleton";

export function RecipeCardSkeleton() {
  return (
    <article className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-background">
      {/* Image placeholder */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <Skeleton className="w-16 h-16 rounded-full" />
      </div>
      
      <div className="p-5">
        {/* Title */}
        <div className="flex items-start justify-between mb-2">
          <Skeleton className="h-6 w-3/4" />
        </div>
        
        {/* Description */}
        <div className="space-y-2 mb-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs mb-3">
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-md" />
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
