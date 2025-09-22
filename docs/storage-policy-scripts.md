# 🗄️ Storage Policy Setup Scripts

This directory contains scripts to help you set up Supabase Storage policies for the recipe images functionality.

## 📁 **Available Scripts:**

### **1. `setup-storage-policies-sql.js`** (Recommended)
**Generates SQL commands for manual setup**
- ✅ Works with any Supabase setup
- ✅ No service role key required
- ✅ Most reliable method

**Usage:**
```bash
node scripts/setup-storage-policies-sql.js
```

**What it does:**
- Generates SQL commands for all required storage policies
- Provides step-by-step instructions
- Checks if bucket exists

### **2. `setup-storage-policies.js`**
**Automated policy creation using service role key**
- ⚠️ Requires service role key
- ✅ Fully automated
- ⚠️ May have permission issues

**Usage:**
```bash
node scripts/setup-storage-policies.js
```

**Requirements:**
- `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

### **3. `setup-complete-image-storage.js`**
**Complete setup (bucket + policies)**
- ⚠️ Requires service role key
- ✅ Creates bucket and policies
- ✅ Includes testing

**Usage:**
```bash
node scripts/setup-complete-image-storage.js
```

**Requirements:**
- `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

### **4. `verify-image-storage-setup.js`**
**Verification and testing script**
- ✅ Tests all components
- ✅ No special permissions required
- ✅ Comprehensive diagnostics

**Usage:**
```bash
node scripts/verify-image-storage-setup.js
```

## 🚀 **Quick Setup (Recommended):**

### **Step 1: Create Storage Bucket**
1. Go to your Supabase Dashboard
2. Navigate to **Storage**
3. Click **"Create bucket"**
4. Configure:
   - **Name**: `recipe-images`
   - **Public**: ✅ Yes
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`

### **Step 2: Set Up Storage Policies**
1. Run the SQL generation script:
   ```bash
   node scripts/setup-storage-policies-sql.js
   ```
2. Copy the generated SQL commands
3. Go to your Supabase Dashboard
4. Navigate to **SQL Editor**
5. Paste and run the SQL commands

### **Step 3: Verify Setup**
```bash
node scripts/verify-image-storage-setup.js
```

## 📋 **Required Storage Policies:**

The following 4 policies are required for the image upload functionality:

### **1. Public Read Access**
```sql
CREATE POLICY IF NOT EXISTS "Recipe images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'recipe-images');
```

### **2. Authenticated Upload**
```sql
CREATE POLICY IF NOT EXISTS "Authenticated users can upload recipe images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'recipe-images' AND auth.role() = 'authenticated'
);
```

### **3. User Update Own Files**
```sql
CREATE POLICY IF NOT EXISTS "Users can update their own recipe images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### **4. User Delete Own Files**
```sql
CREATE POLICY IF NOT EXISTS "Users can delete their own recipe images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🔧 **Troubleshooting:**

### **Common Issues:**

#### **"Bucket does not exist"**
- Create the `recipe-images` bucket in Supabase Dashboard
- Make sure it's set to public

#### **"Permission denied"**
- Check that storage policies are set up correctly
- Verify the bucket is public
- Make sure RLS is enabled on the storage.objects table

#### **"Upload fails"**
- Check file size limits (should be 5MB or less)
- Verify MIME type is allowed (image/jpeg, image/png, etc.)
- Check browser console for detailed error messages

#### **"Images not displaying"**
- Verify image URLs are accessible
- Check that images are saved in the database
- Ensure query functions include image fetching

### **Verification Checklist:**
- [ ] Storage bucket `recipe-images` exists and is public
- [ ] All 4 storage policies are created
- [ ] Database table `recipe_images` exists
- [ ] RLS policies on `recipe_images` table are working
- [ ] Image uploads work in the application
- [ ] Images display on dashboard and recipe pages

## 🎯 **Expected Results:**

After successful setup, you should be able to:

1. **Upload images** during recipe creation
2. **See images** on the dashboard and my-recipes pages
3. **View image galleries** on individual recipe pages
4. **Access images** via public URLs

## 📞 **Need Help?**

If you encounter issues:

1. **Run the verification script** to diagnose problems
2. **Check the browser console** for JavaScript errors
3. **Verify Supabase dashboard** settings
4. **Review the troubleshooting section** above

The image upload functionality is fully implemented and ready to use once the storage setup is complete! 🎉
