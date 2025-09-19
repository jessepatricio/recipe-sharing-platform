import { Recipe } from "../../lib/types";
import { Button } from "./ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { deleteRecipe } from "../../app/actions/recipes";

interface RecipeCardProps {
  recipe: Recipe;
  showActions?: boolean;
  onDelete?: () => void;
  currentUserId?: string;
}

export function RecipeCard({ recipe, showActions = false, onDelete, currentUserId }: RecipeCardProps) {
  // Check if the current user owns this recipe
  const isOwner = currentUserId && recipe.authorId === currentUserId;
  const canEdit = showActions && isOwner;
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) {
      const result = await deleteRecipe(recipe.id);
      if (result.success && onDelete) {
        onDelete();
      }
    }
  };
  return (
    <article className="group rounded-xl border border-black/10 dark:border-white/10 overflow-hidden hover:shadow-lg transition-all duration-200 bg-background">
      <Link href={`/recipes/${recipe.id}`} className="block">
      <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">No image</p>
        </div>
        {recipe.difficulty && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center rounded-full bg-background/90 px-2 py-1 text-xs font-medium text-foreground">
              {recipe.difficulty}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg leading-tight group-hover:text-foreground/80 transition-colors">
            {recipe.title}
          </h3>
        </div>
        
        <p className="text-sm text-foreground/70 mb-3 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-foreground/60 mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {recipe.cookTime} min
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center">
              <span className="text-xs font-medium text-foreground">
                {recipe.author.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-foreground/70">{recipe.author}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-foreground/5 px-2 py-1 text-xs font-medium text-foreground/70">
              {recipe.category}
            </span>
            
            {showActions && (
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                {canEdit ? (
                  <>
                    <Link href={`/recipes/edit/${recipe.id}`}>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Link href={`/recipes/${recipe.id}`}>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </Link>
    </article>
  );
}
