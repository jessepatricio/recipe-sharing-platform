# Recipe Images Implementation Guide

## Overview
This document outlines the recommended approach for implementing recipe image functionality in the recipe sharing platform.

## Database Schema

### Option 1: Simple Approach (MVP)
Add image fields directly to the recipes table:
```sql
ALTER TABLE recipes ADD COLUMN image_url TEXT;
ALTER TABLE recipes ADD COLUMN image_alt_text TEXT;
ALTER TABLE recipes ADD COLUMN image_uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

### Option 2: Advanced Approach (Production) ✅ **RECOMMENDED**
Use the separate `recipe_images` table as defined in migration `011_add_recipe_images.sql`.

## Table Structure: `recipe_images`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `recipe_id` | UUID | Foreign key to recipes table |
| `image_url` | TEXT | URL of the uploaded image |
| `alt_text` | TEXT | Alternative text for accessibility |
| `caption` | TEXT | Optional caption for the image |
| `is_primary` | BOOLEAN | Whether this is the main image |
| `sort_order` | INTEGER | Order when displaying multiple images |
| `file_size` | INTEGER | File size in bytes |
| `mime_type` | TEXT | MIME type (e.g., 'image/jpeg') |
| `width` | INTEGER | Image width in pixels |
| `height` | INTEGER | Image height in pixels |
| `created_at` | TIMESTAMP | When the image was uploaded |
| `updated_at` | TIMESTAMP | When the image was last updated |

## Features

### ✅ **Supported Features**
- Multiple images per recipe
- Primary image designation
- Image ordering/sorting
- Accessibility support (alt text)
- Image metadata (size, dimensions, type)
- Proper RLS policies for security
- Automatic primary image management

### 🔒 **Security Features**
- Row Level Security (RLS) enabled
- Users can only manage images for their own recipes
- Public read access for all recipe images
- Proper foreign key constraints

## Implementation Steps

### 1. Database Migration
```bash
# Apply the migration
node scripts/apply-migration.js 011_add_recipe_images.sql
```

### 2. Update TypeScript Types
Add to `lib/types.ts`:
```typescript
export interface RecipeImage {
  id: string;
  recipeId: string;
  imageUrl: string;
  altText?: string;
  caption?: string;
  isPrimary: boolean;
  sortOrder: number;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Recipe {
  // ... existing fields
  images?: RecipeImage[];
  primaryImage?: RecipeImage;
}
```

### 3. Update Query Functions
Modify query functions in `lib/supabase/queries.ts` to include images:
```typescript
// Add to each query function
const { data: images, error: imagesError } = await supabase
  .from('recipe_images')
  .select('*')
  .eq('recipe_id', recipe.id)
  .order('sort_order', { ascending: true });

// Add to return object
images: images || [],
primaryImage: images?.find(img => img.is_primary) || images?.[0]
```

### 4. Image Upload Implementation

#### Using Supabase Storage
```typescript
// Upload image to Supabase Storage
const uploadImage = async (file: File, recipeId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${recipeId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('recipe-images')
    .upload(fileName, file);
    
  if (error) throw error;
  
  return data;
};

// Save image metadata to database
const saveImageMetadata = async (imageData: {
  recipeId: string;
  imageUrl: string;
  altText?: string;
  caption?: string;
  isPrimary?: boolean;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
}) => {
  const { data, error } = await supabase
    .from('recipe_images')
    .insert(imageData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

### 5. UI Components

#### Image Upload Component
```typescript
interface ImageUploadProps {
  recipeId: string;
  onImageUploaded: (image: RecipeImage) => void;
}

export function ImageUpload({ recipeId, onImageUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  
  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      // Upload to storage
      const uploadData = await uploadImage(file, recipeId);
      
      // Get image dimensions
      const dimensions = await getImageDimensions(file);
      
      // Save metadata
      const imageData = await saveImageMetadata({
        recipeId,
        imageUrl: uploadData.path,
        altText: file.name,
        fileSize: file.size,
        mimeType: file.type,
        width: dimensions.width,
        height: dimensions.height,
        isPrimary: false // or true if it's the first image
      });
      
      onImageUploaded(imageData);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
}
```

#### Recipe Image Display Component
```typescript
interface RecipeImageDisplayProps {
  images: RecipeImage[];
  recipeId: string;
}

export function RecipeImageDisplay({ images, recipeId }: RecipeImageDisplayProps) {
  const primaryImage = images.find(img => img.is_primary) || images[0];
  
  if (!primaryImage) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">No image</span>
      </div>
    );
  }
  
  return (
    <div className="aspect-video rounded-lg overflow-hidden">
      <img
        src={primaryImage.imageUrl}
        alt={primaryImage.altText || 'Recipe image'}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
```

## Storage Configuration

### Supabase Storage Bucket
Create a storage bucket for recipe images:

```sql
-- Create storage bucket (run in Supabase SQL editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true);

-- Set up storage policies
CREATE POLICY "Recipe images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'recipe-images');

CREATE POLICY "Authenticated users can upload recipe images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'recipe-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own recipe images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'recipe-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own recipe images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'recipe-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Image Optimization Recommendations

### 1. Client-Side Optimization
```typescript
const optimizeImage = (file: File, maxWidth: number = 1200): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const optimizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(optimizedFile);
        }
      }, 'image/jpeg', 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

### 2. Multiple Image Sizes
Consider generating multiple sizes:
- Thumbnail: 300x300px
- Medium: 600x600px  
- Large: 1200x1200px
- Original: Full size

## Migration Strategy

### 1. Apply Database Migration
```bash
node scripts/apply-migration.js 011_add_recipe_images.sql
```

### 2. Update Existing Code
1. Update TypeScript types
2. Modify query functions to include images
3. Update UI components to display images
4. Add image upload functionality

### 3. Test Implementation
1. Test image upload
2. Test image display
3. Test RLS policies
4. Test primary image functionality

## Best Practices

### 1. Image Guidelines
- Maximum file size: 5MB
- Supported formats: JPEG, PNG, WebP
- Recommended dimensions: 1200x800px (3:2 aspect ratio)
- Always provide alt text for accessibility

### 2. Performance
- Use lazy loading for images
- Implement image compression
- Consider CDN for image delivery
- Use appropriate image formats (WebP for modern browsers)

### 3. Security
- Validate file types on both client and server
- Implement file size limits
- Scan uploaded images for malicious content
- Use signed URLs for private images if needed

## Future Enhancements

1. **Image Editing**: Basic crop/resize functionality
2. **Image Galleries**: Carousel for multiple images
3. **Image Search**: Search recipes by image content
4. **AI Features**: Automatic alt text generation
5. **Video Support**: Recipe videos alongside images
