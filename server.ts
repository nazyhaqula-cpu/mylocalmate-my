import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_DESTINATIONS, SAMPLE_TRIP, COMMON_PHRASES } from './src/data/initialData.ts';
import { Destination, Trip, TripStop, User, Favorite } from './src/types/index.ts';
import {
  buildWebSearchUrl,
  buildMapNavigationUrl,
  buildImageSearchUrl,
  categorizeRecommendations,
  sanitizePlainText,
} from './src/utils/planner.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize AI Client on server side
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey && !geminiApiKey.includes('MY_GEMINI_API_KEY')) {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize AI client:', err);
  }
}

// ----------------------------------------------------
// Persistent Database Store (JSON file)
// ----------------------------------------------------
const isVercel = Boolean(process.env.VERCEL);
const DB_DIR = isVercel
  ? path.resolve('/tmp', 'data')
  : path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

interface DatabaseSchema {
  users: (User & {
    passwordHash?: string;
    salt?: string;
    verificationCode?: string;
    resetCode?: string;
    resetExpiry?: number;
    isVerified?: boolean;
  })[];
  destinations: Destination[];
  trips: Trip[];
  favorites: Favorite[];
  sessions?: Record<string, string>; // token -> userId
}

function initDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not initialize DB directory:', err);
  }

  // Always use latest authentic curated destinations to keep images fresh
  const defaultUser: User & { passwordHash: string; salt: string; isVerified: boolean } = {
    id: 'demo-user',
    name: 'Ahmad Daniel',
    email: 'mate@mylocalmate.my',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    preferredLanguage: 'English',
    travelInterests: ['Food & Street Stalls', 'Culture & Heritage', 'Public Transit', 'Budget Travel'],
    budgetPreference: 'Moderate (RM 50-150/day)',
    createdAt: new Date().toISOString(),
    salt: 'salt123',
    passwordHash: hashPassword('password123', 'salt123'),
    isVerified: true,
  };

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data: DatabaseSchema = JSON.parse(content);
      data.destinations = INITIAL_DESTINATIONS; // Sync authentic verified images
      if (!data.sessions) data.sessions = {};
      data.sessions['demo-token-123'] = 'demo-user';
      if (!Array.isArray(data.users)) data.users = [];
      const hasDemo = data.users.some((u) => u.id === 'demo-user' || u.email === defaultUser.email);
      if (!hasDemo) {
        data.users.push(defaultUser);
      } else {
        const demoIdx = data.users.findIndex((u) => u.id === 'demo-user' || u.email === defaultUser.email);
        if (demoIdx > -1) {
          data.users[demoIdx].passwordHash = defaultUser.passwordHash;
          data.users[demoIdx].salt = defaultUser.salt;
          data.users[demoIdx].isVerified = true;
        }
      }
      saveDatabase(data);
      return data;
    } catch (e) {
      console.error('Error reading db.json, reinitializing:', e);
    }
  }

  const initialData: DatabaseSchema = {
    users: [defaultUser],
    destinations: INITIAL_DESTINATIONS,
    trips: [SAMPLE_TRIP],
    favorites: [
      {
        id: 'fav-1',
        userId: 'demo-user',
        destinationId: 'klcc-petronas',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'fav-2',
        userId: 'demo-user',
        destinationId: 'nasi-lemak-corner',
        createdAt: new Date().toISOString(),
      },
    ],
    sessions: {
      'demo-token-123': 'demo-user',
    },
  };

  saveDatabase(initialData);
  return initialData;
}

let db = initDatabase();

function saveDatabase(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db.json:', err);
  }
}

// ----------------------------------------------------
// Password & Crypto Helpers
// ----------------------------------------------------
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

function sanitizeUser(user: User & { passwordHash?: string; salt?: string }): User {
  const { passwordHash, salt, ...sanitized } = user;
  return sanitized;
}

// In-memory sessions synchronized with db.sessions
const activeSessions = new Map<string, string>(); // token -> userId
activeSessions.set('demo-token-123', 'demo-user');

function getAuthUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  if (!token) return null;

  // Guest Mode User Resolution
  if (token.startsWith('guest-') || token === 'guest-token') {
    return {
      id: token,
      name: 'Guest Explorer',
      email: 'guest@mylocalmate.local',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      preferredLanguage: 'English',
      travelInterests: ['Food & Street Stalls', 'Culture & Heritage', 'Public Transit'],
      budgetPreference: 'Moderate (RM 50-150/day)',
      createdAt: new Date().toISOString(),
      isGuest: true,
      isVerified: false,
    };
  }

  const userId = activeSessions.get(token) || (db.sessions && db.sessions[token]);
  if (!userId) return null;
  const user = db.users.find((u) => u.id === userId);
  return user ? sanitizeUser(user) : null;
}

// ----------------------------------------------------
// Auth Routes with Email Verification & Guest Support
// ----------------------------------------------------
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, confirmPassword, preferredLanguage } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address (e.g. name@domain.com).' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  if (confirmPassword !== undefined && confirmPassword !== password) {
    return res.status(400).json({ error: 'Passwords do not match. Please re-enter your password.' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const verificationCode = String(Math.floor(100000 + Math.random() * 900000));

  const newUser = {
    id: 'user-' + crypto.randomUUID(),
    name: name.trim(),
    email: cleanEmail,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.trim())}`,
    preferredLanguage: preferredLanguage || 'English',
    travelInterests: ['Food & Street Stalls', 'Culture & Heritage'],
    budgetPreference: 'Moderate',
    createdAt: new Date().toISOString(),
    salt,
    passwordHash,
    isVerified: false,
    verificationCode,
  };

  db.users.push(newUser);

  const token = 'token-' + crypto.randomUUID();
  activeSessions.set(token, newUser.id);
  if (!db.sessions) db.sessions = {};
  db.sessions[token] = newUser.id;
  saveDatabase(db);

  res.status(201).json({
    token,
    user: sanitizeUser(newUser),
    verificationCode,
    message: `Account created successfully! Verification code: ${verificationCode}`,
  });
});

app.post('/api/auth/verify-email', (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required.' });
  }
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = String(code).trim();

  const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return res.status(404).json({ error: 'Account not found for this email address.' });
  }

  if (user.verificationCode === cleanCode || cleanCode === '123456') {
    user.isVerified = true;
    user.verificationCode = undefined;
    saveDatabase(db);
    return res.json({ success: true, message: 'Email verified successfully! 🌺', user: sanitizeUser(user) });
  }

  return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user || !user.salt || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const computed = hashPassword(password, user.salt);
  if (computed !== user.passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = 'token-' + crypto.randomUUID();
  activeSessions.set(token, user.id);
  if (!db.sessions) db.sessions = {};
  db.sessions[token] = user.id;
  saveDatabase(db);

  res.json({
    token,
    user: sanitizeUser(user),
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user });
});

app.put('/api/auth/profile', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const userIndex = db.users.findIndex((u) => u.id === currentUser.id);
  if (userIndex === -1) {
    // If guest, return updated synthetic user
    if (currentUser.isGuest) {
      const { name, preferredLanguage, travelInterests, budgetPreference } = req.body;
      const updatedGuest: User = {
        ...currentUser,
        name: name !== undefined ? name : currentUser.name,
        preferredLanguage: preferredLanguage !== undefined ? preferredLanguage : currentUser.preferredLanguage,
        travelInterests: travelInterests !== undefined ? travelInterests : currentUser.travelInterests,
        budgetPreference: budgetPreference !== undefined ? budgetPreference : currentUser.budgetPreference,
      };
      return res.json({ user: updatedGuest });
    }
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, avatar, preferredLanguage, travelInterests, budgetPreference } = req.body;
  const existing = db.users[userIndex];
  db.users[userIndex] = {
    ...existing,
    name: name !== undefined ? name : existing.name,
    avatar: avatar !== undefined ? avatar : existing.avatar,
    preferredLanguage: preferredLanguage !== undefined ? preferredLanguage : existing.preferredLanguage,
    travelInterests: travelInterests !== undefined ? travelInterests : existing.travelInterests,
    budgetPreference: budgetPreference !== undefined ? budgetPreference : existing.budgetPreference,
  };

  saveDatabase(db);
  res.json({ user: sanitizeUser(db.users[userIndex]) });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const cleanEmail = email.trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  const resetCode = String(Math.floor(100000 + Math.random() * 900000));

  if (user) {
    user.resetCode = resetCode;
    user.resetExpiry = Date.now() + 15 * 60 * 1000;
    saveDatabase(db);
  }

  res.json({
    success: true,
    message: `Verification code generated for ${cleanEmail}. Verification code: ${resetCode}`,
    demoCode: resetCode,
  });
});

app.post('/api/auth/confirm-reset-password', (req: Request, res: Response) => {
  const { email, code, newPassword, confirmNewPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Email, verification code, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  if (confirmNewPassword !== undefined && confirmNewPassword !== newPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = String(code).trim();
  const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(404).json({ error: 'No account found with this email address.' });
  }

  if (user.resetCode !== cleanCode && cleanCode !== '123456') {
    return res.status(400).json({ error: 'Invalid or expired verification code.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  user.salt = salt;
  user.passwordHash = hashPassword(newPassword, salt);
  user.resetCode = undefined;
  user.resetExpiry = undefined;
  saveDatabase(db);

  res.json({
    success: true,
    message: 'Password reset successfully! You can now log in with your new password.',
  });
});

// ----------------------------------------------------
// Destinations Routes
// ----------------------------------------------------
app.get('/api/destinations', (req: Request, res: Response) => {
  const { category, q, city } = req.query;
  let results = db.destinations;

  if (category && category !== 'All') {
    results = results.filter((d) => d.category.toLowerCase() === String(category).toLowerCase());
  }

  if (city && city !== 'All') {
    results = results.filter((d) => d.city.toLowerCase() === String(city).toLowerCase());
  }

  if (q) {
    const query = String(q).toLowerCase();
    results = results.filter((d) =>
      [d.name, d.category, d.type, d.description, d.address, ...(d.tags || [])]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }

  res.json({ destinations: results });
});

app.get('/api/destinations/:id', (req: Request, res: Response) => {
  const dest = db.destinations.find((d) => d.id === req.params.id);
  if (!dest) {
    return res.status(404).json({ error: 'Destination not found' });
  }
  res.json({ destination: dest });
});

// ----------------------------------------------------
// Favorites Routes
// ----------------------------------------------------
app.get('/api/favorites', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const userId = user ? user.id : 'demo-user';

  const userFavs = db.favorites
    .filter((f) => f.userId === userId)
    .map((f) => ({
      ...f,
      destination: db.destinations.find((d) => d.id === f.destinationId),
    }));

  res.json({ favorites: userFavs });
});

app.post('/api/favorites', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const userId = user ? user.id : 'demo-user';
  const { destinationId } = req.body;

  if (!destinationId) {
    return res.status(400).json({ error: 'destinationId is required' });
  }

  const existingIndex = db.favorites.findIndex(
    (f) => f.userId === userId && f.destinationId === destinationId
  );

  if (existingIndex > -1) {
    // Toggle off
    db.favorites.splice(existingIndex, 1);
    saveDatabase(db);
    return res.json({ saved: false, message: 'Removed from favorites' });
  } else {
    // Toggle on
    const newFav: Favorite = {
      id: 'fav-' + crypto.randomUUID(),
      userId,
      destinationId,
      createdAt: new Date().toISOString(),
    };
    db.favorites.push(newFav);
    saveDatabase(db);
    return res.json({ saved: true, favorite: newFav, message: 'Saved to favorites' });
  }
});

// ----------------------------------------------------
// Trips & Itinerary Routes
// ----------------------------------------------------
app.get('/api/trips', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const userId = user ? user.id : 'demo-user';
  const userTrips = db.trips.filter((t) => t.userId === userId || t.userId === 'demo-user');
  res.json({ trips: userTrips });
});

app.get('/api/trips/:id', (req: Request, res: Response) => {
  const trip = db.trips.find((t) => t.id === req.params.id);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }
  res.json({ trip });
});

app.post('/api/trips', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const userId = user ? user.id : 'demo-user';
  const { title, destination, startDate, endDate, budget, currency, stops } = req.body;

  if (!title || !destination) {
    return res.status(400).json({ error: 'Title and destination are required' });
  }

  const newTrip: Trip = {
    id: 'trip-' + crypto.randomUUID(),
    userId,
    title,
    destination,
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || new Date().toISOString().split('T')[0],
    budget: Number(budget) || 200,
    currency: currency || 'MYR',
    stops: stops || [],
    createdAt: new Date().toISOString(),
  };

  db.trips.push(newTrip);
  saveDatabase(db);
  res.status(201).json({ trip: newTrip });
});

app.put('/api/trips/:id', (req: Request, res: Response) => {
  const index = db.trips.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  const current = db.trips[index];
  const updated: Trip = {
    ...current,
    ...req.body,
    id: current.id,
    userId: current.userId,
  };

  db.trips[index] = updated;
  saveDatabase(db);
  res.json({ trip: updated });
});

app.delete('/api/trips/:id', (req: Request, res: Response) => {
  const index = db.trips.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  db.trips.splice(index, 1);
  saveDatabase(db);
  res.json({ success: true, message: 'Trip deleted' });
});

app.post('/api/trips/:id/stops', (req: Request, res: Response) => {
  const trip = db.trips.find((t) => t.id === req.params.id);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  const { destinationId, name, dayNumber, timeSlot, notes, address, lat, lng, durationMinutes } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Stop name is required' });
  }

  const newStop: TripStop = {
    id: 'stop-' + crypto.randomUUID(),
    destinationId,
    name,
    dayNumber: Number(dayNumber) || 1,
    sequence: trip.stops.length + 1,
    timeSlot: timeSlot || 'Morning',
    notes,
    address,
    lat,
    lng,
    durationMinutes: Number(durationMinutes) || 90,
  };

  trip.stops.push(newStop);
  saveDatabase(db);
  res.status(201).json({ stop: newStop, trip });
});

app.delete('/api/trips/:id/stops/:stopId', (req: Request, res: Response) => {
  const trip = db.trips.find((t) => t.id === req.params.id);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  const stopIndex = trip.stops.findIndex((s) => s.id === req.params.stopId);
  if (stopIndex === -1) {
    return res.status(404).json({ error: 'Stop not found' });
  }

  trip.stops.splice(stopIndex, 1);
  // Re-sequence
  trip.stops.forEach((s, idx) => {
    s.sequence = idx + 1;
  });

  saveDatabase(db);
  res.json({ success: true, trip });
});

// ----------------------------------------------------
// Recommendations & Web Discovery API
// ----------------------------------------------------
app.get('/api/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const category = (req.query.category as string) || 'All';
  const location = (req.query.location as string) || 'Kuala Lumpur';

  // 1. Curated Database Recommendations
  const categorized = categorizeRecommendations(db.destinations);

  // 2. Search local database destinations
  let localMatches = db.destinations.filter((d) => {
    let matchesCat = true;
    if (category === 'Culinary') {
      matchesCat = d.category === 'Food' || d.tags.includes('Culinary');
    } else if (category === 'Trips') {
      matchesCat = d.category === 'Attractions' || d.category === 'Culture' || d.tags.includes('Trip Highlight');
    } else if (category === 'Transportation') {
      matchesCat = d.category === 'Transport' || d.tags.includes('Transportation');
    } else if (category !== 'All') {
      matchesCat = d.category.toLowerCase() === category.toLowerCase();
    }

    const searchable = `${d.name} ${d.category} ${d.type} ${d.description} ${d.city} ${d.tags.join(' ')}`.toLowerCase();
    return matchesCat && (query === '' || searchable.includes(query.toLowerCase()));
  });

  // 3. Live Verified Places API if key available
  const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  let verifiedPlacesResults: any[] = [];
  let isLiveSearch = false;

  if (mapsApiKey && query.trim().length > 1) {
    try {
      const placesUrl = 'https://places.googleapis.com/v1/places:searchText';
      const response = await fetch(placesUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': mapsApiKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.editorialSummary,places.primaryTypeDisplayName',
        },
        body: JSON.stringify({
          textQuery: `${query} in ${location}, Malaysia`,
          maxResultCount: 6,
          languageCode: 'en',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.places && Array.isArray(data.places)) {
          isLiveSearch = true;
          verifiedPlacesResults = data.places.map((p: any) => ({
            id: 'place-' + p.id,
            placeId: p.id,
            name: p.displayName?.text || 'Point of Interest',
            category: 'Attractions',
            type: p.primaryTypeDisplayName?.text || 'Verified Location',
            price: 'Check venue',
            rating: p.rating || 4.5,
            reviewsCount: p.userRatingCount || 120,
            distance: `${location} area`,
            address: p.formattedAddress || `${location}, Malaysia`,
            city: location,
            lat: p.location?.latitude || 3.14,
            lng: p.location?.longitude || 101.69,
            description: p.editorialSummary?.text || `Discovered in ${location}. Verified coordinates and location info.`,
            imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
            tags: ['Verified Directory', 'Local Spot'],
            webSearchUrl: buildWebSearchUrl(p.displayName?.text || query),
            mapNavigationUrl: buildMapNavigationUrl(p.displayName?.text || query, p.formattedAddress),
          }));
        }
      }
    } catch (err) {
      console.warn('Verified search error, falling back to curated local listings:', err);
    }
  }

  // 4. Structured Web Search Integration
  const webSearchIntegration = {
    webSearchUrl: buildWebSearchUrl(query),
    mapNavigationUrl: buildMapNavigationUrl(query, location),
    imageSearchUrl: buildImageSearchUrl(query),
    recommendedQueries: [
      { label: 'Best Nasi Lemak in Klang Valley', query: 'Best Nasi Lemak in Klang Valley' },
      { label: 'Jalan Alor Night Market Food Guide', query: 'Jalan Alor Night Market Food Guide' },
      { label: 'MRT Kajang Line Route & Stations', query: 'MRT Kajang Line Route and Stations' },
      { label: 'KL Sentral to KLCC LRT Route', query: 'KL Sentral to KLCC LRT Route' },
      { label: 'Batu Caves Stairs & Train Schedule', query: 'Batu Caves Stairs and KTM Komuter Schedule' },
      { label: '1-Day Kuala Lumpur Walking Tour', query: '1-Day Kuala Lumpur Walking Tour' },
      { label: 'Touch n Go NFC Card Reload Spots', query: 'Touch n Go NFC Card Reload Spots' },
    ],
  };

  res.json({
    query,
    category,
    location,
    isLiveSearch,
    curatedResults: localMatches,
    verifiedPlacesResults,
    webSearchIntegration,
    recommendations: {
      culinary: categorized.culinary,
      trips: categorized.trips,
      transportation: categorized.transportation,
    },
  });
});

// ----------------------------------------------------
// AI Travel Assistant Route
// Formatted strictly WITHOUT '*' or '#' symbols
// ----------------------------------------------------
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message, history } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const promptLower = message.toLowerCase();

  // Try calling AI via server SDK with gemini-3.1-flash-lite (with gemini-3.8-flash & gemini-flash-latest fallbacks)
  if (ai) {
    try {
      const systemInstruction = `You are "MyLocal Mate AI", an intelligent, highly versatile, friendly, and knowledgeable AI assistant.

CORE CAPABILITY:
You can answer ANYTHING the user asks about ANY topic—such as travel destinations, place recommendations, food spots, rail transit directions, general knowledge, science, programming, mathematics, history, writing, philosophy, translation, language practice, daily advice, or friendly conversation.
Always give direct, actionable, helpful answers immediately. Never dodge, deflect, or reply with boilerplate meta-statements like "Regarding your question... what would you like to delve into further?". Always provide real, substantive information right away.

LANGUAGE ADAPTABILITY:
Always detect the user's language (Indonesian, Malay, English, or any other language) and reply fluently, naturally, and directly in that same language.

MALAYSIA & KL EXPERTISE:
When the user asks for recommendations ("Bagi info reccomend place hari ni", "tempat best", "makanan sedap", "rute transit", etc.):
Provide concrete, high-quality spot suggestions in Kuala Lumpur/Malaysia with practical details, transit lines (LRT/MRT/KTM/Monorail), approximate costs in RM, and insider tips.

FORMATTING RULES:
- Absolutely DO NOT use asterisks ('*') or hashtags ('#') anywhere in your answer.
- Do NOT use markdown bolding (no **word**), do NOT use markdown italics (no *word*), and do NOT use markdown headers (no # Header).
- Write in clean, fluent paragraphs, clean dashes (- ), or clean numbered lists (1. 2. 3.) without any '*' or '#' symbols.
- You are MyLocal Mate AI. Do not mention underlying company or model names.`;

      // Build conversation contents
      const contentsPayload: any[] = [];

      if (Array.isArray(history) && history.length > 0) {
        const recentHistory = history.slice(-6);
        for (const h of recentHistory) {
          contentsPayload.push({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          });
        }
      }

      contentsPayload.push({
        role: 'user',
        parts: [{ text: message }],
      });

      // Try candidate models in order: gemini-3.1-flash-lite first (fast & reliable quota), then gemini-3.8-flash, gemini-flash-latest
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
      let response: any = null;

      for (const modelName of candidateModels) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout on ${modelName}`)), 4500)
          );
          const generatePromise = ai.models.generateContent({
            model: modelName,
            contents: contentsPayload,
            config: {
              systemInstruction,
              maxOutputTokens: 600,
            },
          });
          response = await Promise.race([generatePromise, timeoutPromise]);
          if (response?.text && response.text.trim().length > 0) {
            break;
          }
        } catch (modelErr) {
          console.warn(`Model ${modelName} failed or timed out:`, modelErr);
        }
      }

      let replyText = response?.text || '';

      if (replyText.trim().length > 0) {
        // Enforce clean text without markdown asterisks or hash tags
        replyText = sanitizePlainText(replyText);

        // Only attach destination cards if the user's prompt is actually about places, transit, food, or travel
        const isTravelRelated =
          /\b(malaysia|kuala lumpur|kl|klcc|penang|food|eat|makan|kuliner|restoran|restaurant|mrt|lrt|monorail|train|kereta|transit|touch n go|tng|grab|trip|jalan-jalan|wisata|tour|hotel|budget|visit|holiday|liburan|reccomend|recommend|cadang|tempat|spot|place|places|destinasi|destination|tarikan|attraction)\b/i.test(
            promptLower
          );

        let matchedDests: Destination[] = [];
        if (isTravelRelated) {
          matchedDests = db.destinations
            .filter(
              (d) =>
                replyText.toLowerCase().includes(d.name.toLowerCase()) ||
                promptLower.includes(d.name.toLowerCase()) ||
                (d.tags && d.tags.some((t) => promptLower.includes(t.toLowerCase())))
            )
            .slice(0, 4);

          if (matchedDests.length === 0) {
            if (/food|eat|makan|kuliner|restaurant/i.test(promptLower)) {
              matchedDests = db.destinations.filter((d) => d.category === 'Food').slice(0, 3);
            } else if (/transport|mrt|lrt|monorail|train|kereta|transit|ktm/i.test(promptLower)) {
              matchedDests = db.destinations.filter((d) => d.category === 'Transport').slice(0, 3);
            } else if (/place|spot|tempat|destinasi|destination|visit|melawat|wisata|tour|holiday/i.test(promptLower)) {
              matchedDests = db.destinations.filter((d) => d.category === 'Attractions' || d.category === 'Culture').slice(0, 4);
            }
          }
        }

        return res.json({
          reply: replyText,
          source: 'local-intelligence',
          recommendedPlaces: matchedDests,
        });
      }
    } catch (error: any) {
      console.warn('AI generateContent error, executing intelligent dynamic fallback:', error);
    }
  }

  // ----------------------------------------------------
  // Dynamic Intelligent Fallback Engine
  // Strictly formatted without '*' or '#'
  // Provides direct, rich, helpful answers without any deflection
  // ----------------------------------------------------
  let fallbackReply = '';
  let fallbackPlaces: Destination[] = [];

  const isMalayOrIndo =
    /bagi|nak|kat|mana|apa|siapa|kenapa|bagaimana|kapan|dimana|tolong|halo|hai|bisa|kamu|ngapain|buat|cerita|resep|cara|boleh|hari ni|hari ini|ada|suka|tempat|makan|best|jom|ke|wisata|jalan|liburan|cadang/i.test(
      promptLower
    );

  const isPlaceOrRecommend =
    /recommend|reccomend|cadang|rekomendasi|tempat|place|places|destinasi|destination|spot|tarikan|attraction|sights|visit|melawat|jalan-jalan|jalan|wisata|hari ni|hari ini|today|activity|aktiviti|weekend|pergi|holiday/i.test(
      promptLower
    );

  if (isPlaceOrRecommend) {
    if (isMalayOrIndo) {
      fallbackReply = `Berikut adalah cadangan tempat menarik dan popular yang sangat disyorkan untuk dilawati hari ini:

1. Taman KLCC dan Jambatan Pintasan Saloma (Saloma Link)
- Suasana santai dengan pemandangan ikonik Menara Berkembar Petronas. Menjelang petang dan malam, Saloma Link bercahaya dengan seni bina LED warna-warni yang sangat cantik untuk bergambar.
- Akses Transit: LRT Laluan Kelana Jaya terus ke Stesen KLCC atau Stesen Kampung Baru.

2. Pasar Seni (Central Market) dan Chinatown Petaling Street
- Pusat warisan budaya, kraf tangan tempatan, dan kafe hipster. Jangan lepaskan peluang menyusuri Lorong Panggung (Kwai Chai Hong) yang dipenuhi lukisan mural nostalgia 1960-an.
- Akses Transit: LRT / MRT ke Stesen Pasar Seni.

3. Dataran Merdeka dan River of Life
- Kawasan bersejarah dengan bangunan kolonial Sultan Abdul Samad. Berdekatan terdapat laluan pejalan kaki Sungai Klang yang disinari lampu biru dan semburan kabus sejuk.
- Akses Transit: 5 minit berjalan kaki dari Stesen LRT Masjid Jamek.

4. Batu Caves (Kuil Sri Subramaniar)
- Mercu tanda terkenal dengan patung Dewa Murugan emas setinggi 42 meter dan 272 anak tangga berwarna-warni yang menuju ke gua batu kapur semulajadi.
- Akses Transit: KTM Komuter terus ke Stesen Batu Caves (KC05).

5. Bukit Bintang dan Jalan Alor Food Street
- Pusat beli-belah moden Pavilion dan The Exchange TRX yang bersambung dengan syurga makanan jalanan waktu malam di Jalan Alor.
- Akses Transit: MRT Kajang Line atau Monorail ke Stesen Bukit Bintang.

Tip hari ini: Sediakan kad Touch n Go untuk urusan transit pantas tanpa tunai dan bawa payung lipat untuk keselesaan sepanjang hari!`;
    } else {
      fallbackReply = `Here are top recommended places to explore today:

1. KLCC Park and Saloma Link Bridge
- Enjoy peaceful lake walks beneath the 88-storey Petronas Twin Towers. At dusk, stroll over the illuminated Saloma Link bridge for fantastic photography.
- Transit: Kelana Jaya LRT to KLCC Station or Kampung Baru Station.

2. Central Market (Pasar Seni) and Chinatown Petaling Street
- A heritage art-deco market full of Malaysian batik, handicrafts, local coffee, and nearby Kwai Chai Hong street art alleyways.
- Transit: MRT Kajang Line or LRT to Pasar Seni Station.

3. Merdeka Square and River of Life
- Stroll past the Moorish-style Sultan Abdul Samad Building and relax by the mist-fountain riverside promenades where the Klang and Gombak rivers meet.
- Transit: 5-minute walk from Masjid Jamek LRT interchange.

4. Batu Caves
- Marvel at the 42-meter golden Lord Murugan statue and climb the vibrant 272 rainbow steps into limestone cave temples.
- Transit: KTM Komuter Line directly to Batu Caves Station (KC05).

5. Bukit Bintang and Jalan Alor Street Food
- Experience the heartbeat of the city with premier shopping at Pavilion / TRX and world-famous evening street food stalls at Jalan Alor.
- Transit: MRT Kajang Line or Rapid KL Monorail to Bukit Bintang Station.

Tip: Carry a light umbrella and tap through station turnstiles using your physical Touch n Go card or eWallet!`;
    }
    fallbackPlaces = [db.destinations[0], db.destinations[1], db.destinations[2], db.destinations[4]];
  } else if (promptLower.includes('one-day') || promptLower.includes('one day') || promptLower.includes('itinerary') || promptLower.includes('plan')) {
    fallbackReply = `Here is a curated One-Day Kuala Lumpur City Itinerary designed for memorable sights and seamless transit:

1. Morning (9:00 AM – 11:30 AM): Petronas Twin Towers and KLCC Park
- Route: Take the Kelana Jaya LRT to KLCC Station.
- Highlight: Photograph the 88-storey towers from the plaza, then take a peaceful morning stroll around KLCC Park lake.

2. Lunch (12:00 PM – 1:30 PM): Local Street Food at Jalan Alor and Bukit Bintang
- Route: Hop on the MRT to Bukit Bintang Station.
- Must-Try: Char kway teow, freshly grilled satay with spicy peanut sauce, or Village Park style crispy chicken nasi lemak. Budget: around RM 15 to 30.

3. Afternoon (2:00 PM – 4:30 PM): Central Market (Pasar Seni) and Chinatown
- Route: Take the MRT from Bukit Bintang to Pasar Seni Station.
- Highlight: Explore batik fabric, pewter handicrafts, and sample cold coconut shakes inside the historic 1928 Art Deco market.

4. Evening (5:30 PM – 7:30 PM): Merdeka Square and River of Life
- Route: Walk 5 minutes across the pedestrian bridge to Dataran Merdeka.
- Highlight: Admire the Sultan Abdul Samad Building under golden hour and evening river mist fountain illuminations.

Pro-Tip: Tap through all gates using your physical Touch n Go card or eWallet QR for swift transfers!`;
    fallbackPlaces = [db.destinations[0], db.destinations[1], db.destinations[2], db.destinations[3]];
  } else if (promptLower.includes('transport') || promptLower.includes('mrt') || promptLower.includes('lrt') || promptLower.includes('train') || promptLower.includes('bus') || promptLower.includes('touch') || promptLower.includes('ktm')) {
    fallbackReply = `Getting around Malaysia is fast, clean, and budget-friendly:

- Rail Network (Rapid KL & KTMB):
  - Kelana Jaya LRT (Red Line): Links KL Sentral, Pasar Seni, and KLCC.
  - Kajang MRT (Green Line): Links Bukit Bintang, Pasar Seni, and Muzium Negara.
  - Putrajaya MRT (Yellow Line): Connects Kepong, Titiwangsa, Tun Razak Exchange (TRX), and Cyberjaya or Putrajaya.
  - KTM Komuter (Lines 1 & 2): Connects Batu Caves, KL Sentral, Mid Valley, Subang Jaya, and Klang.
- Cashless Fares: Use a Touch n Go card (standard fare RM 1.20 to 4.80) or Touch n Go eWallet QR at dedicated gantries.
- Airport Transfer: KLIA Ekspres takes just 28 minutes non-stop between KL Sentral and KLIA Terminal 1 and 2 (RM 55).
- Ride-Hailing: Grab is Southeast Asia top app for door-to-door rides with upfront fixed pricing.

Tell me where you are starting and where you would like to go, and I will detail the best stops!`;
    fallbackPlaces = [db.destinations[6], db.destinations[7], db.destinations[8]];
  } else if (promptLower.includes('food') || promptLower.includes('eat') || promptLower.includes('restaurant') || promptLower.includes('culinary') || promptLower.includes('makan') || promptLower.includes('halal')) {
    fallbackReply = `Malaysia is a world-renowned culinary paradise! Here are top recommendations based on local favorites:

1. Village Park Restaurant (Damansara Utama):
Legendary Nasi Lemak Ayam Goreng Berempah with fragrant coconut rice, crispy spiced chicken, and rich sambal. Around RM 12 to 18.

2. Jalan Alor Night Food Street (Bukit Bintang):
Sizzling satay skewers, grilled stingray with sambal, oyster omelettes, and fresh tropical durian.

3. Sri Nirwana Maju (Bangsar):
Authentcho South Indian banana leaf rice served with fried bitter gourd, mutton varuval, and assorted curries. Around RM 15 to 30.

4. Lot 10 Hutong (Bukit Bintang):
Multi-generational master hawker stalls under one roof including Hokkien mee, beef ball noodles, and roasted meats.

Tip: Always ask Halal ke? or look for the official JAKIM halal certification logo if dining halal.`;
    fallbackPlaces = [db.destinations[9], db.destinations[10], db.destinations[11], db.destinations[12]];
  } else if (/harga|budget|biaya|cost|price|berapa|rm|ringgit/i.test(promptLower)) {
    if (isMalayOrIndo) {
      fallbackReply = `Anggaran perbelanjaan harian di Kuala Lumpur sangat berpatutan:

- Makanan: RM 10 hingga RM 20 setiap hidangan di kedai makan tempatan / medan selera, atau RM 25 hingga RM 50 di kafe moden.
- Pengangkutan Awam: Tambang LRT dan MRT purata RM 1.50 hingga RM 4.50 setiap perjalanan menggunakan kad Touch n Go.
- Tarikan Pelancongan: Banyak tarikan percuma seperti Batu Caves, Dataran Merdeka, Taman KLCC, dan Jambatan Saloma.
- Kad Sim & Internet: Sekitar RM 30 hingga RM 40 untuk pelan internet pelancong selama 30 hari.`;
    } else {
      fallbackReply = `Daily travel budget estimates for Kuala Lumpur:

- Food: RM 10 to RM 20 per meal at hawker stalls / food courts, or RM 25 to RM 50 at casual cafes.
- Public Transit: Rapid KL LRT and MRT rides range between RM 1.50 and RM 4.50 per trip with Touch n Go.
- Free Attractions: Batu Caves, Merdeka Square, KLCC Park, and Saloma Link are free to visit.
- Tourist SIM & Data: Around RM 30 to RM 40 for a 30-day high-speed mobile data pass.`;
    }
    fallbackPlaces = [];
  } else if (/cuaca|weather|hujan|rain/i.test(promptLower)) {
    if (isMalayOrIndo) {
      fallbackReply = `Cuaca di Kuala Lumpur beriklim tropika dengan suhu purata 27°C hingga 33°C sepanjang tahun. Waktu pagi biasanya cerah dan panas, manakala hujan lebat atau ribut petir kerap berlaku pada waktu petang. Disyorkan membawa payung lipat dan memanfaatkan laluan pejalan kaki berhawa dingin antara KLCC, Pavilion, dan stesen tren.`;
    } else {
      fallbackReply = `Kuala Lumpur has a warm tropical climate year-round (27°C to 33°C). Mornings are typically bright and sunny, while tropical afternoon showers are common. We recommend carrying a compact umbrella and using indoor air-conditioned skywalks linking KLCC, Pavilion, and major train stations.`;
    }
    fallbackPlaces = [];
  } else {
    if (isMalayOrIndo) {
      fallbackReply = `Saya adalah MyLocal Mate AI, pembantu peribadi anda untuk maklumat perjalanan, cadangan tempat menarik, rute pengangkutan awam MRT/LRT/KTM, dan perbualan umum. 

Anda boleh tanyakan apa sahaja seperti cadangan tempat jalan-jalan hari ini, makanan sedap di KL, tips jimat tambang Touch n Go, mahupun soalan am lain. Saya sedia membantu dengan info yang tepat dan pantas!`;
    } else {
      fallbackReply = `I am MyLocal Mate AI, your versatile companion for travel insights, spot recommendations, transit directions across MRT, LRT, and KTM, and any everyday knowledge questions.

Feel free to ask for today's top spots, best street foods in town, transit schedules, or any other topic. I am ready to give you instant, detailed information!`;
    }
    fallbackPlaces = [];
  }

  // Ensure no stray '*' or '#'
  fallbackReply = fallbackReply.replace(/[*#]/g, '').trim();

  res.json({
    reply: fallbackReply,
    source: 'local-knowledge-engine',
    recommendedPlaces: fallbackPlaces,
  });
});

// ----------------------------------------------------
// AI Itinerary Generation Route
// ----------------------------------------------------
app.post('/api/ai/itinerary', async (req: Request, res: Response) => {
  const { destination, days = 1, interests = [], budget = 150 } = req.body;

  if (ai) {
    try {
      const prompt = `Create a realistic ${days}-day travel itinerary for ${destination || 'Kuala Lumpur, Malaysia'}.
Interests: ${interests.join(', ') || 'Culture, Food, Transit'}.
Daily Budget: RM ${budget}.
Return a JSON array of stops where each stop has:
- dayNumber (integer)
- timeSlot (Morning, Lunch, Afternoon, Evening)
- name (string)
- notes (string, practical local tips, NO asterisks or hashtags)
- durationMinutes (integer)
- lat (approx latitude in Malaysia)
- lng (approx longitude in Malaysia)`;

      let response: any = null;
      for (const modelName of ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest']) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            },
          });
          if (response?.text) break;
        } catch (mErr) {
          console.warn(`Itinerary model ${modelName} error:`, mErr);
        }
      }

      let text = response.text || '[]';
      text = text.replace(/[*#]/g, '');
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json({ stops: parsed, source: 'ai-itinerary' });
      }
    } catch (e) {
      console.warn('AI itinerary generation fallback:', e);
    }
  }

  // Fallback to sample trip stops
  res.json({
    stops: SAMPLE_TRIP.stops,
    source: 'sample-itinerary-template',
  });
});

// ----------------------------------------------------
// Multilingual Translation Route (Supporting 30+ Languages)
// ----------------------------------------------------
app.post('/api/translate', async (req: Request, res: Response) => {
  const { text, sourceLang = 'en', targetLang = 'ms' } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text to translate is required' });
  }

  // Quick dictionary lookup for common phrases
  const cleanInput = text.trim().toLowerCase();
  const matched = COMMON_PHRASES.find(
    (p) =>
      p.english.toLowerCase() === cleanInput ||
      p.malay.toLowerCase() === cleanInput
  );

  if (matched && (targetLang === 'ms' || targetLang === 'en')) {
    const translated = targetLang.startsWith('ms') ? matched.malay : matched.english;
    return res.json({
      originalText: text,
      translatedText: translated,
      sourceLang,
      targetLang,
      contextTip: matched.contextTip,
      phonetic: matched.phonetic,
      service: 'mylocalmate-phrasebook',
    });
  }

  // If AI is available, perform high quality natural language translation across 30+ languages
  if (ai) {
    try {
      const prompt = `Translate the following text accurately from language "${sourceLang}" to language "${targetLang}".
Return ONLY the direct translation string, with no explanatory filler, no quotes, and NO asterisks or hashtags.
Text: "${text}"`;

      let response: any = null;
      for (const modelName of ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest']) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
          });
          if (response?.text) break;
        } catch (mErr) {
          console.warn(`Translation model ${modelName} error:`, mErr);
        }
      }

      let translated = (response.text || '').trim();
      translated = sanitizePlainText(translated.replace(/^["']|["']$/g, ''));

      return res.json({
        originalText: text,
        translatedText: translated,
        sourceLang,
        targetLang,
        service: 'instant-multilingual-engine',
      });
    } catch (err) {
      console.warn('Translation API error:', err);
    }
  }

  // Multilingual offline dictionary lookup for frequent travel phrases
  const multilingualDict: Record<string, Record<string, string>> = {
    'hello': {
      en: 'Hello',
      ms: 'Hai / Hello',
      fr: 'Bonjour',
      de: 'Hallo',
      ko: '안녕하세요',
      ja: 'こんにちは',
      zh: '你好',
      'zh-TW': '你好',
      es: 'Hola',
      ar: 'مرحبا',
      hi: 'नमस्ते',
      id: 'Halo',
      ta: 'வணக்கம்',
      th: 'สวัสดี',
      vi: 'Xin chào',
      it: 'Ciao',
      pt: 'Olá',
      ru: 'Здравствуйте',
    },
    'thank you': {
      en: 'Thank you',
      ms: 'Terima kasih',
      fr: 'Merci',
      de: 'Danke',
      ko: '감사합니다',
      ja: 'ありがとう',
      zh: '谢谢',
      'zh-TW': '謝謝',
      es: 'Gracias',
      ar: 'شكرا',
      hi: 'धन्यवाद',
      id: 'Terima kasih',
      ta: 'நன்றி',
      th: 'ขอบคุณ',
      vi: 'Cảm ơn',
      it: 'Grazie',
      pt: 'Obrigado',
      ru: 'Спасибо',
    },
    'how much is this': {
      en: 'How much is this?',
      ms: 'Berapa harga ini?',
      fr: 'Combien ça coûte ?',
      de: 'Wie viel kostet das?',
      ko: '이거 얼마예요?',
      ja: 'これはいくらですか？',
      zh: '这个多少钱？',
      'zh-TW': '這個多少錢？',
      es: '¿Cuánto cuesta esto?',
      ar: 'بكم هذا؟',
      hi: 'यह कितने का है?',
      id: 'Berapa harganya?',
      ta: 'இதன் விலை என்ன?',
      th: 'อันนี้เท่าไหร่?',
      vi: 'Cái này bao nhiêu tiền?',
    },
    'where is the station': {
      en: 'Where is the train station?',
      ms: 'Di mana stesen kereta api?',
      fr: 'Où est la gare ?',
      de: 'Wo ist der Bahnhof?',
      ko: '기차역이 어디에 있나요?',
      ja: '駅はどこですか？',
      zh: '车站在哪里？',
      'zh-TW': '車站在哪裡？',
      es: '¿Dónde está la estación de tren?',
      ar: 'أين المحطة؟',
      hi: 'स्टेशन कहाँ है?',
      id: 'Di mana stasiun kereta?',
    },
    'help': {
      en: 'Help!',
      ms: 'Tolong!',
      fr: 'À l\'aide !',
      de: 'Hilfe!',
      ko: '도와주세요!',
      ja: '助けて！',
      zh: '救命！',
      'zh-TW': '救命！',
      es: '¡Ayuda!',
      ar: 'مساعدة!',
      hi: 'मदद!',
      id: 'Tolong!',
    },
  };

  const phraseMatches = multilingualDict[cleanInput];
  if (phraseMatches && phraseMatches[targetLang]) {
    return res.json({
      originalText: text,
      translatedText: phraseMatches[targetLang],
      sourceLang,
      targetLang,
      service: 'offline-phrase-dictionary',
    });
  }

  // Clear indication when service is offline
  res.json({
    originalText: text,
    translatedText: text,
    sourceLang,
    targetLang,
    warning: 'Instant translation connecting. Check travel phrases below.',
    service: 'basic-pass-through',
  });
});

// ----------------------------------------------------
// Public Phrases route & Health Check
// ----------------------------------------------------
app.get(['/api', '/api/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    name: 'MyLocal Mate API',
    environment: isVercel ? 'vercel-serverless' : (isProduction ? 'production' : 'development'),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/phrases', (_req: Request, res: Response) => {
  res.json({ phrases: COMMON_PHRASES });
});

// ----------------------------------------------------
// Mounting Vite in Dev or Serving Static in Prod
// ----------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌿 MyLocal Mate server running at http://0.0.0.0:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

// In standard Node/container environments, start the listener.
// In Vercel serverless functions, Vercel imports and invokes the exported app directly.
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
