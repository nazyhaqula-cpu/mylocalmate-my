import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_DESTINATIONS, SAMPLE_TRIP } from '../data/initialData';
import { SUPPORTED_LANGUAGES } from '../types';
import {
  User as UserIcon,
  Mail,
  Globe,
  Heart,
  Luggage,
  Settings,
  LogOut,
  Edit2,
  Check,
  MapPin,
  Calendar,
  Compass,
  Trash2,
  Shield,
  Sparkles,
} from 'lucide-react';

const INTEREST_OPTIONS = [
  'Food & Street Stalls',
  'Culture & Heritage',
  'Public Transit',
  'Budget Travel',
  'Nature & Parks',
  'Architecture & Landmarks',
  'Study Spots & Cafes',
  'Nightlife & Markets',
];

export const ProfilePage: React.FC = () => {
  const { user, logout, updateProfile, favorites, toggleFavorite, navigateTo, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'trips' | 'settings'>('profile');

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editLanguage, setEditLanguage] = useState(user?.preferredLanguage || 'English');
  const [editBudget, setEditBudget] = useState(user?.budgetPreference || 'Moderate (RM 50-150/day)');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.travelInterests || ['Food & Street Stalls', 'Culture & Heritage']
  );

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#f7f3eb] border border-[#e9e5dc] text-gray-400 grid place-items-center text-2xl mx-auto">
          🔒
        </div>
        <h2 className="text-xl font-bold text-[#172b2a]">Please Sign In</h2>
        <p className="text-xs text-[#6f7d79]">
          Sign in to view your profile, manage your saved favorites, and review trip itineraries.
        </p>
        <button
          onClick={() => navigateTo('auth')}
          className="bg-[#073f3a] text-white text-xs font-semibold px-6 py-2.5 rounded-full"
        >
          Sign In or Create Account
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: editName,
      preferredLanguage: editLanguage,
      budgetPreference: editBudget,
      travelInterests: selectedInterests,
    });
    setIsEditing(false);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  // Get favorite objects
  const savedDestinations = INITIAL_DESTINATIONS.filter((d) => favorites.includes(d.id));

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
      {/* Guest Mode Banner */}
      {user.isGuest && (
        <div className="bg-[#fff8e6] border border-[#f5d794] rounded-3xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-[#ffd770] grid place-items-center text-lg flex-shrink-0">
              🌿
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#694600]">You are browsing in Guest Mode</h2>
              <p className="text-xs text-[#8c6519]">
                Your favorites and preferences are saved on this browser. Create a free account or sign in to permanently back up your data!
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('auth')}
            className="bg-[#073f3a] hover:bg-[#063430] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-xs whitespace-nowrap transition-all"
          >
            Create Account / Sign In
          </button>
        </div>
      )}

      {/* Profile Header Hero */}
      <div className="bg-white border border-[#e9e5dc] rounded-3xl p-6 sm:p-8 shadow-sm mb-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-[#f7f3eb] shadow-sm flex-shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-extrabold text-[#172b2a]">{user.name}</h1>
              {user.isGuest ? (
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2.5 py-0.5 rounded-full">
                  Guest Explorer
                </span>
              ) : (
                <span className="text-[10px] bg-[#e5f1dc] text-[#28583d] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-[#cbe4c0]">
                  {user.authProvider === 'google' && <span>Google Verified ✓</span>}
                  {user.authProvider === 'facebook' && <span>Facebook Verified ✓</span>}
                  {(!user.authProvider || user.authProvider === 'email') && (
                    <span>{user.isVerified ? 'Email Verified ✓' : 'Unverified Member'}</span>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs text-[#6f7d79] mt-0.5">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-[11px] text-[#52645b]">
              <span>🌐 Language: {user.preferredLanguage}</span>
              <span>💰 Budget: {user.budgetPreference}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-[#f7f3eb] hover:bg-[#e9e5dc] text-[#073f3a] text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
          <button
            onClick={logout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e9e5dc] mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-[#073f3a] text-[#073f3a]'
              : 'border-transparent text-[#6f7d79] hover:text-[#172b2a]'
          }`}
        >
          <UserIcon className="w-4 h-4 text-[#073f3a]" />
          <span>My Profile & Interests</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'favorites'
              ? 'border-[#073f3a] text-[#073f3a]'
              : 'border-transparent text-[#6f7d79] hover:text-[#172b2a]'
          }`}
        >
          <Heart className="w-4 h-4 text-[#ff5c7a]" />
          <span>Saved Places ({savedDestinations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('trips')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'trips'
              ? 'border-[#073f3a] text-[#073f3a]'
              : 'border-transparent text-[#6f7d79] hover:text-[#172b2a]'
          }`}
        >
          <Luggage className="w-4 h-4 text-[#073f3a]" />
          <span>My Trips History</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-[#073f3a] text-[#073f3a]'
              : 'border-transparent text-[#6f7d79] hover:text-[#172b2a]'
          }`}
        >
          <Settings className="w-4 h-4 text-[#6f7d79]" />
          <span>Settings</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. Profile & Preferences */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-[#e9e5dc] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
              <h3 className="font-extrabold text-lg text-[#172b2a]">Edit Profile Details</h3>
              <div>
                <label className="block text-xs font-bold text-[#172b2a] mb-1">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#f7f3eb] border border-[#e9e5dc] rounded-xl p-2.5 text-xs text-[#172b2a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172b2a] mb-1">Preferred Language</label>
                <select
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value)}
                  className="w-full bg-[#f7f3eb] border border-[#e9e5dc] rounded-xl p-2.5 text-xs text-[#172b2a]"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.name}>
                      {l.name} ({l.native})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172b2a] mb-1">Budget Preference</label>
                <select
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  className="w-full bg-[#f7f3eb] border border-[#e9e5dc] rounded-xl p-2.5 text-xs text-[#172b2a]"
                >
                  <option value="Budget Student (Under RM 50/day)">Budget Student (Under RM 50/day)</option>
                  <option value="Moderate (RM 50-150/day)">Moderate (RM 50-150/day)</option>
                  <option value="Comfortable (RM 150+/day)">Comfortable (RM 150+/day)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172b2a] mb-2">Travel Interests</label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          isSelected
                            ? 'bg-[#073f3a] text-white border-[#073f3a]'
                            : 'bg-white text-[#52645b] border-[#e9e5dc]'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="bg-[#073f3a] text-white text-xs font-bold px-6 py-2.5 rounded-full"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-semibold text-[#6f7d79]"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-base text-[#172b2a] mb-3">Your Travel Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {(user.travelInterests || []).map((interest, idx) => (
                    <span
                      key={idx}
                      className="bg-[#f7f3eb] border border-[#e9e5dc] text-[#073f3a] text-xs font-semibold px-3 py-1.5 rounded-full"
                    >
                      ✦ {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#f0eee8] pt-4">
                <h3 className="font-extrabold text-base text-[#172b2a] mb-3">Account Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#52645b]">
                  <div className="p-4 bg-[#faf8f3] rounded-2xl border border-[#e9e5dc]">
                    <span className="font-bold text-[#172b2a] block mb-1">Email Address</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="p-4 bg-[#faf8f3] rounded-2xl border border-[#e9e5dc]">
                    <span className="font-bold text-[#172b2a] block mb-1">Account Created</span>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Favorites */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-[#172b2a]">
              Saved Destinations ({savedDestinations.length})
            </h3>
            <button
              onClick={() => navigateTo('search')}
              className="text-xs text-[#073f3a] font-bold hover:underline"
            >
              + Discover more places
            </button>
          </div>

          {savedDestinations.length === 0 ? (
            <div className="bg-white border border-[#e9e5dc] rounded-3xl p-12 text-center text-xs text-[#6f7d79]">
              <Heart className="w-8 h-8 text-[#ff5c7a]/40 mx-auto mb-2" />
              <p className="font-bold text-sm text-[#172b2a]">No saved places yet</p>
              <p className="mt-1">Tap the heart icon on any destination to save it here for later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedDestinations.map((dest) => (
                <div
                  key={dest.id}
                  className="bg-white border border-[#e9e5dc] rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div className="h-40 relative bg-[#e6e5db]">
                    <img src={dest.imageUrl} alt={dest.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => toggleFavorite(dest.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md grid place-items-center text-[#ff5c7a]"
                      title="Remove from favorites"
                    >
                      <Heart className="w-4 h-4 fill-[#ff5c7a]" />
                    </button>
                    <span className="absolute top-3 left-3 bg-white/95 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {dest.category}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#172b2a]">{dest.name}</h4>
                      <div className="text-[11px] text-[#8c6a13] font-semibold mt-0.5">★ {dest.rating}</div>
                      <p className="text-xs text-[#6f7d79] line-clamp-2 mt-1">{dest.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#f0eee8] flex items-center justify-between">
                      <button
                        onClick={() => navigateTo('explore-map', { selectedPlaceId: dest.id })}
                        className="text-xs font-bold text-[#073f3a] hover:underline flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3 text-[#ff5c7a]" />
                        <span>View on Map</span>
                      </button>
                      <button
                        onClick={() => navigateTo('trip-planner', { addPlace: dest })}
                        className="text-[10px] bg-[#073f3a] text-white font-semibold px-2.5 py-1 rounded-lg"
                      >
                        + Add to Trip
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Trips History */}
      {activeTab === 'trips' && (
        <div className="bg-white border border-[#e9e5dc] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-[#172b2a]">Saved Itineraries</h3>
            <button
              onClick={() => navigateTo('trip-planner')}
              className="text-xs text-[#073f3a] font-bold hover:underline"
            >
              Open Trip Planner →
            </button>
          </div>

          <div className="p-4 bg-[#faf8f3] border border-[#e9e5dc] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="font-bold text-sm text-[#172b2a]">Kuala Lumpur — One-Day City Trip</div>
              <div className="text-xs text-[#6f7d79] mt-0.5">
                4 stops planned · KLCC, Jalan Alor, Central Market, Dataran Merdeka
              </div>
            </div>
            <button
              onClick={() => navigateTo('trip-planner')}
              className="bg-[#073f3a] text-white text-xs font-semibold px-4 py-2 rounded-xl"
            >
              View Itinerary
            </button>
          </div>
        </div>
      )}

      {/* 4. Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-[#e9e5dc] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-xl">
          <h3 className="font-extrabold text-base text-[#172b2a]">Account & App Settings</h3>

          <div className="space-y-4 text-xs text-[#172b2a]">
            <div className="p-4 bg-[#faf8f3] rounded-2xl border border-[#e9e5dc] flex items-center justify-between">
              <div>
                <strong className="block font-bold">Language Preferences</strong>
                <span className="text-[#6f7d79]">Active language for system text & translation</span>
              </div>
              <span className="font-bold text-[#073f3a]">{user.preferredLanguage}</span>
            </div>

            <div className="p-4 bg-[#faf8f3] rounded-2xl border border-[#e9e5dc] flex items-center justify-between">
              <div>
                <strong className="block font-bold">Transit Map Engine</strong>
                <span className="text-[#6f7d79]">Interactive Maps & Verified Places Network</span>
              </div>
              <span className="font-bold text-[#28583d]">Connected ✓</span>
            </div>

            <div className="p-4 bg-[#faf8f3] rounded-2xl border border-[#e9e5dc] flex items-center justify-between">
              <div>
                <strong className="block font-bold">AI Assistant Service</strong>
                <span className="text-[#6f7d79]">Smart Local Intelligence Companion</span>
              </div>
              <span className="font-bold text-[#28583d]">Active ✓</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#f0eee8]">
            <button
              onClick={logout}
              className="w-full bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs py-3 rounded-2xl transition-colors text-center"
            >
              Sign Out of Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
