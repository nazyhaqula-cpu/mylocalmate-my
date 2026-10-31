import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBudget,
  filterDestinations,
  calculateTripSummary,
  estimateTransitFare,
  searchPhrases,
  buildWebSearchUrl,
  buildMapNavigationUrl,
  categorizeRecommendations,
  sanitizePlainText,
  getOverlayModeMeta,
  calculateTrackingProgress,
} from './planner.ts';
import type { Destination, TripStop, PhraseItem } from '../types/index.ts';

test('calculateBudget computes correct sums and percentages', () => {
  const result = calculateBudget({ food: 450, transport: 120, stay: 500, other: 130 });
  assert.equal(result.total, 1200);
  assert.equal(result.food, 450);
  assert.equal(result.transport, 120);
  assert.equal(result.stay, 500);
  assert.equal(result.other, 130);
  assert.equal(result.percentages.food, 38);
  assert.equal(result.percentages.transport, 10);
  assert.equal(result.percentages.stay, 42);
  assert.equal(result.percentages.other, 11);
});

test('calculateBudget handles zero total gracefully without division by zero', () => {
  const result = calculateBudget({ food: 0, transport: 0, stay: 0, other: 0 });
  assert.equal(result.total, 0);
  assert.equal(result.percentages.food, 0);
});

test('filterDestinations filters by category and search term correctly', () => {
  const mockDests: Destination[] = [
    {
      id: 'd1',
      name: 'Petronas Twin Towers',
      category: 'Attractions',
      type: 'Landmark',
      price: 'Free',
      rating: 4.8,
      distance: 'City Centre',
      address: 'KLCC',
      city: 'Kuala Lumpur',
      lat: 3.15,
      lng: 101.71,
      description: 'Iconic skyscrapers',
      imageUrl: '',
      tags: ['Architecture', 'Trip Highlight'],
    },
    {
      id: 'd2',
      name: 'Nasi Lemak Corner',
      category: 'Food',
      type: 'Local food',
      price: 'RM 10',
      rating: 4.6,
      distance: 'Near campus',
      address: 'Petaling Jaya',
      city: 'Petaling Jaya',
      lat: 3.13,
      lng: 101.62,
      description: 'Authentic coconut rice',
      imageUrl: '',
      tags: ['Halal', 'Food', 'Culinary'],
    },
  ];

  const foodOnly = filterDestinations(mockDests, 'Food', '');
  assert.equal(foodOnly.length, 1);
  assert.equal(foodOnly[0].name, 'Nasi Lemak Corner');

  const searchSkyscraper = filterDestinations(mockDests, 'All', 'skyscraper');
  assert.equal(searchSkyscraper.length, 1);
  assert.equal(searchSkyscraper[0].name, 'Petronas Twin Towers');

  const none = filterDestinations(mockDests, 'All', 'astronaut');
  assert.equal(none.length, 0);
});

test('calculateTripSummary correctly computes duration and slot counts', () => {
  const stops: TripStop[] = [
    { id: '1', name: 'Stop 1', dayNumber: 1, sequence: 1, timeSlot: 'Morning', durationMinutes: 120 },
    { id: '2', name: 'Stop 2', dayNumber: 1, sequence: 2, timeSlot: 'Lunch', durationMinutes: 60 },
    { id: '3', name: 'Stop 3', dayNumber: 1, sequence: 3, timeSlot: 'Afternoon', durationMinutes: 90 },
  ];

  const summary = calculateTripSummary(stops);
  assert.equal(summary.totalStops, 3);
  assert.equal(summary.totalDurationMinutes, 270);
  assert.equal(summary.durationFormatted, '4h 30m');
  assert.equal(summary.slotCounts.Morning, 1);
  assert.equal(summary.slotCounts.Lunch, 1);
  assert.equal(summary.slotCounts.Afternoon, 1);
  assert.equal(summary.slotCounts.Evening, 0);
});

test('estimateTransitFare provides reasonable fare bounds', () => {
  const mrtFare = estimateTransitFare(3, 'mrt');
  assert.ok(mrtFare.min >= 1.2);
  assert.ok(mrtFare.max > mrtFare.min);
  assert.ok(mrtFare.label.includes('Touch \'n Go'));

  const grabFare = estimateTransitFare(2, 'grab');
  assert.ok(grabFare.min >= 8.0);
  assert.ok(grabFare.label.includes('GrabCar'));
});

test('searchPhrases finds matching items in Malay and English', () => {
  const phrases: PhraseItem[] = [
    { id: '1', category: 'Greetings', malay: 'Terima kasih', english: 'Thank you' },
    { id: '2', category: 'Food', malay: 'Kurang manis', english: 'Less sweet' },
  ];

  const matchEnglish = searchPhrases(phrases, 'thank', 'All');
  assert.equal(matchEnglish.length, 1);
  assert.equal(matchEnglish[0].malay, 'Terima kasih');

  const matchCategory = searchPhrases(phrases, '', 'Food');
  assert.equal(matchCategory.length, 1);
  assert.equal(matchCategory[0].malay, 'Kurang manis');
});

test('buildWebSearchUrl and buildMapNavigationUrl generate valid web URLs', () => {
  const searchUrl = buildWebSearchUrl('nasi lemak petaling jaya');
  assert.ok(searchUrl.includes('nasi%20lemak'));

  const mapsUrl = buildMapNavigationUrl('Petronas Twin Towers', 'KLCC, Kuala Lumpur');
  assert.ok(mapsUrl.includes('Petronas%20Twin%20Towers'));
});

test('categorizeRecommendations accurately partitions culinary, trips, and transportation', () => {
  const mockDests: Destination[] = [
    {
      id: 'd1',
      name: 'Village Park',
      category: 'Food',
      type: 'Nasi Lemak',
      price: 'RM 15',
      rating: 4.6,
      distance: 'PJ',
      address: 'Damansara',
      city: 'Petaling Jaya',
      lat: 3.1,
      lng: 101.6,
      description: 'Nasi lemak',
      imageUrl: '',
      tags: ['Culinary'],
    },
    {
      id: 'd2',
      name: 'KLCC Twin Towers',
      category: 'Attractions',
      type: 'Skyscraper',
      price: 'Free',
      rating: 4.8,
      distance: 'City Centre',
      address: 'KLCC',
      city: 'Kuala Lumpur',
      lat: 3.15,
      lng: 101.7,
      description: 'Landmark',
      imageUrl: '',
      tags: ['Trip Highlight'],
    },
    {
      id: 'd3',
      name: 'KL Sentral',
      category: 'Transport',
      type: 'Transit Hub',
      price: 'RM 2',
      rating: 4.6,
      distance: 'Brickfields',
      address: 'KL Sentral',
      city: 'Kuala Lumpur',
      lat: 3.13,
      lng: 101.68,
      description: 'Hub',
      imageUrl: '',
      tags: ['Transit Hub', 'Transportation'],
    },
  ];

  const grouped = categorizeRecommendations(mockDests);
  assert.equal(grouped.culinary.length, 1);
  assert.equal(grouped.culinary[0].name, 'Village Park');
  assert.equal(grouped.trips.length, 1);
  assert.equal(grouped.trips[0].name, 'KLCC Twin Towers');
  assert.equal(grouped.transportation.length, 1);
  assert.equal(grouped.transportation[0].name, 'KL Sentral');
});

test('sanitizePlainText strips asterisks and hash symbols cleanly', () => {
  const dirty = '## 1. **Morning Tour** *KLCC* #MustVisit\n* Great place!';
  const cleaned = sanitizePlainText(dirty);
  assert.ok(!cleaned.includes('*'));
  assert.ok(!cleaned.includes('#'));
  assert.ok(cleaned.includes('1. Morning Tour KLCC MustVisit'));
});

test('getOverlayModeMeta returns correct metadata for all 3 overlay modes', () => {
  const cleanMeta = getOverlayModeMeta('clean');
  assert.equal(cleanMeta.title, 'Clean & Empty Map');

  const transitMeta = getOverlayModeMeta('transit');
  assert.equal(transitMeta.title, 'Transportation Tracking Maps');
  assert.ok(transitMeta.description.includes('MRT'));

  const plannerMeta = getOverlayModeMeta('planner');
  assert.equal(plannerMeta.title, 'Tracking Planner Overlay');
});

test('calculateTrackingProgress calculates accurate completion percentage', () => {
  const steps: { status: 'completed' | 'active' | 'upcoming' }[] = [
    { status: 'completed' },
    { status: 'completed' },
    { status: 'active' },
    { status: 'upcoming' },
  ];
  const progress = calculateTrackingProgress(steps);
  assert.equal(progress.completedCount, 2);
  assert.equal(progress.totalCount, 4);
  assert.equal(progress.percentage, 50);
});

