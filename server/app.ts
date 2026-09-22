import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { defaultCmsDatabase } from '../src/data/defaultData';
import { CmsDatabase, SiteSettings } from '../src/types';
import {
  getCmsContent,
  saveCmsContent,
  getEnquiries,
  saveEnquiry,
  updateEnquiryStatus,
  deleteEnquiry as removeEnquiry,
  getUsers,
  getUserById,
  getUserByUsernameOrEmail,
  saveUser,
  deleteUser as removeUser,
  getBootstrapStatus,
  markBootstrapped,
  getAuditLogs,
  addAuditLog,
  clearAuditLogs,
  uploadMedia,
  isUsingAdminSdk,
  StoredUser,
  StoredEnquiry,
  StoredAuditEntry,
} from './firebase';

dotenv.config();

const app = express();

// Trust proxy for Vercel and Cloud Run container ingress (needed for correct client IP detection)
app.set('trust proxy', 1);

// Security headers middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// JSON body parser with 40mb limit for media/base64 uploads
app.use(express.json({ limit: '40mb' }));
app.use(express.urlencoded({ extended: true, limit: '40mb' }));

// Static public directory serving when running locally
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch {
    // Ignore in read-only / serverless environments
  }
}
app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// -----------------------------------------------------------------------------
// 1. LIGHTWEIGHT IN-MEMORY SLIDING-WINDOW RATE LIMITER
// -----------------------------------------------------------------------------
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodically clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = 15 * 60 * 1000;
  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < maxAge);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref?.();

function createRateLimiter(options: { windowMs: number; max: number; message: string }) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const key = `${req.baseUrl || ''}${req.path}:${clientIp}`;
    const now = Date.now();

    let record = rateLimitStore.get(key);
    if (!record) {
      record = { timestamps: [] };
      rateLimitStore.set(key, record);
    }

    // Filter out timestamps outside the current sliding window
    record.timestamps = record.timestamps.filter((ts) => now - ts < options.windowMs);

    if (record.timestamps.length >= options.max) {
      const oldest = record.timestamps[0];
      const retryAfterSeconds = Math.ceil((options.windowMs - (now - oldest)) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        error: options.message,
        retryAfterSeconds,
      });
    }

    record.timestamps.push(now);
    next();
  };
}

// Rate limit policies
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many authentication attempts from this network. Please wait 15 minutes before trying again.',
});

const enquiryRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: 'Submission limit reached. To prevent abuse, please wait a few minutes before submitting another enquiry.',
});

const adminRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  message: 'Administrative request limit reached. Please slow down your requests.',
});

// -----------------------------------------------------------------------------
// 2. STATELESS CRYPTOGRAPHIC TOKENS (JWT / HMAC-SHA256)
// -----------------------------------------------------------------------------
const SESSION_SECRET = process.env.SESSION_SECRET || 'dzinopona-farms-secure-secret-key-2026';

export interface TokenPayload {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  role: 'admin' | 'editor';
  permissions?: StoredUser['permissions'];
  iat: number;
  exp: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64').toString('utf8');
}

function generateSessionToken(user: StoredUser): string {
  const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 7 * 24 * 60 * 60; // 7 days

  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    iat: now,
    exp,
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifySessionToken(token: string): TokenPayload | null {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Password hashing & verification
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function verifyPassword(password: string, salt: string, hash: string): boolean {
  try {
    const computed = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  } catch {
    return false;
  }
}

// -----------------------------------------------------------------------------
// 3. AUDIT LOGGING HELPER
// -----------------------------------------------------------------------------
async function logAudit(
  user: { username: string; fullName?: string; role?: 'admin' | 'editor' | 'system'; id?: string } | string,
  action: string,
  module: string,
  summary: string,
  extra?: {
    recordId?: string;
    recordName?: string;
    details?: string;
    previousValue?: string;
    newValue?: string;
  }
) {
  try {
    const username: string = typeof user === 'string' ? user : user.username;
    const fullName: string = typeof user === 'string' ? user : user.fullName || user.username;
    const role: 'admin' | 'editor' | 'system' = typeof user === 'string' ? 'admin' : user.role || 'admin';
    const userId: string | undefined = typeof user === 'string' ? undefined : user.id;

    const entry: StoredAuditEntry = {
      id: `audit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      timestamp: new Date().toISOString(),
      userId,
      username,
      fullName,
      role,
      action,
      module,
      section: module,
      summary,
      recordId: extra?.recordId,
      recordName: extra?.recordName,
      details: extra?.details || summary,
      previousValue: extra?.previousValue,
      newValue: extra?.newValue,
    };

    await addAuditLog(entry);
  } catch (err: any) {
    console.warn('Audit logging non-fatal error:', err?.message || err);
  }
}

// -----------------------------------------------------------------------------
// 4. AUTHORIZATION MIDDLEWARES
// -----------------------------------------------------------------------------

// Authenticated user (Admin or active Editor)
async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : (req.headers['x-admin-token'] as string);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required to access internal CMS.' });
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Session expired or invalid. Please authenticate again.' });
  }

  const user = await getUserById(payload.userId);
  if (!user || user.isActive === false) {
    return res.status(403).json({ error: 'Forbidden: Account has been deactivated. Please contact the Administrator.' });
  }

  (req as any).user = {
    ...payload,
    role: user.role,
    permissions: user.permissions || payload.permissions,
  };
  next();
}

// Strict Administrator authority (highest-level)
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  requireAuth(req, res, () => {
    const user = (req as any).user as TokenPayload;
    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden: Highest-level Administrator authority required. Editor accounts are strictly prohibited from accessing this function.',
      });
    }
    next();
  });
}

// Subordinate permission validator (checks if editor has specific assigned permission; Admin is always allowed)
function requirePermission(permKey: keyof StoredUser['permissions']) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    requireAuth(req, res, () => {
      const user = (req as any).user as TokenPayload;
      if (user.role === 'admin') {
        return next();
      }

      if (user.permissions && user.permissions[permKey] === false) {
        return res.status(403).json({
          error: `Forbidden: Your Editor account does not have permission to ${permKey}. Please request authorization from your Administrator.`,
        });
      }

      next();
    });
  };
}

// -----------------------------------------------------------------------------
// 5. PUBLIC API ROUTES
// -----------------------------------------------------------------------------

// API Root endpoint
app.get('/api', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dzinopona Farms API service operational.',
  });
});

// Production Health Endpoint: independent of unnecessary state, returns 200 when function is functioning
app.get('/api/health', async (_req, res) => {
  try {
    let dbStatus = 'connected';
    try {
      dbStatus = isUsingAdminSdk ? 'firestore-admin' : 'firestore';
    } catch {
      dbStatus = 'degraded';
    }

    return res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '2.5.0',
      database: dbStatus,
      environment: process.env.VERCEL ? 'vercel-serverless' : 'standalone-server',
    });
  } catch (err: any) {
    return res.status(200).json({
      success: true,
      status: 'healthy',
      notice: 'Service active with degraded diagnostics',
    });
  }
});

// Public Content Endpoint (Serves approved website content)
app.get('/api/content', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=10, stale-while-revalidate=60');
    const content = await getCmsContent();
    res.json(content);
  } catch (err: any) {
    console.error('Error serving content:', err?.message || err);
    res.status(500).json({ error: 'Internal server error loading content.' });
  }
});

// Public Commercial Enquiry & Off-take Submission
app.post('/api/enquiries', enquiryRateLimiter, async (req, res) => {
  try {
    const { name, organization, email, phone, enquiryType, specificProductOrInterest, volumeRequirement, deliveryTimeline, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields: name, email, and message are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = String(email).trim().toLowerCase();
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 160) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const sanitize = (val: any, maxLen: number) => {
      if (!val) return '';
      return String(val)
        .replace(/<[^>]*>?/gm, '')
        .trim()
        .slice(0, maxLen);
    };

    const cleanName = sanitize(name, 120);
    const cleanMessage = sanitize(message, 3000);

    if (cleanName.length < 2) {
      return res.status(400).json({ error: 'Please provide a valid full name.' });
    }

    if (cleanMessage.length < 5) {
      return res.status(400).json({ error: 'Message must be at least 5 characters long.' });
    }

    const allowedTypes = ['products', 'partnership', 'services', 'careers', 'grain-offtake', 'citrus-export', 'poultry', 'general'];
    const validEnquiryType = allowedTypes.includes(enquiryType) ? enquiryType : 'general';

    const newEnquiry: StoredEnquiry = {
      id: `enq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      name: cleanName,
      email: cleanEmail,
      organization: sanitize(organization, 120),
      phone: sanitize(phone, 40),
      enquiryType: validEnquiryType,
      subject: sanitize(req.body.subject, 120),
      specificProductOrInterest: sanitize(specificProductOrInterest, 100),
      volumeRequirement: sanitize(volumeRequirement, 100),
      deliveryTimeline: sanitize(deliveryTimeline, 100),
      message: cleanMessage,
      status: 'new',
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await saveEnquiry(newEnquiry);
    await logAudit('system', 'ENQUIRY_RECEIVED', 'enquiries', `Received new inquiry from ${newEnquiry.name} (${newEnquiry.email})`, {
      recordId: newEnquiry.id,
      recordName: newEnquiry.name,
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you. Your commercial enquiry has been successfully registered with Dzinopona Farms.',
      id: newEnquiry.id,
    });
  } catch (err: any) {
    console.error('Error submitting enquiry:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error processing commercial enquiry.' });
  }
});

// -----------------------------------------------------------------------------
// 6. AUTHENTICATION & BOOTSTRAP ROUTES
// -----------------------------------------------------------------------------

// System Auth Status (Tells client whether first-admin bootstrap is required)
app.get('/api/auth/status', async (req, res) => {
  try {
    const bootstrap = await getBootstrapStatus();
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : (req.headers['x-admin-token'] as string);

    let session: TokenPayload | null = null;
    if (token) {
      session = verifySessionToken(token);
    }

    let fullUser: StoredUser | null = null;
    if (session) {
      fullUser = await getUserById(session.userId);
    }

    return res.json({
      hasAdmin: bootstrap.hasAdmin,
      isAuthenticated: Boolean(session && fullUser && fullUser.isActive !== false),
      user:
        session && fullUser && fullUser.isActive !== false
          ? {
              id: fullUser.id,
              username: fullUser.username,
              fullName: fullUser.fullName,
              email: fullUser.email,
              role: fullUser.role,
              permissions: fullUser.permissions || session.permissions,
            }
          : null,
    });
  } catch (err: any) {
    console.error('Auth status check error:', err?.message || err);
    res.status(500).json({ error: 'Failed to verify system authentication status.' });
  }
});

// Secure First-Admin Bootstrap Endpoint
app.post('/api/auth/bootstrap', authRateLimiter, async (req, res) => {
  try {
    const bootstrap = await getBootstrapStatus();
    if (bootstrap.hasAdmin) {
      return res.status(403).json({
        error: 'First administrator already provisioned. Bootstrap mechanism is permanently locked.',
      });
    }

    const { username, email, fullName, password } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ error: 'All fields (full name, username, email, and password) are required.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanFullName = String(fullName).trim();

    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const adminUser: StoredUser = {
      id: `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      username: cleanUsername,
      email: cleanEmail,
      fullName: cleanFullName,
      role: 'admin',
      permissions: {
        editContent: true,
        manageProducts: true,
        manageServices: true,
        manageProjects: true,
        manageMedia: true,
        manageOperations: true,
        manageLocations: true,
      },
      isActive: true,
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    await saveUser(adminUser);
    await markBootstrapped(adminUser);

    const token = generateSessionToken(adminUser);

    await logAudit(
      adminUser,
      'FIRST_ADMIN_BOOTSTRAP',
      'auth',
      `Master Administrator account (${cleanUsername} / ${cleanEmail}) provisioned successfully. Bootstrap permanently closed.`
    );

    return res.status(201).json({
      success: true,
      message: 'Master Administrator account successfully provisioned. Bootstrap is now permanently sealed.',
      token,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        fullName: adminUser.fullName,
        email: adminUser.email,
        role: adminUser.role,
        permissions: adminUser.permissions,
      },
    });
  } catch (err: any) {
    console.error('Bootstrap error:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error during administrator bootstrap.' });
  }
});

// Login Endpoint (Staff Authentication for Admins & Editors)
app.post('/api/auth/login', authRateLimiter, async (req, res) => {
  try {
    const { identifier, username, password } = req.body;
    const loginId = identifier || username;

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Username/email and password are required.' });
    }

    const user = await getUserByUsernameOrEmail(loginId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ error: 'This account has been deactivated. Please contact the Administrator.' });
    }

    // Verify password hash
    let passwordValid = false;
    if (user.salt && user.passwordHash) {
      passwordValid = verifyPassword(password, user.salt, user.passwordHash);
    }

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    // Update last login
    user.lastLoginAt = new Date().toISOString();
    await saveUser(user);

    const token = generateSessionToken(user);

    await logAudit(
      user,
      'USER_LOGIN',
      'auth',
      `${user.fullName} (${user.role.toUpperCase()}) authenticated into internal CMS.`
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// Logout Endpoint
app.post('/api/auth/logout', requireAuth, async (req, res) => {
  const user = (req as any).user;
  await logAudit(user, 'USER_LOGOUT', 'auth', `${user.fullName} logged out of CMS session.`);
  res.json({ success: true, message: 'Successfully logged out.' });
});

// Current User Profile Endpoint
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = (req as any).user;
  res.json({ user });
});

// -----------------------------------------------------------------------------
// 7. SENSITIVE ADMINISTRATIVE USER MANAGEMENT (ADMIN ONLY)
// -----------------------------------------------------------------------------

// List All Staff Accounts (Admin Only)
app.get('/api/admin/users', requireAdmin, async (_req, res) => {
  try {
    const users = await getUsers();
    const safeUsers = users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      permissions: u.permissions,
      isActive: u.isActive !== false,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      createdBy: u.createdBy,
    }));
    res.json(safeUsers);
  } catch (err: any) {
    console.error('Error fetching users:', err?.message || err);
    res.status(500).json({ error: 'Failed to fetch user list.' });
  }
});

// Create New Staff Account (Admin Only)
app.post('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const currentAdmin = (req as any).user;
    const { username, email, fullName, password, permissions, role } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ error: 'All fields (full name, username, email, and password) are required.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanFullName = String(fullName).trim();

    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const existingUser = await getUserByUsernameOrEmail(cleanUsername);
    if (existingUser) {
      return res.status(409).json({ error: 'A user with that username or email already exists.' });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'editor';
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const newUser: StoredUser = {
      id: `edt-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      username: cleanUsername,
      email: cleanEmail,
      fullName: cleanFullName,
      role: assignedRole,
      permissions: {
        editContent: permissions?.editContent ?? true,
        manageProducts: permissions?.manageProducts ?? true,
        manageServices: permissions?.manageServices ?? true,
        manageProjects: permissions?.manageProjects ?? true,
        manageMedia: permissions?.manageMedia ?? true,
        manageOperations: permissions?.manageOperations ?? true,
        manageLocations: permissions?.manageLocations ?? true,
      },
      isActive: true,
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
      createdBy: currentAdmin.fullName || currentAdmin.username,
    };

    await saveUser(newUser);

    await logAudit(
      currentAdmin,
      'USER_CREATED',
      'users',
      `Created new ${assignedRole.toUpperCase()} account for ${cleanFullName} (${cleanUsername})`,
      { recordId: newUser.id, recordName: cleanFullName }
    );

    return res.status(201).json({
      success: true,
      message: `${assignedRole === 'admin' ? 'Administrator' : 'Editor'} account created successfully.`,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        permissions: newUser.permissions,
        isActive: newUser.isActive,
      },
    });
  } catch (err: any) {
    console.error('Error creating user:', err?.message || err);
    res.status(500).json({ error: 'Failed to create user account.' });
  }
});

// Update Staff Account Permissions or Status (Admin Only)
app.patch('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const currentAdmin = (req as any).user;
    const { id } = req.params;
    const { permissions, isActive, fullName, email, password } = req.body;

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (user.role === 'admin' && isActive === false) {
      const users = await getUsers();
      const activeAdmins = users.filter((u) => u.role === 'admin' && u.isActive !== false);
      if (activeAdmins.length <= 1) {
        return res.status(400).json({ error: 'Cannot deactivate the only active Administrator account.' });
      }
    }

    if (fullName) user.fullName = String(fullName).trim();
    if (email) user.email = String(email).trim().toLowerCase();
    if (isActive !== undefined) user.isActive = Boolean(isActive);

    if (permissions && user.role === 'editor') {
      user.permissions = {
        ...user.permissions,
        ...permissions,
      };
    }

    if (password && String(password).trim().length >= 8) {
      user.salt = crypto.randomBytes(16).toString('hex');
      user.passwordHash = hashPassword(password, user.salt);
    }

    await saveUser(user);

    await logAudit(
      currentAdmin,
      'USER_UPDATED',
      'users',
      `Updated account configuration for ${user.fullName} (${user.username})`,
      { recordId: user.id, recordName: user.fullName }
    );

    return res.json({
      success: true,
      message: `Account for ${user.fullName} updated successfully.`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive,
      },
    });
  } catch (err: any) {
    console.error('Error updating user:', err?.message || err);
    res.status(500).json({ error: 'Failed to update user account.' });
  }
});

// Delete User Account (Admin Only; Cannot delete Admin accounts)
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const currentAdmin = (req as any).user;
    const { id } = req.params;

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        error: 'Administrator accounts cannot be deleted to preserve governance safety.',
      });
    }

    await removeUser(id);

    await logAudit(
      currentAdmin,
      'USER_DELETED',
      'users',
      `Deleted Editor account for ${user.fullName} (${user.username})`,
      { recordId: id, recordName: user.fullName }
    );

    return res.json({ success: true, message: `Account for ${user.fullName} deleted successfully.` });
  } catch (err: any) {
    console.error('Error deleting user:', err?.message || err);
    res.status(500).json({ error: 'Failed to delete user account.' });
  }
});

// -----------------------------------------------------------------------------
// 8. PROTECTED CMS CONTENT MANAGEMENT
// -----------------------------------------------------------------------------

// Update Specific Content Section (Role & Subordinate Permission Guarded)
app.put('/api/admin/content/:section', adminRateLimiter, requireAuth, async (req, res) => {
  try {
    const { section } = req.params;
    const payload = req.body;
    const user = (req as any).user as TokenPayload;

    // Check editor subordinate permissions
    if (user.role === 'editor') {
      const perms = user.permissions || {
        editContent: true,
        manageProducts: true,
        manageServices: true,
        manageProjects: true,
        manageMedia: true,
        manageOperations: true,
        manageLocations: true,
      };

      if (section === 'products' && !perms.manageProducts) {
        return res.status(403).json({ error: 'Permission denied: Your Editor account is not permitted to manage Products.' });
      }
      if (section === 'services' && !perms.manageServices) {
        return res.status(403).json({ error: 'Permission denied: Your Editor account is not permitted to manage Services.' });
      }
      if (section === 'projects' && !perms.manageProjects) {
        return res.status(403).json({ error: 'Permission denied: Your Editor account is not permitted to manage Projects.' });
      }
      if (section === 'operations' && !perms.manageOperations) {
        return res.status(403).json({ error: 'Permission denied: Your Editor account is not permitted to manage Operations.' });
      }
      if (section === 'locations' && !perms.manageLocations) {
        return res.status(403).json({ error: 'Permission denied: Your Editor account is not permitted to manage Locations.' });
      }
      if (section === 'mediaSlots' && !perms.manageMedia) {
        return res.status(403).json({ error: 'Permission denied: Your Editor account is not permitted to manage Media Slots.' });
      }
      if (['homepage', 'about', 'contact', 'footer', 'seo', 'settings'].includes(section) && !perms.editContent) {
        return res.status(403).json({ error: 'Permission denied: Your Editor account is not permitted to edit General Content.' });
      }
      if (section === 'full') {
        return res.status(403).json({ error: 'Permission denied: Full database replacement requires Administrator authority.' });
      }
    }

    const currentContent = await getCmsContent();
    currentContent.lastUpdated = new Date().toISOString();

    switch (section) {
      case 'homepage':
        currentContent.settings.homepage = {
          ...currentContent.settings.homepage,
          ...payload,
        };
        break;

      case 'about':
        currentContent.settings.about = {
          ...currentContent.settings.about,
          ...payload,
        };
        break;

      case 'operations':
        if (!Array.isArray(payload)) return res.status(400).json({ error: 'Operations payload must be an array.' });
        currentContent.operations = payload;
        break;

      case 'products':
        if (!Array.isArray(payload)) return res.status(400).json({ error: 'Products payload must be an array.' });
        currentContent.products = payload;
        break;

      case 'projects':
        if (!Array.isArray(payload)) return res.status(400).json({ error: 'Projects payload must be an array.' });
        currentContent.projects = payload;
        break;

      case 'services':
        if (!Array.isArray(payload)) return res.status(400).json({ error: 'Services payload must be an array.' });
        currentContent.services = payload;
        break;

      case 'locations':
        if (!Array.isArray(payload)) return res.status(400).json({ error: 'Locations payload must be an array.' });
        currentContent.locations = payload;
        break;

      case 'contact':
        currentContent.settings.contact = {
          ...currentContent.settings.contact,
          ...payload,
        };
        break;

      case 'footer':
        currentContent.settings.footer = {
          ...currentContent.settings.footer,
          ...payload,
        };
        break;

      case 'seo':
        currentContent.settings.seo = {
          ...currentContent.settings.seo,
          ...payload,
        };
        break;

      case 'settings':
        currentContent.settings = {
          ...currentContent.settings,
          ...payload,
        };
        break;

      case 'mediaSlots':
        currentContent.mediaSlots = {
          ...currentContent.mediaSlots,
          ...payload,
        };
        break;

      case 'full':
        Object.assign(currentContent, payload, { lastUpdated: new Date().toISOString() });
        break;

      default:
        return res.status(400).json({ error: `Unknown content section: ${section}` });
    }

    await saveCmsContent(currentContent, user.fullName || user.username);

    const roleLabel = user.role === 'admin' ? 'Administrator' : 'Editor';
    const summary = `${user.fullName} (${roleLabel}) updated ${section} content`;
    await logAudit(user, 'CONTENT_UPDATED', section, summary, {
      recordName: `Section: ${section}`,
    });

    return res.json({
      success: true,
      message: `Content section "${section}" saved successfully.`,
      lastUpdated: currentContent.lastUpdated,
      data: currentContent,
    });
  } catch (err: any) {
    console.error('Error updating content:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error updating content.' });
  }
});

// Assign Media Slot
app.post('/api/admin/media', requirePermission('manageMedia'), async (req, res) => {
  try {
    const { slotId, url, altText, caption, focalPoint } = req.body;
    const user = (req as any).user;

    if (!slotId) {
      return res.status(400).json({ error: 'slotId is required.' });
    }

    const currentContent = await getCmsContent();
    const existingSlot = currentContent.mediaSlots[slotId] || {
      id: slotId,
      label: 'Dzinopona Farms Media Slot',
      category: 'landscape',
      description: 'Media slot',
      aspectRatio: '16:9',
      focalPoint: 'center',
      isCustomUploaded: false,
    };

    currentContent.mediaSlots[slotId] = {
      ...existingSlot,
      url: url ? String(url).trim() : undefined,
      altText: altText ? String(altText).trim() : undefined,
      caption: caption ? String(caption).trim() : undefined,
      focalPoint: focalPoint || existingSlot.focalPoint || 'center',
      isCustomUploaded: Boolean(url),
    };

    currentContent.lastUpdated = new Date().toISOString();
    await saveCmsContent(currentContent, user.fullName || user.username);

    const actionType = url ? 'MEDIA_ASSIGNED' : 'MEDIA_CLEARED';
    const summary = `${user.fullName} (${user.role}) updated media slot "${slotId}" (URL: ${url ? 'Assigned' : 'Cleared'})`;

    await logAudit(user, actionType, 'media', summary, {
      recordId: slotId,
      recordName: slotId,
      newValue: url || 'placeholder',
    });

    return res.json({
      success: true,
      message: `Media slot "${slotId}" updated successfully.`,
      slot: currentContent.mediaSlots[slotId],
      lastUpdated: currentContent.lastUpdated,
    });
  } catch (err: any) {
    console.error('Error updating media slot:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error updating media slot.' });
  }
});

// Reset Content to Master Default Baseline (Admin Only)
app.post('/api/admin/reset', requireAdmin, async (req, res) => {
  try {
    const user = (req as any).user;
    const resetContent = JSON.parse(JSON.stringify(defaultCmsDatabase));
    resetContent.lastUpdated = new Date().toISOString();

    await saveCmsContent(resetContent, user.fullName || user.username);
    await logAudit(user, 'CONTENT_RESET_TO_DEFAULTS', 'all', 'Content database reset to master verified baseline.');

    return res.json({
      success: true,
      message: 'Website content successfully restored to verified client baseline.',
      data: resetContent,
    });
  } catch (err: any) {
    console.error('Reset error:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error resetting content.' });
  }
});

// -----------------------------------------------------------------------------
// 9. ENQUIRY MANAGEMENT (ADMIN & PERMITTED EDITORS)
// -----------------------------------------------------------------------------

// List Customer Enquiries
app.get('/api/admin/enquiries', requireAuth, async (_req, res) => {
  try {
    const enquiries = await getEnquiries();
    res.json(enquiries);
  } catch (err: any) {
    console.error('Error fetching enquiries:', err?.message || err);
    res.status(500).json({ error: 'Failed to fetch enquiries.' });
  }
});

// Update Enquiry Status
app.patch('/api/admin/enquiries/:id', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { status, notes } = req.body;

    const allowedStatuses = ['new', 'in-review', 'contacted', 'resolved', 'archived'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const success = await updateEnquiryStatus(id, status, notes);
    if (!success) {
      return res.status(404).json({ error: 'Enquiry not found or could not be updated.' });
    }

    await logAudit(user, 'ENQUIRY_UPDATED', 'enquiries', `${user.fullName} updated enquiry ${id} status to ${status}`, {
      recordId: id,
      newValue: status,
    });

    return res.json({ success: true, message: 'Enquiry status updated successfully.' });
  } catch (err: any) {
    console.error('Error updating enquiry:', err?.message || err);
    res.status(500).json({ error: 'Failed to update enquiry status.' });
  }
});

// Delete Enquiry (Admin Only; Editors cannot delete customer inquiries)
app.delete('/api/admin/enquiries/:id', requireAdmin, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const success = await removeEnquiry(id);
    if (!success) {
      return res.status(404).json({ error: 'Enquiry not found.' });
    }

    await logAudit(user, 'ENQUIRY_DELETED', 'enquiries', `${user.fullName} deleted enquiry ${id}`, {
      recordId: id,
    });

    return res.json({ success: true, message: 'Enquiry deleted successfully.' });
  } catch (err: any) {
    console.error('Error deleting enquiry:', err?.message || err);
    res.status(500).json({ error: 'Failed to delete enquiry.' });
  }
});

// -----------------------------------------------------------------------------
// 10. AUDIT LOG VIEWER (ADMIN ONLY)
// -----------------------------------------------------------------------------

// List Audit Logs (Admin Only)
app.get('/api/admin/audit', requireAdmin, async (_req, res) => {
  try {
    const logs = await getAuditLogs();
    res.json(logs);
  } catch (err: any) {
    console.error('Error fetching audit logs:', err?.message || err);
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

// Clear Audit Logs (Admin Only)
app.delete('/api/admin/audit', requireAdmin, async (req, res) => {
  try {
    const user = (req as any).user;
    await clearAuditLogs();
    await logAudit(user, 'AUDIT_CLEARED', 'audit', `${user.fullName} cleared historical audit logs.`);
    res.json({ success: true, message: 'Audit logs cleared.' });
  } catch (err: any) {
    console.error('Error clearing audit logs:', err?.message || err);
    res.status(500).json({ error: 'Failed to clear audit logs.' });
  }
});

// -----------------------------------------------------------------------------
// 11. MEDIA UPLOADS
// -----------------------------------------------------------------------------

app.post('/api/media/upload', requirePermission('manageMedia'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { filename, fileData, mimeType, contentType } = req.body;

    if (!fileData || !filename) {
      return res.status(400).json({ error: 'filename and fileData (base64) are required.' });
    }

    const resolvedMime = (contentType || mimeType || 'image/jpeg').toLowerCase();
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];

    if (!allowedMimeTypes.includes(resolvedMime)) {
      return res.status(400).json({
        error: `Unsupported file type "${resolvedMime}". Supported types: JPEG, PNG, WebP, SVG, MP4, WebM.`,
      });
    }

    const ext = path.extname(filename).toLowerCase();
    const disallowedExts = ['.exe', '.sh', '.bat', '.php', '.js', '.py', '.rb', '.pl', '.cmd', '.msi'];
    if (disallowedExts.includes(ext)) {
      return res.status(400).json({ error: 'Disallowed file extension for security.' });
    }

    const cleanBase64 = fileData.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const isVideo = resolvedMime.startsWith('video/');
    const maxSizeBytes = isVideo ? 30 * 1024 * 1024 : 10 * 1024 * 1024;
    if (buffer.length > maxSizeBytes) {
      return res.status(400).json({
        error: `File size (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum allowed limit of ${isVideo ? '30MB' : '10MB'}.`,
      });
    }

    const uploadResult = await uploadMedia(buffer, filename, resolvedMime, user.fullName || user.username);

    await logAudit(
      user,
      'MEDIA_UPLOADED',
      'media',
      `${user.fullName} uploaded ${isVideo ? 'video' : 'image'} asset "${filename}" (${(buffer.length / 1024).toFixed(1)} KB)`,
      { recordName: filename, newValue: uploadResult.url }
    );

    return res.status(201).json({
      success: true,
      message: 'Media asset uploaded successfully.',
      ...uploadResult,
    });
  } catch (err: any) {
    console.error('Media upload error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to process media upload.' });
  }
});

// Media slots list
app.get('/api/media/slots', async (_req, res) => {
  try {
    const content = await getCmsContent();
    res.json(content.mediaSlots || {});
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch media slots.' });
  }
});

// -----------------------------------------------------------------------------
// 12. ERROR HANDLING & ROUTE FALLBACKS
// -----------------------------------------------------------------------------

// Catch-all 404 handler for unmatched API routes
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// Global Express error handler: guarantees JSON responses, never returns HTML or crashes
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server exception:', err?.message || err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error.',
  });
});

export default app;
export { app };
