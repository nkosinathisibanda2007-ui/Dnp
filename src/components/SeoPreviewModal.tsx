import React, { useState } from 'react';
import { X, Code2, Globe, FileCode, Check, Copy } from 'lucide-react';
import { useCms } from '../context/CmsContext';

export const SeoPreviewModal: React.FC = () => {
  const { isSeoModalOpen, setIsSeoModalOpen, data } = useCms();
  const [activeTab, setActiveTab] = useState<'schema' | 'sitemap' | 'robots' | 'meta'>('schema');
  const [copied, setCopied] = useState(false);

  if (!isSeoModalOpen) return null;

  // Generate dynamic Schema.org structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AgriculturalBusiness',
        '@id': `${data.settings.seo.canonicalUrl}/#organization`,
        name: data.settings.legalName,
        alternateName: data.settings.companyName,
        url: data.settings.seo.canonicalUrl,
        logo: `${data.settings.seo.canonicalUrl}/assets/dzinopona_farms_logo.jpg`,
        description: data.settings.seo.metaDescription,
        slogan: data.settings.tagline,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'ZW',
          addressLocality: 'Harare and Strategic Farming Hubs',
        },
        areaServed: [
          { '@type': 'AdministrativeArea', name: 'Norton, Mashonaland West' },
          { '@type': 'AdministrativeArea', name: 'Mvuma, Midlands' },
          { '@type': 'AdministrativeArea', name: 'Esigodini, Matabeleland South' },
          { '@type': 'AdministrativeArea', name: 'Ntabazinduna, Matabeleland North' },
          { '@type': 'Country', name: 'Zimbabwe' },
        ],
        knowsAbout: [
          'Commercial Crop Production',
          'Winter Wheat & Maize',
          'Horticulture & Drip Irrigation',
          'Macadamia & Citrus Nursery',
          'Commercial Beef Cattle',
          'Poultry Production',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${data.settings.seo.canonicalUrl}/#website`,
        url: data.settings.seo.canonicalUrl,
        name: data.settings.companyName,
        publisher: {
          '@id': `${data.settings.seo.canonicalUrl}/#organization`,
        },
      },
    ],
  };

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${data.settings.seo.canonicalUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${data.settings.seo.canonicalUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${data.settings.seo.canonicalUrl}/operations</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${data.settings.seo.canonicalUrl}/products</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${data.settings.seo.canonicalUrl}/projects</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${data.settings.seo.canonicalUrl}/services</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${data.settings.seo.canonicalUrl}/locations</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${data.settings.seo.canonicalUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

  const robotsTxt = `# robots.txt for Dzinopona Farms
User-agent: *
Allow: /
Disallow: /admin

# Sitemaps
Sitemap: ${data.settings.seo.canonicalUrl}/sitemap.xml
`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-3xl bg-[#fbfbfa] border border-[#dcd6c4] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2dcce] bg-[#faf8f2]">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-[#996f2a]" />
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#152218]">
                SEO & Machine-Readable Schema Architecture
              </h3>
              <p className="text-[11px] text-[#69614f]">
                Pre-configured for Google Search Console, Knowledge Graph & Structured Data
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSeoModalOpen(false)}
            className="p-1.5 text-[#5e5849] hover:text-[#152218] hover:bg-[#ede8d8] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-[#e2dcce] bg-[#f4f2ea] text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'schema'
                ? 'bg-[#1b2e20] text-white shadow-xs'
                : 'text-[#585141] hover:text-[#1b2e20]'
            }`}
          >
            JSON-LD Schema
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sitemap')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'sitemap'
                ? 'bg-[#1b2e20] text-white shadow-xs'
                : 'text-[#585141] hover:text-[#1b2e20]'
            }`}
          >
            XML Sitemap
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('robots')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'robots'
                ? 'bg-[#1b2e20] text-white shadow-xs'
                : 'text-[#585141] hover:text-[#1b2e20]'
            }`}
          >
            robots.txt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('meta')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'meta'
                ? 'bg-[#1b2e20] text-white shadow-xs'
                : 'text-[#585141] hover:text-[#1b2e20]'
            }`}
          >
            Open Graph & Meta
          </button>
        </div>

        {/* Code / Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#18221b] text-[#e8ece8] font-mono text-xs">
          {activeTab === 'schema' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => copyToClipboard(JSON.stringify(structuredData, null, 2))}
                className="absolute top-2 right-2 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <pre className="overflow-x-auto whitespace-pre-wrap p-2 text-[#d2dacd]">
                {JSON.stringify(structuredData, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'sitemap' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => copyToClipboard(sitemapXml)}
                className="absolute top-2 right-2 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <pre className="overflow-x-auto whitespace-pre-wrap p-2 text-[#d2dacd]">
                {sitemapXml}
              </pre>
            </div>
          )}

          {activeTab === 'robots' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => copyToClipboard(robotsTxt)}
                className="absolute top-2 right-2 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <pre className="overflow-x-auto whitespace-pre-wrap p-2 text-[#d2dacd]">
                {robotsTxt}
              </pre>
            </div>
          )}

          {activeTab === 'meta' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="text-amber-400 block text-[10px] uppercase font-semibold">Page Title</span>
                <p className="text-white text-sm font-medium mt-0.5">{data.settings.seo.metaTitle}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="text-amber-400 block text-[10px] uppercase font-semibold">Meta Description</span>
                <p className="text-white text-sm leading-relaxed mt-0.5">{data.settings.seo.metaDescription}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="text-amber-400 block text-[10px] uppercase font-semibold">Target Keywords</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {data.settings.seo.keywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-white/90 text-[11px]">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#f4f2ea] border-t border-[#e2dcce] flex items-center justify-between text-[11px] text-[#69614f]">
          <span>Canonical Domain: {data.settings.seo.canonicalUrl}</span>
          <span>Editable via CMS Admin</span>
        </div>
      </div>
    </div>
  );
};
