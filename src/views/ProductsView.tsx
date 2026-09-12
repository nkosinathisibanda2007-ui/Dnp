import React, { useState } from 'react';
import { ShieldCheck, Search, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { ProductCategory } from '../types';

export const ProductsView: React.FC = () => {
  const { data, openEnquiryModal } = useCms();
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProductCategory>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique subcategories
  const subCategories = Array.from(
    new Set(
      data.products
        .filter((p) => selectedCategory === 'all' || p.category === selectedCategory)
        .map((p) => p.subCategory)
    )
  );

  const filteredProducts = data.products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSub = selectedSubCategory === 'all' || p.subCategory === selectedSubCategory;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSub && matchesSearch;
  });

  return (
    <div className="space-y-12 sm:space-y-16 pb-24">
      {/* Header */}
      <section className="pt-12 sm:pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#ede8d8] text-[#785923] text-xs font-semibold tracking-wider uppercase">
            <span>Commercial Catalogue</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#142217] tracking-tight">
            Agricultural Products
          </h1>
          <p className="text-sm sm:text-base text-[#475249] leading-relaxed">
            Commercial grains, oilseeds, fresh horticultural vegetables, certified orchard nursery seedlings, commercial beef cattle, and biosecure poultry produced across our Zimbabwean farming hubs.
          </p>
        </div>

        {/* Mandatory Availability Disclaimer */}
        <div className="mt-8 p-4 rounded-xl bg-[#ede7d5] border border-[#d6cdb7] text-xs sm:text-sm text-[#473f30] flex items-start gap-3 shadow-2xs">
          <ShieldCheck className="w-5 h-5 text-[#996f2a] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#18261b] block">Production Cycle Availability Policy</span>
            <p className="leading-relaxed">
              Product availability varies according to production cycles. Please contact us for current availability. We do not fabricate current availability; our commercial desk provides verified batch schedules and forward off-take contracts.
            </p>
          </div>
        </div>

        {/* Controls: Search & Main Categories */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Main Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Portfolios' },
              { id: 'crops', label: 'Crops (Cereals, Oilseeds, Veg)' },
              { id: 'nursery', label: 'Nursery & Orchards' },
              { id: 'livestock', label: 'Livestock (Beef, Dairy, Goats)' },
              { id: 'poultry', label: 'Poultry (Broilers, Roadrunners, Eggs)' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id as any);
                  setSelectedSubCategory('all');
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#1b2e20] text-white shadow-xs'
                    : 'bg-[#faf9f5] text-[#524b3c] border border-[#ded8c4] hover:bg-[#ede8d8]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#8a826e] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white border border-[#ded8c4] text-[#1a221d] placeholder-[#968f80] focus:outline-hidden focus:border-[#1b2e20]"
            />
          </div>
        </div>

        {/* Sub-Category Pills (if more than 1) */}
        {subCategories.length > 1 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#e5dfd1]">
            <span className="text-[11px] text-[#716956] mr-1 font-medium">Filter Sub-Category:</span>
            <button
              type="button"
              onClick={() => setSelectedSubCategory('all')}
              className={`px-2.5 py-1 text-[11px] rounded-md transition-all ${
                selectedSubCategory === 'all'
                  ? 'bg-[#ede8d8] text-[#18261b] font-semibold'
                  : 'text-[#635b48] hover:bg-[#ede8d8]/60'
              }`}
            >
              All
            </button>
            {subCategories.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubCategory(sub)}
                className={`px-2.5 py-1 text-[11px] rounded-md transition-all ${
                  selectedSubCategory === sub
                    ? 'bg-[#ede8d8] text-[#18261b] font-semibold'
                    : 'text-[#635b48] hover:bg-[#ede8d8]/60'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#faf9f5] border border-[#ded8c4] text-[#696150] space-y-2">
            <p className="font-serif font-bold text-lg text-[#1b2e20]">No products matching criteria</p>
            <p className="text-xs">Try clearing your search query or selecting another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const isInProduction = product.status === 'in_production';

              return (
                <div
                  key={product.id}
                  className="rounded-2xl bg-[#faf9f5] border border-[#ded8c4] p-6 flex flex-col justify-between hover:shadow-md transition-all space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8b6527] bg-[#ede8d8] px-2.5 py-0.5 rounded">
                        {product.subCategory}
                      </span>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          isInProduction
                            ? 'bg-[#e4ede5] text-[#2b5934] border border-[#c3d8c6]'
                            : 'bg-[#faf0e1] text-[#85531d] border border-[#edd5b9]'
                        }`}
                      >
                        {isInProduction ? 'Current Production' : 'Developing Activity'}
                      </span>
                    </div>

                    <h3 className="text-xl font-serif font-bold text-[#152218]">
                      {product.name}
                    </h3>

                    <p className="text-xs sm:text-[13px] text-[#424d45] leading-relaxed">
                      {product.description}
                    </p>

                    {/* Availability Note */}
                    <div className="p-3 rounded-lg bg-[#f3efe4] border border-[#ded7c4] text-xs text-[#524b3c] space-y-1">
                      <span className="font-semibold text-[#18261b] block text-[11px] uppercase tracking-wider">
                        Production Cycle & Timing:
                      </span>
                      <p>{product.availabilityNote}</p>
                    </div>

                    {/* Specifications if present */}
                    {product.specifications && product.specifications.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#736a57] block">
                          Commercial Specs:
                        </span>
                        <ul className="space-y-1">
                          {product.specifications.map((spec, sIdx) => (
                            <li key={sIdx} className="text-xs text-[#454f47] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#c48a39]" />
                              <span>{spec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-4 border-t border-[#ded8c4] flex items-center justify-between">
                    <span className="text-[11px] text-[#78705f]">
                      {isInProduction ? 'Active Cycle' : 'Pre-order / Pilot'}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEnquiryModal('products', product.name)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1b2e20] hover:bg-[#122016] text-[#faf9f5] text-xs font-semibold rounded-md shadow-2xs transition-colors"
                    >
                      <span>Enquire / Reserve</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#e5a952]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
