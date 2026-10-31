import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_DESTINATIONS } from '../data/initialData';
import { calculateBudget } from '../utils/planner';
import {
  Search,
  Sparkles,
  MapPin,
  Calendar,
  Heart,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Bus,
  Languages,
  DollarSign,
  Utensils,
  Compass,
  ArrowRight,
  ShieldAlert,
  Smartphone,
  Download,
  Check,
} from 'lucide-react';
import { PWAInstallButton } from '../components/PWAInstallButton';

export const HomePage: React.FC = () => {
  const { navigateTo, toggleFavorite, isFavorite } = useAuth();

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Discover category filter
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Checklist items
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Save your campus and accommodation address', done: false },
    { id: 2, text: 'Learn the nearest public transport stop (MRT / LRT)', done: false },
    { id: 3, text: 'Get a local Malaysian SIM or 5G data plan', done: false },
    { id: 4, text: 'Locate a nearby clinic, pharmacy, and grocery store', done: false },
    { id: 5, text: 'Save important emergency contacts (Malaysia 999)', done: false },
  ]);

  // Budget calculator inputs
  const [foodCost, setFoodCost] = useState(450);
  const [transportCost, setTransportCost] = useState(120);
  const [stayCost, setStayCost] = useState(500);
  const [otherCost, setOtherCost] = useState(130);

  // Welcome modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalBody, setModalBody] = useState<React.ReactNode>(null);

  const budgetBreakdown = calculateBudget({
    food: foodCost,
    transport: transportCost,
    stay: stayCost,
    other: otherCost,
  });

  const toggleChecklist = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const completedCount = checklist.filter((item) => item.done).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('search', { q: searchQuery });
    } else {
      navigateTo('search');
    }
  };

  const filteredPlaces = INITIAL_DESTINATIONS.filter((p) => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Study') return p.category === 'Study';
    return p.category === activeCategory;
  });

  const openInfoModal = (title: string, content: React.ReactNode) => {
    setModalTitle(title);
    setModalBody(content);
    setModalOpen(true);
  };

  return (
    <div className="space-y-12">
      {/* 1. HERO SECTION */}
      <section className="pt-8 pb-4">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left copy */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-2 bg-[#e5f1dc] text-[#28583d] rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
                <span>✦</span> Made for student & traveler life in Malaysia
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-2px] text-[#172b2a] leading-[1.1]">
                Hey, mate!<br />
                Make Malaysia<br />
                feel like <span className="text-[#ff5c7a]">home.</span>
              </h1>

              <p className="text-base text-[#586762] leading-relaxed max-w-xl">
                New place, same worries? We’ve got you. Find local food, get around with Touch 'n Go, learn everyday phrases, and explore destinations with interactive maps and AI assistance.
              </p>

              {/* Main CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => navigateTo('explore-map')}
                  className="bg-[#073f3a] hover:bg-[#063430] text-white font-semibold text-sm px-6 py-3.5 rounded-full transition-all flex items-center gap-2 shadow-md hover:-translate-y-0.5"
                >
                  <MapPin className="w-4 h-4 text-[#ffeb9a]" />
                  <span>Explore Interactive Map</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => navigateTo('ai-assistant')}
                  className="bg-white hover:bg-[#f0ece3] text-[#172b2a] border border-[#e9e5dc] font-semibold text-sm px-6 py-3.5 rounded-full transition-all flex items-center gap-2 shadow-sm hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4 text-[#ff5c7a]" />
                  <span>Ask AI Assistant</span>
                </button>
                <PWAInstallButton variant="hero" />
              </div>

              {/* Search Bar */}
              <form onSubmit={handleHeroSearch} className="pt-2">
                <div className="bg-white border border-[#e9e5dc] rounded-2xl p-2 flex items-center gap-2 max-w-xl shadow-sm focus-within:ring-2 focus-within:ring-[#073f3a]/20">
                  <span className="pl-3 text-lg" aria-hidden="true">🔎</span>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search food, landmarks, MRT stations..."
                    className="flex-1 bg-transparent border-0 outline-none text-sm px-2 text-[#172b2a] placeholder-[#9ca8a4]"
                    aria-label="Search destinations in Malaysia"
                  />
                  <button
                    type="submit"
                    className="bg-[#ff5c7a] hover:bg-[#f04f6e] text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-sm"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Micro-proof */}
              <div className="flex items-center gap-3 text-xs text-[#6f7d79] pt-2">
                <div className="flex -space-x-2">
                  <span className="w-7 h-7 rounded-full bg-[#ffd9df] border-2 border-[#f7f3eb] grid place-items-center text-xs">👩🏻</span>
                  <span className="w-7 h-7 rounded-full bg-[#c9e9ef] border-2 border-[#f7f3eb] grid place-items-center text-xs">👨🏽</span>
                  <span className="w-7 h-7 rounded-full bg-[#d8edbc] border-2 border-[#f7f3eb] grid place-items-center text-xs">👩🏾</span>
                </div>
                <span>Curated local tips. Verified maps. A more confident you.</span>
              </div>
            </div>

            {/* Right visual card */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-[450px]">
                <img
                  src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1000&q=85"
                  alt="Kuala Lumpur skyline and city life"
                  className="w-full h-[380px] sm:h-[420px] object-cover rounded-[36px_36px_100px_36px] shadow-xl border-4 border-white"
                />

                {/* Floating pill 1 */}
                <div className="absolute top-8 -left-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg flex items-center gap-3 border border-[#e9e5dc] animate-in fade-in slide-in-from-left duration-300">
                  <span className="w-10 h-10 rounded-xl bg-[#e1f0cf] grid place-items-center text-xl">🍜</span>
                  <div>
                    <div className="font-bold text-xs text-[#172b2a]">Local favourites</div>
                    <div className="text-[10px] text-[#6f7d79]">Discover authentic food</div>
                  </div>
                </div>

                {/* Floating pill 2 */}
                <div className="absolute bottom-8 -right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg flex items-center gap-3 border border-[#e9e5dc] animate-in fade-in slide-in-from-right duration-300">
                  <span className="w-10 h-10 rounded-xl bg-[#ffe0e5] grid place-items-center text-xl">🚆</span>
                  <div>
                    <div className="font-bold text-xs text-[#172b2a]">Getting around</div>
                    <div className="text-[10px] text-[#6f7d79]">MRT, Touch 'n Go & Grab</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURE TILES ("What do you need today?") */}
      <section className="py-6">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <span className="text-[11px] text-[#398077] uppercase tracking-wider font-bold">Your everyday sidekick</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172b2a] tracking-tight mt-1">What do you need today?</h2>
            <p className="text-xs text-[#6f7d79] mt-1">Direct access to your Malaysian companions.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              onClick={() => navigateTo('translate')}
              className="bg-white border border-[#e9e5dc] hover:border-[#073f3a] rounded-2xl p-4 text-center transition-all hover:-translate-y-1 hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#dff0fa] grid place-items-center text-2xl mx-auto mb-2 group-hover:scale-105 transition-transform">
                💬
              </div>
              <strong className="block text-xs font-bold text-[#172b2a]">Translate</strong>
              <small className="block text-[10px] text-[#6f7d79] mt-1">Everyday Malay</small>
            </button>

            <button
              onClick={() => navigateTo('transport-guide')}
              className="bg-white border border-[#e9e5dc] hover:border-[#073f3a] rounded-2xl p-4 text-center transition-all hover:-translate-y-1 hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#e3f1cc] grid place-items-center text-2xl mx-auto mb-2 group-hover:scale-105 transition-transform">
                🚆
              </div>
              <strong className="block text-xs font-bold text-[#172b2a]">Transport</strong>
              <small className="block text-[10px] text-[#6f7d79] mt-1">TNG & Grab tutorials</small>
            </button>

            <button
              onClick={() => navigateTo('search', { category: 'Food' })}
              className="bg-white border border-[#e9e5dc] hover:border-[#073f3a] rounded-2xl p-4 text-center transition-all hover:-translate-y-1 hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#fff0c0] grid place-items-center text-2xl mx-auto mb-2 group-hover:scale-105 transition-transform">
                🍜
              </div>
              <strong className="block text-xs font-bold text-[#172b2a]">Local Food</strong>
              <small className="block text-[10px] text-[#6f7d79] mt-1">Eat like a local</small>
            </button>

            <button
              onClick={() => navigateTo('trip-planner')}
              className="bg-white border border-[#e9e5dc] hover:border-[#073f3a] rounded-2xl p-4 text-center transition-all hover:-translate-y-1 hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#ffe0e5] grid place-items-center text-2xl mx-auto mb-2 group-hover:scale-105 transition-transform">
                🗓️
              </div>
              <strong className="block text-xs font-bold text-[#172b2a]">Trip Planner</strong>
              <small className="block text-[10px] text-[#6f7d79] mt-1">1-Day KL itineraries</small>
            </button>

            <button
              onClick={() => navigateTo('explore-map')}
              className="bg-white border border-[#e9e5dc] hover:border-[#073f3a] rounded-2xl p-4 text-center transition-all hover:-translate-y-1 hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#d5f0f1] grid place-items-center text-2xl mx-auto mb-2 group-hover:scale-105 transition-transform">
                📍
              </div>
              <strong className="block text-xs font-bold text-[#172b2a]">Explore Map</strong>
              <small className="block text-[10px] text-[#6f7d79] mt-1">Interactive routes</small>
            </button>

            <button
              onClick={() => openInfoModal('Malaysia Emergency Help 🛟', (
                <div className="space-y-3 text-xs text-[#52645b] leading-relaxed">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 font-bold text-sm">
                    🚨 Malaysia National Emergency Number: 999
                  </div>
                  <p>In any life-threatening emergency, call <strong>999</strong> immediately for Police, Ambulance, or Fire & Rescue.</p>
                  <p><strong>Tourist Police Hotline:</strong> 03-2149 6590</p>
                  <p><strong>Rapid KL Customer Service:</strong> 03-7885 2585 (Transit inquiries and lost & found)</p>
                  <p>Keep your passport photocopy, student ID card, and health insurance policy number saved on your phone.</p>
                </div>
              ))}
              className="bg-white border border-[#e9e5dc] hover:border-[#073f3a] rounded-2xl p-4 text-center transition-all hover:-translate-y-1 hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#ffdde0] grid place-items-center text-2xl mx-auto mb-2 group-hover:scale-105 transition-transform">
                🛟
              </div>
              <strong className="block text-xs font-bold text-[#172b2a]">Emergency</strong>
              <small className="block text-[10px] text-[#6f7d79] mt-1">999 & Student help</small>
            </button>
          </div>
        </div>
      </section>

      {/* 3. DISCOVER SECTION */}
      <section className="py-8 bg-white/70 border-y border-[#e9e5dc]/60">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] text-[#398077] uppercase tracking-wider font-bold">A little closer to local</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172b2a] tracking-tight mt-1">Explore student-friendly spots</h2>
              <p className="text-xs text-[#6f7d79] mt-1">Curated spots to discover food, landmarks, and transit hubs across Malaysia.</p>
            </div>
            <button
              onClick={() => navigateTo('search')}
              className="text-xs font-bold text-[#073f3a] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View all places in search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
            {['All', 'Attractions', 'Food', 'Culture', 'Explore', 'Study'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-4 py-2 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#073f3a] text-white shadow-sm'
                    : 'bg-white border border-[#e9e5dc] text-[#52615c] hover:bg-[#f0ece3]'
                }`}
              >
                {cat === 'All' ? 'All places' : cat}
              </button>
            ))}
          </div>

          {/* Places Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.slice(0, 6).map((place) => {
              const saved = isFavorite(place.id);
              return (
                <article
                  key={place.id}
                  className="bg-white border border-[#e9e5dc] rounded-3xl overflow-hidden hover:shadow-lg transition-all flex flex-col group"
                >
                  <div className="h-48 relative overflow-hidden bg-[#e6e5db]">
                    <img
                      src={place.imageUrl}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#172b2a] shadow-sm">
                      {place.category}
                    </span>
                    <button
                      onClick={() => toggleFavorite(place.id)}
                      className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-md grid place-items-center transition-all ${
                        saved ? 'text-[#ff5c7a]' : 'text-[#68736e] hover:text-[#ff5c7a]'
                      }`}
                      aria-label={saved ? 'Remove from favorites' : 'Save place'}
                    >
                      <Heart className={`w-4 h-4 ${saved ? 'fill-[#ff5c7a]' : ''}`} />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-bold text-base text-[#172b2a] leading-tight group-hover:text-[#073f3a] transition-colors">
                          {place.name}
                        </h3>
                        <span className="text-xs font-semibold text-[#8c6a13] whitespace-nowrap">
                          ★ {place.rating}
                        </span>
                      </div>
                      <p className="text-xs text-[#6f7d79] line-clamp-2 leading-relaxed mb-3">
                        {place.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#f0eee8] flex items-center justify-between text-[11px] text-[#6f7d79]">
                      <span className="truncate max-w-[140px]">📍 {place.distance}</span>
                      <span className="font-bold text-[#073f3a]">{place.price}</span>
                    </div>

                    <div className="mt-3 pt-2 flex gap-2">
                      <button
                        onClick={() => navigateTo('explore-map', { selectedPlaceId: place.id })}
                        className="flex-1 bg-[#f7f3eb] hover:bg-[#e9e5dc] text-[#073f3a] text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>View on Map</span>
                      </button>
                      <button
                        onClick={() => navigateTo('trip-planner', { addPlace: place })}
                        className="bg-[#073f3a] hover:bg-[#063430] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                        title="Add to Itinerary"
                      >
                        + Trip
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. TRANSPORT BASICS & FIRST-WEEK CHECKLIST */}
      <section className="py-6">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <span className="text-[11px] text-[#398077] uppercase tracking-wider font-bold">Getting around, made easier</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172b2a] tracking-tight mt-1">Your next stop starts here.</h2>
            <p className="text-xs text-[#6f7d79] mt-1">Public transit guides and your first-week survival checklist.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Guide Card */}
            <article className="rounded-3xl p-8 bg-[#073f3a] text-white relative overflow-hidden flex flex-col justify-between shadow-lg">
              <div>
                <span className="inline-block bg-white/15 text-[#e1f1e8] text-xs font-bold px-3 py-1 rounded-full mb-4">
                  🚆 Transport & Payments
                </span>
                <h3 className="text-3xl font-extrabold leading-snug tracking-tight mb-3">
                  Less guesswork.<br />More exploring.
                </h3>
                <p className="text-xs text-[#d4e7df] leading-relaxed max-w-sm mb-6">
                  Learn how to set up your Touch 'n Go eWallet, reload funds, distinguish between physical cards and QR codes, and hail rides with Grab safely.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 relative z-10">
                <button
                  onClick={() => navigateTo('transport-guide', { tab: 'tng' })}
                  className="bg-[#ffeb9a] hover:bg-[#ffe373] text-[#172b2a] text-xs font-bold px-5 py-3 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Touch 'n Go Tutorial</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => navigateTo('transport-guide', { tab: 'grab' })}
                  className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-3 rounded-full transition-all"
                >
                  <span>Grab Booking Guide</span>
                </button>
              </div>

              <span className="absolute -right-4 -bottom-8 text-8xl opacity-15 pointer-events-none select-none">
                🚉
              </span>
            </article>

            {/* Interactive Survival Checklist */}
            <div className="bg-white border border-[#e9e5dc] rounded-3xl p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-[#172b2a]">Your first-week checklist 📝</h3>
                  <span className="text-xs font-bold text-[#073f3a] bg-[#e5f1dc] px-2.5 py-1 rounded-full">
                    {progressPercent}%
                  </span>
                </div>
                <p className="text-xs text-[#6f7d79] mb-4">Small steps to feel confident and at home in Malaysia.</p>

                <div className="space-y-3">
                  {checklist.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                        item.done
                          ? 'bg-[#f7fbf4] border-[#d8edbc] text-[#718279]'
                          : 'bg-[#faf8f3] border-[#e9e5dc] text-[#172b2a] hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => toggleChecklist(item.id)}
                        className="mt-0.5 w-4 h-4 rounded text-[#073f3a] accent-[#073f3a] cursor-pointer"
                      />
                      <span className={item.done ? 'line-through text-[#8b9994]' : 'font-medium'}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#f0eee8]">
                <div className="h-2 bg-[#edf0e9] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-[#abd96c] rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#6f7d79]">
                  <span>{completedCount} of {checklist.length} completed</span>
                  <span className="font-semibold text-[#073f3a]">One step at a time 💚</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STUDENT BUDGET CALCULATOR */}
      <section className="py-8 bg-[#e9f2df] rounded-3xl mx-4 sm:mx-6 border border-[#d6e5c8]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              <span className="text-[11px] text-[#28583d] uppercase tracking-wider font-bold">Student money matters</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172b2a] tracking-tight">
                Small spends add up.<br />Stay in control.
              </h2>
              <p className="text-xs text-[#52645b] leading-relaxed">
                Build a simple monthly budget estimate for food, transport, accommodation, and campus essentials. This runs locally in your browser.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigateTo('trip-planner')}
                  className="text-xs font-bold text-[#073f3a] hover:underline flex items-center gap-1"
                >
                  <span>Build a trip budget with Trip Planner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#e1ebd7]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#6f7d79]">Estimated monthly student budget</span>
                <span className="text-xs text-[#073f3a] font-bold">Currency: MYR</span>
              </div>

              <div className="text-3xl sm:text-4xl font-extrabold text-[#073f3a] tracking-tight mb-6">
                RM {budgetBreakdown.total.toLocaleString()}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#172b2a] mb-1.5 flex justify-between">
                    <span>Food & Mamak (RM)</span>
                    <span className="text-[#6f7d79] font-normal">{budgetBreakdown.percentages.food}%</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={foodCost}
                    onChange={(e) => setFoodCost(Number(e.target.value) || 0)}
                    className="w-full border border-[#e9e5dc] rounded-xl p-2.5 text-xs bg-white outline-none focus:border-[#073f3a]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#172b2a] mb-1.5 flex justify-between">
                    <span>Transport / LRT (RM)</span>
                    <span className="text-[#6f7d79] font-normal">{budgetBreakdown.percentages.transport}%</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={transportCost}
                    onChange={(e) => setTransportCost(Number(e.target.value) || 0)}
                    className="w-full border border-[#e9e5dc] rounded-xl p-2.5 text-xs bg-white outline-none focus:border-[#073f3a]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#172b2a] mb-1.5 flex justify-between">
                    <span>Accommodation / Room (RM)</span>
                    <span className="text-[#6f7d79] font-normal">{budgetBreakdown.percentages.stay}%</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={stayCost}
                    onChange={(e) => setStayCost(Number(e.target.value) || 0)}
                    className="w-full border border-[#e9e5dc] rounded-xl p-2.5 text-xs bg-white outline-none focus:border-[#073f3a]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#172b2a] mb-1.5 flex justify-between">
                    <span>SIM / Books / Misc (RM)</span>
                    <span className="text-[#6f7d79] font-normal">{budgetBreakdown.percentages.other}%</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={otherCost}
                    onChange={(e) => setOtherCost(Number(e.target.value) || 0)}
                    className="w-full border border-[#e9e5dc] rounded-xl p-2.5 text-xs bg-white outline-none focus:border-[#073f3a]"
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f0eee8] text-[10px] text-[#6f7d79] flex items-center justify-between">
                <span>Illustrative student example only. Actual costs depend on your location.</span>
                <span className="font-semibold text-[#073f3a]">Tip: Rapid KL MyCity Pass = RM 5/day</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MOBILE APP & PWA SHOWCASE */}
      <section className="py-6">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-[#073f3a] via-[#094d47] to-[#101d50] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-white/10 relative overflow-hidden">
            {/* Background decorative circles */}
            <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-[#ff5c7a]/20 blur-3xl pointer-events-none" />
            <div className="absolute right-1/3 -top-16 w-64 h-64 rounded-full bg-[#ffeb9a]/15 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#ff5c7a] text-white rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider shadow-xs">
                  <span>📱</span> Installable Mobile & Desktop App
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Take MyLocal Mate with you everywhere in Malaysia.
                </h2>

                <p className="text-sm text-[#e0ece8] leading-relaxed max-w-xl">
                  Install directly to your phone or laptop with one tap. No App Store or Google Play downloads required. Enjoy lightning-fast launches, full-screen view, home screen icon, and offline access to transit guides & travel itineraries.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3">
                    <div className="text-base mb-1">⚡️</div>
                    <div className="text-xs font-bold text-white">Instant Launch</div>
                    <div className="text-[11px] text-white/70">From your Home Screen or taskbar</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3">
                    <div className="text-base mb-1">📶</div>
                    <div className="text-xs font-bold text-white">Offline Ready</div>
                    <div className="text-[11px] text-white/70">Cached transit guides and phrases</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3">
                    <div className="text-base mb-1">📱</div>
                    <div className="text-xs font-bold text-white">Full Screen</div>
                    <div className="text-[11px] text-white/70">Native app feel with zero browser bars</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <PWAInstallButton variant="hero" />
                  <button
                    onClick={() => openInfoModal(
                      'How to Install MyLocal Mate on Any Device',
                      <div className="space-y-4 text-xs text-[#172b2a]">
                        <p className="text-[#6f7d79]">
                          MyLocal Mate is built as a modern Progressive Web App (PWA). You can install it on any smartphone, tablet, or computer:
                        </p>
                        <div className="p-3 bg-white rounded-2xl border border-[#e9e5dc] space-y-1">
                          <span className="font-extrabold text-[#073f3a] block">🤖 Android (Google Chrome)</span>
                          <p>Tap the <strong>Install App</strong> button or tap the browser menu (⋮) and choose <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
                        </div>
                        <div className="p-3 bg-white rounded-2xl border border-[#e9e5dc] space-y-1">
                          <span className="font-extrabold text-[#073f3a] block">🍎 iPhone / iPad (Safari)</span>
                          <p>Tap the <strong>Share</strong> icon in the bottom Safari bar, scroll down and select <strong>"Add to Home Screen"</strong>.</p>
                        </div>
                        <div className="p-3 bg-white rounded-2xl border border-[#e9e5dc] space-y-1">
                          <span className="font-extrabold text-[#073f3a] block">💻 Mac & Windows PC (Chrome, Edge, Brave)</span>
                          <p>Click the <strong>Install icon</strong> in the browser URL bar or click the Install App button above.</p>
                        </div>
                      </div>
                    )}
                    className="bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-bold px-4 py-2.5 rounded-full transition-all"
                  >
                    View Installation Guide
                  </button>
                </div>
              </div>

              {/* Right phone mockup preview */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-[260px] sm:w-[280px] bg-[#172b2a] p-3 rounded-[36px] shadow-2xl border-4 border-white/30 relative">
                  {/* Phone notch */}
                  <div className="w-24 h-4 bg-black/60 rounded-full mx-auto mb-2" />
                  {/* Screen */}
                  <div className="bg-[#f7f3eb] rounded-[24px] p-3 text-[#172b2a] space-y-2.5 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-[#e9e5dc] pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#101d50] text-[8px] text-white grid place-items-center font-bold">🌺</span>
                        <span className="text-[11px] font-extrabold">MyLocal Mate</span>
                      </div>
                      <span className="text-[9px] bg-[#e5f1dc] text-[#28583d] font-bold px-1.5 py-0.5 rounded-full">App</span>
                    </div>

                    <div className="bg-[#073f3a] text-white p-2.5 rounded-xl space-y-1">
                      <div className="text-[10px] text-[#ffeb9a] font-bold">✨ AI Assistant Ready</div>
                      <div className="text-[11px] font-semibold leading-tight">"Where should I eat lunch near KLCC?"</div>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-[#e9e5dc] flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#0066cc]/10 text-[#0066cc] grid place-items-center font-black text-xs">
                        TnG
                      </div>
                      <div className="text-[10px]">
                        <span className="font-bold block">Touch 'n Go Transit</span>
                        <span className="text-[#6f7d79]">Ready for LRT & MRT</span>
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-[#e9e5dc] flex items-center justify-between text-[10px]">
                      <span className="font-bold">📍 1-Day KL Trip</span>
                      <span className="text-[#ff5c7a] font-black">5 Stops</span>
                    </div>

                    {/* App mini bottom nav */}
                    <div className="bg-white rounded-xl py-1.5 px-2 flex justify-around text-[8px] font-bold text-[#6f7d79] border border-[#e9e5dc]">
                      <span className="text-[#073f3a]">Home</span>
                      <span>Map</span>
                      <span className="text-[#ff5c7a]">AI Mate</span>
                      <span>Trips</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. EMERGENCY STRIP */}
      <section className="py-2">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="bg-[#ffe1e4] border border-[#fbd0d5] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white grid place-items-center text-2xl flex-shrink-0 shadow-sm">
                🛟
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#172b2a] mb-1">
                  Need help? You don’t have to figure it out alone.
                </h3>
                <p className="text-xs text-[#77575c] leading-relaxed max-w-2xl">
                  Keep emergency information accessible. In Malaysia, <strong>999</strong> is the nationwide emergency number for Police, Ambulance, and Fire. For translation assistance or transit queries, our AI Assistant and Phrasebook are always ready.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-stretch sm:self-auto flex-shrink-0">
              <a
                href="tel:999"
                className="bg-[#ff5c7a] hover:bg-[#f04f6e] text-white font-bold text-xs px-5 py-3 rounded-full transition-all text-center flex-1 sm:flex-initial shadow-sm"
              >
                Call 999
              </a>
              <button
                onClick={() => navigateTo('ai-assistant')}
                className="bg-white hover:bg-[#faf7f2] text-[#073f3a] font-bold text-xs px-5 py-3 rounded-full transition-all text-center border border-[#e9e5dc] flex-1 sm:flex-initial"
              >
                Ask Assistant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DIALOG */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#09201d]/60 backdrop-blur-sm grid place-items-center p-4">
          <div className="bg-[#f7f3eb] rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl border border-[#e9e5dc] animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white text-gray-500 hover:text-black grid place-items-center text-lg font-bold shadow-sm"
              aria-label="Close dialog"
            >
              ×
            </button>
            <h3 className="text-xl font-extrabold text-[#172b2a] mb-3">{modalTitle}</h3>
            <div>{modalBody}</div>
            <div className="mt-6 pt-4 border-t border-[#e9e5dc] text-right">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-[#073f3a] text-white text-xs font-semibold px-5 py-2.5 rounded-full"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
