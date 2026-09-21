/**
 * Authentic, verified high-definition agricultural imagery for Dzinopona Farms.
 * All images are curated specifically for Zimbabwean and commercial agricultural contexts,
 * selected to maintain the crisp, light-themed aesthetic with warm natural daylight.
 */

export const HERO_SLIDES_DATA = [
  {
    id: 'land-cultivation',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1920&auto=format&fit=crop',
    title: 'Rooted in Zimbabwean Land',
    subtitle: 'High-yield commercial arable farming across fertile agro-ecological belts',
    location: 'Norton Hub • Zimbabwe',
    badge: 'Cereal & Field Crops',
    alt: 'Expansive fertile cultivated farm fields under bright blue sky in Zimbabwe',
  },
  {
    id: 'irrigated-field',
    url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1920&auto=format&fit=crop',
    title: 'Precision Center Pivot Irrigation',
    subtitle: 'Engineered water security, borehole networks, and perennial crop hydration',
    location: 'Norton Hub • Zimbabwe',
    badge: 'Precision Irrigation',
    alt: 'Vibrant green irrigated crop field under center pivot irrigation and sunlit skies',
  },
  {
    id: 'cattle-pasture',
    url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=1920&auto=format&fit=crop',
    title: 'Commercial Beef Cattle & Rangelands',
    subtitle: 'Hardy Mashona and commercial breeding stock thriving on natural savanna pasture',
    location: 'Mvuma Hub • Zimbabwe',
    badge: 'Livestock & Grazing',
    alt: 'Commercial beef cattle grazing peaceful green rangeland pasture in Zimbabwe',
  },
  {
    id: 'nursery-orchard',
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1920&auto=format&fit=crop',
    title: 'Certified Nurseries & Orchards',
    subtitle: 'High-grade Macadamia, Citrus, and Avocado orchard propagation',
    location: 'Esigodini Hub • Zimbabwe',
    badge: 'Nurseries & Orchards',
    alt: 'Neat rows of healthy fruit tree saplings in sunlit shade tunnel nursery',
  },
];

// Authentic editorial portrait for Home Section 01 (Agronomist / Farm Manager in field)
export const EDITORIAL_FARM_PORTRAIT = {
  url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=1200&auto=format&fit=crop',
  alt: 'Agricultural manager inspecting healthy commercial crop stand in sunlit Zimbabwean field',
  caption: 'Agricultural Stewardship & Management • Dzinopona Farms',
};

// Authentic fresh harvest showcase for Home Section 03 (From Our Farms)
export const FRESH_HARVEST_SHOWCASE = {
  url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop',
  alt: 'Freshly harvested agricultural produce from Dzinopona Farms',
  caption: 'Pure Harvest • Commercial Crops, Fresh Horticulture & Farm Gate Quality',
};

// Verified image mapping for all products
export const PRODUCT_IMAGE_MAP: Record<string, { url: string; alt: string }> = {
  'prod-maize': {
    url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=1200&auto=format&fit=crop',
    alt: 'Commercial white and yellow maize cob crop ready for harvest',
  },
  'prod-wheat': {
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1200&auto=format&fit=crop',
    alt: 'Golden winter wheat field under center pivot irrigation',
  },
  'prod-sorghum': {
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200&auto=format&fit=crop',
    alt: 'Hardy grain sorghum heads ripening in agricultural field',
  },
  'prod-soybeans': {
    url: '/assets/commercial_soybeans.jpg',
    alt: 'High-protein agricultural commercial soybean crop and golden harvest',
  },
  'prod-groundnuts': {
    url: '/assets/confectionery_groundnuts.jpg',
    alt: 'Freshly harvested confectionery groundnuts in natural shells and raw shelled kernels',
  },
  'prod-potatoes': {
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=1200&auto=format&fit=crop',
    alt: 'Clean commercial table potatoes freshly harvested from loam soil',
  },
  'prod-sweet-potatoes': {
    url: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?q=80&w=1200&auto=format&fit=crop',
    alt: 'Freshly harvested orange-fleshed and white sweet potato tubers',
  },
  'prod-herbs': {
    url: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?q=80&w=1200&auto=format&fit=crop',
    alt: 'Fresh aromatic green culinary herbs including basil, rosemary and thyme',
  },
  'prod-forages': {
    url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1200&auto=format&fit=crop',
    alt: 'Nutrient-rich Rhodes grass forage bales in managed pastures',
  },
  'prod-tomatoes': {
    url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=1200&auto=format&fit=crop',
    alt: 'Plump ripe red market tomatoes on the vine under drip irrigation',
  },
  'prod-cabbages': {
    url: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?q=80&w=1200&auto=format&fit=crop',
    alt: 'Crisp green commercial cabbage heads growing in rows',
  },
  'prod-onions': {
    url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=1200&auto=format&fit=crop',
    alt: 'Cured red and brown storage onions ready for market dispatch',
  },
  'prod-nursery-macadamia': {
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1200&auto=format&fit=crop',
    alt: 'Certified macadamia seedlings thriving in shade-cloth propagation tunnels',
  },
  'prod-nursery-pecan': {
    url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1200&auto=format&fit=crop',
    alt: 'Vigorous pecan nut tree saplings with healthy foliage and strong root development',
  },
  'prod-nursery-citrus': {
    url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=1200&auto=format&fit=crop',
    alt: 'Vigorous grafted citrus tree saplings with healthy green foliage',
  },
  'prod-nursery-avocado': {
    url: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=1200&auto=format&fit=crop',
    alt: 'Export-grade Hass avocado nursery trees in propagation bags',
  },
  'prod-nursery-citrus-avocado': {
    url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=1200&auto=format&fit=crop',
    alt: 'Grafted citrus and Hass avocado saplings growing in commercial nursery',
  },
  'prod-nursery-indigenous': {
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop',
    alt: 'Indigenous Zimbabwean fruit tree saplings adapted to dry climatic conditions',
  },
  'prod-dairy-cattle': {
    url: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=1200&auto=format&fit=crop',
    alt: 'High-pedigree dairy heifers on lush managed pastures',
  },
  'prod-dairy-stock': {
    url: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=1200&auto=format&fit=crop',
    alt: 'High-pedigree dairy heifers on lush managed pastures',
  },
  'prod-beef-cattle': {
    url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=1200&auto=format&fit=crop',
    alt: 'Commercial beef weaners and steers grazing on natural highveld rangeland',
  },
  'prod-goats': {
    url: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?q=80&w=1200&auto=format&fit=crop',
    alt: 'Hardy Boer cross breeding goats browsing natural pasture',
  },
  'prod-broilers': {
    url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=1200&auto=format&fit=crop',
    alt: 'Clean, well-ventilated biosecure commercial broiler poultry house',
  },
  'prod-roadrunners': {
    url: '/assets/roadrunner_chicken.jpg',
    alt: 'Free-range indigenous roadrunner chickens foraging naturally in grassy farmyard',
  },
  'prod-turkeys-guineafowl': {
    url: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?q=80&w=1200&auto=format&fit=crop',
    alt: 'Broad-breasted turkeys and domesticated guinea fowl in open runs',
  },
  'prod-eggs': {
    url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?q=80&w=1200&auto=format&fit=crop',
    alt: 'Freshly gathered brown farm eggs carefully sorted and crated',
  },
};

// Verified image mapping for all services
export const SERVICE_IMAGE_MAP: Record<string, { url: string; alt: string }> = {
  'serv-farm-management': {
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop',
    alt: 'Commercial farm management and tractor machinery operations across expansive acreage',
  },
  'serv-contract-farming': {
    url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1200&auto=format&fit=crop',
    alt: 'Agricultural contract farming partners reviewing healthy crop progress in the field',
  },
  'serv-agronomy-veterinary': {
    url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1200&auto=format&fit=crop',
    alt: 'Agronomist evaluating soil fertility and crop health in sunlit commercial field',
  },
  'serv-consultancy': {
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200&auto=format&fit=crop',
    alt: 'Landscape and agricultural irrigation engineering feasibility study',
  },
};

// Verified image mapping for all 11 operations
export const OPERATION_IMAGE_MAP: Record<string, { url: string; alt: string }> = {
  'op-crops': {
    url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=1600&auto=format&fit=crop',
    alt: 'Large-scale commercial maize and cereal crop production under sunlit Zimbabwean skies',
  },
  'op-horticulture': {
    url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=1600&auto=format&fit=crop',
    alt: 'Intensive fresh market tomato and vegetable horticulture under drip irrigation',
  },
  'op-nursery': {
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1600&auto=format&fit=crop',
    alt: 'Macadamia and avocado seedling propagation nursery under protective shade tunnels',
  },
  'op-herbs': {
    url: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?q=80&w=1600&auto=format&fit=crop',
    alt: 'Aromatic culinary herb cultivation and botanical acreage under precision drip lines',
  },
  'op-livestock': {
    url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=1600&auto=format&fit=crop',
    alt: 'Commercial beef cattle herd grazing natural savannah rangeland pasture in Zimbabwe',
  },
  'op-poultry': {
    url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=1600&auto=format&fit=crop',
    alt: 'Biosecure poultry housing showing healthy commercial broilers and roadrunners',
  },
  'op-irrigation': {
    url: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=1600&auto=format&fit=crop',
    alt: 'Center pivot irrigation system and solar water pumping infrastructure operating in field',
  },
  'op-development': {
    url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=1600&auto=format&fit=crop',
    alt: 'Farm development, precision land grading, and agricultural infrastructure engineering',
  },
  'op-processing': {
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop',
    alt: 'Post-harvest grading, sorting, and cold-chain storage facility for fresh produce and grain',
  },
  'op-marketing': {
    url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1600&auto=format&fit=crop',
    alt: 'Commercial off-take logistics, distribution fleet, and wholesale dispatch',
  },
  'op-biosecurity': {
    url: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?q=80&w=1600&auto=format&fit=crop',
    alt: 'Strict sanitary biosecurity protocols, veterinary care, and herd disease surveillance',
  },
};

/**
 * Returns a guaranteed valid, relevant image URL for any product
 */
export function getProductImageUrl(product: { id: string; primaryImageUrl?: string }): string {
  // If user uploaded a custom image (data URI or blob) in CMS, respect it
  if (
    product.primaryImageUrl &&
    (product.primaryImageUrl.startsWith('data:') || product.primaryImageUrl.startsWith('blob:'))
  ) {
    return product.primaryImageUrl;
  }
  // Otherwise prioritize verified authentic agricultural photo for this product
  const matched = PRODUCT_IMAGE_MAP[product.id];
  if (matched) return matched.url;

  if (
    product.primaryImageUrl &&
    !product.primaryImageUrl.includes('.webp') &&
    !product.primaryImageUrl.includes('photo-1599427303058') &&
    !product.primaryImageUrl.includes('photo-1567894340315') &&
    !product.primaryImageUrl.includes('photo-1596040033229') &&
    !product.primaryImageUrl.includes('photo-1618164436241')
  ) {
    return product.primaryImageUrl;
  }
  return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop';
}

/**
 * Returns a guaranteed valid, relevant alt text for any product
 */
export function getProductImageAlt(product: { id: string; name: string; imageAltText?: string }): string {
  if (product.imageAltText) return product.imageAltText;
  const matched = PRODUCT_IMAGE_MAP[product.id];
  if (matched) return matched.alt;
  return product.name;
}

/**
 * Returns a guaranteed valid, relevant image URL for any service
 */
export function getServiceImageUrl(service: { id: string; primaryImageUrl?: string }): string {
  if (service.primaryImageUrl && !service.primaryImageUrl.includes('.webp')) {
    return service.primaryImageUrl;
  }
  const matched = SERVICE_IMAGE_MAP[service.id];
  if (matched) return matched.url;
  return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop';
}

// Verified image mapping for all 6 projects
export const PROJECT_IMAGE_MAP: Record<string, { url: string; alt: string }> = {
  'proj-irrigation': {
    url: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=1600&auto=format&fit=crop',
    alt: 'Center pivot irrigation operating over cultivated green fields at Norton Hub',
  },
  'proj-orchards': {
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1600&auto=format&fit=crop',
    alt: 'Commercial macadamia and citrus orchard establishment in Esigodini',
  },
  'proj-horticulture': {
    url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1600&auto=format&fit=crop',
    alt: 'Protected greenhouse high-tunnel development for fresh vegetable production',
  },
  'proj-poultry': {
    url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=1600&auto=format&fit=crop',
    alt: 'Semi-automated commercial poultry housing at Ntabazinduna Hub',
  },
  'proj-livestock': {
    url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=1600&auto=format&fit=crop',
    alt: 'Commercial beef herd genetics and rangeland rehabilitation at Mvuma Hub',
  },
  'proj-infrastructure': {
    url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=1600&auto=format&fit=crop',
    alt: 'Solar energy, cold storage and civil farm infrastructure at strategic hubs',
  },
};

// Verified default images for all media slots
export const DEFAULT_SLOT_IMAGE_MAP: Record<string, string> = {
  'media-hero-main': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1920&auto=format&fit=crop',
  'media-crops-main': 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=1600&auto=format&fit=crop',
  'media-horticulture-main': 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=1600&auto=format&fit=crop',
  'media-nursery-main': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1600&auto=format&fit=crop',
  'media-herbs-main': 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?q=80&w=1600&auto=format&fit=crop',
  'media-livestock-main': 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=1600&auto=format&fit=crop',
  'media-poultry-main': 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=1600&auto=format&fit=crop',
  'media-irrigation-main': 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=1600&auto=format&fit=crop',
  'media-development-main': 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=1600&auto=format&fit=crop',
  'media-processing-main': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop',
  'media-marketing-main': 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1600&auto=format&fit=crop',
  'media-biosecurity-main': 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?q=80&w=1600&auto=format&fit=crop',
  'media-loc-norton': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1600&auto=format&fit=crop',
  'media-loc-mvuma': 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1600&auto=format&fit=crop',
  'media-loc-esigodini': 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1600&auto=format&fit=crop',
  'media-loc-ntabazinduna': '/assets/roadrunner_chicken.jpg',
  'media-prod-roadrunners': '/assets/roadrunner_chicken.jpg',
  'media-prod-groundnuts': '/assets/confectionery_groundnuts.jpg',
  'media-prod-soya': '/assets/commercial_soybeans.jpg',
  'media-prod-soybeans': '/assets/commercial_soybeans.jpg',
  'media-proj-irrigation': 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=1600&auto=format&fit=crop',
  'media-proj-orchards': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1600&auto=format&fit=crop',
  'media-proj-horticulture': 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1600&auto=format&fit=crop',
  'media-proj-poultry': 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=1600&auto=format&fit=crop',
  'media-proj-livestock': 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=1600&auto=format&fit=crop',
  'media-proj-infrastructure': 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=1600&auto=format&fit=crop',
};

/**
 * Returns a guaranteed valid, relevant image URL for any project
 */
export function getProjectImageUrl(project: { id: string; imageSlotId?: string }): string {
  const matched = PROJECT_IMAGE_MAP[project.id];
  if (matched) return matched.url;
  if (project.imageSlotId && DEFAULT_SLOT_IMAGE_MAP[project.imageSlotId]) {
    return DEFAULT_SLOT_IMAGE_MAP[project.imageSlotId];
  }
  return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop';
}

/**
 * Returns a guaranteed valid, relevant alt text for any project
 */
export function getProjectImageAlt(project: { id: string; title: string }): string {
  const matched = PROJECT_IMAGE_MAP[project.id];
  if (matched) return matched.alt;
  return `${project.title} - Strategic Agricultural Development Project at Dzinopona Farms`;
}

/**
 * Returns a guaranteed valid, relevant image URL for any operation
 */
export function getOperationImageUrl(operation: { id: string; imageSlotId?: string; primaryImageUrl?: string }): string {
  if (operation.primaryImageUrl && !operation.primaryImageUrl.includes('.webp')) {
    return operation.primaryImageUrl;
  }
  const matched = OPERATION_IMAGE_MAP[operation.id];
  if (matched) return matched.url;
  if (operation.imageSlotId && DEFAULT_SLOT_IMAGE_MAP[operation.imageSlotId]) {
    return DEFAULT_SLOT_IMAGE_MAP[operation.imageSlotId];
  }
  return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop';
}
