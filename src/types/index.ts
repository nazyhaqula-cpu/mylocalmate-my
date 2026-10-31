export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferredLanguage: string;
  travelInterests: string[];
  budgetPreference: string;
  createdAt: string;
  isGuest?: boolean;
  isVerified?: boolean;
  authProvider?: 'email' | 'google' | 'facebook' | 'guest';
}

export interface Destination {
  id: string;
  name: string;
  category: 'Attractions' | 'Food' | 'Transport' | 'Explore' | 'Study' | 'Culture' | 'Hotels';
  type: string;
  price: string;
  rating: number;
  reviewsCount?: number;
  distance: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  description: string;
  imageUrl: string;
  tags: string[];
  placeId?: string;
  googlePlaceId?: string;
}

export interface TripStop {
  id: string;
  destinationId?: string;
  name: string;
  dayNumber: number;
  sequence: number;
  timeSlot: 'Morning' | 'Lunch' | 'Afternoon' | 'Evening';
  notes?: string;
  address?: string;
  lat?: number;
  lng?: number;
  durationMinutes?: number;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  stops: TripStop[];
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  destinationId: string;
  createdAt: string;
  destination?: Destination;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedPlaces?: Destination[];
  suggestedActions?: { label: string; action: string }[];
}

export interface PhraseItem {
  id: string;
  category: 'Greetings' | 'Food' | 'Transport' | 'Emergency' | 'Numbers';
  malay: string;
  english: string;
  phonetic?: string;
  contextTip?: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  native: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'zh', name: 'Chinese (Simplified)', native: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', native: '繁體中文' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'tl', name: 'Filipino / Tagalog', native: 'Filipino' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'my', name: 'Burmese', native: 'မြန်မာ' },
  { code: 'km', name: 'Khmer', native: 'ខ្មែរ' },
  { code: 'fa', name: 'Persian', native: 'فارسی' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά' },
  { code: 'da', name: 'Danish', native: 'Dansk' },
  { code: 'no', name: 'Norwegian', native: 'Norsk' },
  { code: 'fi', name: 'Finnish', native: 'Suomi' },
  { code: 'cs', name: 'Czech', native: 'Čeština' },
  { code: 'hu', name: 'Hungarian', native: 'Magyar' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська' },
  { code: 'ro', name: 'Romanian', native: 'Română' },
  { code: 'he', name: 'Hebrew', native: 'עברית' },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
  { code: 'sk', name: 'Slovak', native: 'Slovenčina' },
];
