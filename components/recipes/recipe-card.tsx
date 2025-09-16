import { Recipe } from "../../lib/types";
import Image from "next/image";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <article className="group rounded-xl border border-black/10 dark:border-white/10 overflow-hidden hover:shadow-lg transition-all duration-200 bg-background">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={recipe.imageUrl}
          alt={recipe.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center rounded-full bg-background/90 px-2 py-1 text-xs font-medium text-foreground">
            {recipe.difficulty}
          </span>
        </div>
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
            {recipe.cookTime}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {recipe.servings} servings
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
          
          <div className="flex gap-1">
            {recipe.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-foreground/5 px-2 py-1 text-xs font-medium text-foreground/70"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 2 && (
              <span className="text-xs text-foreground/50">
                +{recipe.tags.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
