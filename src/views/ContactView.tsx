import React, { useState } from 'react';
import { Mail, MapPin, Building2, Send, CheckCircle2, ShieldCheck, PhoneCall, ArrowUpRight } from 'lucide-react';
import { useCms } from '../context/CmsContext';

export const ContactView: React.FC = () => {
  const { data, submitEnquiry } = useCms();
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    enquiryType: 'products' as 'products' | 'partnership' | 'services' | 'careers' | 'general',
    specificProductOrInterest: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    submitEnquiry({
      name: formData.name.trim(),
      organization: formData.organization.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      enquiryType: formData.enquiryType,
      specificProductOrInterest: formData.specificProductOrInterest.trim(),
      message: formData.message.trim(),
    });

    setIsSubmitted(true);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-24">
      {/* Header */}
      <section className="pt-12 sm:pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#ede8d8] text-[#785923] text-xs font-semibold tracking-wider uppercase">
            <span>Direct Commercial Engagement</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#142217] tracking-tight">
            Contact Dzinopona Farms
          </h1>
          <p className="text-sm sm:text-base text-[#475249] leading-relaxed">
            Connect directly with our commercial, agronomy, and partnerships desks. We engage with commercial grain millers, food processors, retail chains, outgrowers, and prospective team members.
          </p>
        </div>
      </section>

      {/* Main Grid: Info + Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Confirmed Contact Information Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#faf9f5] border border-[#ded8c4] space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#996f2a]">
                  Corporate Office & Hubs
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#152218] mt-1">
                  Verified Contact Channels
                </h3>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-[#38443b]">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#f2efe4] border border-[#ded7c2]">
                  <Building2 className="w-5 h-5 text-[#8b6527] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#18261b] block">Corporate Desk</span>
                    <p className="text-[#595241]">{data.settings.legalName}</p>
                    <p className="text-[#756d5b] text-xs mt-0.5">{data.settings.contact.corporateAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#f2efe4] border border-[#ded7c2]">
                  <Mail className="w-5 h-5 text-[#8b6527] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#18261b] block">Electronic Mail Desks</span>
                    <p className="text-[#595241] font-mono text-xs">General: {data.settings.contact.primaryEmail}</p>
                    <p className="text-[#595241] font-mono text-xs">Commercial: {data.settings.contact.enquiryEmail}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#f2efe4] border border-[#ded7c2]">
                  <MapPin className="w-5 h-5 text-[#8b6527] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#18261b] block">Strategic Agricultural Hubs</span>
                    <p className="text-[#595241]">{data.settings.contact.operatingHubsSummary}</p>
                  </div>
                </div>
              </div>

              {/* Verified Contact Discipline Notice */}
              <div className="p-3.5 rounded-lg bg-[#ede7d5] border border-[#d6cdb7] text-xs text-[#544d3d] space-y-1">
                <span className="font-bold text-[#18261b] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#996f2a]" />
                  <span>Phone Numbers Confirmation</span>
                </span>
                <p className="leading-relaxed">
                  {data.settings.contact.phonePlaceholderNote} For current communication, electronic mail inquiries through this commercial desk are monitored continuously.
                </p>
              </div>
            </div>
          </div>

          {/* Direct Enquiry Form Column */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-10 rounded-2xl bg-[#faf9f5] border border-[#ded8c4] shadow-xs">
              {isSubmitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#1b2e20] text-white flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-[#58c072]" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[#142217]">
                    Enquiry Logged to Commercial Desk
                  </h3>
                  <p className="text-sm text-[#475249] max-w-md mx-auto leading-relaxed">
                    Thank you, {formData.name}. Your details have been submitted to Dzinopona Farms. Our agricultural commercial team will review your specifications and follow up.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: '',
                        organization: '',
                        email: '',
                        phone: '',
                        enquiryType: 'products',
                        specificProductOrInterest: '',
                        message: '',
                      });
                    }}
                    className="mt-4 px-6 py-2.5 bg-[#1b2e20] text-white text-xs font-semibold rounded-lg hover:bg-[#122016] transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-[#152218]">
                      Initiate Direct Enquiry
                    </h3>
                    <p className="text-xs text-[#525a53] mt-1">
                      Select your enquiry category to ensure direct routing to the responsible team.
                    </p>
                  </div>

                  {/* Enquiry Category Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-[#222c24] mb-1.5">
                      Enquiry Category <span className="text-[#a8442b]">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'products', label: 'Agricultural Products' },
                        { id: 'partnership', label: 'Business Partnerships' },
                        { id: 'services', label: 'Agribusiness Services' },
                        { id: 'careers', label: 'Working with Us' },
                        { id: 'general', label: 'General Enquiries' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, enquiryType: cat.id as any })}
                          className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-all ${
                            formData.enquiryType === cat.id
                              ? 'bg-[#1b2e20] text-[#faf9f5] border-[#1b2e20] shadow-xs'
                              : 'bg-[#faf9f5] text-[#4d4638] border-[#ded8c4] hover:bg-[#ede8d8]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specific Product or Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-[#222c24] mb-1">
                      Specific Product, Farming Hub, or Subject
                    </label>
                    <input
                      type="text"
                      value={formData.specificProductOrInterest}
                      onChange={(e) => setFormData({ ...formData, specificProductOrInterest: e.target.value })}
                      placeholder="e.g. Commercial Maize Bulk Quota, Norton Pivot Visit, Macadamia Seedling Order"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white border border-[#ded8c4] text-[#1c241e] placeholder-[#948d7d] focus:outline-hidden focus:border-[#1b2e20]"
                    />
                  </div>

                  {/* Contact Info Row 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#222c24] mb-1">
                        Your Full Name <span className="text-[#a8442b]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter full name"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white border border-[#ded8c4] text-[#1c241e] placeholder-[#948d7d] focus:outline-hidden focus:border-[#1b2e20]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#222c24] mb-1">
                        Organization / Business Name
                      </label>
                      <input
                        type="text"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="Off-taker, Miller, or Farm name"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white border border-[#ded8c4] text-[#1c241e] placeholder-[#948d7d] focus:outline-hidden focus:border-[#1b2e20]"
                      />
                    </div>
                  </div>

                  {/* Contact Info Row 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#222c24] mb-1">
                        Email Address <span className="text-[#a8442b]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@company.com"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white border border-[#ded8c4] text-[#1c241e] placeholder-[#948d7d] focus:outline-hidden focus:border-[#1b2e20]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#222c24] mb-1">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+263 ..."
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white border border-[#ded8c4] text-[#1c241e] placeholder-[#948d7d] focus:outline-hidden focus:border-[#1b2e20]"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-[#222c24] mb-1">
                      Message & Commercial Details <span className="text-[#a8442b]">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Specify requested tonnage, required harvest window, location, or questions..."
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white border border-[#ded8c4] text-[#1c241e] placeholder-[#948d7d] focus:outline-hidden focus:border-[#1b2e20]"
                    />
                  </div>

                  {/* Submit */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#787161]">
                      Direct routing to {data.settings.contact.enquiryEmail}
                    </span>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1b2e20] hover:bg-[#122016] text-[#faf9f5] text-xs sm:text-sm font-semibold rounded-lg shadow-md transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Transmit Enquiry</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
