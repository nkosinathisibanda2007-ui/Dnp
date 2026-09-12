import React, { useEffect } from 'react';
import { CmsProvider, useCms } from './context/CmsContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CmsAdminModal } from './components/CmsAdminModal';
import { EnquiryModal } from './components/EnquiryModal';
import { SeoPreviewModal } from './components/SeoPreviewModal';
import { HomeView } from './views/HomeView';
import { AboutView } from './views/AboutView';
import { OperationsView } from './views/OperationsView';
import { ProductsView } from './views/ProductsView';
import { ProjectsView } from './views/ProjectsView';
import { ServicesView } from './views/ServicesView';
import { LocationsView } from './views/LocationsView';
import { ContactView } from './views/ContactView';
import { AuthView } from './views/AuthView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { EditorDashboardView } from './views/EditorDashboardView';
import { SlidersHorizontal, ShieldCheck, UserCheck } from 'lucide-react';

const MainApp: React.FC = () => {
  const { activeRoute, setIsAdminOpen, isCmsDirty, navigateTo, authStatus } = useCms();

  // Scroll to top whenever route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeRoute]);

  // Dedicated routes for authentication and staff workspaces
  if (activeRoute === 'auth') {
    return <AuthView />;
  }

  if (activeRoute === 'editor') {
    if (!authStatus.isAuthenticated) {
      return <AuthView />;
    }
    return <EditorDashboardView />;
  }

  if (activeRoute === 'admin') {
    if (!authStatus.isAuthenticated) {
      return <AuthView />;
    }
    if (authStatus.user?.role === 'editor') {
      return <EditorDashboardView />;
    }
    return <AdminDashboardView />;
  }

  const renderActiveView = () => {
    switch (activeRoute) {
      case 'home':
        return <HomeView />;
      case 'about':
        return <AboutView />;
      case 'operations':
        return <OperationsView />;
      case 'products':
        return <ProductsView />;
      case 'projects':
        return <ProjectsView />;
      case 'services':
        return <ServicesView />;
      case 'locations':
        return <LocationsView />;
      case 'contact':
        return <ContactView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbfa] text-[#1c241e] font-sans antialiased selection:bg-[#ede8d8] selection:text-[#18261b]">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content View with top padding to clear fixed navbar */}
      <main className="flex-1 pt-20 sm:pt-24">
        {renderActiveView()}
      </main>

      {/* Global Institutional Footer */}
      <Footer />

      {/* Modals & Dialogs */}
      <CmsAdminModal />
      <EnquiryModal />
      <SeoPreviewModal />

      {/* Authenticated Staff Console Floating Access (Hidden on Public Website) */}
      {authStatus.isAuthenticated && (
        <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateTo(authStatus.user?.role === 'editor' ? 'editor' : 'admin')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1b2e20]/95 hover:bg-[#1b2e20] text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-xs border border-white/20 transition-all group cursor-pointer"
            title="Open Staff Console"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#e5a952]" />
            <span>{authStatus.user?.role === 'editor' ? 'Editor Workspace' : 'Admin Portal'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <CmsProvider>
      <MainApp />
    </CmsProvider>
  );
}
