import React from 'react';
import { ShieldCheck, Target, Award, Compass, Sprout, ArrowUpRight, CheckCircle2, Building2 } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { MediaFrame } from '../components/MediaFrame';
import { DzinoponaLogo } from '../components/DzinoponaLogo';

export const AboutView: React.FC = () => {
  const { data, openEnquiryModal, setActiveRoute } = useCms();
  const { about, legalName, companyName } = data.settings;

  return (
    <div className="space-y-20 sm:space-y-28 pb-24">
      {/* 1. Header Banner */}
      <section className="pt-12 sm:pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#ede8d8] text-[#785923] text-xs font-semibold tracking-wider uppercase">
            <span>Enterprise Background</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#142217] tracking-tight">
            About Dzinopona Farms
          </h1>
          <p className="text-lg text-[#554e3d] font-serif">
            A modern Zimbabwean agribusiness bridging agronomic science, land stewardship, and integrated value chains.
          </p>
        </div>
      </section>

      {/* 2. Who We Are & Heritage */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#996f2a]">
              Who We Are
            </span>
            <h2 className="text-3xl font-serif font-bold text-[#152218]">
              Pioneering Productive & Resilient Farming
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-[#3a443c] leading-relaxed">
              <p>{about.whoWeAre}</p>
              <p>{about.companyBackground}</p>
            </div>

            <div className="pt-2 flex items-center gap-4 text-xs font-medium text-[#18261b]">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#996f2a]" />
                <span>{legalName}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#996f2a]" />
                <span>Registered in Zimbabwe</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <MediaFrame
              slotId="media-hero-main"
              aspectRatio="4:3"
              className="shadow-xl"
              badgeText="Corporate Heritage"
              caption="Sustainable land stewardship across Zimbabwe's diverse agro-ecological regions"
            />
          </div>
        </div>
      </section>

      {/* 3. Vision & Mission Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 sm:p-10 rounded-2xl bg-[#faf9f5] border border-[#ded8c4] space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#ede8d8] flex items-center justify-center text-[#785923]">
              <Target className="w-6 h-6 text-[#9a7029]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#996f2a]">
              Our Vision
            </span>
            <h3 className="text-2xl font-serif font-bold text-[#142217]">
              National Benchmark in Agribusiness
            </h3>
            <p className="text-xs sm:text-sm text-[#475249] leading-relaxed">
              {about.vision}
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-2xl bg-[#faf9f5] border border-[#ded8c4] space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#ede8d8] flex items-center justify-center text-[#785923]">
              <Sprout className="w-6 h-6 text-[#9a7029]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#996f2a]">
              Our Mission
            </span>
            <h3 className="text-2xl font-serif font-bold text-[#142217]">
              Disciplined Cultivation & Value Creation
            </h3>
            <p className="text-xs sm:text-sm text-[#475249] leading-relaxed">
              {about.mission}
            </p>
          </div>
        </div>
      </section>

      {/* 3.5 OFFICIAL BRAND SEAL & CORPORATE INSIGNIA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0f1a11] text-[#f7f5ef] border border-[#273d2b] p-8 sm:p-12 shadow-xl overflow-hidden relative">
          {/* Subtle background glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#d4af37]/10 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Seal Display */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-black/40 border border-[#d4af37]/30 shadow-2xl text-center space-y-4">
              <DzinoponaLogo size="hero" variant="emblem" />
              <div className="space-y-1">
                <span className="font-serif font-bold text-lg text-[#e5a952] block tracking-wide">
                  DZINOPONA FARMS
                </span>
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#a3b8a6] block">
                  Private Limited Company
                </span>
                <span className="inline-block mt-2 text-[10px] px-2.5 py-1 rounded-full bg-[#e5a952]/15 text-[#f3ca54] border border-[#e5a952]/30 font-mono">
                  Official Corporate Seal
                </span>
              </div>
            </div>

            {/* Seal Heraldry & Narrative */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#e5a952]">
                  Brand Identity & Heraldry
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                  The Official Dzinopona Emblem
                </h2>
                <p className="text-sm text-[#b1c3b4] mt-2 leading-relaxed">
                  Our emblem reflects the deep synergy between Zimbabwean land, resilient climatic energy, and disciplined agricultural cultivation. Every line in the medallion embodies our operational mandate:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <h4 className="font-serif font-bold text-sm text-[#e5a952] flex items-center gap-2">
                    <span>1. 'DF' Monogram & Arched Titles</span>
                  </h4>
                  <p className="text-xs text-[#a9bcae] leading-relaxed">
                    Clear legal representation of Dzinopona Farms Private Limited, embodying trust, institutional governance, and direct accountability.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <h4 className="font-serif font-bold text-sm text-[#e5a952] flex items-center gap-2">
                    <span>2. The Rising Sun & Peaks</span>
                  </h4>
                  <p className="text-xs text-[#a9bcae] leading-relaxed">
                    Celebrating Zimbabwe's plentiful solar radiation and majestic topography that define our diverse agro-ecological farming zones.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <h4 className="font-serif font-bold text-sm text-[#e5a952] flex items-center gap-2">
                    <span>3. Furrowed Agricultural Lands</span>
                  </h4>
                  <p className="text-xs text-[#a9bcae] leading-relaxed">
                    Precision land contouring, conservation tillage, and disciplined soil stewardship across our commercial hectares.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <h4 className="font-serif font-bold text-sm text-[#e5a952] flex items-center gap-2">
                    <span>4. Triple Golden Grain Ears</span>
                  </h4>
                  <p className="text-xs text-[#a9bcae] leading-relaxed">
                    The golden harvest of maize, wheat, and cereal grains—representing fertility, seed vitality, and national food security.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="/assets/dzinopona_farms_logo.jpg"
                  download="dzinopona_farms_logo.jpg"
                  className="px-4 py-2 bg-[#b57a2c] hover:bg-[#c68936] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Download High-Res Emblem (JPG)</span>
                </a>
                <a
                  href="/favicon.svg"
                  download="dzinopona_farms_logo.svg"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-all flex items-center gap-2"
                >
                  <span>Download Vector Icon (SVG)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The 5 Pillars: Our Approach */}
      <section className="bg-[#f5f2e8] py-16 border-y border-[#ded8c4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#996f2a]">
              Strategic Foundations
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#152218]">
              Our Five Operational Pillars
            </h2>
            <p className="text-xs sm:text-sm text-[#505a51]">
              The core principles ensuring consistency, environmental safety, and commercial rigor across all farming hubs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {about.fivePillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#faf9f5] border border-[#ded8c4] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#996f2a] px-2 py-0.5 rounded bg-[#ede8d8]">
                    PILLAR 0{idx + 1}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#785923]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#142217]">
                  {pillar.name}
                </h3>
                <p className="text-xs font-semibold text-[#8b6527]">
                  {pillar.tagline}
                </p>
                <p className="text-xs text-[#454f47] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Corporate Values & Biosecurity Commitment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-[#1a2d1f] text-[#fbfbfa] border border-[#2b4731]">
          <div className="max-w-3xl space-y-3 mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#e5a952]">
              Corporate Governance
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Institutional Values & Biosecurity
            </h2>
            <p className="text-xs sm:text-sm text-[#a4b4a6] leading-relaxed">
              We operate under transparent commercial agreements with institutional off-takers and adhere to strict veterinary and phytosanitary controls across all locations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {about.corporateValues.map((val, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-[#233827] border border-[#34523a] space-y-2">
                <span className="text-xs font-bold text-[#e5a952] block">0{idx + 1}</span>
                <h4 className="font-serif font-bold text-base text-white">{val.title}</h4>
                <p className="text-xs text-[#9eb1a0] leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>

          <div className="pt-10 mt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-[#829984]">
              <span>Ready to explore our operational capabilities?</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveRoute('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-all"
              >
                Explore Operations
              </button>
              <button
                type="button"
                onClick={() => openEnquiryModal('partnership', 'About Us Partnership Discussion')}
                className="px-5 py-2 bg-[#b57a2c] hover:bg-[#c68936] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Partner With Us</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
