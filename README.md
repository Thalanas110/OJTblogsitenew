# OJT Blog Site

A modern, full-featured blog application designed for tracking and sharing on-the-job training (OJT) experiences. Built with React, TypeScript, and Supabase, this platform provides a comprehensive blogging solution with admin capabilities, analytics, and user engagement features.

## ✨ Features

### Public Features
- **Blog Posts**: Browse and read blog posts with rich content and cover images
- **Post Engagement**: Like posts and leave comments
- **Video Integration**: Embedded YouTube videos with play tracking
- **Responsive Design**: Mobile-friendly interface with dark/light theme support
- **Post Search & Pagination**: Easy navigation through content
- **View Tracking**: Automatic tracking of post views

### Admin Features
- **Dashboard Analytics**: Overview of posts, comments, views, and reactions
- **Post Management**: Create, edit, delete, and publish/draft posts
- **Comment Moderation**: Approve or manage user comments
- **Activity Logs**: Track all system activities with detailed logging
- **Post Dashboard**: Individual post analytics with views, likes, and comments
- **Pin Posts**: Highlight important posts at the top of the feed

## 🚀 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **React Hook Form** - Form handling with Zod validation

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library built on Radix UI
- **Lucide React** - Icon library
- **Framer Motion** - Animation library
- **next-themes** - Theme management

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Real-time capabilities

### Testing
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **Testing Library** - React component testing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/) or install with [nvm](https://github.com/nvm-sh/nvm)
- **npm** or **pnpm** or **yarn** - Package manager
- **Supabase Account** - [Sign up](https://supabase.com/) for free

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd OJTblogsitenew
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

You can find these values in your [Supabase project settings](https://app.supabase.com) under **Settings → API**.

### 4. Database Setup

The project includes migration files in `supabase/migrations/`. To set up the database:

**Option A: Using Supabase CLI (Recommended)**

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

**Option B: Manual Setup**

Run the SQL migration files in order through the Supabase SQL Editor:
1. `20260311143607_1af4467d-e39c-41bb-a3a7-b77da92dcd3e.sql` - Core tables
2. `20260311143631_422a4c93-690f-48cd-b430-c87e11a3cb82.sql` - Additional setup
3. `20260311144946_7d76025c-d556-41be-9a84-d7fd7c88d819.sql` - Functions
4. `20260311145055_1506a45d-cd8f-4379-a13f-594409d48d08.sql` - Indexes
5. `20260311150000_add_youtube_url_to_posts.sql` - YouTube support
6. `20260311160000_add_video_plays_and_user_agent.sql` - Analytics

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 📁 Project Structure

```
OJTblogsitenew/
├── src/
│   ├── components/          # React components
│   │   ├── admin/          # Admin-specific components
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.tsx     # Authentication logic
│   │   ├── useBlog.ts      # Blog data fetching
│   │   └── useTheme.tsx    # Theme management
│   ├── integrations/       # Third-party integrations
│   │   └── supabase/       # Supabase client & types
│   ├── lib/                # Utility functions
│   │   ├── api.ts          # API functions
│   │   └── utils.ts        # Helper utilities
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Home page
│   │   ├── PostPage.tsx    # Individual post view
│   │   ├── AdminPage.tsx   # Admin dashboard
│   │   ├── LoginPage.tsx   # Authentication
│   │   └── AboutPage.tsx   # About page
│   ├── types/              # TypeScript type definitions
│   ├── test/               # Test files
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Application entry point
├── supabase/
│   ├── migrations/         # Database migrations
│   └── config.toml         # Supabase configuration
├── public/                 # Static assets
└── package.json            # Dependencies and scripts
```

## 🗄️ Database Schema

### Tables

- **posts** - Blog posts with title, content, cover image, and metadata
- **comments** - User comments on posts with moderation support
- **reactions** - Post reactions (likes) tracked by IP
- **post_views** - View tracking for analytics
- **activity_logs** - System activity logging for admin monitoring

### Key Features

- Row Level Security (RLS) for data protection
- Automatic timestamp tracking
- IP-based rate limiting for reactions and views
- Cascade delete for related data

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (port 8080) |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code linting |
| `npm run test` | Run unit tests once |
| `npm run test:watch` | Run tests in watch mode |

## 🔐 Authentication

The application uses Supabase Authentication. To access admin features:

1. Create a user in your Supabase project (Authentication → Users)
2. Navigate to `/login`
3. Sign in with your credentials
4. Access the admin panel at `/admin`

## 🎨 Customization

### Theme

The app supports dark and light themes. Theme preference is persisted in localStorage.

### Styling

- Modify `tailwind.config.ts` for Tailwind customization
- Update `src/index.css` for global styles
- Edit component styles in individual component files

### Content

- Posts are managed through the admin dashboard
- Cover images can be uploaded or linked externally
- Markdown-style content is supported in posts

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests with Playwright
npx playwright test
```

## 🚢 Deployment

### Vercel (Recommended)

The project includes `vercel.json` configuration:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

Build the project and deploy the `dist` folder:

```bash
npm run build
# Deploy the dist/ directory to your hosting provider
```

**Environment Variables**: Don't forget to set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Vite](https://vitejs.dev/) for the blazing fast build tool

---

**Built with ❤️ for OJT documentation and sharing**
