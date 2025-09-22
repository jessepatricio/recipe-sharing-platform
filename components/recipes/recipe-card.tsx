import { Recipe } from "../../lib/types";
import { Button } from "./ui/button";
import { Edit, Trash2, Eye, MessageCircle, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteRecipe } from "../../app/actions/recipes";
import { LikeButton } from "./ui/like-button";

interface RecipeCardProps {
  recipe: Recipe;
  showActions?: boolean;
  onDelete?: () => void;
  currentUserId?: string;
}

export function RecipeCard({ recipe, showActions = false, onDelete, currentUserId }: RecipeCardProps) {
  const router = useRouter();
  
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

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/recipes/edit/${recipe.id}`);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/recipes/${recipe.id}`);
  };
  return (
    <article className="group rounded-xl border border-black/10 dark:border-white/10 overflow-hidden hover:shadow-lg transition-all duration-200 bg-background">
      <Link href={`/recipes/${recipe.id}`} className="block">
        <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          {recipe.primaryImage ? (
            <img
              src={recipe.primaryImage.imageUrl}
              alt={recipe.primaryImage.altText || recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">No image</p>
              </div>
            </div>
          )}
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
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {recipe.commentCount || 0} comments
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
            </div>
          </div>
        </div>
      </Link>
      
      {/* Action buttons outside of the main Link to avoid nested anchor tags */}
      {showActions && (
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {canEdit ? (
                <>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 w-8 p-0"
                    onClick={handleEditClick}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
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
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 w-8 p-0"
                  onClick={handleViewClick}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Social actions */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between pt-3 border-t border-foreground/10">
          <LikeButton
            recipeId={recipe.id}
            initialLikeCount={recipe.likeCount || 0}
            initialIsLiked={recipe.isLiked || false}
            size="sm"
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/recipes/${recipe.id}#comments`;
            }}
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            {recipe.commentCount || 0}
          </Button>
        </div>
      </div>
    </article>
  );
}
