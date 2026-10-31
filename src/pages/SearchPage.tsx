import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Destination } from '../types';
import { INITIAL_DESTINATIONS } from '../data/initialData';
import {
  buildWebSearchUrl,
  buildMapNavigationUrl,
  categorizeRecommendations,
} from '../utils/planner';
import {
  Search as SearchIcon,
  MapPin,
  Heart,
  ExternalLink,
  Sparkles,
  Globe,
  Loader2,
  Utensils,
  Train,
  Luggage,
  Navigation,
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { pageParams, navigateTo, toggleFavorite, isFavorite } = useAuth();
  const [searchTerm, setSearchTerm] = useState(pageParams?.q || '');
  const [selectedCategory, setSelectedCategory] = useState(pageParams?.category || 'All');
  const [selectedCity, setSelectedCity] = useState(pageParams?.city || 'All');
  const [recommendationTab, setRecommendationTab] = useState<'all' | 'culinary' | 'trips' | 'transportation'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [curatedResults, setCuratedResults] = useState<Destination[]>(INITIAL_DESTINATIONS);
  const [verifiedPlacesResults, setVerifiedPlacesResults] = useState<any[]>([]);
  const [webSearchIntegration, setWebSearchIntegration] = useState<{
    webSearchUrl: string;
    mapNavigationUrl: string;
    imageSearchUrl: string;
    recommendedQueries: { label: string; query: string }[];
  }>({
    webSearchUrl: buildWebSearchUrl(''),
    mapNavigationUrl: buildMapNavigationUrl('Kuala Lumpur'),
    imageSearchUrl: '',
    recommendedQueries: [],
  });

  const categories = ['All', 'Attractions', 'Food', 'Culture', 'Transport', 'Explore', 'Study'];
  const cities = ['All', 'Kuala Lumpur', 'Petaling Jaya', 'Selangor', 'Penang', 'Melaka'];

  // Categorize database recommendations
  const categorizedRecs = categorizeRecommendations(curatedResults);

  const executeSearch = async (query = searchTerm, cat = selectedCategory, city = selectedCity) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (cat !== 'All') params.append('category', cat);
      if (city !== 'All') params.append('location', city);

      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCuratedResults(data.curatedResults || INITIAL_DESTINATIONS);
        setVerifiedPlacesResults(data.verifiedPlacesResults || []);
        if (data.webSearchIntegration) {
          setWebSearchIntegration(data.webSearchIntegration);
        }
      } else {
        const filtered = INITIAL_DESTINATIONS.filter((d) => {
          const matchCat = cat === 'All' || d.category === cat;
          const matchCity = city === 'All' || d.city === city;
          const matchQ =
            !query ||
            [d.name, d.category, d.description, d.address, ...(d.tags || [])]
              .join(' ')
              .toLowerCase()
              .includes(query.toLowerCase());
          return matchCat && matchCity && matchQ;
        });
        setCuratedResults(filtered);
      }
    } catch (err) {
      console.warn('Search API error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(searchTerm, selectedCategory, selectedCity);
  }, [selectedCategory, selectedCity]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const activeRecommendationList =
    recommendationTab === 'culinary'
      ? categorizedRecs.culinary
      : recommendationTab === 'trips'
      ? categorizedRecs.trips
      : recommendationTab === 'transportation'
      ? categorizedRecs.transportation
      : curatedResults;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <span className="text-xs font-bold text-[#398077] uppercase tracking-wider flex items-center gap-1.5 mb-1">
          <Globe className="w-3.5 h-3.5 text-[#073f3a]" />
          <span>Verified Directory & Web Discovery</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172b2a] tracking-tight">
          Find Culinary, Trips & Transportation Info
        </h1>
        <p className="text-xs sm:text-sm text-[#6f7d79] mt-1 max-w-2xl">
          Discover verified dining spots, curated trip itineraries, and public transit navigation backed by authentic location data and interactive maps.
        </p>
      </div>

      {/* Category Recommendation Tabs */}
      <div className="bg-[#faf8f3] border border-[#e9e5dc] rounded-3xl p-3 sm:p-4 mb-6 shadow-xs">
        <div className="text-[11px] font-bold text-[#6f7d79] uppercase tracking-wider mb-2.5 px-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#ff5c7a]" />
            <span>Curated Local Recommendations</span>
          </span>
          <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#e9e5dc] text-[#073f3a]">
            Curated & Verified
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setRecommendationTab('all')}
            className={`p-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 justify-center ${
              recommendationTab === 'all'
                ? 'bg-[#073f3a] text-white shadow-sm'
                : 'bg-white border border-[#e9e5dc] text-[#52615c] hover:bg-[#f0ece3]'
            }`}
          >
            <span>🌟</span>
            <span>All Picks ({curatedResults.length})</span>
          </button>

          <button
            onClick={() => setRecommendationTab('culinary')}
            className={`p-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 justify-center ${
              recommendationTab === 'culinary'
                ? 'bg-[#073f3a] text-white shadow-sm'
                : 'bg-white border border-[#e9e5dc] text-[#52615c] hover:bg-[#f0ece3]'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-[#e58e26]" />
            <span>Culinary & Food ({categorizedRecs.culinary.length})</span>
          </button>

          <button
            onClick={() => setRecommendationTab('trips')}
            className={`p-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 justify-center ${
              recommendationTab === 'trips'
                ? 'bg-[#073f3a] text-white shadow-sm'
                : 'bg-white border border-[#e9e5dc] text-[#52615c] hover:bg-[#f0ece3]'
            }`}
          >
            <Luggage className="w-3.5 h-3.5 text-[#ff5c7a]" />
            <span>Trip Itineraries ({categorizedRecs.trips.length})</span>
          </button>

          <button
            onClick={() => setRecommendationTab('transportation')}
            className={`p-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 justify-center ${
              recommendationTab === 'transportation'
                ? 'bg-[#073f3a] text-white shadow-sm'
                : 'bg-white border border-[#e9e5dc] text-[#52615c] hover:bg-[#f0ece3]'
            }`}
          >
            <Train className="w-3.5 h-3.5 text-[#0984e3]" />
            <span>Transit & Map Info ({categorizedRecs.transportation.length})</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#e9e5dc] rounded-3xl p-4 sm:p-6 shadow-sm mb-6 space-y-4">
        <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-[#f7f3eb] rounded-2xl px-4 py-3 flex items-center gap-2 border border-[#e9e5dc] focus-within:border-[#073f3a] focus-within:bg-white transition-all">
            <SearchIcon className="w-4 h-4 text-[#6f7d79]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search culinary, trips, MRT stations, or keyword (e.g. Nasi Lemak, Pasar Seni, Batu Caves)..."
              className="flex-1 bg-transparent border-0 outline-none text-xs sm:text-sm text-[#172b2a]"
              aria-label="Search places"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-[#f7f3eb] border border-[#e9e5dc] text-xs font-semibold text-[#172b2a] px-3 py-3 rounded-2xl outline-none focus:border-[#073f3a]"
              aria-label="Filter by City"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city === 'All' ? 'All Locations' : city}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#073f3a] hover:bg-[#063430] text-white font-semibold text-xs px-6 py-3 rounded-2xl transition-all shadow-sm flex items-center gap-1.5"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Quick Search Suggestions */}
        <div className="pt-1 border-t border-[#f0eee8] flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-[#6f7d79] whitespace-nowrap flex items-center gap-1">
            <Globe className="w-3 h-3 text-[#073f3a]" />
            <span>Trending Search Queries:</span>
          </span>
          {[
            'Best Nasi Lemak in Klang Valley',
            'Jalan Alor Night Food Street',
            'MRT Kajang Line Route',
            'KL Sentral to KLCC LRT',
            'Batu Caves Murugan Temple',
            'Penang Street Art Walk',
          ].map((q) => (
            <button
              key={q}
              onClick={() => {
                setSearchTerm(q);
                executeSearch(q, selectedCategory, selectedCity);
              }}
              className="text-[11px] bg-[#faf8f3] hover:bg-[#073f3a] hover:text-white text-[#52645b] px-3 py-1 rounded-full border border-[#e9e5dc] transition-all whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Web & Map Navigation Bar */}
      <div className="bg-[#eef7f2] border border-[#d2ecde] rounded-3xl p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#073f3a] text-white grid place-items-center flex-shrink-0 font-bold text-sm shadow-xs">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-[#073f3a]">
                Web Discovery & Live Map Navigation
              </h3>
              <span className="text-[10px] bg-white text-[#28583d] font-bold px-2 py-0.5 rounded-full border border-[#d2ecde]">
                Verified
              </span>
            </div>
            <p className="text-xs text-[#52645b] mt-0.5">
              Explore web articles, directions, and live transit routes for "{searchTerm || 'Malaysia destinations'}".
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <a
            href={webSearchIntegration.webSearchUrl || buildWebSearchUrl(searchTerm)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial bg-white hover:bg-[#faf7f2] border border-[#d2ecde] text-[#073f3a] text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web Search</span>
            <ExternalLink className="w-3 h-3 text-[#6f7d79]" />
          </a>

          <a
            href={buildMapNavigationUrl(searchTerm || 'Kuala Lumpur', selectedCity !== 'All' ? selectedCity : undefined)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial bg-[#073f3a] hover:bg-[#063430] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5 text-[#ffeb9a]" />
            <span>Map Directions</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-8">
        {/* Live Verified Place Matches (if returned) */}
        {verifiedPlacesResults.length > 0 && (
          <div className="bg-white border-2 border-[#d2ecde] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#073f3a] text-white grid place-items-center text-xs font-bold">
                  ✓
                </span>
                <h2 className="font-bold text-sm text-[#073f3a]">
                  Live Verified Place Matches ({verifiedPlacesResults.length})
                </h2>
                <span className="text-[10px] bg-[#e5f1dc] text-[#28583d] font-bold px-2 py-0.5 rounded-full">
                  Live Verified
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {verifiedPlacesResults.map((place) => (
                <div key={place.id} className="bg-[#faf8f3] rounded-2xl p-4 border border-[#e9e5dc] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-xs text-[#172b2a] line-clamp-1">{place.name}</h3>
                      <span className="text-[11px] font-semibold text-[#8c6a13]">★ {place.rating}</span>
                    </div>
                    <p className="text-[11px] text-[#6f7d79] line-clamp-2 mt-1">{place.address}</p>
                    <p className="text-[10px] text-[#52645b] line-clamp-2 mt-1 italic">{place.description}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#f0eee8] flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigateTo('explore-map', { selectedPlace: place })}
                      className="text-xs font-bold text-[#073f3a] hover:underline flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3 text-[#ff5c7a]" />
                      <span>View on Explore Map</span>
                    </button>
                    <a
                      href={place.webSearchUrl || buildWebSearchUrl(place.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] bg-white border border-[#e9e5dc] text-[#073f3a] font-semibold px-2 py-1 rounded-lg hover:bg-[#f0ece3] flex items-center gap-1"
                    >
                      <span>Web Info</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Curated Recommendations Directory */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-[#172b2a] flex items-center gap-2">
              <span>
                {recommendationTab === 'culinary'
                  ? '🍜 Curated Culinary & Dining Spots'
                  : recommendationTab === 'trips'
                  ? '🗓️ Curated Trip Itineraries & Landmarks'
                  : recommendationTab === 'transportation'
                  ? '🚆 Transportation Hubs & Transit Map Info'
                  : 'Curated Directory'}
              </span>
              <span className="text-xs font-normal text-[#6f7d79]">({activeRecommendationList.length} spots)</span>
            </h2>

            <a
              href={webSearchIntegration.webSearchUrl || buildWebSearchUrl(searchTerm)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#073f3a] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Web Search</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {isLoading ? (
            <div className="text-center py-16 bg-white border border-[#e9e5dc] rounded-3xl">
              <Loader2 className="w-8 h-8 animate-spin text-[#073f3a] mx-auto mb-2" />
              <p className="text-xs text-[#6f7d79]">Searching destinations across Malaysia...</p>
            </div>
          ) : activeRecommendationList.length === 0 ? (
            <div className="text-center py-16 bg-white border border-[#e9e5dc] rounded-3xl p-6">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-bold text-sm text-[#172b2a]">No exact matches found</h3>
              <p className="text-xs text-[#6f7d79] mt-1 max-w-sm mx-auto">
                Try searching for broader terms like "Food", "MRT", "LRT", or clear your category filter.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedCity('All');
                  setRecommendationTab('all');
                }}
                className="mt-4 bg-[#073f3a] text-white text-xs font-semibold px-4 py-2 rounded-full"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRecommendationList.map((dest) => {
                const fav = isFavorite(dest.id);
                return (
                  <article
                    key={dest.id}
                    className="bg-white border border-[#e9e5dc] rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="h-44 relative bg-[#e6e5db] overflow-hidden">
                        <img
                          src={dest.imageUrl}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                          <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#172b2a] shadow-sm">
                            {dest.category}
                          </span>
                          {dest.tags.includes('Top Pick') && (
                            <span className="bg-[#073f3a] text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm">
                              Top Pick
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => toggleFavorite(dest.id)}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md grid place-items-center transition-all ${
                            fav ? 'text-[#ff5c7a]' : 'text-[#68736e] hover:text-[#ff5c7a]'
                          }`}
                          aria-label={fav ? 'Remove from favorites' : 'Save place'}
                        >
                          <Heart className={`w-4 h-4 ${fav ? 'fill-[#ff5c7a]' : ''}`} />
                        </button>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-sm text-[#172b2a] leading-tight group-hover:text-[#073f3a] transition-colors">
                            {dest.name}
                          </h3>
                          <span className="text-xs font-semibold text-[#8c6a13] whitespace-nowrap">
                            ★ {dest.rating} {dest.reviewsCount ? `(${dest.reviewsCount.toLocaleString()})` : ''}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#28583d] font-semibold mb-2">
                          {dest.type}
                        </div>
                        <p className="text-xs text-[#6f7d79] line-clamp-2 leading-relaxed mb-3">
                          {dest.description}
                        </p>
                        <div className="text-[10px] text-[#6f7d79] flex items-center gap-1 truncate mb-3">
                          <MapPin className="w-3 h-3 text-[#ff5c7a] flex-shrink-0" />
                          <span className="truncate">{dest.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <div className="pt-3 border-t border-[#f0eee8] flex items-center justify-between text-xs mb-3">
                        <span className="text-[11px] text-[#6f7d79] truncate max-w-[140px]">
                          📍 {dest.distance}
                        </span>
                        <span className="font-bold text-[#073f3a]">{dest.price}</span>
                      </div>

                      {/* Action buttons */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigateTo('explore-map', { selectedPlaceId: dest.id })}
                            className="flex-1 bg-[#f7f3eb] hover:bg-[#e9e5dc] text-[#073f3a] text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>View on Map</span>
                          </button>
                          <button
                            onClick={() => navigateTo('trip-planner', { addPlace: dest })}
                            className="bg-[#073f3a] hover:bg-[#063430] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                            title="Add to Itinerary"
                          >
                            + Trip
                          </button>
                        </div>

                        {/* Direct Web Search and Map links */}
                        <div className="flex gap-2 text-[10px]">
                          <a
                            href={buildWebSearchUrl(dest.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-white hover:bg-[#faf7f2] border border-[#e9e5dc] text-[#52645b] py-1 rounded-lg text-center flex items-center justify-center gap-1 transition-colors"
                          >
                            <Globe className="w-3 h-3 text-[#073f3a]" />
                            <span>Web Search</span>
                          </a>
                          <a
                            href={buildMapNavigationUrl(dest.name, dest.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-white hover:bg-[#faf7f2] border border-[#e9e5dc] text-[#52645b] py-1 rounded-lg text-center flex items-center justify-center gap-1 transition-colors"
                          >
                            <Navigation className="w-3 h-3 text-[#0984e3]" />
                            <span>Map Directions</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
