import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Sprout, Shield, PhoneCall, UserCheck, LogOut } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { PageRoute } from '../types';
import { DzinoponaLogo } from './DzinoponaLogo';

export const Navbar: React.FC = () => {
  const { activeRoute, setActiveRoute, openEnquiryModal, data, navigateTo, authStatus, logout } = useCms();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { route: PageRoute; label: string }[] = [
    { route: 'home', label: 'Home' },
    { route: 'about', label: 'About' },
    { route: 'operations', label: 'Operations' },
    { route: 'products', label: 'Products' },
    { route: 'projects', label: 'Projects' },
    { route: 'services', label: 'Services' },
    { route: 'locations', label: 'Locations' },
    { route: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (route: PageRoute) => {
    setActiveRoute(route);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#fcfbfa]/95 backdrop-blur-md border-b border-[#e5dfd0] shadow-xs py-3'
          : 'bg-[#fcfbfa]/80 backdrop-blur-xs border-b border-transparent py-4'
      }`}
    >
      {/* Top micro-bar for institutional credibility & verified contact */}
      <div className="hidden lg:block border-b border-[#e9e4d6] pb-2 mb-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-[11px] text-[#696250]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-[#18261b]">
              <Sprout className="w-3.5 h-3.5 text-[#9a7029]" />
              <span>{data.settings.legalName}</span>
            </span>
            <span className="text-[#bbb39f]">•</span>
            <span>Strategic Hubs: Norton • Mvuma • Esigodini • Ntabazinduna</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#7a725f]">Desk: {data.settings.contact.enquiryEmail}</span>
            <span className="text-[#bbb39f]">•</span>
            <span className="text-[#7a725f]">{data.settings.contact.primaryEmail}</span>

            {/* Authenticated Staff Bar (Only visible when signed in) */}
            {authStatus.isAuthenticated && authStatus.user && (
              <>
                <span className="text-[#bbb39f]">•</span>
                <div className="flex items-center gap-2 bg-[#1b2e20]/10 px-2 py-0.5 rounded border border-[#1b2e20]/20">
                  <UserCheck className="w-3 h-3 text-[#2d5236]" />
                  <span className="font-semibold text-[#18261b]">{authStatus.user.fullName}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#18261b] text-white uppercase tracking-wider font-mono">
                    {authStatus.user.role}
                  </span>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="text-red-700 hover:text-red-900 ml-1 cursor-pointer flex items-center gap-1 text-[11px]"
                    title="Sign out of staff session"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo / Brandmark */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-hidden"
          >
            {/* Official Company Logo Seal */}
            <DzinoponaLogo size="sm" variant="emblem" />

            <div>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#162419] block leading-none">
                {data.settings.companyName.toUpperCase()}
              </span>
              <span className="text-[10px] tracking-[0.16em] uppercase font-semibold text-[#8b6527] block mt-1">
                Zimbabwean Agriculture
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <button
                key={link.route}
                type="button"
                onClick={() => handleNavClick(link.route)}
                className={`px-3 py-1.5 rounded-md text-xs xl:text-sm font-medium transition-all ${
                  activeRoute === link.route
                    ? 'text-[#18261b] bg-[#ede8d8] font-semibold shadow-2xs'
                    : 'text-[#4f4837] hover:text-[#18261b] hover:bg-[#f3efe4]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => openEnquiryModal('partnership', 'Commercial Partnership')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1b2e20] hover:bg-[#122016] text-[#faf9f5] text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <span>Partner With Us</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#e5a952]" />
            </button>
          </div>

          {/* Mobile Menu Trigger (Only Menu, no public admin button) */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#18261b] hover:bg-[#ede8d8] border border-[#ded8c4]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-full bg-[#fbfbfa] border-b border-[#ded8c4] shadow-xl animate-fadeIn">
          <div className="px-4 pt-3 pb-6 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.route}
                type="button"
                onClick={() => handleNavClick(link.route)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeRoute === link.route
                    ? 'bg-[#1b2e20] text-white font-semibold'
                    : 'text-[#3f382a] hover:bg-[#ede8d8]'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="pt-3 border-t border-[#ded8c4] space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openEnquiryModal('products', 'Product Enquiry');
                }}
                className="w-full py-2.5 bg-[#1b2e20] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Submit Commercial Enquiry</span>
                <ArrowUpRight className="w-4 h-4 text-[#e5a952]" />
              </button>

              {/* Only show session status and signout if authenticated */}
              {authStatus.isAuthenticated && authStatus.user && (
                <div className="flex items-center justify-between text-[11px] text-[#6e6756] px-2 pt-2 border-t border-[#ded8c4]/60">
                  <span className="font-medium text-[#18261b]">
                    Signed in: {authStatus.user.fullName} ({authStatus.user.role})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="text-red-700 hover:underline font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
