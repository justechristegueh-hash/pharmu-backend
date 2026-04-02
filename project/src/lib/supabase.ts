import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'customer' | 'pharmacy' | 'courier' | 'admin';
export type DeliveryType = 'express' | 'standard';
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'in_transit' | 'delivered' | 'cancelled';
export type PaymentMethod = 'wallet' | 'wave' | 'orange_money';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type DeliveryStatus = 'assigned' | 'en_route_to_pharmacy' | 'picked_up' | 'en_route_to_customer' | 'delivered';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string | null;
  form: string | null;
  description: string | null;
  search_terms: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Pharmacy {
  id: string;
  user_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  is_active: boolean;
  certification_number: string;
  created_at: string;
}

export interface Courier {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  current_latitude: number | null;
  current_longitude: number | null;
  is_available: boolean;
  vehicle_type: string;
  rating: number;
  total_deliveries: number;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  pharmacy_id: string | null;
  courier_id: string | null;
  delivery_type: DeliveryType;
  status: OrderStatus;
  delivery_address: string;
  delivery_latitude: number;
  delivery_longitude: number;
  delivery_details: string | null;
  customer_phone: string;
  medicine_price: number;
  delivery_fee: number;
  total_amount: number;
  created_at: string;
  accepted_at: string | null;
  ready_at: string | null;
  delivered_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  medicine_id: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  medicine?: Medicine;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_id: string | null;
  created_at: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  courier_id: string | null;
  status: DeliveryStatus;
  courier_latitude: number | null;
  courier_longitude: number | null;
  estimated_arrival: string | null;
  created_at: string;
  updated_at: string;
}
