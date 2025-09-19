# Database Schema Verification

## Recipes Table Structure

The `recipes` table in Supabase has the following structure:

### Core Fields (from migration 001)
- `id` (UUID, Primary Key, Default: gen_random_uuid())
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `cooking_time` (INTEGER, NOT NULL, Default: 0) - Cooking time in minutes
- `difficulty` (TEXT, CHECK constraint: 'Easy', 'Medium', 'Hard', Default: 'Easy')
- `user_id` (UUID, Foreign Key to profiles.id, NOT NULL)
- `created_at` (TIMESTAMP WITH TIME ZONE, Default: NOW())
- `updated_at` (TIMESTAMP WITH TIME ZONE, Default: NOW())

### Enhanced Fields (from migration 002)
- `prep_time` (TEXT)
- `total_time` (TEXT)
- `cuisine_type` (TEXT)
- `meal_type` (TEXT)
- `nutrition` (JSONB)
- `is_public` (BOOLEAN, Default: true)

### Array Fields (from migration 004)
- `ingredients` (TEXT[], Default: '{}') - Array of ingredient strings
- `instructions` (TEXT[], Default: '{}') - Array of instruction strings

### Category Field (from migration 005)
- `category` (TEXT, NOT NULL, Default: 'General') - Replaces tags field

## TypeScript Interface Mapping

The `Recipe` interface maps to the database fields as follows:

| TypeScript Field | Database Field | Type | Notes |
|------------------|----------------|------|-------|
| `id` | `id` | string | UUID from database |
| `title` | `title` | string | Direct mapping |
| `description` | `description` | string | Direct mapping |
| `author` | N/A | string | Computed from profiles table |
| `authorId` | `user_id` | string | Direct mapping |
| `cookTime` | `cooking_time` | number | Direct mapping (minutes) |
| `prepTime` | `prep_time` | string? | Direct mapping |
| `totalTime` | `total_time` | string? | Direct mapping |
| `difficulty` | `difficulty` | "Easy" \| "Medium" \| "Hard" | Direct mapping |
| `createdAt` | `created_at` | Date | Converted from timestamp |
| `category` | `category` | string | Direct mapping |
| `ingredients` | `ingredients` | string[] | Direct mapping (TEXT[]) |
| `instructions` | `instructions` | string[] | Direct mapping (TEXT[]) |
| `cuisineType` | `cuisine_type` | string? | Direct mapping |
| `mealType` | `meal_type` | string? | Direct mapping |
| `nutrition` | `nutrition` | Nutrition? | Parsed from JSONB |
| `isPublic` | `is_public` | boolean | Direct mapping |

## Array Structure

### Ingredients Array Structure
The `ingredients` field is a TEXT[] array where each element is a string describing an ingredient:
```sql
-- Example: ['2 cups flour', '1 tsp salt', '3 eggs']
```

### Instructions Array Structure
The `instructions` field is a TEXT[] array where each element is a string describing a cooking step:
```sql
-- Example: ['Preheat oven to 350°F', 'Mix dry ingredients', 'Add wet ingredients and stir']
```

### Nutrition JSONB Structure
```json
{
  "calories": "number" (optional),
  "protein": "number" (optional),
  "carbs": "number" (optional),
  "fat": "number" (optional),
  "fiber": "number" (optional),
  "sugar": "number" (optional)
}
```

## Indexes

The following indexes are created for optimal performance:

- `recipes_user_id_idx` - For user-based queries
- `recipes_created_at_idx` - For chronological ordering
- `recipes_difficulty_idx` - For difficulty filtering
- `recipes_category_idx` - For category filtering
- `recipes_cuisine_type_idx` - For cuisine filtering
- `recipes_meal_type_idx` - For meal type filtering
- `recipes_is_public_idx` - For public/private filtering
- `recipes_cooking_time_idx` - For cooking time filtering

## Row Level Security (RLS)

The following policies are in place:

- **SELECT**: All recipes are viewable by everyone
- **INSERT**: Authenticated users can insert recipes (must match their user_id)
- **UPDATE**: Users can only update their own recipes
- **DELETE**: Users can only delete their own recipes

## Verification Status

✅ All database fields exist in Supabase
✅ TypeScript types match database schema
✅ Query functions properly map database fields to TypeScript interfaces
✅ JSONB structures are properly defined
✅ Indexes are created for optimal performance
✅ RLS policies are properly configured
