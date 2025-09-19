"use client";

import { useState } from "react";
import { RecipeList } from "../../components/recipes/recipe-list";
import { Recipe } from "../../lib/types";
import { getRecipesClient } from "../../lib/supabase/client-queries";

interface MyRecipesClientProps {
  recipes: Recipe[];
}

export function MyRecipesClient({ recipes: initialRecipes }: MyRecipesClientProps) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [loading, setLoading] = useState(false);

  const handleRecipeDelete = async () => {
    setLoading(true);
    try {
      // Refresh the recipes list after deletion
      const data = await getRecipesClient();
      setRecipes(data);
    } catch (error) {
      console.error("Failed to refresh recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RecipeList 
      recipes={recipes} 
      showActions={true}
      onRecipeDelete={handleRecipeDelete}
    />
  );
}
