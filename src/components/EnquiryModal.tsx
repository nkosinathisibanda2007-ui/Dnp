import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, ShieldCheck, Mail, MapPin, Building2, PhoneCall } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { DzinoponaLogo } from './DzinoponaLogo';

export const EnquiryModal: React.FC = () => {
  const { isEnquiryOpen, setIsEnquiryOpen, enquiryPreselect, submitEnquiry, data } = useCms();

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

  useEffect(() => {
    if (enquiryPreselect) {
      setFormData((prev) => ({
        ...prev,
        enquiryType: (enquiryPreselect.type as any) || 'products',
        specificProductOrInterest: enquiryPreselect.subject || '',
      }));
    }
  }, [enquiryPreselect, isEnquiryOpen]);

  if (!isEnquiryOpen) return null;

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

  const handleClose = () => {
    setIsEnquiryOpen(false);
    setIsSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#fbfbfa] border border-[#dcd6c4] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e2dcce] bg-[#faf8f2]">
          <div className="flex items-center gap-3.5">
            <DzinoponaLogo size="sm" variant="emblem" />
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#996f2a]">
                Direct Commercial Desk
              </span>
              <h3 className="text-xl font-serif font-bold text-[#152218]">
                Connect with Dzinopona Farms
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-[#5e5849] hover:text-[#152218] hover:bg-[#ede8d8] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 sm:p-8">
          {isSubmitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#1b2e20] text-white flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8 text-[#58c072]" />
              </div>
              <h4 className="text-2xl font-serif font-bold text-[#142217]">
                Enquiry Received Successfully
              </h4>
              <p className="text-sm text-[#475249] max-w-md mx-auto leading-relaxed">
                Thank you for reaching out to Dzinopona Farms. Your message has been logged to our commercial desk. A representative will review your request and get in touch.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-[#1b2e20] hover:bg-[#122016] text-[#faf9f5] font-medium text-sm rounded-lg shadow-sm transition-colors"
                >
                  Return to Website
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs sm:text-sm text-[#454f47]">
                Please complete the form below. Whether you require bulk agricultural supply, contract farming collaboration, or general commercial information, your enquiry will be routed to the appropriate department.
              </p>

              {/* Enquiry Category Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#222c24] mb-1.5">
                  Nature of Enquiry <span className="text-[#a8442b]">*</span>
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
                          : 'bg-[#faf9f5] text-[#4d4638] border-[#ded8c4] hover:bg-[#f0ebe0]'
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
                  Specific Product, Hub or Subject
                </label>
                <input
                  type="text"
                  value={formData.specificProductOrInterest}
                  onChange={(e) => setFormData({ ...formData, specificProductOrInterest: e.target.value })}
                  placeholder="e.g. Commercial White Maize Quota, Norton Hub Visit, Macadamia Seedlings"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white border border-[#ded8c4] text-[#1c241e] placeholder-[#948d7d] focus:outline-hidden focus:border-[#1b2e20] focus:ring-1 focus:ring-[#1b2e20]"
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
                    Organization / Trading Name
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Company, Off-taker or Farm name"
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
                    placeholder="name@organization.com"
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
                  Enquiry Details & Specifications <span className="text-[#a8442b]">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Outline your requested volume, specifications, partnership proposal, or questions..."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white border border-[#ded8c4] text-[#1c241e] placeholder-[#948d7d] focus:outline-hidden focus:border-[#1b2e20]"
                />
              </div>

              {/* Availability Reminder */}
              <div className="p-3 rounded-lg bg-[#f4f0e4] border border-[#e0d9c4] text-xs text-[#5f5745] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#996f2a] shrink-0 mt-0.5" />
                <p>
                  <strong>Commercial Availability Notice:</strong> Product availability varies according to seasonal agricultural cycles. We do not fabricate current inventory; our team will advise based on real harvest and batch schedules.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[#787161]">
                  Email desk: {data.settings.contact.enquiryEmail}
                </span>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1b2e20] hover:bg-[#122016] text-[#faf9f5] text-xs sm:text-sm font-semibold rounded-lg shadow-md transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Commercial Enquiry</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Confirmed info footer */}
        <div className="px-6 py-3.5 bg-[#f4f2ea] border-t border-[#e2dcce] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#69614f]">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#886221]" />
            <span>{data.settings.legalName}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#886221]" />
            <span>Norton • Mvuma • Esigodini • Ntabazinduna</span>
          </span>
        </div>
      </div>
    </div>
  );
};
