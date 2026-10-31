import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Search,
  MapPin,
  CalendarDays,
  Bus,
  Languages,
  Heart,
  User as UserIcon,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export const LogoSvg: React.FC<{ size?: number }> = ({ size = 42 }) => (
  <div
    style={{ width: size, height: size }}
    className="rounded-full bg-[#101d50] grid place-items-center flex-shrink-0 shadow-sm overflow-hidden"
    aria-hidden="true"
  >
    <svg viewBox="0 0 100 100" className="w-full h-full block">
      <circle cx="50" cy="50" r="47" fill="#101d50" stroke="#fff" strokeWidth="1.6" strokeDasharray="4 4" />
      <g transform="translate(50 43)">
        <ellipse cx="0" cy="-18" rx="11" ry="19" fill="#ff5c7a" />
        <ellipse cx="17" cy="-5" rx="11" ry="19" fill="#ffeb9a" transform="rotate(60 17 -5)" />
        <ellipse cx="11" cy="15" rx="11" ry="19" fill="#ff5c7a" transform="rotate(125 11 15)" />
        <ellipse cx="-11" cy="15" rx="11" ry="19" fill="#ffeb9a" transform="rotate(-125 -11 15)" />
        <ellipse cx="-17" cy="-5" rx="11" ry="19" fill="#ff5c7a" transform="rotate(-60 -17 -5)" />
        <path d="M0 -12 C-8 -12 -13 -6 -13 1 C-13 11 0 23 0 23 S13 11 13 1 C13 -6 8 -12 0 -12Z" fill="#fff" />
        <circle cx="0" cy="0" r="4.7" fill="#ff5c7a" />
      </g>
    </svg>
  </div>
);

export const Navbar: React.FC = () => {
  const { user, activePage, navigateTo, favorites, setIsChatOpen } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, badge: 'Fast AI' },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'explore-map', label: 'Explore Map', icon: MapPin },
    { id: 'trip-planner', label: 'Trip Planner', icon: CalendarDays },
    { id: 'transport-guide', label: 'Transport Guides', icon: Bus },
    { id: 'translate', label: 'Translate', icon: Languages },
    { id: 'favorites', label: 'Saved Places', icon: Heart, count: favorites.length },
  ];

  const handleNav = (pageId: string) => {
    if (pageId === 'ai-assistant') {
      setIsChatOpen(true);
      navigateTo('ai-assistant');
    } else {
      navigateTo(pageId);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Welcome Bar */}
      <div className="bg-[#073f3a] text-white text-[12px] text-center py-2 px-4 tracking-[0.2px] font-medium flex items-center justify-center gap-2">
        <span>🌿</span>
        <span>Your new life in Malaysia starts here — explore with confidence.</span>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-[#f7f3eb]/95 backdrop-blur-md border-b border-[#172b2a]/10 transition-all">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-[76px] flex items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
            aria-label="MyLocal Mate Home"
          >
            <LogoSvg size={44} />
            <div className="flex flex-col">
              <span className="font-extrabold text-[21px] tracking-[-0.8px] text-[#172b2a] leading-none">
                MyLocal <span className="text-[#ff5c7a]">Mate</span>
              </span>
              <span className="text-[10px] text-[#6f7d79] tracking-wider uppercase font-semibold mt-1">
                Local Life Companion
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-[13px] font-semibold text-[#172b2a]" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`px-3 py-2 rounded-full flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-[#073f3a] text-white shadow-sm font-semibold'
                      : 'text-[#41514d] hover:text-[#073f3a] hover:bg-black/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#ffeb9a]' : 'text-[#6f7d79]'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-[#ff5c7a] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#ff5c7a]/15 text-[#ff5c7a]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions & User menu */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* In-app PWA install button */}
            <PWAInstallButton variant="navbar" />

            {user ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNav('profile')}
                  className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border transition-all text-left ${
                    activePage === 'profile'
                      ? 'border-[#073f3a] bg-[#073f3a] text-white shadow-sm'
                      : 'border-[#e9e5dc] bg-white text-[#172b2a] hover:border-[#073f3a]/30'
                  }`}
                  aria-label="User Profile"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-white"
                  />
                  <div className="hidden sm:block text-xs">
                    <div className="font-bold leading-tight truncate max-w-[100px]">
                      {user.isGuest ? 'Guest' : user.name.split(' ')[0]}
                    </div>
                  </div>
                  {user.isGuest && (
                    <span className="hidden sm:inline-block bg-[#e5f1dc] text-[#28583d] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                      Guest
                    </span>
                  )}
                </button>
                {user.isGuest && (
                  <button
                    onClick={() => handleNav('auth')}
                    className="hidden md:inline-flex bg-[#073f3a] hover:bg-[#063430] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-xs transition-all"
                  >
                    Sign In
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNav('auth')}
                className="bg-[#073f3a] hover:bg-[#063430] text-white text-xs font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-[#172b2a] hover:bg-black/5 rounded-full transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#f7f3eb] border-b border-[#e9e5dc] px-4 pt-3 pb-6 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
            {/* Install App CTA in Mobile Drawer */}
            <div className="p-3 rounded-2xl bg-white border border-[#e9e5dc] flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#073f3a] text-white grid place-items-center text-sm font-bold">
                  📲
                </div>
                <div>
                  <div className="text-xs font-extrabold text-[#172b2a]">MyLocal Mate App</div>
                  <div className="text-[10px] text-[#6f7d79]">Install on home screen</div>
                </div>
              </div>
              <PWAInstallButton variant="navbar" />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#073f3a] text-white shadow-sm'
                        : 'bg-white border border-[#e9e5dc] text-[#172b2a] hover:bg-[#f0ece3]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#ffeb9a]' : 'text-[#6f7d79]'}`} />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="bg-[#ff5c7a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-auto">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#e9e5dc] flex items-center justify-between">
              {user ? (
                <button
                  onClick={() => handleNav('profile')}
                  className="flex items-center gap-2 text-xs font-bold text-[#073f3a]"
                >
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                  <span>My Profile & Settings →</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNav('auth')}
                  className="w-full bg-[#073f3a] text-white text-xs font-semibold py-2.5 rounded-full text-center"
                >
                  Sign In or Create Account
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
