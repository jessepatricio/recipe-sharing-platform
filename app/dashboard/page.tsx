import Link from "next/link";
import { SiteHeader } from "../../components/site-header";
import { RecipeCard } from "../../components/recipes/recipe-card";
import { getRecipes } from "../../lib/supabase/queries";
import { Recipe } from "../../lib/types";

export default async function DashboardPage() {
  const recipes = await getRecipes();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recipe Dashboard</h1>
            <p className="mt-2 text-foreground/70">
              Discover amazing recipes shared by our community
            </p>
          </div>
          <Link
            href="/recipes/create"
            className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition"
          >
            Create Recipe
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>

        {recipes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-foreground/50 text-lg mb-6">
              No recipes found. Be the first to share one!
            </div>
            <Link
              href="/recipes/create"
              className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-6 py-3 text-base font-medium hover:opacity-90 transition"
            >
              Create your first recipe
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
