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
