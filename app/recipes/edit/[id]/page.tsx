import { SiteHeader } from "../../../../components/site-header";
import { RecipeForm } from "../../../../components/recipes/recipe-form";
import { getRecipe } from "../../../actions/recipes";
import { notFound, redirect } from "next/navigation";

interface EditRecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params;
  
  const result = await getRecipe(id);
  
  if (!result.success) {
    if (result.error === "Recipe not found") {
      notFound();
    }
    redirect("/dashboard");
  }

  const recipe = result.recipe!;

  // Transform the recipe data to match the form's expected format
  const initialData = {
    title: recipe.title,
    description: recipe.description,
    cookTime: recipe.cookTime,
    difficulty: recipe.difficulty,
    category: recipe.category,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Edit Recipe</h1>
          <p className="mt-2 text-foreground/70">
            Update your recipe details
          </p>
        </div>

        <RecipeForm 
          initialData={initialData}
          isEditing={true}
          recipeId={id}
        />
      </main>
    </div>
  );
}
