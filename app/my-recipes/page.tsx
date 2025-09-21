import Link from "next/link";
import { SiteHeader } from "../../components/site-header";
import { RecipeList } from "../../components/recipes/recipe-list";
import { getUserRecipesWithLikeStatus } from "../../lib/supabase/queries";
import { getServerSession } from "../../lib/supabase/server";
import { MyRecipesClient } from "./my-recipes-client";
import { redirect } from "next/navigation";

export default async function MyRecipesPage() {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const recipes = await getUserRecipesWithLikeStatus(session.user.id);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Recipes</h1>
            <p className="mt-2 text-foreground/70">
              Manage your shared recipes
            </p>
          </div>
          <Link
            href="/recipes/create"
            className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition"
          >
            Create New Recipe
          </Link>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-lg text-foreground/70 mb-4">You haven't created any recipes yet.</div>
            <Link
              href="/recipes/create"
              className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition"
            >
              Create Your First Recipe
            </Link>
          </div>
        ) : (
          <MyRecipesClient recipes={recipes} userId={session.user.id} />
        )}
      </main>
    </div>
  );
}
