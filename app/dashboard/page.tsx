import Link from "next/link";
import { SiteHeader } from "../../components/site-header";
import { RecipeList } from "../../components/recipes/recipe-list";
import { getRecipes } from "../../lib/supabase/queries";
import { getServerSession } from "../../lib/supabase/server";

export default async function DashboardPage() {
  const session = await getServerSession();
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

        <RecipeList recipes={recipes} currentUserId={session?.user?.id} />
      </main>
    </div>
  );
}
