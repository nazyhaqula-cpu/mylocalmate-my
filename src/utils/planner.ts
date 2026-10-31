import type { Destination, TripStop, PhraseItem } from '../types/index.ts';

export interface BudgetBreakdown {
  food: number;
  transport: number;
  stay: number;
  other: number;
  total: number;
  percentages: {
    food: number;
    transport: number;
    stay: number;
    other: number;
  };
}

/**
 * Calculates budget total and percentage breakdown
 */
export function calculateBudget(expenses: { food: number; transport: number; stay: number; other: number }): BudgetBreakdown {
  const food = Math.max(0, Number(expenses.food) || 0);
  const transport = Math.max(0, Number(expenses.transport) || 0);
  const stay = Math.max(0, Number(expenses.stay) || 0);
  const other = Math.max(0, Number(expenses.other) || 0);

  const total = food + transport + stay + other;

  if (total === 0) {
    return {
      food,
      transport,
      stay,
      other,
      total: 0,
      percentages: { food: 0, transport: 0, stay: 0, other: 0 },
    };
  }

  return {
    food,
    transport,
    stay,
    other,
    total,
    percentages: {
      food: Math.round((food / total) * 100),
      transport: Math.round((transport / total) * 100),
      stay: Math.round((stay / total) * 100),
      other: Math.round((other / total) * 100),
    },
  };
}

/**
 * Filter destinations by category, search query, and city
 */
export function filterDestinations(
  destinations: Destination[],
  category: string,
  query: string,
  city?: string
): Destination[] {
  const q = (query || '').toLowerCase().trim();
  const cat = (category || 'All').trim();

  return destinations.filter((dest) => {
    const matchesCategory =
      cat === 'All' ||
      (cat === 'Culinary' && (dest.category === 'Food' || dest.tags.includes('Culinary'))) ||
      (cat === 'Trips' && (dest.category === 'Attractions' || dest.category === 'Culture' || dest.tags.includes('Trip Highlight'))) ||
      (cat === 'Transportation' && (dest.category === 'Transport' || dest.tags.includes('Transportation'))) ||
      dest.category.toLowerCase() === cat.toLowerCase();

    const matchesCity = !city || city === 'All' || dest.city.toLowerCase() === city.toLowerCase();

    if (!matchesCategory || !matchesCity) return false;

    if (!q) return true;

    const searchableText = [
      dest.name,
      dest.category,
      dest.type,
      dest.description,
      dest.address,
      dest.city,
      ...(dest.tags || []),
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(q);
  });
}

/**
 * Summarize an itinerary's stops and estimated duration
 */
export function calculateTripSummary(stops: TripStop[]) {
  const totalStops = stops.length;
  const totalDurationMinutes = stops.reduce((acc, stop) => acc + (stop.durationMinutes || 60), 0);
  const hours = Math.floor(totalDurationMinutes / 60);
  const minutes = totalDurationMinutes % 60;

  const slotCounts: Record<string, number> = {
    Morning: 0,
    Lunch: 0,
    Afternoon: 0,
    Evening: 0,
  };

  stops.forEach((stop) => {
    if (slotCounts[stop.timeSlot] !== undefined) {
      slotCounts[stop.timeSlot]++;
    }
  });

  return {
    totalStops,
    totalDurationMinutes,
    durationFormatted: hours > 0 ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim() : `${minutes}m`,
    slotCounts,
  };
}

/**
 * Estimate transit fare based on transit type and number of hops
 */
export function estimateTransitFare(hops: number, mode: 'mrt' | 'bus' | 'grab' = 'mrt'): { min: number; max: number; label: string } {
  const safeHops = Math.max(1, hops || 1);
  if (mode === 'mrt') {
    const min = 1.20 + (safeHops - 1) * 0.80;
    const max = 2.50 + (safeHops - 1) * 1.10;
    return { min: Number(min.toFixed(2)), max: Number(max.toFixed(2)), label: `RM ${min.toFixed(2)} – RM ${max.toFixed(2)} (Touch 'n Go)` };
  } else if (mode === 'bus') {
    const min = 1.00;
    const max = 3.00;
    return { min, max, label: 'RM 1.00 – RM 3.00 (Rapid KL Bus)' };
  } else {
    const min = 8.00 + (safeHops * 3.50);
    const max = 15.00 + (safeHops * 5.00);
    return { min: Number(min.toFixed(2)), max: Number(max.toFixed(2)), label: `RM ${min.toFixed(2)} – RM ${max.toFixed(2)} (GrabCar est.)` };
  }
}

/**
 * Filter phrases by keyword or category
 */
export function searchPhrases(phrases: PhraseItem[], query: string, category: string): PhraseItem[] {
  const q = (query || '').toLowerCase().trim();
  const cat = (category || 'All').trim();

  return phrases.filter((p) => {
    const matchesCat = cat === 'All' || p.category === cat;
    if (!matchesCat) return false;
    if (!q) return true;

    return (
      p.malay.toLowerCase().includes(q) ||
      p.english.toLowerCase().includes(q) ||
      (p.phonetic && p.phonetic.toLowerCase().includes(q)) ||
      (p.contextTip && p.contextTip.toLowerCase().includes(q))
    );
  });
}

/**
 * Clean text from markdown formatting symbols like '*' and '#'
 */
export function sanitizePlainText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*#]/g, '')
    .replace(/^[ \t]*[-+]\s+/gm, '• ')
    .trim();
}

/**
 * Build external web search URLs
 */
export function buildWebSearchUrl(query: string): string {
  const clean = query.trim() ? `${query} Malaysia` : 'Malaysia tourist attractions food transport';
  return `https://www.google.com/search?q=${encodeURIComponent(clean)}`;
}

export function buildMapNavigationUrl(name: string, address?: string): string {
  const q = address ? `${name}, ${address}` : `${name}, Malaysia`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function buildImageSearchUrl(query: string): string {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query + ' Malaysia')}`;
}

// Backward compatibility exports
export const buildGoogleSearchUrl = buildWebSearchUrl;
export const buildGoogleMapsUrl = buildMapNavigationUrl;
export const buildGoogleImagesUrl = buildImageSearchUrl;

/**
 * Group recommendations into distinct categories
 */
export function categorizeRecommendations(destinations: Destination[]) {
  const culinary = destinations.filter(
    (d) => d.category === 'Food' || d.tags.some((t) => ['Culinary', 'Food', 'Nasi Lemak', 'Halal', 'Hawker Heritage'].includes(t))
  );

  const trips = destinations.filter(
    (d) =>
      d.category === 'Attractions' ||
      d.category === 'Culture' ||
      d.category === 'Explore' ||
      d.tags.some((t) => ['Trip Highlight', 'Must-Visit', 'UNESCO', 'Landmark'].includes(t))
  );

  const transportation = destinations.filter(
    (d) => d.category === 'Transport' || d.tags.some((t) => ['Transportation', 'Transit Hub', 'MRT', 'LRT', 'Airport Train'].includes(t))
  );

  return { culinary, trips, transportation };
}

export const categorizeGoogleRecommendations = categorizeRecommendations;

/**
 * Overlay mode helper and tracking calculations
 */
export type MapOverlayMode = 'clean' | 'transit' | 'planner';

export function getOverlayModeMeta(mode: MapOverlayMode) {
  switch (mode) {
    case 'clean':
      return {
        title: 'Clean & Empty Map',
        tagline: 'Minimalist view',
        description: 'Clean, distraction-free map view for smooth spatial exploration and navigation without marker clutter.',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      };
    case 'transit':
      return {
        title: 'Transportation Tracking Maps',
        tagline: 'Live Rail & Transit Network',
        description: 'Real-time transit tracking overlay with Google Maps Transit database, including KTM Komuter, LRT, MRT, Rapid KL Monorail, and Airport Express lines, live train markers, and station arrival schedules.',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      };
    case 'planner':
      return {
        title: 'Tracking Planner Overlay',
        tagline: 'Live Itinerary & Waypoints',
        description: 'Sequenced trip milestone tracker with active route legs, distance remaining, stop completion checklist, and progress simulation.',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      };
  }
}

export function calculateTrackingProgress(steps: { status: 'completed' | 'active' | 'upcoming' }[]) {
  if (!steps.length) return { completedCount: 0, totalCount: 0, percentage: 0 };
  const completed = steps.filter((s) => s.status === 'completed').length;
  return {
    completedCount: completed,
    totalCount: steps.length,
    percentage: Math.round((completed / steps.length) * 100),
  };
}

