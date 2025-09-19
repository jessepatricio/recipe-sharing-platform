import { SiteHeader } from "../../components/site-header";
import { RecipeListSkeleton } from "../../components/recipes/recipe-list-skeleton";
import { Skeleton } from "../../components/recipes/ui/skeleton";

export default function MyRecipesLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        <RecipeListSkeleton count={6} />
      </main>
    </div>
  );
}
