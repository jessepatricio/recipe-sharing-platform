"use client";

import { useState, useActionState } from "react";
import { createRecipe, updateRecipe } from "../../app/actions/recipes";
import { CreateRecipeData } from "../../lib/types";
import { Button } from "@/components/recipes/ui/button";
import { Input } from "@/components/recipes/ui/input";
import { Textarea } from "@/components/recipes/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/recipes/ui/select";
import { Label } from "@/components/recipes/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/recipes/ui/card";
import { Plus, X, ChefHat, Tag } from "lucide-react";
import { ImageUpload } from "./image-upload";

interface RecipeFormProps {
  initialData?: Partial<CreateRecipeData>;
  isEditing?: boolean;
  recipeId?: string;
}

export function RecipeFormWithImages({ initialData, isEditing = false, recipeId }: RecipeFormProps) {
  const [title, setTitle] = useState<string>(initialData?.title || "");
  const [description, setDescription] = useState<string>(initialData?.description || "");
  const [cookTime, setCookTime] = useState<number>(initialData?.cookTime || 0);
  const [category, setCategory] = useState<string>(initialData?.category || "");
  const [difficulty, setDifficulty] = useState<string>(initialData?.difficulty || "");
  const [customDifficulty, setCustomDifficulty] = useState<string>(
    initialData?.difficulty && !["Easy", "Medium", "Hard"].includes(initialData.difficulty) 
      ? initialData.difficulty 
      : ""
  );
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients || []);
  const [instructions, setInstructions] = useState<string[]>(initialData?.instructions || []);
  const [newIngredient, setNewIngredient] = useState("");
  const [newInstruction, setNewInstruction] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  const [state, formAction] = useActionState(
    async (prevState: any, formData: FormData) => {
      setIsSubmitting(true);
      
      try {
        // Add images to form data
        images.forEach((image, index) => {
          formData.append(`image_${index}`, image);
        });
        formData.append('image_count', images.length.toString());
        
        const result = isEditing && recipeId 
          ? await updateRecipe(recipeId, formData)
          : await createRecipe(formData);
        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    { success: false, error: "" }
  );

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const removeIngredient = (ingredientToRemove: string) => {
    setIngredients(ingredients.filter(ingredient => ingredient !== ingredientToRemove));
  };

  const addInstruction = () => {
    if (newInstruction.trim() && !instructions.includes(newInstruction.trim())) {
      setInstructions([...instructions, newInstruction.trim()]);
      setNewInstruction("");
    }
  };

  const removeInstruction = (instructionToRemove: string) => {
    setInstructions(instructions.filter(instruction => instruction !== instructionToRemove));
  };

  const handleImagesChange = (newImages: File[]) => {
    setImages(newImages);
  };

  if (state.success && !state.error) {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 text-lg font-medium mb-4">
          {isEditing ? "Recipe updated successfully!" : "Recipe created successfully!"}
        </div>
        <a 
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition"
        >
          View Dashboard
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Recipe Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter recipe title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your recipe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cookTime">Cook Time (minutes) *</Label>
              <Input
                id="cookTime"
                name="cookTime"
                type="number"
                min="1"
                placeholder="30"
                value={cookTime > 0 ? cookTime : ""}
                onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty (Optional)</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                  <SelectItem value="Custom">Custom (enter your own)</SelectItem>
                </SelectContent>
              </Select>
              {difficulty === "Custom" && (
                <Input
                  placeholder="Enter custom difficulty..."
                  value={customDifficulty}
                  onChange={(e) => setCustomDifficulty(e.target.value)}
                  className="mt-2"
                />
              )}
              <Input
                type="hidden"
                name="difficulty"
                value={difficulty === "Custom" ? customDifficulty : difficulty}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Upload */}
      <ImageUpload 
        onImagesChange={handleImagesChange}
        maxImages={5}
      />

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Ingredients
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add an ingredient..."
              value={newIngredient}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewIngredient(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
            />
            <Button type="button" onClick={addIngredient} variant="outline">
              Add Ingredient
            </Button>
          </div>
          <div className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <span className="text-sm">{ingredient}</span>
                <button
                  type="button"
                  onClick={() => removeIngredient(ingredient)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Cooking Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a cooking step..."
              value={newInstruction}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewInstruction(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && (e.preventDefault(), addInstruction())}
            />
            <Button type="button" onClick={addInstruction} variant="outline">
              Add Step
            </Button>
          </div>
          <div className="space-y-2">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex items-start justify-between bg-gray-50 p-3 rounded-md">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm">{instruction}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeInstruction(instruction)}
                  className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="category">Recipe Category</Label>
            <Input
              id="category"
              name="category"
              placeholder="e.g., Italian, Dessert, Quick Meal..."
              value={category}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Hidden inputs for form data */}
      <input type="hidden" name="ingredients" value={JSON.stringify(ingredients)} />
      <input type="hidden" name="instructions" value={JSON.stringify(instructions)} />

      {/* Error Display */}
      {state.error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {state.error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          size="lg"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : (isEditing ? "Update Recipe" : "Create Recipe")}
        </Button>
      </div>
    </form>
  );
}
