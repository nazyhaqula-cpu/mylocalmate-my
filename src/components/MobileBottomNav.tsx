import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, MapPin, Sparkles, CalendarDays, Bus, Heart } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activePage, navigateTo, favorites } = useAuth();

  const navTabs = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'explore-map', label: 'Explore', icon: MapPin },
    { id: 'ai-assistant', label: 'AI Mate', icon: Sparkles, isHighlight: true },
    { id: 'trip-planner', label: 'Trips', icon: CalendarDays },
    { id: 'transport-guide', label: 'Guides', icon: Bus },
    { id: 'favorites', label: 'Saved', icon: Heart, count: favorites.length },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#f7f3eb]/95 backdrop-blur-md border-t border-[#172b2a]/10 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activePage === tab.id;

          if (tab.isHighlight) {
            return (
              <button
                key={tab.id}
                onClick={() => navigateTo(tab.id)}
                className="flex flex-col items-center justify-center -mt-4 relative group focus:outline-none"
                aria-label={tab.label}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    isActive
                      ? 'bg-[#ff5c7a] text-white ring-4 ring-[#ff5c7a]/20'
                      : 'bg-[#073f3a] text-[#ffeb9a] hover:bg-[#063430]'
                  }`}
                >
                  <Icon className="w-5 h-5 animate-pulse" />
                </div>
                <span
                  className={`text-[10px] font-extrabold mt-1 tracking-tight ${
                    isActive ? 'text-[#ff5c7a]' : 'text-[#073f3a]'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => navigateTo(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive ? 'text-[#073f3a]' : 'text-[#6f7d79] hover:text-[#172b2a]'
              }`}
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#ff5c7a] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-black text-[#073f3a]' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#073f3a] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
