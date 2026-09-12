import React from 'react';
import { MapPin, TrendingUp, CheckCircle2, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { MediaFrame } from '../components/MediaFrame';

export const ProjectsView: React.FC = () => {
  const { data, openEnquiryModal } = useCms();

  return (
    <div className="space-y-16 sm:space-y-24 pb-24">
      {/* Header */}
      <section className="pt-12 sm:pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#ede8d8] text-[#785923] text-xs font-semibold tracking-wider uppercase">
            <span>Growth & Future Horizon</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#142217] tracking-tight">
            Strategic Development Projects
          </h1>
          <p className="text-sm sm:text-base text-[#475249] leading-relaxed">
            Dzinopona Farms is actively executing an ambitious infrastructure and production expansion pipeline. These projects represent planned and active capital investments that clearly build upon our established baseline operations.
          </p>
        </div>

        {/* Development vs Production Distinction Banner */}
        <div className="mt-8 p-4 rounded-xl bg-[#faf9f5] border border-[#d6cdb7] text-xs sm:text-sm text-[#473f30] flex items-start gap-3 shadow-2xs">
          <ShieldCheck className="w-5 h-5 text-[#996f2a] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#18261b] block">Development Pipeline Classification</span>
            <p className="leading-relaxed">
              To preserve strict commercial integrity, the initiatives featured below represent developmental capital projects in various stages of engineering, nursery propagation, and site commissioning—distinct from our currently yielding baseline production.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {data.projects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-2xl bg-[#faf9f5] border border-[#ded8c4] overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <MediaFrame
                  slotId={proj.imageSlotId}
                  aspectRatio="16:9"
                  caption={`${proj.title} • ${proj.locationHub}`}
                  badgeText={proj.phase}
                />

                <div className="p-6 sm:p-8 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8b6527] bg-[#ede8d8] px-2.5 py-1 rounded">
                      {proj.type}
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs text-[#18261b] font-medium bg-[#e6ede7] px-2.5 py-0.5 rounded border border-[#ccdacc]">
                      <Clock className="w-3 h-3 text-[#2c5f35]" />
                      <span>{proj.phase}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-serif font-bold text-[#152218]">
                      {proj.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#715421] font-medium mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#9a7029]" />
                      <span>Deployment: {proj.locationHub}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#424d45] leading-relaxed">
                    {proj.summary}
                  </p>

                  {/* Core Objectives */}
                  <div className="space-y-2 pt-2 border-t border-[#e8e2d2]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#18261b] block">
                      Target Objectives:
                    </span>
                    <ul className="space-y-1.5">
                      {proj.objectives.map((obj, oIdx) => (
                        <li key={oIdx} className="text-xs text-[#454f47] flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#9a7029] shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Milestones */}
                  <div className="p-3.5 rounded-xl bg-[#f2efe4] border border-[#ded7c2] space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#735824] block">
                      Current Milestone Status:
                    </span>
                    <ul className="space-y-1 text-xs text-[#423c2e]">
                      {proj.keyMilestones.map((m, mIdx) => (
                        <li key={mIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#9a7029] mt-1.5 shrink-0" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="px-6 sm:px-8 pb-6 pt-2 border-t border-[#ded8c4] flex items-center justify-between">
                <span className="text-xs text-[#78705e]">
                  Development Phase
                </span>
                <button
                  type="button"
                  onClick={() => openEnquiryModal('partnership', `${proj.title} Engagement`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1b2e20] hover:bg-[#122016] text-[#faf9f5] text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                >
                  <span>Inquire / Partner on Project</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#e5a952]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
