import { SiteHeader } from "../../../components/site-header";
import { RecipeViewSkeleton } from "../../../components/recipes/recipe-view-skeleton";

export default function RecipeLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      
      <main className="mx-auto max-w-4xl px-6 py-8">
        <RecipeViewSkeleton />
      </main>
    </div>
  );
}
