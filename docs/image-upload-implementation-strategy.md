# Image Upload Implementation Strategy

## 🎯 **Recommended Approach: Two-Phase Implementation**

### **Phase 1: During Recipe Creation (Primary)**
- Upload images as part of the recipe creation form
- Provide immediate visual feedback
- Make images optional but encouraged

### **Phase 2: Post-Creation Management (Secondary)**
- Allow users to add/edit images after recipe creation
- Provide image management in recipe edit mode
- Enable image galleries and reordering

## 🚀 **Implementation Plan**

### **Step 1: Update Recipe Creation Form**

#### A. Add Image Upload Section to RecipeForm
```typescript
// Add to RecipeForm component
const [images, setImages] = useState<File[]>([]);
const [imagePreviews, setImagePreviews] = useState<string[]>([]);
const [uploadingImages, setUploadingImages] = useState(false);

// Image upload handlers
const handleImageUpload = (files: FileList) => {
  const newImages = Array.from(files);
  setImages(prev => [...prev, ...newImages]);
  
  // Create previews
  newImages.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviews(prev => [...prev, e.target?.result as string]);
    };
    reader.readAsDataURL(file);
  });
};

const removeImage = (index: number) => {
  setImages(prev => prev.filter((_, i) => i !== index));
  setImagePreviews(prev => prev.filter((_, i) => i !== index));
};
```

#### B. Add Image Upload UI Section
```typescript
{/* Image Upload Section */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <ImageIcon className="h-5 w-5" />
      Recipe Images (Optional)
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className="cursor-pointer flex flex-col items-center gap-2"
      >
        <Upload className="h-8 w-8 text-gray-400" />
        <span className="text-sm text-gray-600">
          Click to upload images or drag and drop
        </span>
        <span className="text-xs text-gray-500">
          PNG, JPG, WebP up to 5MB each
        </span>
      </label>
    </div>
    
    {/* Image Previews */}
    {imagePreviews.length > 0 && (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {imagePreviews.map((preview, index) => (
          <div key={index} className="relative group">
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    )}
  </CardContent>
</Card>
```

### **Step 2: Update Recipe Creation Action**

#### A. Modify createRecipe Action
```typescript
export async function createRecipe(formData: FormData) {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/sign-in");
  }

  try {
    // Parse form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    // ... other fields

    // Create recipe first
    const supabase = await createSupabaseServerClient();
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        title,
        description,
        // ... other fields
      })
      .select()
      .single();

    if (recipeError) throw recipeError;

    // Handle image uploads
    const images = formData.getAll("images") as File[];
    if (images.length > 0) {
      await uploadRecipeImages(recipe.id, images, session.user.id);
    }

    revalidatePath("/dashboard");
    return { success: true, recipeId: recipe.id };
  } catch (error) {
    console.error("Error creating recipe:", error);
    return {
      success: false,
      error: "Failed to create recipe. Please try again."
    };
  }
}
```

#### B. Create Image Upload Helper
```typescript
async function uploadRecipeImages(recipeId: string, images: File[], userId: string) {
  const supabase = await createSupabaseServerClient();
  
  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${recipeId}/${Date.now()}-${i}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, file);
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      continue;
    }

    // Get image dimensions
    const dimensions = await getImageDimensions(file);
    
    // Save image metadata
    const { error: dbError } = await supabase
      .from('recipe_images')
      .insert({
        recipe_id: recipeId,
        image_url: uploadData.path,
        alt_text: file.name,
        file_size: file.size,
        mime_type: file.type,
        width: dimensions.width,
        height: dimensions.height,
        is_primary: i === 0, // First image is primary
        sort_order: i
      });
    
    if (dbError) {
      console.error('Database error:', dbError);
    }
  }
}
```

### **Step 3: Update Recipe Display Components**

#### A. Update RecipeCard Component
```typescript
// Add to RecipeCard component
interface RecipeCardProps {
  recipe: Recipe & {
    images?: RecipeImage[];
    primaryImage?: RecipeImage;
  };
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Recipe Image */}
      {recipe.primaryImage ? (
        <div className="aspect-video relative">
          <img
            src={recipe.primaryImage.image_url}
            alt={recipe.primaryImage.alt_text || recipe.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-gray-400" />
        </div>
      )}
      
      {/* Rest of the card content */}
      <CardContent className="p-4">
        {/* ... existing content */}
      </CardContent>
    </Card>
  );
}
```

### **Step 4: Add Post-Creation Image Management**

#### A. Create Image Management Component
```typescript
interface ImageManagementProps {
  recipeId: string;
  existingImages: RecipeImage[];
  onImagesUpdated: (images: RecipeImage[]) => void;
}

export function ImageManagement({ recipeId, existingImages, onImagesUpdated }: ImageManagementProps) {
  const [images, setImages] = useState<RecipeImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    try {
      // Upload images and update state
      const newImages = await uploadImages(recipeId, Array.from(files));
      setImages(prev => [...prev, ...newImages]);
      onImagesUpdated([...images, ...newImages]);
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    // Update primary image
    const updatedImages = images.map(img => ({
      ...img,
      is_primary: img.id === imageId
    }));
    setImages(updatedImages);
    onImagesUpdated(updatedImages);
  };

  const handleDeleteImage = async (imageId: string) => {
    // Delete image and update state
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onImagesUpdated(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
          disabled={uploading}
        />
        {uploading && <p>Uploading images...</p>}
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={image.id} className="relative group">
            <img
              src={image.image_url}
              alt={image.alt_text || `Image ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg"
            />
            {image.is_primary && (
              <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                Primary
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all">
              <div className="flex gap-1 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleSetPrimary(image.id)}
                  className="bg-blue-500 text-white p-1 rounded text-xs"
                >
                  Set Primary
                </button>
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="bg-red-500 text-white p-1 rounded text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🎨 **User Experience Flow**

### **During Recipe Creation:**
1. User fills out recipe form
2. User optionally uploads images
3. User sees image previews
4. User submits form
5. Recipe and images are created together
6. User is redirected to recipe page with images

### **Post-Creation Management:**
1. User goes to recipe edit page
2. User sees existing images
3. User can upload new images
4. User can set primary image
5. User can delete images
6. User saves changes

## 🔧 **Technical Considerations**

### **Image Optimization:**
- Client-side compression before upload
- Multiple image sizes (thumbnail, medium, large)
- WebP format for modern browsers
- Lazy loading for performance

### **Error Handling:**
- Upload progress indicators
- Retry mechanisms for failed uploads
- Graceful degradation if images fail
- Clear error messages

### **Security:**
- File type validation
- File size limits
- Image scanning for malicious content
- Proper RLS policies

## 📱 **Mobile Considerations**

- Touch-friendly upload areas
- Camera integration for mobile
- Responsive image galleries
- Optimized upload flow for mobile

## 🚀 **Implementation Priority**

1. **High Priority**: During-creation upload with basic functionality
2. **Medium Priority**: Post-creation image management
3. **Low Priority**: Advanced features (image editing, galleries)

This approach provides the best user experience while maintaining flexibility and technical robustness.
