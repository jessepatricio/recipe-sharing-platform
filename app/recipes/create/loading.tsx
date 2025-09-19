import { SiteHeader } from "../../../components/site-header";
import { Skeleton } from "../../../components/recipes/ui/skeleton";

export default function CreateRecipeLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      
      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        <div className="space-y-6">
          {/* Form fields skeleton */}
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Ingredients section */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-10" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Instructions section */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-28" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-10" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Submit button */}
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </main>
    </div>
  );
}
