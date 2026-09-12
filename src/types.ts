export type PageRoute = 
  | 'home'
  | 'about'
  | 'operations'
  | 'products'
  | 'projects'
  | 'services'
  | 'locations'
  | 'contact';

export type AppRoute = PageRoute | 'auth' | 'admin' | 'editor';

export type ProductStatus = 'in_production' | 'developing' | 'seasonal';

export type ProductCategory = 'crops' | 'nursery' | 'livestock' | 'poultry';

export interface GalleryMediaItem {
  id: string;
  url: string;
  altText?: string;
  caption?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: ProductCategory;
  subCategory: string;
  description: string;
  status: ProductStatus;
  isAvailableNow: boolean;
  availabilityNote: string;
  specifications?: string[];
  imageSlotId: string;
  primaryImageUrl?: string;
  imageAltText?: string;
  galleryImages?: GalleryMediaItem[];
  order: number;
}

export type OperationCategory =
  | 'crop_production'
  | 'horticulture'
  | 'nursery_orchards'
  | 'herbs'
  | 'livestock'
  | 'poultry'
  | 'irrigation_water'
  | 'farm_development'
  | 'processing_value_addition'
  | 'marketing_distribution'
  | 'biosecurity';

export interface OperationItem {
  id: string;
  slug: string;
  title: string;
  category: OperationCategory;
  summary: string;
  fullDescription: string;
  keyDetails: string[];
  status: 'active' | 'expanding' | 'developing';
  featuredOnHome: boolean;
  imageSlotId: string;
  primaryImageUrl?: string;
  imageAltText?: string;
  galleryImages?: GalleryMediaItem[];
  order: number;
}

export type ProjectType =
  | 'Irrigation Development'
  | 'Orchard Development'
  | 'Horticulture Development'
  | 'Poultry Development'
  | 'Livestock Development'
  | 'Farm Infrastructure';

export type ProjectPhase = 'Planning & Design' | 'Active Implementation' | 'Phase 1 Commissioned' | 'Expanding';

export interface ProjectVideo {
  url: string;
  title?: string;
  caption?: string;
  thumbnailUrl?: string;
  description?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  type: ProjectType;
  phase: ProjectPhase;
  locationHub: string;
  summary: string;
  objectives: string[];
  keyMilestones: string[];
  isDevelopment: boolean; // clearly distinguishes development projects from established production
  imageSlotId: string;
  primaryImageUrl?: string;
  imageAltText?: string;
  galleryImages?: GalleryMediaItem[];
  video?: ProjectVideo;
  order: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  deliverables: string[];
  targetAudience: string;
  imageSlotId: string;
  primaryImageUrl?: string;
  imageAltText?: string;
  galleryImages?: GalleryMediaItem[];
  order: number;
}

export interface FarmLocation {
  id: string;
  name: string; // Norton, Mvuma, Esigodini, Ntabazinduna
  province: string;
  agroEcologicalZone: string;
  summary: string;
  primaryFocus: string[];
  infrastructureOverview: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isCoordinatesConfirmed: boolean; // "Do not invent exact farm coordinates. Only use exact map pins once confirmed by the client."
  imageSlotId: string;
  order: number;
}

export interface MediaSlot {
  id: string;
  label: string;
  category: 'hero' | 'landscape' | 'crops' | 'nursery' | 'livestock' | 'poultry' | 'infrastructure' | 'projects' | 'locations' | 'team';
  description: string;
  aspectRatio: '16:9' | '4:3' | '1:1' | '21:9' | '3:2';
  focalPoint: 'center' | 'top' | 'bottom' | 'left' | 'right';
  url?: string;
  posterUrl?: string;
  altText?: string;
  caption?: string;
  isCustomUploaded: boolean;
  mediaType?: 'image' | 'video';
}

export interface HomepageContent {
  heroBadge: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroIntro: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  factsTicker: {
    label: string;
    value: string;
    subtext: string;
  }[];
  productionPolicyNotice: string;
}

export interface FooterContent {
  operationalNoticeTitle: string;
  operationalNoticeText: string;
  agroEcologicalBand: string;
  copyrightNotice: string;
}

export interface SiteSettings {
  companyName: string;
  legalName: string;
  tagline: string;
  positioning: string;
  establishedYear?: string;
  homepage?: HomepageContent;
  footer?: FooterContent;
  valueStoryStages: {
    stage: string;
    label: string;
    description: string;
  }[];
  contact: {
    primaryEmail: string;
    enquiryEmail: string;
    corporateAddress: string;
    operatingHubsSummary: string;
    phonePlaceholderNote: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl: string;
    ogTitle?: string;
    ogDescription?: string;
    robotsIndexing?: string;
  };
  about: {
    whoWeAre: string;
    vision: string;
    mission: string;
    companyBackground: string;
    corporateValues: {
      title: string;
      description: string;
    }[];
    fivePillars: {
      name: string;
      tagline: string;
      description: string;
    }[];
  };
}

export interface CmsDatabase {
  version: string;
  lastUpdated: string;
  settings: SiteSettings;
  operations: OperationItem[];
  products: ProductItem[];
  projects: ProjectItem[];
  services: ServiceItem[];
  locations: FarmLocation[];
  mediaSlots: Record<string, MediaSlot>;
}

export interface EnquirySubmission {
  id: string;
  createdAt: string;
  name: string;
  organization?: string;
  email: string;
  phone?: string;
  enquiryType: 'products' | 'partnership' | 'services' | 'careers' | 'general';
  specificProductOrInterest?: string;
  message: string;
  status: 'new' | 'reviewed';
}

export interface EditorPermissions {
  editContent: boolean;       // General page content (homepage, about, footer, seo, contact)
  manageProducts: boolean;    // Agricultural products, product images, availability
  manageServices: boolean;    // Agribusiness services & deliverables
  manageProjects: boolean;    // Strategic projects, galleries, short videos
  manageMedia: boolean;       // Media slots & file uploads
  manageOperations: boolean;  // Operations info & farm imagery
  manageLocations: boolean;   // Farming locations & hub data
}

export interface AuthUser {
  id?: string;
  username: string;
  email?: string;
  fullName: string;
  role: 'admin' | 'editor';
  permissions?: EditorPermissions;
  isActive?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface EditorAccount {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'editor';
  permissions: EditorPermissions;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  lastLoginAt?: string;
  createdBy?: string;
}

export type EditorUser = EditorAccount;

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  username: string;
  fullName?: string;
  role?: 'admin' | 'editor' | 'system';
  user?: {
    id?: string;
    username: string;
    fullName?: string;
    role?: 'admin' | 'editor' | 'system';
  };
  action: string;
  module: string;
  section?: string;
  recordId?: string;
  recordName?: string;
  summary: string;
  details?: string;
  previousValue?: string;
  newValue?: string;
  changes?: any;
}
