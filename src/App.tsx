/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { QuotaBanner } from './components/QuotaBanner';
import { HomePage } from './pages/HomePage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { SearchPage } from './pages/SearchPage';
import { ExploreMapPage } from './pages/ExploreMapPage';
import { TripPlannerPage } from './pages/TripPlannerPage';
import { TransportGuidePage } from './pages/TransportGuidePage';
import { TranslatePage } from './pages/TranslatePage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';

import { ChatBubble } from './components/ChatBubble';

const AppContent: React.FC = () => {
  const { activePage, toastMessage } = useAuth();

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'ai-assistant':
        return <AIAssistantPage />;
      case 'search':
        return <SearchPage />;
      case 'explore-map':
        return <ExploreMapPage />;
      case 'trip-planner':
        return <TripPlannerPage />;
      case 'transport-guide':
        return <TransportGuidePage />;
      case 'translate':
        return <TranslatePage />;
      case 'favorites':
      case 'profile':
        return <ProfilePage />;
      case 'auth':
        return <AuthPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f3eb] text-[#172b2a]">
      {/* Interactive Map Quota Warning Banner (if triggered) */}
      <QuotaBanner />

      {/* Main Navbar */}
      <Navbar />

      {/* Active Page View */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* Floating AI Assistant Chat Bubble in the corner */}
      <ChatBubble />

      {/* Main Footer */}
      <Footer />

      {/* Notification Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#073f3a] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-xl border border-white/20 z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
