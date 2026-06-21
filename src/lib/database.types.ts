export interface DbTour {
  id: string;
  slug: string;
  title_es: string;
  title_en: string;
  description_es: string | null;
  description_en: string | null;
  experience_es: string | null;
  experience_en: string | null;
  price_clp: number;
  price_usd: number;
  duration: string | null;
  category: 'half_day' | 'full_day' | 'pack';
  min_passengers: number;
  image_url: string | null;
  includes_es: string[];
  includes_en: string[];
  not_includes_es: string[];
  not_includes_en: string[];
  itinerary_es: { time: string; title: string; desc: string }[];
  itinerary_en: { time: string; title: string; desc: string }[];
  location: string | null;
  active: boolean;
  sort_order: number;
  offer_discount: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read?: boolean;
  created_at?: string;
}

export interface DbBooking {
  id?: string;
  profile_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  tour_id: string;
  travel_date: string;
  travelers: number;
  total_clp: number;
  total_usd: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  payment_method: string | null;
  payment_id: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}
