import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  TrendingUp,
  Briefcase,
  MapPin,
  Image as ImageIcon,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ExternalLink,
  Save,
  Plus,
  Trash2,
  Edit2,
  Upload,
  UserCheck,
  ShieldAlert,
  Film,
  Sparkles,
  Info,
  Search,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { DzinoponaLogo } from '../components/DzinoponaLogo';
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

export const EditorDashboardView: React.FC = () => {
  const {
    data,
    authStatus,
    logout,
    navigateTo,
    saveSectionToServer,
    assignMediaSlotOnServer,
    uploadMediaFile,
    fetchEditorOverview,
  } = useCms();

  const user = authStatus.user;
  const permissions = user?.permissions || {
    manageProducts: true,
    manageServices: true,
    manageProjects: true,
    manageOperations: true,
    manageLocations: true,
    manageMedia: true,
    editContent: true,
  };

  // Determine available tabs based on permissions
  type EditorTab = 'overview' | 'products' | 'projects' | 'operations' | 'services' | 'locations' | 'media' | 'content' | 'activity';
  const [activeTab, setActiveTab] = useState<EditorTab>('overview');

  // Draft states
  const [productsDraft, setProductsDraft] = useState<ProductItem[]>(data.products);
  const [projectsDraft, setProjectsDraft] = useState<ProjectItem[]>(data.projects);
  const [operationsDraft, setOperationsDraft] = useState<OperationItem[]>(data.operations);
  const [servicesDraft, setServicesDraft] = useState<ServiceItem[]>(data.services);
  const [locationsDraft, setLocationsDraft] = useState<FarmLocation[]>(data.locations);
  const [homepageDraft, setHomepageDraft] = useState(data.settings.homepage);
  const [aboutDraft, setAboutDraft] = useState(data.settings.about);

  // Overview info from server
  const [overviewData, setOverviewData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Item editing states
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingOperationId, setEditingOperationId] = useState<string | null>(null);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);

  // Media Library state
  const [selectedSlotId, setSelectedSlotId] = useState<string>(Object.keys(data.mediaSlots)[0] || '');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaAltInput, setMediaAltInput] = useState('');
  const [mediaCaptionInput, setMediaCaptionInput] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Sync draft states when data updates
  useEffect(() => {
    setProductsDraft(data.products);
    setProjectsDraft(data.projects);
    setOperationsDraft(data.operations);
    setServicesDraft(data.services);
    setLocationsDraft(data.locations);
    if (data.settings.homepage) setHomepageDraft(data.settings.homepage);
    if (data.settings.about) setAboutDraft(data.settings.about);
  }, [data]);

  // Load editor overview
  useEffect(() => {
    fetchEditorOverview().then((res) => {
      if (res.success && res.overview) {
        setOverviewData(res.overview);
      }
    });
  }, [fetchEditorOverview]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const showError = (err: string) => {
    setErrorMessage(err);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // Section Saver
  const handleSaveSection = async (section: string, payload: any, label: string) => {
    setIsSaving(true);
    try {
      const res = await saveSectionToServer(section, payload);
      if (res.success) {
        showToast(`${label} published and recorded in audit trail.`);
        // Refresh overview
        fetchEditorOverview().then((ov) => {
          if (ov.success && ov.overview) setOverviewData(ov.overview);
        });
      } else {
        showError(res.error || `Failed to save ${label}.`);
      }
    } catch (err: any) {
      showError(err.message || 'Network error saving content.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle local file upload
  const handleMediaFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, onComplete: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    try {
      const res = await uploadMediaFile(file, {
        altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      });
      if (res.success && res.url) {
        onComplete(res.url);
        showToast(`Uploaded ${file.name} successfully.`);
      } else {
        showError(res.error || 'Failed to upload media file.');
      }
    } catch (err: any) {
      showError(err.message || 'Media upload failed.');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1711] text-[#e8ebe7] flex flex-col selection:bg-[#ede8d8] selection:text-[#18261b]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#23422a] border border-[#3b6644] text-[#faf9f5] px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 text-sm font-medium animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#78d88e]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#421d1d] border border-[#783333] text-[#faf9f5] px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="w-4 h-4 text-[#ff8f8f]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="bg-[#142116] border-b border-[#243b28] px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <DzinoponaLogo size="sm" variant="emblem" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-base sm:text-lg text-white leading-tight">
                Dzinopona Farms Editor Workspace
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#9a6f2b]/30 text-[#e5a952] border border-[#9a6f2b]/40">
                Authorized Editor
              </span>
            </div>
            <p className="text-xs text-[#98ab9b]">
              Authorized employee operating under Administrator authority
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs bg-[#1a2c1d] border border-[#2d4933] px-3 py-1.5 rounded-lg text-[#cad6cc]">
            <UserCheck className="w-3.5 h-3.5 text-[#58c072]" />
            <span>{user?.fullName || 'Staff Editor'}</span>
            <span className="text-[#68826c]">({user?.username})</span>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#cad6cc] hover:text-white bg-[#1a2c1d] hover:bg-[#233b27] border border-[#2d4933] rounded-lg transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#d39c4a]" />
            <span className="hidden sm:inline">View</span>
            <span>Public Site</span>
          </button>

          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-300 hover:text-red-100 bg-[#331818] hover:bg-[#4d2424] border border-red-900/50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Sub-Header: Subordinate Relationship & Role Disclaimer */}
      <div className="bg-[#121c13] border-b border-[#1f3323] px-4 sm:px-6 py-2 text-xs text-[#9bb09e] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[#d39c4a] shrink-0" />
          <span>
            <strong>Employee Role:</strong> You have authorized editing access to assigned CMS modules. Full system administration, staff credentials, and database resets are reserved for the Administrator.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#7d9480]">
          <Clock className="w-3 h-3 text-[#d39c4a]" />
          <span>Every edit made is recorded in the administrative audit log.</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-[#121d14] border-b md:border-b-0 md:border-r border-[#203624] p-3 sm:p-4 shrink-0 space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#78917c] px-3 py-1 font-semibold">
            Workspace Modules
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
              activeTab === 'overview'
                ? 'bg-[#233d28] text-white font-semibold shadow-xs'
                : 'text-[#a2b8a6] hover:bg-[#1a2c1d] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-[#d39c4a]" />
              <span>Editor Overview</span>
            </div>
          </button>

          {permissions.manageProducts && (
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                activeTab === 'products'
                  ? 'bg-[#233d28] text-white font-semibold shadow-xs'
                  : 'text-[#a2b8a6] hover:bg-[#1a2c1d] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-[#d39c4a]" />
                <span>Products Catalogue</span>
              </div>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded font-mono text-[#cad6cc]">
                {productsDraft.length}
              </span>
            </button>
          )}

          {permissions.manageProjects && (
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                activeTab === 'projects'
                  ? 'bg-[#233d28] text-white font-semibold shadow-xs'
                  : 'text-[#a2b8a6] hover:bg-[#1a2c1d] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-[#d39c4a]" />
                <span>Strategic Projects</span>
              </div>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded font-mono text-[#cad6cc]">
                {projectsDraft.length}
              </span>
            </button>
          )}

          {permissions.manageOperations && (
            <button
              type="button"
              onClick={() => setActiveTab('operations')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                activeTab === 'operations'
                  ? 'bg-[#233d28] text-white font-semibold shadow-xs'
                  : 'text-[#a2b8a6] hover:bg-[#1a2c1d] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-[#d39c4a]" />
                <span>Farm Operations</span>
              </div>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded font-mono text-[#cad6cc]">
                {operationsDraft.length}
              </span>
            </button>
          )}

          {permissions.manageServices && (
            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                activeTab === 'services'
                  ? 'bg-[#233d28] text-white font-semibold shadow-xs'
                  : 'text-[#a2b8a6] hover:bg-[#1a2c1d] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-[#d39c4a]" />
                <span>Agribusiness Services</span>
              </div>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded font-mono text-[#cad6cc]">
                {servicesDraft.length}
              </span>
            </button>
          )}

          {permissions.manageLocations && (
            <button
              type="button"
              onClick={() => setActiveTab('locations')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                activeTab === 'locations'
                  ? 'bg-[#233d28] text-white font-semibold shadow-xs'
                  : 'text-[#a2b8a6] hover:bg-[#1a2c1d] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#d39c4a]" />
                <span>Farming Locations</span>
              </div>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded font-mono text-[#cad6cc]">
                {locationsDraft.length}
              </span>
            </button>
          )}

          {permissions.manageMedia && (
            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                activeTab === 'media'
                  ? 'bg-[#233d28] text-white font-semibold shadow-xs'
                  : 'text-[#a2b8a6] hover:bg-[#1a2c1d] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4 text-[#d39c4a]" />
                <span>Media & Uploads</span>
              </div>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded font-mono text-[#cad6cc]">
                {Object.keys(data.mediaSlots).length}
              </span>
            </button>
          )}

          {permissions.editContent && (
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                activeTab === 'content'
                  ? 'bg-[#233d28] text-white font-semibold shadow-xs'
                  : 'text-[#a2b8a6] hover:bg-[#1a2c1d] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#d39c4a]" />
                <span>General Content</span>
              </div>
            </button>
          )}

          <div className="pt-3 border-t border-[#203624]">
            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                activeTab === 'activity'
                  ? 'bg-[#233d28] text-white font-semibold shadow-xs'
                  : 'text-[#a2b8a6] hover:bg-[#1a2c1d] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#d39c4a]" />
                <span>My Edit History</span>
              </div>
            </button>
          </div>
        </aside>

        {/* Workspace Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-6xl">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-white">
                  Welcome, {user?.fullName || 'Editor'}
                </h2>
                <p className="text-xs text-[#9bb09e] mt-1">
                  You are authorized as a subordinate Editor on the Dzinopona Farms digital publishing system.
                </p>
              </div>

              {/* Permission Summary Grid */}
              <div className="bg-[#142217] border border-[#253e2a] rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#d39c4a]">
                  Active Editor Permissions & Scope
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Manage Products', allowed: permissions.manageProducts },
                    { label: 'Manage Projects', allowed: permissions.manageProjects },
                    { label: 'Manage Operations', allowed: permissions.manageOperations },
                    { label: 'Manage Services', allowed: permissions.manageServices },
                    { label: 'Manage Hubs', allowed: permissions.manageLocations },
                    { label: 'Manage Media', allowed: permissions.manageMedia },
                    { label: 'Edit Content', allowed: permissions.editContent },
                  ].map((perm, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                        perm.allowed
                          ? 'bg-[#1b2f20] border-[#315739] text-[#71cf88]'
                          : 'bg-[#211818] border-[#4a2e2e] text-[#b37777] opacity-60'
                      }`}
                    >
                      {perm.allowed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span className="truncate">{perm.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#142217] border border-[#253e2a] rounded-xl p-4">
                  <div className="text-xs text-[#8ea391] uppercase tracking-wider">Catalogue Items</div>
                  <div className="text-2xl font-bold font-serif text-white mt-1">{productsDraft.length} Products</div>
                  <div className="text-[11px] text-[#58c072] mt-1">Managed under Zimbabwe agro-standards</div>
                </div>

                <div className="bg-[#142217] border border-[#253e2a] rounded-xl p-4">
                  <div className="text-xs text-[#8ea391] uppercase tracking-wider">Strategic Pipeline</div>
                  <div className="text-2xl font-bold font-serif text-white mt-1">{projectsDraft.length} Projects</div>
                  <div className="text-[11px] text-[#d39c4a] mt-1">With video & milestone tracking</div>
                </div>

                <div className="bg-[#142217] border border-[#253e2a] rounded-xl p-4">
                  <div className="text-xs text-[#8ea391] uppercase tracking-wider">Media Assets</div>
                  <div className="text-2xl font-bold font-serif text-white mt-1">
                    {Object.values(data.mediaSlots).filter((s) => Boolean(s.url)).length} / {Object.keys(data.mediaSlots).length}
                  </div>
                  <div className="text-[11px] text-[#7da084] mt-1">Active custom photo/video slots</div>
                </div>
              </div>

              {/* Recent Activity Log for this Editor */}
              <div className="bg-[#142217] border border-[#253e2a] rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#d39c4a]">
                  Recent Editorial Activity (Your Recorded Logs)
                </h3>
                {overviewData?.recentLogs && overviewData.recentLogs.length > 0 ? (
                  <div className="divide-y divide-white/10 text-xs">
                    {overviewData.recentLogs.slice(0, 5).map((log: any, idx: number) => (
                      <div key={idx} className="py-2.5 flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium text-white">{log.summary}</div>
                          <div className="text-[11px] text-[#7d9480] mt-0.5 font-mono">
                            Section: {log.section} • Action: {log.action}
                          </div>
                        </div>
                        <div className="text-[11px] text-[#869988] shrink-0">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#7e9481] italic">
                    No recent edits recorded yet. When you modify products, operations, or media, they will be logged here.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB: PRODUCTS */}
          {activeTab === 'products' && permissions.manageProducts && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">Agricultural Products Catalogue</h2>
                  <p className="text-xs text-[#9bb09e] mt-0.5">
                    Maintain verified inventory statuses, specifications, seasonal cycles, and product photography.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `product_${Date.now()}`;
                      const item: ProductItem = {
                        id: newId,
                        name: 'New Agricultural Product',
                        category: 'crops',
                        subCategory: 'Cereal Grains',
                        description: 'High-grade commercial crop grown according to Zimbabwean agricultural practices.',
                        status: 'in_production',
                        isAvailableNow: true,
                        availabilityNote: 'Allocated in bulk batches according to harvest cycles.',
                        imageSlotId: 'slot_product_cereal',
                        order: productsDraft.length + 1,
                      };
                      setProductsDraft([...productsDraft, item]);
                      setEditingProductId(newId);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25422a] hover:bg-[#2e5234] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Product</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveSection('products', productsDraft, 'Products catalogue')}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#b57a2c] hover:bg-[#c68936] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Publishing...' : 'Save & Publish'}</span>
                  </button>
                </div>
              </div>

              {/* Product List */}
              <div className="space-y-3">
                {productsDraft.map((product) => {
                  const isEditing = editingProductId === product.id;
                  return (
                    <div
                      key={product.id}
                      className="bg-[#142217] border border-[#253e2a] rounded-xl p-4 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {product.primaryImageUrl ? (
                            <img
                              src={product.primaryImageUrl}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-lg object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-[#1a2d1e] border border-[#2b4b32] flex items-center justify-center text-[#d39c4a]">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-white text-sm">{product.name}</h4>
                            <div className="flex items-center gap-2 mt-1 text-xs">
                              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-mono font-semibold bg-[#2a452f] text-[#86e099]">
                                {product.category}
                              </span>
                              <span className="text-[#8ba08e]">
                                Status: <strong className="text-[#faf9f5]">{product.status.replace('_', ' ')}</strong>
                              </span>
                              <span className="text-[#647967]">•</span>
                              <span className="text-[#8ba08e]">{product.availabilityNote}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingProductId(isEditing ? null : product.id)}
                            className="p-1.5 rounded-lg bg-[#1b2e1f] hover:bg-[#25422a] text-[#cad6cc] hover:text-white border border-[#2e4d34] text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>{isEditing ? 'Close' : 'Edit'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove ${product.name}?`)) {
                                setProductsDraft(productsDraft.filter((p) => p.id !== product.id));
                              }
                            }}
                            className="p-1.5 rounded-lg bg-[#331818] hover:bg-[#4a2424] text-red-300 hover:text-red-100 border border-red-900/40 text-xs cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Edit Form */}
                      {isEditing && (
                        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block text-[#9bb09e] mb-1 font-medium">Product Name</label>
                            <input
                              type="text"
                              value={product.name}
                              onChange={(e) =>
                                setProductsDraft(
                                  productsDraft.map((p) => (p.id === product.id ? { ...p, name: e.target.value } : p))
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                            />
                          </div>

                          <div>
                            <label className="block text-[#9bb09e] mb-1 font-medium">Production Status</label>
                            <select
                              value={product.status}
                              onChange={(e) =>
                                setProductsDraft(
                                  productsDraft.map((p) =>
                                    p.id === product.id ? { ...p, status: e.target.value as ProductStatus } : p
                                  )
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                            >
                              <option value="in_production">In Production</option>
                              <option value="seasonal">Seasonal Harvest</option>
                              <option value="developing">Developing / Expansion</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[#9bb09e] mb-1 font-medium">Sub-Category</label>
                            <input
                              type="text"
                              value={product.subCategory}
                              onChange={(e) =>
                                setProductsDraft(
                                  productsDraft.map((p) =>
                                    p.id === product.id ? { ...p, subCategory: e.target.value } : p
                                  )
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                            />
                          </div>

                          <div>
                            <label className="block text-[#9bb09e] mb-1 font-medium">Seasonal Availability Note</label>
                            <input
                              type="text"
                              value={product.availabilityNote}
                              onChange={(e) =>
                                setProductsDraft(
                                  productsDraft.map((p) =>
                                    p.id === product.id ? { ...p, availabilityNote: e.target.value } : p
                                  )
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[#9bb09e] mb-1 font-medium">Description</label>
                            <textarea
                              rows={2}
                              value={product.description}
                              onChange={(e) =>
                                setProductsDraft(
                                  productsDraft.map((p) =>
                                    p.id === product.id ? { ...p, description: e.target.value } : p
                                  )
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                            />
                          </div>

                          <div className="sm:col-span-2 space-y-2">
                            <label className="block text-[#9bb09e] font-medium">Product Photography (Primary Image)</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="text"
                                placeholder="Image URL or upload local file below"
                                value={product.primaryImageUrl || ''}
                                onChange={(e) =>
                                  setProductsDraft(
                                    productsDraft.map((p) =>
                                      p.id === product.id ? { ...p, primaryImageUrl: e.target.value } : p
                                    )
                                  )
                                }
                                className="flex-1 px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                              />
                              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-[#25422a] hover:bg-[#2e5234] text-white rounded-lg text-xs font-semibold shrink-0">
                                <Upload className="w-3.5 h-3.5 text-[#d39c4a]" />
                                <span>Upload Image</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleMediaFileUpload(e, (url) => {
                                      setProductsDraft(
                                        productsDraft.map((p) =>
                                          p.id === product.id ? { ...p, primaryImageUrl: url } : p
                                        )
                                      );
                                    })
                                  }
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: PROJECTS (With Video Support) */}
          {activeTab === 'projects' && permissions.manageProjects && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">Strategic Development Pipeline</h2>
                  <p className="text-xs text-[#9bb09e] mt-0.5">
                    Manage development projects, milestone progress bars, and video documentation.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveSection('projects', projectsDraft, 'Strategic development projects')}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#b57a2c] hover:bg-[#c68936] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Publishing...' : 'Save & Publish'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {projectsDraft.map((project) => {
                  const isEditing = editingProjectId === project.id;
                  return (
                    <div
                      key={project.id}
                      className="bg-[#142217] border border-[#253e2a] rounded-xl p-4 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-white text-sm">{project.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className="text-[#d39c4a] font-mono font-semibold">
                              Progress: {project.progressPercentage}%
                            </span>
                            <span className="text-[#647967]">•</span>
                            <span className="text-[#8ba08e]">{project.timeline}</span>
                            {project.video?.url && (
                              <>
                                <span className="text-[#647967]">•</span>
                                <span className="inline-flex items-center gap-1 text-[10px] text-[#78d88e] bg-[#1a3821] px-1.5 py-0.2 rounded font-medium">
                                  <Film className="w-3 h-3" /> Video Attached
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditingProjectId(isEditing ? null : project.id)}
                          className="p-1.5 rounded-lg bg-[#1b2e1f] hover:bg-[#25422a] text-[#cad6cc] hover:text-white border border-[#2e4d34] text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>{isEditing ? 'Close' : 'Edit Project'}</span>
                        </button>
                      </div>

                      {isEditing && (
                        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block text-[#9bb09e] mb-1 font-medium">Title</label>
                            <input
                              type="text"
                              value={project.title}
                              onChange={(e) =>
                                setProjectsDraft(
                                  projectsDraft.map((pr) => (pr.id === project.id ? { ...pr, title: e.target.value } : pr))
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                            />
                          </div>

                          <div>
                            <label className="block text-[#9bb09e] mb-1 font-medium">Progress Percentage (0-100)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={project.progressPercentage}
                              onChange={(e) =>
                                setProjectsDraft(
                                  projectsDraft.map((pr) =>
                                    pr.id === project.id
                                      ? { ...pr, progressPercentage: parseInt(e.target.value, 10) || 0 }
                                      : pr
                                  )
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[#9bb09e] mb-1 font-medium">Summary Description</label>
                            <textarea
                              rows={2}
                              value={project.summary}
                              onChange={(e) =>
                                setProjectsDraft(
                                  projectsDraft.map((pr) =>
                                    pr.id === project.id ? { ...pr, summary: e.target.value } : pr
                                  )
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                            />
                          </div>

                          {/* Video Documentation Section */}
                          <div className="sm:col-span-2 p-3 rounded-lg bg-[#0c160f] border border-[#223d26] space-y-2">
                            <div className="flex items-center gap-2 text-white font-medium">
                              <Film className="w-4 h-4 text-[#d39c4a]" />
                              <span>Project Video Documentation</span>
                            </div>
                            <p className="text-[11px] text-[#8ea391]">
                              Provide an MP4 video URL or upload an operational video documenting farm progress.
                            </p>
                            <div className="flex items-center gap-3">
                              <input
                                type="text"
                                placeholder="https://.../video.mp4"
                                value={project.video?.url || ''}
                                onChange={(e) => {
                                  const url = e.target.value;
                                  setProjectsDraft(
                                    projectsDraft.map((pr) =>
                                      pr.id === project.id
                                        ? {
                                            ...pr,
                                            video: {
                                              url,
                                              type: 'video/mp4',
                                              title: pr.video?.title || pr.title,
                                            },
                                          }
                                        : pr
                                    )
                                  );
                                }}
                                className="flex-1 px-3 py-2 rounded-lg bg-[#080f0a] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                              />
                              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-[#25422a] hover:bg-[#2e5234] text-white rounded-lg text-xs font-semibold shrink-0">
                                <Upload className="w-3.5 h-3.5 text-[#d39c4a]" />
                                <span>Upload Video</span>
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) =>
                                    handleMediaFileUpload(e, (url) => {
                                      setProjectsDraft(
                                        projectsDraft.map((pr) =>
                                          pr.id === project.id
                                            ? {
                                                ...pr,
                                                video: {
                                                  url,
                                                  type: 'video/mp4',
                                                  title: pr.title,
                                                },
                                              }
                                            : pr
                                        )
                                      );
                                    })
                                  }
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: OPERATIONS */}
          {activeTab === 'operations' && permissions.manageOperations && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">Farm Operations (11 Value Pillars)</h2>
                  <p className="text-xs text-[#9bb09e] mt-0.5">
                    Update technical summaries, capacities, and agronomic management across all 11 disciplines.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveSection('operations', operationsDraft, 'Farm operations')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#b57a2c] hover:bg-[#c68936] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Publishing...' : 'Save & Publish'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {operationsDraft.map((operation) => {
                  const isEditing = editingOperationId === operation.id;
                  return (
                    <div key={operation.id} className="bg-[#142217] border border-[#253e2a] rounded-xl p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-white text-sm">{operation.title}</h4>
                          <p className="text-xs text-[#9bb09e] mt-1 line-clamp-2">{operation.summary}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingOperationId(isEditing ? null : operation.id)}
                          className="p-1.5 rounded-lg bg-[#1b2e1f] hover:bg-[#25422a] text-[#cad6cc] hover:text-white border border-[#2e4d34] text-xs flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>{isEditing ? 'Close' : 'Edit'}</span>
                        </button>
                      </div>

                      {isEditing && (
                        <div className="mt-4 pt-4 border-t border-white/10 space-y-3 text-xs">
                          <div>
                            <label className="block text-[#9bb09e] mb-1 font-medium">Operation Title</label>
                            <input
                              type="text"
                              value={operation.title}
                              onChange={(e) =>
                                setOperationsDraft(
                                  operationsDraft.map((op) =>
                                    op.id === operation.id ? { ...op, title: e.target.value } : op
                                  )
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                            />
                          </div>

                          <div>
                            <label className="block text-[#9bb09e] mb-1 font-medium">Summary</label>
                            <textarea
                              rows={2}
                              value={operation.summary}
                              onChange={(e) =>
                                setOperationsDraft(
                                  operationsDraft.map((op) =>
                                    op.id === operation.id ? { ...op, summary: e.target.value } : op
                                  )
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                            />
                          </div>

                          <div>
                            <label className="block text-[#9bb09e] mb-1 font-medium">Full Description</label>
                            <textarea
                              rows={4}
                              value={operation.fullDescription}
                              onChange={(e) =>
                                setOperationsDraft(
                                  operationsDraft.map((op) =>
                                    op.id === operation.id ? { ...op, fullDescription: e.target.value } : op
                                  )
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: SERVICES */}
          {activeTab === 'services' && permissions.manageServices && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">Agribusiness Services</h2>
                  <p className="text-xs text-[#9bb09e] mt-0.5">
                    Maintain commercial contracting terms, outgrower support schemes, and advisory services.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveSection('services', servicesDraft, 'Agribusiness services')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#b57a2c] hover:bg-[#c68936] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Publishing...' : 'Save & Publish'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {servicesDraft.map((service) => (
                  <div key={service.id} className="bg-[#142217] border border-[#253e2a] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-semibold text-white text-sm">{service.title}</h4>
                      <span className="text-[11px] text-[#d39c4a] font-mono">{service.targetClients}</span>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#9bb09e] mb-1 font-medium">Service Description</label>
                      <textarea
                        rows={2}
                        value={service.description}
                        onChange={(e) =>
                          setServicesDraft(
                            servicesDraft.map((s) => (s.id === service.id ? { ...s, description: e.target.value } : s))
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white text-xs focus:outline-hidden focus:border-[#d39c4a]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: LOCATIONS */}
          {activeTab === 'locations' && permissions.manageLocations && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">Strategic Farming Hubs</h2>
                  <p className="text-xs text-[#9bb09e] mt-0.5">
                    Maintain acreage, regional focus, and key activities across Norton, Mvuma, Esigodini, and Ntabazinduna.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveSection('locations', locationsDraft, 'Farming hubs')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#b57a2c] hover:bg-[#c68936] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Publishing...' : 'Save & Publish'}</span>
                </button>
              </div>

              <div className="space-y-4">
                {locationsDraft.map((location) => (
                  <div key={location.id} className="bg-[#142217] border border-[#253e2a] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#d39c4a]" />
                        <span>{location.name}</span>
                      </h4>
                      <span className="text-xs font-mono text-[#86e099] bg-[#1a3821] px-2 py-0.5 rounded">
                        {location.acreage}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[#9bb09e] mb-1 font-medium">Agro-Ecological Region</label>
                        <input
                          type="text"
                          value={location.agroRegion}
                          onChange={(e) =>
                            setLocationsDraft(
                              locationsDraft.map((l) =>
                                l.id === location.id ? { ...l, agroRegion: e.target.value } : l
                              )
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                        />
                      </div>

                      <div>
                        <label className="block text-[#9bb09e] mb-1 font-medium">Soil & Climate Characteristics</label>
                        <input
                          type="text"
                          value={location.soilAndClimate}
                          onChange={(e) =>
                            setLocationsDraft(
                              locationsDraft.map((l) =>
                                l.id === location.id ? { ...l, soilAndClimate: e.target.value } : l
                              )
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[#9bb09e] mb-1 font-medium">Core Production Focus</label>
                        <textarea
                          rows={2}
                          value={location.focus}
                          onChange={(e) =>
                            setLocationsDraft(
                              locationsDraft.map((l) =>
                                l.id === location.id ? { ...l, focus: e.target.value } : l
                              )
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MEDIA & UPLOADS */}
          {activeTab === 'media' && permissions.manageMedia && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">Media Assets & Slot Configurator</h2>
                  <p className="text-xs text-[#9bb09e] mt-0.5">
                    Assign photographs or video reels across all architectural slots, or upload files directly.
                  </p>
                </div>
              </div>

              {/* Slot Selector and Configurator */}
              <div className="bg-[#142217] border border-[#253e2a] rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#9bb09e] mb-1 font-medium">Select Slot</label>
                    <select
                      value={selectedSlotId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedSlotId(id);
                        const slot = data.mediaSlots[id];
                        setMediaUrlInput(slot?.url || '');
                        setMediaAltInput(slot?.altText || '');
                        setMediaCaptionInput(slot?.caption || '');
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white text-xs focus:outline-hidden focus:border-[#d39c4a]"
                    >
                      {Object.entries(data.mediaSlots).map(([id, slot]) => (
                        <option key={id} value={id}>
                          {slot.label} ({id}) {slot.url ? '✓ Active' : '— Placeholder'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-[#9bb09e] mb-1 font-medium">Upload Local Media File</label>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#25422a] hover:bg-[#2e5234] text-white rounded-lg text-xs font-semibold w-full justify-center transition-colors">
                      <Upload className="w-4 h-4 text-[#d39c4a]" />
                      <span>{isUploadingMedia ? 'Uploading to Server...' : 'Choose Image or Video File'}</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        disabled={isUploadingMedia}
                        onChange={(e) =>
                          handleMediaFileUpload(e, (url) => {
                            setMediaUrlInput(url);
                          })
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs text-[#9bb09e] mb-1 font-medium">Media URL</label>
                    <input
                      type="text"
                      placeholder="https://... or /uploads/..."
                      value={mediaUrlInput}
                      onChange={(e) => setMediaUrlInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white text-xs focus:outline-hidden focus:border-[#d39c4a]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#9bb09e] mb-1 font-medium">Alt Text (Accessibility)</label>
                      <input
                        type="text"
                        value={mediaAltInput}
                        onChange={(e) => setMediaAltInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white text-xs focus:outline-hidden focus:border-[#d39c4a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#9bb09e] mb-1 font-medium">Caption (Optional)</label>
                      <input
                        type="text"
                        value={mediaCaptionInput}
                        onChange={(e) => setMediaCaptionInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white text-xs focus:outline-hidden focus:border-[#d39c4a]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isSaving || !selectedSlotId}
                      onClick={async () => {
                        setIsSaving(true);
                        try {
                          const res = await assignMediaSlotOnServer({
                            slotId: selectedSlotId,
                            url: mediaUrlInput.trim(),
                            altText: mediaAltInput.trim(),
                            caption: mediaCaptionInput.trim(),
                          });
                          if (res.success) {
                            showToast(`Media slot "${selectedSlotId}" updated.`);
                          } else {
                            showError(res.error || 'Failed to update slot.');
                          }
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#b57a2c] hover:bg-[#c68936] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Assigning...' : 'Assign to Selected Slot'}</span>
                    </button>

                    {mediaUrlInput && (
                      <button
                        type="button"
                        onClick={async () => {
                          setMediaUrlInput('');
                          await assignMediaSlotOnServer({
                            slotId: selectedSlotId,
                            url: '',
                            altText: '',
                          });
                          showToast(`Slot "${selectedSlotId}" cleared.`);
                        }}
                        className="px-3 py-2 rounded-lg bg-[#331818] hover:bg-[#4a2424] text-red-300 text-xs font-medium border border-red-900/40 cursor-pointer"
                      >
                        Clear Slot
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Slot Grid Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(data.mediaSlots).map(([id, slot]) => (
                  <div
                    key={id}
                    onClick={() => {
                      setSelectedSlotId(id);
                      setMediaUrlInput(slot.url || '');
                      setMediaAltInput(slot.altText || '');
                      setMediaCaptionInput(slot.caption || '');
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedSlotId === id
                        ? 'bg-[#1e3823] border-[#4e8457]'
                        : 'bg-[#142217] border-[#253e2a] hover:border-[#35573c]'
                    }`}
                  >
                    <div className="aspect-video rounded-lg overflow-hidden bg-black/40 mb-2 relative">
                      {slot.url ? (
                        slot.url.includes('.mp4') || slot.url.includes('.webm') ? (
                          <video src={slot.url} className="w-full h-full object-cover" muted />
                        ) : (
                          <img
                            src={slot.url}
                            alt={slot.altText || id}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#556d58] text-[11px]">
                          <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                          <span>Placeholder</span>
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 px-1.5 py-0.2 rounded font-mono text-white">
                        {slot.aspectRatio || '16:9'}
                      </span>
                    </div>
                    <div className="font-medium text-xs text-white truncate">{slot.label}</div>
                    <div className="text-[10px] text-[#78917c] font-mono mt-0.5 truncate">{id}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: GENERAL CONTENT */}
          {activeTab === 'content' && permissions.editContent && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">General Site Content</h2>
                  <p className="text-xs text-[#9bb09e] mt-0.5">
                    Update hero statements, corporate identity text, and operational notices.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveSection('homepage', homepageDraft, 'Homepage content')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#b57a2c] hover:bg-[#c68936] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Publishing...' : 'Save & Publish'}</span>
                </button>
              </div>

              <div className="bg-[#142217] border border-[#253e2a] rounded-xl p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-[#9bb09e] mb-1 font-medium">Hero Badge</label>
                  <input
                    type="text"
                    value={homepageDraft?.heroBadge || ''}
                    onChange={(e) => setHomepageDraft({ ...homepageDraft, heroBadge: e.target.value } as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                  />
                </div>

                <div>
                  <label className="block text-[#9bb09e] mb-1 font-medium">Hero Subheadline / Tagline</label>
                  <input
                    type="text"
                    value={homepageDraft?.heroSubheadline || ''}
                    onChange={(e) => setHomepageDraft({ ...homepageDraft, heroSubheadline: e.target.value } as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                  />
                </div>

                <div>
                  <label className="block text-[#9bb09e] mb-1 font-medium">Hero Lead Statement</label>
                  <textarea
                    rows={3}
                    value={homepageDraft?.heroIntro || ''}
                    onChange={(e) => setHomepageDraft({ ...homepageDraft, heroIntro: e.target.value } as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                  />
                </div>

                <div>
                  <label className="block text-[#9bb09e] mb-1 font-medium">Seasonal Production Policy Notice</label>
                  <textarea
                    rows={2}
                    value={homepageDraft?.productionPolicyNotice || ''}
                    onChange={(e) =>
                      setHomepageDraft({ ...homepageDraft, productionPolicyNotice: e.target.value } as any)
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: MY ACTIVITY HISTORY */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-white">My Editorial Activity Log</h2>
                <p className="text-xs text-[#9bb09e] mt-0.5">
                  Complete audit trail of changes performed under your editor account.
                </p>
              </div>

              <div className="bg-[#142217] border border-[#253e2a] rounded-xl p-5">
                {overviewData?.recentLogs && overviewData.recentLogs.length > 0 ? (
                  <div className="divide-y divide-white/10 text-xs">
                    {overviewData.recentLogs.map((log: any, idx: number) => (
                      <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="font-semibold text-white">{log.summary}</div>
                          <div className="text-[11px] text-[#7d9480] flex items-center gap-2">
                            <span className="font-mono bg-black/40 px-1.5 py-0.2 rounded text-[#d39c4a]">
                              {log.action}
                            </span>
                            <span>Section: {log.section}</span>
                            {log.details && <span className="text-[#a2b5a5] italic">• {log.details}</span>}
                          </div>
                        </div>
                        <div className="text-[11px] text-[#869988] shrink-0 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#7e9481] italic py-4 text-center">
                    No edits recorded yet. When you update content sections or media, entries will appear here.
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
