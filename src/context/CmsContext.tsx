import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CmsDatabase,
  ProductItem,
  OperationItem,
  ProjectItem,
  ServiceItem,
  FarmLocation,
  MediaSlot,
  SiteSettings,
  EnquirySubmission,
  PageRoute,
  AppRoute,
  AuthUser,
} from '../types';
import { defaultCmsDatabase } from '../data/defaultData';

export interface AuthStatus {
  hasAdmin: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
}

interface CmsContextType {
  data: CmsDatabase;
  activeRoute: AppRoute;
  setActiveRoute: (route: PageRoute) => void;
  navigateTo: (route: AppRoute) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isEnquiryOpen: boolean;
  setIsEnquiryOpen: (open: boolean) => void;
  enquiryPreselect?: { type: string; subject: string };
  openEnquiryModal: (type?: string, subject?: string) => void;
  isSeoModalOpen: boolean;
  setIsSeoModalOpen: (open: boolean) => void;

  // Authentication
  adminToken: string | null;
  authStatus: AuthStatus;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  bootstrapAdmin: (payload: { fullName: string; username: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  checkAuthStatus: () => Promise<void>;

  // Server Content Synchronization
  saveSectionToServer: (section: string, payload: any) => Promise<{ success: boolean; error?: string }>;
  assignMediaSlotOnServer: (payload: { slotId: string; url: string; altText?: string; caption?: string; focalPoint?: string }) => Promise<{ success: boolean; error?: string }>;
  resetContentOnServer: () => Promise<{ success: boolean; error?: string }>;
  uploadMediaFile: (file: File, options?: { altText?: string; caption?: string }) => Promise<{ success: boolean; url?: string; error?: string }>;

  // Employer / Employee Role & Permissions Management (Admin only)
  fetchEditors: () => Promise<{ success: boolean; editors?: any[]; error?: string }>;
  createEditor: (payload: { fullName: string; username: string; email: string; password: string; permissions?: any }) => Promise<{ success: boolean; editor?: any; error?: string }>;
  updateEditorPermissions: (id: string, permissions: any) => Promise<{ success: boolean; error?: string }>;
  updateEditorStatus: (id: string, isActive: boolean) => Promise<{ success: boolean; error?: string }>;
  resetEditorPassword: (id: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  fetchAuditLogs: (filter?: { userId?: string; action?: string; section?: string }) => Promise<{ success: boolean; logs?: any[]; error?: string }>;
  fetchEditorOverview: () => Promise<{ success: boolean; overview?: any; error?: string }>;

  // CMS update methods (local & immediate)
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  updateOperation: (id: string, updated: Partial<OperationItem>) => void;
  addOperation: (item: OperationItem) => void;
  deleteOperation: (id: string) => void;
  updateProduct: (id: string, updated: Partial<ProductItem>) => void;
  addProduct: (item: ProductItem) => void;
  deleteProduct: (id: string) => void;
  updateProject: (id: string, updated: Partial<ProjectItem>) => void;
  addProject: (item: ProjectItem) => void;
  deleteProject: (id: string) => void;
  updateLocation: (id: string, updated: Partial<FarmLocation>) => void;
  updateMediaSlot: (slotId: string, updated: Partial<MediaSlot>) => void;
  assignMediaUrl: (slotId: string, url: string, altText?: string) => void;
  resetToDefaults: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonString: string) => boolean;

  // Enquiry submissions
  submissions: EnquirySubmission[];
  submitEnquiry: (submission: Omit<EnquirySubmission, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  isCmsDirty: boolean;
}

const STORAGE_KEY = 'dzinopona_cms_v2';
const SUBMISSIONS_KEY = 'dzinopona_enquiries_v1';
const TOKEN_KEY = 'dzinopona_admin_token';

const CmsContext = createContext<CmsContextType | undefined>(undefined);

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<CmsDatabase>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultCmsDatabase,
          ...parsed,
          settings: { ...defaultCmsDatabase.settings, ...parsed.settings },
          mediaSlots: { ...defaultCmsDatabase.mediaSlots, ...parsed.mediaSlots },
        };
      }
    } catch {
      // Fallback
    }
    return defaultCmsDatabase;
  });

  // Initial route detection from URL (allows direct /auth, /admin, /editor access)
  const getInitialRoute = (): AppRoute => {
    try {
      const path = window.location.pathname.replace(/^\//, '').toLowerCase();
      if (path === 'auth' || path === 'admin' || path === 'editor') return path as AppRoute;
      const searchParams = new URLSearchParams(window.location.search);
      const routeParam = searchParams.get('route');
      if (routeParam === 'auth' || routeParam === 'admin' || routeParam === 'editor') return routeParam as AppRoute;
      const hash = window.location.hash.replace(/^#/, '').toLowerCase();
      if (hash === 'auth' || hash === 'admin' || hash === 'editor') return hash as AppRoute;
    } catch {
      // ignore
    }
    return 'home';
  };

  const [activeRoute, setActiveRouteState] = useState<AppRoute>(getInitialRoute);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState<boolean>(false);
  const [enquiryPreselect, setEnquiryPreselect] = useState<{ type: string; subject: string } | undefined>(undefined);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState<boolean>(false);

  // Sync route with browser history (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setActiveRouteState(getInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Authentication State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    hasAdmin: true,
    isAuthenticated: false,
    user: null,
  });

  const [submissions, setSubmissions] = useState<EnquirySubmission[]>(() => {
    try {
      const saved = localStorage.getItem(SUBMISSIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Navigate functions
  const setActiveRoute = (route: PageRoute) => {
    setActiveRouteState(route);
  };

  const navigateTo = (route: AppRoute) => {
    setActiveRouteState(route);
    try {
      if (['auth', 'admin', 'editor'].includes(route)) {
        window.history.pushState(null, '', `/${route}`);
      } else {
        window.history.pushState(null, '', '/');
      }
    } catch {
      // ignore history errors
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Persist content to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Unable to persist CMS database', e);
    }
  }, [data]);

  // Persist enquiries to local storage
  useEffect(() => {
    try {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
    } catch (e) {
      console.warn('Unable to persist enquiries', e);
    }
  }, [submissions]);

  // Sync window title and meta tags with active route and CMS SEO data
  useEffect(() => {
    const routeTitles: Record<string, string> = {
      home: `${data.settings.companyName} | ${data.settings.tagline}`,
      about: `About Us | ${data.settings.companyName} - Zimbabwean Agricultural Enterprise`,
      operations: `Commercial Operations | ${data.settings.companyName}`,
      products: `Agricultural Products Catalogue | ${data.settings.companyName}`,
      projects: `Strategic Development Pipeline | ${data.settings.companyName}`,
      services: `Agribusiness Services | ${data.settings.companyName}`,
      locations: `Farming Locations Across Zimbabwe | ${data.settings.companyName}`,
      contact: `Contact & Commercial Enquiries | ${data.settings.companyName}`,
      auth: `Sign In | ${data.settings.companyName} Administrative Portal`,
      admin: `CMS Management Console | ${data.settings.companyName}`,
    };

    document.title = routeTitles[activeRoute] || data.settings.seo.metaTitle;
  }, [activeRoute, data.settings]);

  // Check auth status from server
  const checkAuthStatus = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      const token = adminToken || localStorage.getItem(TOKEN_KEY);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/auth/status', { headers });
      if (res.ok) {
        const json = await res.json();
        setAuthStatus({
          hasAdmin: Boolean(json.hasAdmin),
          isAuthenticated: Boolean(json.isAuthenticated),
          user: json.user || null,
        });
      }
    } catch (err) {
      console.warn('Auth status check failed, using local defaults', err);
    }
  }, [adminToken]);

  // Initial data loading from server
  useEffect(() => {
    checkAuthStatus();

    // Fetch live content from server
    fetch('/api/content')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load server content');
      })
      .then((serverContent) => {
        if (serverContent && serverContent.settings) {
          setData((prev) => ({
            ...prev,
            ...serverContent,
            settings: { ...defaultCmsDatabase.settings, ...serverContent.settings },
            mediaSlots: { ...defaultCmsDatabase.mediaSlots, ...serverContent.mediaSlots },
          }));
        }
      })
      .catch((err) => {
        console.warn('Using local content cache:', err);
      });
  }, [checkAuthStatus]);

  // Fetch server enquiries if authenticated
  useEffect(() => {
    if (adminToken && authStatus.isAuthenticated) {
      fetch('/api/admin/enquiries', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((enquiries) => {
          if (Array.isArray(enquiries)) {
            setSubmissions(enquiries);
          }
        })
        .catch(() => {});
    }
  }, [adminToken, authStatus.isAuthenticated]);

  // Authentication Methods
  const login = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Authentication failed. Please verify credentials.' };
      }

      const token = json.token;
      try {
        localStorage.setItem(TOKEN_KEY, token);
      } catch (e) {
        console.warn('Could not store token in localStorage', e);
      }
      setAdminToken(token);
      setAuthStatus({
        hasAdmin: true,
        isAuthenticated: true,
        user: json.user,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed.' };
    }
  };

  const bootstrapAdmin = async (payload: {
    fullName: string;
    username: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Administrator initialization failed.' };
      }

      const token = json.token;
      try {
        localStorage.setItem(TOKEN_KEY, token);
      } catch (e) {
        console.warn('Could not store token', e);
      }
      setAdminToken(token);
      setAuthStatus({
        hasAdmin: true,
        isAuthenticated: true,
        user: json.user,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed.' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (adminToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      }
    } catch {
      // Ignore logout network error
    } finally {
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        // Ignore
      }
      setAdminToken(null);
      setAuthStatus((prev) => ({ ...prev, isAuthenticated: false, user: null }));
      setActiveRouteState('home');
    }
  };

  // Server Content Synchronization Methods
  const saveSectionToServer = async (section: string, payload: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = adminToken || localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`/api/admin/content/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || `Failed to update ${section} on server.` };
      }

      // Update local state to match server response
      setData((prev) => {
        const next = { ...prev, lastUpdated: new Date().toISOString() };
        switch (section) {
          case 'homepage':
            next.settings = { ...next.settings, homepage: { ...next.settings.homepage, ...payload } };
            break;
          case 'about':
            next.settings = { ...next.settings, about: { ...next.settings.about, ...payload } };
            break;
          case 'operations':
            if (Array.isArray(payload)) next.operations = payload;
            break;
          case 'products':
            if (Array.isArray(payload)) next.products = payload;
            break;
          case 'projects':
            if (Array.isArray(payload)) next.projects = payload;
            break;
          case 'services':
            if (Array.isArray(payload)) next.services = payload;
            break;
          case 'locations':
            if (Array.isArray(payload)) next.locations = payload;
            break;
          case 'contact':
            next.settings = { ...next.settings, contact: { ...next.settings.contact, ...payload } };
            break;
          case 'footer':
            next.settings = { ...next.settings, footer: { ...next.settings.footer, ...payload } };
            break;
          case 'seo':
            next.settings = { ...next.settings, seo: { ...next.settings.seo, ...payload } };
            break;
          case 'settings':
            next.settings = { ...next.settings, ...payload };
            break;
          case 'mediaSlots':
            next.mediaSlots = { ...next.mediaSlots, ...payload };
            break;
        }
        return next;
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error updating section on server.' };
    }
  };

  const assignMediaSlotOnServer = async (payload: {
    slotId: string;
    url: string;
    altText?: string;
    caption?: string;
    focalPoint?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = adminToken || localStorage.getItem(TOKEN_KEY);
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Failed to update media slot.' };
      }

      setData((prev) => {
        const existing = prev.mediaSlots[payload.slotId] || {
          id: payload.slotId,
          label: 'Media Slot',
          category: 'landscape',
          description: 'Media slot',
          aspectRatio: '16:9',
          focalPoint: 'center',
          isCustomUploaded: false,
        };

        return {
          ...prev,
          lastUpdated: new Date().toISOString(),
          mediaSlots: {
            ...prev.mediaSlots,
            [payload.slotId]: {
              ...existing,
              url: payload.url || undefined,
              altText: payload.altText || existing.altText,
              caption: payload.caption || existing.caption,
              focalPoint: (payload.focalPoint as any) || existing.focalPoint || 'center',
              isCustomUploaded: Boolean(payload.url),
            },
          },
        };
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error updating media slot.' };
    }
  };

  const resetContentOnServer = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = adminToken || localStorage.getItem(TOKEN_KEY);
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Failed to reset content.' };
      }

      setData(defaultCmsDatabase);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error resetting content.' };
    }
  };

  // Upload Media File to Server (Supporting images and videos)
  const uploadMediaFile = async (
    file: File,
    options?: { altText?: string; caption?: string }
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const token = adminToken || localStorage.getItem(TOKEN_KEY);
      if (!token) {
        return { success: false, error: 'Authentication required to upload media.' };
      }

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          base64Data,
          altText: options?.altText,
          caption: options?.caption,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Failed to upload media asset.' };
      }

      return { success: true, url: json.url };
    } catch (err: any) {
      return { success: false, error: err.message || 'Media upload failed.' };
    }
  };

  // Editor Account Management (Admin only)
  const fetchEditors = async (): Promise<{ success: boolean; editors?: any[]; error?: string }> => {
    try {
      const token = adminToken || localStorage.getItem(TOKEN_KEY);
      const res = await fetch('/api/admin/editors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error || 'Failed to fetch editors.' };
      return { success: true, editors: json };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed.' };
    }
  };

  const createEditor = async (payload: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    permissions?: any;
  }): Promise<{ success: boolean; editor?: any; error?: string }> => {
    try {
      const token = adminToken || localStorage.getItem(TOKEN_KEY);
      const res = await fetch('/api/admin/editors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) return { success: false, error: json.error || 'Failed to create editor account.' };
      return { success: true, editor: json.editor };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed.' };
    }
  };

  const updateEditorPermissions = async (id: string, permissions: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = adminToken || localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`/api/admin/editors/${id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) return { success: false, error: json.error || 'Failed to update permissions.' };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed.' };
    }
  };

  const updateEditorStatus = async (id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = adminToken || localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`/api/admin/editors/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) return { success: false, error: json.error || 'Failed to update account status.' };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed.' };
    }
  };

  const resetEditorPassword = async (id: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = adminToken || localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`/api/admin/editors/${id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) return { success: false, error: json.error || 'Failed to reset editor password.' };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed.' };
    }
  };

  const fetchAuditLogs = async (filter?: { userId?: string; action?: string; section?: string }): Promise<{ success: boolean; logs?: any[]; error?: string }> => {
    try {
      const token = adminToken || localStorage.getItem(TOKEN_KEY);
      const params = new URLSearchParams();
      if (filter?.userId) params.set('userId', filter.userId);
      if (filter?.action) params.set('action', filter.action);
      if (filter?.section) params.set('section', filter.section);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/admin/audit${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error || 'Failed to fetch audit records.' };
      return { success: true, logs: json };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed.' };
    }
  };

  const fetchEditorOverview = async (): Promise<{ success: boolean; overview?: any; error?: string }> => {
    try {
      const token = adminToken || localStorage.getItem(TOKEN_KEY);
      const res = await fetch('/api/editor/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error || 'Failed to fetch editor overview.' };
      return { success: true, overview: json };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed.' };
    }
  };

  // Local Fast CMS Updates
  const openEnquiryModal = (type = 'products', subject = '') => {
    setEnquiryPreselect({ type, subject });
    setIsEnquiryOpen(true);
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setData((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  const updateOperation = (id: string, updated: Partial<OperationItem>) => {
    setData((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      operations: prev.operations.map((op) => (op.id === id ? { ...op, ...updated } : op)),
    }));
  };

  const addOperation = (item: OperationItem) => {
    setData((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      operations: [...prev.operations, item],
    }));
  };

  const deleteOperation = (id: string) => {
    setData((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      operations: prev.operations.filter((op) => op.id !== id),
    }));
  };

  const updateProduct = (id: string, updated: Partial<ProductItem>) => {
    setData((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      products: prev.products.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    }));
  };

  const addProduct = (item: ProductItem) => {
    setData((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      products: [...prev.products, item],
    }));
  };

  const deleteProduct = (id: string) => {
    setData((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      products: prev.products.filter((p) => p.id !== id),
    }));
  };

  const updateProject = (id: string, updated: Partial<ProjectItem>) => {
    setData((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      projects: prev.projects.map((proj) => (proj.id === id ? { ...proj, ...updated } : proj)),
    }));
  };

  const addProject = (item: ProjectItem) => {
    setData((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      projects: [...prev.projects, item],
    }));
  };

  const deleteProject = (id: string) => {
    setData((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  const updateLocation = (id: string, updated: Partial<FarmLocation>) => {
    setData((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      locations: prev.locations.map((loc) => (loc.id === id ? { ...loc, ...updated } : loc)),
    }));
  };

  const updateMediaSlot = (slotId: string, updated: Partial<MediaSlot>) => {
    setData((prev) => {
      const existing = prev.mediaSlots[slotId];
      if (!existing) return prev;
      return {
        ...prev,
        lastUpdated: new Date().toISOString(),
        mediaSlots: {
          ...prev.mediaSlots,
          [slotId]: { ...existing, ...updated },
        },
      };
    });
  };

  const assignMediaUrl = (slotId: string, url: string, altText?: string) => {
    setData((prev) => {
      const existing = prev.mediaSlots[slotId];
      if (!existing) return prev;
      return {
        ...prev,
        lastUpdated: new Date().toISOString(),
        mediaSlots: {
          ...prev.mediaSlots,
          [slotId]: {
            ...existing,
            url,
            altText: altText || existing.altText,
            isCustomUploaded: !!url,
          },
        },
      };
    });
  };

  const resetToDefaults = () => {
    setData(defaultCmsDatabase);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const exportDatabaseJson = (): string => {
    return JSON.stringify(data, null, 2);
  };

  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.settings && parsed.operations && parsed.products) {
        setData(parsed);
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON import format', e);
    }
    return false;
  };

  const submitEnquiry = async (submission: Omit<EnquirySubmission, 'id' | 'createdAt' | 'status'>) => {
    const localEntry: EnquirySubmission = {
      ...submission,
      id: 'enq-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'new',
    };

    setSubmissions((prev) => [localEntry, ...prev]);

    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
    } catch (err) {
      console.warn('Enquiry saved locally; server delivery queued', err);
    }
  };

  return (
    <CmsContext.Provider
      value={{
        data,
        activeRoute,
        setActiveRoute,
        navigateTo,
        isAdminOpen,
        setIsAdminOpen,
        isEnquiryOpen,
        setIsEnquiryOpen,
        enquiryPreselect,
        openEnquiryModal,
        isSeoModalOpen,
        setIsSeoModalOpen,
        adminToken,
        authStatus,
        login,
        logout,
        bootstrapAdmin,
        checkAuthStatus,
        saveSectionToServer,
        assignMediaSlotOnServer,
        resetContentOnServer,
        uploadMediaFile,
        fetchEditors,
        createEditor,
        updateEditorPermissions,
        updateEditorStatus,
        resetEditorPassword,
        fetchAuditLogs,
        fetchEditorOverview,
        updateSettings,
        updateOperation,
        addOperation,
        deleteOperation,
        updateProduct,
        addProduct,
        deleteProduct,
        updateProject,
        addProject,
        deleteProject,
        updateLocation,
        updateMediaSlot,
        assignMediaUrl,
        resetToDefaults,
        exportDatabaseJson,
        importDatabaseJson,
        submissions,
        submitEnquiry,
        isCmsDirty: Boolean(localStorage.getItem(STORAGE_KEY)),
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = (): CmsContextType => {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};
