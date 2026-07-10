export interface Profile {
  id: string; // Referencia a auth.users.id de Supabase
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface TourPackage {
  id: string;
  title: string;
  description: string;
  type: 'full-day' | 'half-day' | 'archeological' | 'custom';
  price_usd: number;
  image_url: string | null;
  duration_hours: number;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string; // Referencia a Profile
  total_amount_usd: number;
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'refunded';
  created_at: string;
}

export interface BookingItem {
  id: string;
  booking_id: string;
  tour_package_id: string; // Referencia a TourPackage
  booking_date: string; // Fecha en la que el usuario tomará el tour (YYYY-MM-DD)
  travelers_count: number;
  price_at_booking: number; // Snapshot del precio al momento de la reserva
}

export interface Payment {
  id: string;
  booking_id: string; // Referencia a Booking
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
}
