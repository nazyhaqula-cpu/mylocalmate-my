import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 md:bottom-6 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-bottom-2 border border-amber-400/40"
    >
      <WifiOff className="w-4 h-4 animate-pulse text-amber-200" />
      <span>Offline Mode — Using cached data & itineraries</span>
    </div>
  );
};
