# 🖼️ Image Upload Setup Instructions

## ✅ **Implementation Complete!**

The image upload functionality has been successfully implemented in your recipe sharing platform. Here's what's been done and what you need to do to complete the setup.

## 🎯 **What's Been Implemented:**

### **1. Database Schema** ✅
- **Migration Applied**: `011_add_recipe_images.sql` creates the `recipe_images` table
- **Features**: Multiple images per recipe, primary image designation, image metadata storage
- **Security**: RLS policies for proper access control

### **2. TypeScript Types** ✅
- **RecipeImage Interface**: Complete type definition with all image metadata
- **Updated Recipe Interface**: Added `images` and `primaryImage` properties

### **3. UI Components** ✅
- **ImageUpload Component**: Modern drag & drop interface with:
  - Real-time image previews
  - File validation (type, size)
  - Primary image indication
  - Mobile-friendly design
- **Updated RecipeForm**: Integrated image upload into recipe creation
- **Updated RecipeCard**: Displays primary images with fallback
- **Updated RecipeView**: Shows image gallery with captions

### **4. Backend Integration** ✅
- **Recipe Creation Action**: Handles image uploads during recipe creation
- **Query Functions**: All 6 query functions updated to include images
- **Client Queries**: Updated to include images for dashboard and my-recipes pages
- **Image Processing**: Automatic dimension detection and metadata storage

### **5. User Experience** ✅
- **During Creation**: Users can upload images as part of recipe creation
- **Visual Feedback**: Real-time previews and hover effects
- **Responsive Design**: Works on desktop and mobile
- **Accessibility**: Proper alt text and ARIA labels

## 🚀 **Final Setup Required:**

### **Step 1: Create Supabase Storage Bucket**

1. **Go to your Supabase Dashboard**
2. **Navigate to Storage**
3. **Click "Create bucket"**
4. **Configure the bucket:**
   - **Name**: `recipe-images`
   - **Public**: ✅ Yes (checked)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`

### **Step 2: Set Up Storage Policies**

Go to **Storage > recipe-images > Policies** and add these policies:

#### **Policy 1: Public Read Access**
```sql
CREATE POLICY "Recipe images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'recipe-images');
```

#### **Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload recipe images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'recipe-images' 
  AND auth.role() = 'authenticated'
);
```

#### **Policy 3: User Update Own Files**
```sql
CREATE POLICY "Users can update their own recipe images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'recipe-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### **Policy 4: User Delete Own Files**
```sql
CREATE POLICY "Users can delete their own recipe images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'recipe-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🧪 **Testing the Implementation:**

### **1. Test Recipe Creation with Images**
1. Go to `/recipes/create`
2. Fill out the recipe form
3. Upload some images using the drag & drop interface
4. Submit the form
5. Check the browser console for any errors

### **2. Test Image Display**
1. Go to `/dashboard` - should show recipe cards with images
2. Go to `/my-recipes` - should show your recipes with images
3. Click on a recipe - should show image gallery in recipe view

### **3. Verify Image URLs**
- Images should be accessible via public URLs
- URLs should follow the pattern: `https://[project].supabase.co/storage/v1/object/public/recipe-images/[recipe-id]/[filename]`

## 🔧 **Troubleshooting:**

### **If Images Are Not Saving:**
1. **Check Browser Console**: Look for JavaScript errors
2. **Verify Storage Bucket**: Make sure `recipe-images` bucket exists and is public
3. **Check Storage Policies**: Ensure all 4 policies are created
4. **Check RLS Policies**: Verify `recipe_images` table has proper RLS policies

### **If Images Are Not Displaying:**
1. **Check Image URLs**: Verify URLs are accessible in browser
2. **Check Database**: Ensure image metadata is saved in `recipe_images` table
3. **Check Query Functions**: Verify images are being fetched correctly

### **Common Issues:**
- **Storage bucket not found**: Create the bucket in Supabase dashboard
- **Permission denied**: Check storage policies are set up correctly
- **Images not loading**: Verify bucket is public and URLs are correct
- **Upload fails**: Check file size limits and MIME type restrictions

## 📱 **Features Available:**

### **Image Upload:**
- ✅ Drag & drop interface
- ✅ Multiple image support (up to 5 per recipe)
- ✅ File validation (type, size)
- ✅ Real-time previews
- ✅ Primary image designation

### **Image Display:**
- ✅ Recipe cards show primary images
- ✅ Recipe detail pages show image galleries
- ✅ Responsive design for all screen sizes
- ✅ Fallback for recipes without images

### **Image Management:**
- ✅ Automatic primary image selection
- ✅ Image ordering and sorting
- ✅ Metadata storage (dimensions, file size, etc.)
- ✅ Proper cleanup on recipe deletion

## 🎉 **You're All Set!**

Once you've created the storage bucket and set up the policies, your image upload functionality will be fully operational. Users will be able to:

1. **Upload images** during recipe creation
2. **See images** on the dashboard and my-recipes pages
3. **View image galleries** on individual recipe pages
4. **Enjoy a modern, responsive** image upload experience

The implementation follows best practices for security, performance, and user experience! 🚀
