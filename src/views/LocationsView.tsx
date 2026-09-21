import React from 'react';
import { MapPin, ExternalLink, ShieldCheck, Compass, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { ZimbabweMap } from '../components/ZimbabweMap';
import { MediaFrame } from '../components/MediaFrame';

export const LocationsView: React.FC = () => {
  const { data, openEnquiryModal } = useCms();

  return (
    <div className="space-y-16 sm:space-y-24 pb-24">
      {/* Header */}
      <section className="pt-12 sm:pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ede8d8] text-[#785923] text-xs font-semibold tracking-wider uppercase">
            <span>National Operational Footprint</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#142217] tracking-tight">
            Farming Locations Across Zimbabwe
          </h1>
          <p className="text-sm sm:text-base text-[#475249] leading-relaxed">
            Dzinopona Farms strategically operates across multiple agro-ecological regions of Zimbabwe—leveraging the distinct soil chemistry, rainfall regimes, and transport corridors of Norton, Mvuma, Esigodini, and Ntabazinduna.
          </p>
        </div>

        {/* Legal & Data Integrity Banner */}
        <div className="mt-8 p-4 rounded-2xl bg-[#f2eee1] text-xs sm:text-sm text-[#473f30] flex items-start gap-3 shadow-2xs">
          <ShieldCheck className="w-5 h-5 text-[#996f2a] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#18261b] block">Confirmed Regional Hub Placement</span>
            <p className="leading-relaxed">
              We do not publish unverified exact farm gate coordinates. The locations shown reflect official regional agricultural hubs. Exact surveyed farm perimeter boundaries and GPS coordinates are managed through the CMS and provided to accredited partners upon commercial verification.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Map Component */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ZimbabweMap />
      </section>

      {/* Deep Location Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="pb-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#152218]">
            Hub Profiles & Agronomic Specialization
          </h2>
          <p className="text-xs sm:text-sm text-[#505951] mt-1">
            Comprehensive breakdown of each location's agro-ecological characteristics, primary crops, and infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.locations.map((loc) => (
            <div
              key={loc.id}
              className="rounded-2xl bg-white shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all space-y-4"
            >
              <div>
                <MediaFrame
                  slotId={loc.imageSlotId}
                  aspectRatio="16:9"
                  caption={`${loc.name} Hub • ${loc.province}`}
                  badgeText="Strategic Hub"
                />

                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8b6527] bg-[#ede8d8] px-2.5 py-0.5 rounded">
                      {loc.province}
                    </span>
                    <span className="text-[11px] font-mono text-[#6d6451]">
                      {loc.coordinates.lat.toFixed(2)}°, {loc.coordinates.lng.toFixed(2)}°
                    </span>
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-[#142217]">
                    {loc.name} Farming Hub
                  </h3>

                  <div className="p-2.5 rounded-lg bg-[#f6f3eb] text-xs font-medium text-[#5c4e33]">
                    {loc.agroEcologicalZone}
                  </div>

                  <p className="text-xs sm:text-sm text-[#38443b] leading-relaxed">
                    {loc.summary}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-[#f0ebe0]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#18261b] block">
                      Primary Cultivation & Rearing Focus:
                    </span>
                    <ul className="space-y-1.5">
                      {loc.primaryFocus.map((focus, fIdx) => (
                        <li key={fIdx} className="text-xs text-[#454f47] flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#9a7029] shrink-0 mt-0.5" />
                          <span>{focus}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#f7f5ed] text-xs text-[#524b3c]">
                    <span className="font-semibold text-[#18261b] block mb-0.5 text-[11px] uppercase tracking-wider">
                      Infrastructure Deployed:
                    </span>
                    {loc.infrastructureOverview}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-6 sm:px-8 pb-6 pt-3 border-t border-[#f0ebe0] flex flex-wrap items-center justify-between gap-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${loc.coordinates.lat},${loc.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#7d581f] hover:text-[#523912] inline-flex items-center gap-1 font-medium underline underline-offset-4"
                >
                  <span>Google Maps Coordinates</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEnquiryModal('partnership', `${loc.name} Hub Partnership`)}
                    className="px-4 py-2 bg-[#1b2e20] hover:bg-[#122016] text-[#faf9f5] text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1"
                  >
                    <span>Enquire for {loc.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#e5a952]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
