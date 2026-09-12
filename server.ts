import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { defaultCmsDatabase } from './src/data/defaultData';
import { CmsDatabase, SiteSettings } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON body parser with increased limit for image/video uploads/base64
app.use(express.json({ limit: '40mb' }));
app.use(express.urlencoded({ extended: true, limit: '40mb' }));

// Static directories
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// Persistent Database Directory
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit.json');

// Helper functions for reading/writing JSON files safely
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      writeJsonFile(filePath, fallback);
      return fallback;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// In-Memory Cached State
let currentContent: CmsDatabase = readJsonFile<CmsDatabase>(CONTENT_FILE, defaultCmsDatabase);

// Ensure all settings fields exist on cached content
if (!currentContent.settings.homepage || !currentContent.settings.footer) {
  currentContent.settings = {
    ...defaultCmsDatabase.settings,
    ...currentContent.settings,
    homepage: currentContent.settings.homepage || defaultCmsDatabase.settings.homepage,
    footer: currentContent.settings.footer || defaultCmsDatabase.settings.footer,
  };
  writeJsonFile(CONTENT_FILE, currentContent);
}

// Editor Permissions
export interface EditorPermissions {
  editContent: boolean;       // General page content (homepage, about, footer, seo, contact)
  manageProducts: boolean;    // Agricultural products, product images, availability
  manageServices: boolean;    // Agribusiness services & deliverables
  manageProjects: boolean;    // Strategic projects, galleries, short videos
  manageMedia: boolean;       // Media slots & file uploads
  manageOperations: boolean;  // Operations info & farm imagery
  manageLocations: boolean;   // Farming locations & hub data
}

const defaultEditorPermissions: EditorPermissions = {
  editContent: true,
  manageProducts: true,
  manageServices: true,
  manageProjects: true,
  manageMedia: true,
  manageOperations: true,
  manageLocations: true,
};

// Audit Logger
interface AuditEntry {
  id: string;
  timestamp: string;
  userId?: string;
  username: string;
  fullName?: string;
  role?: 'admin' | 'editor' | 'system';
  action: string;
  module: string;
  section?: string;
  recordId?: string;
  recordName?: string;
  summary: string;
  details?: string;
  previousValue?: string;
  newValue?: string;
}

function logAudit(
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
  const auditLogs = readJsonFile<AuditEntry[]>(AUDIT_FILE, []);
  const username: string = typeof user === 'string' ? user : user.username;
  const fullName: string = typeof user === 'string' ? user : (user.fullName || user.username);
  const role: 'admin' | 'editor' | 'system' = typeof user === 'string' ? 'admin' : (user.role || 'admin');
  const userId: string | undefined = typeof user === 'string' ? undefined : user.id;

  const entry: AuditEntry = {
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
  auditLogs.unshift(entry);
  // Keep last 500 records
  writeJsonFile(AUDIT_FILE, auditLogs.slice(0, 500));
}

// Password hashing & security
interface StoredUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'editor';
  permissions?: EditorPermissions;
  isActive?: boolean;
  salt: string;
  passwordHash: string;
  createdAt: string;
  lastLoginAt?: string;
  createdBy?: string;
}

interface StoredSession {
  token: string;
  userId: string;
  username: string;
  role: 'admin' | 'editor';
  fullName: string;
  permissions?: EditorPermissions;
  createdAt: string;
  expiresAt: string;
}

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

function getStoredUsers(): StoredUser[] {
  return readJsonFile<StoredUser[]>(USERS_FILE, []);
}

function saveStoredUsers(users: StoredUser[]): void {
  writeJsonFile(USERS_FILE, users);
}

function hasAdminUser(): boolean {
  const users = getStoredUsers();
  return users.some((u) => u.role === 'admin');
}

function getValidSession(token: string): StoredSession | null {
  if (!token) return null;
  const sessions = readJsonFile<StoredSession[]>(SESSIONS_FILE, []);
  const session = sessions.find((s) => s.token === token);
  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    // Session expired
    return null;
  }
  return session;
}

function createSession(user: StoredUser): string {
  const token = crypto.randomBytes(32).toString('hex');
  const sessions = readJsonFile<StoredSession[]>(SESSIONS_FILE, []);
  
  // Expiry in 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const newSession: StoredSession = {
    token,
    userId: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
    permissions: user.permissions || (user.role === 'editor' ? defaultEditorPermissions : undefined),
    createdAt: new Date().toISOString(),
    expiresAt,
  };

  // Filter out expired sessions
  const activeSessions = sessions.filter((s) => new Date(s.expiresAt) > new Date());
  activeSessions.push(newSession);
  writeJsonFile(SESSIONS_FILE, activeSessions);

  return token;
}

// Authorization Middlewares

// 1. Authenticated user (either Admin or Editor)
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : (req.headers['x-admin-token'] as string);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required to access internal CMS.' });
  }

  const session = getValidSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please authenticate again.' });
  }

  const users = getStoredUsers();
  const user = users.find((u) => u.id === session.userId || u.username.toLowerCase() === session.username.toLowerCase());
  if (!user || user.isActive === false) {
    return res.status(403).json({ error: 'Forbidden: Account has been deactivated. Please contact the Administrator.' });
  }

  (req as any).user = {
    ...session,
    role: user.role,
    permissions: user.permissions || session.permissions || (user.role === 'editor' ? defaultEditorPermissions : undefined),
  };
  next();
}

// 2. Strict Administrator authority (highest-level, employer)
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  requireAuth(req, res, () => {
    const user = (req as any).user as StoredSession;
    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden: Highest-level Administrator authority required. Editor accounts are strictly prohibited from accessing this function.',
      });
    }
    next();
  });
}

// 3. Subordinate permission validator (checks if editor has specific assigned permission; Admin is always allowed)
function requirePermission(permKey: keyof EditorPermissions) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    requireAuth(req, res, () => {
      const user = (req as any).user as StoredSession;
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
// PUBLIC API ROUTES
// -----------------------------------------------------------------------------

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: currentContent.version,
  });
});

// 1. Public Content Endpoint (Serves the latest approved website content)
app.get('/api/content', (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=5, stale-while-revalidate=30');
  res.json(currentContent);
});

// 2. Public Enquiry Submission Endpoint
app.post('/api/enquiries', (req, res) => {
  try {
    const { name, organization, email, phone, enquiryType, specificProductOrInterest, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields: name, email, and message are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const enquiries = readJsonFile<any[]>(ENQUIRIES_FILE, []);
    const newEnquiry = {
      id: `enq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      createdAt: new Date().toISOString(),
      name: String(name).trim().slice(0, 150),
      organization: organization ? String(organization).trim().slice(0, 150) : '',
      email: String(email).trim().toLowerCase().slice(0, 150),
      phone: phone ? String(phone).trim().slice(0, 50) : '',
      enquiryType: ['products', 'partnership', 'services', 'careers', 'general'].includes(enquiryType)
        ? enquiryType
        : 'general',
      specificProductOrInterest: specificProductOrInterest ? String(specificProductOrInterest).trim().slice(0, 200) : '',
      message: String(message).trim().slice(0, 5000),
      status: 'new',
    };

    enquiries.unshift(newEnquiry);
    writeJsonFile(ENQUIRIES_FILE, enquiries);

    logAudit('system', 'ENQUIRY_RECEIVED', 'enquiries', `Received new inquiry from ${newEnquiry.name} (${newEnquiry.email})`);

    return res.status(201).json({
      success: true,
      message: 'Thank you. Your commercial enquiry has been successfully logged with Dzinopona Farms.',
      id: newEnquiry.id,
    });
  } catch (err: any) {
    console.error('Error submitting enquiry:', err);
    return res.status(500).json({ error: 'Internal server error processing enquiry.' });
  }
});

// -----------------------------------------------------------------------------
// AUTHENTICATION & BOOTSTRAP ROUTES
// -----------------------------------------------------------------------------

// Check system auth status (tells client whether a first-admin bootstrap is required)
app.get('/api/auth/status', (req, res) => {
  const hasAdmin = hasAdminUser();
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : (req.headers['x-admin-token'] as string);

  let session: StoredSession | null = null;
  if (token) {
    session = getValidSession(token);
  }

  let fullUser: StoredUser | undefined;
  if (session) {
    const users = getStoredUsers();
    fullUser = users.find((u) => u.id === session!.userId || u.username.toLowerCase() === session!.username.toLowerCase());
  }

  return res.json({
    hasAdmin,
    isAuthenticated: Boolean(session && fullUser && fullUser.isActive !== false),
    user: session && fullUser && fullUser.isActive !== false
      ? {
          id: fullUser.id,
          username: fullUser.username,
          fullName: fullUser.fullName,
          email: fullUser.email,
          role: fullUser.role,
          permissions: fullUser.permissions || session.permissions || (fullUser.role === 'editor' ? defaultEditorPermissions : undefined),
        }
      : null,
  });
});

// First-Admin Bootstrap Endpoint
// STRICT SECURITY REQUIREMENT:
// This endpoint can ONLY operate when NO administrator exists in the system.
// Once an administrator has been created, this endpoint permanently disables itself.
app.post('/api/auth/bootstrap', (req, res) => {
  try {
    if (hasAdminUser()) {
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

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const newAdmin: StoredUser = {
      id: `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      username: cleanUsername,
      email: cleanEmail,
      fullName: cleanFullName,
      role: 'admin',
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const users = getStoredUsers();
    users.push(newAdmin);
    saveStoredUsers(users);

    const token = createSession(newAdmin);
    logAudit(cleanUsername, 'BOOTSTRAP_INITIAL_ADMIN', 'auth', `Initial administrative account provisioned for ${cleanFullName} (${cleanUsername})`);

    return res.status(201).json({
      success: true,
      message: 'Initial administrator successfully provisioned.',
      token,
      user: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        fullName: newAdmin.fullName,
        role: newAdmin.role,
      },
    });
  } catch (err: any) {
    console.error('Bootstrap error:', err);
    return res.status(500).json({ error: 'Internal server error during bootstrap.' });
  }
});

// Authentication Login Endpoint (Admin & Subordinate Editor)
app.post('/api/auth/login', (req, res) => {
  try {
    const rawIdentifier = req.body.identifier || req.body.username || req.body.email;
    const { password } = req.body;

    if (!rawIdentifier || !password) {
      return res.status(400).json({ error: 'Username/email and password are required.' });
    }

    const cleanIdentifier = String(rawIdentifier).trim().toLowerCase();
    const users = getStoredUsers();
    const user = users.find(
      (u) => u.username.toLowerCase() === cleanIdentifier || u.email.toLowerCase() === cleanIdentifier
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your username and password.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ error: 'This account has been deactivated by the Administrator.' });
    }

    const isMatch = verifyPassword(password, user.salt, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your username and password.' });
    }

    // Update last login
    user.lastLoginAt = new Date().toISOString();
    saveStoredUsers(users);

    const token = createSession(user);
    const roleLabel = user.role === 'admin' ? 'Administrator' : 'Authorized Content Editor';
    logAudit(
      user,
      'LOGIN_SUCCESS',
      'auth',
      `${roleLabel} authenticated: ${user.fullName} (@${user.username})`,
      { recordName: user.fullName }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions || (user.role === 'editor' ? defaultEditorPermissions : undefined),
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// Logout Endpoint
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : (req.headers['x-admin-token'] as string);

  if (token) {
    const sessions = readJsonFile<StoredSession[]>(SESSIONS_FILE, []);
    const filtered = sessions.filter((s) => s.token !== token);
    writeJsonFile(SESSIONS_FILE, filtered);
  }

  res.json({ success: true, message: 'Logged out successfully.' });
});

// Current User Endpoint (supports Admin and Editor)
app.get('/api/auth/me', requireAuth, (req, res) => {
  const session = (req as any).user;
  res.json({
    user: {
      id: session.userId,
      username: session.username,
      fullName: session.fullName,
      role: session.role,
      permissions: session.permissions,
    },
  });
});

// -----------------------------------------------------------------------------
// EDITOR MANAGEMENT (ADMIN ONLY)
// -----------------------------------------------------------------------------

// List all Editor accounts
app.get('/api/admin/editors', requireAdmin, (_req, res) => {
  const users = getStoredUsers();
  const editors = users
    .filter((u) => u.role === 'editor')
    .map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      permissions: u.permissions || defaultEditorPermissions,
      isActive: u.isActive !== false,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      createdBy: u.createdBy || 'Administrator',
    }));
  res.json(editors);
});

// Admin provisions a new Editor
app.post('/api/admin/editors', requireAdmin, (req, res) => {
  try {
    const { username, email, fullName, password, permissions } = req.body;
    const adminUser = (req as any).user;

    if (!username || !email || !fullName || !password) {
      return res.status(400).json({ error: 'Full name, username, email, and password are required.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanFullName = String(fullName).trim();

    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Username must contain at least 3 characters.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const users = getStoredUsers();
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return res.status(400).json({ error: `Username "${cleanUsername}" is already in use.` });
    }
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ error: `Email address "${cleanEmail}" is already registered.` });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const newEditor: StoredUser = {
      id: `edt-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      username: cleanUsername,
      email: cleanEmail,
      fullName: cleanFullName,
      role: 'editor',
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
      createdBy: adminUser.fullName || adminUser.username,
    };

    users.push(newEditor);
    saveStoredUsers(users);

    logAudit(
      adminUser,
      'EDITOR_CREATED',
      'editors',
      `Admin created new Editor account: ${cleanFullName} (@${cleanUsername})`,
      { recordId: newEditor.id, recordName: cleanFullName }
    );

    return res.status(201).json({
      success: true,
      message: `Editor account for "${cleanFullName}" created successfully.`,
      editor: {
        id: newEditor.id,
        username: newEditor.username,
        email: newEditor.email,
        fullName: newEditor.fullName,
        role: newEditor.role,
        permissions: newEditor.permissions,
        isActive: newEditor.isActive,
        createdAt: newEditor.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Error creating editor:', err);
    return res.status(500).json({ error: 'Failed to create editor account.' });
  }
});

// Admin updates Editor permissions / active status
app.put('/api/admin/editors/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, permissions, isActive } = req.body;
    const adminUser = (req as any).user;

    const users = getStoredUsers();
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Editor account not found.' });
    }

    const editor = users[userIndex];
    if (editor.role !== 'editor') {
      return res.status(400).json({ error: 'Cannot modify non-editor accounts via this endpoint.' });
    }

    const previousPerms = JSON.stringify(editor.permissions);

    if (fullName) editor.fullName = String(fullName).trim();
    if (email) editor.email = String(email).trim().toLowerCase();
    if (typeof isActive === 'boolean') editor.isActive = isActive;
    if (permissions) {
      editor.permissions = {
        editContent: permissions.editContent ?? editor.permissions?.editContent ?? true,
        manageProducts: permissions.manageProducts ?? editor.permissions?.manageProducts ?? true,
        manageServices: permissions.manageServices ?? editor.permissions?.manageServices ?? true,
        manageProjects: permissions.manageProjects ?? editor.permissions?.manageProjects ?? true,
        manageMedia: permissions.manageMedia ?? editor.permissions?.manageMedia ?? true,
        manageOperations: permissions.manageOperations ?? editor.permissions?.manageOperations ?? true,
        manageLocations: permissions.manageLocations ?? editor.permissions?.manageLocations ?? true,
      };
    }

    saveStoredUsers(users);

    logAudit(
      adminUser,
      'EDITOR_PERMISSIONS_UPDATED',
      'editors',
      `Admin updated permissions/status for Editor ${editor.fullName} (@${editor.username})`,
      {
        recordId: editor.id,
        recordName: editor.fullName,
        previousValue: previousPerms,
        newValue: JSON.stringify(editor.permissions),
      }
    );

    return res.json({
      success: true,
      message: `Editor "${editor.fullName}" updated successfully.`,
      editor: {
        id: editor.id,
        username: editor.username,
        email: editor.email,
        fullName: editor.fullName,
        role: editor.role,
        permissions: editor.permissions,
        isActive: editor.isActive !== false,
        createdAt: editor.createdAt,
        lastLoginAt: editor.lastLoginAt,
      },
    });
  } catch (err: any) {
    console.error('Error updating editor:', err);
    return res.status(500).json({ error: 'Failed to update editor.' });
  }
});

// Admin resets an Editor's password
app.post('/api/admin/editors/:id/reset-password', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const adminUser = (req as any).user;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const users = getStoredUsers();
    const editor = users.find((u) => u.id === id);
    if (!editor || editor.role !== 'editor') {
      return res.status(404).json({ error: 'Editor account not found.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    editor.salt = salt;
    editor.passwordHash = hashPassword(newPassword, salt);
    saveStoredUsers(users);

    // Invalidate active sessions for this editor
    const sessions = readJsonFile<StoredSession[]>(SESSIONS_FILE, []);
    writeJsonFile(SESSIONS_FILE, sessions.filter((s) => s.userId !== editor.id));

    logAudit(
      adminUser,
      'EDITOR_PASSWORD_RESET',
      'editors',
      `Admin reset password for Editor ${editor.fullName} (@${editor.username})`,
      { recordId: editor.id, recordName: editor.fullName }
    );

    return res.json({ success: true, message: `Password reset successfully for ${editor.fullName}.` });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// Admin deletes an Editor
app.delete('/api/admin/editors/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).user;

    const users = getStoredUsers();
    const editor = users.find((u) => u.id === id);
    if (!editor) {
      return res.status(404).json({ error: 'Editor not found.' });
    }
    if (editor.role !== 'editor') {
      return res.status(400).json({ error: 'Cannot delete an administrator account.' });
    }

    const remaining = users.filter((u) => u.id !== id);
    saveStoredUsers(remaining);

    // Remove active sessions
    const sessions = readJsonFile<StoredSession[]>(SESSIONS_FILE, []);
    writeJsonFile(SESSIONS_FILE, sessions.filter((s) => s.userId !== id));

    logAudit(
      adminUser,
      'EDITOR_DELETED',
      'editors',
      `Admin deleted Editor account "${editor.fullName}" (@${editor.username})`,
      { recordId: editor.id, recordName: editor.fullName }
    );

    return res.json({ success: true, message: `Editor "${editor.fullName}" deleted.` });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete editor.' });
  }
});

// Admin view of Editor Activity & Audit Trail
app.get('/api/admin/editor-activity', requireAdmin, (req, res) => {
  const { editor, module, search, limit } = req.query;
  let auditLogs = readJsonFile<AuditEntry[]>(AUDIT_FILE, []);

  if (editor) {
    auditLogs = auditLogs.filter((a) => a.username.toLowerCase() === String(editor).toLowerCase());
  }
  if (module && module !== 'all') {
    auditLogs = auditLogs.filter((a) => a.module === module);
  }
  if (search) {
    const q = String(search).toLowerCase();
    auditLogs = auditLogs.filter(
      (a) =>
        a.summary?.toLowerCase().includes(q) ||
        a.recordName?.toLowerCase().includes(q) ||
        a.username?.toLowerCase().includes(q) ||
        a.fullName?.toLowerCase().includes(q) ||
        a.details?.toLowerCase().includes(q)
    );
  }

  const maxItems = limit ? Math.min(parseInt(String(limit), 10) || 100, 500) : 200;
  res.json({
    total: auditLogs.length,
    entries: auditLogs.slice(0, maxItems),
  });
});

// -----------------------------------------------------------------------------
// SUBORDINATE EDITOR OVERVIEW
// -----------------------------------------------------------------------------

app.get('/api/editor/overview', requireAuth, (req, res) => {
  const user = (req as any).user;
  const auditLogs = readJsonFile<AuditEntry[]>(AUDIT_FILE, []);
  const myLogs = auditLogs.filter((a) => a.username.toLowerCase() === user.username.toLowerCase()).slice(0, 15);

  res.json({
    user: {
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions,
    },
    counts: {
      products: currentContent.products.length,
      operations: currentContent.operations.length,
      projects: currentContent.projects.length,
      services: currentContent.services.length,
      locations: currentContent.locations.length,
      mediaSlots: Object.keys(currentContent.mediaSlots).length,
    },
    recentPersonalActivity: myLogs,
    lastUpdated: currentContent.lastUpdated,
  });
});

// -----------------------------------------------------------------------------
// SECURE MEDIA UPLOAD (IMAGES & SHORT VIDEOS)
// -----------------------------------------------------------------------------

app.post('/api/media/upload', requireAuth, (req, res) => {
  try {
    const user = (req as any).user;
    if (user.role === 'editor' && user.permissions?.manageMedia === false) {
      return res.status(403).json({ error: 'Permission denied: Your Editor account cannot upload media.' });
    }

    const { filename, mimeType, base64Data, altText, caption, targetType } = req.body;

    if (!filename || !mimeType || !base64Data) {
      return res.status(400).json({ error: 'Filename, mimeType, and base64Data are required.' });
    }

    const allowedImageMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    const allowedVideoMimes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

    const isImage = allowedImageMimes.includes(mimeType.toLowerCase());
    const isVideo = allowedVideoMimes.includes(mimeType.toLowerCase());

    if (!isImage && !isVideo) {
      return res.status(400).json({
        error: `Unsupported format (${mimeType}). Supported: JPEG, PNG, WEBP, AVIF, MP4, WEBM.`,
      });
    }

    const base64Clean = base64Data.replace(/^data:[a-zA-Z0-9\/\-\+]+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');

    const maxBytes = isVideo ? 35 * 1024 * 1024 : 15 * 1024 * 1024;
    if (buffer.length > maxBytes) {
      return res.status(400).json({
        error: `File exceeds size limit (${isVideo ? '35MB for videos' : '15MB for images'}). Please optimize media.`,
      });
    }

    const ext = path.extname(filename).toLowerCase() || (isVideo ? '.mp4' : '.jpg');
    const safeBasename = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    const uniqueName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safeBasename || 'asset'}${ext}`;
    const destinationPath = path.join(UPLOADS_DIR, uniqueName);

    fs.writeFileSync(destinationPath, buffer);

    const relativeUrl = `/uploads/${uniqueName}`;

    logAudit(
      user,
      isVideo ? 'VIDEO_UPLOADED' : 'IMAGE_UPLOADED',
      'media',
      `${user.fullName} (${user.role === 'admin' ? 'Administrator' : 'Editor'}) uploaded ${isVideo ? 'short video' : 'image'}: ${filename}`,
      {
        recordName: filename,
        newValue: relativeUrl,
        details: `Uploaded ${isImage ? 'image' : 'video'} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`,
      }
    );

    return res.status(201).json({
      success: true,
      url: relativeUrl,
      filename: uniqueName,
      originalName: filename,
      mimeType,
      sizeBytes: buffer.length,
      altText,
      caption,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Internal server error processing file upload.' });
  }
});

// -----------------------------------------------------------------------------
// PROTECTED CMS ADMIN API ROUTES
// -----------------------------------------------------------------------------

// Admin Dashboard Overview Stats
app.get('/api/admin/overview', requireAdmin, (_req, res) => {
  const enquiries = readJsonFile<any[]>(ENQUIRIES_FILE, []);
  const auditLogs = readJsonFile<AuditEntry[]>(AUDIT_FILE, []);

  res.json({
    version: currentContent.version,
    lastUpdated: currentContent.lastUpdated,
    stats: {
      operationsCount: currentContent.operations.length,
      productsCount: currentContent.products.length,
      projectsCount: currentContent.projects.length,
      locationsCount: currentContent.locations.length,
      mediaSlotsCount: Object.keys(currentContent.mediaSlots).length,
      activePhotosCount: Object.values(currentContent.mediaSlots).filter((s) => Boolean(s.url)).length,
      totalEnquiries: enquiries.length,
      unreviewedEnquiries: enquiries.filter((e) => e.status === 'new').length,
    },
    recentAuditLogs: auditLogs.slice(0, 10),
  });
});

// Get Commercial Enquiries
app.get('/api/admin/enquiries', requireAdmin, (_req, res) => {
  const enquiries = readJsonFile<any[]>(ENQUIRIES_FILE, []);
  res.json(enquiries);
});

// Mark Enquiry Status
app.patch('/api/admin/enquiries/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const enquiries = readJsonFile<any[]>(ENQUIRIES_FILE, []);
  const enq = enquiries.find((e) => e.id === id);

  if (!enq) {
    return res.status(404).json({ error: 'Enquiry not found.' });
  }

  enq.status = status || 'reviewed';
  writeJsonFile(ENQUIRIES_FILE, enquiries);

  logAudit((req as any).user.username, 'ENQUIRY_STATUS_UPDATED', 'enquiries', `Enquiry ${id} marked as ${enq.status}`);
  res.json({ success: true, enquiry: enq });
});

// Update Specific Content Section
// (homepage, about, operations, products, projects, services, locations, contact, footer, seo, settings, mediaSlots)
app.put('/api/admin/content/:section', requireAuth, (req, res) => {
  try {
    const { section } = req.params;
    const payload = req.body;
    const user = (req as any).user;

    if (!payload) {
      return res.status(400).json({ error: 'Payload body is required.' });
    }

    // Role-based permission checks for Subordinate Editor accounts
    if (user.role === 'editor') {
      const perms = user.permissions || defaultEditorPermissions;
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
        if (!Array.isArray(payload)) {
          return res.status(400).json({ error: 'Operations payload must be an array.' });
        }
        currentContent.operations = payload;
        break;

      case 'products':
        if (!Array.isArray(payload)) {
          return res.status(400).json({ error: 'Products payload must be an array.' });
        }
        currentContent.products = payload;
        break;

      case 'projects':
        if (!Array.isArray(payload)) {
          return res.status(400).json({ error: 'Projects payload must be an array.' });
        }
        currentContent.projects = payload;
        break;

      case 'services':
        if (!Array.isArray(payload)) {
          return res.status(400).json({ error: 'Services payload must be an array.' });
        }
        currentContent.services = payload;
        break;

      case 'locations':
        if (!Array.isArray(payload)) {
          return res.status(400).json({ error: 'Locations payload must be an array.' });
        }
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
        // Restore/Update full database
        currentContent = {
          ...payload,
          lastUpdated: new Date().toISOString(),
        };
        break;

      default:
        return res.status(400).json({ error: `Unknown content section: ${section}` });
    }

    // Persist to disk
    writeJsonFile(CONTENT_FILE, currentContent);

    // Detailed Audit trail
    const roleLabel = user.role === 'admin' ? 'Administrator' : 'Editor';
    let summary = `${user.fullName} (${roleLabel}) updated ${section} content`;
    let recordName = `Section: ${section}`;
    let newDetail = '';

    if (section === 'products' && Array.isArray(payload)) {
      summary = `${user.fullName} updated agricultural products catalogue (${payload.length} products)`;
      recordName = `Products (${payload.length} items)`;
      newDetail = payload.map((p: any) => `${p.name} [${p.status}]`).slice(0, 5).join(', ');
    } else if (section === 'projects' && Array.isArray(payload)) {
      const videosCount = payload.filter((pr: any) => Boolean(pr.video?.url)).length;
      summary = `${user.fullName} updated strategic development projects (${payload.length} projects, ${videosCount} videos)`;
      recordName = `Projects (${payload.length} items)`;
    } else if (section === 'services' && Array.isArray(payload)) {
      summary = `${user.fullName} updated agribusiness services (${payload.length} services)`;
      recordName = `Services (${payload.length} items)`;
    } else if (section === 'operations' && Array.isArray(payload)) {
      summary = `${user.fullName} updated farm operations (${payload.length} operations)`;
      recordName = `Operations (${payload.length} items)`;
    }

    logAudit(user, 'CONTENT_UPDATED', section, summary, {
      recordName,
      details: newDetail || summary,
    });

    return res.json({
      success: true,
      message: `Content section "${section}" successfully saved.`,
      lastUpdated: currentContent.lastUpdated,
      data: currentContent,
    });
  } catch (err: any) {
    console.error('Error updating content:', err);
    return res.status(500).json({ error: 'Internal server error updating content.' });
  }
});

// Update or Assign a Media Slot
app.post('/api/admin/media', requireAuth, (req, res) => {
  try {
    const { slotId, url, altText, caption, focalPoint } = req.body;
    const user = (req as any).user;

    if (user.role === 'editor' && user.permissions?.manageMedia === false) {
      return res.status(403).json({ error: 'Permission denied: Your Editor account is not permitted to manage media.' });
    }

    if (!slotId) {
      return res.status(400).json({ error: 'slotId is required.' });
    }

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
    writeJsonFile(CONTENT_FILE, currentContent);

    const actionType = url ? 'MEDIA_ASSIGNED' : 'MEDIA_CLEARED';
    const summary = `${user.fullName} (${user.role}) updated media slot "${slotId}" (URL: ${url ? 'Assigned' : 'Cleared'})`;

    logAudit(
      user,
      actionType,
      'media',
      summary,
      {
        recordId: slotId,
        recordName: slotId,
        newValue: url || 'placeholder',
      }
    );

    return res.json({
      success: true,
      message: `Media slot "${slotId}" updated successfully.`,
      slot: currentContent.mediaSlots[slotId],
      lastUpdated: currentContent.lastUpdated,
    });
  } catch (err: any) {
    console.error('Error updating media slot:', err);
    return res.status(500).json({ error: 'Internal server error updating media slot.' });
  }
});

// Reset Content to Master Default Baseline
app.post('/api/admin/reset', requireAdmin, (req, res) => {
  try {
    const username = (req as any).user.username;
    currentContent = JSON.parse(JSON.stringify(defaultCmsDatabase));
    currentContent.lastUpdated = new Date().toISOString();
    writeJsonFile(CONTENT_FILE, currentContent);

    logAudit(username, 'CONTENT_RESET_TO_DEFAULTS', 'all', 'Content database reset to master verified baseline.');

    return res.json({
      success: true,
      message: 'Website content successfully restored to verified client baseline.',
      data: currentContent,
    });
  } catch (err: any) {
    console.error('Reset error:', err);
    return res.status(500).json({ error: 'Internal server error resetting content.' });
  }
});

// Audit Log Viewer
app.get('/api/admin/audit', requireAdmin, (_req, res) => {
  const auditLogs = readJsonFile<AuditEntry[]>(AUDIT_FILE, []);
  res.json(auditLogs);
});

// -----------------------------------------------------------------------------
// VITE MIDDLEWARE & STATIC FILE SERVING
// -----------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dzinopona Farms server running on http://0.0.0.0:${PORT}`);
    console.log(`- Public Website: http://0.0.0.0:${PORT}/`);
    console.log(`- Internal Auth:  http://0.0.0.0:${PORT}/auth`);
    console.log(`- CMS Dashboard:  http://0.0.0.0:${PORT}/admin`);
  });
}

startServer();
