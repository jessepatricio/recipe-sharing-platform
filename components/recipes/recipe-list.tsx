"use client";

import { useState, useMemo, useEffect } from "react";
import { Recipe } from "@/lib/types";
import { RecipeCard } from "./recipe-card";
import { SearchInput } from "./ui/search";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Pagination } from "./ui/pagination";
import { useDebounce } from "./ui/use-debounce";
import { ChevronDown, Filter, X, SortAsc, SortDesc, Clock, ChefHat, Tag, Search } from "lucide-react";

interface RecipeListProps {
  recipes: Recipe[];
  itemsPerPage?: number;
  showActions?: boolean;
  onRecipeDelete?: () => void;
  currentUserId?: string;
}

type SortOption = "newest" | "oldest" | "title-asc" | "title-desc" | "difficulty-asc" | "difficulty-desc" | "cook-time-asc" | "cook-time-desc";
type DifficultyFilter = "all" | string;
type CategoryFilter = "all" | string;

interface Filters {
  search: string;
  category: CategoryFilter;
  difficulty: DifficultyFilter;
  maxCookTime: number;
  sortBy: SortOption;
}

// Helper function to get difficulty order for sorting
const getDifficultyOrder = (difficulty: string | null): number => {
  if (!difficulty) return 0; // null/empty values come first
  const lower = difficulty.toLowerCase();
  if (lower.includes('easy') || lower.includes('beginner')) return 1;
  if (lower.includes('medium') || lower.includes('intermediate')) return 2;
  if (lower.includes('hard') || lower.includes('advanced') || lower.includes('expert')) return 3;
  return 4; // other values come last
};

// Helper function to ensure consistent date handling for sorting
const getDateValue = (date: Date | string): number => {
  if (typeof date === 'string') {
    return new Date(date).getTime();
  }
  return date.getTime();
};

export function RecipeList({ recipes, itemsPerPage = 12, showActions = false, onRecipeDelete, currentUserId }: RecipeListProps) {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "all",
    difficulty: "all",
    maxCookTime: 0,
    sortBy: "newest"
  });

  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState(filters.search);
  const [isHydrated, setIsHydrated] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Fix hydration mismatch caused by browser extensions
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Get unique categories from recipes
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(recipes.map(recipe => recipe.category)));
    return uniqueCategories.sort();
  }, [recipes]);

  // Update search filter when debounced search changes
  useMemo(() => {
    if (debouncedSearch !== filters.search) {
      handleFilterChange({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  // Filter and sort recipes
  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = recipes.filter(recipe => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.description.toLowerCase().includes(searchLower) ||
          recipe.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(searchLower)
          ) ||
          recipe.instructions.some(instruction => 
            instruction.toLowerCase().includes(searchLower)
          );
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category !== "all" && recipe.category !== filters.category) {
        return false;
      }

      // Difficulty filter
      if (filters.difficulty !== "all") {
        if (!recipe.difficulty || recipe.difficulty.toLowerCase() !== filters.difficulty.toLowerCase()) {
          return false;
        }
      }

      // Cook time filter
      if (filters.maxCookTime > 0 && recipe.cookTime > filters.maxCookTime) {
        return false;
      }

      return true;
    });

    // Sort recipes
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return getDateValue(b.createdAt) - getDateValue(a.createdAt);
        case "oldest":
          return getDateValue(a.createdAt) - getDateValue(b.createdAt);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "difficulty-asc":
          return getDifficultyOrder(a.difficulty) - getDifficultyOrder(b.difficulty);
        case "difficulty-desc":
          return getDifficultyOrder(b.difficulty) - getDifficultyOrder(a.difficulty);
        case "cook-time-asc":
          return a.cookTime - b.cookTime;
        case "cook-time-desc":
          return b.cookTime - a.cookTime;
        default:
          return 0;
      }
    });

    return filtered;
  }, [recipes, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedRecipes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecipes = filteredAndSortedRecipes.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "all",
      difficulty: "all",
      maxCookTime: 0,
      sortBy: "newest"
    });
    setSearchInput("");
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.search || filters.category !== "all" || filters.difficulty !== "all" || filters.maxCookTime > 0;

  // Prevent hydration mismatch by showing loading state until hydrated
  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Search recipes, ingredients, or instructions..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 font-medium mr-2">Quick filters:</span>
            <Button
              variant={filters.category === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ category: "all" })}
              className="text-xs"
            >
              All
            </Button>
            {categories.slice(0, 6).map(category => (
              <Button
                key={category}
                variant={filters.category === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange({ category })}
                className="text-xs"
              >
                {category}
              </Button>
            ))}
            {categories.length > 6 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="text-xs text-gray-500"
              >
                +{categories.length - 6} more
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="p-6 border-2 border-blue-100 bg-blue-50/30">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Filter className="h-5 w-5" />
                <h3 className="font-semibold">Filter & Sort Recipes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center gap-2 text-sm font-medium">
                    <Tag className="h-4 w-4" />
                    Category
                  </Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => handleFilterChange({ category: value as CategoryFilter })}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="flex items-center gap-2 text-sm font-medium">
                    <ChefHat className="h-4 w-4" />
                    Difficulty
                  </Label>
                  <Input
                    value={filters.difficulty === "all" ? "" : filters.difficulty}
                    onChange={(e) => handleFilterChange({ difficulty: e.target.value || "all" })}
                    placeholder="e.g., Easy, Hard, Beginner..."
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxCookTime" className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    Max Cook Time (min)
                  </Label>
                  <Input
                    id="maxCookTime"
                    type="number"
                    min="0"
                    value={filters.maxCookTime || ""}
                    onChange={(e) => handleFilterChange({ 
                      maxCookTime: parseInt(e.target.value) || 0 
                    })}
                    placeholder="No limit"
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortBy" className="flex items-center gap-2 text-sm font-medium">
                    <SortAsc className="h-4 w-4" />
                    Sort By
                  </Label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => handleFilterChange({ sortBy: value as SortOption })}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="title-asc">Title A-Z</SelectItem>
                      <SelectItem value="title-desc">Title Z-A</SelectItem>
                      <SelectItem value="difficulty-asc">Difficulty: Easy to Hard</SelectItem>
                      <SelectItem value="difficulty-desc">Difficulty: Hard to Easy</SelectItem>
                      <SelectItem value="cook-time-asc">Cook Time: Short to Long</SelectItem>
                      <SelectItem value="cook-time-desc">Cook Time: Long to Short</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Active Filters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                <Search className="h-3 w-3" />
                Search: "{filters.search}"
                <button
                  onClick={() => handleFilterChange({ search: "" })}
                  className="ml-1 hover:text-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.category !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
                <Tag className="h-3 w-3" />
                Category: {filters.category}
                <button
                  onClick={() => handleFilterChange({ category: "all" })}
                  className="ml-1 hover:text-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.difficulty !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800 hover:bg-orange-200">
                <ChefHat className="h-3 w-3" />
                Difficulty: {filters.difficulty}
                <button
                  onClick={() => handleFilterChange({ difficulty: "all" })}
                  className="ml-1 hover:text-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.maxCookTime > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-purple-100 text-purple-800 hover:bg-purple-200">
                <Clock className="h-3 w-3" />
                Max Time: {filters.maxCookTime}min
                <button
                  onClick={() => handleFilterChange({ maxCookTime: 0 })}
                  className="ml-1 hover:text-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-lg p-4 border shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm font-medium text-gray-700">
              {filteredAndSortedRecipes.length} recipe{filteredAndSortedRecipes.length !== 1 ? 's' : ''} found
            </p>
          </div>
          {hasActiveFilters && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              from {recipes.length} total
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Sorted by:</span>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <SortAsc className="h-3 w-3 mr-1" />
            {filters.sortBy === "newest" && "Newest First"}
            {filters.sortBy === "oldest" && "Oldest First"}
            {filters.sortBy === "title-asc" && "Title A-Z"}
            {filters.sortBy === "title-desc" && "Title Z-A"}
            {filters.sortBy === "difficulty-asc" && "Easy to Hard"}
            {filters.sortBy === "difficulty-desc" && "Hard to Easy"}
            {filters.sortBy === "cook-time-asc" && "Short to Long"}
            {filters.sortBy === "cook-time-desc" && "Long to Short"}
          </Badge>
        </div>
      </div>

      {/* Recipe Grid */}
      {filteredAndSortedRecipes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedRecipes.map((recipe) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                showActions={showActions}
                onDelete={onRecipeDelete}
                currentUserId={currentUserId}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg mb-6">
            {hasActiveFilters ? "No recipes match your current filters." : "No recipes found."}
          </div>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
