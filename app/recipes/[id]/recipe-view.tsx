"use client";

import { Recipe } from "../../../lib/types";
import { Button } from "../../../components/recipes/ui/button";
import { Card } from "../../../components/recipes/ui/card";
import { Badge } from "../../../components/recipes/ui/badge";
import { Edit, Clock, ChefHat, User, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RecipeViewProps {
  recipe: Recipe;
  currentUserId?: string;
}

export function RecipeView({ recipe, currentUserId }: RecipeViewProps) {
  const isOwner = currentUserId && recipe.authorId === currentUserId;
  const createdAt = typeof recipe.createdAt === 'string' 
    ? new Date(recipe.createdAt) 
    : recipe.createdAt;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div>
        <Link href="/dashboard">
          <Button variant="outline" className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300">
            <ArrowLeft className="h-4 w-4" />
            Back to Recipes
          </Button>
        </Link>
      </div>

      {/* Recipe Header */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">{recipe.title}</h1>
            <p className="text-lg text-foreground/70 leading-relaxed">{recipe.description}</p>
          </div>
          
          {isOwner && (
            <Link href={`/recipes/edit/${recipe.id}`}>
              <Button className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Recipe
              </Button>
            </Link>
          )}
        </div>

        {/* Recipe Meta */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-foreground/70 py-2">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>By {recipe.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{createdAt.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.cookTime} minutes</span>
          </div>
          {recipe.difficulty && (
            <div className="flex items-center gap-1">
              <ChefHat className="h-4 w-4" />
              <span>{recipe.difficulty}</span>
            </div>
          )}
        </div>

        {/* Category Badge */}
        <div>
          <Badge variant="secondary" className="text-sm">
            {recipe.category}
          </Badge>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ingredients */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Ingredients
          </h2>
          {recipe.ingredients.length > 0 ? (
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-foreground/60 mt-1">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-foreground/60 italic">No ingredients listed</p>
          )}
        </Card>

        {/* Instructions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Instructions
          </h2>
          {recipe.instructions.length > 0 ? (
            <ol className="space-y-3">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-foreground/10 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-foreground/60 italic">No instructions provided</p>
          )}
        </Card>
      </div>

      {/* Recipe Footer */}
      <div className="pt-6 border-t border-foreground/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-foreground/60">
            <p>Recipe created on {createdAt.toLocaleDateString()}</p>
            {!isOwner && (
              <p className="mt-1">This recipe is shared by {recipe.author}</p>
            )}
          </div>
          
          {isOwner && (
            <div className="flex gap-2">
              <Link href={`/recipes/edit/${recipe.id}`}>
                <Button variant="outline" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Recipe
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
