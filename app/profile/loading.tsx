import { SiteHeader } from "../../components/site-header";
import { Skeleton } from "../../components/recipes/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      
      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        <div className="space-y-6">
          {/* Profile form skeleton */}
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
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
