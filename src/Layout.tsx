import React, { useState } from 'react';
import { Home, Trophy, Calendar, CheckCircle, Menu, X, LogIn, ChevronRight } from 'lucide-react';
import { Page } from './types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onAdminLogin: () => void;
}

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = { sm: 'h-8', md: 'h-10', lg: 'h-16' };
  return (
    <div className={`flex items-center gap-2 ${sizes[size]}`}>
      <div className="relative">
        <div className={`rounded-full bg-gradient-to-br from-[#16B9C0] to-[#087E91] flex items-center justify-center ${size === 'lg' ? 'w-14 h-14' : size === 'md' ? 'w-9 h-9' : 'w-7 h-7'}`}>
          <span className={`font-bold text-white font-[Montserrat] ${size === 'lg' ? 'text-lg' : size === 'md' ? 'text-xs' : 'text-[10px]'}`}>S</span>
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 rounded-full bg-[#A8D82E] ${size === 'lg' ? 'w-4 h-4' : size === 'md' ? 'w-3 h-3' : 'w-2 h-2'}`} />
      </div>
      <div className="flex flex-col">
        <span className={`font-bold text-[#173D4A] font-[Montserrat] leading-tight ${size === 'lg' ? 'text-xl' : size === 'md' ? 'text-sm' : 'text-xs'}`}>SOQ.COMM</span>
        <span className={`font-semibold text-[#16B9C0] leading-tight ${size === 'lg' ? 'text-sm' : size === 'md' ? 'text-[10px]' : 'text-[8px]'}`}>PADEL LEAGUE</span>
      </div>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate, onAdminLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'home', label: 'Beranda', icon: <Home size={20} /> },
    { page: 'standings', label: 'Klasemen', icon: <Trophy size={20} /> },
    { page: 'schedule', label: 'Jadwal', icon: <Calendar size={20} /> },
    { page: 'results', label: 'Hasil', icon: <CheckCircle size={20} /> },
  ];

  const moreItems: { page: Page; label: string }[] = [
    { page: 'teams', label: 'Tim Peserta' },
    { page: 'statistics', label: 'Statistik' },
    { page: 'league-info', label: 'Informasi Liga' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5FBFC]">
      {/* Desktop Header */}
      <header className="hidden md:block bg-white shadow-sm border-b border-[#DCECEF] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => onNavigate('home')} className="cursor-pointer">
            <Logo size="md" />
          </button>
          <nav className="flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === item.page ? 'bg-[#16B9C0] text-white' : 'text-[#173D4A] hover:bg-[#F5FBFC]'}`}
              >
                {item.label}
              </button>
            ))}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${moreItems.some(i => i.page === currentPage) ? 'bg-[#16B9C0] text-white' : 'text-[#173D4A] hover:bg-[#F5FBFC]'}`}
              >
                Lainnya <ChevronRight size={14} className={`transition-transform ${moreMenuOpen ? 'rotate-90' : ''}`} />
              </button>
              {moreMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-[#DCECEF] py-1 min-w-[160px] z-50">
                  {moreItems.map(item => (
                    <button
                      key={item.page}
                      onClick={() => { onNavigate(item.page); setMoreMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-[#173D4A] hover:bg-[#F5FBFC] transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
          <button
            onClick={onAdminLogin}
            className="flex items-center gap-2 px-4 py-2 bg-[#087E91] text-white rounded-lg text-sm font-medium hover:bg-[#066d7d] transition-colors"
          >
            <LogIn size={16} /> Login Admin
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden bg-white shadow-sm border-b border-[#DCECEF] sticky top-0 z-50">
        <div className="px-4 h-14 flex items-center justify-between">
          <button onClick={() => onNavigate('home')}>
            <Logo size="sm" />
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-[#173D4A]">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="absolute top-14 left-0 right-0 bg-white border-b border-[#DCECEF] shadow-lg animate-fade-in">
            <nav className="flex flex-col p-4 gap-1">
              {navItems.map(item => (
                <button
                  key={item.page}
                  onClick={() => { onNavigate(item.page); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${currentPage === item.page ? 'bg-[#16B9C0] text-white' : 'text-[#173D4A] hover:bg-[#F5FBFC]'}`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
              {moreItems.map(item => (
                <button
                  key={item.page}
                  onClick={() => { onNavigate(item.page); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${currentPage === item.page ? 'bg-[#16B9C0] text-white' : 'text-[#173D4A] hover:bg-[#F5FBFC]'}`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => { onAdminLogin(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 mt-2 bg-[#087E91] text-white rounded-lg text-sm font-medium"
              >
                <LogIn size={18} /> Login Admin
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DCECEF] shadow-lg z-50">
        <div className="flex items-center justify-around h-16">
          {navItems.map(item => (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all ${currentPage === item.page ? 'text-[#16B9C0]' : 'text-[#718792]'}`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all ${moreItems.some(i => i.page === currentPage) ? 'text-[#16B9C0]' : 'text-[#718792]'}`}
          >
            <Menu size={20} />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
        {moreMenuOpen && (
          <div className="absolute bottom-16 left-0 right-0 bg-white border-t border-[#DCECEF] shadow-lg animate-fade-in p-4">
            <div className="grid grid-cols-1 gap-2">
              {moreItems.map(item => (
                <button
                  key={item.page}
                  onClick={() => { onNavigate(item.page); setMoreMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-[#173D4A] hover:bg-[#F5FBFC] transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <footer className="hidden md:block bg-[#087E91] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="font-bold text-white font-[Montserrat]">S</span>
              </div>
              <div>
                <p className="font-bold font-[Montserrat]">SOQ.COMM PADEL LEAGUE</p>
                <p className="text-xs text-white/70">One League. One Community. One Passion.</p>
              </div>
            </div>
            <p className="text-xs text-white/60">© 2025 SOQ.COMM PADEL LEAGUE - Papua Barat Daya, Indonesia</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { Logo };
export default Layout;
