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
- **Create Recipes** - Rich recipe creation with detailed forms
- **Edit & Update** - Full CRUD operations for your recipes
- **Delete Recipes** - Remove recipes you no longer want
- **My Recipes Dashboard** - Personal recipe management

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

### 🏗️ Technical Features
- **Server-Side Rendering** - Fast initial page loads
- **Type Safety** - Full TypeScript implementation
- **Database Integration** - Supabase PostgreSQL
- **Real-time Updates** - Live data synchronization
- **Performance Optimized** - Debounced search, efficient queries

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

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
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
│   └── site-header.tsx  # Navigation
├── lib/                 # Utilities and configurations
│   ├── supabase/        # Database queries
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Helper functions
├── supabase/            # Database migrations and seeds
└── public/              # Static assets
```

## 🎯 Key Features in Detail

### Recipe Creation
- Rich form with validation
- Ingredient and instruction arrays
- Category selection
- Difficulty and cook time input
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

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
- **Netlify**: Compatible with Next.js
- **Railway**: Full-stack deployment
- **DigitalOcean**: Custom server setup

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