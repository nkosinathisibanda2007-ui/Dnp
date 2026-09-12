import React, { useState } from 'react';
import {
  X,
  SlidersHorizontal,
  Image as ImageIcon,
  Package,
  Layers,
  TrendingUp,
  MapPin,
  Settings,
  Mail,
  Download,
  Upload,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { DzinoponaLogo } from './DzinoponaLogo';
import { ProductItem, OperationItem, ProjectItem, FarmLocation, ProductCategory } from '../types';

export const CmsAdminModal: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    data,
    updateSettings,
    updateProduct,
    addProduct,
    deleteProduct,
    updateOperation,
    updateProject,
    updateLocation,
    assignMediaUrl,
    submissions,
    exportDatabaseJson,
    importDatabaseJson,
    resetToDefaults,
    authStatus,
    navigateTo,
    uploadMediaFile,
  } = useCms();

  const user = authStatus.user;
  const isAdmin = user?.role === 'admin';
  const isEditor = user?.role === 'editor';
  const perms = user?.permissions || ({} as any);

  const availableTabs = [
    { id: 'media', label: 'Media Slots & Photography', icon: ImageIcon, visible: isAdmin || perms.manageMedia !== false },
    { id: 'products', label: 'Commercial Products', icon: Package, visible: isAdmin || perms.manageProducts !== false },
    { id: 'operations', label: '11 Operations', icon: Layers, visible: isAdmin || perms.manageOperations !== false },
    { id: 'projects', label: 'Development Pipeline', icon: TrendingUp, visible: isAdmin || perms.manageProjects !== false },
    { id: 'locations', label: 'Farming Hubs', icon: MapPin, visible: isAdmin || perms.manageLocations !== false },
    { id: 'settings', label: 'Company & SEO', icon: Settings, visible: isAdmin },
    { id: 'enquiries', label: `Inquiries (${submissions.length})`, icon: Mail, visible: isAdmin },
    { id: 'backup', label: 'JSON Backup / Restore', icon: Download, visible: isAdmin },
  ].filter((t) => t.visible);

  const [activeTab, setActiveTab] = useState<string>('media');

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [slotUrlInput, setSlotUrlInput] = useState('');
  const [slotAltInput, setSlotAltInput] = useState('');
  const [jsonExport, setJsonExport] = useState('');
  const [jsonImport, setJsonImport] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  // New product form state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<ProductItem>>({
    name: '',
    category: 'crops',
    subCategory: 'Cereals',
    status: 'in_production',
    description: '',
    availabilityNote: 'Seasonal harvest. Contact for bulk allocation.',
  });

  if (!isAdminOpen) return null;

  if (!authStatus.isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
        <div className="bg-[#fbfbfa] border border-[#dcd6c4] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-[#18261b] text-[#e5a952] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-[#18261b]">Staff Authorization Required</h3>
            <p className="text-xs text-[#6e6756] mt-1">
              The internal CMS editor is restricted to authorized personnel. Please sign in with your Administrator or Editor credentials.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdminOpen(false)}
              className="px-4 py-2 rounded-lg bg-[#ede8d8] text-[#484233] text-xs font-semibold hover:bg-[#ded8c4] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdminOpen(false);
                navigateTo('auth');
              }}
              className="px-4 py-2 rounded-lg bg-[#1b2e20] text-white text-xs font-semibold hover:bg-[#122016] cursor-pointer"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showNotification = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleSelectSlot = (id: string) => {
    setSelectedSlotId(id);
    const slot = data.mediaSlots[id];
    setSlotUrlInput(slot?.url || '');
    setSlotAltInput(slot?.altText || '');
  };

  const handleSaveMediaSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId) return;
    assignMediaUrl(selectedSlotId, slotUrlInput.trim(), slotAltInput.trim());
    showNotification();
    setSelectedSlotId(null);
  };

  const handleExport = () => {
    const json = exportDatabaseJson();
    setJsonExport(json);
  };

  const handleImport = () => {
    if (!jsonImport.trim()) return;
    const ok = importDatabaseJson(jsonImport);
    if (ok) {
      setImportStatus('Database successfully restored from JSON!');
      showNotification();
    } else {
      setImportStatus('Invalid JSON format. Please verify the structure.');
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name?.trim()) return;

    const id = `prod-${Date.now()}`;
    addProduct({
      id,
      name: newProduct.name.trim(),
      category: newProduct.category as ProductCategory,
      subCategory: newProduct.subCategory || 'General',
      status: (newProduct.status as any) || 'in_production',
      isAvailableNow: newProduct.status === 'in_production',
      description: newProduct.description || '',
      availabilityNote: newProduct.availabilityNote || 'Seasonal production cycles apply.',
      imageSlotId: 'media-crops-grain',
      order: data.products.length + 1,
    });

    setShowAddProduct(false);
    setNewProduct({
      name: '',
      category: 'crops',
      subCategory: 'Cereals',
      status: 'in_production',
      description: '',
      availabilityNote: 'Seasonal harvest. Contact for bulk allocation.',
    });
    showNotification();
  };

  const mediaSlotEntries = Object.values(data.mediaSlots);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-5xl bg-[#fbfbfa] border border-[#dcd6c4] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2dcce] bg-[#18261b] text-white">
          <div className="flex items-center gap-3">
            <DzinoponaLogo size="xs" variant="emblem" />
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                <span>Dzinopona CMS Architecture Portal</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-amber-300">
                  v1.0 Live
                </span>
              </h2>
              <p className="text-[11px] text-[#abbdae]">
                Dynamic content, verified photography management & enterprise database engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saveToast && (
              <span className="text-xs bg-emerald-700 text-white px-2.5 py-1 rounded-md flex items-center gap-1 animate-fadeIn">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsAdminOpen(false)}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 py-2 border-b border-[#ded8c4] bg-[#f2efe4] overflow-x-auto text-xs font-semibold">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#1b2e20] text-white shadow-xs'
                    : 'text-[#585141] hover:text-[#18261b] hover:bg-[#e4ded0]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Container */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 bg-[#fdfcf9]">
          {/* TAB 1: MEDIA SLOTS */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#f4f0e4] border border-[#ded8c4] text-xs text-[#524b3c] space-y-1">
                <span className="font-bold text-[#18261b] block">Photography Management Policy</span>
                <p>
                  To protect the client's credibility, the site never displays stock imagery under false representation. Every frame is a registered <strong>Media Slot</strong>. When real high-resolution client photography from Norton, Mvuma, Esigodini, or Ntabazinduna is ready, assign the URL below. It immediately replaces the architectural placeholder across all pages.
                </p>
              </div>

              {/* Edit Selected Slot Modal/Section */}
              {selectedSlotId && (
                <form onSubmit={handleSaveMediaSlot} className="p-5 rounded-xl bg-[#ede7d5] border border-[#d6cdb7] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-[#18261b]">
                      Configure Slot: <span className="font-mono text-xs">{selectedSlotId}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setSelectedSlotId(null)}
                      className="text-xs text-[#716a5a] hover:text-black"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#18261b] mb-1">
                        Direct Image URL (HTTPS)
                      </label>
                      <input
                        type="url"
                        value={slotUrlInput}
                        onChange={(e) => setSlotUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-1.5 text-xs rounded-md bg-white border border-[#ded8c4] text-[#1a221d] focus:outline-hidden focus:border-[#1b2e20]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#18261b] mb-1">
                        Descriptive Alt Text (SEO & Accessibility)
                      </label>
                      <input
                        type="text"
                        value={slotAltInput}
                        onChange={(e) => setSlotAltInput(e.target.value)}
                        placeholder="e.g. Norton farm centre pivot irrigator watering winter wheat"
                        className="w-full px-3 py-1.5 text-xs rounded-md bg-white border border-[#ded8c4] text-[#1a221d] focus:outline-hidden focus:border-[#1b2e20]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSlotUrlInput('');
                        setSlotAltInput('');
                      }}
                      className="text-xs text-[#a3442a] underline"
                    >
                      Revert to Architectural Placeholder
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#1b2e20] text-white text-xs font-semibold rounded-md shadow-xs"
                    >
                      Apply Photography to Slot
                    </button>
                  </div>
                </form>
              )}

              {/* Slot Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaSlotEntries.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-4 rounded-xl bg-white border border-[#ded8c4] space-y-2 hover:border-[#b8ae93] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-mono text-[#8b6527]">
                        <span>{slot.aspectRatio}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-sans font-semibold ${
                            slot.url ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {slot.url ? 'Photo Active' : 'Slot Empty'}
                        </span>
                      </div>
                      <h5 className="font-serif font-bold text-sm text-[#18261b] mt-1">{slot.label}</h5>
                      <p className="text-xs text-[#5f5747] line-clamp-2 mt-0.5">{slot.description}</p>
                    </div>

                    <div className="pt-3 border-t border-[#f0ece0] flex items-center justify-between">
                      <span className="text-[10px] text-[#938c7b] font-mono">{slot.id}</span>
                      <button
                        type="button"
                        onClick={() => handleSelectSlot(slot.id)}
                        className="text-xs font-semibold text-[#8b6527] hover:text-[#5c4217] flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Configure</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#18261b]">Product Catalogue Manager</h3>
                  <p className="text-xs text-[#635c4a]">Manage items across Crops, Nursery, Livestock & Poultry</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1b2e20] text-white text-xs font-semibold rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Add Product Form */}
              {showAddProduct && (
                <form onSubmit={handleCreateProduct} className="p-5 rounded-xl bg-[#ede7d5] border border-[#d6cdb7] space-y-3">
                  <h4 className="font-serif font-bold text-sm text-[#18261b]">Create Commercial Product</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#18261b] mb-1">Product Name</label>
                      <input
                        type="text"
                        required
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="e.g. Soya Beans"
                        className="w-full px-3 py-1.5 text-xs rounded bg-white border border-[#ded8c4]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#18261b] mb-1">Portfolio Category</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-xs rounded bg-white border border-[#ded8c4]"
                      >
                        <option value="crops">Crops</option>
                        <option value="nursery">Nursery</option>
                        <option value="livestock">Livestock</option>
                        <option value="poultry">Poultry</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#18261b] mb-1">Sub-Category</label>
                      <input
                        type="text"
                        value={newProduct.subCategory}
                        onChange={(e) => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                        placeholder="e.g. Oilseeds"
                        className="w-full px-3 py-1.5 text-xs rounded bg-white border border-[#ded8c4]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#18261b] mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="High-protein non-GMO soya bean crop..."
                      className="w-full px-3 py-1.5 text-xs rounded bg-white border border-[#ded8c4]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#18261b] mb-1">Production Cycle / Availability Note</label>
                    <input
                      type="text"
                      value={newProduct.availabilityNote}
                      onChange={(e) => setNewProduct({ ...newProduct, availabilityNote: e.target.value })}
                      placeholder="e.g. Harvesting March-April. Contact commercial desk."
                      className="w-full px-3 py-1.5 text-xs rounded bg-white border border-[#ded8c4]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProduct(false)}
                      className="px-3 py-1.5 text-xs text-[#524b3c]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#1b2e20] text-white text-xs font-semibold rounded"
                    >
                      Save Product to Database
                    </button>
                  </div>
                </form>
              )}

              {/* Product Table */}
              <div className="space-y-3">
                {data.products.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-white border border-[#ded8c4] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#18261b]">{p.name}</span>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-[#ede8d8] text-[#785923] font-semibold">
                          {p.category} • {p.subCategory}
                        </span>
                      </div>
                      <p className="text-xs text-[#595242] line-clamp-1">{p.description}</p>
                      <p className="text-[11px] text-[#857d6b] italic">{p.availabilityNote}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const newStatus = p.status === 'in_production' ? 'developing' : 'in_production';
                          updateProduct(p.id, { status: newStatus, isAvailableNow: newStatus === 'in_production' });
                          showNotification();
                        }}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium border ${
                          p.status === 'in_production'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        {p.status === 'in_production' ? '● In Production' : '● Developing'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete product ${p.name}?`)) {
                            deleteProduct(p.id);
                            showNotification();
                          }
                        }}
                        className="p-1.5 text-[#b34024] hover:bg-red-50 rounded"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 11 OPERATIONS */}
          {activeTab === 'operations' && (
            <div className="space-y-4">
              <div className="border-b border-[#ded8c4] pb-2">
                <h3 className="text-xl font-serif font-bold text-[#18261b]">11 Integrated Operations</h3>
                <p className="text-xs text-[#635c4a]">Update operational descriptions, key details, and activity status</p>
              </div>

              <div className="space-y-4">
                {data.operations.map((op) => (
                  <div key={op.id} className="p-4 rounded-xl bg-white border border-[#ded8c4] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-base text-[#18261b]">
                        0{op.order}. {op.title}
                      </h4>
                      <select
                        value={op.status}
                        onChange={(e) => {
                          updateOperation(op.id, { status: e.target.value as any });
                          showNotification();
                        }}
                        className="text-xs px-2.5 py-1 rounded bg-[#f5f2e8] border border-[#ded8c4] font-medium"
                      >
                        <option value="active">Active</option>
                        <option value="expanding">Expanding</option>
                        <option value="developing">Developing</option>
                      </select>
                    </div>

                    <p className="text-xs text-[#524b3c]">{op.summary}</p>

                    <div className="pt-2 flex flex-wrap items-center gap-1.5">
                      {op.keyDetails.map((k, kIdx) => (
                        <span key={kIdx} className="text-[11px] px-2 py-0.5 rounded bg-[#f3efe4] text-[#5c5443]">
                          ✓ {k}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROJECTS PIPELINE */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="border-b border-[#ded8c4] pb-2">
                <h3 className="text-xl font-serif font-bold text-[#18261b]">Development Projects Pipeline</h3>
                <p className="text-xs text-[#635c4a]">Manage future growth projects across irrigation, livestock, orchards, and infrastructure</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.projects.map((proj) => (
                  <div key={proj.id} className="p-4 rounded-xl bg-white border border-[#ded8c4] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#8b6527] uppercase">{proj.type}</span>
                      <select
                        value={proj.phase}
                        onChange={(e) => {
                          updateProject(proj.id, { phase: e.target.value });
                          showNotification();
                        }}
                        className="text-[11px] px-2 py-0.5 rounded bg-[#f5f2e8] border border-[#ded8c4]"
                      >
                        <option value="Planning & Site Design">Planning & Site Design</option>
                        <option value="Active Implementation">Active Implementation</option>
                        <option value="Phase 1 Commissioned">Phase 1 Commissioned</option>
                        <option value="Expanding Operations">Expanding Operations</option>
                      </select>
                    </div>

                    <h4 className="font-serif font-bold text-base text-[#18261b]">{proj.title}</h4>
                    <p className="text-xs text-[#595242]">{proj.summary}</p>
                    <span className="text-[11px] text-[#7d7563] block">Hub: {proj.locationHub}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LOCATIONS */}
          {activeTab === 'locations' && (
            <div className="space-y-4">
              <div className="border-b border-[#ded8c4] pb-2">
                <h3 className="text-xl font-serif font-bold text-[#18261b]">Farming Locations & Hubs</h3>
                <p className="text-xs text-[#635c4a]">Norton, Mvuma, Esigodini, Ntabazinduna</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.locations.map((loc) => (
                  <div key={loc.id} className="p-4 rounded-xl bg-white border border-[#ded8c4] space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-base text-[#18261b]">{loc.name} Hub</h4>
                      <span className="text-xs text-[#8b6527] font-semibold">{loc.province}</span>
                    </div>

                    <p className="text-xs text-[#595242]">{loc.summary}</p>
                    <p className="text-[11px] text-[#716957]">
                      <strong>Agro-Zone:</strong> {loc.agroEcologicalZone}
                    </p>
                    <p className="text-[11px] text-[#716957]">
                      <strong>Coordinates:</strong> {loc.coordinates.lat}, {loc.coordinates.lng}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS & SEO */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="border-b border-[#ded8c4] pb-2">
                <h3 className="text-xl font-serif font-bold text-[#18261b]">Corporate Details & SEO Foundation</h3>
                <p className="text-xs text-[#635c4a]">Entity metadata, mission statement, contact channels, and Google search parameters</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#18261b] mb-1">Company Trading Name</label>
                  <input
                    type="text"
                    value={data.settings.companyName}
                    onChange={(e) => {
                      updateSettings({ companyName: e.target.value });
                      showNotification();
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded bg-white border border-[#ded8c4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#18261b] mb-1">Registered Legal Entity</label>
                  <input
                    type="text"
                    value={data.settings.legalName}
                    onChange={(e) => {
                      updateSettings({ legalName: e.target.value });
                      showNotification();
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded bg-white border border-[#ded8c4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18261b] mb-1">Tagline</label>
                <input
                  type="text"
                  value={data.settings.tagline}
                  onChange={(e) => {
                    updateSettings({ tagline: e.target.value });
                    showNotification();
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded bg-white border border-[#ded8c4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18261b] mb-1">SEO Title</label>
                <input
                  type="text"
                  value={data.settings.seo.metaTitle}
                  onChange={(e) => {
                    updateSettings({ seo: { ...data.settings.seo, metaTitle: e.target.value } });
                    showNotification();
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded bg-white border border-[#ded8c4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18261b] mb-1">SEO Meta Description</label>
                <textarea
                  rows={2}
                  value={data.settings.seo.metaDescription}
                  onChange={(e) => {
                    updateSettings({ seo: { ...data.settings.seo, metaDescription: e.target.value } });
                    showNotification();
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded bg-white border border-[#ded8c4]"
                />
              </div>
            </div>
          )}

          {/* TAB 7: ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <div className="space-y-4">
              <div className="border-b border-[#ded8c4] pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#18261b]">Commercial Submissions Log</h3>
                  <p className="text-xs text-[#635c4a]">Enquiries submitted through website forms & off-take requests</p>
                </div>
                <span className="text-xs font-mono bg-[#ede8d8] text-[#785923] px-2.5 py-1 rounded">
                  {submissions.length} Total Received
                </span>
              </div>

              {submissions.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-white border border-[#ded8c4] text-xs text-[#736c5c]">
                  No submissions logged yet. Use the public enquiry form to simulate an incoming request.
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="p-4 rounded-xl bg-white border border-[#ded8c4] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#18261b]">{sub.name}</span>
                        <span className="text-[10px] uppercase font-mono text-[#8b6527] bg-[#ede8d8] px-2 py-0.5 rounded">
                          {sub.enquiryType}
                        </span>
                      </div>

                      <div className="text-xs text-[#524b3c] flex flex-wrap gap-4">
                        <span>Email: {sub.email}</span>
                        {sub.phone && <span>Phone: {sub.phone}</span>}
                        {sub.organization && <span>Org: {sub.organization}</span>}
                      </div>

                      {sub.specificProductOrInterest && (
                        <p className="text-xs font-medium text-[#785923]">
                          Interest: {sub.specificProductOrInterest}
                        </p>
                      )}

                      <p className="text-xs bg-[#f7f5ed] p-2.5 rounded border border-[#e8e2d2] text-[#333e36]">
                        {sub.message}
                      </p>

                      <div className="text-[10px] text-[#918978] flex justify-between">
                        <span>Received: {new Date(sub.createdAt).toLocaleString()}</span>
                        <span>ID: {sub.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: JSON BACKUP / RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="border-b border-[#ded8c4] pb-2">
                <h3 className="text-xl font-serif font-bold text-[#18261b]">Database Backup & Migration</h3>
                <p className="text-xs text-[#635c4a]">Full portability for future PostgreSQL, Firestore, or Cloud SQL migration</p>
              </div>

              {/* Export Box */}
              <div className="p-4 rounded-xl bg-white border border-[#ded8c4] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-[#18261b]">Export Database JSON</h4>
                  <button
                    type="button"
                    onClick={handleExport}
                    className="px-3 py-1.5 bg-[#1b2e20] text-white text-xs font-semibold rounded"
                  >
                    Generate Export JSON
                  </button>
                </div>
                {jsonExport && (
                  <textarea
                    readOnly
                    rows={6}
                    value={jsonExport}
                    className="w-full p-2.5 text-xs font-mono bg-[#1b261e] text-[#d6ded7] rounded border border-gray-700"
                  />
                )}
              </div>

              {/* Import Box */}
              <div className="p-4 rounded-xl bg-white border border-[#ded8c4] space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#18261b]">Import / Restore Database JSON</h4>
                <textarea
                  rows={4}
                  value={jsonImport}
                  onChange={(e) => setJsonImport(e.target.value)}
                  placeholder="Paste validated Dzinopona CMS JSON here..."
                  className="w-full p-2.5 text-xs font-mono bg-white rounded border border-[#ded8c4]"
                />
                <div className="flex items-center justify-between">
                  {importStatus && <span className="text-xs font-medium text-[#785923]">{importStatus}</span>}
                  <button
                    type="button"
                    onClick={handleImport}
                    className="px-3.5 py-1.5 bg-[#8b6527] text-white text-xs font-semibold rounded"
                  >
                    Restore Data
                  </button>
                </div>
              </div>

              {/* Reset Box */}
              <div className="p-4 rounded-xl bg-[#fdf0ed] border border-[#ebd0ca] flex items-center justify-between">
                <div>
                  <h5 className="font-serif font-bold text-sm text-[#9c321d]">Reset to Verified Client Master Copy</h5>
                  <p className="text-xs text-[#6e463e]">Wipes local edits and restores the verified document baseline.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset all CMS content back to default source document?')) {
                      resetToDefaults();
                      showNotification();
                    }
                  }}
                  className="px-3 py-1.5 bg-[#9c321d] text-white text-xs font-semibold rounded flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#f2efe4] border-t border-[#ded8c4] flex items-center justify-between text-[11px] text-[#635c4a]">
          <span>Single Source of Truth: defaultData.ts & CmsContext</span>
          <span>Dzinopona Farms (Private) Limited</span>
        </div>
      </div>
    </div>
  );
};
