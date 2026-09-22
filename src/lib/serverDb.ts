import { initializeApp as initClientApp, getApps as getClientApps } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore as getClientFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp as initAdminApp, getApps as getAdminApps, cert, applicationDefault, Credential } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, Firestore as AdminFirestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth, Auth as AdminAuth } from 'firebase-admin/auth';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import firebaseConfig from '../../firebase-applet-config.json';
import { defaultCmsDatabase } from '../data/defaultData';
import { CmsDatabase } from '../types';

// ==========================================
// 1. Firebase Admin & Client Initialization
// ==========================================
let adminDb: AdminFirestore | null = null;
let adminAuth: AdminAuth | null = null;
let adminStorageBucket: any = null;
let isUsingAdminSdk = false;

// Attempt to initialize Firebase Admin SDK if service account is provided
try {
  let credential: Credential | null = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      credential = cert(parsed);
    } catch (e) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON', e);
    }
  } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    credential = cert({
      projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    credential = applicationDefault();
  }

  if (credential && getAdminApps().length === 0) {
    const adminApp = initAdminApp({
      credential,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
    });
    // Connect to specific database if specified
    adminDb = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
      ? getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId)
      : getAdminFirestore(adminApp);
    adminAuth = getAdminAuth(adminApp);
    adminStorageBucket = getAdminStorage(adminApp).bucket();
    isUsingAdminSdk = true;
    console.log('Firebase Admin SDK initialized successfully with service account credentials.');
  }
} catch (err: any) {
  console.warn('Firebase Admin SDK could not be initialized with service account:', err.message);
}

// Fallback to Firebase Client SDK for Firestore operations
const clientApp = getClientApps().length === 0 ? initClientApp(firebaseConfig) : getClientApps()[0];
const clientDb = initializeFirestore(
  clientApp,
  {
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);
const clientStorage = getStorage(clientApp);

// ==========================================
// 2. In-Memory Working Caches (Fast reads & resilience)
// ==========================================
let cachedContent: CmsDatabase | null = null;
let lastContentFetch = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache for CMS content

// Fallback local file paths for seamless offline dev preview
const DATA_DIR = path.join(process.cwd(), 'data');
function readFallback<T>(filename: string, fallback: T): T {
  try {
    const fp = path.join(DATA_DIR, filename);
    if (fs.existsSync(fp)) {
      return JSON.parse(fs.readFileSync(fp, 'utf-8'));
    }
  } catch {
    // ignore
  }
  return fallback;
}

// ==========================================
// 3. CMS Content Operations
// ==========================================
export async function getCmsContent(): Promise<CmsDatabase> {
  const now = Date.now();
  if (cachedContent && now - lastContentFetch < CACHE_TTL_MS) {
    return cachedContent;
  }

  try {
    if (isUsingAdminSdk && adminDb) {
      const snap = await adminDb.collection('cms_data').doc('content').get();
      if (snap.exists) {
        const data = snap.data();
        if (data && data.content) {
          cachedContent = {
            ...defaultCmsDatabase,
            ...data.content,
            settings: { ...defaultCmsDatabase.settings, ...(data.content.settings || {}) },
            mediaSlots: { ...defaultCmsDatabase.mediaSlots, ...(data.content.mediaSlots || {}) },
          };
          lastContentFetch = now;
          return cachedContent!;
        }
      }
    } else {
      const snap = await getDoc(doc(clientDb, 'cms_data', 'content'));
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.content) {
          cachedContent = {
            ...defaultCmsDatabase,
            ...data.content,
            settings: { ...defaultCmsDatabase.settings, ...(data.content.settings || {}) },
            mediaSlots: { ...defaultCmsDatabase.mediaSlots, ...(data.content.mediaSlots || {}) },
          };
          lastContentFetch = now;
          return cachedContent!;
        }
      }
    }
  } catch (err: any) {
    console.warn('Firestore CMS content read issue, using fallback/cache:', err.message);
  }

  // Fallback to local data/content.json or defaults
  if (!cachedContent) {
    cachedContent = readFallback<CmsDatabase>('content.json', defaultCmsDatabase);
  }
  return cachedContent;
}

export async function saveCmsContent(content: CmsDatabase, updatedBy: string): Promise<void> {
  cachedContent = content;
  lastContentFetch = Date.now();

  const payload = {
    content,
    lastUpdated: new Date().toISOString(),
    updatedBy,
  };

  try {
    if (isUsingAdminSdk && adminDb) {
      await adminDb.collection('cms_data').doc('content').set(payload, { merge: true });
    } else {
      await setDoc(doc(clientDb, 'cms_data', 'content'), payload, { merge: true });
    }
  } catch (err: any) {
    console.warn('Firestore CMS content save warning:', err.message);
    // Write local backup if filesystem is writable (non-Vercel)
    try {
      if (!process.env.VERCEL && fs.existsSync(DATA_DIR)) {
        fs.writeFileSync(path.join(DATA_DIR, 'content.json'), JSON.stringify(content, null, 2));
      }
    } catch {
      // ignore
    }
  }
}

// ==========================================
// 4. Enquiries & Submissions Operations
// ==========================================
export interface StoredEnquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  enquiryType?: string;
  subject?: string;
  specificProductOrInterest?: string;
  volumeRequirement?: string;
  deliveryTimeline?: string;
  message: string;
  submittedAt: string;
  createdAt: string;
  status: 'new' | 'in-review' | 'contacted' | 'resolved' | 'archived';
  notes?: string;
}

export async function getEnquiries(): Promise<StoredEnquiry[]> {
  try {
    if (isUsingAdminSdk && adminDb) {
      const snap = await adminDb.collection('enquiries').orderBy('submittedAt', 'desc').limit(100).get();
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as StoredEnquiry);
      }
    } else {
      const snap = await getDocs(query(collection(clientDb, 'enquiries'), orderBy('submittedAt', 'desc'), limit(100)));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as StoredEnquiry);
      }
      // Also check submissions collection
      const subSnap = await getDocs(query(collection(clientDb, 'submissions'), orderBy('submittedAt', 'desc'), limit(100)));
      if (!subSnap.empty) {
        return subSnap.docs.map((d) => d.data() as StoredEnquiry);
      }
    }
  } catch (err: any) {
    console.warn('Firestore enquiries fetch warning:', err.message);
  }

  return readFallback<StoredEnquiry[]>('enquiries.json', []);
}

export async function saveEnquiry(enquiry: StoredEnquiry): Promise<void> {
  try {
    if (isUsingAdminSdk && adminDb) {
      await adminDb.collection('enquiries').doc(enquiry.id).set(enquiry);
      await adminDb.collection('submissions').doc(enquiry.id).set(enquiry);
    } else {
      await setDoc(doc(clientDb, 'enquiries', enquiry.id), enquiry);
      await setDoc(doc(clientDb, 'submissions', enquiry.id), enquiry);
    }
  } catch (err: any) {
    console.warn('Firestore enquiry save warning:', err.message);
    try {
      if (!process.env.VERCEL && fs.existsSync(DATA_DIR)) {
        const existing = readFallback<StoredEnquiry[]>('enquiries.json', []);
        fs.writeFileSync(path.join(DATA_DIR, 'enquiries.json'), JSON.stringify([enquiry, ...existing], null, 2));
      }
    } catch {
      // ignore
    }
  }
}

export async function updateEnquiryStatus(id: string, status: StoredEnquiry['status'], notes?: string): Promise<boolean> {
  const updates: any = { status, updatedAt: new Date().toISOString() };
  if (notes !== undefined) updates.notes = notes;

  try {
    if (isUsingAdminSdk && adminDb) {
      await adminDb.collection('enquiries').doc(id).set(updates, { merge: true });
      await adminDb.collection('submissions').doc(id).set(updates, { merge: true });
      return true;
    } else {
      await setDoc(doc(clientDb, 'enquiries', id), updates, { merge: true });
      await setDoc(doc(clientDb, 'submissions', id), updates, { merge: true });
      return true;
    }
  } catch (err: any) {
    console.warn('Firestore enquiry update status warning:', err.message);
    return false;
  }
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  try {
    if (isUsingAdminSdk && adminDb) {
      await adminDb.collection('enquiries').doc(id).delete();
      await adminDb.collection('submissions').doc(id).delete();
      return true;
    } else {
      await deleteDoc(doc(clientDb, 'enquiries', id));
      await deleteDoc(doc(clientDb, 'submissions', id));
      return true;
    }
  } catch (err: any) {
    console.warn('Firestore enquiry delete warning:', err.message);
    return false;
  }
}

// ==========================================
// 5. User & Permission Operations
// ==========================================
export interface StoredUser {
  id: string;
  uid?: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'editor';
  permissions: {
    editContent: boolean;
    manageProducts: boolean;
    manageServices: boolean;
    manageProjects: boolean;
    manageMedia: boolean;
    manageOperations: boolean;
    manageLocations: boolean;
  };
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  createdBy?: string;
  salt?: string;
  passwordHash?: string;
}

export async function getUsers(): Promise<StoredUser[]> {
  try {
    if (isUsingAdminSdk && adminDb) {
      const snap = await adminDb.collection('users').get();
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as StoredUser);
      }
    } else {
      const snap = await getDocs(collection(clientDb, 'users'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as StoredUser);
      }
    }
  } catch (err: any) {
    console.warn('Firestore users fetch warning:', err.message);
  }

  return readFallback<StoredUser[]>('users.json', []);
}

export async function getUserById(id: string): Promise<StoredUser | null> {
  try {
    if (isUsingAdminSdk && adminDb) {
      const snap = await adminDb.collection('users').doc(id).get();
      if (snap.exists) return snap.data() as StoredUser;
    } else {
      const snap = await getDoc(doc(clientDb, 'users', id));
      if (snap.exists()) return snap.data() as StoredUser;
    }
  } catch (err: any) {
    console.warn('Firestore getUserById warning:', err.message);
  }

  const users = readFallback<StoredUser[]>('users.json', []);
  return users.find((u) => u.id === id || u.username === id) || null;
}

export async function getUserByUsernameOrEmail(identifier: string): Promise<StoredUser | null> {
  const norm = identifier.toLowerCase().trim();
  const users = await getUsers();
  return users.find((u) => u.username.toLowerCase() === norm || u.email.toLowerCase() === norm) || null;
}

export async function saveUser(user: StoredUser): Promise<void> {
  try {
    if (isUsingAdminSdk && adminDb) {
      await adminDb.collection('users').doc(user.id).set(user, { merge: true });
    } else {
      await setDoc(doc(clientDb, 'users', user.id), user, { merge: true });
    }
  } catch (err: any) {
    console.warn('Firestore saveUser warning:', err.message);
  }

  // Also sync to local fallback if running outside Vercel
  try {
    if (!process.env.VERCEL && fs.existsSync(DATA_DIR)) {
      const users = readFallback<StoredUser[]>('users.json', []);
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx >= 0) {
        users[idx] = user;
      } else {
        users.push(user);
      }
      fs.writeFileSync(path.join(DATA_DIR, 'users.json'), JSON.stringify(users, null, 2));
    }
  } catch {
    // ignore
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    if (isUsingAdminSdk && adminDb) {
      await adminDb.collection('users').doc(id).delete();
    } else {
      await deleteDoc(doc(clientDb, 'users', id));
    }
  } catch (err: any) {
    console.warn('Firestore deleteUser warning:', err.message);
  }

  try {
    if (!process.env.VERCEL && fs.existsSync(DATA_DIR)) {
      const users = readFallback<StoredUser[]>('users.json', []);
      const filtered = users.filter((u) => u.id !== id);
      fs.writeFileSync(path.join(DATA_DIR, 'users.json'), JSON.stringify(filtered, null, 2));
    }
  } catch {
    // ignore
  }

  return true;
}

// ==========================================
// 6. Bootstrap State Management
// ==========================================
export async function getBootstrapStatus(): Promise<{ hasAdmin: boolean; adminCount: number }> {
  try {
    if (isUsingAdminSdk && adminDb) {
      const snap = await adminDb.collection('system_meta').doc('bootstrap').get();
      if (snap.exists && snap.data()?.hasAdmin) {
        return { hasAdmin: true, adminCount: snap.data()?.adminCount || 1 };
      }
    } else {
      const snap = await getDoc(doc(clientDb, 'system_meta', 'bootstrap'));
      if (snap.exists() && snap.data()?.hasAdmin) {
        return { hasAdmin: true, adminCount: snap.data()?.adminCount || 1 };
      }
    }
  } catch (err: any) {
    console.warn('Firestore bootstrap check warning:', err.message);
  }

  // Fallback: check users list
  const users = await getUsers();
  const admins = users.filter((u) => u.role === 'admin' && u.isActive !== false);
  return {
    hasAdmin: admins.length > 0,
    adminCount: admins.length,
  };
}

export async function markBootstrapped(adminUser: StoredUser): Promise<void> {
  const payload = {
    hasAdmin: true,
    adminCount: 1,
    bootstrappedAt: new Date().toISOString(),
    initialAdminEmail: adminUser.email,
  };

  try {
    if (isUsingAdminSdk && adminDb) {
      await adminDb.collection('system_meta').doc('bootstrap').set(payload);
    } else {
      await setDoc(doc(clientDb, 'system_meta', 'bootstrap'), payload);
    }
  } catch (err: any) {
    console.warn('Firestore markBootstrapped warning:', err.message);
  }
}

// ==========================================
// 7. Audit Logging Operations
// ==========================================
export interface StoredAuditEntry {
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

export async function getAuditLogs(): Promise<StoredAuditEntry[]> {
  try {
    if (isUsingAdminSdk && adminDb) {
      const snap = await adminDb.collection('audit_logs').orderBy('timestamp', 'desc').limit(100).get();
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as StoredAuditEntry);
      }
    } else {
      const snap = await getDocs(query(collection(clientDb, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100)));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as StoredAuditEntry);
      }
    }
  } catch (err: any) {
    console.warn('Firestore audit logs fetch warning:', err.message);
  }

  return readFallback<StoredAuditEntry[]>('audit.json', []);
}

export async function addAuditLog(entry: StoredAuditEntry): Promise<void> {
  try {
    if (isUsingAdminSdk && adminDb) {
      await adminDb.collection('audit_logs').doc(entry.id).set(entry);
    } else {
      await setDoc(doc(clientDb, 'audit_logs', entry.id), entry);
    }
  } catch (err: any) {
    console.warn('Firestore addAuditLog warning:', err.message);
  }

  try {
    if (!process.env.VERCEL && fs.existsSync(DATA_DIR)) {
      const existing = readFallback<StoredAuditEntry[]>('audit.json', []);
      const updated = [entry, ...existing].slice(0, 300);
      fs.writeFileSync(path.join(DATA_DIR, 'audit.json'), JSON.stringify(updated, null, 2));
    }
  } catch {
    // ignore
  }
}

export async function clearAuditLogs(): Promise<boolean> {
  try {
    if (!process.env.VERCEL && fs.existsSync(DATA_DIR)) {
      fs.writeFileSync(path.join(DATA_DIR, 'audit.json'), JSON.stringify([], null, 2));
    }
  } catch {
    // ignore
  }
  return true;
}

// ==========================================
// 8. Media Upload & Storage Operations
// ==========================================
export async function uploadMedia(
  buffer: Buffer,
  filename: string,
  contentType: string,
  uploadedBy: string
): Promise<{ url: string; filename: string; size: number; contentType: string }> {
  const ext = path.extname(filename).toLowerCase();
  const safeBase = path.basename(filename, ext).replace(/[^a-zA-Z0-9_\-]/g, '_');
  const safeFilename = `media_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
  const storagePath = `media/${safeFilename}`;

  // 1. Try Firebase Admin Storage Bucket if available
  if (isUsingAdminSdk && adminStorageBucket) {
    try {
      const file = adminStorageBucket.file(storagePath);
      await file.save(buffer, {
        metadata: { contentType },
        public: true,
      });
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2035',
      });
      return { url, filename: safeFilename, size: buffer.length, contentType };
    } catch (e: any) {
      console.warn('Admin storage upload error, falling back:', e.message);
    }
  }

  // 2. Try Firebase Client Storage
  try {
    const fileRef = storageRef(clientStorage, storagePath);
    await uploadBytes(fileRef, buffer, { contentType });
    const url = await getDownloadURL(fileRef);
    return { url, filename: safeFilename, size: buffer.length, contentType };
  } catch (err: any) {
    console.warn('Client storage upload warning:', err.message);
  }

  // 3. Fallback: Base64 data URI (guarantees media persists and displays across serverless and preview without ephemeral disk loss)
  const base64 = buffer.toString('base64');
  const dataUri = `data:${contentType};base64,${base64}`;

  // Also write to local public/uploads if running locally in container
  try {
    if (!process.env.VERCEL) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      fs.writeFileSync(path.join(uploadsDir, safeFilename), buffer);
      return { url: `/uploads/${safeFilename}`, filename: safeFilename, size: buffer.length, contentType };
    }
  } catch {
    // ignore
  }

  return { url: dataUri, filename: safeFilename, size: buffer.length, contentType };
}

export { isUsingAdminSdk };
