/*
  # Pharmu Platform - Core Database Schema
  
  ## Overview
  Creates the foundational database structure for Pharmu, an intelligent medication delivery platform for Dakar.
  
  ## New Tables
  
  ### 1. `profiles`
  - Extended user profile with role-based access
  - Columns:
    - `id` (uuid, FK to auth.users)
    - `role` (enum: customer, pharmacy, courier, admin)
    - `full_name` (text)
    - `phone` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  ### 2. `pharmacies`
  - Certified pharmacy locations and details
  - Columns:
    - `id` (uuid, PK)
    - `user_id` (uuid, FK to profiles)
    - `name` (text)
    - `address` (text)
    - `latitude` (decimal)
    - `longitude` (decimal)
    - `phone` (text)
    - `is_active` (boolean)
    - `certification_number` (text)
    - `created_at` (timestamptz)
  
  ### 3. `couriers`
  - Delivery personnel with real-time status
  - Columns:
    - `id` (uuid, PK)
    - `user_id` (uuid, FK to profiles)
    - `full_name` (text)
    - `phone` (text)
    - `current_latitude` (decimal)
    - `current_longitude` (decimal)
    - `is_available` (boolean)
    - `vehicle_type` (text)
    - `rating` (decimal)
    - `total_deliveries` (integer)
    - `created_at` (timestamptz)
  
  ### 4. `medicines`
  - Comprehensive medication database (1000+ entries)
  - Columns:
    - `id` (uuid, PK)
    - `name` (text)
    - `dosage` (text)
    - `form` (text) - comprimé, sirop, gélule, etc.
    - `description` (text)
    - `search_terms` (text) - for symptom-based search
    - `is_active` (boolean)
    - `created_at` (timestamptz)
  
  ### 5. `pending_medicines`
  - User-proposed medications awaiting admin validation
  - Columns:
    - `id` (uuid, PK)
    - `proposed_by` (uuid, FK to profiles)
    - `name` (text)
    - `dosage` (text)
    - `form` (text)
    - `status` (enum: pending, approved, rejected)
    - `admin_notes` (text)
    - `created_at` (timestamptz)
  
  ### 6. `orders`
  - Customer orders with full lifecycle tracking
  - Columns:
    - `id` (uuid, PK)
    - `customer_id` (uuid, FK to profiles)
    - `pharmacy_id` (uuid, FK to pharmacies)
    - `courier_id` (uuid, FK to couriers)
    - `delivery_type` (enum: express, standard)
    - `status` (enum: pending, accepted, preparing, ready, in_transit, delivered, cancelled)
    - `delivery_address` (text)
    - `delivery_latitude` (decimal)
    - `delivery_longitude` (decimal)
    - `delivery_details` (text)
    - `customer_phone` (text)
    - `medicine_price` (decimal)
    - `delivery_fee` (decimal)
    - `total_amount` (decimal)
    - `created_at` (timestamptz)
    - `accepted_at` (timestamptz)
    - `ready_at` (timestamptz)
    - `delivered_at` (timestamptz)
  
  ### 7. `order_items`
  - Individual medicines in each order
  - Columns:
    - `id` (uuid, PK)
    - `order_id` (uuid, FK to orders)
    - `medicine_id` (uuid, FK to medicines)
    - `quantity` (integer)
    - `unit_price` (decimal) - set by pharmacy
    - `subtotal` (decimal)
  
  ### 8. `payments`
  - Payment transactions
  - Columns:
    - `id` (uuid, PK)
    - `order_id` (uuid, FK to orders)
    - `user_id` (uuid, FK to profiles)
    - `amount` (decimal)
    - `method` (enum: wallet, wave, orange_money)
    - `status` (enum: pending, completed, failed, refunded)
    - `transaction_id` (text)
    - `created_at` (timestamptz)
  
  ### 9. `deliveries`
  - Real-time delivery tracking
  - Columns:
    - `id` (uuid, PK)
    - `order_id` (uuid, FK to orders)
    - `courier_id` (uuid, FK to couriers)
    - `status` (enum: assigned, en_route_to_pharmacy, picked_up, en_route_to_customer, delivered)
    - `courier_latitude` (decimal)
    - `courier_longitude` (decimal)
    - `estimated_arrival` (timestamptz)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  ### 10. `ratings`
  - Customer ratings for orders
  - Columns:
    - `id` (uuid, PK)
    - `order_id` (uuid, FK to orders)
    - `customer_id` (uuid, FK to profiles)
    - `pharmacy_rating` (integer)
    - `courier_rating` (integer)
    - `comment` (text)
    - `created_at` (timestamptz)
  
  ## Security
  - RLS enabled on all tables
  - Policies created for role-based access
  - Users can only access data relevant to their role
  
  ## Indexes
  - Location-based indexes for proximity searches
  - Status indexes for efficient filtering
  - Foreign key indexes for JOIN optimization
*/

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('customer', 'pharmacy', 'courier', 'admin');
CREATE TYPE delivery_type AS ENUM ('express', 'standard');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'preparing', 'ready', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE payment_method AS ENUM ('wallet', 'wave', 'orange_money');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE medicine_proposal_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE delivery_status AS ENUM ('assigned', 'en_route_to_pharmacy', 'picked_up', 'en_route_to_customer', 'delivered');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  full_name text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  phone text NOT NULL,
  is_active boolean DEFAULT true,
  certification_number text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Couriers table
CREATE TABLE IF NOT EXISTS couriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  current_latitude decimal(10, 8),
  current_longitude decimal(11, 8),
  is_available boolean DEFAULT true,
  vehicle_type text DEFAULT 'motorcycle',
  rating decimal(3, 2) DEFAULT 5.00,
  total_deliveries integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  dosage text,
  form text,
  description text,
  search_terms text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Pending medicines table
CREATE TABLE IF NOT EXISTS pending_medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  dosage text,
  form text,
  status medicine_proposal_status DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  pharmacy_id uuid REFERENCES pharmacies(id) ON DELETE SET NULL,
  courier_id uuid REFERENCES couriers(id) ON DELETE SET NULL,
  delivery_type delivery_type NOT NULL,
  status order_status DEFAULT 'pending',
  delivery_address text NOT NULL,
  delivery_latitude decimal(10, 8) NOT NULL,
  delivery_longitude decimal(11, 8) NOT NULL,
  delivery_details text,
  customer_phone text NOT NULL,
  medicine_price decimal(10, 2) DEFAULT 0,
  delivery_fee decimal(10, 2) NOT NULL,
  total_amount decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  ready_at timestamptz,
  delivered_at timestamptz
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  medicine_id uuid REFERENCES medicines(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10, 2) DEFAULT 0,
  subtotal decimal(10, 2) DEFAULT 0
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL,
  method payment_method NOT NULL,
  status payment_status DEFAULT 'pending',
  transaction_id text,
  created_at timestamptz DEFAULT now()
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  courier_id uuid REFERENCES couriers(id) ON DELETE SET NULL,
  status delivery_status DEFAULT 'assigned',
  courier_latitude decimal(10, 8),
  courier_longitude decimal(11, 8),
  estimated_arrival timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  pharmacy_rating integer CHECK (pharmacy_rating >= 1 AND pharmacy_rating <= 5),
  courier_rating integer CHECK (courier_rating >= 1 AND courier_rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_pharmacies_location ON pharmacies(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_pharmacies_active ON pharmacies(is_active);
CREATE INDEX IF NOT EXISTS idx_couriers_available ON couriers(is_available);
CREATE INDEX IF NOT EXISTS idx_couriers_location ON couriers(current_latitude, current_longitude);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_active ON medicines(is_active);
CREATE INDEX IF NOT EXISTS idx_pending_medicines_status ON pending_medicines(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_pharmacy ON orders(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_orders_courier ON orders(courier_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries(order_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can create profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for pharmacies
CREATE POLICY "Anyone can view active pharmacies"
  ON pharmacies FOR SELECT
  TO authenticated
  USING (is_active = true OR user_id = auth.uid());

CREATE POLICY "Pharmacy users can update own pharmacy"
  ON pharmacies FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can insert pharmacies"
  ON pharmacies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for couriers
CREATE POLICY "Authenticated users can view active couriers"
  ON couriers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Couriers can update own profile"
  ON couriers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can insert couriers"
  ON couriers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for medicines
CREATE POLICY "Anyone can view active medicines"
  ON medicines FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage medicines"
  ON medicines FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for pending_medicines
CREATE POLICY "Users can view own proposals"
  ON pending_medicines FOR SELECT
  TO authenticated
  USING (proposed_by = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

CREATE POLICY "Authenticated users can propose medicines"
  ON pending_medicines FOR INSERT
  TO authenticated
  WITH CHECK (proposed_by = auth.uid());

CREATE POLICY "Admins can update pending medicines"
  ON pending_medicines FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR
    pharmacy_id IN (SELECT id FROM pharmacies WHERE user_id = auth.uid()) OR
    courier_id IN (SELECT id FROM couriers WHERE user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Pharmacies and admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    pharmacy_id IN (SELECT id FROM pharmacies WHERE user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    pharmacy_id IN (SELECT id FROM pharmacies WHERE user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for order_items
CREATE POLICY "Users can view order items for accessible orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.customer_id = auth.uid() OR
        orders.pharmacy_id IN (SELECT id FROM pharmacies WHERE user_id = auth.uid()) OR
        orders.courier_id IN (SELECT id FROM couriers WHERE user_id = auth.uid()) OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Customers can insert order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Pharmacies can update order items"
  ON order_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.pharmacy_id IN (SELECT id FROM pharmacies WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.pharmacy_id IN (SELECT id FROM pharmacies WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for deliveries
CREATE POLICY "Users can view related deliveries"
  ON deliveries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = deliveries.order_id
      AND (
        orders.customer_id = auth.uid() OR
        orders.pharmacy_id IN (SELECT id FROM pharmacies WHERE user_id = auth.uid()) OR
        orders.courier_id IN (SELECT id FROM couriers WHERE user_id = auth.uid()) OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      )
    )
  );

CREATE POLICY "System can create deliveries"
  ON deliveries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Couriers can update own deliveries"
  ON deliveries FOR UPDATE
  TO authenticated
  USING (
    courier_id IN (SELECT id FROM couriers WHERE user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    courier_id IN (SELECT id FROM couriers WHERE user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for ratings
CREATE POLICY "Users can view ratings"
  ON ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Customers can create ratings for own orders"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = ratings.order_id
      AND orders.customer_id = auth.uid()
      AND orders.status = 'delivered'
    )
  );