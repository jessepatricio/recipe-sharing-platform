import { notFound } from "next/navigation";
import { SiteHeader } from "../../../components/site-header";
import { getRecipeById } from "../../../lib/supabase/queries";
import { getServerSession } from "../../../lib/supabase/server";
import { RecipeView } from "./recipe-view";

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const session = await getServerSession();
  
  const recipe = await getRecipeById(id, session?.user?.id);
  
  if (!recipe) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      
      <main className="mx-auto max-w-4xl px-6 py-8">
        <RecipeView 
          recipe={recipe} 
          currentUserId={session?.user?.id}
        />
      </main>
    </div>
  );
}
