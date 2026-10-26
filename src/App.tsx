import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppFloating } from './components/WhatsAppFloating';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ConsentBanner } from './components/ConsentBanner';
import { LeadCaptureModal } from './components/LeadCaptureModal';
import { HomePage } from './pages/HomePage';
import { ClinicPage } from './pages/ClinicPage';
import { TreatmentsPage } from './pages/TreatmentsPage';
import { TreatmentDetailPage } from './pages/TreatmentDetailPage';
import { TechnologiesPage } from './pages/TechnologiesPage';
import { TechnologyDetailPage } from './pages/TechnologyDetailPage';
import { TeamPage } from './pages/TeamPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { CookiesPage } from './pages/CookiesPage';
import { AdminCRMPage } from './pages/AdminCRMPage';

import { trackMetaPageView } from './utils/metaConversions';
import { initTrafficAttribution } from './utils/trafficSource';

// Main Application shell with #admin detection and traffic attribution
function AppContent() {
  const { pathname } = useLocation();
  const [currentHash, setCurrentHash] = useState(() => 
    typeof window !== 'undefined' ? window.location.hash : ''
  );

  // Listen to hash changes (for /#admin support)
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Track page views and initialize traffic attribution
  useEffect(() => {
    window.scrollTo(0, 0);
    trackMetaPageView(pathname);
    initTrafficAttribution();
  }, [pathname]);

  const isAdmin = currentHash === '#admin';

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#F5EFE7]">
        <AdminCRMPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-[#332923] antialiased overflow-x-hidden w-full max-w-full">
      <Header />
      
      <main className="flex-1 pb-16 md:pb-0 w-full max-w-full overflow-x-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/a-clinica" element={<ClinicPage />} />
          <Route path="/tratamentos" element={<TreatmentsPage />} />
          <Route path="/tratamentos/:slug" element={<TreatmentDetailPage />} />
          <Route path="/tecnologias" element={<TechnologiesPage />} />
          <Route path="/tecnologias/:slug" element={<TechnologyDetailPage />} />
          <Route path="/corpo-clinico" element={<TeamPage />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/politica-de-privacidade" element={<PrivacyPage />} />
          <Route path="/politica-de-cookies" element={<CookiesPage />} />
          {/* Fallback route */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <Footer />
      <WhatsAppFloating />
      <MobileBottomNav />
      <ConsentBanner />
      <LeadCaptureModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Subtle luxury editorial grain texture */}
      <div className="noise-overlay" aria-hidden="true" />
      <AppContent />
    </BrowserRouter>
  );
}
