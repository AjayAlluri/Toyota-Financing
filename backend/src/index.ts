import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './supabase';
import { authenticateToken, requireUser, AuthenticatedRequest } from './auth';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Toyota Financing API is running!' });
});

// Public endpoint for testing
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Authentication endpoints
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Failed to create user' });
    }

    // Create user profile with default role 'user'
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        role: 'user',
        full_name: full_name || null
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Note: User is created but profile creation failed
      // In production, you might want to handle this differently
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: 'user',
        full_name: full_name || null
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user info (protected route)
app.get('/api/me', authenticateToken, requireUser, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: req.user
  });
});

// Protected user routes
app.get('/api/user/dashboard', authenticateToken, requireUser, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    message: 'Welcome to your dashboard!',
    user: req.user
  });
});

// Protected sales routes
app.get('/api/sales/dashboard', authenticateToken, requireUser, (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.role !== 'sales') {
    return res.status(403).json({ error: 'Access denied. Sales role required.' });
  }

  res.json({
    message: 'Welcome to the sales dashboard!',
    user: req.user
  });
});

// Admin endpoint to get all users (sales role only)
app.get('/api/admin/users', authenticateToken, requireUser, (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.role !== 'sales') {
    return res.status(403).json({ error: 'Access denied. Sales role required.' });
  }

  // In a real app, you'd fetch users from the database
  res.json({
    message: 'Admin users endpoint',
    user: req.user
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler - use a function instead of wildcard
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`⚡ Server running at http://localhost:${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/api/health`);
});