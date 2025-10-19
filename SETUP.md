# Toyota Financing - Authentication Setup

This project implements a complete authentication system using Supabase Auth with role-based access control.

## Features Implemented

✅ **Backend Authentication**
- JWT token verification middleware
- Role-based route protection (`requireUser`, `requireRole`)
- Supabase integration with service role
- Protected API endpoints (`/api/me`, `/api/user/dashboard`, `/api/sales/dashboard`)

✅ **Frontend Authentication**
- Supabase client setup
- Authentication context with React hooks
- Sign up / Sign in pages with form validation
- Role-based routing and route guards
- Profile and Sales portal pages

✅ **Database Schema**
- Profiles table with role management
- Automatic profile creation on signup

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and keys
3. Create the profiles table:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'sales')),
  full_name TEXT
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow service role to manage profiles
CREATE POLICY "Service role can manage profiles" ON profiles
  FOR ALL USING (true);
```

### 2. Environment Variables

**Backend** (`/backend/.env`):
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`/frontend/.env`):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

### 3. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 4. Run the Application

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

## Usage

### Authentication Flow

1. **Sign Up**: Users can create accounts with email/password
2. **Sign In**: Existing users can sign in
3. **Role-based Redirect**: After login, users are redirected based on their role:
   - `user` role → `/profile`
   - `sales` role → `/dealer`

### Protected Routes

- `/profile` - Requires authentication (any role)
- `/dealer` - Requires `sales` role

### API Endpoints

- `POST /api/auth/signup` - Create new user account
- `GET /api/me` - Get current user info (protected)
- `GET /api/user/dashboard` - User dashboard (protected)
- `GET /api/sales/dashboard` - Sales dashboard (sales role only)

### Testing with Different Roles

To test sales role functionality:

1. Create a user account through the signup form
2. In Supabase dashboard, go to Authentication > Users
3. Find your user and note the UUID
4. In the SQL editor, run:
```sql
UPDATE profiles 
SET role = 'sales' 
WHERE id = 'your-user-uuid-here';
```
5. Sign out and sign back in - you'll be redirected to `/dealer`

## File Structure

```
backend/
├── src/
│   ├── auth.ts          # Authentication middleware
│   ├── supabase.ts      # Supabase client configuration
│   └── index.ts         # Main server with routes
└── package.json

frontend/
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── components/
│   │   └── ProtectedRoute.tsx # Route guards
│   ├── pages/
│   │   ├── SignIn.tsx         # Sign in/up page
│   │   ├── Profile.tsx        # User profile page
│   │   └── Dealer.tsx         # Sales portal page
│   ├── supabaseClient.ts      # Supabase client
│   └── main.tsx              # App with routing
└── package.json
```

## Security Features

- JWT token verification on all protected routes
- Role-based access control
- Row Level Security (RLS) enabled on profiles table
- CORS configuration for frontend-backend communication
- Environment variable protection for sensitive keys
