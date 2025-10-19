# User Authentication System

This document describes the user authentication system implemented for the Toyota Financing application.

## Features

### Backend Authentication
- **JWT-based authentication** with secure token generation and verification
- **Password hashing** using bcryptjs with salt rounds
- **User registration and login** endpoints
- **Protected routes** with authentication middleware
- **User profile management** with financial data storage
- **Document upload and storage** with file management
- **Car recommendation history** linked to user profiles

### Frontend Authentication
- **React Context** for global authentication state management
- **Protected routes** that require authentication
- **Login/Registration forms** with validation
- **User profile page** for managing documents and viewing saved data
- **Automatic token persistence** in localStorage
- **Dynamic navigation** based on authentication status

## Database Schema

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `password_hash`
- `first_name`
- `last_name`
- `created_at`
- `updated_at`

### User Profiles Table
- `id` (Primary Key)
- `user_id` (Foreign Key to Users)
- Financial data fields (income, expenses, credit score, etc.)
- `created_at`
- `updated_at`

### Documents Table
- `id` (Primary Key)
- `user_id` (Foreign Key to Users)
- `filename`
- `original_name`
- `file_path`
- `file_size`
- `mime_type`
- `uploaded_at`

### Car Recommendations Table
- `id` (Primary Key)
- `user_id` (Foreign Key to Users)
- `profile_id` (Foreign Key to User Profiles)
- `budget_car`
- `balanced_car`
- `premium_car`
- `recommendation_data` (JSON)
- `created_at`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/profile` - Save user profile
- `GET /api/auth/profile` - Get user profile

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get user documents
- `GET /api/documents/:id` - Download document
- `DELETE /api/documents/:id` - Delete document

### Car Recommendations
- `POST /api/generate` - Generate car recommendations (saves to user profile if authenticated)

## Setup Instructions

### Backend Setup
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create `.env` file based on `example.env`:
   ```bash
   cp example.env .env
   ```

3. Update `.env` with your values:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `JWT_SECRET` - A secure secret for JWT signing
   - `PORT` - Server port (default: 3000)

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

### For Users
1. **Register/Login**: Visit `/signin` to create an account or sign in
2. **Get Quote**: Use the car recommendation system at `/carRec`
3. **View Profile**: Access your profile at `/profile` to:
   - View saved financial information
   - Upload documents
   - Download previously uploaded files
   - Delete documents

### For Developers
- **Authentication Context**: Use `useAuth()` hook to access user state
- **Protected Routes**: Wrap components with `<ProtectedRoute>` for authentication
- **API Calls**: Include `Authorization: Bearer <token>` header for authenticated requests

## Security Features

- **Password Hashing**: All passwords are hashed with bcryptjs
- **JWT Tokens**: Secure token-based authentication
- **File Upload Validation**: Only allowed file types and size limits
- **User Isolation**: Users can only access their own data
- **Input Validation**: Server-side validation for all inputs

## File Storage

- Documents are stored in the `backend/uploads/` directory
- File metadata is stored in the database
- Users can only access their own uploaded files
- File size limit: 10MB
- Allowed file types: PDF, images, Word documents, text files
