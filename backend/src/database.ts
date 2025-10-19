import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database('./toyota_financing.db');

// Promisify database methods for async/await
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

// Helper function to run queries with parameters
const runQuery = (sql: string, params: any[] = []) => {
  return new Promise<any>((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const getQuery = (sql: string, params: any[] = []) => {
  return new Promise<any>((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const allQuery = (sql: string, params: any[] = []) => {
  return new Promise<any[]>((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'sales';
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  gross_monthly_income?: number;
  other_monthly_income?: number;
  fixed_monthly_expenses?: number;
  liquid_savings?: number;
  credit_score?: string;
  ownership_horizon?: string;
  annual_mileage?: string;
  passenger_needs?: string;
  commute_profile?: string;
  down_payment?: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  user_id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface CarRecommendation {
  id: number;
  user_id: number;
  profile_id: number;
  budget_car: string;
  balanced_car: string;
  premium_car: string;
  recommendation_data: string; // JSON string
  created_at: string;
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'sales')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add role column to existing users table if it doesn't exist
    await dbRun(`
      ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'sales'))
    `).catch(() => {
      // Column already exists, ignore error
    });

    // User profiles table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        gross_monthly_income INTEGER,
        other_monthly_income INTEGER,
        fixed_monthly_expenses INTEGER,
        liquid_savings INTEGER,
        credit_score TEXT,
        ownership_horizon TEXT,
        annual_mileage TEXT,
        passenger_needs TEXT,
        commute_profile TEXT,
        down_payment INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Documents table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Car recommendations table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS car_recommendations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        profile_id INTEGER NOT NULL,
        budget_car TEXT NOT NULL,
        balanced_car TEXT NOT NULL,
        premium_car TEXT NOT NULL,
        recommendation_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (profile_id) REFERENCES user_profiles (id) ON DELETE CASCADE
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// User operations
export async function createUser(email: string, passwordHash: string, firstName: string, lastName: string, role: 'user' | 'sales' = 'user'): Promise<number> {
  const result = await runQuery(
    'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
    [email, passwordHash, firstName, lastName, role]
  );
  return result.lastID;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await getQuery('SELECT * FROM users WHERE email = ?', [email]) as User | null;
}

export async function getUserById(id: number): Promise<User | null> {
  return await getQuery('SELECT * FROM users WHERE id = ?', [id]) as User | null;
}

// Profile operations
export async function createUserProfile(userId: number, profileData: Partial<UserProfile>): Promise<number> {
  const fields = Object.keys(profileData).filter(key => key !== 'id' && key !== 'user_id' && key !== 'created_at' && key !== 'updated_at');
  const values = fields.map(field => profileData[field as keyof UserProfile]);
  const placeholders = fields.map(() => '?').join(', ');
  
  const result = await runQuery(
    `INSERT INTO user_profiles (user_id, ${fields.join(', ')}) VALUES (?, ${placeholders})`,
    [userId, ...values]
  );
  return result.lastID;
}

export async function updateUserProfile(profileId: number, profileData: Partial<UserProfile>): Promise<void> {
  const fields = Object.keys(profileData).filter(key => key !== 'id' && key !== 'user_id' && key !== 'created_at' && key !== 'updated_at');
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => profileData[field as keyof UserProfile]);
  
  await runQuery(
    `UPDATE user_profiles SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [...values, profileId]
  );
}

export async function getUserProfile(userId: number): Promise<UserProfile | null> {
  return await getQuery('SELECT * FROM user_profiles WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId]) as UserProfile | null;
}

// Document operations
export async function createDocument(userId: number, filename: string, originalName: string, filePath: string, fileSize: number, mimeType: string): Promise<number> {
  const result = await runQuery(
    'INSERT INTO documents (user_id, filename, original_name, file_path, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, filename, originalName, filePath, fileSize, mimeType]
  );
  return result.lastID;
}

export async function getUserDocuments(userId: number): Promise<Document[]> {
  return await allQuery('SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC', [userId]) as Document[];
}

export async function getDocumentById(documentId: number, userId: number): Promise<Document | null> {
  return await getQuery('SELECT * FROM documents WHERE id = ? AND user_id = ?', [documentId, userId]) as Document | null;
}

export async function deleteDocument(documentId: number, userId: number): Promise<void> {
  await runQuery('DELETE FROM documents WHERE id = ? AND user_id = ?', [documentId, userId]);
}

// Car recommendation operations
export async function createCarRecommendation(userId: number, profileId: number, budgetCar: string, balancedCar: string, premiumCar: string, recommendationData: string): Promise<number> {
  const result = await runQuery(
    'INSERT INTO car_recommendations (user_id, profile_id, budget_car, balanced_car, premium_car, recommendation_data) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, profileId, budgetCar, balancedCar, premiumCar, recommendationData]
  );
  return result.lastID;
}

export async function getUserCarRecommendations(userId: number): Promise<CarRecommendation[]> {
  return await allQuery('SELECT * FROM car_recommendations WHERE user_id = ? ORDER BY created_at DESC', [userId]) as CarRecommendation[];
}

// Sales operations - access to all user data
export async function getAllUsers(): Promise<User[]> {
  return await allQuery('SELECT * FROM users ORDER BY created_at DESC') as User[];
}

export async function getAllUserProfiles(): Promise<(UserProfile & { user: User })[]> {
  return await allQuery(`
    SELECT up.*, u.email, u.first_name, u.last_name, u.role, u.created_at as user_created_at
    FROM user_profiles up
    JOIN users u ON up.user_id = u.id
    ORDER BY up.created_at DESC
  `) as (UserProfile & { user: User })[];
}

export async function getAllDocuments(): Promise<(Document & { user: User })[]> {
  return await allQuery(`
    SELECT d.*, u.email, u.first_name, u.last_name, u.role
    FROM documents d
    JOIN users u ON d.user_id = u.id
    ORDER BY d.uploaded_at DESC
  `) as (Document & { user: User })[];
}

export async function getAllCarRecommendations(): Promise<(CarRecommendation & { user: User })[]> {
  return await allQuery(`
    SELECT cr.*, u.email, u.first_name, u.last_name, u.role
    FROM car_recommendations cr
    JOIN users u ON cr.user_id = u.id
    ORDER BY cr.created_at DESC
  `) as (CarRecommendation & { user: User })[];
}

export async function getUserByIdForSales(userId: number): Promise<User | null> {
  return await getQuery('SELECT * FROM users WHERE id = ?', [userId]) as User | null;
}

export async function getUserProfileForSales(userId: number): Promise<UserProfile | null> {
  return await getQuery('SELECT * FROM user_profiles WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId]) as UserProfile | null;
}

export async function getUserDocumentsForSales(userId: number): Promise<Document[]> {
  return await allQuery('SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC', [userId]) as Document[];
}

export async function getUserCarRecommendationsForSales(userId: number): Promise<CarRecommendation[]> {
  return await allQuery('SELECT * FROM car_recommendations WHERE user_id = ? ORDER BY created_at DESC', [userId]) as CarRecommendation[];
}

export { db };
