import React from 'react';
import { MapPin, Mail, ArrowUpRight, ShieldCheck, Globe, SlidersHorizontal, Sprout } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { PageRoute } from '../types';
import { DzinoponaLogo } from './DzinoponaLogo';

export const Footer: React.FC = () => {
  const { data, setActiveRoute, setIsAdminOpen, openEnquiryModal, setIsSeoModalOpen, navigateTo } = useCms();

  const handleNav = (route: PageRoute) => {
    setActiveRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#142217] text-[#e8ebe7] border-t border-[#233827]">
      {/* Upper Footer: Value Chain & Conversion Prompt */}
      <div className="border-b border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-2">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#d39c4a]">
                Institutional Engagement
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#faf9f5]">
                Let's Build Resilient Zimbabwean Agriculture Together.
              </h3>
              <p className="text-sm text-[#a2b3a5] max-w-2xl leading-relaxed">
                We partner with commodity off-takers, commercial millers, supermarket chains, outgrowers, and institutional investors to cultivate high-yield, sustainable agricultural value.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3">
              <button
                type="button"
                onClick={() => openEnquiryModal('partnership', 'Commercial Supply Partnership')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#b57a2c] hover:bg-[#c68936] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md transition-all"
              >
                <span>Initiate Partnership Enquiry</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-[#869989]">
                Structured contracts • Batch traceability • Guaranteed delivery
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Directory */}
      <div className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            {/* Col 1: Identity & Positioning */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <DzinoponaLogo size="md" variant="emblem" />
                <div>
                  <h4 className="font-serif font-bold text-lg text-white leading-none">
                    {data.settings.companyName}
                  </h4>
                  <span className="text-[10px] uppercase tracking-widest text-[#9ab09d] block mt-1">
                    {data.settings.legalName}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#a4b4a6] leading-relaxed">
                {data.settings.tagline}
              </p>

              <div className="pt-2 text-xs text-[#829684] space-y-1.5">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#d39c4a] shrink-0 mt-0.5" />
                  <span>Strategic Farming Hubs: Norton • Mvuma • Esigodini • Ntabazinduna</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#d39c4a] shrink-0" />
                  <span>{data.settings.contact.enquiryEmail}</span>
                </div>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="lg:col-span-2 space-y-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[#d39c4a]">
                Company
              </h5>
              <ul className="space-y-2 text-xs text-[#c3d1c5]">
                {([
                  { route: 'home', label: 'Home' },
                  { route: 'about', label: 'About Dzinopona' },
                  { route: 'operations', label: 'Operations (11 Areas)' },
                  { route: 'locations', label: 'Farming Hubs & Map' },
                  { route: 'contact', label: 'Contact & Enquiries' },
                ] as const).map((item) => (
                  <li key={item.route}>
                    <button
                      type="button"
                      onClick={() => handleNav(item.route)}
                      className="hover:text-white transition-colors text-left"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Commercial Portfolios */}
            <div className="lg:col-span-3 space-y-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[#d39c4a]">
                Commercial Portfolios
              </h5>
              <ul className="space-y-2 text-xs text-[#c3d1c5]">
                {([
                  { route: 'products', label: 'Cereal Grains & Oilseeds' },
                  { route: 'products', label: 'Fresh Horticultural Produce' },
                  { route: 'products', label: 'Macadamia & Citrus Nursery' },
                  { route: 'products', label: 'Beef Cattle & Small Stock' },
                  { route: 'products', label: 'Broilers & Indigenous Poultry' },
                  { route: 'services', label: 'Contract Farming Services' },
                  { route: 'projects', label: 'Development Projects Pipeline' },
                ] as const).map((item, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => handleNav(item.route)}
                      className="hover:text-white transition-colors text-left"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Agricultural Commitment & Notice */}
            <div className="lg:col-span-3 space-y-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[#d39c4a]">
                Operational Standards
              </h5>
              <div className="p-3.5 rounded-lg bg-[#1a2d1f] border border-[#2b4731] text-xs text-[#abbdae] space-y-2">
                <div className="flex items-center gap-1.5 text-white font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#58c072]" />
                  <span>Production Cycles Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Product availability varies strictly according to seasonal agricultural cycles. We do not fabricate current inventory; contact our commercial desk for confirmed batch allocations.
                </p>
              </div>

              {/* Technical / SEO actions */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-[#8ea391]">
                <button
                  type="button"
                  onClick={() => setIsSeoModalOpen(true)}
                  className="flex items-center gap-1 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-[#d39c4a]" />
                  <span>SEO Schema & Sitemap</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Band */}
      <div className="border-t border-white/10 py-5 bg-[#0e1910] text-[11px] text-[#718573]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} {data.settings.legalName}. All rights reserved. Registered Zimbabwean Agribusiness.
          </p>
          <div className="flex items-center gap-4">
            <span>Zimbabwe Agro-Ecological Regions IIa, III & IV</span>
            <span>•</span>
            <span className="text-[#a4b6a6]">FARM → PRODUCTION → VALUE → MARKET</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
