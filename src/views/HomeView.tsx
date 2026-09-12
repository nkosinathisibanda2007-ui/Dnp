import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Sprout,
  ShieldCheck,
  TrendingUp,
  Droplets,
  Layers,
  Sparkles,
  MapPin,
  ChevronRight,
  Trees,
  Compass,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { MediaFrame } from '../components/MediaFrame';
import { ZimbabweMap } from '../components/ZimbabweMap';
import { HarvestVideoShowcase } from '../components/HarvestVideoShowcase';
import { VideoCinemaModal } from '../components/VideoCinemaModal';
import { GrainParticleCanvas } from '../components/GrainParticleCanvas';
import { DzinoponaLogo } from '../components/DzinoponaLogo';
import { HeroBackgroundSlider } from '../components/HeroBackgroundSlider';

export const HomeView: React.FC = () => {
  const { data, setActiveRoute, openEnquiryModal } = useCms();
  const [isCinemaOpen, setIsCinemaOpen] = useState(false);

  const featuredOperations = data.operations.filter((op) => op.featuredOnHome);
  const featuredProducts = data.products.slice(0, 6);
  const featuredProjects = data.projects.slice(0, 3);

  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      {/* 1. HERO SECTION WITH BAHS-STYLE BACKGROUND IMAGE SLIDESHOW (5-SEC INTERVAL) */}
      <section className="relative w-full overflow-hidden border-b border-[#283d2d] shadow-xl">
        <HeroBackgroundSlider intervalMs={5000}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl lg:max-w-4xl space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <DzinoponaLogo size="sm" variant="emblem" />
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[#f5d061] text-xs font-semibold tracking-wider uppercase shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#e5a952] animate-pulse" />
                  <span>Modern Zimbabwean Agricultural Enterprise</span>
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-serif font-bold text-white tracking-tight leading-[1.08] drop-shadow-md">
                  {data.settings.companyName}
                </h1>
                <p className="text-xl sm:text-2xl xl:text-3xl font-serif text-[#e5a952] font-medium leading-snug drop-shadow-xs">
                  {data.settings.tagline}
                </p>
              </div>

              <p className="text-sm sm:text-base lg:text-lg text-[#d8e5d9] leading-relaxed max-w-2xl drop-shadow-xs">
                A forward-thinking agricultural enterprise operating across Norton, Mvuma, Esigodini, and Ntabazinduna. We develop high-yield cereal and horticultural crops, pedigreed livestock, certified nursery stock, and modern irrigation infrastructure to build enduring agricultural value across Zimbabwe.
              </p>

              {/* Primary Actions */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveRoute('operations')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#b57a2c] hover:bg-[#c68936] text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <span>Explore Our Operations</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>

                <button
                  type="button"
                  onClick={() => openEnquiryModal('partnership', 'Commercial Off-Take & Partnership')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 text-sm font-semibold rounded-lg backdrop-blur-sm transition-all cursor-pointer"
                >
                  <span>Let's Work Together</span>
                  <ArrowUpRight className="w-4 h-4 text-[#f5d061]" />
                </button>
              </div>

              {/* Verified Facts Ticker */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/15 max-w-3xl">
                <div className="p-3 rounded-lg bg-black/25 border border-white/10 backdrop-blur-xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#e5a952] block">Hubs</span>
                  <span className="text-base font-serif font-bold text-white">4 Strategic</span>
                  <span className="text-[11px] text-[#a8bba9] block">Across Zimbabwe</span>
                </div>
                <div className="p-3 rounded-lg bg-black/25 border border-white/10 backdrop-blur-xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#e5a952] block">Disciplines</span>
                  <span className="text-base font-serif font-bold text-white">11 Integrated</span>
                  <span className="text-[11px] text-[#a8bba9] block">Crops to Livestock</span>
                </div>
                <div className="p-3 rounded-lg bg-black/25 border border-white/10 backdrop-blur-xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#e5a952] block">Value Story</span>
                  <span className="text-base font-serif font-bold text-white">Farm to Market</span>
                  <span className="text-[11px] text-[#a8bba9] block">End-to-End Chain</span>
                </div>
                <div className="p-3 rounded-lg bg-black/25 border border-white/10 backdrop-blur-xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#e5a952] block">Entity</span>
                  <span className="text-base font-serif font-bold text-white">Pvt Limited</span>
                  <span className="text-[11px] text-[#a8bba9] block">Incorporated in ZW</span>
                </div>
              </div>
            </div>
          </div>
        </HeroBackgroundSlider>
      </section>

      {/* 2. COMPANY SNAPSHOT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-[#faf9f5] border border-[#ded8c4] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#996f2a]">
                Company Snapshot
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#152218]">
                Rooted in Zimbabwe. Built for Scale.
              </h2>
              <p className="text-xs sm:text-sm text-[#5a5241]">
                Dzinopona Farms (Private) Limited
              </p>
            </div>

            <div className="lg:col-span-8 space-y-4 text-xs sm:text-sm text-[#38443b] leading-relaxed">
              <p>
                {data.settings.about.whoWeAre}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#f2efe4] border border-[#ded7c2]">
                  <h4 className="font-serif font-bold text-sm text-[#18261b] flex items-center gap-1.5">
                    <Sprout className="w-4 h-4 text-[#8a6322]" />
                    <span>Our Commercial Vision</span>
                  </h4>
                  <p className="mt-1 text-xs text-[#524b3c] leading-normal">
                    {data.settings.about.vision}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#f2efe4] border border-[#ded7c2]">
                  <h4 className="font-serif font-bold text-sm text-[#18261b] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#8a6322]" />
                    <span>Disciplined Mission</span>
                  </h4>
                  <p className="mt-1 text-xs text-[#524b3c] leading-normal">
                    {data.settings.about.mission}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VALUE CHAIN: FROM FARM TO MARKET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#996f2a]">
            Our Agricultural Business Story
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#152218]">
            From Farm to Market
          </h2>
          <p className="text-xs sm:text-sm text-[#475249] leading-relaxed">
            Dzinopona Farms integrates every phase of the agricultural value chain. Rather than operating as an isolated raw-commodity grower, we build structured pathways connecting soil management directly to end markets.
          </p>
        </div>

        {/* Visual Pipeline Stages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {[
            {
              step: '01',
              title: 'Production',
              sub: 'Land & Agro-Ecology',
              desc: 'High-potential arable lands in Norton, grazing pastures in Mvuma, orchard valleys in Esigodini, and poultry hubs in Ntabazinduna.',
            },
            {
              step: '02',
              title: 'Management',
              sub: 'Agronomic Precision',
              desc: 'Disciplined irrigation scheduling, solar water distribution, strict biosecurity, and science-backed soil fertility management.',
            },
            {
              step: '03',
              title: 'Value Addition',
              sub: 'Post-Harvest Care',
              desc: 'On-farm grading, drying, temperature-controlled cold storage, and primary processing to capture and retain quality.',
            },
            {
              step: '04',
              title: 'Distribution',
              sub: 'Direct Market Delivery',
              desc: 'Forward contracts with commercial millers, supermarket networks, wholesale fresh markets, and institutional off-takers.',
            },
          ].map((stage, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl bg-[#faf9f5] border border-[#ded8c4] hover:border-[#1b2e20] transition-colors relative group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-bold text-[#996f2a] px-2 py-0.5 rounded bg-[#ede8d8]">
                  STAGE {stage.step}
                </span>
                <ChevronRight className="w-4 h-4 text-[#a89f89] group-hover:text-[#1b2e20] transition-colors" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#162419]">
                {stage.title}
              </h3>
              <p className="text-xs font-semibold text-[#8b6527] mt-0.5 mb-2">
                {stage.sub}
              </p>
              <p className="text-xs text-[#524b3c] leading-relaxed">
                {stage.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3.5 HARVEST & VALUE ADDITION VIDEO SHOWCASE */}
      <HarvestVideoShowcase />

      {/* 4. WHAT WE DO: FEATURED OPERATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#996f2a]">
              Comprehensive Agribusiness
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#152218] mt-1">
              What We Do
            </h2>
            <p className="text-xs sm:text-sm text-[#4d574e] mt-1 max-w-xl">
              Spanning 11 integrated operational disciplines, our enterprise leverages specialized regional conditions for maximum agronomic productivity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveRoute('operations')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1b2e20] hover:text-[#785923] underline underline-offset-4 self-start md:self-auto"
          >
            <span>View All 11 Operations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Featured Operations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredOperations.map((op) => (
            <div
              key={op.id}
              className="rounded-2xl bg-[#faf9f5] border border-[#ded8c4] overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
            >
              <div>
                <MediaFrame
                  slotId={op.imageSlotId}
                  aspectRatio="16:9"
                  caption={op.title}
                />
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-[#8b6527] bg-[#ede8d8] px-2 py-0.5 rounded">
                      {op.category.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-medium text-[#4b574d] capitalize">
                      ● {op.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-[#142217] group-hover:text-[#8b6527] transition-colors">
                    {op.title}
                  </h3>

                  <p className="text-xs sm:text-[13px] text-[#424d44] leading-relaxed line-clamp-3">
                    {op.summary}
                  </p>

                  <ul className="space-y-1.5 pt-2 border-t border-[#e8e2d2]">
                    {op.keyDetails.slice(0, 2).map((detail, dIdx) => (
                      <li key={dIdx} className="text-xs text-[#524b3c] flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#9a7029] shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="px-6 pb-5 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveRoute('operations')}
                  className="w-full py-2 text-xs font-semibold text-[#18261b] bg-[#ede8d8] hover:bg-[#ded8c4] rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <span>Read Technical Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. COMMERCIAL PRODUCTS SHOWCASE */}
      <section className="bg-[#f5f2e8] py-16 border-y border-[#ded8c4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#996f2a]">
                Commercial Catalogue
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#152218] mt-1">
                Agricultural Products
              </h2>
              <p className="text-xs sm:text-sm text-[#4d574e] mt-1 max-w-xl">
                High-grade cereals, oilseeds, fresh vegetables, certified nursery saplings, beef cattle, and poultry.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveRoute('products')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1b2e20] hover:bg-[#122016] text-[#faf9f5] text-xs font-semibold rounded-lg shadow-xs transition-all self-start md:self-auto"
            >
              <span>Explore Complete Catalogue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mandatory Availability Disclaimer Banner */}
          <div className="p-3.5 mb-8 rounded-xl bg-[#ede7d5] border border-[#d6cdb7] text-xs text-[#524a39] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#996f2a] shrink-0 mt-0.5" />
            <p>
              <strong>Production Cycles Notice:</strong> Product availability varies according to production cycles. Please contact us for current availability and bulk quota allocations.
            </p>
          </div>

          {/* Selected Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((prod) => (
              <div
                key={prod.id}
                className="rounded-xl bg-[#faf9f5] border border-[#ded8c4] p-5 flex flex-col justify-between hover:border-[#b8ae93] transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8b6527] bg-[#ede8d8] px-2 py-0.5 rounded">
                      {prod.category} • {prod.subCategory}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        prod.status === 'in_production'
                          ? 'bg-[#e4ede5] text-[#2b5934] border border-[#c3d8c6]'
                          : 'bg-[#faf0e1] text-[#85531d] border border-[#edd5b9]'
                      }`}
                    >
                      {prod.status === 'in_production' ? 'In Production' : 'Developing Activity'}
                    </span>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-[#18261b]">
                    {prod.name}
                  </h3>

                  <p className="text-xs text-[#4c564e] leading-relaxed line-clamp-2">
                    {prod.description}
                  </p>

                  <div className="text-[11px] text-[#635c4a] p-2 rounded bg-[#f3efe4] border border-[#ded7c4]">
                    <span className="font-medium text-[#18261b] block">Availability:</span>
                    {prod.availabilityNote}
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[#ded8c4] flex items-center justify-between">
                  <span className="text-[10px] text-[#7d7563]">
                    Inquire for commercial terms
                  </span>
                  <button
                    type="button"
                    onClick={() => openEnquiryModal('products', prod.name)}
                    className="text-xs font-semibold text-[#8b6527] hover:text-[#5e4215] flex items-center gap-1"
                  >
                    <span>Enquire</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. STRATEGIC LOCATIONS & ZIMBABWE MAP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#996f2a]">
            Geographic Footprint
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#152218] mt-1">
            Growing Across Zimbabwe
          </h2>
          <p className="text-xs sm:text-sm text-[#4d574e] mt-1 max-w-2xl">
            Our farming footprint spans four strategic agricultural hubs, purposefully selected to capture diverse soil profiles, seasonal rainfall patterns, and high-capacity transport corridors.
          </p>
        </div>

        <ZimbabweMap />
      </section>

      {/* 7. PROJECTS & DEVELOPMENT PIPELINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#996f2a]">
              Future Direction
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#152218] mt-1">
              Development Projects
            </h2>
            <p className="text-xs sm:text-sm text-[#4d574e] mt-1 max-w-xl">
              Clearly distinguishing established production from active development initiatives advancing our capacity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveRoute('projects')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1b2e20] hover:text-[#785923] underline underline-offset-4 self-start md:self-auto"
          >
            <span>View Full Pipeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {featuredProjects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-2xl bg-[#faf9f5] border border-[#ded8c4] p-6 flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8b6527] bg-[#ede8d8] px-2 py-0.5 rounded">
                    {proj.type}
                  </span>
                  <span className="text-[11px] font-medium text-[#18261b] px-2 py-0.5 rounded bg-[#e8ece7] border border-[#d2dbd1]">
                    {proj.phase}
                  </span>
                </div>

                <h3 className="text-xl font-serif font-bold text-[#162419]">
                  {proj.title}
                </h3>

                <span className="inline-flex items-center gap-1 text-xs text-[#715421] font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{proj.locationHub}</span>
                </span>

                <p className="text-xs text-[#454f47] leading-relaxed">
                  {proj.summary}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-[#ded8c4]">
                  <span className="text-[11px] font-semibold text-[#18261b] block">Core Objectives:</span>
                  {proj.objectives.slice(0, 2).map((obj, oIdx) => (
                    <div key={oIdx} className="text-xs text-[#524b3c] flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c48a39] mt-1.5 shrink-0" />
                      <span className="line-clamp-1">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#ded8c4]">
                <button
                  type="button"
                  onClick={() => setActiveRoute('projects')}
                  className="text-xs font-semibold text-[#18261b] hover:text-[#8b6527] flex items-center gap-1"
                >
                  <span>Project Milestones & Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. OUR APPROACH: 5 PILLARS */}
      <section className="bg-[#18271c] text-[#fbfbfa] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#d39c4a]">
              Operational Discipline
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#faf9f5]">
              Why Dzinopona / Our Approach
            </h2>
            <p className="text-xs sm:text-sm text-[#a4b4a6] leading-relaxed">
              Every hectare we manage and every animal unit we rear is governed by five non-negotiable operational principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.settings.about.fivePillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#1f3325] border border-[#2b4733] hover:border-[#d39c4a]/60 transition-colors"
              >
                <span className="font-mono text-xs font-bold text-[#d39c4a] mb-2 block">
                  0{idx + 1}
                </span>
                <h3 className="text-xl font-serif font-bold text-white">
                  {pillar.name}
                </h3>
                <p className="text-xs font-semibold text-[#e5a952] mt-0.5 mb-2">
                  {pillar.tagline}
                </p>
                <p className="text-xs text-[#a9b9ab] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}

            {/* Sixth card: Farm-to-Market Integration summary */}
            <div className="p-6 rounded-2xl bg-[#243d2c] border border-[#3b5e44] flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#e5a952] mb-2 block">
                  CORE THESIS
                </span>
                <h3 className="text-xl font-serif font-bold text-white">
                  End-to-End Value
                </h3>
                <p className="text-xs text-[#b8c9ba] mt-2 leading-relaxed">
                  Integrating production, management, value addition, and commercial distribution to create lasting value for Zimbabwe.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEnquiryModal('partnership', 'Strategic Partnership')}
                className="mt-6 py-2.5 px-4 bg-[#b57a2c] hover:bg-[#c68936] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors text-center"
              >
                Partner with Our Operations
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. STRONG FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#1b2e20] to-[#122016] text-[#faf9f5] p-8 sm:p-14 border border-[#2c4733] shadow-xl relative overflow-hidden">
          {/* Subtle architectural contour backdrop */}
          <div className="absolute inset-0 bg-subtle-lines opacity-10 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#e5a952]">
                Commercial Engagement
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
                Let's Grow Together.
              </h2>
              <p className="text-sm sm:text-base text-[#b1c3b4] leading-relaxed max-w-2xl">
                Whether you are an agricultural off-taker seeking reliable bulk commodity supply, a landowner exploring contract farming management, or a commercial partner, Dzinopona Farms welcomes collaborative engagement.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => openEnquiryModal('products', 'Commercial Off-Take Allocation')}
                  className="px-6 py-3.5 bg-[#b57a2c] hover:bg-[#c68936] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Reserve Commercial Quota
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRoute('contact')}
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/20 transition-all cursor-pointer"
                >
                  Direct Contact Desk
                </button>
              </div>

              <div className="pt-6 border-t border-white/10 text-xs text-[#899f8c] flex flex-wrap items-center gap-4">
                <span>✓ Certified & Traceable Production</span>
                <span>•</span>
                <span>✓ Strategic Hubs: Norton, Mvuma, Esigodini, Ntabazinduna</span>
                <span>•</span>
                <span>✓ Private Limited Company in Zimbabwe</span>
              </div>
            </div>

            {/* Official Seal Medallion Display */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
              <DzinoponaLogo size="hero" variant="emblem" />
              <div className="space-y-1">
                <span className="font-serif font-bold text-base text-[#e5a952] block tracking-wide">
                  DZINOPONA FARMS
                </span>
                <span className="text-[11px] uppercase tracking-widest text-[#a8bba9] block">
                  Private Limited Company • Zimbabwe
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cinema Modal */}
      <VideoCinemaModal
        isOpen={isCinemaOpen}
        onClose={() => setIsCinemaOpen(false)}
        videoUrl="/assets/maize_harvest_video.mp4"
        posterUrl="/assets/maize_harvest_sheller_1789075425641.jpg"
      />
    </div>
  );
};
