import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Sprout,
  ShieldCheck,
  MapPin,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { DzinoponaLogo } from '../components/DzinoponaLogo';
import { HeroBackgroundSlider } from '../components/HeroBackgroundSlider';
import {
  FRESH_HARVEST_SHOWCASE,
  getOperationImageUrl,
  PRODUCT_IMAGE_MAP,
} from '../utils/imageAssets';

export const HomeView: React.FC = () => {
  const { data, setActiveRoute, openEnquiryModal } = useCms();

  // Selected operation for the single featured operation card in "What We Do"
  const [selectedOpIndex, setSelectedOpIndex] = useState(0);

  // Operations list (live from CMS)
  const operations = data.operations && data.operations.length > 0 ? data.operations : [];
  const activeOp = operations[selectedOpIndex] || operations[0];

  // Locations list (live from CMS)
  const locations = data.locations && data.locations.length > 0 ? data.locations : [];

  // Projects list (live from CMS)
  const projects = data.projects && data.projects.length > 0 ? data.projects.slice(0, 3) : [];

  return (
    <div className="bg-[#fcfdf9] text-[#19392c] selection:bg-[#d9ed99] selection:text-[#123c2e] min-h-screen">
      {/* 1. HERO SECTION: LIGHT SUNLIT FARM FLOW (NO BOX, NO DARK SCRIMS) */}
      <section className="relative w-full overflow-hidden border-b border-[#d5ddcf]">
        <HeroBackgroundSlider intervalMs={5000}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 sm:py-16">
            <div className="max-w-3xl lg:max-w-4xl space-y-6">
              {/* Eyebrow kicker */}
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-[#8b6527]" />
                <span className="text-xs sm:text-[13px] font-semibold tracking-widest uppercase text-[#8b6527]">
                  Growing with Purpose. Rooted in Zimbabwe.
                </span>
              </div>

              {/* Main Display Headline */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl xl:text-7xl font-serif font-normal text-[#123c2e] tracking-tight leading-[1.05]">
                  Rooted in our land.<br />
                  <em className="italic font-serif text-[#8b6527]">Growing our future.</em>
                </h1>
              </div>

              {/* Editorial Subtitle / Story */}
              <p className="text-base sm:text-lg lg:text-xl text-[#2d4033] leading-relaxed max-w-2xl font-normal">
                Four farms. One shared vision. Building an enduring agricultural future that connects high-yield crop cultivation, pedigreed livestock, certified nurseries, and precision irrigation directly to markets.
              </p>

              {/* Primary Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveRoute('operations')}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#123c2e] hover:bg-[#1b4e3c] text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>Explore Our Operations</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>

                <button
                  type="button"
                  onClick={() => openEnquiryModal('partnership', 'Commercial Off-Take & Partnership')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/90 hover:bg-white text-[#123c2e] text-sm font-semibold rounded-full shadow-xs transition-all cursor-pointer"
                >
                  <span>Let's Work Together</span>
                  <ArrowUpRight className="w-4 h-4 text-[#8b6527]" />
                </button>
              </div>

              {/* 4 Farms Ticker Pill on Hero */}
              <div className="pt-4 flex flex-wrap items-center gap-3 text-xs text-[#5f6d62]">
                <span className="font-semibold text-[#123c2e] uppercase tracking-wider">Strategic Hubs:</span>
                <span className="px-3 py-1 rounded-full bg-white/85 text-[#19392c] shadow-2xs">Norton</span>
                <span className="px-3 py-1 rounded-full bg-white/85 text-[#19392c] shadow-2xs">Mvuma</span>
                <span className="px-3 py-1 rounded-full bg-white/85 text-[#19392c] shadow-2xs">Esigodini</span>
                <span className="px-3 py-1 rounded-full bg-white/85 text-[#19392c] shadow-2xs">Ntabazinduna</span>
              </div>
            </div>
          </div>
        </HeroBackgroundSlider>

        {/* Bottom Hero Ticker */}
        <div className="bg-[#f7f9f2] py-3.5 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-semibold tracking-wider text-[#5f6d62] uppercase">
            <span>Dzinopona Farms · Zimbabwe</span>
            <button
              type="button"
              onClick={() => setActiveRoute('about')}
              className="inline-flex items-center gap-1.5 hover:text-[#123c2e] transition-colors cursor-pointer"
            >
              <span>Discover Our Story</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. SECTION 02: WHAT WE DO — SHOW ONLY ONE OPERATION */}
      <section className="bg-[#f7f9f2] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#8b6527]">
                Comprehensive Agribusiness
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#123c2e]">
                What We Do
              </h2>
              <p className="text-sm sm:text-base text-[#384d3e] max-w-2xl leading-relaxed">
                Spanning 11 integrated operational disciplines, our enterprise leverages specialized regional conditions for maximum agronomic productivity.
              </p>
            </div>

            {/* View All 11 Operations link */}
            <button
              type="button"
              onClick={() => setActiveRoute('operations')}
              className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-[#123c2e] hover:text-[#8b6527] underline underline-offset-4 self-start md:self-auto cursor-pointer"
            >
              <span>View All 11 Operations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick discipline switcher chips */}
          {operations.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5f6d62] shrink-0 mr-1">
                Featured Spotlight:
              </span>
              {operations.map((op, idx) => {
                const isSelected = idx === selectedOpIndex;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setSelectedOpIndex(idx)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#123c2e] text-white shadow-xs'
                        : 'bg-white hover:bg-[#eef3e6] text-[#384d3e] shadow-2xs'
                    }`}
                  >
                    {op.title}
                  </button>
                );
              })}
            </div>
          )}

          {/* SINGLE FEATURED OPERATION CARD */}
          {activeOp && (
            <div className="max-w-4xl mx-auto rounded-3xl bg-white shadow-sm overflow-hidden group">
              {/* Photo with category pill badge at bottom left */}
              <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-[#e6eddf]">
                <img
                  src={getOperationImageUrl(activeOp)}
                  alt={activeOp.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-semibold tracking-wide">
                    {activeOp.title}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-md bg-[#f0f3e9] text-[#8b6527] text-xs font-semibold uppercase tracking-wider">
                    {activeOp.category ? activeOp.category.replace('_', ' ') : 'Agribusiness'}
                  </span>
                  <span className="text-xs font-medium text-[#384d3e] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2b7a37]" />
                    <span className="capitalize">{activeOp.status || 'Active'}</span>
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#123c2e]">
                  {activeOp.title}
                </h3>

                <p className="text-sm sm:text-base text-[#384d3e] leading-relaxed">
                  {activeOp.summary}
                </p>

                {/* Key Details checkmarks list */}
                {activeOp.keyDetails && activeOp.keyDetails.length > 0 && (
                  <ul className="space-y-2 pt-2 border-t border-[#f0f4ea]">
                    {activeOp.keyDetails.slice(0, 3).map((detail, dIdx) => (
                      <li key={dIdx} className="text-xs sm:text-sm text-[#384d3e] flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#8b6527] shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Action button */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#f0f4ea]">
                  <button
                    type="button"
                    onClick={() => setActiveRoute('operations')}
                    className="w-full sm:w-auto px-6 py-3 bg-[#f0f3e9] hover:bg-[#e4ebdc] text-[#123c2e] text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Read Technical Details</span>
                    <ChevronRight className="w-4 h-4 text-[#8b6527]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveRoute('operations')}
                    className="text-xs font-semibold text-[#8b6527] hover:text-[#123c2e] underline underline-offset-4 text-center cursor-pointer"
                  >
                    View all 11 operations catalogue →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. SECTION 03: FROM OUR FARMS (Inspiration from reference site Section 4) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Photo */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-sm bg-[#f0f3e9]">
              <img
                src={FRESH_HARVEST_SHOWCASE.url}
                alt={FRESH_HARVEST_SHOWCASE.alt}
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover object-center aspect-[16/10]"
                loading="lazy"
              />
              <div className="p-3 bg-white/95 text-xs text-[#5f6d62] flex items-center justify-between">
                <span className="font-semibold text-[#123c2e]">{FRESH_HARVEST_SHOWCASE.caption}</span>
                <span className="text-[#8b6527] font-medium">Commercial Grade</span>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8b6527]">
              03 / From Our Farms
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#123c2e] leading-[1.12]">
              Fresh from the soil.<br />
              <em className="italic text-[#8b6527]">Full of possibility.</em>
            </h2>

            <p className="text-sm sm:text-base text-[#384d3e] leading-relaxed">
              From staple cereals and vegetables to certified nursery saplings, beef cattle, poultry, and pasture baling — explore the comprehensive range at the heart of our commercial farming enterprise.
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-[#f0f3e9] text-[#123c2e] text-xs font-medium">
                Cereals & Oilseeds
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[#f0f3e9] text-[#123c2e] text-xs font-medium">
                Vegetables & Herbs
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[#f0f3e9] text-[#123c2e] text-xs font-medium">
                Nursery Plants & Orchards
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[#f0f3e9] text-[#123c2e] text-xs font-medium">
                Livestock & Poultry
              </span>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setActiveRoute('products')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#123c2e] hover:bg-[#1b4e3c] text-white text-sm font-semibold rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <span>Explore our products</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>

            <p className="text-xs text-[#5f6d62] leading-relaxed">
              Availability follows our production cycles.<br />
              Enquire with our team for the latest quota allocations.
            </p>
          </div>
        </div>

        {/* AUTHENTIC TWIST: 4-PORTFOLIO VISUAL SHOWCASE */}
        <div className="mt-16 pt-12 border-t border-[#ecefe6]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8b6527]">
              Commercial Portfolios
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-[#123c2e] mt-2">
              Production Sectors at Dzinopona Farms
            </h3>
            <p className="text-xs sm:text-sm text-[#5f6d62] mt-2">
              Explore our core agricultural branches operating under strict biosecurity and agronomic quality standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sector 1: Cereals & Grains */}
            <div
              onClick={() => setActiveRoute('products')}
              className="group cursor-pointer rounded-2xl bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#e6eddf]">
                <img
                  src={PRODUCT_IMAGE_MAP['prod-maize']?.url || 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=1200&auto=format&fit=crop'}
                  alt="Commercial Grains and Cereals at Dzinopona Farms"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[#123c2e] text-[11px] font-semibold shadow-2xs">
                  Crops
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#123c2e] group-hover:text-[#8b6527] transition-colors">
                    Commercial Grains & Cereals
                  </h4>
                  <p className="text-xs text-[#5f6d62] mt-1 leading-relaxed">
                    White & yellow maize, winter milling wheat, and hardy sorghum for commercial millers and feed producers.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8b6527] group-hover:translate-x-1 transition-transform">
                  View products <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Sector 2: Fresh Market Horticulture */}
            <div
              onClick={() => setActiveRoute('products')}
              className="group cursor-pointer rounded-2xl bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#e6eddf]">
                <img
                  src={PRODUCT_IMAGE_MAP['prod-tomatoes']?.url || 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=1200&auto=format&fit=crop'}
                  alt="Fresh Market Horticulture at Dzinopona Farms"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[#123c2e] text-[11px] font-semibold shadow-2xs">
                  Horticulture
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#123c2e] group-hover:text-[#8b6527] transition-colors">
                    Fresh Market Horticulture
                  </h4>
                  <p className="text-xs text-[#5f6d62] mt-1 leading-relaxed">
                    Irrigated table tomatoes, cabbages, cured onions, and culinary herbs harvested on continuous weekly cycles.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8b6527] group-hover:translate-x-1 transition-transform">
                  View products <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Sector 3: Tree Nurseries & Orchards */}
            <div
              onClick={() => setActiveRoute('products')}
              className="group cursor-pointer rounded-2xl bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#e6eddf]">
                <img
                  src={PRODUCT_IMAGE_MAP['prod-nursery-macadamia']?.url || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1200&auto=format&fit=crop'}
                  alt="Certified Nursery and Orchards at Dzinopona Farms"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[#123c2e] text-[11px] font-semibold shadow-2xs">
                  Nursery
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#123c2e] group-hover:text-[#8b6527] transition-colors">
                    Certified Nurseries & Orchards
                  </h4>
                  <p className="text-xs text-[#5f6d62] mt-1 leading-relaxed">
                    Certified Beaumont macadamia, grafted citrus, and export Hass avocado seedlings bred for commercial orchardists.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8b6527] group-hover:translate-x-1 transition-transform">
                  View products <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Sector 4: Livestock & Poultry */}
            <div
              onClick={() => setActiveRoute('products')}
              className="group cursor-pointer rounded-2xl bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#e6eddf]">
                <img
                  src={PRODUCT_IMAGE_MAP['prod-beef-cattle']?.url || 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=1200&auto=format&fit=crop'}
                  alt="Pedigreed Livestock and Poultry at Dzinopona Farms"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[#123c2e] text-[11px] font-semibold shadow-2xs">
                  Livestock
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#123c2e] group-hover:text-[#8b6527] transition-colors">
                    Livestock & Poultry
                  </h4>
                  <p className="text-xs text-[#5f6d62] mt-1 leading-relaxed">
                    Hardy commercial beef cattle, indigenous roadrunner chickens, farm table eggs, and nutrient-rich Rhodes grass bales.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8b6527] group-hover:translate-x-1 transition-transform">
                  View products <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION 04: OUR INTEGRATED APPROACH (Inspiration from reference site Section 5) */}
      <section className="bg-[#f7f9f2] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#8b6527]">
                04 / Our Integrated Approach
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#123c2e] mt-2">
                More connected.<br />
                <em className="italic text-[#8b6527]">More possibility.</em>
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#384d3e] max-w-md">
              A long-term vision that connects what we grow with the value it can create across Zimbabwe.
            </p>
          </div>

          {/* 3 Step Connected Path */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#f0f3e9] flex items-center justify-center font-mono font-bold text-sm text-[#8b6527]">
                01
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8b6527] block">
                The Foundation
              </span>
              <h3 className="text-xl font-serif font-bold text-[#123c2e]">
                Grow & raise
              </h3>
              <p className="text-xs sm:text-sm text-[#384d3e] leading-relaxed">
                Staple crops, high-value horticulture, certified nursery fruit trees, pedigreed livestock and commercial poultry.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#f0f3e9] flex items-center justify-center font-mono font-bold text-sm text-[#8b6527]">
                02
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8b6527] block">
                Future Development
              </span>
              <h3 className="text-xl font-serif font-bold text-[#123c2e]">
                Process & add value
              </h3>
              <p className="text-xs sm:text-sm text-[#384d3e] leading-relaxed">
                Post-harvest drying, sorting, cold-chain storage, and packaging to capture maximum value on Zimbabwean soil.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#f0f3e9] flex items-center justify-center font-mono font-bold text-sm text-[#8b6527]">
                03
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8b6527] block">
                The Connection
              </span>
              <h3 className="text-xl font-serif font-bold text-[#123c2e]">
                Reach the market
              </h3>
              <p className="text-xs sm:text-sm text-[#384d3e] leading-relaxed">
                Long-term commercial supply arrangements with millers, retail supermarkets, regional wholesalers, and export networks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION 05: OUR ROOTS (Inspiration from reference site Section 6) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8b6527]">
              05 / Our Roots
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#123c2e] mt-2">
              Zimbabwean land.<br />
              <em className="italic text-[#8b6527]">A shared future.</em>
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#384d3e] max-w-md">
            Four locations. A common purpose.<br />
            Explore the farms behind Dzinopana.
          </p>
        </div>

        {/* 4 Locations Rows — Dynamically synchronized with CMS Admin locations */}
        <div className="divide-y divide-[#ecefe6]">
          {(data.locations && data.locations.length > 0
            ? data.locations
            : [
                { id: 'loc-norton', name: 'Norton', province: 'Mashonaland West', primaryFocus: ['Cereals, Oilseeds & Center-Pivot Irrigation'] },
                { id: 'loc-mvuma', name: 'Mvuma', province: 'Midlands', primaryFocus: ['Pedigreed Livestock, Grazing Rangelands & Hay'] },
                { id: 'loc-esigodini', name: 'Esigodini', province: 'Matabeleland South', primaryFocus: ['High-Value Orchards, Nurseries & Water Reservoirs'] },
                { id: 'loc-ntabazinduna', name: 'Ntabazinduna', province: 'Matabeleland North', primaryFocus: ['Poultry, Controlled Environment & Distribution'] },
              ]
          ).map((loc, idx) => {
            const focusText = Array.isArray(loc.primaryFocus)
              ? loc.primaryFocus.join(' • ')
              : (loc as any).focus || '';
            const num = String(idx + 1).padStart(2, '0');

            return (
              <div
                key={loc.id || idx}
                onClick={() => setActiveRoute('locations')}
                className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#f7f9f2] px-4 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-6">
                  <span className="font-mono text-sm font-bold text-[#8b6527]">{num}</span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#123c2e] group-hover:text-[#8b6527] transition-colors">
                      {loc.name}
                    </h3>
                    <span className="text-xs text-[#5f6d62]">{loc.province} • {focusText}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#123c2e] group-hover:text-[#8b6527] transition-colors self-start sm:self-auto">
                  <span>View farm details</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold tracking-wider text-[#5f6d62] uppercase">
          <span>Proudly Zimbabwean</span>
          <button
            type="button"
            onClick={() => setActiveRoute('locations')}
            className="inline-flex items-center gap-2 text-[#123c2e] hover:text-[#8b6527] cursor-pointer"
          >
            <span>Meet our farms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 8. SECTION 06: BUILDING WHAT COMES NEXT (Inspiration from reference site Section 7) */}
      <section className="bg-[#f7f9f2] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#8b6527]">
                06 / Building What Comes Next
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#123c2e]">
                Tomorrow starts<br />
                <em className="italic text-[#8b6527]">with today.</em>
              </h2>
              <p className="text-sm sm:text-base text-[#384d3e] leading-relaxed">
                We’re progressively developing the water systems, facilities, and infrastructure that support a diversified, resilient agricultural business across Zimbabwe.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveRoute('projects')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#123c2e] hover:text-[#8b6527] underline underline-offset-4 cursor-pointer"
                >
                  <span>See our development projects</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3 Project Lines */}
            <div className="lg:col-span-7 divide-y divide-[#ecefe6]">
              {[
                { num: '01', title: 'Irrigation & water infrastructure', desc: 'Center pivots, solar pump arrays & multi-hectare reservoir storage' },
                { num: '02', title: 'Commercial orchard development', desc: 'Citrus, Macadamia & Avocado parent-block propagation' },
                { num: '03', title: 'Farm facilities & cold storage', desc: 'Secure grain warehousing, livestock handling & temperature-controlled packing' },
              ].map((proj) => (
                <div
                  key={proj.num}
                  onClick={() => setActiveRoute('projects')}
                  className="py-5 flex items-center justify-between gap-4 hover:bg-white px-4 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-bold text-[#8b6527]">{proj.num}</span>
                    <div>
                      <h4 className="text-base sm:text-lg font-serif font-bold text-[#123c2e] group-hover:text-[#8b6527] transition-colors">
                        {proj.title}
                      </h4>
                      <p className="text-xs text-[#5f6d62]">{proj.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#5f6d62] group-hover:text-[#123c2e] shrink-0 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
