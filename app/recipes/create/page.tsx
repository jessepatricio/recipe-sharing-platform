import { SiteHeader } from "../../../components/site-header";
import { RecipeForm } from "../../../components/recipes/recipe-form";

export default function CreateRecipePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create New Recipe</h1>
          <p className="mt-2 text-foreground/70">
            Share your delicious recipe with the community
          </p>
        </div>

        <RecipeForm />
      </main>
    </div>
  );
}
