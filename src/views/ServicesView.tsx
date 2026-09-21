import React from 'react';
import { CheckCircle2, ArrowUpRight, Tractor } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { getServiceImageUrl } from '../utils/imageAssets';

export const ServicesView: React.FC = () => {
  const { data, openEnquiryModal } = useCms();

  return (
    <div className="space-y-16 sm:space-y-24 pb-24">
      {/* Header */}
      <section className="pt-12 sm:pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#ede8d8] text-[#785923] text-xs font-semibold tracking-wider uppercase">
            <span>Professional Capabilities</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#142217] tracking-tight">
            Agribusiness Services & Partnerships
          </h1>
          <p className="text-sm sm:text-base text-[#475249] leading-relaxed">
            Leveraging our hands-on operational experience across Zimbabwe, Dzinopona Farms delivers professional agricultural management, structured contract farming partnerships, agronomic consultancy, and veterinary advisory.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.services.map((serv, index) => {
            const imageUrl = getServiceImageUrl(serv);

            return (
              <div
                key={serv.id}
                className="rounded-2xl bg-[#faf9f5] border border-[#ded8c4] overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-[#b8ae93] transition-all group"
              >
                {/* Authentic Service Photo Banner */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#e8e4d8]">
                  <img
                    src={imageUrl}
                    alt={serv.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="font-mono text-[11px] font-bold text-[#142217] px-2.5 py-1 rounded bg-white/95 backdrop-blur-xs border border-[#ded8c4] shadow-2xs">
                      SERVICE 0{index + 1}
                    </span>
                    <span className="p-1.5 rounded-md bg-[#1b2e20]/80 text-white backdrop-blur-xs">
                      <Tractor className="w-4 h-4 text-[#e5a952]" />
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-serif font-bold text-[#142217]">
                      {serv.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#38443b] font-medium leading-relaxed">
                      {serv.shortDescription}
                    </p>

                    <p className="text-xs text-[#525d54] leading-relaxed">
                      {serv.fullDescription}
                    </p>

                    {/* Deliverables */}
                    <div className="space-y-2 pt-2 border-t border-[#e8e2d2]">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#18261b] block">
                        Key Scope & Deliverables:
                      </span>
                      <ul className="space-y-1.5">
                        {serv.deliverables.map((del, dIdx) => (
                          <li key={dIdx} className="text-xs text-[#454f47] flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#9a7029] shrink-0 mt-0.5" />
                            <span>{del}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Target Audience */}
                    <div className="p-3 rounded-lg bg-[#f3efe4] border border-[#ded7c4] text-xs text-[#574f3e]">
                      <span className="font-semibold text-[#18261b] block text-[11px] uppercase tracking-wider mb-0.5">
                        Recommended For:
                      </span>
                      <p>{serv.targetAudience}</p>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-4 border-t border-[#ded8c4] flex items-center justify-between mt-auto">
                    <span className="text-xs text-[#7d7563]">
                      Bespoke Engagement Models
                    </span>
                    <button
                      type="button"
                      onClick={() => openEnquiryModal('services', serv.title)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1b2e20] hover:bg-[#122016] text-[#faf9f5] text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      <span>Request Proposal</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#e5a952]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
