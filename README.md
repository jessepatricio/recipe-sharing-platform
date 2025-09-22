# 🍳 Recipe Sharing Platform

A modern, full-stack recipe sharing application built with Next.js 15, React 19, and Supabase. Share your favorite recipes, discover new dishes, and connect with a community of food enthusiasts.

![Recipe Sharing Platform](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Authentication** - Supabase Auth with email/password
- **User Profiles** - Customizable profiles with bio and avatar
- **Protected Routes** - Secure access to user-specific features
- **Session Management** - Persistent login sessions

### 📝 Recipe Management
- **Create Recipes** - Rich recipe creation with detailed forms and image uploads
- **Edit & Update** - Full CRUD operations with cancel functionality
- **Delete Recipes** - Remove recipes you no longer want
- **My Recipes Dashboard** - Personal recipe management with image galleries
- **Image Upload** - Upload multiple images per recipe with drag & drop
- **Image Display** - Beautiful image galleries on all recipe pages

### 🔍 Advanced Search & Filtering
- **Smart Search** - Search across titles, descriptions, ingredients, and instructions
- **Category Filtering** - Filter by cuisine types (Italian, Thai, Mediterranean, etc.)
- **Difficulty Filtering** - Find recipes by skill level
- **Cook Time Filtering** - Discover quick meals or elaborate dishes
- **Quick Filter Buttons** - One-click category selection

### 📊 Sorting & Organization
- **Multiple Sort Options**:
  - Newest/Oldest recipes
  - Alphabetical (A-Z/Z-A)
  - Difficulty (Easy to Hard/Hard to Easy)
  - Cook Time (Short to Long/Long to Short)
- **Real-time Results** - Instant filtering and sorting
- **Pagination** - Efficient handling of large recipe collections

### 🎨 Modern UI/UX
- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - Beautiful, accessible interface
- **Interactive Components** - Radix UI primitives
- **Visual Feedback** - Clear indicators for active filters
- **Loading States** - Smooth user experience
- **Image Galleries** - Stunning recipe image displays
- **Drag & Drop Upload** - Intuitive image upload interface

### 👥 Social Features
- **Like System** - Like and unlike recipes from other users
- **Comments** - Leave comments on recipes
- **Real-time Counters** - Live like and comment counts
- **User Interactions** - Engage with the community
- **Social Feed** - Discover recipes from other users

### 🛡️ Security & Protection
- **Rate Limiting** - Multi-layer rate limiting to prevent abuse
- **Demo Mode Protection** - Special restrictions for public demo
- **Row Level Security** - Comprehensive RLS policies
- **Input Validation** - Client and server-side validation
- **Security Headers** - XSS, CSRF, and clickjacking protection
- **Usage Tracking** - Monitor and prevent abuse
- **Image Upload Security** - File type and size validation

### 🏗️ Technical Features
- **Server-Side Rendering** - Fast initial page loads
- **Type Safety** - Full TypeScript implementation
- **Database Integration** - Supabase PostgreSQL
- **Real-time Updates** - Live data synchronization
- **Performance Optimized** - Debounced search, efficient queries
- **Image Optimization** - Next.js Image component with automatic optimization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/recipe-sharing-platform.git
   cd recipe-sharing-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Run the migration files in `supabase/migrations/`
   - Execute the seed data in `supabase/seed.sql`
   - Create a storage bucket named `recipe-images` in Supabase Storage
   - Set up storage policies for the `recipe-images` bucket (see Storage Setup below)

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Set up Supabase Storage**
   - Go to your Supabase dashboard
   - Navigate to Storage
   - Create a new bucket named `recipe-images`
   - Set the bucket to public
   - Go to SQL Editor and run the storage policies:
   ```sql
   -- Storage policies for recipe-images bucket
   CREATE POLICY "recipe_images_public_read" ON storage.objects
   FOR SELECT USING (bucket_id = 'recipe-images');

   CREATE POLICY "recipe_images_authenticated_insert" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'recipe-images' AND auth.role() = 'authenticated'
   );

   CREATE POLICY "recipe_images_authenticated_update" ON storage.objects
   FOR UPDATE USING (
     bucket_id = 'recipe-images' AND auth.role() = 'authenticated'
   );

   CREATE POLICY "recipe_images_authenticated_delete" ON storage.objects
   FOR DELETE USING (
     bucket_id = 'recipe-images' AND auth.role() = 'authenticated'
   );
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### Recipes Table
```sql
- id (UUID, Primary Key)
- title (TEXT, NOT NULL)
- description (TEXT)
- cooking_time (INTEGER) -- in minutes
- difficulty (TEXT) -- any difficulty level
- category (TEXT) -- cuisine type
- ingredients (TEXT[]) -- array of ingredients
- instructions (TEXT[]) -- array of instructions
- user_id (UUID, Foreign Key)
- like_count (INTEGER) -- cached like count
- comment_count (INTEGER) -- cached comment count
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Profiles Table
```sql
- id (UUID, Primary Key, References auth.users)
- username (TEXT)
- full_name (TEXT)
- avatar_url (TEXT)
- bio (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Recipe Images Table
```sql
- id (UUID, Primary Key)
- recipe_id (UUID, Foreign Key)
- image_url (TEXT) -- Supabase Storage URL
- alt_text (TEXT) -- accessibility text
- caption (TEXT) -- optional image caption
- is_primary (BOOLEAN) -- primary image flag
- sort_order (INTEGER) -- display order
- file_size (INTEGER) -- file size in bytes
- mime_type (TEXT) -- image MIME type
- width (INTEGER) -- image width
- height (INTEGER) -- image height
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Likes Table
```sql
- id (UUID, Primary Key)
- recipe_id (UUID, Foreign Key)
- user_id (UUID, Foreign Key)
- created_at (TIMESTAMP)
```

### Comments Table
```sql
- id (UUID, Primary Key)
- recipe_id (UUID, Foreign Key)
- user_id (UUID, Foreign Key)
- content (TEXT, NOT NULL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI, Lucide React Icons
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
recipe-sharing-platform/
├── app/                    # Next.js App Router
│   ├── actions/           # Server actions
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Main dashboard
│   ├── my-recipes/       # User's recipes
│   ├── profile/          # User profile
│   └── recipes/          # Recipe management
├── components/           # Reusable components
│   ├── auth/            # Authentication components
│   ├── profile/         # Profile components
│   ├── recipes/         # Recipe components
│   ├── demo-warning.tsx # Demo mode warnings
│   └── site-header.tsx  # Navigation
├── lib/                 # Utilities and configurations
│   ├── supabase/        # Database queries
│   ├── rate-limit.ts    # Rate limiting utilities
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Helper functions
├── docs/                # Documentation
│   └── security-measures.md # Security documentation
├── supabase/            # Database migrations and seeds
│   └── migrations/      # Database schema migrations
└── public/              # Static assets
```

## 🎯 Key Features in Detail

### Recipe Creation
- Rich form with validation
- Ingredient and instruction arrays
- Category selection
- Difficulty and cook time input
- **Image upload with drag & drop**
- **Multiple images per recipe**
- **Image preview and management**
- Real-time preview

### Advanced Filtering
- **Search**: Full-text search across all recipe content
- **Categories**: Italian, Thai, Mediterranean, Seafood, Dessert, etc.
- **Difficulty**: Custom difficulty levels
- **Cook Time**: Maximum cooking time filter
- **Quick Filters**: One-click category selection

### Sorting Options
- **Date**: Newest first, Oldest first
- **Alphabetical**: A-Z, Z-A
- **Difficulty**: Easy to Hard, Hard to Easy
- **Cook Time**: Short to Long, Long to Short

### User Experience
- **Responsive Design**: Works on all devices
- **Loading States**: Smooth transitions
- **Error Handling**: Graceful error management
- **Accessibility**: WCAG compliant
- **Performance**: Optimized queries and rendering
- **Cancel Functionality**: Easy recipe editing with cancel button
- **Smart Redirects**: Automatic navigation to My Recipes after saving
- **Image Management**: Intuitive image upload and display

## 🆕 Recent Updates

### 🛡️ Security & Protection System
- **Multi-layer Rate Limiting**: Client, server, and database-level protection
- **Demo Mode Protection**: Special restrictions for public demo deployment
- **Enhanced RLS Policies**: Comprehensive database security
- **Usage Tracking**: Monitor and prevent abuse patterns
- **Security Headers**: XSS, CSRF, and clickjacking protection
- **Demo Warning System**: Clear notifications about limitations

### 🖼️ Image Upload System
- **Drag & Drop Interface**: Easy image upload with visual feedback
- **Multiple Images**: Upload up to 5 images per recipe
- **Image Galleries**: Beautiful display on all recipe pages
- **Primary Image**: Automatic primary image selection
- **Storage Integration**: Secure Supabase Storage with RLS policies
- **Image Optimization**: Next.js Image component with automatic optimization

### 👥 Social Features
- **Like System**: Like and unlike recipes with real-time counters
- **Comments**: Leave and view comments on recipes
- **User Engagement**: Interactive social features
- **Real-time Updates**: Live like and comment counts

### 🎨 UI/UX Improvements
- **Cancel Button**: Easy recipe editing with cancel functionality
- **Smart Navigation**: Redirect to My Recipes after saving/updating
- **Image Display**: Stunning image galleries across all pages
- **Better Error Handling**: Improved error messages and validation
- **Demo Warning Banner**: Clear notifications about demo limitations

## 🚀 Deployment

### Live Demo
🌐 **Try the application live**: [https://recipe-sharing-platform-blush.vercel.app/](https://recipe-sharing-platform-blush.vercel.app/)

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

The application is automatically deployed to Vercel with:
- **Automatic deployments** on every push to main branch
- **Preview deployments** for pull requests
- **Global CDN** for fast loading worldwide
- **HTTPS** enabled by default
- **Custom domain** support

### Other Platforms
- **Netlify**: Compatible with Next.js
- **Railway**: Full-stack deployment
- **DigitalOcean**: Custom server setup

## 🛡️ Security & Demo Protection

This application includes comprehensive security measures to protect against abuse, especially important for public demo deployments.

### 🔒 **Rate Limiting**
- **Recipe Creation**: 2 recipes per minute per IP
- **Recipe Updates**: 3 updates per 30 seconds per IP
- **Image Uploads**: 1 upload per minute per IP
- **Likes**: 5 likes per 10 seconds per IP
- **Comments**: 3 comments per 30 seconds per IP

### 🚨 **Demo Mode Restrictions**
- **Automatic Detection**: Demo users are automatically identified
- **Usage Tracking**: All demo user actions are monitored
- **Resource Limits**: Strict limits on database operations
- **Warning System**: Clear notifications about demo limitations

### 🔐 **Database Security**
- **Row Level Security (RLS)**: All tables protected with comprehensive policies
- **User Isolation**: Users can only access their own data
- **Demo User Policies**: Special restrictions for demo accounts
- **Usage Monitoring**: Track and prevent abuse patterns

### 🛡️ **Application Security**
- **Security Headers**: XSS, CSRF, and clickjacking protection
- **Input Validation**: Client and server-side validation
- **File Upload Security**: Type and size validation
- **Authentication**: Secure Supabase Auth integration

### 📊 **Monitoring & Abuse Prevention**
- **Real-time Tracking**: Monitor usage patterns
- **IP-based Limiting**: Prevent abuse from single sources
- **Automatic Cleanup**: Remove old usage data
- **Alert System**: Notify of potential abuse

### 🔧 **Security Configuration**

For production deployment, ensure these environment variables are set:

```env
# Demo Mode Configuration
DEMO_MODE=true
DEMO_RATE_LIMIT_ENABLED=true

# Security Headers
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 📋 **Security Features in Detail**

| Feature | Protection Level | Description |
|---------|------------------|-------------|
| Rate Limiting | High | Multi-layer rate limiting (client, server, database) |
| RLS Policies | Very High | Comprehensive row-level security |
| Input Validation | High | Client and server-side validation |
| File Upload | Very High | Type, size, and content validation |
| Demo Restrictions | Very High | Special limits for demo users |
| Usage Tracking | Medium | Monitor and prevent abuse |

### 🚨 **Demo Mode Warning**

The public demo includes:
- ⚠️ **Rate limiting** to prevent abuse
- ⚠️ **Data may be reset** periodically
- ⚠️ **Limited features** compared to full deployment
- ⚠️ **Usage monitoring** for security

For full features and no restrictions, please set up your own instance following the installation guide.

### 📚 **Security Documentation**

For detailed security information, see:
- **[Security Measures Guide](docs/security-measures.md)** - Comprehensive security documentation
- **Rate Limiting Implementation** - Multi-layer protection system
- **RLS Policies** - Database security policies
- **Demo Mode Configuration** - Public demo protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Lucide](https://lucide.dev/) for beautiful icons

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Contact the maintainers

---

**Happy Cooking! 🍳✨**