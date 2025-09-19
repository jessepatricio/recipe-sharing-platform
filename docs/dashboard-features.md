# Recipe Dashboard Features

## Overview
The recipe dashboard provides a comprehensive interface for browsing, filtering, and managing recipes with advanced search and sorting capabilities.

## Features

### 🔍 Search Functionality
- **Real-time search** with 300ms debounce for optimal performance
- **Multi-field search** across:
  - Recipe titles
  - Descriptions
  - Ingredients
  - Instructions
- **Case-insensitive** search with partial matching

### 🎯 Advanced Filtering
- **Category Filter**: Filter by recipe categories (dynamically populated from existing recipes)
- **Difficulty Filter**: Filter by Easy, Medium, or Hard difficulty levels
- **Cook Time Filter**: Set maximum cooking time in minutes
- **Active Filter Display**: Visual badges showing active filters with individual remove options
- **Clear All Filters**: One-click button to reset all filters

### 📊 Sorting Options
- **Date-based**: Newest First, Oldest First
- **Alphabetical**: Title A-Z, Title Z-A
- **Difficulty**: Easy to Hard, Hard to Easy
- **Cook Time**: Short to Long, Long to Short

### 📄 Pagination
- **Configurable items per page** (default: 12 recipes)
- **Smart pagination** with ellipsis for large page counts
- **Auto-reset to page 1** when filters change
- **Responsive pagination controls**

### 🎨 User Interface
- **Responsive design** that works on all screen sizes
- **Collapsible filter panel** to save space
- **Visual feedback** for active filters and sorting
- **Loading states** and empty states
- **Accessible components** with proper ARIA labels

### ⚡ Performance Optimizations
- **Debounced search** to prevent excessive filtering
- **Memoized calculations** for filtering and sorting
- **Efficient pagination** with slice-based rendering
- **Optimized re-renders** with proper dependency arrays

## Usage

### Basic Implementation
```tsx
import { RecipeList } from "@/components/recipes/recipe-list";

function Dashboard() {
  const recipes = await getRecipes();
  
  return (
    <div>
      <h1>Recipe Dashboard</h1>
      <RecipeList recipes={recipes} />
    </div>
  );
}
```

### Custom Pagination
```tsx
<RecipeList 
  recipes={recipes} 
  itemsPerPage={20} 
/>
```

## Component Structure

```
components/recipes/
├── recipe-list.tsx          # Main dashboard component
├── recipe-card.tsx          # Individual recipe display
└── ui/
    ├── search.tsx           # Search input component
    ├── badge.tsx            # Filter badge component
    ├── button.tsx           # Button component
    ├── pagination.tsx       # Pagination controls
    ├── use-debounce.ts      # Debounce hook
    └── ...                  # Other UI components
```

## State Management

The component uses local state with React hooks:
- `filters`: Current filter and sort settings
- `searchInput`: Real-time search input
- `debouncedSearch`: Debounced search value
- `showFilters`: Filter panel visibility
- `currentPage`: Current pagination page

## Accessibility

- **Keyboard navigation** for all interactive elements
- **Screen reader support** with proper ARIA labels
- **Focus management** for filter interactions
- **High contrast** support for better visibility
- **Semantic HTML** structure for better navigation

## Browser Support

- Modern browsers with ES6+ support
- React 19+ compatibility
- Next.js 15+ App Router
- Tailwind CSS for styling
