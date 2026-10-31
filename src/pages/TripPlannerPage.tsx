import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trip, TripStop, Destination } from '../types';
import { SAMPLE_TRIP, INITIAL_DESTINATIONS } from '../data/initialData';
import { calculateTripSummary } from '../utils/planner';
import {
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  Edit2,
  Check,
  DollarSign,
  Compass,
  ArrowRight,
  Luggage,
} from 'lucide-react';

export const TripPlannerPage: React.FC = () => {
  const { user, token, pageParams, navigateTo, showToast } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([SAMPLE_TRIP]);
  const [selectedTrip, setSelectedTrip] = useState<Trip>(SAMPLE_TRIP);
  const [isLoading, setIsLoading] = useState(false);

  // New Trip Modal
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDestination, setNewDestination] = useState('Kuala Lumpur, Malaysia');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEndDate, setNewEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBudget, setNewBudget] = useState(150);

  // Add Stop Modal
  const [isAddStopModalOpen, setIsAddStopModalOpen] = useState(false);
  const [stopName, setStopName] = useState('');
  const [stopTimeSlot, setStopTimeSlot] = useState<'Morning' | 'Lunch' | 'Afternoon' | 'Evening'>('Morning');
  const [stopNotes, setStopNotes] = useState('');
  const [stopDuration, setStopDuration] = useState(90);

  // AI Itinerary Generator Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiDays, setAiDays] = useState(1);
  const [aiInterests, setAiInterests] = useState('Culture, Street Food, Scenic Spots');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Fetch user trips
  const fetchTrips = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/trips', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.trips && data.trips.length > 0) {
          setTrips(data.trips);
          setSelectedTrip(data.trips[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to load trips:', err);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [token]);

  // If redirected with an addPlace parameter
  useEffect(() => {
    if (pageParams?.addPlace && selectedTrip) {
      const p: Destination = pageParams.addPlace;
      const alreadyHas = selectedTrip.stops.some((s) => s.destinationId === p.id);
      if (!alreadyHas) {
        handleAddStopFromDestination(p);
      }
    }
  }, [pageParams]);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/trips', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: newTitle,
          destination: newDestination,
          startDate: newStartDate,
          endDate: newEndDate,
          budget: newBudget,
          stops: [],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTrips((prev) => [data.trip, ...prev]);
        setSelectedTrip(data.trip);
        setIsNewTripModalOpen(false);
        setNewTitle('');
        showToast('New trip itinerary created! 🌺');
      }
    } catch (e) {
      showToast('Error creating trip');
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (trips.length <= 1) {
      showToast('Keep at least one trip in your planner.');
      return;
    }
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/trips/${tripId}`, { method: 'DELETE', headers });
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      setSelectedTrip(trips.find((t) => t.id !== tripId) || SAMPLE_TRIP);
      showToast('Trip deleted');
    } catch (e) {
      console.warn(e);
    }
  };

  const handleAddStopFromDestination = async (dest: Destination) => {
    if (!selectedTrip) return;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/trips/${selectedTrip.id}/stops`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          destinationId: dest.id,
          name: dest.name,
          dayNumber: 1,
          timeSlot: 'Afternoon',
          notes: dest.description,
          address: dest.address,
          lat: dest.lat,
          lng: dest.lng,
          durationMinutes: 90,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedTrip(data.trip);
        setTrips((prev) => prev.map((t) => (t.id === data.trip.id ? data.trip : t)));
        showToast(`Added ${dest.name} to your itinerary! 💚`);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleAddCustomStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopName.trim() || !selectedTrip) return;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/trips/${selectedTrip.id}/stops`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: stopName,
          dayNumber: 1,
          timeSlot: stopTimeSlot,
          notes: stopNotes,
          durationMinutes: stopDuration,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedTrip(data.trip);
        setTrips((prev) => prev.map((t) => (t.id === data.trip.id ? data.trip : t)));
        setIsAddStopModalOpen(false);
        setStopName('');
        setStopNotes('');
        showToast('Activity added to itinerary!');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!selectedTrip) return;
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/trips/${selectedTrip.id}/stops/${stopId}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedTrip(data.trip);
        setTrips((prev) => prev.map((t) => (t.id === data.trip.id ? data.trip : t)));
        showToast('Stop removed from itinerary');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleGenerateAiItinerary = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: selectedTrip.destination,
          days: aiDays,
          interests: aiInterests.split(',').map((s) => s.trim()),
          budget: selectedTrip.budget,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.stops) && data.stops.length > 0) {
          const updatedTrip: Trip = {
            ...selectedTrip,
            stops: data.stops.map((s: any, idx: number) => ({
              id: 'ai-stop-' + idx,
              name: s.name,
              dayNumber: s.dayNumber || 1,
              sequence: idx + 1,
              timeSlot: s.timeSlot || 'Morning',
              notes: s.notes || '',
              durationMinutes: s.durationMinutes || 90,
              lat: s.lat || 3.15,
              lng: s.lng || 101.7,
            })),
          };

          setSelectedTrip(updatedTrip);
          setTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
          setIsAiModalOpen(false);
          showToast('Generated smart AI itinerary! 🌺');
        }
      }
    } catch (err) {
      showToast('AI itinerary generation encountered an issue');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const summary = calculateTripSummary(selectedTrip?.stops || []);

  const timeSlots = ['Morning', 'Lunch', 'Afternoon', 'Evening'] as const;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-[#398077] uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <CalendarDays className="w-3.5 h-3.5 text-[#ff5c7a]" />
            <span>Itinerary & Route Organizing</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172b2a] tracking-tight">
            Trip Planner & Itinerary
          </h1>
          <p className="text-xs sm:text-sm text-[#6f7d79] mt-1">
            Organize activities by day and time, view stops on the interactive map, and generate AI recommendations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="bg-white border border-[#073f3a] text-[#073f3a] hover:bg-[#073f3a] hover:text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#ff5c7a]" />
            <span>AI Itinerary Generator</span>
          </button>
          <button
            onClick={() => setIsNewTripModalOpen(true)}
            className="bg-[#073f3a] hover:bg-[#063430] text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Trip</span>
          </button>
        </div>
      </div>

      {/* Trip Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        {trips.map((trip) => {
          const isSelected = selectedTrip?.id === trip.id;
          return (
            <button
              key={trip.id}
              onClick={() => setSelectedTrip(trip)}
              className={`text-xs px-4 py-2 rounded-2xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#073f3a] text-white shadow-sm'
                  : 'bg-white border border-[#e9e5dc] text-[#52615c] hover:bg-[#f0ece3]'
              }`}
            >
              <Luggage className="w-3.5 h-3.5" />
              <span>{trip.title}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-gray-100'}`}>
                {trip.stops.length} stops
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Itinerary Timeline & Trip Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Day & Time Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Trip Info Strip */}
          <div className="bg-white border border-[#e9e5dc] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#172b2a]">{selectedTrip.title}</h2>
                <span className="text-[10px] font-bold bg-[#e5f1dc] text-[#28583d] px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
              <div className="text-xs text-[#6f7d79] mt-1 flex flex-wrap gap-3">
                <span>📍 {selectedTrip.destination}</span>
                <span>📅 {selectedTrip.startDate}</span>
                <span>💰 Budget: RM {selectedTrip.budget}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsAddStopModalOpen(true)}
                className="bg-[#ff5c7a] hover:bg-[#f04f6e] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stop</span>
              </button>
              <button
                onClick={() => navigateTo('explore-map')}
                className="bg-[#f7f3eb] hover:bg-[#e9e5dc] text-[#073f3a] text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>View on Map</span>
              </button>
            </div>
          </div>

          {/* Time Slot Groups */}
          <div className="space-y-6">
            {timeSlots.map((slot) => {
              const stopsInSlot = (selectedTrip.stops || []).filter((s) => s.timeSlot === slot);
              return (
                <div key={slot} className="bg-white border border-[#e9e5dc] rounded-3xl p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-[#f0eee8] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#f7f3eb] text-[#073f3a] font-bold text-xs grid place-items-center">
                        {slot === 'Morning' ? '🌅' : slot === 'Lunch' ? '🍜' : slot === 'Afternoon' ? '🏛️' : '🌙'}
                      </span>
                      <h3 className="font-bold text-sm text-[#172b2a]">{slot}</h3>
                      <span className="text-xs text-[#6f7d79]">({stopsInSlot.length} activities)</span>
                    </div>

                    <button
                      onClick={() => {
                        setStopTimeSlot(slot);
                        setIsAddStopModalOpen(true);
                      }}
                      className="text-xs text-[#073f3a] hover:underline font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add to {slot}</span>
                    </button>
                  </div>

                  {stopsInSlot.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-[#e9e5dc] rounded-2xl text-xs text-[#9ca8a4]">
                      No activities planned for {slot.toLowerCase()} yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stopsInSlot.map((stop, idx) => (
                        <div
                          key={stop.id}
                          className="bg-[#faf8f3] border border-[#e9e5dc] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#073f3a]/40 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-[#073f3a] text-white text-xs font-bold grid place-items-center flex-shrink-0 mt-0.5">
                              {stop.sequence || idx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-xs sm:text-sm text-[#172b2a] flex items-center gap-2">
                                <span>{stop.name}</span>
                                {stop.durationMinutes && (
                                  <span className="text-[10px] text-[#6f7d79] bg-white px-2 py-0.5 rounded-full border border-[#e9e5dc]">
                                    ~{stop.durationMinutes} min
                                  </span>
                                )}
                              </div>
                              {stop.notes && (
                                <p className="text-xs text-[#6f7d79] mt-1 leading-relaxed">{stop.notes}</p>
                              )}
                              {stop.address && (
                                <div className="text-[10px] text-[#28583d] font-semibold mt-1">
                                  📍 {stop.address}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                            {stop.lat && stop.lng && (
                              <button
                                onClick={() => navigateTo('explore-map', { selectedPlaceId: stop.destinationId })}
                                className="text-xs text-[#073f3a] hover:underline font-semibold flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-[#e9e5dc]"
                              >
                                <MapPin className="w-3 h-3 text-[#ff5c7a]" />
                                <span>Map</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteStop(stop.id)}
                              className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete stop"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Itinerary Summary & Quick Places */}
        <div className="lg:col-span-4 space-y-6">
          {/* Trip Summary Card */}
          <div className="bg-white border border-[#e9e5dc] rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#172b2a] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#073f3a]" />
              <span>Itinerary Summary</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#f7f3eb] p-3 rounded-2xl border border-[#e9e5dc]">
                <div className="text-xl font-extrabold text-[#073f3a]">{summary.totalStops}</div>
                <div className="text-[10px] text-[#6f7d79] font-medium mt-0.5">Total Activities</div>
              </div>
              <div className="bg-[#f7f3eb] p-3 rounded-2xl border border-[#e9e5dc]">
                <div className="text-xl font-extrabold text-[#073f3a]">{summary.durationFormatted}</div>
                <div className="text-[10px] text-[#6f7d79] font-medium mt-0.5">Estimated Time</div>
              </div>
            </div>

            <div className="pt-2 text-xs space-y-2 text-[#6f7d79] border-t border-[#f0eee8]">
              <div className="flex justify-between">
                <span>Morning activities:</span>
                <span className="font-bold text-[#172b2a]">{summary.slotCounts.Morning}</span>
              </div>
              <div className="flex justify-between">
                <span>Lunch stops:</span>
                <span className="font-bold text-[#172b2a]">{summary.slotCounts.Lunch}</span>
              </div>
              <div className="flex justify-between">
                <span>Afternoon cultural:</span>
                <span className="font-bold text-[#172b2a]">{summary.slotCounts.Afternoon}</span>
              </div>
              <div className="flex justify-between">
                <span>Evening sights:</span>
                <span className="font-bold text-[#172b2a]">{summary.slotCounts.Evening}</span>
              </div>
            </div>

            <button
              onClick={() => navigateTo('explore-map')}
              className="w-full bg-[#073f3a] hover:bg-[#063430] text-white text-xs font-semibold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              <span>Preview Route on Interactive Map</span>
            </button>
          </div>

          {/* Quick Add Suggestions */}
          <div className="bg-white border border-[#e9e5dc] rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-[#6f7d79] uppercase tracking-wider">
              Quick Add Places in KL
            </h3>

            <div className="space-y-2.5">
              {INITIAL_DESTINATIONS.slice(0, 4).map((dest) => (
                <div
                  key={dest.id}
                  className="p-3 bg-[#faf8f3] rounded-2xl border border-[#e9e5dc] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#172b2a] truncate">{dest.name}</div>
                    <div className="text-[10px] text-[#6f7d79] truncate">{dest.category} · {dest.price}</div>
                  </div>
                  <button
                    onClick={() => handleAddStopFromDestination(dest)}
                    className="text-xs bg-white hover:bg-[#073f3a] hover:text-white border border-[#e9e5dc] text-[#073f3a] font-bold px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NEW TRIP MODAL */}
      {isNewTripModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#09201d]/60 backdrop-blur-sm grid place-items-center p-4">
          <form
            onSubmit={handleCreateTrip}
            className="bg-[#f7f3eb] rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl border border-[#e9e5dc] space-y-4"
          >
            <button
              type="button"
              onClick={() => setIsNewTripModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white text-gray-500 hover:text-black grid place-items-center font-bold"
            >
              ×
            </button>
            <h3 className="text-xl font-extrabold text-[#172b2a]">Create a New Trip</h3>

            <div>
              <label className="block text-xs font-bold text-[#172b2a] mb-1">Trip Name</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Penang Food Weekend, KL Heritage Day"
                className="w-full bg-white border border-[#e9e5dc] rounded-xl p-2.5 text-xs text-[#172b2a] outline-none focus:border-[#073f3a]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172b2a] mb-1">Destination City</label>
              <input
                type="text"
                required
                value={newDestination}
                onChange={(e) => setNewDestination(e.target.value)}
                className="w-full bg-white border border-[#e9e5dc] rounded-xl p-2.5 text-xs text-[#172b2a] outline-none focus:border-[#073f3a]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172b2a] mb-1">Start Date</label>
                <input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="w-full bg-white border border-[#e9e5dc] rounded-xl p-2.5 text-xs text-[#172b2a] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172b2a] mb-1">Daily Budget (RM)</label>
                <input
                  type="number"
                  min="20"
                  step="10"
                  value={newBudget}
                  onChange={(e) => setNewBudget(Number(e.target.value))}
                  className="w-full bg-white border border-[#e9e5dc] rounded-xl p-2.5 text-xs text-[#172b2a] outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-[#e9e5dc]">
              <button
                type="button"
                onClick={() => setIsNewTripModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6f7d79]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#073f3a] text-white text-xs font-semibold px-5 py-2.5 rounded-full"
              >
                Create Trip
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD STOP MODAL */}
      {isAddStopModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#09201d]/60 backdrop-blur-sm grid place-items-center p-4">
          <form
            onSubmit={handleAddCustomStop}
            className="bg-[#f7f3eb] rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl border border-[#e9e5dc] space-y-4"
          >
            <button
              type="button"
              onClick={() => setIsAddStopModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white text-gray-500 hover:text-black grid place-items-center font-bold"
            >
              ×
            </button>
            <h3 className="text-xl font-extrabold text-[#172b2a]">Add Activity Stop</h3>

            <div>
              <label className="block text-xs font-bold text-[#172b2a] mb-1">Activity / Place Name</label>
              <input
                type="text"
                required
                value={stopName}
                onChange={(e) => setStopName(e.target.value)}
                placeholder="e.g. Village Park Nasi Lemak, Pasar Seni Batik workshop"
                className="w-full bg-white border border-[#e9e5dc] rounded-xl p-2.5 text-xs text-[#172b2a] outline-none focus:border-[#073f3a]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172b2a] mb-1">Time Slot</label>
                <select
                  value={stopTimeSlot}
                  onChange={(e: any) => setStopTimeSlot(e.target.value)}
                  className="w-full bg-white border border-[#e9e5dc] rounded-xl p-2.5 text-xs text-[#172b2a] outline-none"
                >
                  <option value="Morning">Morning</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172b2a] mb-1">Duration (min)</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={stopDuration}
                  onChange={(e) => setStopDuration(Number(e.target.value))}
                  className="w-full bg-white border border-[#e9e5dc] rounded-xl p-2.5 text-xs text-[#172b2a] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172b2a] mb-1">Notes & Tips</label>
              <textarea
                rows={2}
                value={stopNotes}
                onChange={(e) => setStopNotes(e.target.value)}
                placeholder="e.g. Take MRT Kajang Line, bring water bottle"
                className="w-full bg-white border border-[#e9e5dc] rounded-xl p-2.5 text-xs text-[#172b2a] outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-[#e9e5dc]">
              <button
                type="button"
                onClick={() => setIsAddStopModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6f7d79]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#073f3a] text-white text-xs font-semibold px-5 py-2.5 rounded-full"
              >
                Save Activity
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AI ITINERARY GENERATOR MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#09201d]/60 backdrop-blur-sm grid place-items-center p-4">
          <div className="bg-[#f7f3eb] rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl border border-[#e9e5dc] space-y-4">
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white text-gray-500 hover:text-black grid place-items-center font-bold"
            >
              ×
            </button>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#ff5c7a]/15 text-[#ff5c7a] grid place-items-center">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-xl font-extrabold text-[#172b2a]">AI Itinerary Generator</h3>
            </div>
            <p className="text-xs text-[#6f7d79]">
              Let AI Assistant craft an optimized day-by-day travel plan based on your preferences.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#172b2a] mb-1">Travel Interests</label>
              <input
                type="text"
                value={aiInterests}
                onChange={(e) => setAiInterests(e.target.value)}
                placeholder="e.g. Street food, Architecture, Public transit, Photography"
                className="w-full bg-white border border-[#e9e5dc] rounded-xl p-2.5 text-xs text-[#172b2a] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172b2a] mb-1">Trip Duration</label>
              <select
                value={aiDays}
                onChange={(e) => setAiDays(Number(e.target.value))}
                className="w-full bg-white border border-[#e9e5dc] rounded-xl p-2.5 text-xs text-[#172b2a] outline-none"
              >
                <option value={1}>1-Day City Trip (Kuala Lumpur)</option>
                <option value={2}>2-Day Exploration</option>
                <option value={3}>3-Day Weekend Getaway</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-[#e9e5dc]">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6f7d79]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAiItinerary}
                disabled={isGeneratingAi}
                className="bg-[#073f3a] text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm"
              >
                {isGeneratingAi ? <Sparkles className="w-4 h-4 animate-spin text-[#ffeb9a]" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGeneratingAi ? 'Generating...' : 'Generate Itinerary'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
