import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Menu, X } from 'lucide-react';
import { openWhatsApp, WhatsAppMessages, WHATSAPP_DISPLAY } from '../utils/whatsapp';
import { OrganicBlob } from './BiomorphicShapes';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Início', path: '/' },
    { label: 'A Clínica', path: '/a-clinica' },
    { label: 'Tratamentos', path: '/tratamentos' },
    { label: 'Tecnologias', path: '/tecnologias' },
    { label: 'Corpo Clínico', path: '/corpo-clinico' },
    { label: 'Como Chegar', path: '/contato' },
  ];

  const handleWhatsAppClick = () => {
    openWhatsApp(WhatsAppMessages.general(), {
      service_name: 'Geral',
      page_path: location.pathname,
      cta_location: 'Header Principal'
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Barra Superior Fixa */}
      <div 
        className={`relative z-50 transition-all duration-300 border-b border-[#E5DAD0] ${
          isScrolled 
            ? 'bg-[#F7F2EB]/95 backdrop-blur-md shadow-xs py-3' 
            : 'bg-[#F7F2EB]/95 backdrop-blur-md py-3.5 sm:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link 
            to="/" 
            className="group flex items-center focus:outline-none"
            aria-label="Clínica Nidô - Início"
          >
            <img
              src="/logo_nido.webp"
              alt="Clínica Nidô"
              className="h-7 sm:h-8.5 w-auto object-contain transition-opacity group-hover:opacity-85"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm tracking-wide py-1 relative group transition-all duration-300 ${
                    isActive 
                      ? 'text-[#1F1916] font-medium' 
                      : 'text-[#44342E] hover:text-[#1F1916] hover:-translate-y-0.5 font-normal'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive ? (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#44342E] rounded-full" />
                  ) : (
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8C7359] rounded-full transition-all duration-300 ease-out group-hover:w-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop WhatsApp CTA */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={handleWhatsAppClick}
              className="inline-flex items-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold px-5 py-2.5 rounded-full shadow-xs transition-all duration-200 cursor-pointer active:scale-98"
              aria-label="Falar com a Clínica Nidô no WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp</span>
            </button>
          </div>

          {/* Mobile Fast Action Pill & Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={handleWhatsAppClick}
              className="inline-flex items-center gap-1.5 bg-[#44342E] text-white px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-xs active:scale-95 cursor-pointer animate-whatsapp-brand-pulse"
              aria-label="Falar no WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#1F1916] hover:text-[#44342E] transition-colors focus:outline-none rounded-lg cursor-pointer"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown - Abre logo abaixo da barra superior sobrepondo a tela */}
      {mobileMenuOpen && (
        <div className="lg:hidden relative">
          {/* Fundo escurecido semitransparente para fechar ao clicar fora */}
          <div 
            className="fixed inset-0 bg-[#181310]/40 backdrop-blur-xs z-40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Gaveta suspenso abaixo da barra */}
          <nav 
            className="relative z-50 bg-gradient-to-b from-[#FCF9F5] to-[#F5EFE7] border-b-2 border-[#E5DAD0] px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2 max-h-[calc(100dvh-75px)] overflow-y-auto"
            aria-label="Menu móvel"
          >
            <div className="flex flex-col space-y-1.5 pt-1 relative z-10">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 text-base rounded-xl transition-colors ${
                      isActive 
                        ? 'bg-[#E5DAD0] text-[#1F1916] font-medium' 
                        : 'text-[#44342E] hover:bg-[#E5DAD0]/50 hover:text-[#1F1916] font-normal'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E5DAD0] relative z-10">
              <button
                onClick={handleWhatsAppClick}
                className="w-full flex items-center justify-center gap-2 bg-[#44342E] hover:bg-[#5A453D] text-[#FFFFFF] py-3.5 rounded-full text-sm font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer active:scale-98"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <span>{WHATSAPP_DISPLAY}</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
