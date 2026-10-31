import React from 'react';
import { LogoSvg } from './Navbar';
import { useAuth } from '../context/AuthContext';
import { Heart, Compass, ShieldAlert, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useAuth();

  return (
    <footer className="bg-[#073f3a] text-white pt-12 pb-8 mt-16 border-t border-[#073f3a]/80">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between gap-10 pb-10 border-b border-white/15">
          {/* Brand Column */}
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-3">
              <LogoSvg size={42} />
              <span className="font-extrabold text-[22px] tracking-[-0.8px] text-white">
                MyLocal <span className="text-[#ff5c7a]">Mate</span>
              </span>
            </div>
            <p className="text-[#c7ddd6] text-xs leading-relaxed mb-4">
              From just landed to confident local. An integrated discovery and travel companion platform tailored for students, visitors, and expats in Malaysia.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#ffeb9a]">
              <span>💚</span>
              <span>Discover · Navigate · Belong in Malaysia</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Discover</h4>
              <ul className="space-y-2 text-[#c7ddd6]">
                <li>
                  <button onClick={() => navigateTo('search')} className="hover:text-white transition-colors">
                    Search Places
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('explore-map')} className="hover:text-white transition-colors">
                    Explore Interactive Map
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('trip-planner')} className="hover:text-white transition-colors">
                    Trip Planner & Itineraries
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('favorites')} className="hover:text-white transition-colors">
                    Saved Places
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Travel Guides</h4>
              <ul className="space-y-2 text-[#c7ddd6]">
                <li>
                  <button onClick={() => navigateTo('transport-guide', { tab: 'tng' })} className="hover:text-white transition-colors">
                    Touch 'n Go eWallet
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('transport-guide', { tab: 'grab' })} className="hover:text-white transition-colors">
                    Grab Booking Guide
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('transport-guide', { tab: 'transit' })} className="hover:text-white transition-colors">
                    Rapid KL Transit Network
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('translate')} className="hover:text-white transition-colors">
                    Malay Phrasebook
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Support & Safety</h4>
              <ul className="space-y-2 text-[#c7ddd6]">
                <li>
                  <button onClick={() => navigateTo('ai-assistant')} className="hover:text-white transition-colors flex items-center gap-1">
                    <span>Ask AI Assistant</span>
                  </button>
                </li>
                <li>
                  <a href="tel:999" className="hover:text-[#ffeb9a] flex items-center gap-1 font-semibold text-white">
                    <Phone className="w-3 h-3 text-[#ff5c7a]" /> Emergency 999
                  </a>
                </li>
                <li>
                  <button onClick={() => navigateTo('profile')} className="hover:text-white transition-colors">
                    User Settings
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#c7ddd6]">
          <span>© 2026 MyLocal Mate · Local discovery and travel companion platform</span>
          <span className="flex items-center gap-1 text-[#ffeb9a]">
            Made with <Heart className="w-3 h-3 fill-[#ff5c7a] text-[#ff5c7a]" /> for student life in Malaysia
          </span>
        </div>
      </div>
    </footer>
  );
};
