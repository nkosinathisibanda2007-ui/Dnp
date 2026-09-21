import React, { useState } from 'react';
import { Camera, SlidersHorizontal, Check, Sparkles, AlertCircle, Upload, Film } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { MediaSlot } from '../types';
import { DEFAULT_SLOT_IMAGE_MAP } from '../utils/imageAssets';

interface MediaFrameProps {
  slotId: string;
  ratio?: '16:9' | '4:3' | '1:1' | '21:9' | '3:2';
  className?: string;
  badgeText?: string;
  caption?: string;
  showAdminQuickAction?: boolean;
  priority?: boolean;
  children?: React.ReactNode;
}

export const MediaFrame: React.FC<MediaFrameProps> = ({
  slotId,
  ratio,
  className = '',
  badgeText,
  caption,
  showAdminQuickAction = false,
  priority = false,
  children,
}) => {
  const { data, assignMediaUrl, updateMediaSlot, authStatus, uploadMediaFile, activeRoute } = useCms();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const slot: MediaSlot = data.mediaSlots[slotId] || {
    id: slotId,
    label: 'Agricultural Asset',
    category: 'landscape',
    description: 'Operational media asset for Zimbabwean agribusiness activities.',
    aspectRatio: ratio || '16:9',
    focalPoint: 'center',
    isCustomUploaded: false,
  };

  // Resolve authentic URL from slot or verified defaults
  const resolvedUrl = (slot.url && !slot.url.includes('wikimedia.org'))
    ? slot.url
    : (DEFAULT_SLOT_IMAGE_MAP[slotId] || slot.url || '');

  const [tempUrl, setTempUrl] = useState(resolvedUrl || '');
  const [tempAlt, setTempAlt] = useState(slot.altText || '');
  const [tempCaption, setTempCaption] = useState(slot.caption || '');

  const finalRatio = ratio || slot.aspectRatio || '16:9';

  const ratioClassMap: Record<string, string> = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-4/3',
    '1:1': 'aspect-square',
    '21:9': 'aspect-21/9',
    '3:2': 'aspect-3/2',
  };

  const focalPointClassMap: Record<string, string> = {
    center: 'object-center',
    top: 'object-top',
    bottom: 'object-bottom',
    left: 'object-left',
    right: 'object-right',
  };

  const isVideo =
    slot.mediaType === 'video' ||
    (Boolean(resolvedUrl) &&
      (resolvedUrl.includes('.mp4') ||
        resolvedUrl.includes('.webm') ||
        resolvedUrl.startsWith('data:video')));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // First try server upload if authenticated
      if (authStatus.isAuthenticated) {
        const uploadRes = await uploadMediaFile(file, {
          altText: tempAlt || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          caption: tempCaption,
        });
        if (uploadRes.success && uploadRes.url) {
          setTempUrl(uploadRes.url);
          if (!tempAlt) setTempAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
          setIsUploading(false);
          return;
        }
      }

      // Fallback to data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setTempUrl(result);
          if (!tempAlt) {
            setTempAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
          }
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
    }
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUrl.trim()) {
      assignMediaUrl(slotId, tempUrl.trim(), tempAlt.trim());
      if (tempCaption.trim()) {
        updateMediaSlot(slotId, { caption: tempCaption.trim() });
      }
      setIsEditing(false);
    }
  };

  const handleClearImage = () => {
    assignMediaUrl(slotId, '', '');
    setIsEditing(false);
  };

  const displayCaption = caption || slot.caption;
  const isInsideAdmin = activeRoute === 'admin' || activeRoute === 'editor';

  return (
    <div className={`relative group overflow-hidden rounded-xl bg-[#f6f4ec] ${ratioClassMap[finalRatio] || 'aspect-video'} ${className}`}>
      {/* If media is assigned or has verified default */}
      {resolvedUrl ? (
        <div className="relative w-full h-full">
          {isVideo ? (
            <video
              src={resolvedUrl}
              autoPlay
              loop
              muted
              playsInline
              className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${focalPointClassMap[slot.focalPoint] || 'object-center'}`}
            />
          ) : (
            <img
              src={resolvedUrl}
              alt={slot.altText || slot.label}
              loading={priority ? 'eager' : 'lazy'}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = 'true';
                  target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop';
                }
              }}
              className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${focalPointClassMap[slot.focalPoint] || 'object-center'}`}
            />
          )}

          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent opacity-80 group-hover:opacity-75 transition-opacity pointer-events-none" />

          {/* Video indicator badge if applicable */}
          {isVideo && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white font-medium uppercase tracking-wider">
                <Film className="w-3 h-3 text-[#e5a952]" />
                Video
              </span>
            </div>
          )}

          {/* Caption overlay */}
          {displayCaption && (
            <div className="absolute bottom-3 inset-x-3 z-10 pointer-events-none">
              <span className="inline-block px-2.5 py-1 rounded bg-black/60 backdrop-blur-xs text-[11px] text-[#faf9f5] font-medium tracking-wide leading-tight shadow-xs">
                {displayCaption}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Architectural placeholder */
        <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-[#f7f5ed] text-[#2c362e] select-none">
          <div className="absolute inset-0 bg-topo-pattern opacity-60 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#ebe7da]/90 border border-[#ded8c4] text-[11px] font-medium tracking-wider uppercase text-[#5a5444]">
              <Camera className="w-3 h-3 text-[#99793d]" />
              <span>Media Slot • {finalRatio}</span>
            </div>

            {badgeText && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#1b2e20]/80 text-[#faf9f5] font-medium tracking-wide">
                {badgeText}
              </span>
            )}
          </div>

          <div className="relative z-10 my-auto py-2">
            <h4 className="text-sm sm:text-base font-semibold text-[#18241b] tracking-tight mb-1">
              {slot.label}
            </h4>
            <p className="text-xs text-[#576458] leading-relaxed max-w-sm line-clamp-2">
              {slot.description}
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between pt-2 border-t border-[#ded8c4]/60 text-[11px] text-[#717e72]">
            <span className="font-mono text-[10px] text-[#8c7e63]">ID: {slotId}</span>
            <span>{displayCaption || 'Ready for media upload'}</span>
          </div>
        </div>
      )}

      {/* Children elements (e.g. badges, custom CTA buttons) */}
      {children && <div className="absolute inset-0 z-10 pointer-events-none">{children}</div>}

      {/* Quick CMS media edit button (ONLY in admin/editor views, NEVER on public site) */}
      {isInsideAdmin && showAdminQuickAction && authStatus.isAuthenticated && (authStatus.user?.role === 'admin' || authStatus.user?.permissions?.manageMedia !== false) && (
        <div className="absolute top-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setTempUrl(resolvedUrl || '');
              setTempAlt(slot.altText || '');
              setTempCaption(slot.caption || '');
              setIsEditing(!isEditing);
            }}
            title="Configure or assign photo/video for this slot"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1c2920]/90 backdrop-blur-md text-[#fbfbfa] text-[11px] font-medium shadow-md hover:bg-[#152018] transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3 text-[#d39c4a]" />
            <span>{resolvedUrl ? 'Change Media' : 'Assign Media'}</span>
          </button>
        </div>
      )}

      {/* Inline Quick Media Config Modal (ONLY in admin/editor views) */}
      {isInsideAdmin && isEditing && (
        <div
          className="absolute inset-0 z-30 bg-[#142017]/95 p-4 sm:p-5 flex flex-col justify-between text-[#faf9f5] backdrop-blur-md transition-all overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d39c4a]" />
              <span className="text-xs font-semibold tracking-wide uppercase">CMS Media Configurator</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-white/60 hover:text-white px-2 py-0.5 rounded hover:bg-white/10 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveUrl} className="space-y-2.5 my-auto py-2">
            <div>
              <label className="block text-[11px] font-medium text-white/70 mb-1">
                Upload File or Enter URL
              </label>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] font-medium transition-colors border border-white/20">
                  <Upload className="w-3 h-3 text-[#d39c4a]" />
                  <span>Choose Local File</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[10px] text-white/50">JPG, PNG, WebP, MP4</span>
              </div>
              <input
                type="text"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="https://... (or paste image/video URL)"
                className="w-full px-2.5 py-1.5 text-xs rounded bg-black/40 border border-white/20 text-white placeholder-white/30 focus:outline-hidden focus:border-[#d39c4a]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/70 mb-1">
                Alt Text (Description)
              </label>
              <input
                type="text"
                value={tempAlt}
                onChange={(e) => setTempAlt(e.target.value)}
                placeholder="Descriptive caption of agricultural subject"
                className="w-full px-2.5 py-1.5 text-xs rounded bg-black/40 border border-white/20 text-white placeholder-white/30 focus:outline-hidden focus:border-[#d39c4a]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/70 mb-1">
                Display Caption
              </label>
              <input
                type="text"
                value={tempCaption}
                onChange={(e) => setTempCaption(e.target.value)}
                placeholder="e.g. Avocado saplings under shade net"
                className="w-full px-2.5 py-1.5 text-xs rounded bg-black/40 border border-white/20 text-white placeholder-white/30 focus:outline-hidden focus:border-[#d39c4a]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {resolvedUrl && (
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="px-2.5 py-1 text-xs text-red-300 hover:text-red-200 hover:bg-red-950/40 rounded border border-red-800/40 cursor-pointer"
                >
                  Clear Media
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-1 bg-[#b57a2c] hover:bg-[#c68936] text-white text-xs font-semibold rounded shadow-xs cursor-pointer"
              >
                <Check className="w-3 h-3" />
                Save to Frame
              </button>
            </div>
          </form>

          <p className="text-[10px] text-white/50 text-center">
            Changes immediately update across public views and persist to local and server storage.
          </p>
        </div>
      )}
    </div>
  );
};
