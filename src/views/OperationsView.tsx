import React, { useState } from 'react';
import { CheckCircle2, ArrowUpRight, ShieldCheck, Filter, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { MediaFrame } from '../components/MediaFrame';
import { OperationItem } from '../types';

export const OperationsView: React.FC = () => {
  const { data, openEnquiryModal } = useCms();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filterCategories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Operations (11)' },
    { id: 'crops', label: 'Crops & Horticulture' },
    { id: 'nursery', label: 'Nursery, Orchards & Herbs' },
    { id: 'livestock', label: 'Livestock & Poultry' },
    { id: 'infrastructure', label: 'Engineering, Water & Value Chain' },
  ];

  const filteredOperations = data.operations.filter((op) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'crops') return op.category === 'crop_production' || op.category === 'horticulture';
    if (selectedFilter === 'nursery') return op.category === 'nursery_orchards' || op.category === 'herbs';
    if (selectedFilter === 'livestock') return op.category === 'livestock' || op.category === 'poultry';
    if (selectedFilter === 'infrastructure') {
      return (
        op.category === 'irrigation_water' ||
        op.category === 'farm_development' ||
        op.category === 'processing_value_addition' ||
        op.category === 'marketing_distribution' ||
        op.category === 'biosecurity'
      );
    }
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-24">
      {/* Header */}
      <section className="pt-12 sm:pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#ede8d8] text-[#785923] text-xs font-semibold tracking-wider uppercase">
            <span>Production Architecture</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#142217] tracking-tight">
            Commercial Operations
          </h1>
          <p className="text-sm sm:text-base text-[#475249] leading-relaxed">
            Dzinopona Farms manages 11 integrated operational disciplines spanning arable cropping, protected horticulture, specialized nursery propagation, livestock husbandry, and modern post-harvest infrastructure across Zimbabwe.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="mt-8 flex flex-wrap items-center gap-2 pb-2 border-b border-[#e2dcce]">
          {filterCategories.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedFilter === filter.id
                  ? 'bg-[#1b2e20] text-white shadow-xs'
                  : 'bg-[#faf9f5] text-[#554e3d] border border-[#ded8c4] hover:bg-[#ede8d8]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {/* Operations List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {filteredOperations.map((op, index) => {
            const isExpanded = expandedId === op.id;
            const isEven = index % 2 === 1;

            return (
              <div
                key={op.id}
                className="rounded-2xl bg-[#faf9f5] border border-[#ded8c4] overflow-hidden shadow-xs hover:border-[#b8ae93] transition-colors"
              >
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 items-center ${isEven ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Media Frame */}
                  <div className={`lg:col-span-5 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <MediaFrame
                      slotId={op.imageSlotId}
                      aspectRatio="16:9"
                      caption={op.title}
                      badgeText={`Operation 0${op.order}`}
                    />
                  </div>

                  {/* Content Column */}
                  <div className={`lg:col-span-7 space-y-4 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#8b6527] bg-[#ede8d8] px-2.5 py-1 rounded">
                        {op.category.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded font-medium capitalize ${
                          op.status === 'active'
                            ? 'bg-[#e3eee4] text-[#24542d] border border-[#c1d9c4]'
                            : op.status === 'expanding'
                            ? 'bg-[#e8f0f8] text-[#1e4d7d] border border-[#c8daf0]'
                            : 'bg-[#faf0e1] text-[#85531d] border border-[#edd5b9]'
                        }`}
                      >
                        ● {op.status} Phase
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#142217]">
                      {op.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-[#38443b] leading-relaxed">
                      {op.summary}
                    </p>

                    {/* Key Technical Highlights */}
                    <div className="space-y-2 pt-2 border-t border-[#e8e2d2]">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#18261b] block">
                        Core Operational Parameters:
                      </span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {op.keyDetails.map((detail, dIdx) => (
                          <li key={dIdx} className="flex items-start gap-2 text-xs text-[#454f47]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#9a7029] shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Expandable Agronomic Detail */}
                    {isExpanded && (
                      <div className="p-4 rounded-xl bg-[#f2efe4] border border-[#ded7c2] text-xs sm:text-[13px] text-[#333e36] leading-relaxed space-y-2 animate-fadeIn">
                        <span className="font-semibold text-[#18261b] block uppercase text-[10px] tracking-wider">
                          Full Agronomic & Operational Mandate:
                        </span>
                        <p>{op.fullDescription}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => toggleExpand(op.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6e5323] hover:text-[#423112] underline underline-offset-4"
                      >
                        <span>{isExpanded ? 'Collapse Overview' : 'View Full Operational Narrative'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEnquiryModal('partnership', `${op.title} Commercial Engagement`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1b2e20] hover:bg-[#122016] text-[#faf9f5] text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        <span>Commercial Enquiry</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#e5a952]" />
                      </button>
                    </div>
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
