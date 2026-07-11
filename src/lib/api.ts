import { supabase } from './supabase';
import type { DbTour, DbContactMessage, DbBooking } from './database.types';
import type { Tour } from '../data/data';

const slugImageMap: Record<string, string> = {
  'full-day-anakena-moai':  '/images/tours/ahu-tongariki-dia.webp',
  'orongo-tangata-manu':    '/images/tours/rano-kau-crater.webp',
  'amanecer-tongariki':     '/images/tours/ahu-tongariki-amanecer.webp',
  'experiencia-motu':       '/images/tours/motu-islotes.webp',
  'tour-navegable-anakena': '/images/tours/ana-te-pahu.webp',
  'super-full-day-privado': '/images/tours/rano-raraku-sector1.webp',
};

function dbTourToTour(t: DbTour, lang: 'es' | 'en'): Tour {
  const categoryMap: Record<string, string> = {
    half_day: 'half-day',
    full_day: 'full-day',
    pack: 'packs',
  };

  return {
    id: t.id,
    title: lang === 'es' ? t.title_es : t.title_en,
    price: t.price_usd,
    priceCLP: t.price_clp,
    pricePrivate: t.price_usd_private ?? undefined,
    pricePrivateCLP: t.price_clp_private ?? undefined,
    categoryId: categoryMap[t.category] || t.category,
    type: t.category === 'half_day'
      ? (lang === 'es' ? 'Medio Día' : 'Half Day')
      : t.category === 'pack'
        ? (lang === 'es' ? 'Privado' : 'Private')
        : 'Full Day',
    duration: t.duration || '',
    description: (lang === 'es' ? t.description_es : t.description_en) || '',
    longDescription: (lang === 'es' ? t.experience_es : t.experience_en) || '',
    image: slugImageMap[t.slug] || t.image_url || '',
    included: lang === 'es' ? t.includes_es : t.includes_en,
    notIncluded: lang === 'es' ? t.not_includes_es : t.not_includes_en,
    itinerary: lang === 'es' ? t.itinerary_es : t.itinerary_en,
    minPassengers: t.min_passengers > 1 ? t.min_passengers : undefined,
    discountPercentage: t.offer_discount || undefined,
  };
}

export async function fetchTours(lang: 'es' | 'en'): Promise<Tour[]> {
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('active', true)
    .order('sort_order');

  if (error) throw error;
  return (data as DbTour[]).map(t => dbTourToTour(t, lang));
}

export async function submitContactMessage(msg: Omit<DbContactMessage, 'id' | 'read' | 'created_at'>) {
  const { error } = await supabase
    .from('contact_messages')
    .insert(msg);

  if (error) throw error;
}

export async function createBooking(booking: Omit<DbBooking, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export interface BookingConfirmationPayload {
  traveler_name: string;
  traveler_email: string;
  tour_title: string;
  tour_date: string;
  travelers: number;
  total_usd: number;
  total_clp: number;
  language?: 'es' | 'en';
}

export async function sendBookingConfirmation(payload: BookingConfirmationPayload): Promise<void> {
  const response = await fetch('/api/bookings/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? 'Failed to send confirmation email');
  }
}

// ── Availability ──────────────────────────────────────────────────────────

export const DEFAULT_CAPACITY: Record<string, number> = {
  'half-day': 12,
  'full-day': 10,
  'packs': 6,
};

export async function getBookedSpotsForDate(tourId: string, date: string): Promise<number> {
  const { data, error } = await supabase
    .from('bookings')
    .select('travelers')
    .eq('tour_id', tourId)
    .eq('travel_date', date)
    .neq('status', 'cancelled');

  if (error) throw error;
  if (!data || data.length === 0) return 0;
  return (data as { travelers: number }[]).reduce((sum, row) => sum + row.travelers, 0);
}

