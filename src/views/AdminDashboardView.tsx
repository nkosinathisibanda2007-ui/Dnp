import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Home,
  Info,
  Layers,
  Package,
  TrendingUp,
  Briefcase,
  MapPin,
  PhoneCall,
  FileText,
  Image as ImageIcon,
  Search,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ExternalLink,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Clock,
  ArrowRight,
  Users,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { DzinoponaLogo } from '../components/DzinoponaLogo';
import { StaffEditorManager } from '../components/StaffEditorManager';
import { AuditLogViewer } from '../components/AuditLogViewer';
import {
  ProductItem,
  OperationItem,
  ProjectItem,
  ServiceItem,
  FarmLocation,
  MediaSlot,
  ProductCategory,
  ProductStatus,
} from '../types';

export const AdminDashboardView: React.FC = () => {
  const {
    data,
    authStatus,
    logout,
    navigateTo,
    saveSectionToServer,
    assignMediaSlotOnServer,
    resetContentOnServer,
    adminToken,
    submissions,
    uploadMediaFile,
  } = useCms();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'homepage'
    | 'about'
    | 'operations'
    | 'products'
    | 'projects'
    | 'services'
    | 'locations'
    | 'contact'
    | 'footer'
    | 'media'
    | 'seo'
    | 'enquiries'
    | 'editors'
    | 'audit'
    | 'backup'
  >('overview');

  // Local draft copies for pristine editing before publish
  const [homepageDraft, setHomepageDraft] = useState(data.settings.homepage || {
    heroBadge: 'Modern Zimbabwean Agricultural Enterprise',
    heroHeadline: data.settings.companyName,
    heroSubheadline: data.settings.tagline,
    heroIntro: 'A forward-thinking agricultural enterprise operating across Norton, Mvuma, Esigodini, and Ntabazinduna.',
    heroPrimaryCta: 'Explore Our Operations',
    heroSecondaryCta: "Let's Work Together",
    factsTicker: [
      { label: 'Hubs', value: '4 Strategic', subtext: 'Across Zimbabwe' },
      { label: 'Disciplines', value: '11 Integrated', subtext: 'Crops to Livestock' },
      { label: 'Value Story', value: 'Farm to Market', subtext: 'End-to-End Chain' },
      { label: 'Entity', value: 'Pvt Limited', subtext: 'Incorporated in ZW' },
    ],
    productionPolicyNotice: 'Product availability varies according to production cycles. Please contact us for current availability.',
  });

  const [aboutDraft, setAboutDraft] = useState(data.settings.about);
  const [operationsDraft, setOperationsDraft] = useState(data.operations);
  const [productsDraft, setProductsDraft] = useState(data.products);
  const [projectsDraft, setProjectsDraft] = useState(data.projects);
  const [servicesDraft, setServicesDraft] = useState(data.services);
  const [locationsDraft, setLocationsDraft] = useState(data.locations);
  const [contactDraft, setContactDraft] = useState(data.settings.contact);
  const [footerDraft, setFooterDraft] = useState(data.settings.footer || {
    operationalNoticeTitle: 'Production Cycles Notice',
    operationalNoticeText: 'Product availability varies strictly according to seasonal agricultural cycles. We do not fabricate current inventory; contact our commercial desk for confirmed batch allocations.',
    agroEcologicalBand: 'Zimbabwe Agro-Ecological Regions IIa, III & IV • FARM → PRODUCTION → VALUE → MARKET',
    copyrightNotice: 'Registered Zimbabwean Agribusiness. All rights reserved.',
  });
  const [seoDraft, setSeoDraft] = useState(data.settings.seo);
  const [settingsDraft, setSettingsDraft] = useState({
    companyName: data.settings.companyName,
    legalName: data.settings.legalName,
    tagline: data.settings.tagline,
    positioning: data.settings.positioning,
  });

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Media Library state
  const [selectedSlotId, setSelectedSlotId] = useState<string>(Object.keys(data.mediaSlots)[0] || '');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaAltInput, setMediaAltInput] = useState('');
  const [mediaCaptionInput, setMediaCaptionInput] = useState('');

  // Modals / Item editing states
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingOperationId, setEditingOperationId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [backupJson, setBackupJson] = useState('');
  const [importJson, setImportJson] = useState('');

  // Sync draft states when data updates from server
  useEffect(() => {
    if (data.settings.homepage) setHomepageDraft(data.settings.homepage);
    if (data.settings.about) setAboutDraft(data.settings.about);
    setOperationsDraft(data.operations);
    setProductsDraft(data.products);
    setProjectsDraft(data.projects);
    setServicesDraft(data.services);
    setLocationsDraft(data.locations);
    setContactDraft(data.settings.contact);
    if (data.settings.footer) setFooterDraft(data.settings.footer);
    setSeoDraft(data.settings.seo);
    setSettingsDraft({
      companyName: data.settings.companyName,
      legalName: data.settings.legalName,
      tagline: data.settings.tagline,
      positioning: data.settings.positioning,
    });
  }, [data]);

  // Fetch overview stats and audit logs
  useEffect(() => {
    if (!adminToken) return;
    fetch('/api/admin/overview', {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData) {
          setOverviewStats(resData.stats);
          if (resData.recentAuditLogs) setAuditLogs(resData.recentAuditLogs);
        }
      })
      .catch(() => {});
  }, [adminToken]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSection = async (section: string, payload: any) => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const res = await saveSectionToServer(section, payload);
      if (res.success) {
        showToast(`Section "${section}" published to live website!`);
        // Refresh overview
        if (adminToken) {
          fetch('/api/admin/overview', {
            headers: { Authorization: `Bearer ${adminToken}` },
          })
            .then((r) => r.json())
            .then((d) => {
              if (d?.stats) setOverviewStats(d.stats);
              if (d?.recentAuditLogs) setAuditLogs(d.recentAuditLogs);
            })
            .catch(() => {});
        }
      } else {
        setErrorMessage(res.error || 'Failed to save section changes.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server error while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId) return;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const res = await assignMediaSlotOnServer({
        slotId: selectedSlotId,
        url: mediaUrlInput.trim(),
        altText: mediaAltInput.trim(),
        caption: mediaCaptionInput.trim(),
      });
      if (res.success) {
        showToast(`Media slot "${selectedSlotId}" updated live!`);
      } else {
        setErrorMessage(res.error || 'Failed to assign image.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating media slot.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds 15MB limit.');
      return;
    }

    try {
      showToast('Uploading asset to server...');
      const res = await uploadMediaFile(file);
      if (res.success && res.url) {
        setMediaUrlInput(res.url);
        showToast('Media uploaded successfully to server.');
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setMediaUrlInput(reader.result as string);
          showToast('Image encoded ready to publish.');
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setMediaUrlInput(reader.result as string);
        showToast('Image encoded ready to publish.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToBaseline = async () => {
    if (!window.confirm('Are you sure you want to revert the entire website to the verified client baseline?')) {
      return;
    }
    setIsSaving(true);
    try {
      const res = await resetContentOnServer();
      if (res.success) {
        showToast('Website content restored to master verified baseline.');
      } else {
        setErrorMessage(res.error || 'Failed to reset.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server error.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1711] text-[#f5f2e8] flex flex-col antialiased selection:bg-[#ede8d8] selection:text-[#18261b]">
      {/* 1. TOP INSTITUTIONAL ADMIN HEADER */}
      <header className="sticky top-0 z-40 bg-[#142217] border-b border-[#283d2d] px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3.5">
          <DzinoponaLogo size="sm" variant="emblem" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm tracking-tight text-[#faf9f5]">
                Dzinopona Farms
              </span>
              <span className="px-1.5 py-0.5 rounded-sm bg-[#e5a952]/20 text-[#e5a952] text-[10px] font-semibold uppercase tracking-wider">
                CMS Admin
              </span>
            </div>
            <span className="text-[11px] text-[#869b89] block">
              Protected Production Content Engine
            </span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3">
          {/* User badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a2d1e] border border-white/10 text-xs text-[#abb8ad]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#e5a952]" />
            <span>
              {authStatus.user?.fullName || authStatus.user?.username || 'Administrator'}
            </span>
          </div>

          {/* View Public Website Link */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e3323] hover:bg-[#253f2b] text-[#faf9f5] text-xs font-semibold border border-[#38533e] transition-colors cursor-pointer shadow-xs"
            title="Open public website to see live published changes"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3 h-3 text-[#e5a952]" />
          </button>

          {/* Sign Out */}
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-200 text-xs font-medium border border-red-800/60 transition-colors cursor-pointer"
            title="End administrative session"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Floating Notifications */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 p-3.5 rounded-xl bg-emerald-900/95 border border-emerald-600 text-emerald-100 text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-16 right-6 z-50 p-3.5 rounded-xl bg-red-900/95 border border-red-600 text-red-100 text-xs font-semibold shadow-2xl flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="ml-2 underline text-[10px]">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. MAIN LAYOUT: SIDEBAR NAV + CONTENT VIEW */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Sidebar Tabs */}
        <aside className="w-full md:w-64 bg-[#121c14] border-r border-[#233527] shrink-0 p-3 md:p-4 space-y-1 overflow-x-auto md:overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#728575] px-2 py-1.5">
            Content Sections
          </div>

          {[
            { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
            { id: 'homepage', label: 'Homepage Hero & Story', icon: Home },
            { id: 'about', label: 'About Us & Pillars', icon: Info },
            { id: 'operations', label: 'Operations (11 Disciplines)', icon: Layers },
            { id: 'products', label: 'Products Catalogue', icon: Package },
            { id: 'projects', label: 'Strategic Projects', icon: TrendingUp },
            { id: 'services', label: 'Commercial Services', icon: Briefcase },
            { id: 'locations', label: 'Farming Locations', icon: MapPin },
            { id: 'contact', label: 'Contact & Addresses', icon: PhoneCall },
            { id: 'footer', label: 'Footer & Disclaimers', icon: FileText },
            { id: 'media', label: 'Media Library & Photos', icon: ImageIcon },
            { id: 'seo', label: 'SEO & Metadata', icon: Search },
            { id: 'enquiries', label: `Enquiries (${submissions.length})`, icon: PhoneCall },
            { id: 'editors', label: 'Staff & Editor Accounts', icon: Users },
            { id: 'audit', label: 'System Audit Trail', icon: Clock },
            { id: 'backup', label: 'Backup & Database', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                  isCurrent
                    ? 'bg-[#1e3323] text-[#faf9f5] font-semibold shadow-xs border border-[#3b5940]'
                    : 'text-[#95a898] hover:bg-[#162419] hover:text-[#faf9f5]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#e5a952]' : 'text-[#6b7e6f]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-[#233527] px-2">
            <span className="text-[10px] text-[#6b7e6f] block">
              DB Status: Connected (Local Persistent)
            </span>
            <span className="text-[10px] text-[#6b7e6f] block mt-0.5">
              Updated: {new Date(data.lastUpdated).toLocaleDateString()}
            </span>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl">
          {/* SECTION 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#faf9f5]">CMS Administration Overview</h1>
                <p className="text-xs text-[#95a898] mt-1">
                  Single source of truth for Dzinopona Farms public marketing website and data.
                </p>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#162419] border border-[#2a3d2e] space-y-1">
                  <span className="text-xs font-semibold text-[#869b89]">Operations</span>
                  <div className="text-2xl font-bold font-serif text-[#faf9f5]">
                    {overviewStats?.operationsCount || data.operations.length}
                  </div>
                  <span className="text-[11px] text-[#e5a952]">11 Core Disciplines</span>
                </div>

                <div className="p-4 rounded-xl bg-[#162419] border border-[#2a3d2e] space-y-1">
                  <span className="text-xs font-semibold text-[#869b89]">Products</span>
                  <div className="text-2xl font-bold font-serif text-[#faf9f5]">
                    {overviewStats?.productsCount || data.products.length}
                  </div>
                  <span className="text-[11px] text-[#e5a952]">Crops, Cattle, Poultry</span>
                </div>

                <div className="p-4 rounded-xl bg-[#162419] border border-[#2a3d2e] space-y-1">
                  <span className="text-xs font-semibold text-[#869b89]">Farm Locations</span>
                  <div className="text-2xl font-bold font-serif text-[#faf9f5]">
                    {overviewStats?.locationsCount || data.locations.length}
                  </div>
                  <span className="text-[11px] text-[#e5a952]">Norton, Mvuma, etc.</span>
                </div>

                <div className="p-4 rounded-xl bg-[#162419] border border-[#2a3d2e] space-y-1">
                  <span className="text-xs font-semibold text-[#869b89]">Commercial Enquiries</span>
                  <div className="text-2xl font-bold font-serif text-[#faf9f5]">
                    {submissions.length}
                  </div>
                  <span className="text-[11px] text-[#e5a952]">Recorded Submissions</span>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="p-5 rounded-2xl bg-[#162419] border border-[#2a3d2e] space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#e5a952]">
                  Direct Content Management Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="p-3 rounded-lg bg-[#1e3323] hover:bg-[#26402c] border border-[#38533e] text-left transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-[#faf9f5] block">Update Product Availability</span>
                    <span className="text-[11px] text-[#95a898]">Modify statuses and harvest notes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('media')}
                    className="p-3 rounded-lg bg-[#1e3323] hover:bg-[#26402c] border border-[#38533e] text-left transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-[#faf9f5] block">Assign Client Photography</span>
                    <span className="text-[11px] text-[#95a898]">Upload photos into reserved slots</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('homepage')}
                    className="p-3 rounded-lg bg-[#1e3323] hover:bg-[#26402c] border border-[#38533e] text-left transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-[#faf9f5] block">Edit Homepage Hero</span>
                    <span className="text-[11px] text-[#95a898]">Refine headline, subheadline, CTAs</span>
                  </button>
                </div>
              </div>

              {/* Audit Trail */}
              <div className="p-5 rounded-2xl bg-[#162419] border border-[#2a3d2e] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#abb8ad] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#e5a952]" />
                    <span>Recent Administrative Audit Trail</span>
                  </h3>
                  <span className="text-[10px] text-[#718573]">Tracked changes</span>
                </div>

                {auditLogs.length === 0 ? (
                  <div className="py-4 text-center text-xs text-[#718573]">
                    No recent administrative modifications recorded.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {auditLogs.slice(0, 6).map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-lg bg-[#111c13] border border-white/5 text-xs flex items-center justify-between gap-4"
                      >
                        <div className="space-y-0.5">
                          <span className="font-medium text-[#faf9f5]">{log.details}</span>
                          <div className="flex items-center gap-2 text-[10px] text-[#718573]">
                            <span>Admin: {log.username}</span>
                            <span>•</span>
                            <span>Section: {log.section}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#abb8ad] shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 2: HOMEPAGE HERO & VALUE STORY */}
          {activeTab === 'homepage' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#faf9f5]">Homepage Content</h2>
                  <p className="text-xs text-[#95a898]">
                    Control the hero positioning, value story stages, and verified statistics.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveSection('homepage', homepageDraft)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e5a952] hover:bg-[#d4973f] text-[#142217] text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#162419] border border-[#2a3d2e] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#e5a952]">Hero Section</h3>

                <div>
                  <label className="block text-xs text-[#abb8ad] mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={homepageDraft.heroBadge}
                    onChange={(e) => setHomepageDraft({ ...homepageDraft, heroBadge: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#111c13] border border-white/15 text-xs text-[#faf9f5] focus:outline-hidden focus:border-[#e5a952]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#abb8ad] mb-1">Company Display Headline</label>
                  <input
                    type="text"
                    value={homepageDraft.heroHeadline}
                    onChange={(e) => setHomepageDraft({ ...homepageDraft, heroHeadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#111c13] border border-white/15 text-xs text-[#faf9f5] focus:outline-hidden focus:border-[#e5a952]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#abb8ad] mb-1">Tagline / Subheadline</label>
                  <input
                    type="text"
                    value={homepageDraft.heroSubheadline}
                    onChange={(e) => setHomepageDraft({ ...homepageDraft, heroSubheadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#111c13] border border-white/15 text-xs text-[#faf9f5] focus:outline-hidden focus:border-[#e5a952]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#abb8ad] mb-1">Intro Narrative</label>
                  <textarea
                    rows={3}
                    value={homepageDraft.heroIntro}
                    onChange={(e) => setHomepageDraft({ ...homepageDraft, heroIntro: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#111c13] border border-white/15 text-xs text-[#faf9f5] focus:outline-hidden focus:border-[#e5a952]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#abb8ad] mb-1">Primary CTA Button Label</label>
                    <input
                      type="text"
                      value={homepageDraft.heroPrimaryCta}
                      onChange={(e) => setHomepageDraft({ ...homepageDraft, heroPrimaryCta: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#111c13] border border-white/15 text-xs text-[#faf9f5] focus:outline-hidden focus:border-[#e5a952]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#abb8ad] mb-1">Secondary CTA Button Label</label>
                    <input
                      type="text"
                      value={homepageDraft.heroSecondaryCta}
                      onChange={(e) => setHomepageDraft({ ...homepageDraft, heroSecondaryCta: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#111c13] border border-white/15 text-xs text-[#faf9f5] focus:outline-hidden focus:border-[#e5a952]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#abb8ad] mb-1">
                    Production Cycle Availability Notice (Required Commercial Transparency)
                  </label>
                  <input
                    type="text"
                    value={homepageDraft.productionPolicyNotice}
                    onChange={(e) => setHomepageDraft({ ...homepageDraft, productionPolicyNotice: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#111c13] border border-white/15 text-xs text-[#faf9f5] focus:outline-hidden focus:border-[#e5a952]"
                  />
                </div>
              </div>

              {/* Facts Ticker Edit */}
              <div className="p-5 rounded-2xl bg-[#162419] border border-[#2a3d2e] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#e5a952]">
                  Verified Statistics Ticker (4 Columns)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {homepageDraft.factsTicker.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#111c13] border border-white/10 space-y-2">
                      <span className="text-[10px] text-[#e5a952] font-semibold">Column {idx + 1}</span>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={item.label}
                          placeholder="Label"
                          onChange={(e) => {
                            const copy = [...homepageDraft.factsTicker];
                            copy[idx].label = e.target.value;
                            setHomepageDraft({ ...homepageDraft, factsTicker: copy });
                          }}
                          className="px-2 py-1 bg-black/40 border border-white/10 rounded text-xs"
                        />
                        <input
                          type="text"
                          value={item.value}
                          placeholder="Value"
                          onChange={(e) => {
                            const copy = [...homepageDraft.factsTicker];
                            copy[idx].value = e.target.value;
                            setHomepageDraft({ ...homepageDraft, factsTicker: copy });
                          }}
                          className="px-2 py-1 bg-black/40 border border-white/10 rounded text-xs"
                        />
                        <input
                          type="text"
                          value={item.subtext}
                          placeholder="Subtext"
                          onChange={(e) => {
                            const copy = [...homepageDraft.factsTicker];
                            copy[idx].subtext = e.target.value;
                            setHomepageDraft({ ...homepageDraft, factsTicker: copy });
                          }}
                          className="px-2 py-1 bg-black/40 border border-white/10 rounded text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: ABOUT US & PILLARS */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#faf9f5]">About Us, Vision, Mission & Pillars</h2>
                  <p className="text-xs text-[#95a898]">
                    Core enterprise statements and the five operational pillars.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveSection('about', aboutDraft)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e5a952] hover:bg-[#d4973f] text-[#142217] text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#162419] border border-[#2a3d2e] space-y-4">
                <div>
                  <label className="block text-xs text-[#abb8ad] mb-1">Who We Are</label>
                  <textarea
                    rows={4}
                    value={aboutDraft.whoWeAre}
                    onChange={(e) => setAboutDraft({ ...aboutDraft, whoWeAre: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#111c13] border border-white/15 text-xs text-[#faf9f5] focus:outline-hidden focus:border-[#e5a952]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#abb8ad] mb-1">Company Background & Heritage</label>
                  <textarea
                    rows={3}
                    value={aboutDraft.companyBackground}
                    onChange={(e) => setAboutDraft({ ...aboutDraft, companyBackground: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#111c13] border border-white/15 text-xs text-[#faf9f5] focus:outline-hidden focus:border-[#e5a952]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#abb8ad] mb-1">Vision Statement</label>
                    <textarea
                      rows={3}
                      value={aboutDraft.vision}
                      onChange={(e) => setAboutDraft({ ...aboutDraft, vision: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#111c13] border border-white/15 text-xs text-[#faf9f5] focus:outline-hidden focus:border-[#e5a952]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#abb8ad] mb-1">Mission Statement</label>
                    <textarea
                      rows={3}
                      value={aboutDraft.mission}
                      onChange={(e) => setAboutDraft({ ...aboutDraft, mission: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#111c13] border border-white/15 text-xs text-[#faf9f5] focus:outline-hidden focus:border-[#e5a952]"
                    />
                  </div>
                </div>
              </div>

              {/* 5 Pillars */}
              <div className="p-5 rounded-2xl bg-[#162419] border border-[#2a3d2e] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#e5a952]">
                  The 5 Operational Pillars
                </h3>
                <div className="space-y-3">
                  {aboutDraft.fivePillars.map((pillar, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#111c13] border border-white/10 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#1e3323] text-[#e5a952] flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={pillar.name}
                          onChange={(e) => {
                            const copy = [...aboutDraft.fivePillars];
                            copy[idx].name = e.target.value;
                            setAboutDraft({ ...aboutDraft, fivePillars: copy });
                          }}
                          className="flex-1 px-2.5 py-1 bg-black/40 border border-white/10 rounded text-xs font-semibold"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={pillar.description}
                        onChange={(e) => {
                          const copy = [...aboutDraft.fivePillars];
                          copy[idx].description = e.target.value;
                          setAboutDraft({ ...aboutDraft, fivePillars: copy });
                        }}
                        className="w-full px-2.5 py-1 bg-black/40 border border-white/10 rounded text-xs text-[#abb8ad]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: OPERATIONS */}
          {activeTab === 'operations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#faf9f5]">
                    Operations ({operationsDraft.length} Disciplines)
                  </h2>
                  <p className="text-xs text-[#95a898]">
                    Manage active agricultural disciplines, descriptions, and feature status.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveSection('operations', operationsDraft)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e5a952] hover:bg-[#d4973f] text-[#142217] text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {operationsDraft.map((op, idx) => (
                  <div
                    key={op.id}
                    className="p-4 rounded-xl bg-[#162419] border border-[#2a3d2e] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-serif font-bold text-[#e5a952]">#{idx + 1}</span>
                        <input
                          type="text"
                          value={op.title}
                          onChange={(e) => {
                            const copy = [...operationsDraft];
                            copy[idx].title = e.target.value;
                            setOperationsDraft(copy);
                          }}
                          className="px-2.5 py-1 bg-[#111c13] border border-white/15 rounded text-xs font-semibold text-[#faf9f5]"
                        />
                        <select
                          value={op.status}
                          onChange={(e) => {
                            const copy = [...operationsDraft];
                            copy[idx].status = e.target.value as any;
                            setOperationsDraft(copy);
                          }}
                          className="px-2 py-1 bg-[#111c13] border border-white/15 rounded text-xs text-[#abb8ad]"
                        >
                          <option value="active">Active Operation</option>
                          <option value="expanding">Expanding</option>
                          <option value="developing">Developing</option>
                        </select>
                      </div>

                      <label className="flex items-center gap-1.5 text-xs text-[#abb8ad]">
                        <input
                          type="checkbox"
                          checked={op.featuredOnHome}
                          onChange={(e) => {
                            const copy = [...operationsDraft];
                            copy[idx].featuredOnHome = e.target.checked;
                            setOperationsDraft(copy);
                          }}
                        />
                        <span>Feature on Homepage</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#abb8ad] mb-1">Executive Summary</label>
                      <textarea
                        rows={2}
                        value={op.summary}
                        onChange={(e) => {
                          const copy = [...operationsDraft];
                          copy[idx].summary = e.target.value;
                          setOperationsDraft(copy);
                        }}
                        className="w-full px-2.5 py-1.5 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: PRODUCTS CATALOGUE */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#faf9f5]">
                    Commercial Products Catalogue ({productsDraft.length} Items)
                  </h2>
                  <p className="text-xs text-[#95a898]">
                    Manage grains, seedlings, livestock, poultry, and production cycle availability.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `prod-${Date.now()}`;
                      setProductsDraft([
                        {
                          id: newId,
                          name: 'New Commercial Product',
                          category: 'crops',
                          subCategory: 'Cereals',
                          description: 'Product specifications and quality standards.',
                          status: 'in_production',
                          isAvailableNow: true,
                          availabilityNote: 'Subject to seasonal production cycles.',
                          imageSlotId: 'media-crops-field',
                          order: productsDraft.length + 1,
                        },
                        ...productsDraft,
                      ]);
                      showToast('New product added to catalogue draft.');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-[#1e3323] hover:bg-[#28442e] text-[#faf9f5] text-xs font-semibold rounded-lg border border-[#3b5940] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Product</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveSection('products', productsDraft)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e5a952] hover:bg-[#d4973f] text-[#142217] text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
                  </button>
                </div>
              </div>

              {/* Products Table / Cards */}
              <div className="space-y-3">
                {productsDraft.map((prod, idx) => (
                  <div
                    key={prod.id}
                    className="p-4 rounded-xl bg-[#162419] border border-[#2a3d2e] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={prod.name}
                          onChange={(e) => {
                            const copy = [...productsDraft];
                            copy[idx].name = e.target.value;
                            setProductsDraft(copy);
                          }}
                          className="px-2.5 py-1 bg-[#111c13] border border-white/15 rounded text-xs font-semibold text-[#faf9f5]"
                        />

                        <select
                          value={prod.category}
                          onChange={(e) => {
                            const copy = [...productsDraft];
                            copy[idx].category = e.target.value as ProductCategory;
                            setProductsDraft(copy);
                          }}
                          className="px-2 py-1 bg-[#111c13] border border-white/15 rounded text-xs text-[#abb8ad]"
                        >
                          <option value="crops">Crops</option>
                          <option value="nursery">Nursery & Orchards</option>
                          <option value="livestock">Livestock</option>
                          <option value="poultry">Poultry</option>
                        </select>

                        <select
                          value={prod.status}
                          onChange={(e) => {
                            const copy = [...productsDraft];
                            copy[idx].status = e.target.value as ProductStatus;
                            setProductsDraft(copy);
                          }}
                          className="px-2 py-1 bg-[#111c13] border border-white/15 rounded text-xs text-[#abb8ad]"
                        >
                          <option value="in_production">In Production</option>
                          <option value="developing">Developing</option>
                          <option value="seasonal">Seasonal Harvest</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setProductsDraft(productsDraft.filter((p) => p.id !== prod.id));
                          showToast('Product removed from draft.');
                        }}
                        className="p-1 text-red-400 hover:text-red-200"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-[#abb8ad] mb-0.5">Description</label>
                        <input
                          type="text"
                          value={prod.description}
                          onChange={(e) => {
                            const copy = [...productsDraft];
                            copy[idx].description = e.target.value;
                            setProductsDraft(copy);
                          }}
                          className="w-full px-2.5 py-1 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#abb8ad] mb-0.5">Availability Note</label>
                        <input
                          type="text"
                          value={prod.availabilityNote || ''}
                          onChange={(e) => {
                            const copy = [...productsDraft];
                            copy[idx].availabilityNote = e.target.value;
                            setProductsDraft(copy);
                          }}
                          className="w-full px-2.5 py-1 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: PROJECTS PIPELINE */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#faf9f5]">Strategic Projects Pipeline</h2>
                  <p className="text-xs text-[#95a898]">
                    Document long-term development assets, center pivot rollouts, and macadamia expansions.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveSection('projects', projectsDraft)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e5a952] hover:bg-[#d4973f] text-[#142217] text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {projectsDraft.map((proj, idx) => (
                  <div key={proj.id} className="p-4 rounded-xl bg-[#162419] border border-[#2a3d2e] space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const copy = [...projectsDraft];
                          copy[idx].title = e.target.value;
                          setProjectsDraft(copy);
                        }}
                        className="px-2.5 py-1 bg-[#111c13] border border-white/15 rounded text-xs font-semibold text-[#faf9f5]"
                      />
                      <input
                        type="text"
                        value={proj.phase}
                        onChange={(e) => {
                          const copy = [...projectsDraft];
                          copy[idx].phase = e.target.value;
                          setProjectsDraft(copy);
                        }}
                        className="px-2.5 py-1 bg-[#111c13] border border-white/15 rounded text-xs text-[#e5a952]"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={proj.summary}
                      onChange={(e) => {
                        const copy = [...projectsDraft];
                        copy[idx].summary = e.target.value;
                        setProjectsDraft(copy);
                      }}
                      className="w-full px-2.5 py-1 bg-[#111c13] border border-white/15 rounded text-xs text-[#abb8ad]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 7: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#faf9f5]">Commercial Agribusiness Services</h2>
                  <p className="text-xs text-[#95a898]">
                    Farm Management, Contract Farming, Agronomy Advisory, and Technical Consultancy.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveSection('services', servicesDraft)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e5a952] hover:bg-[#d4973f] text-[#142217] text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {servicesDraft.map((srv, idx) => (
                  <div key={srv.id} className="p-4 rounded-xl bg-[#162419] border border-[#2a3d2e] space-y-2">
                    <input
                      type="text"
                      value={srv.title}
                      onChange={(e) => {
                        const copy = [...servicesDraft];
                        copy[idx].title = e.target.value;
                        setServicesDraft(copy);
                      }}
                      className="w-full px-2.5 py-1 bg-[#111c13] border border-white/15 rounded text-xs font-semibold text-[#faf9f5]"
                    />
                    <textarea
                      rows={2}
                      value={srv.shortDescription}
                      onChange={(e) => {
                        const copy = [...servicesDraft];
                        copy[idx].shortDescription = e.target.value;
                        setServicesDraft(copy);
                      }}
                      className="w-full px-2.5 py-1 bg-[#111c13] border border-white/15 rounded text-xs text-[#abb8ad]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 8: FARM LOCATIONS */}
          {activeTab === 'locations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#faf9f5]">
                    Farming Hub Locations ({locationsDraft.length} Strategic Centers)
                  </h2>
                  <p className="text-xs text-[#95a898]">
                    Norton, Mvuma, Esigodini, and Ntabazinduna agro-ecological zones and map coordinates.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveSection('locations', locationsDraft)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e5a952] hover:bg-[#d4973f] text-[#142217] text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
                </button>
              </div>

              {/* Strict Coordinate Integrity Notice */}
              <div className="p-3.5 rounded-xl bg-[#213524] border border-[#3b5940] text-xs text-[#d8e2da] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#e5a952] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#faf9f5] block">Location Verification Policy</span>
                  <p className="text-[11.5px] text-[#abb8ad]">
                    Do not invent exact farm coordinates. Coordinates must only reflect verified client-approved geographic points and general hub regions.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {locationsDraft.map((loc, idx) => (
                  <div key={loc.id} className="p-4 rounded-xl bg-[#162419] border border-[#2a3d2e] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-[#abb8ad] mb-0.5">Hub Name</label>
                        <input
                          type="text"
                          value={loc.name}
                          onChange={(e) => {
                            const copy = [...locationsDraft];
                            copy[idx].name = e.target.value;
                            setLocationsDraft(copy);
                          }}
                          className="w-full px-2.5 py-1 bg-[#111c13] border border-white/15 rounded text-xs font-semibold text-[#faf9f5]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#abb8ad] mb-0.5">Province</label>
                        <input
                          type="text"
                          value={loc.province}
                          onChange={(e) => {
                            const copy = [...locationsDraft];
                            copy[idx].province = e.target.value;
                            setLocationsDraft(copy);
                          }}
                          className="w-full px-2.5 py-1 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-[#abb8ad] mb-0.5">Agro-Ecological Zone</label>
                        <input
                          type="text"
                          value={loc.agroEcologicalZone}
                          onChange={(e) => {
                            const copy = [...locationsDraft];
                            copy[idx].agroEcologicalZone = e.target.value;
                            setLocationsDraft(copy);
                          }}
                          className="w-full px-2.5 py-1 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#abb8ad] mb-0.5">Primary Focus</label>
                        <input
                          type="text"
                          value={loc.primaryFocus}
                          onChange={(e) => {
                            const copy = [...locationsDraft];
                            copy[idx].primaryFocus = e.target.value;
                            setLocationsDraft(copy);
                          }}
                          className="w-full px-2.5 py-1 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#abb8ad] mb-0.5">Infrastructure & Water</label>
                      <input
                        type="text"
                        value={loc.infrastructureOverview}
                        onChange={(e) => {
                          const copy = [...locationsDraft];
                          copy[idx].infrastructureOverview = e.target.value;
                          setLocationsDraft(copy);
                        }}
                        className="w-full px-2.5 py-1 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 9: CONTACT & ENQUIRIES */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#faf9f5]">Contact Information</h2>
                  <p className="text-xs text-[#95a898]">Official emails, corporate desk address, and operating hubs summary.</p>
                </div>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveSection('contact', contactDraft)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e5a952] hover:bg-[#d4973f] text-[#142217] text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#162419] border border-[#2a3d2e] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#abb8ad] mb-1">Primary Email</label>
                    <input
                      type="email"
                      value={contactDraft.primaryEmail}
                      onChange={(e) => setContactDraft({ ...contactDraft, primaryEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#abb8ad] mb-1">Commercial Enquiries Email</label>
                    <input
                      type="email"
                      value={contactDraft.enquiryEmail}
                      onChange={(e) => setContactDraft({ ...contactDraft, enquiryEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#abb8ad] mb-1">Corporate Address</label>
                  <input
                    type="text"
                    value={contactDraft.corporateAddress}
                    onChange={(e) => setContactDraft({ ...contactDraft, corporateAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#abb8ad] mb-1">Operating Hubs Summary</label>
                  <input
                    type="text"
                    value={contactDraft.operatingHubsSummary}
                    onChange={(e) => setContactDraft({ ...contactDraft, operatingHubsSummary: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 10: FOOTER & LEGAL */}
          {activeTab === 'footer' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#faf9f5]">Footer Content & Disclaimers</h2>
                  <p className="text-xs text-[#95a898]">Legal notices, production policy statement, and agro-ecological band.</p>
                </div>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveSection('footer', footerDraft)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e5a952] hover:bg-[#d4973f] text-[#142217] text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#162419] border border-[#2a3d2e] space-y-4">
                <div>
                  <label className="block text-xs text-[#abb8ad] mb-1">Production Notice Headline</label>
                  <input
                    type="text"
                    value={footerDraft.operationalNoticeTitle}
                    onChange={(e) => setFooterDraft({ ...footerDraft, operationalNoticeTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#abb8ad] mb-1">Production Notice Text</label>
                  <textarea
                    rows={3}
                    value={footerDraft.operationalNoticeText}
                    onChange={(e) => setFooterDraft({ ...footerDraft, operationalNoticeText: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#abb8ad] mb-1">Agro-Ecological Band Text</label>
                  <input
                    type="text"
                    value={footerDraft.agroEcologicalBand}
                    onChange={(e) => setFooterDraft({ ...footerDraft, agroEcologicalBand: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#abb8ad] mb-1">Copyright Statement</label>
                  <input
                    type="text"
                    value={footerDraft.copyrightNotice}
                    onChange={(e) => setFooterDraft({ ...footerDraft, copyrightNotice: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 11: MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#faf9f5]">Media Library & Photography Slots</h2>
                <p className="text-xs text-[#95a898]">
                  Assign real client photos into reserved architectural frames without breaking responsive layout.
                </p>
              </div>

              {/* Slot Selector and Config */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#abb8ad]">
                    Reserved Media Slots ({Object.keys(data.mediaSlots).length})
                  </span>
                  {Object.values(data.mediaSlots).map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setSelectedSlotId(slot.id);
                        setMediaUrlInput(slot.url || '');
                        setMediaAltInput(slot.altText || '');
                        setMediaCaptionInput(slot.caption || '');
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedSlotId === slot.id
                          ? 'bg-[#1e3323] border-[#e5a952] text-[#faf9f5]'
                          : 'bg-[#162419] border-[#2a3d2e] text-[#95a898] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold truncate">{slot.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-[#e5a952]">
                          {slot.aspectRatio}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-[#768b7a]">
                        <span>{slot.category}</span>
                        <span>{slot.url ? 'Photo Assigned' : 'Architectural Frame'}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Slot Editor Form */}
                <div className="lg:col-span-7 space-y-4 bg-[#162419] border border-[#2a3d2e] p-5 rounded-2xl">
                  {selectedSlotId && data.mediaSlots[selectedSlotId] ? (
                    <form onSubmit={handleSaveMedia} className="space-y-4">
                      <div>
                        <span className="text-xs font-serif font-bold text-[#faf9f5] block">
                          Configure: {data.mediaSlots[selectedSlotId].label}
                        </span>
                        <span className="text-[11px] text-[#abb8ad]">
                          Slot ID: <code className="text-[#e5a952]">{selectedSlotId}</code>
                        </span>
                      </div>

                      {/* Live Image Preview */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#111c13] border border-white/10 flex items-center justify-center">
                        {mediaUrlInput ? (
                          <img
                            src={mediaUrlInput}
                            alt="Live preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-center p-4 space-y-1">
                            <ImageIcon className="w-8 h-8 text-[#5c7060] mx-auto" />
                            <span className="text-xs text-[#abb8ad] block">No Photo Assigned</span>
                            <span className="text-[10px] text-[#718573] block">
                              Rendering architectural placeholder on public site
                            </span>
                          </div>
                        )}
                      </div>

                      {/* File Upload Trigger */}
                      <div>
                        <label className="block text-xs text-[#abb8ad] mb-1">
                          Upload Photo Directly (PNG / JPEG / WebP up to 5MB)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="w-full text-xs text-[#abb8ad] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1e3323] file:text-[#faf9f5] hover:file:bg-[#28442e]"
                        />
                      </div>

                      {/* URL input */}
                      <div>
                        <label className="block text-xs text-[#abb8ad] mb-1">Or Provide HTTPS Image URL</label>
                        <input
                          type="url"
                          value={mediaUrlInput}
                          onChange={(e) => setMediaUrlInput(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                        />
                      </div>

                      {/* Alt text input (SEO & Accessibility) */}
                      <div>
                        <label className="block text-xs text-[#abb8ad] mb-1">
                          Descriptive Alt Text (Critical for SEO & Accessibility)
                        </label>
                        <input
                          type="text"
                          value={mediaAltInput}
                          onChange={(e) => setMediaAltInput(e.target.value)}
                          placeholder="e.g. Commercial center-pivot irrigation at Norton hub"
                          className="w-full px-3 py-2 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                        />
                      </div>

                      {/* Caption */}
                      <div>
                        <label className="block text-xs text-[#abb8ad] mb-1">Photo Caption</label>
                        <input
                          type="text"
                          value={mediaCaptionInput}
                          onChange={(e) => setMediaCaptionInput(e.target.value)}
                          placeholder="e.g. Sustainable cereal cropping in Mashonaland West"
                          className="w-full px-3 py-2 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMediaUrlInput('');
                            setMediaAltInput('');
                            setMediaCaptionInput('');
                          }}
                          className="px-3 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs rounded-lg border border-red-800/40 transition-colors cursor-pointer"
                        >
                          Clear & Revert to Frame
                        </button>

                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-4 py-2 bg-[#e5a952] hover:bg-[#d4973f] text-[#142217] text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                        >
                          {isSaving ? 'Publishing...' : 'Save Media Slot'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="py-12 text-center text-xs text-[#718573]">
                      Select a media slot on the left to configure image.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 12: SEO & METADATA */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#faf9f5]">SEO & Search Engine Preview</h2>
                  <p className="text-xs text-[#95a898]">
                    Search engine titles, meta descriptions, canonical URLs, and Open Graph tags.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveSection('seo', seoDraft)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e5a952] hover:bg-[#d4973f] text-[#142217] text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
                </button>
              </div>

              {/* Google Search Result Preview Card */}
              <div className="p-5 rounded-2xl bg-[#162419] border border-[#2a3d2e] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#e5a952]">
                  Live Google Search Result Snippet
                </span>
                <div className="p-4 rounded-xl bg-[#202124] border border-[#3c4043] font-sans text-left space-y-1">
                  <div className="text-[12px] text-[#bdc1c6] truncate">
                    {seoDraft.canonicalUrl || 'https://dzinoponafarms.co.zw'}
                  </div>
                  <div className="text-base text-[#8ab4f8] font-medium hover:underline truncate">
                    {seoDraft.metaTitle}
                  </div>
                  <div className="text-xs text-[#bdc1c6] leading-relaxed line-clamp-2">
                    {seoDraft.metaDescription}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#162419] border border-[#2a3d2e] space-y-4">
                <div>
                  <label className="block text-xs text-[#abb8ad] mb-1">Page Title Tag (&lt;title&gt;)</label>
                  <input
                    type="text"
                    value={seoDraft.metaTitle}
                    onChange={(e) => setSeoDraft({ ...seoDraft, metaTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#abb8ad] mb-1">Meta Description</label>
                  <textarea
                    rows={3}
                    value={seoDraft.metaDescription}
                    onChange={(e) => setSeoDraft({ ...seoDraft, metaDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#abb8ad] mb-1">Canonical URL</label>
                  <input
                    type="url"
                    value={seoDraft.canonicalUrl}
                    onChange={(e) => setSeoDraft({ ...seoDraft, canonicalUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#abb8ad] mb-1">Target Search Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={seoDraft.keywords.join(', ')}
                    onChange={(e) =>
                      setSeoDraft({
                        ...seoDraft,
                        keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 bg-[#111c13] border border-white/15 rounded text-xs text-[#faf9f5]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 13: ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#faf9f5]">
                  Commercial Inquiries ({submissions.length})
                </h2>
                <p className="text-xs text-[#95a898]">
                  Messages submitted by commercial processors, prospective partners, and buyers via website contact forms.
                </p>
              </div>

              {submissions.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#162419] border border-[#2a3d2e] text-center text-xs text-[#718573]">
                  No inquiries received yet. Visitor submissions from public forms will be archived here.
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="p-4 rounded-xl bg-[#162419] border border-[#2a3d2e] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#faf9f5]">{sub.name}</span>
                          {sub.organization && (
                            <span className="text-[#869b89]">({sub.organization})</span>
                          )}
                          <span className="px-2 py-0.5 rounded bg-[#1e3323] text-[#e5a952] text-[10px] uppercase font-bold">
                            {sub.enquiryType}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#718573]">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-[11.5px] text-[#abb8ad]">
                        <span>Email: <a href={`mailto:${sub.email}`} className="text-[#e5a952] underline">{sub.email}</a></span>
                        {sub.phone && <span className="ml-4">Phone: {sub.phone}</span>}
                      </div>

                      <p className="p-2.5 rounded-lg bg-[#111c13] border border-white/5 text-[#faf9f5] leading-relaxed">
                        {sub.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 14: BACKUP & SYSTEM RECOVERY */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#faf9f5]">Database Backup & Disaster Recovery</h2>
                <p className="text-xs text-[#95a898]">
                  Export full database JSON, import offline backups, or restore to verified client master data.
                </p>
              </div>

              {/* Reset to Default baseline */}
              <div className="p-5 rounded-2xl bg-[#162419] border border-[#2a3d2e] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#e5a952]">
                  Restore Verified Baseline Data
                </h3>
                <p className="text-xs text-[#abb8ad]">
                  Reverts all website content, locations, operations, and settings to the verified master data provided in the Dzinopona Farms institutional document.
                </p>
                <button
                  type="button"
                  onClick={handleResetToBaseline}
                  disabled={isSaving}
                  className="px-4 py-2 bg-red-950/60 hover:bg-red-900 text-red-200 text-xs font-semibold rounded-lg border border-red-800 transition-colors cursor-pointer"
                >
                  Restore Verified Master Baseline
                </button>
              </div>

              {/* Export JSON */}
              <div className="p-5 rounded-2xl bg-[#162419] border border-[#2a3d2e] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#e5a952]">
                  Export Master Database JSON
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    const json = JSON.stringify(data, null, 2);
                    setBackupJson(json);
                    // Trigger download
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `dzinopona_farms_backup_${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast('Database JSON backup downloaded!');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1e3323] hover:bg-[#28442e] text-[#faf9f5] text-xs font-semibold rounded-lg border border-[#3b5940] transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full Database JSON</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION: STAFF & EDITORS */}
          {activeTab === 'editors' && <StaffEditorManager />}

          {/* SECTION: AUDIT LOGS */}
          {activeTab === 'audit' && <AuditLogViewer />}
        </main>
      </div>
    </div>
  );
};
