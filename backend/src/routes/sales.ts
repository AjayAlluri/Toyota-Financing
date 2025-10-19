import express from 'express';
import { authenticateToken, requireSalesRole, AuthRequest } from '../auth.js';
import { 
  getAllUsers, 
  getAllUserProfiles, 
  getAllDocuments, 
  getAllCarRecommendations,
  getUserByIdForSales,
  getUserProfileForSales,
  getUserDocumentsForSales,
  getUserCarRecommendationsForSales
} from '../database.js';

const router = express.Router();

// All sales routes require authentication and sales role
router.use(authenticateToken);
router.use(requireSalesRole);

// Get all users
router.get('/users', async (req: AuthRequest, res) => {
  try {
    const users = await getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all user profiles
router.get('/profiles', async (req: AuthRequest, res) => {
  try {
    const profiles = await getAllUserProfiles();
    res.json({ profiles });
  } catch (error) {
    console.error('Get all profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all documents
router.get('/documents', async (req: AuthRequest, res) => {
  try {
    const documents = await getAllDocuments();
    res.json({ documents });
  } catch (error) {
    console.error('Get all documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all car recommendations
router.get('/recommendations', async (req: AuthRequest, res) => {
  try {
    const recommendations = await getAllCarRecommendations();
    res.json({ recommendations });
  } catch (error) {
    console.error('Get all recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific user details
router.get('/users/:userId', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await getUserByIdForSales(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific user profile
router.get('/users/:userId/profile', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const profile = await getUserProfileForSales(userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific user documents
router.get('/users/:userId/documents', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const documents = await getUserDocumentsForSales(userId);
    res.json({ documents });
  } catch (error) {
    console.error('Get user documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific user car recommendations
router.get('/users/:userId/recommendations', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const recommendations = await getUserCarRecommendationsForSales(userId);
    res.json({ recommendations });
  } catch (error) {
    console.error('Get user recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get complete user overview (user + profile + documents + recommendations)
router.get('/users/:userId/overview', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const [user, profile, documents, recommendations] = await Promise.all([
      getUserByIdForSales(userId),
      getUserProfileForSales(userId),
      getUserDocumentsForSales(userId),
      getUserCarRecommendationsForSales(userId)
    ]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user,
      profile,
      documents,
      recommendations
    });
  } catch (error) {
    console.error('Get user overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
